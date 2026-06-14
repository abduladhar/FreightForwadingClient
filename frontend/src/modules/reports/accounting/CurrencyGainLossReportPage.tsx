import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { date: string; sourceDocumentType: string; sourceDocumentId: string; gainAmount: number; lossAmount: number; notes: string };
const columns: ColumnDef<Row>[] = [{ accessorKey: "date", header: lt("Date") }, { accessorKey: "sourceDocumentType", header: lt("Source Type") }, { accessorKey: "sourceDocumentId", header: lt("Source Id") }, { accessorKey: "gainAmount", header: lt("Gain") }, { accessorKey: "lossAmount", header: lt("Loss") }, { accessorKey: "notes", header: lt("Notes") }];
export function CurrencyGainLossReportPage() {
  return <AccountingReportPage<Row> title={lt("Currency Gain/Loss")} reportType="currency-gain-loss" mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} totalsBuilder={(rows) => [{ label: lt("Gain Total"), value: rows.reduce((s, x) => s + x.gainAmount, 0).toFixed(2) }, { label: lt("Loss Total"), value: rows.reduce((s, x) => s + x.lossAmount, 0).toFixed(2) }]} />;
}
