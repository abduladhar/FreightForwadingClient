import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, FilePlus2, FileText, MoreHorizontal, Pencil, Plus, Printer, ScrollText, SlidersHorizontal, TrendingUp } from "lucide-react";
import { searchDirectShipments, type DirectShipmentDto } from "@/api/directShipmentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { lt } from "@/modules/operationsLocalization";

type FlagFilterValue = "" | "true" | "false";

export function DirectShipmentListPage() {
  const paging = useCursorPagination(25);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [customer, setCustomer] = useState("");
  const [houseWaybillNo, setHouseWaybillNo] = useState("");
  const [consigneeName, setConsigneeName] = useState("");
  const [shipperName, setShipperName] = useState("");
  const [originPort, setOriginPort] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [consigneePhoneNo, setConsigneePhoneNo] = useState("");
  const [shipperPhoneNo, setShipperPhoneNo] = useState("");
  const [invoiceDefined, setInvoiceDefined] = useState<FlagFilterValue>("");
  const [billDefined, setBillDefined] = useState<FlagFilterValue>("");
  const [unpaidInvoice, setUnpaidInvoice] = useState<FlagFilterValue>("");
  const [unpaidBill, setUnpaidBill] = useState<FlagFilterValue>("");
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [billStatus, setBillStatus] = useState("");
  const { hasPermission } = useAuth();

  const query = useQuery({
    queryKey: ["direct-shipments", paging.pageNumber, paging.pageSize, paging.cursor, search, customer, houseWaybillNo, consigneeName, shipperName, originPort, destinationPort, consigneePhoneNo, shipperPhoneNo, invoiceDefined, billDefined, unpaidInvoice, unpaidBill, invoiceStatus, billStatus],
    queryFn: () => searchDirectShipments({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      cursor: paging.cursor,
      search,
      customer: customer || undefined,
      houseWaybillNo: houseWaybillNo || undefined,
      consigneeName: consigneeName || undefined,
      shipperName: shipperName || undefined,
      originPort: originPort || undefined,
      destinationPort: destinationPort || undefined,
      consigneePhoneNo: consigneePhoneNo || undefined,
      shipperPhoneNo: shipperPhoneNo || undefined,
      invoiceDefined: toBooleanFilter(invoiceDefined),
      billDefined: toBooleanFilter(billDefined),
      unpaidInvoice: toBooleanFilter(unpaidInvoice),
      unpaidBill: toBooleanFilter(unpaidBill),
      invoiceStatus: invoiceStatus || undefined,
      billStatus: billStatus || undefined
    })
  });

  const columns: ColumnDef<DirectShipmentDto>[] = [
    { accessorKey: "directShipmentNumber", header: lt("Shipment No") },
    { accessorKey: "mawbNumber", header: lt("Waybill No") },
    { accessorKey: "customerName", header: lt("Customer") },
    { accessorKey: "modeOfTransport", header: lt("Mode") },
    { accessorKey: "originPortName", header: lt("Origin Port") },
    { accessorKey: "destinationPortName", header: lt("Destination Port") },
    { accessorKey: "consigneeName", header: lt("Consignee") },
    { accessorKey: "shipperName", header: lt("Shipper") },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: "invoiceDefined", header: () => <FinanceFlagHeader label={lt("Invoice Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.invoiceDefined} /> },
    { id: "billDefined", header: () => <FinanceFlagHeader label={lt("Bill Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.billDefined} /> },
    { id: "financeStatus", header: () => <FinanceFlagHeader label={lt("Finance Status")} />, cell: ({ row }) => <FinanceStatusDropdown row={row.original} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Direct Shipments")} description={lt("Create and manage direct shipments without house/master consolidation.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="DirectShipment.Create"><Link to="/direct-shipments/new"><Plus className="h-4 w-4" />{lt("New Direct Shipment")}</Link></PermissionButton></>} />
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
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                <FilterField label={lt("Waybill No")}><Input value={houseWaybillNo} placeholder={lt("Master/house waybill")} onChange={(event) => { setHouseWaybillNo(event.target.value); paging.reset(); }} /></FilterField>
                <FilterField label={lt("Customer")}><Input value={customer} placeholder={lt("Customer name/code")} onChange={(event) => { setCustomer(event.target.value); paging.reset(); }} /></FilterField>
                <FilterField label={lt("Consignee")}><Input value={consigneeName} placeholder={lt("Consignee name")} onChange={(event) => { setConsigneeName(event.target.value); paging.reset(); }} /></FilterField>
                <FilterField label={lt("Shipper")}><Input value={shipperName} placeholder={lt("Shipper name")} onChange={(event) => { setShipperName(event.target.value); paging.reset(); }} /></FilterField>
                <FilterField label={lt("Origin Port")}><Input value={originPort} placeholder={lt("Origin port")} onChange={(event) => { setOriginPort(event.target.value); paging.reset(); }} /></FilterField>
                <FilterField label={lt("Destination Port")}><Input value={destinationPort} placeholder={lt("Destination port")} onChange={(event) => { setDestinationPort(event.target.value); paging.reset(); }} /></FilterField>
                <FilterField label={lt("Consignee Phone")}><Input value={consigneePhoneNo} placeholder={lt("Phone no")} onChange={(event) => { setConsigneePhoneNo(event.target.value); paging.reset(); }} /></FilterField>
                <FilterField label={lt("Shipper Phone")}><Input value={shipperPhoneNo} placeholder={lt("Phone no")} onChange={(event) => { setShipperPhoneNo(event.target.value); paging.reset(); }} /></FilterField>
                <FlagSelect label={lt("Invoice Defined")} value={invoiceDefined} onChange={setInvoiceDefined} resetPage={paging.reset} />
                <FlagSelect label={lt("Bill Defined")} value={billDefined} onChange={setBillDefined} resetPage={paging.reset} />
                <FlagSelect label={lt("Unpaid Invoice")} value={unpaidInvoice} onChange={setUnpaidInvoice} resetPage={paging.reset} />
                <FlagSelect label={lt("Unpaid Bill")} value={unpaidBill} onChange={setUnpaidBill} resetPage={paging.reset} />
                <StatusSelect label={lt("Invoice Status")} value={invoiceStatus} onChange={setInvoiceStatus} resetPage={paging.reset} />
                <StatusSelect label={lt("Bill Status")} value={billStatus} onChange={setBillStatus} resetPage={paging.reset} />
              </div>
            </div>
          ) : null}
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={paging.pageNumber}
            pageSize={query.data?.pageSize ?? paging.pageSize}
            search={search}
            onSearchChange={(value) => { setSearch(value); paging.reset(); }}
            onPaginationChange={(_, ps) => paging.setPageSize(ps)}
            paginationMode="cursor"
            nextCursor={query.data?.nextCursor}
            canPreviousCursorPage={paging.canPrevious}
            onNextCursorPage={() => paging.next(query.data?.nextCursor)}
            onPreviousCursorPage={paging.previous}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => <DirectShipmentActions row={row} hasPermission={hasPermission} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DirectShipmentActions({ row, hasPermission }: { row: DirectShipmentDto; hasPermission: (permission?: string | string[]) => boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{lt("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("DirectShipment.Read") ? <DropdownMenuItem asChild><Link to={`/direct-shipments/${row.id}`}><Eye className="mr-2 h-4 w-4" />{lt("View Shipment")}</Link></DropdownMenuItem> : null}
        {hasPermission("DirectShipment.Update") ? <DropdownMenuItem asChild><Link to={`/direct-shipments/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit Shipment")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Read") ? <DropdownMenuItem asChild><Link to={`/direct-shipments/${row.id}/invoices`}><FileText className="mr-2 h-4 w-4" />{lt("Show Invoices")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Create") ? <DropdownMenuItem asChild><Link to={`/invoices/new?sourceType=DirectShipment&sourceId=${encodeURIComponent(row.id)}&customerId=${encodeURIComponent(row.customerId)}`}><Plus className="mr-2 h-4 w-4" />{lt("Create Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/direct-shipments/${row.id}/bills`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Show Bills")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Create") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/new?sourceType=DirectShipment&sourceId=${encodeURIComponent(row.id)}&expectedCostAmount=${row.costAmount ?? 0}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Bill")}</Link></DropdownMenuItem> : null}
        {hasPermission("DirectShipment.Print") ? <DropdownMenuItem asChild><Link to={`/direct-shipments/${row.id}/note`}><ScrollText className="mr-2 h-4 w-4" />{lt("Print Receipt")}</Link></DropdownMenuItem> : null}
        {hasPermission("DirectShipment.Print") ? <DropdownMenuItem asChild><Link to={`/direct-shipments/${row.id}/label`}><Printer className="mr-2 h-4 w-4" />{lt("Print Label")}</Link></DropdownMenuItem> : null}
        {hasPermission("DirectShipment.Read") ? <DropdownMenuItem asChild><Link to={`/direct-shipments/${row.id}/profit`}><TrendingUp className="mr-2 h-4 w-4" />{lt("Profit Preview")}</Link></DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FinanceStatusDropdown({ row }: { row: DirectShipmentDto }) {
  const hasWarning = row.invoiceCancelled || row.billCancelled || row.pendingInvoicePostingCount > 0 || row.pendingBillPostingCount > 0 || row.unpaidInvoiceCount > 0 || row.unpaidBillCount > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 px-2"><Badge tone={hasWarning ? "amber" : "green"}>{hasWarning ? lt("Review") : lt("Clear")}</Badge></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{lt("Finance Status")}</div>
          <div className="space-y-1 rounded-md bg-slate-50 p-2">
            <FinanceStatusRow label={lt("Invoice Fully Received")} value={<FinanceFlagCell active={row.invoiceFullyReceived} compact />} />
            <FinanceStatusRow label={lt("Bill Fully Paid")} value={<FinanceFlagCell active={row.billFullyPaid} compact />} />
            <FinanceStatusRow label={lt("Invoice Cancelled")} value={<FinanceFlagCell active={row.invoiceCancelled} warning compact />} />
            <FinanceStatusRow label={lt("Bill Cancelled")} value={<FinanceFlagCell active={row.billCancelled} warning compact />} />
            <FinanceStatusRow label={lt("Pending Invoice To Post")} value={<PostingCount value={row.pendingInvoicePostingCount} compact />} />
            <FinanceStatusRow label={lt("Pending Bill To Post")} value={<PostingCount value={row.pendingBillPostingCount} compact />} />
            <FinanceStatusRow label={lt("Unpaid Invoice")} value={<PostingCount value={row.unpaidInvoiceCount} compact />} />
            <FinanceStatusRow label={lt("Unpaid Bill")} value={<PostingCount value={row.unpaidBillCount} compact />} />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function toBooleanFilter(value: FlagFilterValue) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function FinanceFlagHeader({ label }: { label: string }) {
  return <span className="block min-w-24 whitespace-normal text-center leading-snug">{label}</span>;
}

function FinanceFlagCell({ active, warning = false, compact = false }: { active: boolean; warning?: boolean; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={active ? (warning ? "red" : "green") : "slate"}>{active ? lt("Yes") : lt("No")}</Badge></div>;
}

function PostingCount({ value, compact = false }: { value: number; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={value > 0 ? "amber" : "slate"}>{value}</Badge></div>;
}

function FinanceStatusRow({ label, value }: { label: string; value: ReactNode }) {
  return <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs"><span className="text-slate-600">{label}</span>{value}</div>;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function FlagSelect({ label, value, onChange, resetPage }: { label: string; value: FlagFilterValue; onChange: (value: FlagFilterValue) => void; resetPage: () => void }) {
  return (
    <FilterField label={label}>
      <select className="h-10 w-full rounded-md border px-3 text-sm" value={value} onChange={(event) => { onChange(event.target.value as FlagFilterValue); resetPage(); }}>
        <option value="">{lt("All")}</option>
        <option value="true">{lt("Yes")}</option>
        <option value="false">{lt("No")}</option>
      </select>
    </FilterField>
  );
}

function StatusSelect({ label, value, onChange, resetPage }: { label: string; value: string; onChange: (value: string) => void; resetPage: () => void }) {
  return (
    <FilterField label={label}>
      <select className="h-10 w-full rounded-md border px-3 text-sm" value={value} onChange={(event) => { onChange(event.target.value); resetPage(); }}>
        <option value="">{lt("All")}</option>
        <option value="Draft">{lt("Draft")}</option>
        <option value="Approved">{lt("Approved")}</option>
        <option value="Sent">{lt("Sent")}</option>
        <option value="Partially Paid">{lt("Partially Paid")}</option>
        <option value="Paid">{lt("Paid")}</option>
        <option value="Cancelled">{lt("Cancelled")}</option>
      </select>
    </FilterField>
  );
}
