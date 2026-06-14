import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { deleteWarehouse, searchWarehouses, type WarehouseDto } from "@/api/warehouseApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function WarehouseListPage() {
  const m = useMasterDataI18n("Warehouse");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["warehouses", pageNumber, pageSize, search], queryFn: () => searchWarehouses({ pageNumber, pageSize, search }) });
  const remove = useMutation({ mutationFn: deleteWarehouse, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }) });
  const columns: ColumnDef<WarehouseDto>[] = [
    { accessorKey: "warehouseCode", header: m("Code") },
    { accessorKey: "warehouseName", header: m("Name") },
    { accessorKey: "contactPerson", header: m("Contact") },
    { accessorKey: "phone", header: m("Phone") },
    { accessorKey: "isActive", header: m("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];
  return <div className="space-y-4"><PageHeader title={m("Warehouses")} description={m("Warehouse master and stock controls.")} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="Warehouse.Create"><Link to="/warehouses/new"><Plus className="h-4 w-4" /> {m("New Warehouse")}</Link></PermissionButton></>} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <div className="flex items-center gap-1"><PermissionButton className={masterDataButtonClass} asChild permission="Warehouse.Update" size="sm" variant="ghost"><Link to={`/warehouses/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton><PermissionButton className={masterDataButtonClass} asChild permission="Warehouse.Read" size="sm" variant="ghost"><Link to={`/warehouses/${row.id}/locations`}><Settings className="h-4 w-4" /></Link></PermissionButton>{hasPermission("Warehouse.Delete") ? <ConfirmDialog title={m("Delete warehouse?")} description={row.warehouseName} confirmText={m("Delete")} variant="danger" onConfirm={async () => remove.mutateAsync(row.id)}><Button className={masterDataButtonClass} size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-600" /></Button></ConfirmDialog> : null}</div>} /></CardContent></Card></div>;
}
