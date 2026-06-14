import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { MasterShipmentDto } from "@/api/masterShipmentApi";

export interface MasterManifestPdfOptions {
  fileName: string;
  tenantName: string;
  branchName?: string;
  branchAddress?: string;
  logoUrl?: string;
  masterShipment: MasterShipmentDto;
}

export async function exportMasterManifestPdf(options: MasterManifestPdfOptions) {
  const blob = await pdf(buildMasterManifestDocument(options)).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildMasterManifestDocument({ tenantName, branchName, branchAddress, logoUrl, masterShipment }: MasterManifestPdfOptions) {
  const styles = createStyles();
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>LOGO</Text></View>}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.docTitle}>MASTER SHIPMENT MANIFEST</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{tenantName}</Text>
            {!!branchName && <Text style={styles.branchName}>{branchName}</Text>}
            {!!branchAddress && <Text style={styles.branchAddress}>{branchAddress}</Text>}
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <MetaRow label="MAWB" value={masterShipment.mawbNumber ?? "-"} />
            <MetaRow label="MBL" value={masterShipment.mblNumber ?? "-"} />
            <MetaRow label="Status" value={masterShipment.status} />
          </View>
          <View style={styles.metaColumn}>
            <MetaRow label="Mode" value={masterShipment.modeOfTransport} />
            <MetaRow label="Carrier" value={masterShipment.carrierName ?? "-"} />
            <MetaRow label="Origin Port" value={masterShipment.originPortName || "-"} />
            <MetaRow label="Destination Port" value={masterShipment.destinationPortName || "-"} />
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <MetaRow label="ETD" value={masterShipment.etd ?? "-"} />
            <MetaRow label="ETA" value={masterShipment.eta ?? "-"} />
            <MetaRow label="Actual Departure" value={masterShipment.actualDeparture ?? "-"} />
            <MetaRow label="Actual Arrival" value={masterShipment.actualArrival ?? "-"} />
          </View>
          <View style={styles.metaColumn}>
            <MetaRow label="Total Pieces" value={masterShipment.totalPieces.toFixed(2)} />
            <MetaRow label="Total Weight" value={masterShipment.totalWeight.toFixed(2)} />
            <MetaRow label="Total Volume" value={masterShipment.totalVolume.toFixed(4)} />
            <MetaRow label="Total Chargeable" value={masterShipment.totalChargeableWeight.toFixed(4)} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Manifest Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Cell text="HAWB" w={14} header />
            <Cell text="Shipper" w={12} header />
            <Cell text="Consignee" w={12} header />
            <Cell text="Description" w={18} header />
            <Cell text="Package Type" w={12} header />
            <Cell text="Pieces" w={10} header />
            <Cell text="Weight" w={10} header />
            <Cell text="Volume" w={12} header />
          </View>
          {masterShipment.items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Cell text={wrapForPdf(item.hawbNumber || item.houseShipmentNumber || "-", 14)} w={14} />
              <Cell text={`${item.shipperName || "-"}${item.shipperAddress ? `\n${item.shipperAddress}` : ""}`} w={12} />
              <Cell text={`${item.consigneeName || "-"}${item.consigneeAddress ? `\n${item.consigneeAddress}` : ""}`} w={12} />
              <Cell text={item.houseShipmentItemDescription || "-"} w={18} />
              <Cell text={item.packageTypeName || "-"} w={12} />
              <Cell text={item.consolidatedPieces.toFixed(2)} w={10} align="right" />
              <Cell text={item.consolidatedWeight.toFixed(2)} w={10} align="right" />
              <Cell text={item.consolidatedVolume.toFixed(4)} w={12} align="right" />
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 3 }}>
      <Text style={{ width: 110, fontSize: 9, color: "#475569" }}>{label}</Text>
      <Text style={{ fontSize: 9 }}>{value || "-"}</Text>
    </View>
  );
}

function Cell({ text, w, header, align = "left" }: { text: string; w: number; header?: boolean; align?: "left" | "right" | "center" }) {
  return (
    <View style={{ width: `${w}%`, paddingHorizontal: 4, paddingVertical: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0" }}>
      <Text style={{ fontSize: 8, lineHeight: 1.2, textAlign: align, fontWeight: header ? "bold" : "normal" }}>{text}</Text>
    </View>
  );
}

function wrapForPdf(value: string, chunkSize: number) {
  if (!value || value.length <= chunkSize) return value;
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.slice(i, i + chunkSize));
  }
  return chunks.join("\n");
}

function createStyles() {
  return StyleSheet.create({
    page: { padding: 20, fontSize: 10, color: "#0f172a" },
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
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }
  });
}
