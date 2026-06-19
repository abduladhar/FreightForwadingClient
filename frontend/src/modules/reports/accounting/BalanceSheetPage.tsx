import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { groupName: string; accountCode: string; accountName: string; amount: number };
const columns: ColumnDef<Row>[] = [{ accessorKey: "groupName", header: lt("Group") }, { accessorKey: "accountCode", header: lt("Account Code") }, { accessorKey: "accountName", header: lt("Account Name") }, { accessorKey: "amount", header: lt("Amount") }];
export function BalanceSheetPage() {
  return <AccountingReportPage<Row> title={lt("Balance Sheet")} reportType="balance-sheet" mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} showCurrency summaryBuilder={(rows) => [{ label: lt("Assets"), value: rows.filter((x) => x.groupName.toLowerCase().includes("asset")).reduce((s, x) => s + x.amount, 0).toFixed(2) }, { label: lt("Liabilities"), value: rows.filter((x) => x.groupName.toLowerCase().includes("liabil")).reduce((s, x) => s + x.amount, 0).toFixed(2) }, { label: lt("Capital"), value: rows.filter((x) => x.groupName.toLowerCase().includes("capital")).reduce((s, x) => s + x.amount, 0).toFixed(2) }]} totalsBuilder={(rows) => [{ label: lt("Total"), value: rows.reduce((s, x) => s + x.amount, 0).toFixed(2) }]} />;
}
