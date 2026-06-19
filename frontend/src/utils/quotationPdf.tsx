import React from "react";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { QuotationDto } from "@/api/quotationApi";
import { ensurePdfFontsRegistered, getPdfFontFamily } from "@/utils/pdfFonts";

export interface QuotationPdfOptions {
  fileName: string;
  tenantName: string;
  branchName?: string;
  branchAddress?: string;
  logoUrl?: string;
  quotation: QuotationDto;
  translate?: (value: string) => string;
  isRightToLeft?: boolean;
}

export async function exportQuotationPdf(options: QuotationPdfOptions) {
  ensurePdfFontsRegistered();
  const blob = await pdf(buildQuotationDocument(options)).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildQuotationDocument({ tenantName, branchName, branchAddress, logoUrl, quotation, translate, isRightToLeft = false }: QuotationPdfOptions) {
  const t = translate ?? ((value: string) => value);
  const styles = createStyles(isRightToLeft);

  const chargeRows = quotation.charges.map((charge) => ({
    head: charge.chargeHeadName || charge.chargeName,
    code: charge.chargeCode,
    qty: charge.quantity.toFixed(2),
    rate: charge.unitRate.toFixed(2),
    tax: charge.taxAmount.toFixed(2),
    amount: charge.totalAmount.toFixed(2)
  }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder}><Text style={styles.logoPlaceholderText}>{t("LOGO")}</Text></View>}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.docTitle}>{t("Quotation").toLocaleUpperCase()}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{tenantName}</Text>
            {!!branchName && <Text style={styles.branchName}>{branchName}</Text>}
            {!!branchAddress && <Text style={styles.branchAddress}>{branchAddress}</Text>}
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <MetaRow label={t("Quotation No")} value={quotation.quotationNumber} rtl={isRightToLeft} />
            <MetaRow label={t("Date")} value={quotation.quotationDate} rtl={isRightToLeft} />
            <MetaRow label={t("Valid Until")} value={quotation.validUntilDate} rtl={isRightToLeft} />
            <MetaRow label={t("Status")} value={t(quotation.status)} rtl={isRightToLeft} />
          </View>
          <View style={styles.metaColumn}>
            <MetaRow label={t("Service Type")} value={quotation.serviceType} rtl={isRightToLeft} />
            <MetaRow label={t("Mode")} value={t(quotation.modeOfTransport)} rtl={isRightToLeft} />
            <MetaRow label={t("Shipment Type")} value={t(quotation.shipmentType)} rtl={isRightToLeft} />
            <MetaRow label={t("Route")} value={`${quotation.origin} → ${quotation.destination}`} rtl={isRightToLeft} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("Shipment Items")}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Cell text={t("Package Type")} w={18} header rtl={isRightToLeft} />
            <Cell text={t("Description")} w={18} header rtl={isRightToLeft} />
            <Cell text={t("Packages")} w={10} header rtl={isRightToLeft} />
            <Cell text={t("Gross Wt")} w={10} header rtl={isRightToLeft} />
            <Cell text={t("L")} w={8} header rtl={isRightToLeft} />
            <Cell text={t("W")} w={8} header rtl={isRightToLeft} />
            <Cell text={t("H")} w={8} header rtl={isRightToLeft} />
            <Cell text={t("Vol (CBM)")} w={10} header rtl={isRightToLeft} />
            <Cell text={t("Charge Wt")} w={10} header rtl={isRightToLeft} />
          </View>
          {quotation.items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Cell text={item.packageTypeName || item.packageTypeCode || "-"} w={18} />
              <Cell text={item.description} w={18} />
              <Cell text={item.pieces.toFixed(2)} w={10} align="right" />
              <Cell text={item.actualWeight.toFixed(2)} w={10} align="right" />
              <Cell text={item.length.toFixed(2)} w={8} align="right" />
              <Cell text={item.width.toFixed(2)} w={8} align="right" />
              <Cell text={item.height.toFixed(2)} w={8} align="right" />
              <Cell text={item.volumeCbm.toFixed(4)} w={10} align="right" />
              <Cell text={item.chargeableWeight.toFixed(2)} w={10} align="right" />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t("Charge Breakdown")}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Cell text={t("Charge Head")} w={28} header rtl={isRightToLeft} />
            <Cell text={t("Code")} w={12} header rtl={isRightToLeft} />
            <Cell text={t("Qty")} w={10} header rtl={isRightToLeft} />
            <Cell text={t("Rate")} w={12} header rtl={isRightToLeft} />
            <Cell text={t("Tax")} w={12} header rtl={isRightToLeft} />
            <Cell text={t("Amount")} w={16} header rtl={isRightToLeft} />
          </View>
          {chargeRows.map((row, index) => (
            <View style={styles.tableRow} key={`${row.code}-${index}`}>
              <Cell text={row.head} w={28} />
              <Cell text={row.code} w={12} />
              <Cell text={row.qty} w={10} align="right" />
              <Cell text={row.rate} w={12} align="right" />
              <Cell text={row.tax} w={12} align="right" />
              <Cell text={row.amount} w={16} align="right" />
            </View>
          ))}
        </View>

        <View style={styles.totalCard}>
          <TotalRow label={t("Sub Total")} value={quotation.subTotalAmount.toFixed(2)} />
          <TotalRow label={t("Discount")} value={quotation.discountAmount.toFixed(2)} />
          <TotalRow label={t("Tax")} value={quotation.taxAmount.toFixed(2)} />
          <TotalRow label={t("Grand Total")} value={quotation.totalAmount.toFixed(2)} bold />
        </View>

        <View style={styles.footer}>
          <Text>{t("Prepared by")}: ____________________</Text>
          <Text>{t("Approved by")}: ____________________</Text>
        </View>
      </Page>
    </Document>
  );
}

function MetaRow({ label, value, rtl }: { label: string; value: string; rtl?: boolean }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 3 }}>
      <Text style={{ width: 90, fontSize: 9, color: "#475569", textAlign: rtl ? "right" : "left" }}>{label}</Text>
      <Text style={{ fontSize: 9, textAlign: rtl ? "right" : "left" }}>{value || "-"}</Text>
    </View>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
      <Text style={{ fontSize: 9, fontWeight: bold ? "bold" : "normal" }}>{label}</Text>
      <Text style={{ fontSize: 9, fontWeight: bold ? "bold" : "normal" }}>{value}</Text>
    </View>
  );
}

function Cell({ text, w, header, align = "left", rtl }: { text: string; w: number; header?: boolean; align?: "left" | "right" | "center"; rtl?: boolean }) {
  return (
    <View style={{ width: `${w}%`, paddingHorizontal: 4, paddingVertical: 4, borderRightWidth: 1, borderRightColor: "#e2e8f0" }}>
      <Text style={{ fontSize: 8.5, textAlign: rtl && align === "left" ? "right" : align, fontWeight: header ? "bold" : "normal" }}>{text}</Text>
    </View>
  );
}

function createStyles(isRightToLeft: boolean) {
  return StyleSheet.create({
    page: { padding: 20, fontSize: 10, fontFamily: getPdfFontFamily(), color: "#0f172a", direction: isRightToLeft ? "rtl" : "ltr" },
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
    totalCard: { marginTop: 8, marginLeft: "55%", borderWidth: 1, borderColor: "#e2e8f0", padding: 8 },
    footer: { marginTop: 20, flexDirection: "row", justifyContent: "space-between", fontSize: 9, color: "#334155" }
  });
}
