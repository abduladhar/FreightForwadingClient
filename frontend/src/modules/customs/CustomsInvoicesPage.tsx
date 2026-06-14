import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { Eye, FileText, Pencil, Plus, Printer } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getCustomsJob, type CustomsClearanceJobDto } from "@/api/customsApi";
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

export function CustomsInvoicesPage() {
  const { customsId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const customsQuery = useQuery({
    queryKey: ["customs-invoices-context", customsId],
    queryFn: () => getCustomsJob(customsId!),
    enabled: Boolean(customsId)
  });
  const invoicesQuery = useQuery({
    queryKey: ["customs-invoices", customsId, pageNumber, pageSize, search],
    queryFn: () => searchInvoices({ pageNumber, pageSize, search, sourceType: "CustomsClearance", sourceId: customsId! }),
    enabled: Boolean(customsId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "customs-invoices"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const columns = useMemo<ColumnDef<InvoiceDto>[]>(
    () => [
      { accessorKey: "invoiceNumber", header: lt("Invoice No") },
      { accessorKey: "sourceReferenceNo", header: lt("Reference No") },
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

  if (!customsId) return <Navigate to="/customs" replace />;
  if (customsQuery.isLoading) return <LoadingScreen />;
  if (customsQuery.isError || !customsQuery.data) return <ErrorState onRetry={() => void customsQuery.refetch()} />;

  const job = customsQuery.data;
  const createInvoicePath = `/invoices/new?${new URLSearchParams({
    sourceType: "CustomsClearance",
    sourceId: customsId,
    sourceReferenceNo: job.jobNumber,
    customerId: job.customerId ?? ""
  }).toString()}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Customs Clearance Invoices")}
        description={`Customer invoices for ${job.jobNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="CustomsClearance.Read" variant="outline">
              <Link to={`/customs/${customsId}`}>
                <Eye className="h-4 w-4" />{lt("Customs Job")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="Invoice.Create">
              <Link to={createInvoicePath}>
                <Plus className="h-4 w-4" />{lt("New Invoice")}</Link>
            </PermissionButton>
          </>
        }
      />

      <CustomsFinanceContext job={job} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={invoicesQuery.data?.items ?? []}
            columns={columns}
            totalCount={invoicesQuery.data?.totalCount ?? 0}
            pageNumber={invoicesQuery.data?.pageNumber ?? pageNumber}
            pageSize={invoicesQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search invoice number, reference, party, or status")}
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
                  <Link to={`/invoices/${row.id}/print?mode=proforma`}><FileText className="h-4 w-4" />{lt("Proforma")}</Link>
                </PermissionButton>
                <PermissionButton asChild permission="Invoice.Print" size="sm" variant="outline">
                  <Link to={`/invoices/${row.id}/print?mode=original`}><Printer className="h-4 w-4" />{lt("Invoice")}</Link>
                </PermissionButton>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function CustomsFinanceContext({ job }: { job: CustomsClearanceJobDto }) {
  const totals = useMemo(() => ({
    pieces: job.packages.reduce((s, x) => s + Number(x.pieces || 0), 0),
    weight: job.packages.reduce((s, x) => s + Number(x.weight || 0), 0),
    volume: job.packages.reduce((s, x) => s + Number(x.volumeCbm || 0), 0),
    payable: job.assessments.reduce((s, x) => s + Number(x.totalPayableAmount || 0), 0),
    paid: job.payments.reduce((s, x) => s + Number(x.amount || 0), 0)
  }), [job]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">Job {job.jobNumber}</Badge>
          <StatusBadge status={job.status} />
          <span className="text-sm text-muted-foreground">{job.originPort || "-"} to {job.destinationPort || "-"}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label={lt("Customer")}>{job.customerName || "-"}</Field>
          <Field label={lt("Reference No")}>{job.shipmentReferenceNo || "-"}</Field>
          <Field label={lt("Mode")}>{job.modeOfTransport || "-"}</Field>
          <Field label={lt("Incoterms")}>{job.incoterms || "-"}</Field>
          <Field label={lt("Expected Clearance")}><DateDisplay value={job.expectedClearanceDate} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={lt("Actual Clearance")}><DateDisplay value={job.actualClearanceDate} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={lt("Packages")}>{totals.pieces.toFixed(0)} pcs / {totals.weight.toFixed(2)} kg / {totals.volume.toFixed(4)} cbm</Field>
          <Field label={lt("Customs Payable / Paid")}>{totals.payable.toFixed(2)} / {totals.paid.toFixed(2)}</Field>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}
