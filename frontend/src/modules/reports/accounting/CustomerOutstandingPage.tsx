import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { partyId: string; partyName: string; documentId: string; documentNumber: string; documentDate: string; dueDate: string; totalAmount: number; paidAmount: number; outstandingAmount: number; baseOutstandingAmount: number };
const columns: ColumnDef<Row>[] = [{ accessorKey: "partyName", header: lt("Customer") }, { accessorKey: "documentNumber", header: lt("Document") }, { accessorKey: "documentDate", header: lt("Date") }, { accessorKey: "dueDate", header: lt("Due") }, { accessorKey: "totalAmount", header: lt("Total") }, { accessorKey: "paidAmount", header: lt("Paid") }, { accessorKey: "outstandingAmount", header: lt("Outstanding") }, { accessorKey: "baseOutstandingAmount", header: lt("Base Outstanding") }];
export function CustomerOutstandingPage() {
  return <AccountingReportPage<Row> title={lt("Customer Outstanding")} reportType="customer-outstanding" needsCustomer mapRows={(data) => Array.isArray(data) ? data as Row[] : []} columns={columns} totalsBuilder={(rows) => [{ label: lt("Outstanding"), value: rows.reduce((s, x) => s + x.outstandingAmount, 0).toFixed(2) }]} />;
}
