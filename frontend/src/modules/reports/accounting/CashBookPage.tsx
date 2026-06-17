import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { date: string; voucherNumber: string; particulars: string; debit: number; credit: number; balance: number; currencyId: string };
const columns: ColumnDef<Row>[] = [{ accessorKey: "date", header: lt("Date") }, { accessorKey: "voucherNumber", header: lt("Voucher No") }, { accessorKey: "particulars", header: lt("Particulars") }, { accessorKey: "debit", header: lt("Debit") }, { accessorKey: "credit", header: lt("Credit") }, { accessorKey: "balance", header: lt("Balance") }];
export function CashBookPage() {
  return <AccountingReportPage<Row> title={lt("Cash Book")} reportType="cash-book" mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} showCurrency totalsBuilder={(rows) => [{ label: lt("Total Debit"), value: rows.reduce((s, x) => s + x.debit, 0).toFixed(2) }, { label: lt("Total Credit"), value: rows.reduce((s, x) => s + x.credit, 0).toFixed(2) }]} />;
}
