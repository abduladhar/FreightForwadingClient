import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteVendor, searchVendors, type VendorDto } from "@/api/vendorApi";
import { useAuth } from "@/auth/useAuth";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function VendorListPage() {
  const m = useMasterDataI18n("Vendor");
  const { hasPermission } = useAuth();
  const [pageNumber, setPageNumber] = useState(1); const [pageSize, setPageSize] = useState(10); const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["vendors", pageNumber, pageSize, search], queryFn: () => searchVendors({ pageNumber, pageSize, search }) });
  const queryClient = useQueryClient();
  const remove = useMutation({ mutationFn: deleteVendor, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["vendors"] }) });
  const columns: ColumnDef<VendorDto>[] = [{ accessorKey: "vendorCode", header: m("Code") }, { accessorKey: "vendorName", header: m("Name") }, { accessorKey: "vendorType", header: m("Type") }, { accessorKey: "email", header: m("Email") }, { id: "status", header: m("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }];
  return <div className="space-y-4"><PageHeader title={m("Vendors")} description={m("Vendor master with currency and payment profile.")} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="Vendor.Create"><Link to="/vendors/new"><Plus className="h-4 w-4" /> {m("New Vendor")}</Link></PermissionButton></>} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <VendorActions row={row} hasPermission={hasPermission} onDelete={() => remove.mutateAsync(row.id)} />} /></CardContent></Card></div>;
}

function VendorActions({ row, hasPermission, onDelete }: { row: VendorDto; hasPermission: (permission?: string | string[]) => boolean; onDelete: () => Promise<void> }) {
  const m = useMasterDataI18n("Vendor");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 min-h-10 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{m("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("Vendor.Read") ? <DropdownMenuItem asChild><Link to={`/vendors/${row.id}`}><Eye className="mr-2 h-4 w-4" /> {m("View Vendor")}</Link></DropdownMenuItem> : null}
        {hasPermission("Vendor.Update") ? <DropdownMenuItem asChild><Link to={`/vendors/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> {m("Edit Vendor")}</Link></DropdownMenuItem> : null}
        {hasPermission("Vendor.Delete") ? (
          <ConfirmDialog title={m("Delete vendor?")} description={row.vendorName} confirmText={m("Delete")} variant="danger" onConfirm={onDelete}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4 text-red-600" /> {m("Delete Vendor")}
            </DropdownMenuItem>
          </ConfirmDialog>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
