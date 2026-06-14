import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Eye, FilePlus2, Pencil, Scale, XCircle } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getMasterShipment, type MasterShipmentDto } from "@/api/masterShipmentApi";
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

export function MasterShipmentVendorBillsPage() {
  const { masterShipmentId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const shipmentQuery = useQuery({
    queryKey: ["master-shipment-bills-context", masterShipmentId],
    queryFn: () => getMasterShipment(masterShipmentId!),
    enabled: Boolean(masterShipmentId)
  });
  const billsQuery = useQuery({
    queryKey: ["master-shipment-vendor-bills", masterShipmentId, pageNumber, pageSize, search],
    queryFn: () => searchVendorBills({ pageNumber, pageSize, search, sourceType: "MasterShipment", sourceId: masterShipmentId! }),
    enabled: Boolean(masterShipmentId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "master-shipment-vendor-bills"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const approve = useMutation({
    mutationFn: approveVendorBill,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["master-shipment-vendor-bills"] })
  });
  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelVendorBill(id, reason),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["master-shipment-vendor-bills"] })
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

  if (!masterShipmentId) return <Navigate to="/master-shipments" replace />;
  if (shipmentQuery.isLoading) return <LoadingScreen />;
  if (shipmentQuery.isError || !shipmentQuery.data) return <ErrorState onRetry={() => void shipmentQuery.refetch()} />;

  const shipment = shipmentQuery.data;
  const referenceNo = shipment.mawbNumber || shipment.mblNumber || shipment.masterShipmentNumber;
  const createBillPath = `/vendor-bills/new?${new URLSearchParams({
    sourceType: "MasterShipment",
    sourceId: masterShipmentId,
    expectedCostAmount: String(shipment.totalCostAmount ?? 0)
  }).toString()}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Master Shipment Vendor Bills")}
        description={`${lt("Expense bills for")} ${referenceNo}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="MasterShipment.Read" variant="outline">
              <Link to={`/master-shipments/${masterShipmentId}`}>
                <Eye className="h-4 w-4" />{lt("Master Shipment")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="VendorBill.Create">
              <Link to={createBillPath}>
                <FilePlus2 className="h-4 w-4" />{lt("New Bill")}</Link>
            </PermissionButton>
          </>
        }
      />

      <MasterShipmentBillContext shipment={shipment} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={billsQuery.data?.items ?? []}
            columns={columns}
            totalCount={billsQuery.data?.totalCount ?? 0}
            pageNumber={billsQuery.data?.pageNumber ?? pageNumber}
            pageSize={billsQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search vendor bill number, MAWB, MBL, master number, or status")}
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
                      await cancel.mutateAsync({ id: row.id, reason: lt("Cancelled from master shipment bills page") });
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

function MasterShipmentBillContext({ shipment }: { shipment: MasterShipmentDto }) {
  const referenceNo = shipment.mawbNumber || shipment.mblNumber || shipment.masterShipmentNumber;
  const origin = formatPort(shipment.originPortCode, shipment.originPortName, shipment.originPortCountryName);
  const destination = formatPort(shipment.destinationPortCode, shipment.destinationPortName, shipment.destinationPortCountryName);
  const linkedJobs = new Set(shipment.items.map((x) => x.houseShipmentId || x.sourceEntityId).filter(Boolean)).size;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">{lt("Master Ref")} {referenceNo}</Badge>
          <StatusBadge status={shipment.status} />
          <span className="text-sm text-muted-foreground">{origin} {lt("to")} {destination}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Field label={lt("Master No")}>{shipment.masterShipmentNumber}</Field>
          <Field label={lt("MAWB/MBL")}>{shipment.mawbNumber || shipment.mblNumber || "-"}</Field>
          <Field label={lt("Mode")}>{shipment.modeOfTransport || "-"}</Field>
          <Field label={lt("Carrier")}>{shipment.carrierName || "-"}</Field>
          <Field label={lt("Origin Port")}>{origin}</Field>
          <Field label={lt("Destination Port")}>{destination}</Field>
          <Field label={lt("ETD - Expected Time of Departure")}><DateDisplay value={shipment.etd} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={lt("ETA - Expected Time of Arrival")}><DateDisplay value={shipment.eta} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={lt("Total Pieces")}>{Number(shipment.totalPieces || 0).toFixed(0)}</Field>
          <Field label={lt("Total Weight")}>{Number(shipment.totalWeight || 0).toFixed(2)} KG</Field>
          <Field label={lt("Total Volume")}>{Number(shipment.totalVolume || 0).toFixed(4)} CBM</Field>
          <Field label={lt("Linked Jobs")}>{linkedJobs}</Field>
          <Field label={lt("Total Cost")}><CurrencyAmount value={shipment.totalCostAmount} /></Field>
          <Field label={lt("Allocated Cost")}><CurrencyAmount value={shipment.totalAllocatedCost} /></Field>
          <Field label={lt("Allocation Method")}>{shipment.costAllocationMethod || "-"}</Field>
          <Field label={lt("Status")}><StatusBadge status={shipment.status} /></Field>
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

function formatPort(code?: string | null, name?: string | null, country?: string | null) {
  return [[code, name].filter(Boolean).join(" - "), country].filter(Boolean).join(" - ") || "-";
}
