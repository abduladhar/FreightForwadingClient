import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, FilePlus2, FileText, MoreHorizontal, Pencil, Plus, Printer, Receipt, RefreshCw, SlidersHorizontal, Trash2 } from "lucide-react";
import { deleteBillOfExit, searchBillOfExits, type BillOfExitDto } from "@/api/billOfExitApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
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

export function BillOfExitListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  const [billOfEntryNumber, setBillOfEntryNumber] = useState("");
  const [declarationNumber, setDeclarationNumber] = useState("");
  const [state, setState] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [invoiceDefined, setInvoiceDefined] = useState<FlagFilterValue>("");
  const [billDefined, setBillDefined] = useState<FlagFilterValue>("");
  const [unpaidInvoice, setUnpaidInvoice] = useState<FlagFilterValue>("");
  const [unpaidBill, setUnpaidBill] = useState<FlagFilterValue>("");
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [billStatus, setBillStatus] = useState("");
  const client = useQueryClient();
  const toast = useToast();
  const { hasPermission } = useAuth();
  const query = useQuery({
    queryKey: ["bill-of-exits", pageNumber, pageSize, billOfEntryNumber, declarationNumber, state, fromDate, toDate, invoiceDefined, billDefined, unpaidInvoice, unpaidBill, invoiceStatus, billStatus],
    queryFn: () => searchBillOfExits({
      pageNumber,
      pageSize,
      billOfEntryNumber: billOfEntryNumber || undefined,
      declarationNumber: declarationNumber || undefined,
      state: state || undefined,
      declarationDateFrom: fromDate || undefined,
      declarationDateTo: toDate || undefined,
      invoiceDefined: toBooleanFilter(invoiceDefined),
      billDefined: toBooleanFilter(billDefined),
      unpaidInvoice: toBooleanFilter(unpaidInvoice),
      unpaidBill: toBooleanFilter(unpaidBill),
      invoiceStatus: invoiceStatus || undefined,
      billStatus: billStatus || undefined
    })
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBillOfExit,
    onSuccess: async () => {
      toast.success(lt("Bill of Exit deleted"));
      await client.invalidateQueries({ queryKey: ["bill-of-exits"] });
    }
  });
  const columns: ColumnDef<BillOfExitDto>[] = [
    { accessorKey: "declarationNumber", header: lt("Declaration Number") },
    { id: "billOfEntryNumbers", header: lt("BOE Number"), cell: ({ row }) => uniqueText(row.original.items.map((item) => item.billOfEntryNumber).filter(Boolean)) },
    { accessorKey: "billOfExitNumber", header: lt("Bill of Exit Number") },
    { accessorKey: "declarationDate", header: lt("Declaration Date"), cell: ({ row }) => row.original.declarationDate?.slice(0, 10) },
    { accessorKey: "warehouseName", header: lt("Warehouse") },
    { accessorKey: "warehouseLocationName", header: lt("Location") },
    { accessorKey: "intercessorCustomerName", header: lt("Customer / Intercessor") },
    { accessorKey: "currencyCode", header: lt("Currency") },
    { accessorKey: "state", header: lt("State"), cell: ({ row }) => <StatusBadge status={row.original.state} /> },
    { id: "invoiceDefined", header: () => <FinanceFlagHeader label={lt("Invoice Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.invoiceDefined} /> },
    { id: "billDefined", header: () => <FinanceFlagHeader label={lt("Bill Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.billDefined} /> },
    { id: "financeStatus", header: () => <FinanceFlagHeader label={lt("Finance Status")} />, cell: ({ row }) => <FinanceStatusDropdown row={row.original} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Bill of Exit")}
        description={lt("Outbound declarations and FIFO inventory reservations.")}
        actions={
          <>
            <Button variant="outline" onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button>
            <AuditTrailButton />
            <PermissionButton asChild permission="BillOfExit.Create"><Link to="/bill-of-exits/create"><Plus className="h-4 w-4" />{lt("New Bill of Exit")}</Link></PermissionButton>
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
                <FilterField label={lt("BOE Number")}><Input value={billOfEntryNumber} onChange={(event) => { setBillOfEntryNumber(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("Declaration Number")}><Input value={declarationNumber} onChange={(event) => { setDeclarationNumber(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("Status")}>
                  <select className="h-10 w-full rounded-md border px-3 text-sm" value={state} onChange={(event) => { setState(event.target.value); setPageNumber(1); }}>
                    <option value="">{lt("All statuses")}</option>
                    {["Created", "PendingApproval", "Approved", "Rejected", "Cancelled"].map((value) => <option key={value} value={value}>{lt(value)}</option>)}
                  </select>
                </FilterField>
                <FilterField label={lt("From Date")}><Input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("To Date")}><Input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPageNumber(1); }} /></FilterField>
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
            search={billOfEntryNumber}
            searchPlaceholder={lt("BOE Number")}
            onSearchChange={(value) => { setBillOfEntryNumber(value); setPageNumber(1); }}
            onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => <RowActions row={row} hasPermission={hasPermission} onDelete={() => deleteMutation.mutate(row.id)} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function uniqueText(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean))).join(", ");
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function RowActions({ row, hasPermission, onDelete }: { row: BillOfExitDto; hasPermission: (permission?: string | string[]) => boolean; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("BillOfExit.Read") ? <DropdownMenuItem asChild><Link to={`/bill-of-exits/${row.id}`}><Eye className="mr-2 h-4 w-4" />{lt("View")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfExit.Read") ? <DropdownMenuItem asChild><Link to={`/bill-of-exits/${row.id}/print`} target="_blank" rel="noreferrer"><Printer className="mr-2 h-4 w-4" />{lt("Print Bill of Exit")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfExit.Read") ? <DropdownMenuItem asChild><Link to={`/bill-of-exits/${row.id}/items/print`} target="_blank" rel="noreferrer"><Printer className="mr-2 h-4 w-4" />{lt("Print Items")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfExit.Update") && row.state !== "Approved" ? <DropdownMenuItem asChild><Link to={`/bill-of-exits/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfExit.StateUpdate") && ["Created", "PendingApproval", "Approved"].includes(row.state) ? <DropdownMenuItem asChild><Link to={`/bill-of-exits/${row.id}/state`}><FileText className="mr-2 h-4 w-4" />{lt("Update State")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Read") ? <DropdownMenuItem asChild><Link to={`/invoices?sourceType=BillOfExit&sourceId=${row.id}`}><Receipt className="mr-2 h-4 w-4" />{lt("Show Invoices")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Create") ? <DropdownMenuItem asChild><Link to={`/invoices/new?sourceType=BillOfExit&sourceId=${row.id}&customerId=${row.intercessorCustomerId ?? ""}`}><Plus className="mr-2 h-4 w-4" />{lt("Create Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/vendor-bills?sourceType=BillOfExit&sourceId=${row.id}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Show Bills")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Create") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/new?sourceType=BillOfExit&sourceId=${row.id}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Bill")}</Link></DropdownMenuItem> : null}
        {hasPermission("BillOfExit.Delete") && row.state !== "Approved" ? <DropdownMenuItem onClick={() => { if (window.confirm(lt("Delete this Bill of Exit?"))) onDelete(); }}><Trash2 className="mr-2 h-4 w-4" />{lt("Delete")}</DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
