import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";

type Row = { date: string; voucherNumber: string; voucherType: string; particulars: string; narration: string; debit: number; credit: number; balance: number; currencyId: string; baseDebit: number; baseCredit: number; baseBalance: number };
const columns: ColumnDef<Row>[] = [{ accessorKey: "date", header: lt("Date") }, { accessorKey: "voucherNumber", header: lt("Voucher No") }, { accessorKey: "voucherType", header: lt("Type") }, { accessorKey: "particulars", header: lt("Particulars") }, { accessorKey: "narration", header: lt("Narration") }, { accessorKey: "debit", header: lt("Debit") }, { accessorKey: "credit", header: lt("Credit") }, { accessorKey: "balance", header: lt("Balance") }, { accessorKey: "baseDebit", header: lt("Base Debit") }, { accessorKey: "baseCredit", header: lt("Base Credit") }, { accessorKey: "baseBalance", header: lt("Base Balance") }];

export function LedgerReportPage() {
  return <AccountingReportPage<Row> title={lt("Ledger Report")} reportType="ledger" needsAccount mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} showCurrency summaryBuilder={(rows) => [{ label: lt("Entries"), value: rows.length }]} totalsBuilder={(rows) => [{ label: lt("Total Debit"), value: rows.reduce((s, x) => s + x.debit, 0).toFixed(2) }, { label: lt("Total Credit"), value: rows.reduce((s, x) => s + x.credit, 0).toFixed(2) }]} />;
}
