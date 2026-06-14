import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { Eye, FileText, Pencil, Plus, Printer } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getCustomer } from "@/api/customerApi";
import { getGoodsReceipt, type GoodsReceiptDto } from "@/api/goodsReceiptApi";
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

export function GoodsReceiptInvoicesPage() {
  const { goodsReceiptId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const receiptQuery = useQuery({
    queryKey: ["goods-receipt-invoices-context", goodsReceiptId],
    queryFn: () => getGoodsReceipt(goodsReceiptId!),
    enabled: Boolean(goodsReceiptId)
  });
  const customerQuery = useQuery({
    queryKey: ["goods-receipt-invoices-customer", receiptQuery.data?.customerId],
    queryFn: () => getCustomer(receiptQuery.data!.customerId),
    enabled: Boolean(receiptQuery.data?.customerId)
  });
  const invoicesQuery = useQuery({
    queryKey: ["goods-receipt-invoices", goodsReceiptId, pageNumber, pageSize, search],
    queryFn: () => searchInvoices({ pageNumber, pageSize, search, sourceType: "GoodsReceipt", sourceId: goodsReceiptId! }),
    enabled: Boolean(goodsReceiptId)
  });
  const currenciesQuery = useQuery({
    queryKey: ["tenant-currencies", "goods-receipt-invoices"],
    queryFn: getTenantCurrencies
  });
  const currencyCodes = useMemo(
    () => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])),
    [currenciesQuery.data]
  );

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

  if (!goodsReceiptId) return <Navigate to="/goods-receipts" replace />;
  if (receiptQuery.isLoading) return <LoadingScreen />;
  if (receiptQuery.isError || !receiptQuery.data) return <ErrorState onRetry={() => void receiptQuery.refetch()} />;

  const receipt = receiptQuery.data;
  const customerName = customerQuery.data?.customerName ?? receipt.customerId;
  const createInvoicePath = `/invoices/new?sourceType=GoodsReceipt&sourceId=${encodeURIComponent(goodsReceiptId)}&customerId=${encodeURIComponent(receipt.customerId)}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Goods Receipt Invoices")}
        description={`Invoices for ${receipt.goodsReceiptNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="GoodsReceipt.Read" variant="outline">
              <Link to={`/goods-receipts/${goodsReceiptId}`}>
                <Eye className="h-4 w-4" />{lt("Goods Receipt")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="Invoice.Create">
              <Link to={createInvoicePath}>
                <Plus className="h-4 w-4" />{lt("New Invoice")}</Link>
            </PermissionButton>
          </>
        }
      />

      <GoodsReceiptContext receipt={receipt} customerName={customerName} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={invoicesQuery.data?.items ?? []}
            columns={columns}
            totalCount={invoicesQuery.data?.totalCount ?? 0}
            pageNumber={invoicesQuery.data?.pageNumber ?? pageNumber}
            pageSize={invoicesQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search invoice number, Goods Receipt Note number, or status")}
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

function GoodsReceiptContext({ receipt, customerName }: { receipt: GoodsReceiptDto; customerName: string }) {
  const totals = receipt.items.reduce(
    (sum, item) => ({
      pieces: sum.pieces + Number(item.receivedPieces || 0),
      weight: sum.weight + Number(item.receivedWeight || 0),
      volume: sum.volume + Number(item.volumeCbm || 0),
      available: sum.available + Number(item.availablePieces || 0)
    }),
    { pieces: 0, weight: 0, volume: 0, available: 0 }
  );

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">{lt("Goods Receipt Note")} {receipt.goodsReceiptNumber}</Badge>
          <StatusBadge status={receipt.status} />
          <span className="text-sm text-muted-foreground">Received from {receipt.receivedFrom}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label={lt("Customer")}>{customerName}</Field>
          <Field label={lt("Received Date")}><DateDisplay value={receipt.receivedDateTime} pattern="dd MMM yyyy HH:mm" /></Field>
          <Field label={lt("Warehouse Location")}>{receipt.warehouseLocation || "-"}</Field>
          <Field label={lt("Pickup Reference")}>{receipt.pickupId || "-"}</Field>
          <Field label={lt("Total Packages")}>{totals.pieces.toFixed(0)}</Field>
          <Field label={lt("Gross Weight")}>{totals.weight.toFixed(2)}</Field>
          <Field label={lt("Volume")}>{totals.volume.toFixed(4)}</Field>
          <Field label={lt("Available Packages")}>{totals.available.toFixed(0)}</Field>
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
