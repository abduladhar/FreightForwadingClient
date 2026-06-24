import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, FilePlus2, FileText, MoreHorizontal, Pencil, Plus, Printer, Receipt, RefreshCw, SlidersHorizontal, Trash2 } from "lucide-react";
import { deleteBillOfEntry, searchBillOfEntries, type BillOfEntryDto } from "@/api/billOfEntryApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { FinanceFlagCell, FinanceFlagHeader, FinanceStatusDropdown, FlagSelect, StatusSelect, toBooleanFilter, type FlagFilterValue } from "@/modules/customs/FinanceFlagControls";
import { lt } from "@/modules/operationsLocalization";

export function BillOfEntryListPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const client = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState("");
  const [boeNumber, setBoeNumber] = useState("");
  const [declarationNumber, setDeclarationNumber] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [invoiceDefined, setInvoiceDefined] = useState<FlagFilterValue>("");
  const [billDefined, setBillDefined] = useState<FlagFilterValue>("");
  const [unpaidInvoice, setUnpaidInvoice] = useState<FlagFilterValue>("");
  const [unpaidBill, setUnpaidBill] = useState<FlagFilterValue>("");
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [billStatus, setBillStatus] = useState("");

  const query = useQuery({
    queryKey: ["bill-of-entry", pageNumber, pageSize, search, status, boeNumber, declarationNumber, dateFrom, dateTo, invoiceDefined, billDefined, unpaidInvoice, unpaidBill, invoiceStatus, billStatus],
    queryFn: () => searchBillOfEntries({
      pageNumber,
      pageSize,
      search,
      status: status || undefined,
      boeNumber: boeNumber || undefined,
      declarationNumber: declarationNumber || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      invoiceDefined: toBooleanFilter(invoiceDefined),
      billDefined: toBooleanFilter(billDefined),
      unpaidInvoice: toBooleanFilter(unpaidInvoice),
      unpaidBill: toBooleanFilter(unpaidBill),
      invoiceStatus: invoiceStatus || undefined,
      billStatus: billStatus || undefined
    })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBillOfEntry,
    onSuccess: async () => {
      toast.success(lt("Bill of Entry deleted"));
      await client.invalidateQueries({ queryKey: ["bill-of-entry"] });
    }
  });

  const columns: ColumnDef<BillOfEntryDto>[] = [
    { accessorKey: "serialNo", header: lt("No") },
    { accessorKey: "boeNumber", header: lt("BOE Number") },
    { accessorKey: "declarationNumber", header: lt("Declaration Number") },
    { accessorKey: "declarationDate", header: lt("Declaration Date"), cell: ({ row }) => row.original.declarationDate?.slice(0, 10) },
    { accessorKey: "consigneeExporterName", header: lt("Consignee / Exporter") },
    { accessorKey: "warehouseName", header: lt("Warehouse") },
    { accessorKey: "warehouseLocationName", header: lt("Location") },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: "invoiceDefined", header: () => <FinanceFlagHeader label={lt("Invoice Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.invoiceDefined} /> },
    { id: "billDefined", header: () => <FinanceFlagHeader label={lt("Bill Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.billDefined} /> },
    { id: "financeStatus", header: () => <FinanceFlagHeader label={lt("Finance Status")} />, cell: ({ row }) => <FinanceStatusDropdown row={row.original} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Bill of Entry")}
        description={lt("Manage BOE declarations, inventory inbound approvals, warehouse locations, and stock state changes.")}
        actions={
          <>
            <Button variant="outline" onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button>
            <AuditTrailButton />
            <PermissionButton asChild permission="BillOfEntry.Create"><Link to="/bill-of-entry/new"><Plus className="h-4 w-4" />{lt("New BOE")}</Link></PermissionButton>
          </>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowFilters((value) => !value)}>
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? lt("Hide Filters") : lt("Show Filters")}
            </Button>
          </div>
          {showFilters ? (
            <div className="rounded-lg border bg-slate-50/60 p-3">
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                <FilterField label={lt("BOE Number")}><Input value={boeNumber} onChange={(event) => { setBoeNumber(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("Declaration Number")}><Input value={declarationNumber} onChange={(event) => { setDeclarationNumber(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("Status")}>
                  <select className="h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); setPageNumber(1); }}>
                    <option value="">{lt("All statuses")}</option>
                    {["Draft", "Submitted", "Confirmed", "Cancelled"].map((value) => <option key={value} value={value}>{lt(value)}</option>)}
                  </select>
                </FilterField>
                <FilterField label={lt("From Date")}><Input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("To Date")}><Input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPageNumber(1); }} /></FilterField>
                <FlagSelect label={lt("Invoice Defined")} value={invoiceDefined} onChange={setInvoiceDefined} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Bill Defined")} value={billDefined} onChange={setBillDefined} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Unpaid Invoice")} value={unpaidInvoice} onChange={setUnpaidInvoice} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Unpaid Bill")} value={unpaidBill} onChange={setUnpaidBill} resetPage={() => setPageNumber(1)} />
                <StatusSelect label={lt("Invoice Status")} value={invoiceStatus} onChange={setInvoiceStatus} resetPage={() => setPageNumber(1)} />
                <StatusSelect label={lt("Bill Status")} value={billStatus} onChange={setBillStatus} resetPage={() => setPageNumber(1)} />
              </div>
            </div>
          ) : null}
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search={search}
            onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
            onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => (
              <BillOfEntryActions
                row={row}
                hasPermission={hasPermission}
                onDelete={() => {
                  if (window.confirm(lt("Delete this Bill of Entry?"))) deleteMutation.mutate(row.id);
                }}
              />
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function BillOfEntryActions({ row, hasPermission, onDelete }: { row: BillOfEntryDto; hasPermission: (permission?: string | string[]) => boolean; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 gap-2 px-2"><MoreHorizontal className="h-4 w-4" /><span className="hidden sm:inline">{lt("Actions")}</span></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("BillOfEntry.Read") ? <DropdownMenuItem asChild><Link to={`/bill-of-entry/${row.id}`}><Eye className="mr-2 h-4 w-4" />{lt("View BOE")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfEntry.Read") ? <DropdownMenuItem asChild><Link to={`/bill-of-entry/${row.id}/print`} target="_blank" rel="noreferrer"><Printer className="mr-2 h-4 w-4" />{lt("Print BOE")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfEntry.Read") ? <DropdownMenuItem asChild><Link to={`/bill-of-entry/${row.id}/items/print`} target="_blank" rel="noreferrer"><Printer className="mr-2 h-4 w-4" />{lt("Print Items")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfEntry.Update") && ["Draft", "Submitted"].includes(row.status) ? <DropdownMenuItem asChild><Link to={`/bill-of-entry/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit BOE")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfEntry.StateUpdate") && row.status !== "Cancelled" ? <DropdownMenuItem asChild><Link to={`/bill-of-entry/${row.id}/state`}><FileText className="mr-2 h-4 w-4" />{lt("Update State")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Read") ? <DropdownMenuItem asChild><Link to={`/invoices?sourceType=BillOfEntry&sourceId=${row.id}`}><Receipt className="mr-2 h-4 w-4" />{lt("Show Invoices")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Create") ? <DropdownMenuItem asChild><Link to={`/invoices/new?sourceType=BillOfEntry&sourceId=${row.id}&customerId=${row.intercessorCompanyId ?? ""}`}><Plus className="mr-2 h-4 w-4" />{lt("Create Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/vendor-bills?sourceType=BillOfEntry&sourceId=${row.id}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Show Bills")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Create") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/new?sourceType=BillOfEntry&sourceId=${row.id}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Bill")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfEntry.Delete") && row.status === "Draft" ? <DropdownMenuItem onClick={onDelete}><Trash2 className="mr-2 h-4 w-4" />{lt("Delete")}</DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
