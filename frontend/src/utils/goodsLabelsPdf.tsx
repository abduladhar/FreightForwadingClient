import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { lt } from "@/modules/operationsLocalization";
import type { ResolvedLabelSize } from "@/modules/goodsReceipts/labelSizeConfig";
import { ensurePdfFontsRegistered, getPdfFontFamily } from "@/utils/pdfFonts";

export interface GoodsLabelPdfItem {
  sequenceNo: string;
  barcodeValue: string;
  customerName: string;
  receivedFrom?: string;
  receivedDateTime?: string;
  warehouseLocation?: string;
  shipperName?: string;
  consigneeName?: string;
  originPortName?: string;
  destinationPortName?: string;
  masterWaybillNo?: string;
  length: number;
  width: number;
  height: number;
  fromText?: string;
  destinationText?: string;
  qtyText?: string;
}

export type GoodsLabelTemplateStyle = "classic" | "compact";

export async function exportGoodsLabelsPdf(fileName: string, items: GoodsLabelPdfItem[], label: ResolvedLabelSize, templateStyle: GoodsLabelTemplateStyle = "classic") {
  ensurePdfFontsRegistered();
  const barcodeMap = await Promise.all(items.map(async (x) => ({ key: x.sequenceNo, src: await createBarcodeDataUrl(x.barcodeValue) })));
  const barcodeByKey = new Map(barcodeMap.map((x) => [x.key, x.src]));
  const pageSize = toPdfPageSize(label);
  const styles = createStyles();

  const doc = (
    <Document>
      {items.map((item) => (
        <Page key={item.sequenceNo} size={pageSize} style={styles.page}>
          <View style={styles.label}>
            <View style={styles.barcodeWrap}>
              <Image src={barcodeByKey.get(item.sequenceNo) ?? ""} style={styles.barcodeImage} />
            </View>
            <Text style={styles.barcodeText}>{item.barcodeValue}</Text>
            {templateStyle === "compact" ? (
              <View style={styles.compactTable}>
                <Text style={styles.compactTitle}>{item.customerName}</Text>
                <Text style={styles.compactText}>{lt("From")}: {item.receivedFrom || "-"}</Text>
                <Text style={styles.compactText}>{lt("Date")}: {item.receivedDateTime || "-"}</Text>
                <Text style={styles.compactText}>{lt("Warehouse")}: {item.warehouseLocation || "-"}</Text>
                <Text style={styles.compactText}>{lt("Size")}: {item.length} x {item.width} x {item.height}</Text>
                <View style={styles.compactQtyWrap}>
                  <Text style={styles.compactQtyLabel}>{lt("QTY")}</Text>
                  <Text style={styles.compactQtyValue}>{item.qtyText || ""}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.table}>
                <Row styles={styles} label="Customer Name" value={item.customerName} />
                <Row styles={styles} label="Shipper Name" value={item.shipperName || item.receivedFrom || "-"} />
                <Row styles={styles} label="Consignee Name" value={item.consigneeName || item.warehouseLocation || "-"} />
                <Row styles={styles} label="Origin Port" value={item.originPortName || item.fromText || "-"} />
                <Row styles={styles} label="Destination Port" value={item.destinationPortName || item.destinationText || "-"} />
                <Row styles={styles} label="Master Waybill No" value={item.masterWaybillNo || item.sequenceNo || "-"} />
                <Row styles={styles} label="Dimensions" value={`${item.length} x ${item.width} x ${item.height}`} />
                <Row styles={styles} label="QTY" value={item.qtyText || ""} isLast />
              </View>
            )}
            <Text style={styles.sideText}></Text>
          </View>
        </Page>
      ))}
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  saveAs(blob, fileName);
}

function Row({ styles, label, value, isLast }: { styles: ReturnType<typeof createStyles>; label: string; value: string; isLast?: boolean }) {
  const rowStyle = isLast ? styles.rowLast : styles.row;
  return (
    <View style={rowStyle}>
      <Text style={styles.k}>{lt(label)}</Text>
      <Text style={styles.v}>{value}</Text>
    </View>
  );
}

