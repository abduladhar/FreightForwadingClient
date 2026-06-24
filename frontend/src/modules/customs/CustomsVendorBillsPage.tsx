import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Eye, FilePlus2, Pencil, Scale, XCircle } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getCustomsJob, type CustomsClearanceJobDto } from "@/api/customsApi";
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

export function CustomsVendorBillsPage() {
  const { customsId } = useParams();
  const location = useLocation();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const customsQuery = useQuery({
    queryKey: ["customs-bills-context", customsId],
    queryFn: () => getCustomsJob(customsId!),
    enabled: Boolean(customsId)
  });
  const billsQuery = useQuery({
    queryKey: ["customs-vendor-bills", customsId, pageNumber, pageSize, search],
    queryFn: () => searchVendorBills({ pageNumber, pageSize, search, sourceType: "CustomsClearance", sourceId: customsId! }),
    enabled: Boolean(customsId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "customs-vendor-bills"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const approve = useMutation({
    mutationFn: approveVendorBill,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["customs-vendor-bills"] })
  });
  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelVendorBill(id, reason),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["customs-vendor-bills"] })
  });

  const columns = useMemo<ColumnDef<VendorBillDto>[]>(
    () => [
      { accessorKey: "vendorBillNumber", header: lt("Bill No") },
      { accessorKey: "sourceReferenceNo", header: lt("Reference No") },
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

  const basePath = location.pathname.startsWith("/bill-of-entry") ? "/bill-of-entry" : "/customs";
  if (!customsId) return <Navigate to={basePath} replace />;
  if (customsQuery.isLoading) return <LoadingScreen />;
  if (customsQuery.isError || !customsQuery.data) return <ErrorState onRetry={() => void customsQuery.refetch()} />;

  const job = customsQuery.data;
  const expectedCostAmount = job.assessments.reduce((sum, row) => sum + Number(row.totalPayableAmount || 0), 0);
  const createBillPath = `/vendor-bills/new?${new URLSearchParams({
    sourceType: "CustomsClearance",
    sourceId: customsId,
    sourceReferenceNo: job.jobNumber,
    expectedCostAmount: String(expectedCostAmount)
  }).toString()}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Customs Clearance Vendor Bills")}
        description={`Expense bills for ${job.jobNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="CustomsClearance.Read" variant="outline">
              <Link to={`${basePath}/${customsId}`}>
                <Eye className="h-4 w-4" />{lt("Customs Job")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="VendorBill.Create">
              <Link to={createBillPath}>
                <FilePlus2 className="h-4 w-4" />{lt("New Bill")}</Link>
            </PermissionButton>
          </>
        }
      />

      <CustomsBillContext job={job} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={billsQuery.data?.items ?? []}
            columns={columns}
            totalCount={billsQuery.data?.totalCount ?? 0}
            pageNumber={billsQuery.data?.pageNumber ?? pageNumber}
            pageSize={billsQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search vendor bill number, reference, pay-to party, or status")}
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
                      await cancel.mutateAsync({ id: row.id, reason: "Cancelled from customs clearance bills page" });
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

function CustomsBillContext({ job }: { job: CustomsClearanceJobDto }) {
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
          <Field label={lt("Broker")}>{job.customsBrokerName || "-"}</Field>
          <Field label={lt("Mode")}>{job.modeOfTransport || "-"}</Field>
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
