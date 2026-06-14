import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { HouseShipmentDto } from "@/api/houseShipmentApi";

export interface HouseShipmentPdfOptions {
  fileName: string;
  tenantName: string;
  branchName?: string;
  branchAddress?: string;
  logoUrl?: string;
  customerName?: string;
  houseShipment: HouseShipmentDto;
  reportTitle?: string;
}

export async function exportHouseShipmentPdf(options: HouseShipmentPdfOptions) {
  const blob = await pdf(buildHouseShipmentDocument(options)).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildHouseShipmentDocument({ tenantName, branchName, branchAddress, logoUrl, customerName, houseShipment, reportTitle }: HouseShipmentPdfOptions) {
  const styles = createStyles();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>LOGO</Text></View>}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.docTitle}>{reportTitle || "HOUSE SHIPMENT JOB CARD"}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{tenantName}</Text>
            {!!branchName && <Text style={styles.branchName}>{branchName}</Text>}
            {!!branchAddress && <Text style={styles.branchAddress}>{branchAddress}</Text>}
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <MetaRow label="Shipment No" value={houseShipment.houseShipmentNumber} />
            <MetaRow label="HAWB" value={houseShipment.hawbNumber ?? "-"} />
            <MetaRow label="Customer" value={customerName ?? houseShipment.customerId} />
            <MetaRow label="Status" value={houseShipment.status} />
          </View>
          <View style={styles.metaColumn}>
            <MetaRow label="Origin Port" value={houseShipment.originPortName || houseShipment.origin || "-"} />
            <MetaRow label="Destination Port" value={houseShipment.destinationPortName || houseShipment.destination || "-"} />
            <MetaRow label="ETD" value={houseShipment.etd ?? "-"} />
            <MetaRow label="ETA" value={houseShipment.eta ?? "-"} />
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <Text style={styles.sectionTitle}>Shipper</Text>
            <MetaRow label="Name" value={houseShipment.shipperName || "-"} />
            <MetaRow label="Contact" value={houseShipment.shipperContactNo || "-"} />
            <MetaRow label="Address" value={houseShipment.shipperAddress || "-"} />
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.sectionTitle}>Consignee</Text>
            <MetaRow label="Name" value={houseShipment.consigneeName || "-"} />
            <MetaRow label="Contact" value={houseShipment.consigneeContactNo || "-"} />
            <MetaRow label="Address" value={houseShipment.consigneeAddress || "-"} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Shipment Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Cell text="Package Type" w={22} header />
            <Cell text="Description" w={24} header />
            <Cell text="Packages" w={12} header />
            <Cell text="Gross Wt" w={12} header />
            <Cell text="L" w={8} header />
            <Cell text="W" w={8} header />
            <Cell text="H" w={8} header />
            <Cell text="Vol (CBM)" w={12} header />
          </View>
          {houseShipment.items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Cell text={item.packageTypeName || "-"} w={22} />
              <Cell text={item.description || "-"} w={24} />
              <Cell text={item.loadedPieces.toFixed(2)} w={12} align="right" />
              <Cell text={item.loadedWeight.toFixed(2)} w={12} align="right" />
              <Cell text={item.length.toFixed(2)} w={8} align="right" />
              <Cell text={item.width.toFixed(2)} w={8} align="right" />
              <Cell text={item.height.toFixed(2)} w={8} align="right" />
              <Cell text={item.loadedVolume.toFixed(4)} w={12} align="right" />
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
      <Text style={{ width: 95, fontSize: 9, color: "#475569" }}>{label}</Text>
      <Text style={{ fontSize: 9 }}>{value || "-"}</Text>
    </View>
  );
}

function Cell({ text, w, header, align = "left" }: { text: string; w: number; header?: boolean; align?: "left" | "right" | "center" }) {
  return (
    <View style={{ width: `${w}%`, paddingHorizontal: 4, paddingVertical: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0" }}>
      <Text style={{ fontSize: 8.5, textAlign: align, fontWeight: header ? "bold" : "normal" }}>{text}</Text>
    </View>
  );
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
