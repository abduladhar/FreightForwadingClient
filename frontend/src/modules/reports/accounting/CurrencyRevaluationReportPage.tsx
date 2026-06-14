import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { date: string; sourceDocumentType: string; sourceDocumentId: string; originalAmount: number; revaluedAmount: number; differenceAmount: number };
const columns: ColumnDef<Row>[] = [{ accessorKey: "date", header: lt("Date") }, { accessorKey: "sourceDocumentType", header: lt("Source Type") }, { accessorKey: "sourceDocumentId", header: lt("Source Id") }, { accessorKey: "originalAmount", header: lt("Original") }, { accessorKey: "revaluedAmount", header: lt("Revalued") }, { accessorKey: "differenceAmount", header: lt("Difference") }];
export function CurrencyRevaluationReportPage() {
  return <AccountingReportPage<Row> title={lt("Currency Revaluation")} reportType="currency-revaluation" mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} totalsBuilder={(rows) => [{ label: lt("Original Total"), value: rows.reduce((s, x) => s + x.originalAmount, 0).toFixed(2) }, { label: lt("Revalued Total"), value: rows.reduce((s, x) => s + x.revaluedAmount, 0).toFixed(2) }, { label: lt("Difference Total"), value: rows.reduce((s, x) => s + x.differenceAmount, 0).toFixed(2) }]} />;
}
