import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { createWarehouseLocation, deleteWarehouseLocation, searchWarehouseLocations, type WarehouseLocationRequest, updateWarehouseLocation } from "@/api/warehouseApi";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/auth/PermissionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function WarehouseLocationPage() {
  const { warehouseId = "" } = useParams();
  const [search, setSearch] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRack, setNewRack] = useState("");
  const [newBin, setNewBin] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["warehouse-locations", warehouseId, search], queryFn: () => searchWarehouseLocations({ pageNumber: 1, pageSize: 200, search }) });
  const createMutation = useMutation({
    mutationFn: (request: WarehouseLocationRequest) => createWarehouseLocation(request),
    onSuccess: async () => { setNewCode(""); setNewRack(""); setNewBin(""); await queryClient.invalidateQueries({ queryKey: ["warehouse-locations"] }); }
  });
  const updateMutation = useMutation({ mutationFn: ({ id, request }: { id: string; request: WarehouseLocationRequest }) => updateWarehouseLocation(id, request), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["warehouse-locations"] }) });
  const deleteMutation = useMutation({ mutationFn: deleteWarehouseLocation, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["warehouse-locations"] }) });
  const rows = query.data?.items ?? [];
  const columns: ColumnDef<(typeof rows)[number]>[] = [
    { accessorKey: "locationCode", header: "Location" },
    { accessorKey: "rack", header: "Rack" },
    { accessorKey: "bin", header: "Bin" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];
  return <div className="space-y-4"><PageHeader title="Warehouse Locations" description="Manage rack/bin locations for this warehouse." /><Card><CardContent className="space-y-4 pt-6"><div className="grid gap-2 md:grid-cols-4"><Input placeholder="Location code" value={newCode} onChange={(e) => setNewCode(e.target.value)} /><Input placeholder="Rack" value={newRack} onChange={(e) => setNewRack(e.target.value)} /><Input placeholder="Bin" value={newBin} onChange={(e) => setNewBin(e.target.value)} /><PermissionButton permission="Warehouse.Update" onClick={() => void createMutation.mutateAsync({ warehouseId, locationCode: newCode, rack: newRack || null, bin: newBin || null, description: null, isActive: true })} disabled={!newCode.trim()}><Plus className="h-4 w-4" /> Add</PermissionButton></div><DataTable data={rows} columns={columns} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} search={search} onSearchChange={setSearch} onPaginationChange={() => undefined} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <div className="flex gap-1"><PermissionButton permission="Warehouse.Update" size="sm" variant="outline" onClick={() => void updateMutation.mutateAsync({ id: row.id, request: { warehouseId: row.warehouseId, locationCode: row.locationCode, rack: row.rack ?? null, bin: row.bin ?? null, description: row.description ?? null, isActive: !row.isActive } })}>{row.isActive ? "Deactivate" : "Activate"}</PermissionButton><ConfirmDialog title="Delete location?" description={row.locationCode} confirmText="Delete" variant="danger" onConfirm={async () => deleteMutation.mutateAsync(row.id)}><PermissionButton permission="Warehouse.Delete" size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-600" /></PermissionButton></ConfirmDialog></div>} /></CardContent></Card></div>;
}
