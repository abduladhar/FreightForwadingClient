import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { PickupDto } from "@/api/pickupApi";
import { lt } from "@/modules/operationsLocalization";
import { ensurePdfFontsRegistered, getPdfFontFamily } from "@/utils/pdfFonts";

interface PickupPdfOptions {
  fileName?: string;
  tenantName?: string;
  branchName?: string;
  branchAddress?: string;
  logoUrl?: string;
  customerName?: string;
  pickup: PickupDto;
  translate?: (value: string) => string;
  cultureCode?: string;
}

export async function exportPickupPdf(options: PickupPdfOptions) {
  ensurePdfFontsRegistered();
  const doc = buildPickupDocument(options);
  const blob = await pdf(doc).toBlob();
  saveAs(blob, options.fileName || `${options.pickup.pickupNumber}.pdf`);
}

function buildPickupDocument({ tenantName, branchName, branchAddress, logoUrl, customerName, pickup, translate = lt, cultureCode = "en-US" }: PickupPdfOptions) {
  const t = translate;
  const styles = StyleSheet.create({
    page: { padding: 24, fontSize: 10, fontFamily: getPdfFontFamily(), color: "#0f172a" },
    header: { borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 10, marginBottom: 12 },
    headerGrid: { flexDirection: "row", alignItems: "center" },
    left: { width: 160, alignItems: "flex-start" },
    center: { flexGrow: 1, alignItems: "center" },
    right: { width: 180, alignItems: "flex-end" },
    logo: { width: 100, height: 100, objectFit: "contain" },
    logoPlaceholder: { width: 100, height: 100, borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
    title: { fontSize: 20, fontWeight: 700, letterSpacing: 0.5 },
    branchName: { fontSize: 9, marginTop: 2, color: "#334155", fontWeight: 600 },
    branchAddress: { fontSize: 8.5, marginTop: 2, color: "#475569", textAlign: "right" },
    row: { flexDirection: "row", gap: 12, marginBottom: 10 },
    card: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 8, flex: 1 },
    line: { marginBottom: 4 },
    lineLabel: { fontWeight: 600 },
    table: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, overflow: "hidden" },
    tableHead: { backgroundColor: "#f1f5f9", flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cbd5e1" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
    cell: { paddingVertical: 6, paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: "#e2e8f0", fontSize: 9 },
    rightText: { textAlign: "right" }
  });

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString(cultureCode);
  };

  const Cell = ({ text, w, right = false }: { text: string; w: number; right?: boolean }) => {
    const cellStyle = right
      ? [styles.cell, { width: `${w}%` }, styles.rightText]
      : [styles.cell, { width: `${w}%` }];
    return <Text style={cellStyle}>{text}</Text>;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerGrid}>
            <View style={styles.left}>
              {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Text>{t("LOGO")}</Text></View>}
            </View>
            <View style={styles.center}>
              <Text style={styles.title}>{t("PICKUP RECEIPT")}</Text>
            </View>
            <View style={styles.right}>
              {!!branchName && <Text style={styles.branchName}>{branchName}</Text>}
              {!!branchAddress && <Text style={styles.branchAddress}>{branchAddress}</Text>}
              {!!tenantName && <Text style={styles.branchAddress}>{tenantName}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Pickup No")}:</Text> {pickup.pickupNumber}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Date/Time")}:</Text> {formatDateTime(pickup.pickupDateTime)}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Contact")}:</Text> {pickup.contactPerson}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Phone")}:</Text> {pickup.contactPhone}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Drop Location")}:</Text> {pickup.dropLocation || "-"}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Driver")}:</Text> {pickup.driverName || "-"}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Vehicle")}:</Text> {pickup.vehicleNumber || "-"}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Status")}:</Text> {t(pickup.status)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Customer")}:</Text> {customerName || pickup.customerId}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Location")}:</Text> {pickup.customerLocation}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Consignee Name")}:</Text> {pickup.consigneeName || "-"}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Consignee Contact No")}:</Text> {pickup.consigneeContactNo || "-"}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Consignee Contact Address")}:</Text> {pickup.consigneeAddress || "-"}</Text>
            <Text style={styles.line}><Text style={styles.lineLabel}>{t("Charges")}:</Text> {pickup.pickupCharges.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Cell text={t("Package Type")} w={22} />
            <Cell text={t("Description")} w={22} />
            <Cell text={t("Packages")} w={10} right />
            <Cell text={t("Gross Weight")} w={10} right />
            <Cell text={t("Length")} w={7} right />
            <Cell text={t("Width")} w={7} right />
            <Cell text={t("Height")} w={7} right />
            <Cell text={t("Volume")} w={8} right />
            <Cell text={t("Chargeable Weight")} w={7} right />
          </View>
          {pickup.items.map((item) => {
            const chargeable = Math.max(item.weight || 0, (item.volumeCbm || 0) * 167);
            return (
              <View key={item.id} style={styles.tableRow}>
                <Cell text={item.packageTypeCode ? `${item.packageTypeCode} - ${item.packageTypeName}` : item.packageTypeName} w={22} />
                <Cell text={item.description} w={22} />
                <Cell text={item.pieces.toFixed(2)} w={10} right />
                <Cell text={item.weight.toFixed(2)} w={10} right />
                <Cell text={item.length.toFixed(2)} w={7} right />
                <Cell text={item.width.toFixed(2)} w={7} right />
                <Cell text={item.height.toFixed(2)} w={7} right />
                <Cell text={item.volumeCbm.toFixed(4)} w={8} right />
                <Cell text={chargeable.toFixed(4)} w={7} right />
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
