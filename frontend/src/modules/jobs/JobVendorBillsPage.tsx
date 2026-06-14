import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Eye, FilePlus2, Pencil, Scale, XCircle } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getJobByGuid, type JobDto } from "@/api/jobApi";
import { approveVendorBill, cancelVendorBill, searchVendorBills, type VendorBillDto } from "@/api/vendorBillApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DataTable } from "@/components/common/DataTable";
import { DateDisplay } from "@/components/common/DateDisplay";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function JobVendorBillsPage() {
  const { id } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const jobQuery = useQuery({
    queryKey: ["job-bills-context", id],
    queryFn: () => getJobByGuid(id!),
    enabled: Boolean(id)
  });
  const billsQuery = useQuery({
    queryKey: ["job-vendor-bills", id, pageNumber, pageSize, search],
    queryFn: () => searchVendorBills({ pageNumber, pageSize, search, sourceType: "Job", sourceId: id! }),
    enabled: Boolean(id)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "job-vendor-bills"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const approve = useMutation({
    mutationFn: approveVendorBill,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["job-vendor-bills"] })
  });
  const cancel = useMutation({
    mutationFn: ({ billId, reason }: { billId: string; reason: string }) => cancelVendorBill(billId, reason),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["job-vendor-bills"] })
  });

  const columns = useMemo<ColumnDef<VendorBillDto>[]>(
    () => [
      { accessorKey: "vendorBillNumber", header: lt("Bill No") },
      { accessorKey: "sourceReferenceNo", header: lt("Source Reference No") },
      { accessorKey: "payToPartyName", header: lt("Pay To") },
      { accessorKey: "billDate", header: lt("Bill Date"), cell: ({ row }) => <DateDisplay value={row.original.billDate} /> },
      { accessorKey: "dueDate", header: lt("Due Date"), cell: ({ row }) => <DateDisplay value={row.original.dueDate} /> },
      { id: "currency", header: lt("Currency"), cell: ({ row }) => currencyCodes.get(row.original.billCurrencyId) ?? "-" },
      { accessorKey: "totalAmount", header: lt("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCodes.get(row.original.billCurrencyId)} /> },
      { accessorKey: "outstandingAmount", header: lt("Outstanding"), cell: ({ row }) => <CurrencyAmount value={row.original.outstandingAmount} currency={currencyCodes.get(row.original.billCurrencyId)} /> },
      { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> }
    ],
    [currencyCodes]
  );

  if (!id) return <Navigate to="/customs/jobs" replace />;
  if (jobQuery.isLoading) return <LoadingScreen />;
  if (jobQuery.isError || !jobQuery.data) return <ErrorState onRetry={() => void jobQuery.refetch()} />;

  const job = jobQuery.data;
  const createBillPath = `/vendor-bills/new?${new URLSearchParams({
    sourceType: "Job",
    sourceId: id,
    sourceReferenceNo: job.jobNumber,
    expectedCostAmount: "0"
  }).toString()}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Job Vendor Bills")}
        description={`Expense bills for ${job.jobNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Job.Read" variant="outline">
              <Link to="/customs/jobs">
                <Eye className="h-4 w-4" />{lt("Jobs")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="VendorBill.Create">
              <Link to={createBillPath}>
                <FilePlus2 className="h-4 w-4" />{lt("New Bill")}</Link>
            </PermissionButton>
          </>
        }
      />

      <JobContext job={job} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={billsQuery.data?.items ?? []}
            columns={columns}
            totalCount={billsQuery.data?.totalCount ?? 0}
            pageNumber={billsQuery.data?.pageNumber ?? pageNumber}
            pageSize={billsQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search bill number, source reference, or remarks")}
            onSearchChange={(value) => {
              setSearch(value);
              setPageNumber(1);
            }}
            onPaginationChange={(pn, ps) => {
              setPageNumber(pn);
              setPageSize(ps);
            }}
            isLoading={billsQuery.isLoading}
            isError={billsQuery.isError}
            onRetry={() => void billsQuery.refetch()}
            rowActions={(row) => (
              <div className="flex flex-wrap justify-end gap-1">
                <PermissionButton asChild permission="VendorBill.Read" size="sm" variant="ghost">
                  <Link to={`/vendor-bills/${row.id}`} title={lt("View Bill")}><Eye className="h-4 w-4" /></Link>
                </PermissionButton>
                <PermissionButton asChild permission="VendorBill.Update" size="sm" variant="ghost">
                  <Link to={`/vendor-bills/${row.id}/edit`} title={lt("Edit Bill")}><Pencil className="h-4 w-4" /></Link>
                </PermissionButton>
                <PermissionButton asChild permission="VendorBill.Read" size="sm" variant="ghost">
                  <Link to={`/vendor-bills/${row.id}/expected-cost`} title={lt("Expected Cost")}><Scale className="h-4 w-4" /></Link>
                </PermissionButton>
                {hasPermission("VendorBill.Approve") && row.status === "Draft" ? (
                  <Button size="sm" variant="ghost" onClick={() => void approve.mutateAsync(row.id)} title={lt("Approve Bill")}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </Button>
                ) : null}
                {hasPermission("VendorBill.Cancel") && row.status !== "Cancelled" ? (
                  <ConfirmDialog
                    title={lt("Cancel vendor bill?")}
                    description={row.vendorBillNumber}
                    confirmText={lt("Cancel Bill")}
                    variant="danger"
                    onConfirm={async () => {
                      await cancel.mutateAsync({ billId: row.id, reason: "Cancelled from job bills page" });
                    }}
                  >
                    <Button size="sm" variant="ghost" title={lt("Cancel Bill")}><XCircle className="h-4 w-4 text-red-600" /></Button>
                  </ConfirmDialog>
                ) : null}
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
