import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Eye, Pencil, Plus, Printer, Settings2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrencies } from "@/api/currencyApi";
import { approveReceipt, cancelReceipt, searchReceipts, type CustomerReceiptDto } from "@/api/receiptApi";
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

export function CustomerReceiptListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["customer-receipts", pageNumber, pageSize, search], queryFn: () => searchReceipts({ pageNumber, pageSize, search }) });
  const currencies = useQuery({ queryKey: ["receipt-currencies"], queryFn: getCurrencies });
  const currencyCode = (currencyId: string) => currencies.data?.find((currency) => currency.id === currencyId)?.currencyCode;
  useEffect(() => {
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ["customer-receipts"] });
      void query.refetch();
    };
    window.addEventListener("customer-receipts:refresh", refresh);
    return () => window.removeEventListener("customer-receipts:refresh", refresh);
  }, [query, queryClient]);
  const approve = useMutation({ mutationFn: approveReceipt, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["customer-receipts"] }) });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelReceipt(id, reason), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["customer-receipts"] }) });
  const columns: ColumnDef<CustomerReceiptDto>[] = [
    { accessorKey: "receiptNumber", header: lt("Receipt No") },
    { accessorKey: "receivedFromPartyName", header: lt("Received From"), cell: ({ row }) => <div><div className="font-medium">{row.original.receivedFromPartyName || row.original.customerId}</div><div className="text-xs text-muted-foreground">{lt(row.original.receivedFromPartyType || "Customer")}</div></div> },
    { accessorKey: "receiptDate", header: lt("Date") },
    { accessorKey: "receiptAmount", header: lt("Amount"), cell: ({ row }) => <CurrencyAmount value={row.original.receiptAmount} currency={currencyCode(row.original.receiptCurrencyId)} /> },
    { accessorKey: "bankCharges", header: lt("Bank Charges"), cell: ({ row }) => <CurrencyAmount value={row.original.bankCharges} currency={currencyCode(row.original.receiptCurrencyId)} /> },
    { accessorKey: "exchangeGainAmount", header: lt("Exchange Gain"), cell: ({ row }) => <CurrencyAmount value={row.original.exchangeGainAmount} currency={currencyCode(row.original.baseCurrencyId)} /> },
    { accessorKey: "exchangeLossAmount", header: lt("Exchange Loss"), cell: ({ row }) => <CurrencyAmount value={row.original.exchangeLossAmount} currency={currencyCode(row.original.baseCurrencyId)} /> },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];
  return <div className="space-y-4"><PageHeader title={lt("Customer Receipts")} description={lt("Money received from customers, vendors, agents, or carriers, with invoice allocation, approval, and voucher print.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Receipt.Create"><Link to="/receipts/new"><Plus className="h-4 w-4" />{lt("New Receipt")}</Link></PermissionButton></>} /><Card><CardContent className="pt-6"><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <div className="flex items-center gap-1"><PermissionButton asChild permission="Receipt.Read" size="sm" variant="ghost"><Link to={`/receipts/${row.id}`} title={lt("View")}><Eye className="h-4 w-4" /></Link></PermissionButton><PermissionButton asChild permission="Receipt.Update" size="sm" variant="ghost"><Link to={`/receipts/${row.id}/edit`} title={lt("Edit")}><Pencil className="h-4 w-4" /></Link></PermissionButton><PermissionButton asChild permission="Receipt.Update" size="sm" variant="ghost"><Link to={`/receipts/${row.id}/allocation`} title={lt("Allocation")}><Settings2 className="h-4 w-4" /></Link></PermissionButton><PermissionButton asChild permission="Receipt.Print" size="sm" variant="ghost"><Link to={`/receipts/${row.id}/print`} title={lt("Print Receipt")}><Printer className="h-4 w-4" /></Link></PermissionButton>{hasPermission("Receipt.Approve") ? <Button size="sm" variant="ghost" title={lt("Approve")} onClick={() => void approve.mutateAsync(row.id)}><CheckCircle2 className="h-4 w-4 text-emerald-600" /></Button> : null}{hasPermission("Receipt.Cancel") ? <ConfirmDialog title={lt("Cancel receipt?")} description={row.receiptNumber} confirmText={lt("Cancel Receipt")} variant="danger" onConfirm={async () => { await cancel.mutateAsync({ id: row.id, reason: "Cancelled from list action" }); }}><Button size="sm" variant="ghost" title={lt("Cancel")}><XCircle className="h-4 w-4 text-red-600" /></Button></ConfirmDialog> : null}</div>} /></CardContent></Card></div>;
}
