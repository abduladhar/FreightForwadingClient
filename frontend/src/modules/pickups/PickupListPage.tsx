import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { ClipboardCheck, Eye, FilePlus2, FileText, MoreHorizontal, Pencil, Plus, Printer, Receipt, Truck } from "lucide-react";
import { searchPickups, type PickupDto } from "@/api/pickupApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

type FlagFilterValue = "" | "true" | "false";

export function PickupListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [pickupNumber, setPickupNumber] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [invoiceDefined, setInvoiceDefined] = useState<FlagFilterValue>("");
  const [billDefined, setBillDefined] = useState<FlagFilterValue>("");
  const [invoiceFullyReceived, setInvoiceFullyReceived] = useState<FlagFilterValue>("");
  const [billFullyPaid, setBillFullyPaid] = useState<FlagFilterValue>("");
  const { hasPermission } = useAuth();
  const p = usePickupI18n();

  const query = useQuery({
    queryKey: ["pickups", pageNumber, pageSize, search, customer, pickupNumber, contactNo, invoiceDefined, billDefined, invoiceFullyReceived, billFullyPaid],
    queryFn: () => searchPickups({
      pageNumber,
      pageSize,
      search,
      customer: customer || undefined,
      pickupNumber: pickupNumber || undefined,
      contactNo: contactNo || undefined,
      invoiceDefined: toBooleanFilter(invoiceDefined),
      billDefined: toBooleanFilter(billDefined),
      invoiceFullyReceived: toBooleanFilter(invoiceFullyReceived),
      billFullyPaid: toBooleanFilter(billFullyPaid)
    })
  });

  const columns: ColumnDef<PickupDto>[] = [
    { accessorKey: "pickupNumber", header: p("Pickup No") },
    { accessorKey: "pickupDateTime", header: p("Date/Time") },
    { accessorKey: "customerLocation", header: p("Location") },
    { accessorKey: "dropLocation", header: p("Drop Location") },
    { accessorKey: "consigneeName", header: p("Consignee") },
    { accessorKey: "contactPhone", header: p("Contact No") },
    { accessorKey: "pickupCharges", header: p("Charges"), cell: ({ row }) => <CurrencyAmount value={row.original.pickupCharges} /> },
    { accessorKey: "status", header: p("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} label={p(row.original.status)} /> },
    { id: "invoiceDefined", header: () => <FinanceFlagHeader label={p("Invoice Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.invoiceDefined} p={p} /> },
    { id: "billDefined", header: () => <FinanceFlagHeader label={p("Bill Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.billDefined} p={p} /> },
    { id: "financeStatus", header: () => <FinanceFlagHeader label={p("Finance Status")} />, cell: ({ row }) => <FinanceStatusDropdown row={row.original} p={p} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={p("Pickups")}
        description={p("Pickup request, assignment, status tracking, and receipt workflows.")}
        actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="Pickup.Create"><Link to="/pickups/new"><Plus className="h-4 w-4" /> {p("New Pickup")}</Link></PermissionButton></>}
      />
      <Card className={masterDataPanelClass}>
        <CardContent className={`${masterDataPanelContentClass} space-y-4`}>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
            <FilterField label={p("Customer")}><Input value={customer} placeholder={p("Customer name/code")} onChange={(event) => { setCustomer(event.target.value); setPageNumber(1); }} /></FilterField>
            <FilterField label={p("Pickup Number")}><Input value={pickupNumber} placeholder={p("PU-...")} onChange={(event) => { setPickupNumber(event.target.value); setPageNumber(1); }} /></FilterField>
            <FilterField label={p("Contact No")}><Input value={contactNo} placeholder={p("Phone number")} onChange={(event) => { setContactNo(event.target.value); setPageNumber(1); }} /></FilterField>
            <FlagSelect label={p("Invoice Defined")} value={invoiceDefined} onChange={setInvoiceDefined} resetPage={() => setPageNumber(1)} p={p} />
            <FlagSelect label={p("Bill Defined")} value={billDefined} onChange={setBillDefined} resetPage={() => setPageNumber(1)} p={p} />
            <FlagSelect label={p("Invoice Fully Received")} value={invoiceFullyReceived} onChange={setInvoiceFullyReceived} resetPage={() => setPageNumber(1)} p={p} />
            <FlagSelect label={p("Bill Fully Paid")} value={billFullyPaid} onChange={setBillFullyPaid} resetPage={() => setPageNumber(1)} p={p} />
          </div>
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search={search}
            onSearchChange={setSearch}
            onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => <PickupActions row={row} hasPermission={hasPermission} p={p} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PickupActions({ row, hasPermission, p }: { row: PickupDto; hasPermission: (permission?: string | string[]) => boolean; p: (value: string) => string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{p("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("Pickup.Read") ? <DropdownMenuItem asChild><Link to={`/pickups/${row.id}`}><Eye className="me-2 h-4 w-4" /> {p("View Pickup")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Read") ? <DropdownMenuItem asChild><Link to={`/pickups/${row.id}/invoices`}><Receipt className="me-2 h-4 w-4" /> {p("Show Invoices")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Create") ? <DropdownMenuItem asChild><Link to={`/invoices/new?sourceType=Pickup&sourceId=${row.id}&customerId=${row.customerId}`}><FilePlus2 className="me-2 h-4 w-4" /> {p("Create Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/pickups/${row.id}/bills`}><FileText className="me-2 h-4 w-4" /> {p("Show Bills")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Create") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/new?sourceType=Pickup&sourceId=${row.id}&vendorId=${row.transporterVendorId ?? ""}&expectedCostAmount=${row.pickupCharges || 0}`}><FilePlus2 className="me-2 h-4 w-4" /> {p("Create Bill")}</Link></DropdownMenuItem> : null}
        {hasPermission("Pickup.Update") ? <DropdownMenuItem asChild><Link to={`/pickups/${row.id}/edit`}><Pencil className="me-2 h-4 w-4" /> {p("Edit Pickup")}</Link></DropdownMenuItem> : null}
        {hasPermission("Pickup.Update") ? <DropdownMenuItem asChild><Link to={`/pickups/${row.id}/assign`}><Truck className="me-2 h-4 w-4" /> {p("Assign Pickup")}</Link></DropdownMenuItem> : null}
        {hasPermission("Pickup.Update") ? <DropdownMenuItem asChild><Link to={`/pickups/${row.id}/status`}><ClipboardCheck className="me-2 h-4 w-4" /> {p("Update Status")}</Link></DropdownMenuItem> : null}
        {hasPermission("Pickup.Print") ? <DropdownMenuItem asChild><Link to={`/pickups/${row.id}/receipt`}><Printer className="me-2 h-4 w-4" /> {p("Print Receipt")}</Link></DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FinanceStatusDropdown({ row, p }: { row: PickupDto; p: (value: string) => string }) {
  const pendingCount = row.pendingInvoicePostingCount + row.pendingBillPostingCount;
  const hasWarning = row.invoiceCancelled || row.billCancelled || pendingCount > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 px-2">
          <Badge tone={hasWarning ? "amber" : "green"}>{p(hasWarning ? "Review" : "Clear")}</Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{p("Finance Status")}</div>
          <div className="space-y-1 rounded-md bg-slate-50 p-2">
            <FinanceStatusRow label={p("Invoice Fully Received")} value={<FinanceFlagCell active={row.invoiceFullyReceived} compact p={p} />} />
            <FinanceStatusRow label={p("Bill Fully Paid")} value={<FinanceFlagCell active={row.billFullyPaid} compact p={p} />} />
            <FinanceStatusRow label={p("Invoice Cancelled")} value={<FinanceFlagCell active={row.invoiceCancelled} warning compact p={p} />} />
            <FinanceStatusRow label={p("Bill Cancelled")} value={<FinanceFlagCell active={row.billCancelled} warning compact p={p} />} />
            <FinanceStatusRow label={p("Pending Invoice To Post")} value={<PostingCount value={row.pendingInvoicePostingCount} compact />} />
            <FinanceStatusRow label={p("Pending Bill To Post")} value={<PostingCount value={row.pendingBillPostingCount} compact />} />
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

function FinanceFlagCell({ active, warning = false, compact = false, p }: { active: boolean; warning?: boolean; compact?: boolean; p: (value: string) => string }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={active ? (warning ? "red" : "green") : "slate"}>{p(active ? "Yes" : "No")}</Badge></div>;
}

function PostingCount({ value, compact = false }: { value: number; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={value > 0 ? "amber" : "slate"}>{value}</Badge></div>;
}

function FinanceStatusRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs">
      <span className="text-slate-600">{label}</span>
      {value}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function FlagSelect({ label, value, onChange, resetPage, p }: { label: string; value: FlagFilterValue; onChange: (value: FlagFilterValue) => void; resetPage: () => void; p: (value: string) => string }) {
  return (
    <FilterField label={label}>
      <select className="h-10 w-full rounded-md border px-3 text-sm" value={value} onChange={(event) => { onChange(event.target.value as FlagFilterValue); resetPage(); }}>
        <option value="">{p("All")}</option>
        <option value="true">{p("Yes")}</option>
        <option value="false">{p("No")}</option>
      </select>
    </FilterField>
  );
}
