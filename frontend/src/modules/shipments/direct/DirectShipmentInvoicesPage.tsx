import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { Eye, FileText, Pencil, Plus, Printer } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getCustomer } from "@/api/customerApi";
import { getDirectShipment, type DirectShipmentDto } from "@/api/directShipmentApi";
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

export function DirectShipmentInvoicesPage() {
  const { directShipmentId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const shipmentQuery = useQuery({
    queryKey: ["direct-shipment-invoices-context", directShipmentId],
    queryFn: () => getDirectShipment(directShipmentId!),
    enabled: Boolean(directShipmentId)
  });
  const customerQuery = useQuery({
    queryKey: ["direct-shipment-invoices-customer", shipmentQuery.data?.customerId],
    queryFn: () => getCustomer(shipmentQuery.data!.customerId),
    enabled: Boolean(shipmentQuery.data?.customerId)
  });
  const invoicesQuery = useQuery({
    queryKey: ["direct-shipment-invoices", directShipmentId, pageNumber, pageSize, search],
    queryFn: () => searchInvoices({ pageNumber, pageSize, search, sourceType: "DirectShipment", sourceId: directShipmentId! }),
    enabled: Boolean(directShipmentId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "direct-shipment-invoices"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const columns = useMemo<ColumnDef<InvoiceDto>[]>(
    () => [
      { accessorKey: "invoiceNumber", header: lt("Invoice No") },
      { accessorKey: "sourceReferenceNo", header: lt("Source Reference No") },
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

  if (!directShipmentId) return <Navigate to="/direct-shipments" replace />;
  if (shipmentQuery.isLoading) return <LoadingScreen />;
  if (shipmentQuery.isError || !shipmentQuery.data) return <ErrorState onRetry={() => void shipmentQuery.refetch()} />;

  const shipment = shipmentQuery.data;
  const customerName = customerQuery.data?.customerName ?? shipment.customerId;
  const createInvoicePath = `/invoices/new?sourceType=DirectShipment&sourceId=${encodeURIComponent(directShipmentId)}&customerId=${encodeURIComponent(shipment.customerId)}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Direct Shipment Invoices")}
        description={`Invoices for ${shipment.mawbNumber || shipment.directShipmentNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="DirectShipment.Read" variant="outline">
              <Link to={`/direct-shipments/${directShipmentId}`}>
                <Eye className="h-4 w-4" />{lt("Direct Shipment")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="Invoice.Create">
              <Link to={createInvoicePath}>
                <Plus className="h-4 w-4" />{lt("New Invoice")}</Link>
            </PermissionButton>
          </>
        }
      />

      <DirectShipmentContext shipment={shipment} customerName={customerName} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={invoicesQuery.data?.items ?? []}
            columns={columns}
            totalCount={invoicesQuery.data?.totalCount ?? 0}
            pageNumber={invoicesQuery.data?.pageNumber ?? pageNumber}
            pageSize={invoicesQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search invoice number, direct reference, or status")}
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
                  <Link to={`/invoices/${row.id}`} title={lt("View Invoice")}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </PermissionButton>
                <PermissionButton asChild permission="Invoice.Update" size="sm" variant="ghost">
                  <Link to={`/invoices/${row.id}/edit`} title={lt("Edit Invoice")}>
                    <Pencil className="h-4 w-4" />
                  </Link>
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

function DirectShipmentContext({ shipment, customerName }: { shipment: DirectShipmentDto; customerName: string }) {
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
          <Field label={lt("Invoice Ref")}>{shipment.customerInvoiceId || "-"}</Field>
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
