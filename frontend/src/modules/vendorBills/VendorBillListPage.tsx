import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, FilePlus2, MoreHorizontal, Pencil, Plus, Scale, XCircle } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { approveVendorBill, cancelVendorBill, searchVendorBills, type VendorBillDto } from "@/api/vendorBillApi";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { lt } from "@/modules/operationsLocalization";

export function VendorBillListPage() {
  const paging = useCursorPagination(25);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const sourceType = searchParams.get("sourceType") ?? undefined;
  const sourceId = searchParams.get("sourceId") ?? undefined;
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const currencies = useQuery({ queryKey: ["tenant-currencies", "vendor-bill-list"], queryFn: getTenantCurrencies });
  const currencyCodes = new Map((currencies.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode]));
  const query = useQuery({ queryKey: ["vendor-bills", paging.pageNumber, paging.pageSize, paging.cursor, search, sourceType, sourceId], queryFn: () => searchVendorBills({ pageNumber: paging.pageNumber, pageSize: paging.pageSize, cursor: paging.cursor, search, sourceType, sourceId }) });
  useEffect(() => {
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
      void query.refetch();
    };
    window.addEventListener("vendor-bills:refresh", refresh);
    return () => window.removeEventListener("vendor-bills:refresh", refresh);
  }, [query, queryClient]);
  const approve = useMutation({ mutationFn: approveVendorBill, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["vendor-bills"] }) });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelVendorBill(id, reason), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["vendor-bills"] }) });
  const columns: ColumnDef<VendorBillDto>[] = [
    { accessorKey: "vendorBillNumber", header: lt("Vendor Bill No") },
    { accessorKey: "payToPartyName", header: lt("Pay To"), cell: ({ row }) => <div><div className="font-medium">{row.original.payToPartyName || row.original.vendorId}</div><div className="text-xs text-muted-foreground">{lt(row.original.payToPartyType || "Vendor")}</div></div> },
    { accessorKey: "billDate", header: lt("Bill Date") },
    { accessorKey: "dueDate", header: lt("Due Date") },
    { accessorKey: "sourceType", header: lt("Source"), cell: ({ row }) => <div><div>{displaySourceType(row.original.sourceType)}</div><div className="text-xs text-muted-foreground">{row.original.sourceReferenceNo || "-"}</div></div> },
    { id: "currency", header: lt("Currency"), cell: ({ row }) => currencyCodes.get(row.original.billCurrencyId) ?? "-" },
    { accessorKey: "totalAmount", header: lt("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCodes.get(row.original.billCurrencyId)} /> },
    { accessorKey: "outstandingAmount", header: lt("Outstanding"), cell: ({ row }) => <CurrencyAmount value={row.original.outstandingAmount} currency={currencyCodes.get(row.original.billCurrencyId)} /> },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];
  const createBillPath = sourceType && sourceId ? `/vendor-bills/new?sourceType=${encodeURIComponent(sourceType)}&sourceId=${encodeURIComponent(sourceId)}` : "/vendor-bills/new";
  const description = sourceType && sourceId ? `${lt("Vendor bills linked to")} ${displaySourceType(sourceType)}.` : lt("Vendor bill processing with expected-cost review and approvals.");
  return <div className="space-y-4"><PageHeader title={lt("Vendor Bills")} description={description} actions={<><AuditTrailButton /><PermissionButton asChild permission="VendorBill.Create"><Link to={createBillPath}><Plus className="h-4 w-4" />{lt("New Vendor Bill")}</Link></PermissionButton></>} />{sourceType && sourceId ? <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">{lt("Showing bills for")} <span className="font-semibold">{displaySourceType(sourceType)}</span>. <Link className="underline" to="/vendor-bills">{lt("Clear filter")}</Link></div> : null}<Card><CardContent className="pt-6"><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={paging.pageNumber} pageSize={query.data?.pageSize ?? paging.pageSize} search={search} onSearchChange={(value) => { setSearch(value); paging.reset(); }} onPaginationChange={(_, ps) => paging.setPageSize(ps)} paginationMode="cursor" nextCursor={query.data?.nextCursor} canPreviousCursorPage={paging.canPrevious} onNextCursorPage={() => paging.next(query.data?.nextCursor)} onPreviousCursorPage={paging.previous} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <VendorBillActions row={row} hasPermission={hasPermission} approve={() => void approve.mutateAsync(row.id)} cancel={async () => { await cancel.mutateAsync({ id: row.id, reason: "Cancelled from list action" }); }} />} /></CardContent></Card></div>;
}

function VendorBillActions({ row, hasPermission, approve, cancel }: { row: VendorBillDto; hasPermission: (permission?: string | string[]) => boolean; approve: () => void; cancel: () => Promise<void> }) {
  const noteUrl = `/credit-debit-notes/new?partyType=${encodeURIComponent((row.payToPartyType || "Vendor") as string)}&partyId=${encodeURIComponent(row.payToPartyId || row.vendorId)}&partyName=${encodeURIComponent(row.payToPartyName || "")}&sourceType=VendorBill&sourceId=${encodeURIComponent(row.id)}&sourceReferenceNo=${encodeURIComponent(row.vendorBillNumber)}&partyCurrencyId=${encodeURIComponent(row.vendorCurrencyId)}&noteCurrencyId=${encodeURIComponent(row.billCurrencyId)}&exchangeRate=${encodeURIComponent(String(row.exchangeRate))}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2"><MoreHorizontal className="h-4 w-4" /><span className="hidden sm:inline">{lt("Actions")}</span></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/${row.id}`}><Eye className="mr-2 h-4 w-4" />{lt("View Bill")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Update") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit Bill")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/${row.id}/expected-cost`}><Scale className="mr-2 h-4 w-4" />{lt("Expected Cost")}</Link></DropdownMenuItem> : null}
        {hasPermission("CreditDebitNote.Create") ? <DropdownMenuItem asChild><Link to={`${noteUrl}&noteType=${encodeURIComponent("Credit Note")}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Credit Note")}</Link></DropdownMenuItem> : null}
        {hasPermission("CreditDebitNote.Create") ? <DropdownMenuItem asChild><Link to={`${noteUrl}&noteType=${encodeURIComponent("Debit Note")}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Debit Note")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Approve") ? <DropdownMenuItem onSelect={(event) => { event.preventDefault(); approve(); }}><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />{lt("Approve")}</DropdownMenuItem> : null}
        {hasPermission("VendorBill.Cancel") ? <ConfirmDialog title={lt("Cancel vendor bill?")} description={row.vendorBillNumber} confirmText={lt("Cancel Bill")} variant="danger" onConfirm={cancel}><DropdownMenuItem onSelect={(event) => event.preventDefault()}><XCircle className="mr-2 h-4 w-4 text-red-600" />{lt("Cancel")}</DropdownMenuItem></ConfirmDialog> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function displaySourceType(sourceType?: string | null) {
  if (!sourceType) return "-";
  switch (sourceType) {
    case "GoodsReceipt":
      return lt("Goods Receipt Note");
    case "HouseShipment":
      return lt("House Shipment");
    case "MasterShipment":
      return lt("Master Shipment");
    case "DirectShipment":
      return lt("Direct Shipment");
    case "CustomsClearance":
      return lt("Customs Clearance");
    case "BillOfEntry":
      return lt("Bill of Entry");
    case "BillOfExit":
      return lt("Bill of Exit");
    case "WarehouseService":
      return lt("Warehouse Service");
    case "TransportationService":
      return lt("Transportation Service");
    default:
      return lt(sourceType);
  }
}
