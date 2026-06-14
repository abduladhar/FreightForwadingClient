import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { FilePlus2, MoreHorizontal, Pencil, Plus, ReceiptText, SlidersHorizontal, Trash2 } from "lucide-react";
import { deleteJob, getActiveJobTypesForDropdown, searchJobs, type JobDto } from "@/api/jobApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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

export function JobListPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [jobNumber, setJobNumber] = useState("");
  const [jobTypeId, setJobTypeId] = useState("");
  const [active, setActive] = useState<FlagFilterValue>("");
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
  const jobTypes = useQuery({ queryKey: ["job-types", "active-dropdown"], queryFn: () => getActiveJobTypesForDropdown() });
  const query = useQuery({
    queryKey: ["jobs", pageNumber, pageSize, search, jobNumber, jobTypeId, active, invoiceDefined, billDefined, invoiceFullyReceived, billFullyPaid, invoiceCancelled, billCancelled, unpaidInvoice, unpaidBill, pendingInvoicePosting, pendingBillPosting],
    queryFn: () => searchJobs({
      pageNumber,
      pageSize,
      search,
      jobNumber,
      jobTypeId,
      isActive: toBooleanFilter(active),
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
  const remove = useMutation({ mutationFn: deleteJob, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["jobs"] }) });
  const columns = useMemo<ColumnDef<JobDto>[]>(() => [
    { accessorKey: "jobNumber", header: lt("Job Number") },
    { accessorKey: "jobTypeName", header: lt("Job Type") },
    { accessorKey: "description", header: lt("Description") },
    { id: "active", header: lt("Active"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? lt("Active") : lt("Inactive")} /> },
    { id: "invoiceDefined", header: () => <FinanceFlagHeader label={lt("Invoice Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.invoiceDefined} /> },
    { id: "billDefined", header: () => <FinanceFlagHeader label={lt("Bill Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.billDefined} /> },
    { id: "financeStatus", header: () => <FinanceFlagHeader label={lt("Finance Status")} />, cell: ({ row }) => <FinanceStatusDropdown row={row.original} /> }
  ], []);

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Jobs")} description={lt("Manage customs clearance job records. Numbers follow JB-JobTypeShortCode-DDmmYY-Sequence.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Job.Create"><Link to="/customs/jobs/new"><Plus className="h-4 w-4" />{lt("New Job")}</Link></PermissionButton></>} />
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
                <FilterField label={lt("Job Number")}><Input placeholder={lt("Filter by job number")} value={jobNumber} onChange={(event) => { setJobNumber(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("Job Type")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={jobTypeId} onChange={(event) => { setJobTypeId(event.target.value); setPageNumber(1); }}><option value="">{lt("All Job Types")}</option>{(jobTypes.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.jobTypeCode} - {x.jobTypeName}</option>)}</select></FilterField>
                <FlagSelect label={lt("Active")} value={active} onChange={setActive} resetPage={() => setPageNumber(1)} />
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
          <DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <JobActions row={row} hasPermission={hasPermission} onDelete={async () => { await remove.mutateAsync(row.id); }} />} />
        </CardContent>
      </Card>
    </div>
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

function FinanceStatusDropdown({ row }: { row: JobDto }) {
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

function JobActions({ row, hasPermission, onDelete }: { row: JobDto; hasPermission: (permission?: string | string[]) => boolean; onDelete: () => Promise<void> }) {
  const sourceQuery = new URLSearchParams({ sourceType: "Job", sourceId: row.id, sourceReferenceNo: row.jobNumber }).toString();
  const billQuery = new URLSearchParams({ sourceType: "Job", sourceId: row.id, sourceReferenceNo: row.jobNumber, expectedCostAmount: "0" }).toString();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{lt("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("Job.Update") ? <DropdownMenuItem asChild><Link to={`/customs/jobs/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit Job")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Read") ? <DropdownMenuItem asChild><Link to={`/customs/jobs/${row.id}/invoices`}><ReceiptText className="mr-2 h-4 w-4" />{lt("Show Invoices")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Create") ? <DropdownMenuItem asChild><Link to={`/invoices/new?${sourceQuery}`}><Plus className="mr-2 h-4 w-4" />{lt("Create Invoice")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/customs/jobs/${row.id}/bills`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Show Bills")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Create") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/new?${billQuery}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Bill")}</Link></DropdownMenuItem> : null}
        {hasPermission("Job.Delete") ? (
          <ConfirmDialog title={lt("Delete job?")} description={row.jobNumber} confirmText={lt("Delete")} variant="danger" onConfirm={onDelete}>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="text-red-600 hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" />{lt("Delete Job")}</DropdownMenuItem>
          </ConfirmDialog>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
