import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { Eye, FileText, Pencil, Plus, Printer } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getCustomer } from "@/api/customerApi";
import { searchInvoices, type InvoiceDto } from "@/api/invoiceApi";
import { getPickup, type PickupDto } from "@/api/pickupApi";
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
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PickupInvoicesPage() {
  const { pickupId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const p = usePickupI18n();

  const pickupQuery = useQuery({
    queryKey: ["pickup-invoices-context", pickupId],
    queryFn: () => getPickup(pickupId!),
    enabled: Boolean(pickupId)
  });
  const customerQuery = useQuery({
    queryKey: ["pickup-invoices-customer", pickupQuery.data?.customerId],
    queryFn: () => getCustomer(pickupQuery.data!.customerId),
    enabled: Boolean(pickupQuery.data?.customerId)
  });
  const invoicesQuery = useQuery({
    queryKey: ["pickup-invoices", pickupId, pageNumber, pageSize, search],
    queryFn: () => searchInvoices({ pageNumber, pageSize, search, sourceType: "Pickup", sourceId: pickupId! }),
    enabled: Boolean(pickupId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "pickup-invoices"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const columns = useMemo<ColumnDef<InvoiceDto>[]>(
    () => [
      { accessorKey: "invoiceNumber", header: p("Invoice No") },
      { accessorKey: "sourceReferenceNo", header: p("Source Reference No") },
      { accessorKey: "documentType", header: p("Type"), cell: ({ row }) => p(row.original.documentType) },
      { accessorKey: "invoiceDate", header: p("Invoice Date"), cell: ({ row }) => <DateDisplay value={row.original.invoiceDate} /> },
      { accessorKey: "dueDate", header: p("Due Date"), cell: ({ row }) => <DateDisplay value={row.original.dueDate} /> },
      { id: "currency", header: p("Currency"), cell: ({ row }) => currencyCodes.get(row.original.invoiceCurrencyId) ?? "-" },
      { accessorKey: "totalAmount", header: p("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCodes.get(row.original.invoiceCurrencyId)} /> },
      { accessorKey: "outstandingAmount", header: p("Outstanding"), cell: ({ row }) => <CurrencyAmount value={row.original.outstandingAmount} currency={currencyCodes.get(row.original.invoiceCurrencyId)} /> },
      { accessorKey: "status", header: p("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} label={p(row.original.status)} /> }
    ],
    [currencyCodes, p]
  );

  if (!pickupId) return <Navigate to="/pickups" replace />;
  if (pickupQuery.isLoading) return <LoadingScreen />;
  if (pickupQuery.isError || !pickupQuery.data) return <ErrorState onRetry={() => void pickupQuery.refetch()} />;

  const pickup = pickupQuery.data;
  const customerName = customerQuery.data?.customerName ?? pickup.customerId;
  const createInvoicePath = `/invoices/new?sourceType=Pickup&sourceId=${encodeURIComponent(pickupId)}&customerId=${encodeURIComponent(pickup.customerId)}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={p("Pickup Invoices")}
        description={`${p("Invoices for")} ${pickup.pickupNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton className={masterDataButtonClass} asChild permission="Pickup.Read" variant="outline">
              <Link to={`/pickups/${pickupId}`}>
                <Eye className="h-4 w-4" /> {p("Pickup")}
              </Link>
            </PermissionButton>
            <PermissionButton className={masterDataButtonClass} asChild permission="Invoice.Create">
              <Link to={createInvoicePath}>
                <Plus className="h-4 w-4" /> {p("New Invoice")}
              </Link>
            </PermissionButton>
          </>
        }
      />

      <PickupContext pickup={pickup} customerName={customerName} p={p} />

      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <DataTable
            data={invoicesQuery.data?.items ?? []}
            columns={columns}
            totalCount={invoicesQuery.data?.totalCount ?? 0}
            pageNumber={invoicesQuery.data?.pageNumber ?? pageNumber}
            pageSize={invoicesQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={p("Search invoice number, pickup number, or status")}
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
                  <Link to={`/invoices/${row.id}`} title={p("View Invoice")}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </PermissionButton>
                <PermissionButton asChild permission="Invoice.Update" size="sm" variant="ghost">
                  <Link to={`/invoices/${row.id}/edit`} title={p("Edit Invoice")}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </PermissionButton>
                <PermissionButton asChild permission="Invoice.Print" size="sm" variant="outline">
                  <Link to={`/invoices/${row.id}/print?mode=proforma`}>
                    <FileText className="h-4 w-4" /> {p("Proforma")}
                  </Link>
                </PermissionButton>
                <PermissionButton asChild permission="Invoice.Print" size="sm" variant="outline">
                  <Link to={`/invoices/${row.id}/print?mode=original`}>
                    <Printer className="h-4 w-4" /> {p("Invoice")}
                  </Link>
                </PermissionButton>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PickupContext({ pickup, customerName, p }: { pickup: PickupDto; customerName: string; p: (value: string) => string }) {
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
          <Field label={p("Customer")}>{customerName}</Field>
          <Field label={p("Pickup Receipt No")}>{pickup.pickupReceiptNumber || "-"}</Field>
          <Field label={p("Pickup Date")}><DateDisplay value={pickup.pickupDateTime} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={p("Contact")}>{pickup.contactPerson} / {pickup.contactPhone}</Field>
          <Field label={p("Customer Location")}>{pickup.customerLocation}</Field>
          <Field label={p("Drop Location")}>{pickup.dropLocation || "-"}</Field>
          <Field label={p("Consignee")}>{pickup.consigneeName || "-"}</Field>
          <Field label={p("Consignee Contact")}>{pickup.consigneeContactNo || "-"}</Field>
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
