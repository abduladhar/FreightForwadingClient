import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { Eye, FileText, Pencil, Plus, Printer } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getJobByGuid, type JobDto } from "@/api/jobApi";
import { searchInvoices, type InvoiceDto } from "@/api/invoiceApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DataTable } from "@/components/common/DataTable";
import { DateDisplay } from "@/components/common/DateDisplay";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function JobInvoicesPage() {
  const { id } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const jobQuery = useQuery({
    queryKey: ["job-invoices-context", id],
    queryFn: () => getJobByGuid(id!),
    enabled: Boolean(id)
  });
  const invoicesQuery = useQuery({
    queryKey: ["job-invoices", id, pageNumber, pageSize, search],
    queryFn: () => searchInvoices({ pageNumber, pageSize, search, sourceType: "Job", sourceId: id! }),
    enabled: Boolean(id)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "job-invoices"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const columns = useMemo<ColumnDef<InvoiceDto>[]>(
    () => [
      { accessorKey: "invoiceNumber", header: lt("Invoice No") },
      { accessorKey: "sourceReferenceNo", header: lt("Source Reference No") },
      { accessorKey: "billToPartyName", header: lt("Bill To") },
      { accessorKey: "documentType", header: lt("Type") },
      { accessorKey: "invoiceDate", header: lt("Invoice Date"), cell: ({ row }) => <DateDisplay value={row.original.invoiceDate} /> },
      { accessorKey: "dueDate", header: lt("Due Date"), cell: ({ row }) => <DateDisplay value={row.original.dueDate} /> },
      { id: "currency", header: lt("Currency"), cell: ({ row }) => currencyCodes.get(row.original.invoiceCurrencyId) ?? "-" },
      { accessorKey: "totalAmount", header: lt("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCodes.get(row.original.invoiceCurrencyId)} /> },
      { accessorKey: "outstandingAmount", header: lt("Outstanding"), cell: ({ row }) => <CurrencyAmount value={row.original.outstandingAmount} currency={currencyCodes.get(row.original.invoiceCurrencyId)} /> },
      { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    [currencyCodes]
  );

  if (!id) return <Navigate to="/customs/jobs" replace />;
  if (jobQuery.isLoading) return <LoadingScreen />;
  if (jobQuery.isError || !jobQuery.data) return <ErrorState onRetry={() => void jobQuery.refetch()} />;

  const job = jobQuery.data;
  const createInvoicePath = `/invoices/new?${new URLSearchParams({
    sourceType: "Job",
    sourceId: id,
    sourceReferenceNo: job.jobNumber
  }).toString()}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Job Customer Invoices")}
        description={`Invoices for ${job.jobNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Job.Read" variant="outline">
              <Link to="/customs/jobs">
                <Eye className="h-4 w-4" />{lt("Jobs")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="Invoice.Create">
              <Link to={createInvoicePath}>
                <Plus className="h-4 w-4" />{lt("New Invoice")}</Link>
            </PermissionButton>
          </>
        }
      />

      <JobContext job={job} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={invoicesQuery.data?.items ?? []}
            columns={columns}
            totalCount={invoicesQuery.data?.totalCount ?? 0}
            pageNumber={invoicesQuery.data?.pageNumber ?? pageNumber}
            pageSize={invoicesQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search invoice number, source reference, or remarks")}
            onSearchChange={(value) => {
              setSearch(value);
              setPageNumber(1);
            }}
            onPaginationChange={(pn, ps) => {
              setPageNumber(pn);
              setPageSize(ps);
            }}
            isLoading={invoicesQuery.isLoading}
            isError={invoicesQuery.isError}
            onRetry={() => void invoicesQuery.refetch()}
            rowActions={(row) => (
              <div className="flex flex-wrap justify-end gap-1">
                <PermissionButton asChild permission="Invoice.Read" size="sm" variant="ghost">
                  <Link to={`/invoices/${row.id}`} title={lt("View Invoice")}><Eye className="h-4 w-4" /></Link>
                </PermissionButton>
                <PermissionButton asChild permission="Invoice.Update" size="sm" variant="ghost">
                  <Link to={`/invoices/${row.id}/edit`} title={lt("Edit Invoice")}><Pencil className="h-4 w-4" /></Link>
                </PermissionButton>
                <PermissionButton asChild permission="Invoice.Print" size="sm" variant="outline">
                  <Link to={`/invoices/${row.id}/print?mode=proforma`}>
                    <FileText className="h-4 w-4" />{lt("Proforma")}</Link>
                </PermissionButton>
                <PermissionButton asChild permission="Invoice.Print" size="sm" variant="outline">
                  <Link to={`/invoices/${row.id}/print?mode=original`}>
                    <Printer className="h-4 w-4" />{lt("Invoice")}</Link>
                </PermissionButton>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function JobContext({ job }: { job: JobDto }) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">{job.jobNumber}</Badge>
          <StatusBadge status={job.isActive ? lt("Active") : lt("Inactive")} />
          <span className="text-sm text-muted-foreground">{job.jobTypeCode} - {job.jobTypeName}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label={lt("Job Number")}>{job.jobNumber}</Field>
          <Field label={lt("Job Type")}>{job.jobTypeName}</Field>
          <Field label={lt("Description")}>{job.description || "-"}</Field>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}
