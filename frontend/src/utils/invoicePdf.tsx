import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { InvoiceDto } from "@/api/invoiceApi";
import type { CustomerDto } from "@/api/customerApi";
import type { HouseShipmentDto } from "@/api/houseShipmentApi";
import type { DirectShipmentDto } from "@/api/directShipmentApi";
import type { MasterShipmentDto } from "@/api/masterShipmentApi";
import type { PickupDto } from "@/api/pickupApi";

export type InvoicePrintMode = "proforma" | "original";
type SourceItemTotals = {
  pieces?: number;
  weight?: number;
  volume?: number;
  volumeCbm?: number;
  receivedPieces?: number;
  receivedWeight?: number;
  loadedPieces?: number;
  loadedWeight?: number;
  loadedVolume?: number;
};
type SourceTotals = { pieces: number; weight: number; volume: number };

export interface InvoicePdfOptions {
  fileName: string;
  tenantName: string;
  branchName?: string;
  branchAddress?: string;
  logoUrl?: string;
  customer?: CustomerDto | null;
  houseShipment?: HouseShipmentDto | null;
  directShipment?: DirectShipmentDto | null;
  masterShipment?: MasterShipmentDto | null;
  pickup?: PickupDto | null;
  invoice: InvoiceDto;
  currencyCode: string;
  baseCurrencyCode: string;
  mode: InvoicePrintMode;
}

