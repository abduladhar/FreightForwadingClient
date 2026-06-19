import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { InvoiceDto } from "@/api/invoiceApi";
import type { CustomerDto } from "@/api/customerApi";
import type { HouseShipmentDto } from "@/api/houseShipmentApi";
import type { DirectShipmentDto } from "@/api/directShipmentApi";
import type { MasterShipmentDto } from "@/api/masterShipmentApi";
import type { PickupDto } from "@/api/pickupApi";
import { lt } from "@/modules/operationsLocalization";
import type { BranchCurrencyBankDetail } from "@/types/currency";
import { ensurePdfFontsRegistered, getPdfFontFamily } from "@/utils/pdfFonts";

export type InvoicePrintMode = "proforma" | "original";
export type InvoicePdfStyle = "classic" | "compass";
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
  bankDetails?: BranchCurrencyBankDetail[];
  mode: InvoicePrintMode;
  style: InvoicePdfStyle;
}

export async function exportInvoicePdf(options: InvoicePdfOptions) {
  ensurePdfFontsRegistered();
  const blob = await pdf(buildInvoiceDocument(options)).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildInvoiceDocument(options: InvoicePdfOptions) {
  if (options.style === "compass") return buildCompassInvoiceDocument(options);

  const { tenantName, branchName, branchAddress, logoUrl, customer, houseShipment, directShipment, masterShipment, pickup, invoice, currencyCode, baseCurrencyCode, bankDetails = [], mode } = options;
  const styles = createStyles();
  const watermark = mode === "proforma" ? lt("PERFORMA") : lt("ORIGINAL");
  const title = mode === "proforma" ? lt("PERFORMA INVOICE") : lt("TAX INVOICE");
  const sourceRows = getSourceRows({ invoice, houseShipment, directShipment, masterShipment, pickup });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>{watermark}</Text>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>{lt("LOGO")}</Text></View>}
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
            <Text style={styles.boxTitle}>{lt("Bill To")}</Text>
            <Text style={styles.strong}>{customer?.customerName ?? (invoice.billToPartyName || invoice.customerId)}</Text>
            <Text>{lt("Type")}: {lt(invoice.billToPartyType || "Customer")}</Text>
            {!!customer?.customerCode && <Text>{lt("Code")}: {customer.customerCode}</Text>}
            {!!customer?.billingAddress && <Text>{customer.billingAddress}</Text>}
            {!!customer?.city && <Text>{customer.city}{customer.country ? `, ${customer.country}` : ""}</Text>}
            {!!customer?.taxNumber && <Text>{lt("Tax No")}: {customer.taxNumber}</Text>}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.boxTitle}>{lt("Invoice Details")}</Text>
            <MetaRow label="Invoice No" value={invoice.invoiceNumber} />
            <MetaRow label="Invoice Date" value={invoice.invoiceDate} />
            <MetaRow label="Due Date" value={invoice.dueDate} />
            <MetaRow label="Currency" value={currencyCode} />
            <MetaRow label="Base Currency" value={baseCurrencyCode} />
            <MetaRow label="Source Type" value={formatSourceType(invoice.sourceType)} translateValue />
            <MetaRow label="Reference No" value={invoice.sourceReferenceNo || "-"} />
            <MetaRow label="Status" value={invoice.status} />
          </View>
        </View>

        {sourceRows ? (
          <View style={styles.sourceBox}>
            <Text style={styles.boxTitle}>{lt(sourceRows.title)}</Text>
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
            <Text style={styles.boxTitle}>{lt("Remarks")}</Text>
            <Text>{invoice.remarks || "-"}</Text>
            <Text style={styles.smallNote}>{lt("This is a computer generated invoice.")}</Text>
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

        {bankDetails.length ? (
          <View style={styles.bankGrid}>
            {bankDetails.map((detail) => <BankDetails key={detail.currencyId} detail={detail} />)}
          </View>
        ) : null}

        <View style={styles.footer}>
          <View>
            <Text>{lt("Prepared By")}</Text>
            <View style={styles.signatureLine} />
          </View>
          <View>
            <Text>{lt("Authorized Signatory")}</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

function buildCompassInvoiceDocument({
  tenantName,
  branchName,
  branchAddress,
  logoUrl,
  customer,
  houseShipment,
  directShipment,
  masterShipment,
  pickup,
  invoice,
  currencyCode,
  bankDetails = [],
  mode
}: InvoicePdfOptions) {
  const styles = createCompassStyles();
  const title = mode === "proforma" ? lt("PERFORMA INVOICE") : lt("TAX INVOICE");
  const sourceRows = getSourceRows({ invoice, houseShipment, directShipment, masterShipment, pickup });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoArea}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <Text style={styles.companyName}>{tenantName}</Text>}
          </View>
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{tenantName}</Text>
            {!!branchName && <Text>{branchName}</Text>}
            {!!branchAddress && <Text>{branchAddress}</Text>}
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.twoColumn}>
          <View style={styles.customerBox}>
            <View style={styles.blueHeader}>
              <Text style={styles.headerText}>{customer?.customerName ?? invoice.billToPartyName ?? "BILL TO"}</Text>
              <Text style={styles.headerText}>{lt("TRN")}: {customer?.taxNumber || "-"}</Text>
            </View>
            <View style={styles.boxBody}>
              <Text>{customer?.customerName ?? invoice.billToPartyName ?? invoice.customerId}</Text>
              {!!customer?.billingAddress && <Text>{customer.billingAddress}</Text>}
              <Text>{[customer?.city, customer?.country].filter(Boolean).join(", ")}</Text>
            </View>
          </View>
          <View style={styles.invoiceBox}>
            <CompassMetaRow label="Invoice No" value={invoice.invoiceNumber} />
            <CompassMetaRow label="Date" value={invoice.invoiceDate} />
            <CompassMetaRow label="Currency" value={currencyCode} />
            <CompassMetaRow label="Our reference" value={invoice.sourceReferenceNo || "-"} />
            <CompassMetaRow label="Due Date" value={invoice.dueDate} last />
          </View>
        </View>

        {sourceRows ? (
          <View style={styles.sourceBox}>
            {sourceRows.rows.map((row) => <CompassSourceRow key={row.label} label={row.label} value={row.value} />)}
          </View>
        ) : null}

        <View style={styles.remarks}>
          <Text>{lt("Remarks")}: {invoice.remarks || ""}</Text>
        </View>

        <View style={styles.chargeTable}>
          <View style={styles.chargeHeader}>
            <CompassCell text="Description" width={31} header align="center" />
            <CompassCell text="Chargeable Weight" width={12} header align="center" />
            <CompassCell text="Unit Price" width={11} header align="center" />
            <CompassCell text={`Amount (${currencyCode})`} width={17} header align="center" />
            <CompassCell text="Tax%" width={9} header align="center" />
            <CompassCell text={`Tax (${currencyCode})`} width={9} header align="center" />
            <CompassCell text={`Total (${currencyCode})`} width={11} header align="center" last />
          </View>
          <View style={styles.chargeBody}>
            {invoice.items.map((item) => (
              <View style={styles.chargeRow} key={item.id}>
                <CompassCell text={item.chargeHead || item.chargeName} width={31} />
                <CompassCell text={money(item.quantity)} width={12} align="right" />
                <CompassCell text={money(item.unitRate)} width={11} align="right" />
                <CompassCell text={money(item.lineAmount - item.taxAmount)} width={17} align="right" />
                <CompassCell text={item.isTaxApplicable ? money(item.taxRate) : "-"} width={9} align="center" />
                <CompassCell text={money(item.taxAmount)} width={9} align="right" />
                <CompassCell text={money(item.lineAmount)} width={11} align="right" last />
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{lt("Total Payable")}</Text>
            <Text style={styles.totalValue}>{money(invoice.subTotalAmount)}</Text>
            <Text style={styles.totalTax}>{money(invoice.taxAmount)}</Text>
            <Text style={styles.totalGrand}>{money(invoice.totalAmount)}</Text>
          </View>
          <View style={styles.amountWords}>
            <Text style={styles.headerText}>{lt("Total payable")}: {currencyCode} {money(invoice.totalAmount)}</Text>
          </View>
        </View>

        {bankDetails.length ? (
          <View style={styles.bankGrid}>
            {bankDetails.map((detail) => <BankDetails key={detail.currencyId} detail={detail} compass />)}
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>{lt("THIS IS A SYSTEM GENERATED INVOICE, NO SIGNATURE IS REQUIRED")}</Text>
          <Text>{tenantName}</Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

function BankDetails({ detail, compass }: { detail: BranchCurrencyBankDetail; compass?: boolean }) {
  if (!compass) {
    return (
      <View style={stylesInline.classicBankBox}>
        <Text style={stylesInline.classicBankTitle}>{detail.currencyCode} - {lt("Bank Details")}</Text>
        <View style={stylesInline.bankFieldGrid}>
          <BankField label="Beneficiary Name" value={detail.beneficiaryName} />
          <BankField label="Bank Name" value={detail.bankName} />
          <BankField label="Currency" value={detail.currencyCode} />
          <BankField label="Branch" value={detail.branchName} />
          <BankField label="Swift Code" value={detail.swiftCode} />
          <BankField label="Account No" value={detail.accountNumber} />
          <BankField label="IBAN" value={detail.iban} />
        </View>
      </View>
    );
  }

  return (
    <View style={stylesInline.compassBankBox}>
      <Text style={stylesInline.compassBankTitle}>{detail.currencyCode} - {lt("Bank Details")}</Text>
      <View style={stylesInline.compassBankFieldGrid}>
        <CompassBankField label="Beneficiary Name" value={detail.beneficiaryName} />
        <CompassBankField label="Bank Name" value={detail.bankName} />
        <CompassBankField label="Currency" value={detail.currencyCode} />
        <CompassBankField label="Branch" value={detail.branchName} />
        <CompassBankField label="Swift Code" value={detail.swiftCode} />
        <CompassBankField label="Account No" value={detail.accountNumber} />
        <CompassBankField label="IBAN" value={detail.iban} />
      </View>
    </View>
  );
}

function BankField({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesInline.bankField}>
      <Text style={stylesInline.bankFieldLabel}>{lt(label)}</Text>
      <Text style={stylesInline.bankFieldValue}>{value || "-"}</Text>
    </View>
  );
}

function CompassBankField({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesInline.compassBankField}>
      <Text style={stylesInline.compassBankFieldLabel}>{lt(label)}</Text>
      <Text style={stylesInline.compassBankFieldValue}>{value || "-"}</Text>
    </View>
  );
}

function CompassMetaRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[compassInline.metaRow, last ? compassInline.noBottomBorder : {}]}>
      <Text style={compassInline.metaLabel}>{lt(label)}</Text>
      <Text style={compassInline.metaValue}>{value || "-"}</Text>
    </View>
  );
}

function CompassSourceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={compassInline.sourceRow}>
      <Text style={compassInline.sourceLabel}>{lt(label)}:</Text>
      <Text style={compassInline.sourceValue}>{value || "-"}</Text>
    </View>
  );
}

function CompassCell({ text, width, header, align = "left", last }: { text: string; width: number; header?: boolean; align?: "left" | "right" | "center"; last?: boolean }) {
  return (
    <View style={{ width: `${width}%`, padding: 5, borderRightWidth: last ? 0 : 1, borderRightColor: "#25b9f2" }}>
      <Text style={{ fontSize: 8, textAlign: align, fontWeight: header ? "bold" : "normal" }}>{header ? lt(text) : (text || "-")}</Text>
    </View>
  );
}

function MetaRow({ label, value, translateValue }: { label: string; value: string; translateValue?: boolean }) {
  return (
    <View style={stylesInline.metaRow}>
      <Text style={stylesInline.metaLabel}>{lt(label)}</Text>
      <Text style={stylesInline.metaValue}>{translateValue ? lt(value || "-") : (value || "-")}</Text>
    </View>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={stylesInline.totalRow}>
      <Text style={{ fontSize: 7.8, fontWeight: bold ? "bold" : "normal" }}>{translatePrefix(label)}</Text>
      <Text style={{ fontSize: 7.8, fontWeight: bold ? "bold" : "normal" }}>{value}</Text>
    </View>
  );
}

function SourceMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesInline.sourceMetaRow}>
      <Text style={stylesInline.sourceMetaLabel}>{lt(label)}</Text>
      <Text style={stylesInline.sourceMetaValue}>{value || "-"}</Text>
    </View>
  );
}

function Cell({ text, w, header, align = "left" }: { text: string; w: number; header?: boolean; align?: "left" | "right" | "center" }) {
  return (
    <View style={{ width: `${w}%`, paddingHorizontal: 3, paddingVertical: 3, borderRightWidth: 1, borderRightColor: "#d6e4f0" }}>
      <Text style={{ fontSize: 7.4, textAlign: align, fontWeight: header ? "bold" : "normal" }}>{header ? lt(text) : (text || "-")}</Text>
    </View>
  );
}

function money(value: number) {
  return Number(value || 0).toFixed(2);
}

function translatePrefix(value: string) {
  const match = value.match(/^(.+?)(\s+\(.+\))$/);
  return match ? `${lt(match[1])}${match[2]}` : lt(value);
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
  metaRow: { flexDirection: "row" as const, marginBottom: 2 },
  metaLabel: { width: 72, color: "#475569", fontSize: 7.6 },
  metaValue: { flex: 1, fontSize: 7.6 },
  sourceMetaRow: { width: "50%" as const, flexDirection: "row" as const, marginBottom: 2, paddingRight: 6 },
  sourceMetaLabel: { width: 74, color: "#475569", fontSize: 7.4 },
  sourceMetaValue: { flex: 1, fontSize: 7.4 },
  totalRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 2 },
  classicBankBox: { width: "100%" as const, borderWidth: 1, borderColor: "#93c5fd", marginBottom: 3 },
  classicBankTitle: { paddingHorizontal: 4, paddingVertical: 2, backgroundColor: "#e0f2fe", color: "#1d4ed8", fontSize: 7, fontWeight: "bold" as const },
  bankFieldGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const },
  bankField: { width: "25%" as const, minHeight: 20, borderTopWidth: 1, borderRightWidth: 1, borderColor: "#bae6fd", paddingHorizontal: 4, paddingVertical: 2 },
  bankFieldLabel: { fontSize: 5.8, color: "#1d4ed8", fontWeight: "bold" as const },
  bankFieldValue: { fontSize: 6.5, marginTop: 1 },
  compassBankBox: { width: "100%" as const, borderWidth: 1, borderColor: "#25b9f2", borderRadius: 7, overflow: "hidden" as const },
  compassBankTitle: { paddingHorizontal: 6, paddingVertical: 4, backgroundColor: "#d9f1fa", fontSize: 8, fontWeight: "bold" as const },
  compassBankFieldGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, paddingHorizontal: 2, paddingVertical: 1 },
  compassBankField: { width: "25%" as const, minHeight: 22, paddingHorizontal: 4, paddingVertical: 2 },
  compassBankFieldLabel: { fontSize: 6.4, color: "#0369a1", fontWeight: "bold" as const },
  compassBankFieldValue: { fontSize: 7.2, marginTop: 1 }
};

