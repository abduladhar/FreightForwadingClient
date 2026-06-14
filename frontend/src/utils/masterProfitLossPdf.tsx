import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { MasterShipmentProfitLossReportDto, MasterShipmentProfitLossRowDto, MasterShipmentProfitLossSectionDto } from "@/api/reportApi";

export interface MasterProfitLossPdfOptions {
  fileName: string;
  tenantName: string;
  branchName?: string;
  branchAddress?: string;
  logoUrl?: string;
  report: MasterShipmentProfitLossReportDto;
}

export async function exportMasterProfitLossPdf(options: MasterProfitLossPdfOptions) {
  const blob = await pdf(buildDocument(options)).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildDocument({ fileName: _fileName, tenantName, branchName, branchAddress, logoUrl, report }: MasterProfitLossPdfOptions) {
  const styles = createStyles();
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>LOGO</Text></View>}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.docTitle}>MASTER SHIPMENT PROFIT & LOSS</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{tenantName}</Text>
            {!!branchName && <Text style={styles.branchName}>{branchName}</Text>}
            {!!branchAddress && <Text style={styles.branchAddress}>{branchAddress}</Text>}
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <MetaRow label="Master No" value={report.masterShipmentNumber} />
            <MetaRow label="Master Waybill" value={report.masterWaybillNumber ?? "-"} />
            <MetaRow label="Mode" value={report.modeOfTransport} />
          </View>
          <View style={styles.metaColumn}>
            <MetaRow label="Origin" value={report.origin || "-"} />
            <MetaRow label="Destination" value={report.destination || "-"} />
            <MetaRow label="Route" value={`${report.origin || "-"} -> ${report.destination || "-"}`} />
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryBox label="Total Invoice" value={money(report.invoiceAmount)} />
          <SummaryBox label="Total Bill" value={money(report.billAmount)} />
          <SummaryBox label="Total Profit" value={money(report.profitAmount)} />
        </View>

        {report.sections.map((section) => <Section key={section.sectionName} section={section} />)}
      </Page>
    </Document>
  );
}

function Section({ section }: { section: MasterShipmentProfitLossSectionDto }) {
  const styles = createStyles();
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.sectionName}</Text>
        <Text style={styles.sectionTotals}>Invoice {money(section.invoiceAmount)}   Bill {money(section.billAmount)}   Profit {money(section.profitAmount)}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Cell text="Source" w={15} header />
          <Cell text="Reference No" w={22} header />
          <Cell text="Loaded" w={10} header align="right" />
          <Cell text="Total" w={10} header align="right" />
          <Cell text="Ratio" w={9} header align="right" />
          <Cell text="Invoice" w={12} header align="right" />
          <Cell text="Bill" w={11} header align="right" />
          <Cell text="Profit" w={11} header align="right" />
        </View>
        {section.rows.length === 0 ? (
          <View style={styles.emptyRow}><Text style={styles.emptyText}>No records available.</Text></View>
        ) : section.rows.map((row) => <Row key={`${row.sourceType}-${row.sourceId}`} row={row} />)}
      </View>
    </View>
  );
}

function Row({ row }: { row: MasterShipmentProfitLossRowDto }) {
  const styles = createStyles();
  return (
    <View style={styles.tableRow}>
      <Cell text={labelSource(row.sourceType)} w={15} />
      <Cell text={wrapForPdf(row.sourceNumber, 20)} w={22} />
      <Cell text={qty(row.loadedPieces)} w={10} align="right" />
      <Cell text={qty(row.totalPieces)} w={10} align="right" />
      <Cell text={`${(row.allocationRatio * 100).toFixed(2)}%`} w={9} align="right" />
      <Cell text={money(row.invoiceAmount)} w={12} align="right" />
      <Cell text={money(row.billAmount)} w={11} align="right" />
      <Cell text={money(row.profitAmount)} w={11} align="right" />
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 3 }}>
      <Text style={{ width: 90, fontSize: 9, color: "#475569" }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 9 }}>{value || "-"}</Text>
    </View>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: "#bfdbfe", padding: 7, backgroundColor: "#eff6ff" }}>
      <Text style={{ fontSize: 8, color: "#475569", marginBottom: 3 }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: "bold" }}>{value}</Text>
    </View>
  );
}

function Cell({ text, w, header, align = "left" }: { text: string; w: number; header?: boolean; align?: "left" | "right" | "center" }) {
  return (
    <View style={{ width: `${w}%`, paddingHorizontal: 4, paddingVertical: 4, borderRightWidth: 1, borderRightColor: "#dbeafe" }}>
      <Text style={{ fontSize: header ? 7.5 : 7.2, lineHeight: 1.15, textAlign: align, fontWeight: header ? "bold" : "normal" }}>{text}</Text>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    page: { padding: 20, fontSize: 10, color: "#0f172a" },
    header: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 10, marginBottom: 10 },
    logo: { width: 92, height: 92, objectFit: "contain" },
    logoPlaceholder: { width: 92, height: 92, borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
    logoPlaceholderText: { fontSize: 8, color: "#94a3b8" },
    headerLeft: { width: 135, alignItems: "flex-start", justifyContent: "center" },
    headerCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
    headerRight: { width: 170, alignItems: "flex-end", justifyContent: "center" },
    companyName: { fontSize: 14, fontWeight: "bold" },
    branchName: { fontSize: 9, marginTop: 2, color: "#334155" },
    branchAddress: { fontSize: 8, marginTop: 2, color: "#475569", textAlign: "right" },
    docTitle: { fontSize: 15, fontWeight: "bold", textAlign: "center" },
    metaGrid: { flexDirection: "row", gap: 10, marginBottom: 8 },
    metaColumn: { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", padding: 6 },
    summaryGrid: { flexDirection: "row", gap: 8, marginBottom: 10 },
    section: { marginTop: 8 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    sectionTitle: { fontSize: 10, fontWeight: "bold" },
    sectionTotals: { fontSize: 8, color: "#334155" },
    table: { borderWidth: 1, borderColor: "#bfdbfe", marginBottom: 4 },
    tableHeader: { flexDirection: "row", backgroundColor: "#dbeafe", borderBottomWidth: 1, borderBottomColor: "#bfdbfe" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eff6ff" },
    emptyRow: { padding: 8 },
    emptyText: { fontSize: 8, color: "#64748b", textAlign: "center" }
  });
}

function labelSource(sourceType: string) {
  if (sourceType === "MasterShipment") return "Master";
  if (sourceType === "HouseShipment") return "House";
  if (sourceType === "GoodsReceipt") return "GRN";
  return sourceType;
}

function money(value: number) {
  return Number(value || 0).toFixed(2);
}

function qty(value: number) {
  return Number(value || 0).toFixed(2);
}

function wrapForPdf(value: string, chunkSize: number) {
  if (!value || value.length <= chunkSize) return value || "-";
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.slice(i, i + chunkSize));
  }
  return chunks.join("\n");
}
