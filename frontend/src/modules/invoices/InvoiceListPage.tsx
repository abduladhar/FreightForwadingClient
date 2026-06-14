import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, FilePlus2, Eye, Mail, MoreHorizontal, Pencil, Plus, Printer, XCircle } from "lucide-react";
import { approveInvoice, cancelInvoice, searchInvoices, sendInvoiceEmail, type InvoiceDto } from "@/api/invoiceApi";
import { getTenantCurrencies } from "@/api/currencyApi";
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
import { lt } from "@/modules/operationsLocalization";

export function InvoiceListPage() {
  const [searchParams] = useSearchParams();
  const sourceType = searchParams.get("sourceType") ?? undefined;
  const sourceId = searchParams.get("sourceId") ?? undefined;
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const currencies = useQuery({ queryKey: ["tenant-currencies", "invoice-list"], queryFn: getTenantCurrencies });
  const query = useQuery({
    queryKey: ["invoices", pageNumber, pageSize, search, sourceType, sourceId],
    queryFn: () => searchInvoices({ pageNumber, pageSize, search, sourceType, sourceId })
  });
  useEffect(() => {
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void query.refetch();
    };
    window.addEventListener("invoices:refresh", refresh);
    return () => window.removeEventListener("invoices:refresh", refresh);
  }, [query, queryClient]);
  const approve = useMutation({ mutationFn: approveInvoice, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["invoices"] }) });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelInvoice(id, reason), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["invoices"] }) });
  const createInvoicePath = sourceType && sourceId ? `/invoices/new?sourceType=${encodeURIComponent(sourceType)}&sourceId=${encodeURIComponent(sourceId)}` : "/invoices/new";
  const description = sourceType && sourceId
    ? `${lt("Customer invoices linked to")} ${displaySourceType(sourceType)}.`
    : lt("Customer invoices with approval, printing, and email delivery.");
  const columns: ColumnDef<InvoiceDto>[] = [
    { accessorKey: "invoiceNumber", header: lt("Invoice No") },
    { accessorKey: "billToPartyName", header: lt("Bill To"), cell: ({ row }) => `${row.original.billToPartyName || row.original.customerId} (${lt(row.original.billToPartyType || "Customer")})` },
    { accessorKey: "sourceReferenceNo", header: lt("Source Reference No") },
    { accessorKey: "invoiceDate", header: lt("Invoice Date") },
    { accessorKey: "dueDate", header: lt("Due Date") },
    { accessorKey: "sourceType", header: lt("Source"), cell: ({ row }) => displaySourceType(row.original.sourceType) },
    { accessorKey: "totalAmount", header: lt("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCode(currencies.data, row.original.invoiceCurrencyId)} /> },
    { accessorKey: "outstandingAmount", header: lt("Outstanding"), cell: ({ row }) => <CurrencyAmount value={row.original.outstandingAmount} currency={currencyCode(currencies.data, row.original.invoiceCurrencyId)} /> },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];

  return <div className="space-y-4"><PageHeader title={lt("Customer Invoices")} description={description} actions={<><AuditTrailButton /><PermissionButton asChild permission="Invoice.Create"><Link to="/invoices/new?sourceType=Custom"><FilePlus2 className="h-4 w-4" />{lt("Custom Invoice")}</Link></PermissionButton><PermissionButton asChild permission="Invoice.Create"><Link to={createInvoicePath}><Plus className="h-4 w-4" />{lt("New Invoice")}</Link></PermissionButton></>} />{sourceType && sourceId ? <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">{lt("Showing invoices for")} <span className="font-semibold">{displaySourceType(sourceType)}</span>. <Link className="underline" to="/invoices">{lt("Clear filter")}</Link></div> : null}<Card><CardContent className="pt-6"><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <InvoiceActions row={row} hasPermission={hasPermission} approve={() => void approve.mutateAsync(row.id)} cancel={async () => { await cancel.mutateAsync({ id: row.id, reason: "Cancelled from list action" }); }} />} /></CardContent></Card></div>;
}

function InvoiceActions({ row, hasPermission, approve, cancel }: { row: InvoiceDto; hasPermission: (permission?: string | string[]) => boolean; approve: () => void; cancel: () => Promise<void> }) {
  const noteUrl = `/credit-debit-notes/new?partyType=${encodeURIComponent(row.billToPartyType || "Customer")}&partyId=${encodeURIComponent(row.billToPartyId || row.customerId)}&partyName=${encodeURIComponent(row.billToPartyName || "")}&sourceType=Invoice&sourceId=${encodeURIComponent(row.id)}&sourceReferenceNo=${encodeURIComponent(row.invoiceNumber)}&partyCurrencyId=${encodeURIComponent(row.customerCurrencyId)}&noteCurrencyId=${encodeURIComponent(row.invoiceCurrencyId)}&exchangeRate=${encodeURIComponent(String(row.exchangeRate))}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2"><MoreHorizontal className="h-4 w-4" /><span className="hidden sm:inline">{lt("Actions")}</span></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("Invoice.Read") ? <DropdownMenuItem asChild><Link to={`/invoices/${row.id}`}><Eye className="mr-2 h-4 w-4" />{lt("View Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Update") ? <DropdownMenuItem asChild><Link to={`/invoices/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Print") ? <DropdownMenuItem asChild><Link to={`/invoices/${row.id}/print`}><Printer className="mr-2 h-4 w-4" />{lt("Print Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Export") ? <DropdownMenuItem asChild><Link to={`/invoices/${row.id}/email`}><Mail className="mr-2 h-4 w-4" />{lt("Email Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("CreditDebitNote.Create") ? <DropdownMenuItem asChild><Link to={`${noteUrl}&noteType=${encodeURIComponent("Credit Note")}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Credit Note")}</Link></DropdownMenuItem> : null}
        {hasPermission("CreditDebitNote.Create") ? <DropdownMenuItem asChild><Link to={`${noteUrl}&noteType=${encodeURIComponent("Debit Note")}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Debit Note")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Approve") ? <DropdownMenuItem onSelect={(event) => { event.preventDefault(); approve(); }}><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />{lt("Approve")}</DropdownMenuItem> : null}
        {hasPermission("Invoice.Cancel") ? <ConfirmDialog title={lt("Cancel invoice?")} description={row.invoiceNumber} confirmText={lt("Cancel Invoice")} variant="danger" onConfirm={cancel}><DropdownMenuItem onSelect={(event) => event.preventDefault()}><XCircle className="mr-2 h-4 w-4 text-red-600" />{lt("Cancel")}</DropdownMenuItem></ConfirmDialog> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function currencyCode(currencies: Awaited<ReturnType<typeof getTenantCurrencies>> | undefined, currencyId: string) {
  return currencies?.find((currency) => currency.currencyId === currencyId)?.currencyCode ?? "USD";
}

function displaySourceType(sourceType?: string | null) {
  if (!sourceType) return "-";
  switch (sourceType) {
    case "HouseShipment":
      return lt("House Shipment");
    case "MasterShipment":
      return lt("Master Shipment");
    case "DirectShipment":
      return lt("Direct Shipment");
    case "Pickup":
      return lt("Pickup");
    case "GoodsReceipt":
      return lt("Goods Receipt Note");
    case "Quotation":
      return lt("Quotation");
    case "CustomsClearance":
      return lt("Customs Clearance");
    case "Job":
      return lt("Job");
    case "Custom":
      return lt("Custom");
    default:
      return sourceType;
  }
}