const compassInline = {
  metaRow: { flexDirection: "row" as const, borderBottomWidth: 1, borderBottomColor: "#25b9f2" },
  noBottomBorder: { borderBottomWidth: 0 },
  metaLabel: { width: "31%" as const, padding: 5, backgroundColor: "#d9f1fa", fontSize: 8, fontWeight: "bold" as const },
  metaValue: { flex: 1, padding: 5, fontSize: 8, fontWeight: "bold" as const },
  sourceRow: { width: "50%" as const, flexDirection: "row" as const, minHeight: 18 },
  sourceLabel: { width: 92, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: "#d9f1fa", fontSize: 8, fontWeight: "bold" as const },
  sourceValue: { flex: 1, paddingHorizontal: 6, paddingVertical: 3, fontSize: 8 }
};

function createCompassStyles() {
  return StyleSheet.create({
    page: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 34, fontSize: 8, fontFamily: getPdfFontFamily(), color: "#111827" },
    header: { flexDirection: "row", justifyContent: "space-between", minHeight: 58 },
    logoArea: { width: 190, justifyContent: "center" },
    logo: { width: 135, height: 52, objectFit: "contain", objectPosition: "left center" },
    companyDetails: { width: 205, alignItems: "flex-end", textAlign: "right", fontSize: 7.5, lineHeight: 1.25 },
    companyName: { fontSize: 11, fontWeight: "bold" },
    title: { marginVertical: 7, textAlign: "center", fontSize: 15, fontWeight: "bold" },
    twoColumn: { flexDirection: "row", gap: 10, marginBottom: 6 },
    customerBox: { flex: 1, height: 66, borderWidth: 1, borderColor: "#25b9f2", borderRadius: 7, overflow: "hidden" },
    invoiceBox: { flex: 1, borderWidth: 1, borderColor: "#25b9f2", borderRadius: 7, overflow: "hidden" },
    blueHeader: { minHeight: 15, paddingHorizontal: 6, backgroundColor: "#d9f1fa", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerText: { fontSize: 7.5, fontWeight: "bold" },
    boxBody: { padding: 5, fontSize: 7.5, lineHeight: 1.2 },
    sourceBox: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderColor: "#25b9f2", borderRadius: 7, overflow: "hidden", marginBottom: 6 },
    remarks: { height: 31, borderWidth: 1, borderColor: "#25b9f2", borderRadius: 7, padding: 5, marginBottom: 6 },
    chargeTable: { borderWidth: 1, borderColor: "#25b9f2", borderRadius: 7, overflow: "hidden" },
    chargeHeader: { flexDirection: "row", backgroundColor: "#d9f1fa", borderBottomWidth: 1, borderBottomColor: "#25b9f2", minHeight: 27, alignItems: "stretch" },
    chargeBody: { minHeight: 96 },
    chargeRow: { flexDirection: "row", minHeight: 19 },
    totalRow: { height: 21, flexDirection: "row", borderTopWidth: 1, borderTopColor: "#25b9f2", alignItems: "center" },
    totalLabel: { width: "54%", paddingHorizontal: 5, fontSize: 8 },
    totalValue: { width: "17%", paddingHorizontal: 5, textAlign: "right", fontSize: 8 },
    totalTax: { width: "18%", paddingHorizontal: 5, textAlign: "right", fontSize: 8 },
    totalGrand: { width: "11%", paddingHorizontal: 5, textAlign: "right", fontSize: 8 },
    amountWords: { borderTopWidth: 1, borderTopColor: "#25b9f2", padding: 5 },
    bankGrid: { marginTop: 6 },
    footer: { position: "absolute", bottom: 18, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", color: "#9ca3af", fontSize: 6.5 },
    pageNumber: { position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center", fontSize: 7 }
  });
}

function createStyles() {
  return StyleSheet.create({
    page: { padding: 12, fontSize: 7.8, fontFamily: getPdfFontFamily(), color: "#0f172a", position: "relative" },
    watermark: { position: "absolute", top: 335, left: 88, fontSize: 68, color: "#d1d5db", opacity: 0.22, transform: "rotate(-35deg)", fontWeight: "bold" },
    header: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#94a3b8", paddingBottom: 5, marginBottom: 5 },
    headerLeft: { width: 112, alignItems: "flex-start", justifyContent: "center" },
    headerCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
    headerRight: { width: 165, alignItems: "flex-end", justifyContent: "center" },
    logo: { width: 74, height: 54, objectFit: "contain" },
    logoPlaceholder: { width: 74, height: 54, borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
    logoPlaceholderText: { fontSize: 8, color: "#94a3b8" },
    docTitle: { fontSize: 14, fontWeight: "bold", textAlign: "center" },
    companyName: { fontSize: 10, fontWeight: "bold", textAlign: "right" },
    branchName: { fontSize: 8, marginTop: 1, color: "#334155", textAlign: "right" },
    branchAddress: { fontSize: 7.2, marginTop: 1, color: "#475569", textAlign: "right" },
    infoGrid: { flexDirection: "row", gap: 6, marginBottom: 5 },
    infoBox: { flex: 1, minHeight: 62, borderWidth: 1, borderColor: "#93c5fd", padding: 4 },
    sourceBox: { borderWidth: 1, borderColor: "#93c5fd", padding: 4, marginBottom: 5 },
    sourceGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 1 },
    boxTitle: { fontSize: 7.8, fontWeight: "bold", marginBottom: 2, color: "#1d4ed8" },
    strong: { fontSize: 8.2, fontWeight: "bold", marginBottom: 1 },
    table: { borderWidth: 1, borderColor: "#93c5fd", marginBottom: 5 },
    tableHeader: { flexDirection: "row", backgroundColor: "#e0f2fe", borderBottomWidth: 1, borderBottomColor: "#93c5fd" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#dbeafe", minHeight: 15 },
    bottomGrid: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
    remarksBox: { flex: 1, minHeight: 52, borderWidth: 1, borderColor: "#dbeafe", padding: 4 },
    smallNote: { marginTop: 5, color: "#64748b", fontSize: 6.6 },
    totalCard: { width: 184, borderWidth: 1, borderColor: "#93c5fd", padding: 4 },
    bankGrid: { marginTop: 4 },
    footer: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", fontSize: 7.2, color: "#334155" },
    signatureLine: { marginTop: 14, width: 130, borderTopWidth: 1, borderTopColor: "#64748b" }
  });
}