export async function exportInvoicePdf(options: InvoicePdfOptions) {
  const blob = await pdf(buildInvoiceDocument(options)).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildInvoiceDocument({ tenantName, branchName, branchAddress, logoUrl, customer, houseShipment, directShipment, masterShipment, pickup, invoice, currencyCode, baseCurrencyCode, mode }: InvoicePdfOptions) {
  const styles = createStyles();
  const watermark = mode === "proforma" ? "PERFORMA" : "ORIGINAL";
  const title = mode === "proforma" ? "PERFORMA INVOICE" : "TAX INVOICE";
  const sourceRows = getSourceRows({ invoice, houseShipment, directShipment, masterShipment, pickup });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>{watermark}</Text>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>LOGO</Text></View>}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.docTitle}>{title}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{tenantName}</Text>
            {!!branchName && <Text style={styles.branchName}>{branchName}</Text>}
            {!!branchAddress && <Text style={styles.branchAddress}>{branchAddress}</Text>}
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.boxTitle}>Bill To</Text>
            <Text style={styles.strong}>{customer?.customerName ?? (invoice.billToPartyName || invoice.customerId)}</Text>
            <Text>Type: {invoice.billToPartyType || "Customer"}</Text>
            {!!customer?.customerCode && <Text>Code: {customer.customerCode}</Text>}
            {!!customer?.billingAddress && <Text>{customer.billingAddress}</Text>}
            {!!customer?.city && <Text>{customer.city}{customer.country ? `, ${customer.country}` : ""}</Text>}
            {!!customer?.taxNumber && <Text>Tax No: {customer.taxNumber}</Text>}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.boxTitle}>Invoice Details</Text>
            <MetaRow label="Invoice No" value={invoice.invoiceNumber} />
            <MetaRow label="Invoice Date" value={invoice.invoiceDate} />
            <MetaRow label="Due Date" value={invoice.dueDate} />
            <MetaRow label="Currency" value={currencyCode} />
            <MetaRow label="Base Currency" value={baseCurrencyCode} />
            <MetaRow label="Source Type" value={formatSourceType(invoice.sourceType)} />
            <MetaRow label="Reference No" value={invoice.sourceReferenceNo || "-"} />
            <MetaRow label="Status" value={invoice.status} />
          </View>
        </View>

        {sourceRows ? (
          <View style={styles.sourceBox}>
            <Text style={styles.boxTitle}>{sourceRows.title}</Text>
            <View style={styles.sourceGrid}>
              {sourceRows.rows.map((row) => <SourceMetaRow key={row.label} label={row.label} value={row.value} />)}
            </View>
          </View>
        ) : null}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Cell text="Sl No" w={7} header align="center" />
            <Cell text="Charge Head" w={27} header />
            <Cell text="Description" w={24} header />
            <Cell text="Qty" w={9} header align="right" />
            <Cell text={`Rate (${currencyCode})`} w={12} header align="right" />
            <Cell text={`Tax (${currencyCode})`} w={9} header align="right" />
            <Cell text={`Amount (${currencyCode})`} w={12} header align="right" />
          </View>
          {invoice.items.map((item, index) => (
            <View style={styles.tableRow} key={item.id}>
              <Cell text={`${index + 1}`} w={7} align="center" />
              <Cell text={item.chargeHead || item.chargeName} w={27} />
              <Cell text={`${item.chargeCode} - ${item.chargeName}`} w={24} />
              <Cell text={money(item.quantity)} w={9} align="right" />
              <Cell text={money(item.unitRate)} w={12} align="right" />
              <Cell text={money(item.taxAmount)} w={9} align="right" />
              <Cell text={money(item.lineAmount)} w={12} align="right" />
            </View>
          ))}
        </View>

        <View style={styles.bottomGrid}>
          <View style={styles.remarksBox}>
            <Text style={styles.boxTitle}>Remarks</Text>
            <Text>{invoice.remarks || "-"}</Text>
            <Text style={styles.smallNote}>This is a computer generated invoice.</Text>
          </View>
          <View style={styles.totalCard}>
            <TotalRow label={`Sub Total (${currencyCode})`} value={money(invoice.subTotalAmount)} />
            <TotalRow label={`Discount (${currencyCode})`} value={money(invoice.discountAmount)} />
            <TotalRow label={`Tax (${currencyCode})`} value={money(invoice.taxAmount)} />
            <TotalRow label={`Round Off (${currencyCode})`} value={money(invoice.roundOffAmount)} />
            <TotalRow label={`Grand Total (${currencyCode})`} value={money(invoice.totalAmount)} bold />
            <TotalRow label={`Base Amount (${baseCurrencyCode})`} value={money(invoice.baseCurrencyAmount)} />
            <TotalRow label={`Paid (${currencyCode})`} value={money(invoice.paidAmount)} />
            <TotalRow label={`Outstanding (${currencyCode})`} value={money(invoice.outstandingAmount)} bold />
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text>Prepared By</Text>
            <View style={styles.signatureLine} />
          </View>
          <View>
            <Text>Authorized Signatory</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesInline.metaRow}>
      <Text style={stylesInline.metaLabel}>{label}</Text>
      <Text style={stylesInline.metaValue}>{value || "-"}</Text>
    </View>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={stylesInline.totalRow}>
      <Text style={{ fontSize: 9, fontWeight: bold ? "bold" : "normal" }}>{label}</Text>
      <Text style={{ fontSize: 9, fontWeight: bold ? "bold" : "normal" }}>{value}</Text>
    </View>
  );
}

function SourceMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesInline.sourceMetaRow}>
      <Text style={stylesInline.sourceMetaLabel}>{label}</Text>
      <Text style={stylesInline.sourceMetaValue}>{value || "-"}</Text>
    </View>
  );
}

function Cell({ text, w, header, align = "left" }: { text: string; w: number; header?: boolean; align?: "left" | "right" | "center" }) {
  return (
    <View style={{ width: `${w}%`, paddingHorizontal: 4, paddingVertical: 5, borderRightWidth: 1, borderRightColor: "#d6e4f0" }}>
      <Text style={{ fontSize: 8.2, textAlign: align, fontWeight: header ? "bold" : "normal" }}>{text || "-"}</Text>
    </View>
  );
}

function money(value: number) {
  return Number(value || 0).toFixed(2);
}

