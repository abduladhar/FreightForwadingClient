import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { createStockTransaction, getStockTransactions, getAvailableStock, type StockTransactionDto } from "@/api/warehouseApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ReturnedGoodsPage() {
  const [search, setSearch] = useState("");
  const [stockRef, setStockRef] = useState("");
  const [pieces, setPieces] = useState("0");
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const available = useQuery({ queryKey: ["warehouse-ops-return-available"], queryFn: () => getAvailableStock() });
  const transactions = useQuery({ queryKey: ["warehouse-ops-return-tx"], queryFn: () => getStockTransactions() });
  const selected = useMemo(() => available.data?.find((x) => `${x.goodsReceiptItemId}|${x.warehouseId}|${x.warehouseLocationId}` === stockRef), [available.data, stockRef]);
  const mutation = useMutation({
    mutationFn: () => {
      return createStockTransaction({
        transactionType: "Return",
        goodsReceiptItemId: selected?.goodsReceiptItemId ?? "",
        warehouseId: selected?.warehouseId ?? "",
        warehouseLocationId: selected?.warehouseLocationId ?? "",
        pieces: Number(pieces),
        weight: 0,
        volume: 0,
        referenceType: "Return",
        referenceId: null,
        remarks: remarks || null
      });
    },
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["warehouse-ops-return-tx"] })
  });
  const rows = useMemo(() => (transactions.data ?? []).filter((x) => x.transactionType === "Return"), [transactions.data]);
  const columns: ColumnDef<StockTransactionDto>[] = [
    { accessorKey: "transactionDate", header: "Date" },
    { accessorKey: "goodsReceiptItemId", header: "GR Item Ref" },
    { accessorKey: "pieces", header: "Returned Pieces" },
    { accessorKey: "remarks", header: "Remarks" }
  ];
  const exceeds = Number(pieces) > (selected?.availablePieces ?? 0);
  return <div className="space-y-4"><PageHeader title="Returned Goods Handling" description="Register returned goods and update warehouse transaction history." actions={<AuditTrailButton />} /><Card><CardContent className="space-y-4 pt-6"><div className="grid gap-3 md:grid-cols-4"><select className="h-10 rounded-md border px-3 text-sm" value={stockRef} onChange={(e) => setStockRef(e.target.value)}><option value="">Select stock item</option>{(available.data ?? []).map((x) => <option key={`${x.goodsReceiptItemId}|${x.warehouseLocationId}`} value={`${x.goodsReceiptItemId}|${x.warehouseId}|${x.warehouseLocationId}`}>{x.warehouseCode}/{x.locationCode} - {x.goodsReceiptItemId} (Avail {x.availablePieces})</option>)}</select><Input type="number" min="0" value={pieces} onChange={(e) => setPieces(e.target.value)} placeholder="Returned pieces" /><Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Return remarks" /><PermissionButton permission="Warehouse.Update" onClick={() => void mutation.mutate()} disabled={!stockRef || Number(pieces) <= 0 || exceeds || mutation.isPending}>Mark Returned</PermissionButton></div>{exceeds ? <p className="text-sm text-red-600">Cannot mark returned quantity greater than available pieces.</p> : null}<DataTable data={rows} columns={columns} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} search={search} onSearchChange={setSearch} onPaginationChange={() => undefined} isLoading={transactions.isLoading} isError={transactions.isError} onRetry={() => void transactions.refetch()} /></CardContent></Card></div>;
}
