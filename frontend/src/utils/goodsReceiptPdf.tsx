import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { GoodsReceiptDto } from "@/api/goodsReceiptApi";
import { lt } from "@/modules/operationsLocalization";
import { ensurePdfFontsRegistered, getPdfFontFamily } from "@/utils/pdfFonts";

export interface GoodsReceiptPdfOptions {
  fileName: string;
  tenantName: string;
  branchName?: string;
  branchAddress?: string;
  logoUrl?: string;
  customerName?: string;
  goodsReceipt: GoodsReceiptDto;
}

export async function exportGoodsReceiptPdf(options: GoodsReceiptPdfOptions) {
  ensurePdfFontsRegistered();
  const blob = await pdf(buildGoodsReceiptDocument(options)).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildGoodsReceiptDocument({ tenantName, branchName, branchAddress, logoUrl, customerName, goodsReceipt }: GoodsReceiptPdfOptions) {
  const styles = createStyles();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>{lt("LOGO")}</Text></View>}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.docTitle}>{lt("GOODS RECEIPT NOTE")}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{tenantName}</Text>
            {!!branchName && <Text style={styles.branchName}>{branchName}</Text>}
            {!!branchAddress && <Text style={styles.branchAddress}>{branchAddress}</Text>}
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <MetaRow label="GRN No" value={goodsReceipt.goodsReceiptNumber} />
            <MetaRow label="Received DateTime" value={goodsReceipt.receivedDateTime} />
            <MetaRow label="Received From" value={goodsReceipt.receivedFrom} />
            <MetaRow label="Status" value={lt(goodsReceipt.status)} />
          </View>
          <View style={styles.metaColumn}>
            <MetaRow label="Customer" value={customerName ?? goodsReceipt.customerId} />
            <MetaRow label="Warehouse Location" value={goodsReceipt.warehouseLocation || "-"} />
            <MetaRow label="Remarks" value={goodsReceipt.remarks || "-"} />
            <MetaRow label="Items Count" value={String(goodsReceipt.items.length)} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{lt("Goods Items")}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Cell text="Package Type" w={30} header />
            <Cell text="Description" w={26} header />
            <Cell text="Packages" w={14} header />
            <Cell text="Gross Wt" w={14} header />
            <Cell text="Volume" w={16} header />
          </View>
          {goodsReceipt.items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Cell text={item.packageTypeCode ? `${item.packageTypeCode} - ${item.packageTypeName}` : item.packageTypeName} w={30} />
              <Cell text={item.description} w={26} />
              <Cell text={item.receivedPieces.toFixed(2)} w={14} align="right" />
              <Cell text={item.receivedWeight.toFixed(2)} w={14} align="right" />
              <Cell text={item.volumeCbm.toFixed(4)} w={16} align="right" />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>{lt("Prepared by")}: ____________________</Text>
          <Text>{lt("Approved by")}: ____________________</Text>
        </View>
      </Page>
    </Document>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 3 }}>
      <Text style={{ width: 110, fontSize: 9, color: "#475569" }}>{lt(label)}</Text>
      <Text style={{ fontSize: 9 }}>{value || "-"}</Text>
    </View>
  );
}

function Cell({ text, w, header, align = "left" }: { text: string; w: number; header?: boolean; align?: "left" | "right" | "center" }) {
  return (
    <View style={{ width: `${w}%`, paddingHorizontal: 4, paddingVertical: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0" }}>
      <Text style={{ fontSize: 8.5, textAlign: align, fontWeight: header ? "bold" : "normal" }}>{header ? lt(text) : text}</Text>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    page: { padding: 20, fontSize: 10, fontFamily: getPdfFontFamily(), color: "#0f172a" },
    header: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 10, marginBottom: 10 },
    logo: { width: 100, height: 100, objectFit: "contain" },
    logoPlaceholder: { width: 100, height: 100, borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
    logoPlaceholderText: { fontSize: 8, color: "#94a3b8" },
    headerLeft: { width: 150, alignItems: "flex-start", justifyContent: "center" },
    headerCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
    headerRight: { width: 180, alignItems: "flex-end", justifyContent: "center" },
    companyName: { fontSize: 15, fontWeight: "bold" },
    branchName: { fontSize: 9, marginTop: 2, color: "#334155" },
    branchAddress: { fontSize: 8.5, marginTop: 2, color: "#475569", textAlign: "right" },
    docTitle: { fontSize: 17, fontWeight: "bold", textAlign: "center" },
    metaGrid: { flexDirection: "row", gap: 12, marginBottom: 8 },
    metaColumn: { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", padding: 6 },
    sectionTitle: { marginTop: 8, marginBottom: 4, fontSize: 10, fontWeight: "bold" },
    table: { borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 8 },
    tableHeader: { flexDirection: "row", backgroundColor: "#f1f5f9", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
    footer: { marginTop: 20, flexDirection: "row", justifyContent: "space-between", fontSize: 9, color: "#334155" }
  });
}
