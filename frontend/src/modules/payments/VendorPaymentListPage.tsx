import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Eye, ListChecks, Pencil, Plus, Settings2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { approvePayment, cancelPayment, searchPayments, type VendorPaymentDto } from "@/api/paymentApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function VendorPaymentListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["vendor-payments", pageNumber, pageSize, search], queryFn: () => searchPayments({ pageNumber, pageSize, search }) });
  useEffect(() => {
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      void query.refetch();
    };
    window.addEventListener("vendor-payments:refresh", refresh);
    return () => window.removeEventListener("vendor-payments:refresh", refresh);
  }, [query, queryClient]);
  const approve = useMutation({ mutationFn: approvePayment, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["vendor-payments"] }) });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelPayment(id, reason), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["vendor-payments"] }) });
  const columns: ColumnDef<VendorPaymentDto>[] = [
    { accessorKey: "paymentNumber", header: lt("Payment No") },
    { accessorKey: "paymentDate", header: lt("Date") },
    { accessorKey: "paymentAmount", header: lt("Amount"), cell: ({ row }) => <CurrencyAmount value={row.original.paymentAmount} /> },
    { accessorKey: "bankCharges", header: lt("Bank Charges"), cell: ({ row }) => <CurrencyAmount value={row.original.bankCharges} /> },
    { accessorKey: "exchangeGainAmount", header: lt("Exchange Gain"), cell: ({ row }) => <CurrencyAmount value={row.original.exchangeGainAmount} /> },
    { accessorKey: "exchangeLossAmount", header: lt("Exchange Loss"), cell: ({ row }) => <CurrencyAmount value={row.original.exchangeLossAmount} /> },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];
  return <div className="space-y-4"><PageHeader title={lt("Vendor Payments")} description={lt("Money paid to vendors, with bill allocation, approval, and voucher print.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Payment.Create"><Link to="/payments/bulk"><ListChecks className="h-4 w-4" />{lt("Pay Multiple")}</Link></PermissionButton><PermissionButton asChild permission="Payment.Create"><Link to="/payments/new"><Plus className="h-4 w-4" />{lt("New Payment")}</Link></PermissionButton></>} /><Card><CardContent className="pt-6"><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <div className="flex items-center gap-1"><PermissionButton asChild permission="Payment.Read" size="sm" variant="ghost"><Link to={`/payments/${row.id}`} title={lt("View")}><Eye className="h-4 w-4" /></Link></PermissionButton><PermissionButton asChild permission="Payment.Update" size="sm" variant="ghost"><Link to={`/payments/${row.id}/edit`} title={lt("Edit")}><Pencil className="h-4 w-4" /></Link></PermissionButton><PermissionButton asChild permission="Payment.Update" size="sm" variant="ghost"><Link to={`/payments/${row.id}/allocation`} title={lt("Allocation")}><Settings2 className="h-4 w-4" /></Link></PermissionButton>{hasPermission("Payment.Approve") ? <Button size="sm" variant="ghost" title={lt("Approve")} onClick={() => void approve.mutateAsync(row.id)}><CheckCircle2 className="h-4 w-4 text-emerald-600" /></Button> : null}{hasPermission("Payment.Cancel") ? <ConfirmDialog title={lt("Cancel payment?")} description={row.paymentNumber} confirmText={lt("Cancel Payment")} variant="danger" onConfirm={async () => { await cancel.mutateAsync({ id: row.id, reason: "Cancelled from list action" }); }}><Button size="sm" variant="ghost" title={lt("Cancel")}><XCircle className="h-4 w-4 text-red-600" /></Button></ConfirmDialog> : null}</div>} /></CardContent></Card></div>;
}
