import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, FilePlus2, FileText, MoreHorizontal, Pencil, Plus, RefreshCw, SlidersHorizontal, Sigma } from "lucide-react";
import { searchCustomsJobs, type CustomsClearanceJobDto } from "@/api/customsApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
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
import { lt } from "@/modules/operationsLocalization";

type FlagFilterValue = "" | "true" | "false";

export function CustomsClearanceListPage() {
  const { hasPermission } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState("");
  const [clearanceType, setClearanceType] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [shipmentReferenceNo, setShipmentReferenceNo] = useState("");
  const [invoiceDefined, setInvoiceDefined] = useState<FlagFilterValue>("");
  const [billDefined, setBillDefined] = useState<FlagFilterValue>("");
  const [invoiceFullyReceived, setInvoiceFullyReceived] = useState<FlagFilterValue>("");
  const [billFullyPaid, setBillFullyPaid] = useState<FlagFilterValue>("");
  const [invoiceCancelled, setInvoiceCancelled] = useState<FlagFilterValue>("");
  const [billCancelled, setBillCancelled] = useState<FlagFilterValue>("");
  const [unpaidInvoice, setUnpaidInvoice] = useState<FlagFilterValue>("");
  const [unpaidBill, setUnpaidBill] = useState<FlagFilterValue>("");
  const [pendingInvoicePosting, setPendingInvoicePosting] = useState<FlagFilterValue>("");
  const [pendingBillPosting, setPendingBillPosting] = useState<FlagFilterValue>("");

  const query = useQuery({
    queryKey: ["customs-jobs", pageNumber, pageSize, search, status, clearanceType, jobNumber, shipmentReferenceNo, invoiceDefined, billDefined, invoiceFullyReceived, billFullyPaid, invoiceCancelled, billCancelled, unpaidInvoice, unpaidBill, pendingInvoicePosting, pendingBillPosting],
    queryFn: () => searchCustomsJobs({
      pageNumber,
      pageSize,
      search,
      status: status || undefined,
      clearanceType: clearanceType || undefined,
      jobNumber: jobNumber || undefined,
      shipmentReferenceNo: shipmentReferenceNo || undefined,
      invoiceDefined: toBooleanFilter(invoiceDefined),
      billDefined: toBooleanFilter(billDefined),
      invoiceFullyReceived: toBooleanFilter(invoiceFullyReceived),
      billFullyPaid: toBooleanFilter(billFullyPaid),
      invoiceCancelled: toBooleanFilter(invoiceCancelled),
      billCancelled: toBooleanFilter(billCancelled),
      unpaidInvoice: toBooleanFilter(unpaidInvoice),
      unpaidBill: toBooleanFilter(unpaidBill),
      pendingInvoicePosting: toBooleanFilter(pendingInvoicePosting),
      pendingBillPosting: toBooleanFilter(pendingBillPosting)
    })
  });

  const columns: ColumnDef<CustomsClearanceJobDto>[] = [
    { accessorKey: "serialNo", header: lt("No") },
    { accessorKey: "jobNumber", header: lt("Job No") },
    { accessorKey: "shipmentReferenceNo", header: lt("Reference No") },
    { accessorKey: "customerName", header: lt("Customer") },
    { accessorKey: "clearanceType", header: lt("Type") },
    { accessorKey: "modeOfTransport", header: lt("Mode") },
    { accessorKey: "originPort", header: lt("Origin") },
    { accessorKey: "destinationPort", header: lt("Destination") },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: "invoiceDefined", header: () => <FinanceFlagHeader label={lt("Invoice Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.invoiceDefined} /> },
    { id: "billDefined", header: () => <FinanceFlagHeader label={lt("Bill Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.billDefined} /> },
    { id: "financeStatus", header: () => <FinanceFlagHeader label={lt("Finance Status")} />, cell: ({ row }) => <FinanceStatusDropdown row={row.original} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Customs Clearance")}
        description={lt("Manage customs jobs, declarations, documents, duties, payments, inspections, and queries.")}
        actions={
          <>
            <Button variant="outline" onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button>
            <AuditTrailButton />
            <PermissionButton asChild permission="CustomsClearance.Create"><Link to="/customs/new"><Plus className="h-4 w-4" />{lt("New Job")}</Link></PermissionButton>
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
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                <FilterField label={lt("Job Number")}><Input value={jobNumber} onChange={(event) => { setJobNumber(event.target.value); setPageNumber(1); }} placeholder={lt("Customs job number")} /></FilterField>
                <FilterField label={lt("Reference No")}><Input value={shipmentReferenceNo} onChange={(event) => { setShipmentReferenceNo(event.target.value); setPageNumber(1); }} placeholder={lt("Shipment reference no")} /></FilterField>
                <FilterField label={lt("Clearance Type")}>
                  <select className="h-10 w-full rounded-md border px-3 text-sm" value={clearanceType} onChange={(event) => { setClearanceType(event.target.value); setPageNumber(1); }}>
                    <option value="">{lt("All clearance types")}</option>
                    <option value="Import">{lt("Import")}</option><option value="Export">{lt("Export")}</option><option value="Transit">{lt("Transit")}</option><option value="ReExport">{lt("ReExport")}</option>
                  </select>
                </FilterField>
                <FilterField label={lt("Status")}>
                  <select className="h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); setPageNumber(1); }}>
                    <option value="">{lt("All statuses")}</option>
                    {["Draft", "Document Pending", "Ready to Submit", "Submitted", "Under Review", "Query Raised", "Inspection", "Duty Assessed", "Duty Paid", "Cleared", "Rejected", "Cancelled"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </FilterField>
                <FlagSelect label={lt("Invoice Defined")} value={invoiceDefined} onChange={setInvoiceDefined} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Bill Defined")} value={billDefined} onChange={setBillDefined} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Invoice Fully Received")} value={invoiceFullyReceived} onChange={setInvoiceFullyReceived} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Bill Fully Paid")} value={billFullyPaid} onChange={setBillFullyPaid} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Invoice Cancelled")} value={invoiceCancelled} onChange={setInvoiceCancelled} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Bill Cancelled")} value={billCancelled} onChange={setBillCancelled} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Unpaid Invoice")} value={unpaidInvoice} onChange={setUnpaidInvoice} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Unpaid Bill")} value={unpaidBill} onChange={setUnpaidBill} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Pending Invoice To Post")} value={pendingInvoicePosting} onChange={setPendingInvoicePosting} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Pending Bill To Post")} value={pendingBillPosting} onChange={setPendingBillPosting} resetPage={() => setPageNumber(1)} />
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
            rowActions={(row) => <CustomsActions row={row} hasPermission={hasPermission} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function CustomsActions({ row, hasPermission }: { row: CustomsClearanceJobDto; hasPermission: (permission?: string | string[]) => boolean }) {
  const invoiceQuery = new URLSearchParams({
    sourceType: "CustomsClearance",
    sourceId: row.id,
    sourceReferenceNo: row.jobNumber,
    ...(row.customerId ? { customerId: row.customerId } : {})
  }).toString();
  const expectedCostAmount = row.assessments.reduce((sum, assessment) => sum + assessment.totalPayableAmount, 0);
  const billQuery = new URLSearchParams({
    sourceType: "CustomsClearance",
    sourceId: row.id,
    sourceReferenceNo: row.jobNumber,
    expectedCostAmount: String(expectedCostAmount)
  }).toString();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{lt("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("CustomsClearance.Read") ? <DropdownMenuItem asChild><Link to={`/customs/${row.id}`}><Eye className="mr-2 h-4 w-4" />{lt("View Clearance")}</Link></DropdownMenuItem> : null}
        {hasPermission("CustomsClearance.Update") ? <DropdownMenuItem asChild><Link to={`/customs/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit Clearance")}</Link></DropdownMenuItem> : null}
        {hasPermission("CustomsClearance.Update") ? <DropdownMenuItem asChild><Link to={`/customs/${row.id}/status`}><Sigma className="mr-2 h-4 w-4" />{lt("Update Status")}</Link></DropdownMenuItem> : null}
        {hasPermission("CustomsClearance.Update") ? <DropdownMenuItem asChild><Link to={`/customs/${row.id}/documents`}><FileText className="mr-2 h-4 w-4" />{lt("Documents")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Read") ? <DropdownMenuItem asChild><Link to={`/customs/${row.id}/invoices`}><FileText className="mr-2 h-4 w-4" />{lt("Show Invoices")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Create") ? <DropdownMenuItem asChild><Link to={`/invoices/new?${invoiceQuery}`}><Plus className="mr-2 h-4 w-4" />{lt("Create Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/customs/${row.id}/bills`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Show Bills")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Create") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/new?${billQuery}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Bill")}</Link></DropdownMenuItem> : null}
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

function FinanceStatusDropdown({ row }: { row: CustomsClearanceJobDto }) {
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

function FinanceStatusRow({ label, value }: { label: string; value: ReactNode }) {
  return <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs"><span className="text-slate-600">{label}</span>{value}</div>;
}

function PostingCount({ value, compact = false }: { value: number; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={value > 0 ? "amber" : "slate"}>{value}</Badge></div>;
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
