import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Eye, FilePlus2, Pencil, Scale, XCircle } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getCustomer } from "@/api/customerApi";
import { getDirectShipment, type DirectShipmentDto } from "@/api/directShipmentApi";
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

export function DirectShipmentVendorBillsPage() {
  const { directShipmentId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const shipmentQuery = useQuery({
    queryKey: ["direct-shipment-bills-context", directShipmentId],
    queryFn: () => getDirectShipment(directShipmentId!),
    enabled: Boolean(directShipmentId)
  });
  const customerQuery = useQuery({
    queryKey: ["direct-shipment-bills-customer", shipmentQuery.data?.customerId],
    queryFn: () => getCustomer(shipmentQuery.data!.customerId),
    enabled: Boolean(shipmentQuery.data?.customerId)
  });
  const billsQuery = useQuery({
    queryKey: ["direct-shipment-vendor-bills", directShipmentId, pageNumber, pageSize, search],
    queryFn: () => searchVendorBills({ pageNumber, pageSize, search, sourceType: "DirectShipment", sourceId: directShipmentId! }),
    enabled: Boolean(directShipmentId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "direct-shipment-vendor-bills"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const approve = useMutation({
    mutationFn: approveVendorBill,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["direct-shipment-vendor-bills"] })
  });
  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelVendorBill(id, reason),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["direct-shipment-vendor-bills"] })
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

  if (!directShipmentId) return <Navigate to="/direct-shipments" replace />;
  if (shipmentQuery.isLoading) return <LoadingScreen />;
  if (shipmentQuery.isError || !shipmentQuery.data) return <ErrorState onRetry={() => void shipmentQuery.refetch()} />;

  const shipment = shipmentQuery.data;
  const customerName = customerQuery.data?.customerName ?? shipment.customerId;
  const createBillPath = `/vendor-bills/new?${new URLSearchParams({
    sourceType: "DirectShipment",
    sourceId: directShipmentId,
    expectedCostAmount: String(shipment.costAmount ?? 0)
  }).toString()}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Direct Shipment Vendor Bills")}
        description={`Expense bills for ${shipment.mawbNumber || shipment.directShipmentNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="DirectShipment.Read" variant="outline">
              <Link to={`/direct-shipments/${directShipmentId}`}>
                <Eye className="h-4 w-4" />{lt("Direct Shipment")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="VendorBill.Create">
              <Link to={createBillPath}>
                <FilePlus2 className="h-4 w-4" />{lt("New Bill")}</Link>
            </PermissionButton>
          </>
        }
      />

      <DirectShipmentBillContext shipment={shipment} customerName={customerName} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={billsQuery.data?.items ?? []}
            columns={columns}
            totalCount={billsQuery.data?.totalCount ?? 0}
            pageNumber={billsQuery.data?.pageNumber ?? pageNumber}
            pageSize={billsQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search vendor bill number, MAWB, direct shipment number, or status")}
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
                      await cancel.mutateAsync({ id: row.id, reason: "Cancelled from direct shipment bills page" });
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

function DirectShipmentBillContext({ shipment, customerName }: { shipment: DirectShipmentDto; customerName: string }) {
  const totals = shipment.items.reduce(
    (sum, item) => ({
      pieces: sum.pieces + Number(item.pieces || item.loadedPieces || item.receivedPieces || 0),
      weight: sum.weight + Number(item.weight || item.loadedWeight || item.receivedWeight || 0),
      volume: sum.volume + Number(item.volume || item.loadedVolume || item.volumeCbm || 0)
    }),
    { pieces: 0, weight: 0, volume: 0 }
  );
  const origin = formatPort(shipment.originPortCode, shipment.originPortName, shipment.originPortCountryName, shipment.origin);
  const destination = formatPort(shipment.destinationPortCode, shipment.destinationPortName, shipment.destinationPortCountryName, shipment.destination);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">Reference {shipment.mawbNumber || shipment.directShipmentNumber}</Badge>
          <StatusBadge status={shipment.status} />
          <span className="text-sm text-muted-foreground">{origin} to {destination}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Field label={lt("Customer")}>{customerName}</Field>
          <Field label={lt("Direct Shipment No")}>{shipment.directShipmentNumber}</Field>
          <Field label={lt("Master Waybill No")}>{shipment.mawbNumber || "-"}</Field>
          <Field label={lt("Mode")}>{shipment.modeOfTransport || "-"}</Field>
          <Field label={lt("Origin Port")}>{origin}</Field>
          <Field label={lt("Destination Port")}>{destination}</Field>
          <Field label={lt("ETD")}><DateDisplay value={shipment.etd} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={lt("ETA")}><DateDisplay value={shipment.eta} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={lt("Carrier")}>{shipment.carrierName || "-"}</Field>
          <Field label={lt("Flight/Vessel/Truck")}>{shipment.flightNumber || shipment.vesselName || shipment.truckNumber || "-"}</Field>
          <Field label={lt("Loaded")}>{totals.pieces.toFixed(0)} pcs / {totals.weight.toFixed(2)} kg / {totals.volume.toFixed(4)} cbm</Field>
          <Field label={lt("Cost")}><CurrencyAmount value={shipment.costAmount} /></Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border p-3">
            <h3 className="mb-2 text-sm font-semibold">{lt("Shipper Information")}</h3>
            <Field label={lt("Name")}>{shipment.shipperName || "-"}</Field>
            <Field label={lt("Contact")}>{shipment.shipperPhoneNumber || "-"}</Field>
            <Field label={lt("Address")}><span className="whitespace-pre-wrap">{shipment.shipperAddress || "-"}</span></Field>
          </div>
          <div className="rounded-md border p-3">
            <h3 className="mb-2 text-sm font-semibold">{lt("Consignee Information")}</h3>
            <Field label={lt("Name")}>{shipment.consigneeName || "-"}</Field>
            <Field label={lt("Contact")}>{shipment.consigneePhoneNumber || "-"}</Field>
            <Field label={lt("Address")}><span className="whitespace-pre-wrap">{shipment.consigneeAddress || "-"}</span></Field>
          </div>
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

function formatPort(code?: string | null, name?: string | null, country?: string | null, fallback?: string | null) {
  const main = [code, name].filter(Boolean).join(" - ");
  return [main || fallback, country].filter(Boolean).join(" - ") || "-";
}
