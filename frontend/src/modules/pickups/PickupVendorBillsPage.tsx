import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Eye, FilePlus2, Pencil, Scale, XCircle } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getPickup, type PickupDto } from "@/api/pickupApi";
import { getVendor } from "@/api/vendorApi";
import { approveVendorBill, cancelVendorBill, searchVendorBills, type VendorBillDto } from "@/api/vendorBillApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
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
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PickupVendorBillsPage() {
  const { pickupId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const p = usePickupI18n();

  const pickupQuery = useQuery({
    queryKey: ["pickup-bills-context", pickupId],
    queryFn: () => getPickup(pickupId!),
    enabled: Boolean(pickupId)
  });
  const vendorQuery = useQuery({
    queryKey: ["pickup-bills-vendor", pickupQuery.data?.transporterVendorId],
    queryFn: () => getVendor(pickupQuery.data!.transporterVendorId!),
    enabled: Boolean(pickupQuery.data?.transporterVendorId)
  });
  const billsQuery = useQuery({
    queryKey: ["pickup-vendor-bills", pickupId, pageNumber, pageSize, search],
    queryFn: () => searchVendorBills({ pageNumber, pageSize, search, sourceType: "Pickup", sourceId: pickupId! }),
    enabled: Boolean(pickupId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "pickup-vendor-bills"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const approve = useMutation({ mutationFn: approveVendorBill, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["pickup-vendor-bills"] }) });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelVendorBill(id, reason), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["pickup-vendor-bills"] }) });

  const columns = useMemo<ColumnDef<VendorBillDto>[]>(
    () => [
      { accessorKey: "vendorBillNumber", header: p("Bill No") },
      { accessorKey: "billDate", header: p("Bill Date"), cell: ({ row }) => <DateDisplay value={row.original.billDate} /> },
      { accessorKey: "dueDate", header: p("Due Date"), cell: ({ row }) => <DateDisplay value={row.original.dueDate} /> },
      { id: "currency", header: p("Currency"), cell: ({ row }) => currencyCodes.get(row.original.billCurrencyId) ?? "-" },
      { accessorKey: "expectedCostAmount", header: p("Expected"), cell: ({ row }) => <CurrencyAmount value={row.original.expectedCostAmount} currency={currencyCodes.get(row.original.billCurrencyId)} /> },
      { accessorKey: "totalAmount", header: p("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCodes.get(row.original.billCurrencyId)} /> },
      { accessorKey: "outstandingAmount", header: p("Outstanding"), cell: ({ row }) => <CurrencyAmount value={row.original.outstandingAmount} currency={currencyCodes.get(row.original.billCurrencyId)} /> },
      { accessorKey: "status", header: p("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} label={p(row.original.status)} /> }
    ],
    [currencyCodes, p]
  );

  if (!pickupId) return <Navigate to="/pickups" replace />;
  if (pickupQuery.isLoading) return <LoadingScreen />;
  if (pickupQuery.isError || !pickupQuery.data) return <ErrorState onRetry={() => void pickupQuery.refetch()} />;

  const pickup = pickupQuery.data;
  const vendorName = vendorQuery.data?.vendorName ?? pickup.transporterVendorId ?? "-";
  const createBillPath = buildCreateBillPath(pickupId, pickup);

  return (
    <div className="space-y-4">
      <PageHeader
        title={p("Pickup Vendor Bills")}
        description={`${p("Expense bills for")} ${pickup.pickupNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton className={masterDataButtonClass} asChild permission="Pickup.Read" variant="outline">
              <Link to={`/pickups/${pickupId}`}>
                <Eye className="h-4 w-4" /> {p("Pickup")}
              </Link>
            </PermissionButton>
            <PermissionButton className={masterDataButtonClass} asChild permission="VendorBill.Create">
              <Link to={createBillPath}>
                <FilePlus2 className="h-4 w-4" /> {p("New Bill")}
              </Link>
            </PermissionButton>
          </>
        }
      />

      <PickupBillContext pickup={pickup} vendorName={vendorName} p={p} />

      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <DataTable
            data={billsQuery.data?.items ?? []}
            columns={columns}
            totalCount={billsQuery.data?.totalCount ?? 0}
            pageNumber={billsQuery.data?.pageNumber ?? pageNumber}
            pageSize={billsQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={p("Search vendor bill number, pickup number, or status")}
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
                  <Link to={`/vendor-bills/${row.id}`} title={p("View Bill")}><Eye className="h-4 w-4" /></Link>
                </PermissionButton>
                <PermissionButton asChild permission="VendorBill.Update" size="sm" variant="ghost">
                  <Link to={`/vendor-bills/${row.id}/edit`} title={p("Edit Bill")}><Pencil className="h-4 w-4" /></Link>
                </PermissionButton>
                <PermissionButton asChild permission="VendorBill.Read" size="sm" variant="ghost">
                  <Link to={`/vendor-bills/${row.id}/expected-cost`} title={p("Expected Cost")}><Scale className="h-4 w-4" /></Link>
                </PermissionButton>
                {hasPermission("VendorBill.Approve") && row.status === "Draft" ? (
                  <Button size="sm" variant="ghost" onClick={() => void approve.mutateAsync(row.id)}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </Button>
                ) : null}
                {hasPermission("VendorBill.Cancel") && row.status !== "Cancelled" ? (
                  <ConfirmDialog title={p("Cancel vendor bill?")} description={row.vendorBillNumber} confirmText={p("Cancel Bill")} variant="danger" onConfirm={async () => { await cancel.mutateAsync({ id: row.id, reason: "Cancelled from pickup bills page" }); }}>
                    <Button size="sm" variant="ghost"><XCircle className="h-4 w-4 text-red-600" /></Button>
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

function buildCreateBillPath(pickupId: string, pickup: PickupDto) {
  const params = new URLSearchParams({
    sourceType: "Pickup",
    sourceId: pickupId,
    expectedCostAmount: String(pickup.pickupCharges || 0)
  });
  if (pickup.transporterVendorId) params.set("vendorId", pickup.transporterVendorId);
  return `/vendor-bills/new?${params.toString()}`;
}

function PickupBillContext({ pickup, vendorName, p }: { pickup: PickupDto; vendorName: string; p: (value: string) => string }) {
  const totals = pickup.items.reduce(
    (sum, item) => ({
      pieces: sum.pieces + Number(item.pieces || 0),
      weight: sum.weight + Number(item.weight || 0),
      volume: sum.volume + Number(item.volumeCbm || 0)
    }),
    { pieces: 0, weight: 0, volume: 0 }
  );

  return (
    <Card className={masterDataPanelClass}>
      <CardContent className={`${masterDataPanelContentClass} space-y-4`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">{p("Pickup")} {pickup.pickupNumber}</Badge>
          <StatusBadge status={pickup.status} label={p(pickup.status)} />
          <span className="text-sm text-muted-foreground">{pickup.customerLocation} {p("to")} {pickup.dropLocation || "-"}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label={p("Transporter / Vendor")}>{vendorName}</Field>
          <Field label={p("Pickup Receipt No")}>{pickup.pickupReceiptNumber || "-"}</Field>
          <Field label={p("Pickup Date")}><DateDisplay value={pickup.pickupDateTime} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={p("Contact")}>{pickup.contactPerson} / {pickup.contactPhone}</Field>
          <Field label={p("Customer Location")}>{pickup.customerLocation}</Field>
          <Field label={p("Drop Location")}>{pickup.dropLocation || "-"}</Field>
          <Field label={p("Driver")}>{pickup.driverName || "-"}</Field>
          <Field label={p("Vehicle")}>{pickup.vehicleNumber || "-"}</Field>
          <Field label={p("Pickup Charges")}><CurrencyAmount value={pickup.pickupCharges} /></Field>
          <Field label={p("Goods")}>{totals.pieces.toFixed(0)} {p("pcs")} / {totals.weight.toFixed(2)} {p("kg")} / {totals.volume.toFixed(4)} {p("cbm")}</Field>
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
