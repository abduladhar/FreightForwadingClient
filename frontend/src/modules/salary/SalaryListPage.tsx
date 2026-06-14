import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { listSalaryDrafts, getLedgerReport, searchLedgerAccounts } from "@/api/salaryApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

type SalaryLedgerRow = { id: string; month: string; employee: string; netAmount: number; channel: "Posted" | "Draft"; status: string; voucher?: string };

export function SalaryListPage() {
  const ledgers = useQuery({
    queryKey: ["salary-ledger-rows"],
    queryFn: async () => {
      const accounts = await searchLedgerAccounts({ pageNumber: 1, pageSize: 200, search: "Salary" });
      const first = accounts.items[0];
      if (!first) return [];
      const report = await getLedgerReport({ pageNumber: 1, pageSize: 200, accountId: first.id });
      return report.data;
    }
  });
  const rows = useMemo<SalaryLedgerRow[]>(() => {
    const posted = (ledgers.data ?? []).map((x, i) => ({ id: `${x.voucherNumber}-${i}`, month: x.date.slice(0, 7), employee: x.particulars, netAmount: x.debit > 0 ? x.debit : x.credit, channel: "Posted" as const, status: "Approved", voucher: x.voucherNumber }));
    const drafts = listSalaryDrafts().map((x) => ({ id: x.id, month: x.month, employee: x.employeeName, netAmount: x.netAmount, channel: "Draft" as const, status: "Draft", voucher: undefined }));
    return [...drafts, ...posted];
  }, [ledgers.data]);
  const columns: ColumnDef<SalaryLedgerRow>[] = [
    { accessorKey: "month", header: "Month" },
    { accessorKey: "employee", header: "Employee" },
    { accessorKey: "voucher", header: "Voucher" },
    { accessorKey: "netAmount", header: "Net Amount", cell: ({ row }) => <CurrencyAmount value={row.original.netAmount} /> },
    { accessorKey: "channel", header: "Channel" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];
  return <div className="space-y-4"><PageHeader title="Salary" description="Posted salary expense ledger rows and draft payroll calculations." actions={<><AuditTrailButton /><PermissionButton asChild permission="Accounting.Create"><Link to="/salary/new"><Plus className="h-4 w-4" /> Create Salary</Link></PermissionButton></>} /><Card><CardContent className="pt-6"><DataTable data={rows} columns={columns} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} search="" onSearchChange={() => { }} onPaginationChange={() => { }} isLoading={ledgers.isLoading} isError={ledgers.isError} onRetry={() => void ledgers.refetch()} rowActions={(row) => <PermissionButton asChild permission="Accounting.Read" size="sm" variant="ghost"><Link to={`/salary/${row.id}`}>View</Link></PermissionButton>} /></CardContent></Card></div>;
}
