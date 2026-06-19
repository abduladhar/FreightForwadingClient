import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { CustomerReceiptDto } from "@/api/receiptApi";
import { lt } from "@/modules/operationsLocalization";
import { ensurePdfFontsRegistered, getPdfFontFamily } from "@/utils/pdfFonts";

export interface CustomerReceiptPdfOptions {
  fileName: string;
  tenantName?: string;
  branchName?: string;
  receipt: CustomerReceiptDto;
  voucherContent?: string;
  receiptCurrencyCode?: string;
  baseCurrencyCode?: string;
}

export async function exportCustomerReceiptPdf(options: CustomerReceiptPdfOptions) {
  ensurePdfFontsRegistered();
  const blob = await pdf(buildCustomerReceiptDocument(options)).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildCustomerReceiptDocument({ tenantName, branchName, receipt, voucherContent, receiptCurrencyCode = "Currency", baseCurrencyCode = "Base" }: CustomerReceiptPdfOptions) {
  const styles = createStyles();
  const exchangeGainLoss = receipt.exchangeGainAmount - receipt.exchangeLossAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{lt("RECEIPT VOUCHER")}</Text>
          <Text style={styles.subtitle}>{branchName || tenantName || lt("Branch")}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <MetaRow label={lt("Receipt No")} value={receipt.receiptNumber} />
            <MetaRow label={lt("Receipt Date")} value={receipt.receiptDate} />
            <MetaRow label={lt("Status")} value={lt(receipt.status)} />
            <MetaRow label={lt("Advance")} value={receipt.isAdvanceReceipt ? lt("Yes") : lt("No")} />
          </View>
          <View style={styles.infoBox}>
            <MetaRow label={lt("Received From Type")} value={lt(receipt.receivedFromPartyType || "Customer")} />
            <MetaRow label={lt("Received From")} value={receipt.receivedFromPartyName || receipt.customerId} />
            <MetaRow label={lt("Currency")} value={receiptCurrencyCode} />
            <MetaRow label={lt("Exchange Rate")} value={`1 ${receiptCurrencyCode} = ${receipt.exchangeRate} ${baseCurrencyCode}`} />
            <MetaRow label={lt("Remarks")} value={receipt.remarks || "-"} />
          </View>
        </View>

        <View style={styles.amountGrid}>
          <AmountBox label={`${lt("Receipt Amount")} (${receiptCurrencyCode})`} value={receipt.receiptAmount} />
          <AmountBox label={`${lt("Base Amount")} (${baseCurrencyCode})`} value={receipt.baseCurrencyAmount} />
          <AmountBox label={`${lt("Bank Charges")} (${receiptCurrencyCode})`} value={receipt.bankCharges} />
          <AmountBox label={`${lt("Exchange Gain/Loss")} (${baseCurrencyCode})`} value={exchangeGainLoss} />
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Cell text={lt("Invoice No")} w={34} header />
            <Cell text={lt("Allocated")} w={22} header align="right" />
            <Cell text={lt("Exchange Gain")} w={22} header align="right" />
            <Cell text={lt("Exchange Loss")} w={22} header align="right" />
          </View>
          {receipt.allocations.length ? receipt.allocations.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Cell text={item.invoiceNumber || item.invoiceId} w={34} />
              <Cell text={money(item.allocatedAmount)} w={22} align="right" />
              <Cell text={money(item.exchangeGainAmount)} w={22} align="right" />
              <Cell text={money(item.exchangeLossAmount)} w={22} align="right" />
            </View>
          )) : (
            <View style={styles.tableRow}>
              <Cell text={lt("Advance receipt without invoice allocation.")} w={100} align="center" />
            </View>
          )}
        </View>

        {!!voucherContent && (
          <View style={styles.voucherBox}>
            <Text style={styles.voucherText}>{voucherContent}</Text>
          </View>
        )}

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}><Text>{lt("Prepared By")}</Text></View>
          <View style={styles.signatureBox}><Text>{lt("Authorized Signature")}</Text></View>
        </View>
      </Page>
    </Document>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={metaRowStyle}>
      <Text style={metaLabelStyle}>{label}:</Text>
      <Text style={metaValueStyle}>{value || "-"}</Text>
    </View>
  );
}

function AmountBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={amountBoxStyle}>
      <Text style={amountLabelStyle}>{label}</Text>
      <Text style={amountValueStyle}>{money(value)}</Text>
    </View>
  );
}

function Cell({ text, w, header, align = "left" }: { text: string; w: number; header?: boolean; align?: "left" | "right" | "center" }) {
  return (
    <View style={{ width: `${w}%`, paddingHorizontal: 6, paddingVertical: 6, borderRightWidth: 1, borderRightColor: "#e2e8f0" }}>
      <Text style={{ fontSize: 8.5, textAlign: align, fontWeight: header ? "bold" : "normal" }}>{text}</Text>
    </View>
  );
}

function money(value: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const metaRowStyle = { flexDirection: "row" as const, marginBottom: 4 };
const metaLabelStyle = { width: 84, fontSize: 9, color: "#475569", fontWeight: "bold" as const };
const metaValueStyle = { flex: 1, fontSize: 8.5, color: "#0f172a", flexWrap: "wrap" as const };
const amountBoxStyle = { width: "24%" as const, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 8 };
const amountLabelStyle = { fontSize: 8.5, color: "#64748b", marginBottom: 4 };
const amountValueStyle = { fontSize: 11, fontWeight: "bold" as const, color: "#0f172a" };

function createStyles() {
  return StyleSheet.create({
    page: { padding: 24, fontSize: 10, fontFamily: getPdfFontFamily(), color: "#0f172a" },
    header: { borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 12, marginBottom: 14, alignItems: "center" },
    title: { fontSize: 20, fontWeight: "bold", letterSpacing: 0.8 },
    subtitle: { marginTop: 4, color: "#64748b", fontSize: 10 },
    infoGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
    infoBox: { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 8 },
    amountGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    table: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 12 },
    tableHeader: { flexDirection: "row", backgroundColor: "#f1f5f9", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
    voucherBox: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 10, marginTop: 2 },
    voucherText: { fontSize: 9, lineHeight: 1.45 },
    signatureRow: { marginTop: 28, flexDirection: "row", justifyContent: "space-between" },
    signatureBox: { width: 180, borderTopWidth: 1, borderTopColor: "#64748b", paddingTop: 6, alignItems: "center", fontSize: 9 }
  });
}
