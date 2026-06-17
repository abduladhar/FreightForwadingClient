import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { key: string; taxableAmount: number; taxAmount: number; source: string };
const columns: ColumnDef<Row>[] = [{ accessorKey: "source", header: lt("Source"), cell: ({ row }) => lt(row.original.source) }, { accessorKey: "key", header: lt("Key") }, { accessorKey: "taxableAmount", header: lt("Taxable Amount") }, { accessorKey: "taxAmount", header: lt("Tax Amount") }];
export function TaxReportPage() {
  return <AccountingReportPage<Row> title={lt("Tax Report")} reportType="tax-report" mapRows={(data) => {
    const d = (data as { byInvoice?: Array<{ key: string; taxableAmount: number; taxAmount: number }>; byBill?: Array<{ key: string; taxableAmount: number; taxAmount: number }>; byParty?: Array<{ key: string; taxableAmount: number; taxAmount: number }>; byTaxPercentage?: Array<{ key: string; taxableAmount: number; taxAmount: number }> }) ?? {};
    const map = (src: string, rows?: Array<{ key: string; taxableAmount: number; taxAmount: number }>) => (rows ?? []).map((x) => ({ ...x, source: src }));
    return [...map("Invoice", d.byInvoice), ...map("Bill", d.byBill), ...map("Party", d.byParty), ...map("Tax %", d.byTaxPercentage)];
  }} columns={columns} showCurrency summaryBuilder={(rows, data) => {
    const payload = data as { outputTax?: number; inputTax?: number; taxPayable?: number; taxReceivable?: number; netTax?: number } | undefined;
    if (payload) {
      return [
        { label: lt("Output Tax"), value: (payload.outputTax ?? 0).toFixed(2) },
        { label: lt("Input Tax"), value: (payload.inputTax ?? 0).toFixed(2) },
        { label: lt("Tax Payable"), value: (payload.taxPayable ?? 0).toFixed(2) },
        { label: lt("Tax Receivable"), value: (payload.taxReceivable ?? 0).toFixed(2) },
        { label: lt("Net Tax"), value: (payload.netTax ?? 0).toFixed(2) }
      ];
    }
    return [
      { label: lt("Output Tax"), value: rows.filter((x) => x.source === "Invoice").reduce((s, x) => s + x.taxAmount, 0).toFixed(2) },
      { label: lt("Input Tax"), value: rows.filter((x) => x.source === "Bill").reduce((s, x) => s + x.taxAmount, 0).toFixed(2) },
      { label: lt("Net Tax"), value: rows.reduce((s, x) => s + x.taxAmount, 0).toFixed(2) }
    ];
  }} totalsBuilder={(rows) => [{ label: lt("Taxable Total"), value: rows.reduce((s, x) => s + x.taxableAmount, 0).toFixed(2) }, { label: lt("Tax Total"), value: rows.reduce((s, x) => s + x.taxAmount, 0).toFixed(2) }]} />;
}
