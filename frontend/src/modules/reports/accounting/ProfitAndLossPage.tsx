import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { groupName: string; accountCode: string; accountName: string; amount: number };
const columns: ColumnDef<Row>[] = [{ accessorKey: "groupName", header: lt("Group") }, { accessorKey: "accountCode", header: lt("Account Code") }, { accessorKey: "accountName", header: lt("Account Name") }, { accessorKey: "amount", header: lt("Amount") }];
export function ProfitAndLossPage() {
  return <AccountingReportPage<Row> title={lt("Profit & Loss")} reportType="profit-and-loss" mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} summaryBuilder={(rows) => [{ label: lt("Income"), value: rows.filter((x) => x.groupName.toLowerCase().includes("income")).reduce((s, x) => s + x.amount, 0).toFixed(2) }, { label: lt("Expenses"), value: rows.filter((x) => x.groupName.toLowerCase().includes("expense")).reduce((s, x) => s + x.amount, 0).toFixed(2) }]} totalsBuilder={(rows) => [{ label: lt("Net"), value: rows.reduce((s, x) => s + x.amount, 0).toFixed(2) }]} />;
}