async function createBarcodeDataUrl(value: string) {
  const canvas = document.createElement("canvas");
  const barcodeFactory = await getJsBarcodeFactory();
  if (!barcodeFactory) {
    throw new Error("Unable to initialize JsBarcode for PDF export.");
  }
  barcodeFactory(canvas, value, {
    format: "CODE128",
    displayValue: false,
    margin: 0,
    height: 44,
    width: 1.2
  });
  return canvas.toDataURL("image/png");
}

type JsBarcodeFactory = (element: HTMLCanvasElement, value: string, options?: Record<string, unknown>) => void;

function resolveJsBarcode(source: unknown): JsBarcodeFactory | null {
  if (typeof source === "function") return source as JsBarcodeFactory;
  if (source && typeof source === "object") {
    const obj = source as Record<string, unknown>;
    if (typeof obj.default === "function") return obj.default as JsBarcodeFactory;
    if (typeof obj.JsBarcode === "function") return obj.JsBarcode as JsBarcodeFactory;
    for (const key of Object.keys(obj)) {
      const candidate = obj[key];
      if (typeof candidate === "function") return candidate as JsBarcodeFactory;
    }
  }
  return null;
}

let jsBarcodeFactoryPromise: Promise<JsBarcodeFactory | null> | null = null;

async function getJsBarcodeFactory(): Promise<JsBarcodeFactory | null> {
  if (!jsBarcodeFactoryPromise) {
    jsBarcodeFactoryPromise = loadJsBarcodeFactory();
  }
  return jsBarcodeFactoryPromise;
}

async function loadJsBarcodeFactory(): Promise<JsBarcodeFactory | null> {
  try {
    const fallback = await import("jsbarcode/dist/JsBarcode.all.min.js");
    const resolvedFallback = resolveJsBarcode(fallback);
    if (resolvedFallback) return resolvedFallback;
  } catch {
    // Try global fallback next.
  }

  if (typeof window !== "undefined") {
    const globalFactory = resolveJsBarcode((window as unknown as { JsBarcode?: unknown }).JsBarcode);
    if (globalFactory) return globalFactory;
  }

  return null;
}

function toPdfPageSize(label: ResolvedLabelSize) {
  const widthInPt = toPoints(label.width, label.unit);
  const heightInPt = toPoints(label.height, label.unit);
  return label.orientation === "landscape"
    ? { width: Math.max(widthInPt, heightInPt), height: Math.min(widthInPt, heightInPt) }
    : { width: Math.min(widthInPt, heightInPt), height: Math.max(widthInPt, heightInPt) };
}

function toPoints(value: number, unit: "mm" | "in" | "px") {
  if (unit === "in") return value * 72;
  if (unit === "mm") return (value / 25.4) * 72;
  return value * 0.75;
}

function createStyles() {
  return StyleSheet.create({
    page: { padding: 8, fontSize: 8.5, fontFamily: getPdfFontFamily(), color: "#111827" },
    label: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", padding: 8, position: "relative" },
    barcodeWrap: { alignItems: "center", marginTop: 2, marginBottom: 4 },
    barcodeImage: { width: 200, height: 44, objectFit: "contain" },
    barcodeText: { textAlign: "center", fontSize: 10, marginBottom: 6 },
    table: { borderWidth: 1, borderColor: "#38bdf8", borderRadius: 3, overflow: "hidden" },
    row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#7dd3fc" },
    rowLast: { flexDirection: "row", borderBottomWidth: 0 },
    k: { width: "44%", paddingVertical: 4, paddingHorizontal: 5, textAlign: "right", fontSize: 8, fontWeight: 600 },
    v: { width: "56%", paddingVertical: 4, paddingHorizontal: 5, fontSize: 8, fontWeight: 700 },
    compactTable: { borderWidth: 1, borderColor: "#38bdf8", borderRadius: 3, padding: 6, gap: 2 },
    compactTitle: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
    compactText: { fontSize: 8 },
    compactQtyWrap: { marginTop: 3, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#7dd3fc", paddingTop: 4 },
    compactQtyLabel: { fontSize: 8, fontWeight: 700 },
    compactQtyValue: { fontSize: 9, fontWeight: 700 },
    sideText: { position: "absolute", right: -18, top: "50%", transform: "rotate(90deg)", fontSize: 7, color: "#475569" }
  });
}
