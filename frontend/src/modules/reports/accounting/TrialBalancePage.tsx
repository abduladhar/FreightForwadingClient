import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { accountCode: string; accountName: string; openingDebit: number; openingCredit: number; periodDebit: number; periodCredit: number; closingDebit: number; closingCredit: number };
const columns: ColumnDef<Row>[] = [{ accessorKey: "accountCode", header: lt("Account Code") }, { accessorKey: "accountName", header: lt("Account Name") }, { accessorKey: "openingDebit", header: lt("Opening Debit") }, { accessorKey: "openingCredit", header: lt("Opening Credit") }, { accessorKey: "periodDebit", header: lt("Period Debit") }, { accessorKey: "periodCredit", header: lt("Period Credit") }, { accessorKey: "closingDebit", header: lt("Closing Debit") }, { accessorKey: "closingCredit", header: lt("Closing Credit") }];
export function TrialBalancePage() {
  return <AccountingReportPage<Row> title={lt("Trial Balance")} reportType="trial-balance" mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} totalsBuilder={(rows) => [{ label: lt("Opening Debit"), value: rows.reduce((s, x) => s + x.openingDebit, 0).toFixed(2) }, { label: lt("Opening Credit"), value: rows.reduce((s, x) => s + x.openingCredit, 0).toFixed(2) }, { label: lt("Closing Debit"), value: rows.reduce((s, x) => s + x.closingDebit, 0).toFixed(2) }, { label: lt("Closing Credit"), value: rows.reduce((s, x) => s + x.closingCredit, 0).toFixed(2) }]} />;
}

