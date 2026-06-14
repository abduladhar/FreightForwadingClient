import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { date: string; documentNumber: string; documentType: string; narration: string; debit: number; credit: number; balance: number };
const columns: ColumnDef<Row>[] = [{ accessorKey: "date", header: lt("Date") }, { accessorKey: "documentNumber", header: lt("Document") }, { accessorKey: "documentType", header: lt("Type") }, { accessorKey: "narration", header: lt("Narration") }, { accessorKey: "debit", header: lt("Debit") }, { accessorKey: "credit", header: lt("Credit") }, { accessorKey: "balance", header: lt("Balance") }];
export function StatementOfAccountPage() {
  return <AccountingReportPage<Row> title={lt("Statement of Account")} reportType="statement-of-account" needsCustomer mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} summaryBuilder={(rows) => [{ label: lt("Opening"), value: rows[0]?.balance?.toFixed?.(2) ?? "0.00" }, { label: lt("Transactions"), value: rows.length }, { label: lt("Closing"), value: rows.length ? rows[rows.length - 1].balance.toFixed(2) : "0.00" }]} totalsBuilder={(rows) => [{ label: lt("Debit Total"), value: rows.reduce((s, x) => s + x.debit, 0).toFixed(2) }, { label: lt("Credit Total"), value: rows.reduce((s, x) => s + x.credit, 0).toFixed(2) }]} />;
}