function getSourceRows({
  invoice,
  houseShipment,
  directShipment,
  masterShipment,
  pickup
}: Pick<InvoicePdfOptions, "invoice" | "houseShipment" | "directShipment" | "masterShipment" | "pickup">) {
  if (invoice.sourceType === "HouseShipment" && houseShipment) {
    const totals = getTotals(houseShipment.items, "house");
    return {
      title: "House Shipment Information",
      rows: [
        { label: "House No", value: houseShipment.houseShipmentNumber },
        { label: "HAWB", value: houseShipment.hawbNumber ?? "-" },
        { label: "Origin Port", value: formatPort(houseShipment.originPortCode, houseShipment.originPortName, houseShipment.originPortCountryName, houseShipment.origin) },
        { label: "Destination Port", value: formatPort(houseShipment.destinationPortCode, houseShipment.destinationPortName, houseShipment.destinationPortCountryName, houseShipment.destination) },
        { label: "Total Pieces", value: money(totals.pieces) },
        { label: "Total Weight", value: `${money(totals.weight)} KG` },
        { label: "Total Volume", value: `${totals.volume.toFixed(4)} CBM` },
        { label: "Drop Location", value: houseShipment.dropLocation || "-" }
      ]
    };
  }

  if (invoice.sourceType === "DirectShipment" && directShipment) {
    const totals = getTotals(directShipment.items, "direct");
    return {
      title: "Direct Shipment Information",
      rows: [
        { label: "Direct No", value: directShipment.directShipmentNumber },
        { label: "Master Waybill", value: directShipment.mawbNumber ?? "-" },
        { label: "Mode", value: directShipment.modeOfTransport || "-" },
        { label: "Carrier", value: directShipment.carrierName || "-" },
        { label: "Origin Port", value: formatPort(directShipment.originPortCode, directShipment.originPortName, directShipment.originPortCountryName, directShipment.origin) },
        { label: "Destination Port", value: formatPort(directShipment.destinationPortCode, directShipment.destinationPortName, directShipment.destinationPortCountryName, directShipment.destination) },
        { label: "Total Pieces", value: money(totals.pieces) },
        { label: "Total Weight", value: `${money(totals.weight)} KG` },
        { label: "Total Volume", value: `${totals.volume.toFixed(4)} CBM` },
        { label: "Transport Ref", value: directShipment.flightNumber || directShipment.vesselName || directShipment.truckNumber || directShipment.containerNumber || "-" }
      ]
    };
  }

  if (invoice.sourceType === "MasterShipment" && masterShipment) {
    return {
      title: "Master Shipment Information",
      rows: [
        { label: "Master No", value: masterShipment.masterShipmentNumber },
        { label: "MAWB/MBL", value: masterShipment.mawbNumber || masterShipment.mblNumber || "-" },
        { label: "Mode", value: masterShipment.modeOfTransport || "-" },
        { label: "Carrier", value: masterShipment.carrierName || "-" },
        { label: "Origin Port", value: formatPort(masterShipment.originPortCode, masterShipment.originPortName, masterShipment.originPortCountryName) },
        { label: "Destination Port", value: formatPort(masterShipment.destinationPortCode, masterShipment.destinationPortName, masterShipment.destinationPortCountryName) },
        { label: "Total Pieces", value: money(masterShipment.totalPieces) },
        { label: "Total Weight", value: `${money(masterShipment.totalWeight)} KG` },
        { label: "Total Volume", value: `${Number(masterShipment.totalVolume || 0).toFixed(4)} CBM` },
        { label: "Transport Ref", value: masterShipment.flightNumber || masterShipment.vesselName || masterShipment.voyageNumber || masterShipment.truckNumber || "-" }
      ]
    };
  }

  if (invoice.sourceType === "Pickup" && pickup) {
    const totals = getTotals(pickup.items, "pickup");
    return {
      title: "Pickup Information",
      rows: [
        { label: "Pickup No", value: pickup.pickupNumber },
        { label: "Pickup Date", value: pickup.pickupDateTime || "-" },
        { label: "Pickup Location", value: pickup.customerLocation || "-" },
        { label: "Drop Location", value: pickup.dropLocation || "-" },
        { label: "Contact", value: [pickup.contactPerson, pickup.contactPhone].filter(Boolean).join(" / ") || "-" },
        { label: "Driver/Vehicle", value: [pickup.driverName, pickup.vehicleNumber].filter(Boolean).join(" / ") || "-" },
        { label: "Total Pieces", value: money(totals.pieces) },
        { label: "Total Weight", value: `${money(totals.weight)} KG` },
        { label: "Total Volume", value: `${totals.volume.toFixed(4)} CBM` },
        { label: "Consignee", value: pickup.consigneeName || "-" }
      ]
    };
  }

  return null;
}

