import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getAvailableStock, searchWarehouses, type AvailableStockDto } from "@/api/warehouseApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function WarehouseStockPage() {
  const [warehouseId, setWarehouseId] = useState("");
  const [search, setSearch] = useState("");
  const warehouseQuery = useQuery({ queryKey: ["warehouse-list-lookup"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 200 }) });
  const stockQuery = useQuery({ queryKey: ["available-stock", warehouseId], queryFn: () => getAvailableStock(warehouseId || undefined), enabled: Boolean(warehouseId) });
  const rows = stockQuery.data ?? [];
  const columns: ColumnDef<AvailableStockDto>[] = [
    { accessorKey: "warehouseCode", header: "Warehouse" },
    { accessorKey: "locationCode", header: "Location" },
    { accessorKey: "availablePieces", header: "Available Pieces" },
    { accessorKey: "reservedPieces", header: "Reserved Pieces" },
    { accessorKey: "damagedPieces", header: "Damaged Pieces" },
    { accessorKey: "returnedPieces", header: "Returned Pieces" },
    { accessorKey: "weight", header: "Weight" },
    { accessorKey: "volume", header: "Volume" }
  ];
  return <div className="space-y-4"><PageHeader title="Warehouse Stock" description="Current stock visibility by location." /><Card><CardContent className="space-y-4 pt-6"><select className="h-10 rounded-md border px-3 text-sm" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}><option value="">Select warehouse</option>{(warehouseQuery.data?.items ?? []).map((w) => <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>)}</select><DataTable data={rows} columns={columns} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} search={search} onSearchChange={setSearch} onPaginationChange={() => undefined} isLoading={stockQuery.isLoading} isError={stockQuery.isError} onRetry={() => void stockQuery.refetch()} /></CardContent></Card></div>;
}
