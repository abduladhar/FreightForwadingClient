import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Eye, FilePlus2, Pencil, Scale, XCircle } from "lucide-react";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getCustomer } from "@/api/customerApi";
import { getGoodsReceipt, type GoodsReceiptDto } from "@/api/goodsReceiptApi";
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

export function GoodsReceiptVendorBillsPage() {
  const { goodsReceiptId } = useParams();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const receiptQuery = useQuery({
    queryKey: ["goods-receipt-bills-context", goodsReceiptId],
    queryFn: () => getGoodsReceipt(goodsReceiptId!),
    enabled: Boolean(goodsReceiptId)
  });
  const customerQuery = useQuery({
    queryKey: ["goods-receipt-bills-customer", receiptQuery.data?.customerId],
    queryFn: () => getCustomer(receiptQuery.data!.customerId),
    enabled: Boolean(receiptQuery.data?.customerId)
  });
  const billsQuery = useQuery({
    queryKey: ["goods-receipt-vendor-bills", goodsReceiptId, pageNumber, pageSize, search],
    queryFn: () => searchVendorBills({ pageNumber, pageSize, search, sourceType: "GoodsReceipt", sourceId: goodsReceiptId! }),
    enabled: Boolean(goodsReceiptId)
  });
  const currenciesQuery = useQuery({ queryKey: ["tenant-currencies", "goods-receipt-vendor-bills"], queryFn: getTenantCurrencies });
  const currencyCodes = useMemo(() => new Map((currenciesQuery.data ?? []).map((currency) => [currency.currencyId, currency.currencyCode])), [currenciesQuery.data]);

  const approve = useMutation({ mutationFn: approveVendorBill, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["goods-receipt-vendor-bills"] }) });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelVendorBill(id, reason), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["goods-receipt-vendor-bills"] }) });

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

  if (!goodsReceiptId) return <Navigate to="/goods-receipts" replace />;
  if (receiptQuery.isLoading) return <LoadingScreen />;
  if (receiptQuery.isError || !receiptQuery.data) return <ErrorState onRetry={() => void receiptQuery.refetch()} />;

  const receipt = receiptQuery.data;
  const customerName = customerQuery.data?.customerName ?? receipt.customerId;
  const createBillPath = `/vendor-bills/new?${new URLSearchParams({ sourceType: "GoodsReceipt", sourceId: goodsReceiptId, expectedCostAmount: "0" }).toString()}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Goods Receipt Vendor Bills")}
        description={`Expense bills for ${receipt.goodsReceiptNumber}`}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="GoodsReceipt.Read" variant="outline">
              <Link to={`/goods-receipts/${goodsReceiptId}`}><Eye className="h-4 w-4" />{lt("Goods Receipt")}</Link>
            </PermissionButton>
            <PermissionButton asChild permission="VendorBill.Create">
              <Link to={createBillPath}><FilePlus2 className="h-4 w-4" />{lt("New Bill")}</Link>
            </PermissionButton>
          </>
        }
      />

      <GoodsReceiptBillContext receipt={receipt} customerName={customerName} />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={billsQuery.data?.items ?? []}
            columns={columns}
            totalCount={billsQuery.data?.totalCount ?? 0}
            pageNumber={billsQuery.data?.pageNumber ?? pageNumber}
            pageSize={billsQuery.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search vendor bill number, Goods Receipt Note number, or status")}
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
                  <Button size="sm" variant="ghost" onClick={() => void approve.mutateAsync(row.id)}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </Button>
                ) : null}
                {hasPermission("VendorBill.Cancel") && row.status !== "Cancelled" ? (
                  <ConfirmDialog title={lt("Cancel vendor bill?")} description={row.vendorBillNumber} confirmText={lt("Cancel Bill")} variant="danger" onConfirm={async () => { await cancel.mutateAsync({ id: row.id, reason: "Cancelled from goods receipt bills page" }); }}>
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

function GoodsReceiptBillContext({ receipt, customerName }: { receipt: GoodsReceiptDto; customerName: string }) {
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
