import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { Eye, FileText, Pencil, Plus, Printer } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { searchInvoices, type InvoiceDto } from "@/api/invoiceApi";
import { getMasterShipment, type MasterShipmentDto } from "@/api/masterShipmentApi";
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

export function MasterShipmentInvoicesPage() {
  const { masterShipmentId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const shipmentQuery = useQuery({
    queryKey: ["master-shipment-invoices-context", masterShipmentId],
    queryFn: () => getMasterShipment(masterShipmentId!),
    enabled: Boolean(masterShipmentId)
  });
  const invoicesQuery = useQuery({
    queryKey: ["master-shipment-invoices", masterShipmentId, pageNumber, pageSize, search],
    queryFn: () => searchInvoices({ pageNumber, pageSize, search, sourceType: "MasterShipment", sourceId: masterShipmentId! }),
    enabled: Boolean(masterShipmentId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "master-shipment-invoices"], queryFn: getTenantCurrencies });
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

  if (!masterShipmentId) return <Navigate to="/master-shipments" replace />;
  if (shipmentQuery.isLoading) return <LoadingScreen />;
  if (shipmentQuery.isError || !shipmentQuery.data) return <ErrorState onRetry={() => void shipmentQuery.refetch()} />;

  const shipment = shipmentQuery.data;
  const createInvoicePath = `/invoices/new?sourceType=MasterShipment&sourceId=${encodeURIComponent(masterShipmentId)}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Master Shipment Invoices")}
        description={`${lt("Invoices for")} ${shipment.masterShipmentNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="MasterShipment.Read" variant="outline">
              <Link to={`/master-shipments/${masterShipmentId}`}>
                <Eye className="h-4 w-4" />{lt("Master Shipment")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="Invoice.Create">
              <Link to={createInvoicePath}>
                <Plus className="h-4 w-4" />{lt("New Invoice")}</Link>
            </PermissionButton>
          </>
        }
      />

      <MasterShipmentContext shipment={shipment} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={invoicesQuery.data?.items ?? []}
            columns={columns}
            totalCount={invoicesQuery.data?.totalCount ?? 0}
            pageNumber={invoicesQuery.data?.pageNumber ?? pageNumber}
            pageSize={invoicesQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search invoice number, master reference, or status")}
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

function MasterShipmentContext({ shipment }: { shipment: MasterShipmentDto }) {
  const referenceNo = shipment.mawbNumber || shipment.mblNumber || shipment.masterShipmentNumber;
  const origin = formatPort(shipment.originPortCode, shipment.originPortName, shipment.originPortCountryName);
  const destination = formatPort(shipment.destinationPortCode, shipment.destinationPortName, shipment.destinationPortCountryName);
  const uniqueCustomersOrJobs = new Set(shipment.items.map((x) => x.houseShipmentId || x.sourceEntityId).filter(Boolean)).size;

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
          <Field label={lt("Linked Jobs")}>{uniqueCustomersOrJobs}</Field>
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
