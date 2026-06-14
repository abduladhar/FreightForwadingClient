import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { createStockTransaction, getStockTransactions, searchWarehouseLocations, searchWarehouses, type StockTransactionDto } from "@/api/warehouseApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WarehouseStockTransactionPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [goodsReceiptItemId, setGoodsReceiptItemId] = useState("");
  const queryClient = useQueryClient();
  const warehouseQuery = useQuery({ queryKey: ["warehouse-transaction-warehouses"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const locationQuery = useQuery({ queryKey: ["warehouse-transaction-locations"], queryFn: () => searchWarehouseLocations({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const [newTx, setNewTx] = useState({ transactionType: "StockIn", goodsReceiptItemId: "", warehouseId: "", warehouseLocationId: "", pieces: "0", weight: "0", volume: "0", referenceType: "Manual", referenceId: "", remarks: "" });
  const query = useQuery({ queryKey: ["warehouse-stock-transactions", goodsReceiptItemId], queryFn: () => getStockTransactions(goodsReceiptItemId || undefined) });
  const mutation = useMutation({
    mutationFn: () => createStockTransaction({
      transactionType: newTx.transactionType,
      goodsReceiptItemId: newTx.goodsReceiptItemId,
      warehouseId: newTx.warehouseId,
      warehouseLocationId: newTx.warehouseLocationId,
      pieces: Number(newTx.pieces),
      weight: Number(newTx.weight),
      volume: Number(newTx.volume),
      referenceType: newTx.referenceType,
      referenceId: newTx.referenceId || null,
      remarks: newTx.remarks || null
    }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["warehouse-stock-transactions"] })
  });
  const rows = query.data ?? [];
  const filteredLocations = (locationQuery.data?.items ?? []).filter((x) => !newTx.warehouseId || x.warehouseId === newTx.warehouseId);
  const canPost = hasPermission("Warehouse.Update")
    && Boolean(newTx.transactionType.trim())
    && Boolean(newTx.goodsReceiptItemId.trim())
    && Boolean(newTx.warehouseId)
    && Boolean(newTx.warehouseLocationId)
    && Number(newTx.pieces) > 0;
  const columns: ColumnDef<StockTransactionDto>[] = [
    { accessorKey: "transactionDate", header: "Date" },
    { accessorKey: "transactionType", header: "Type" },
    { accessorKey: "referenceType", header: "Reference" },
    { accessorKey: "pieces", header: "Pieces" },
    { accessorKey: "weight", header: "Weight" },
    { accessorKey: "volume", header: "Volume" },
    { accessorKey: "remarks", header: "Remarks" }
  ];
  return <div className="space-y-4"><PageHeader title="Stock Transactions" description="Track all stock movement transactions." actions={<AuditTrailButton />} /><Card><CardContent className="space-y-4 pt-6"><div className="grid gap-2 md:grid-cols-5"><select className="h-10 rounded-md border px-3 text-sm" value={newTx.transactionType} onChange={(e) => setNewTx({ ...newTx, transactionType: e.target.value })}><option value="StockIn">StockIn</option><option value="StockOut">StockOut</option><option value="TransferOut">TransferOut</option><option value="TransferIn">TransferIn</option><option value="Damage">Damage</option><option value="Return">Return</option></select><Input placeholder="GoodsReceiptItemId" value={newTx.goodsReceiptItemId} onChange={(e) => setNewTx({ ...newTx, goodsReceiptItemId: e.target.value })} /><select className="h-10 rounded-md border px-3 text-sm" value={newTx.warehouseId} onChange={(e) => setNewTx({ ...newTx, warehouseId: e.target.value, warehouseLocationId: "" })}><option value="">Select warehouse</option>{(warehouseQuery.data?.items ?? []).map((w) => <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>)}</select><select className="h-10 rounded-md border px-3 text-sm" value={newTx.warehouseLocationId} onChange={(e) => setNewTx({ ...newTx, warehouseLocationId: e.target.value })}><option value="">Select location</option>{filteredLocations.map((l) => <option key={l.id} value={l.id}>{l.locationCode}</option>)}</select><PermissionButton permission="Warehouse.Update" onClick={() => void mutation.mutate()} disabled={!canPost || mutation.isPending}>Post</PermissionButton></div><div className="grid gap-2 md:grid-cols-3">{field("Pieces", <Input type="number" min="0" step="0.01" value={newTx.pieces} onChange={(e) => setNewTx({ ...newTx, pieces: e.target.value })} />)}{field("Weight", <Input type="number" min="0" step="0.01" value={newTx.weight} onChange={(e) => setNewTx({ ...newTx, weight: e.target.value })} />)}{field("Volume", <Input type="number" min="0" step="0.01" value={newTx.volume} onChange={(e) => setNewTx({ ...newTx, volume: e.target.value })} />)}</div><Input placeholder="Filter by GoodsReceiptItemId" value={goodsReceiptItemId} onChange={(e) => setGoodsReceiptItemId(e.target.value)} /><DataTable data={rows} columns={columns} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} search={search} onSearchChange={setSearch} onPaginationChange={() => undefined} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => hasPermission("Warehouse.Read") ? <Button size="sm" variant="outline" onClick={() => setGoodsReceiptItemId(row.goodsReceiptItemId)}>Track Similar</Button> : null} /></CardContent></Card></div>;
}

function field(label: string, element: ReactNode) {
  return <div className="space-y-1"><Label>{label}</Label>{element}</div>;
}