function getTotals(items: SourceItemTotals[], source: "house" | "direct" | "pickup"): SourceTotals {
  return items.reduce<SourceTotals>(
    (sum, item) => ({
      pieces: sum.pieces + Number((source === "pickup" ? item.pieces : source === "direct" ? item.pieces : item.loadedPieces) || item.receivedPieces || 0),
      weight: sum.weight + Number((source === "pickup" ? item.weight : source === "direct" ? item.weight : item.loadedWeight) || item.receivedWeight || 0),
      volume: sum.volume + Number((source === "pickup" ? item.volumeCbm : source === "direct" ? item.volume : item.loadedVolume) || item.volumeCbm || 0)
    }),
    { pieces: 0, weight: 0, volume: 0 }
  );
}

function formatPort(code?: string | null, name?: string | null, country?: string | null, fallback?: string | null) {
  const main = [code, name].filter(Boolean).join(" - ");
  return [main || fallback, country].filter(Boolean).join(" - ") || "-";
}

function formatSourceType(value?: string | null) {
  if (!value) return "-";
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

const stylesInline = {
  metaRow: { flexDirection: "row" as const, marginBottom: 4 },
  metaLabel: { width: 78, color: "#475569", fontSize: 9 },
  metaValue: { flex: 1, fontSize: 9 },
  sourceMetaRow: { width: "50%" as const, flexDirection: "row" as const, marginBottom: 4, paddingRight: 8 },
  sourceMetaLabel: { width: 78, color: "#475569", fontSize: 8.5 },
  sourceMetaValue: { flex: 1, fontSize: 8.5 },
  totalRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 4 }
};

function createStyles() {
  return StyleSheet.create({
    page: { padding: 20, fontSize: 9.5, color: "#0f172a", position: "relative" },
    watermark: { position: "absolute", top: 335, left: 88, fontSize: 68, color: "#d1d5db", opacity: 0.22, transform: "rotate(-35deg)", fontWeight: "bold" },
    header: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#94a3b8", paddingBottom: 10, marginBottom: 10 },
    headerLeft: { width: 150, alignItems: "flex-start", justifyContent: "center" },
    headerCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
    headerRight: { width: 185, alignItems: "flex-end", justifyContent: "center" },
    logo: { width: 96, height: 96, objectFit: "contain" },
    logoPlaceholder: { width: 96, height: 96, borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
    logoPlaceholderText: { fontSize: 8, color: "#94a3b8" },
    docTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
    companyName: { fontSize: 14, fontWeight: "bold", textAlign: "right" },
    branchName: { fontSize: 9, marginTop: 2, color: "#334155", textAlign: "right" },
    branchAddress: { fontSize: 8, marginTop: 2, color: "#475569", textAlign: "right" },
    infoGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
    infoBox: { flex: 1, minHeight: 88, borderWidth: 1, borderColor: "#93c5fd", padding: 7 },
    sourceBox: { borderWidth: 1, borderColor: "#93c5fd", padding: 7, marginBottom: 10 },
    sourceGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 3 },
    boxTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 5, color: "#1d4ed8" },
    strong: { fontSize: 10, fontWeight: "bold", marginBottom: 3 },
    table: { borderWidth: 1, borderColor: "#93c5fd", marginBottom: 10 },
    tableHeader: { flexDirection: "row", backgroundColor: "#e0f2fe", borderBottomWidth: 1, borderBottomColor: "#93c5fd" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#dbeafe", minHeight: 23 },
    bottomGrid: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
    remarksBox: { flex: 1, minHeight: 88, borderWidth: 1, borderColor: "#dbeafe", padding: 8 },
    smallNote: { marginTop: 18, color: "#64748b", fontSize: 8 },
    totalCard: { width: 210, borderWidth: 1, borderColor: "#93c5fd", padding: 8 },
    footer: { marginTop: 32, flexDirection: "row", justifyContent: "space-between", fontSize: 9, color: "#334155" },
    signatureLine: { marginTop: 28, width: 170, borderTopWidth: 1, borderTopColor: "#64748b" }
  });
}
