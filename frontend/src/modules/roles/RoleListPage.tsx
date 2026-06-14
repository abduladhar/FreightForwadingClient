import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteRole, getRoles, type RoleDto } from "@/api/roleApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function RoleListPage() {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { hasPermission } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const remove = useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(lt("Role deleted"));
    }
  });

  const filtered = useMemo(() => {
    const items = rolesQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => [x.name, x.description ?? "", ...(x.permissions ?? [])].join(" ").toLowerCase().includes(q));
  }, [rolesQuery.data, search]);
  const paged = filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const columns: ColumnDef<RoleDto>[] = [
    { accessorKey: "name", header: lt("Role") },
    { accessorKey: "description", header: lt("Description") },
    { id: "permissions", header: lt("Permissions"), cell: ({ row }) => row.original.permissions.length },
    { id: "system", header: lt("Type"), cell: ({ row }) => (row.original.isSystemRole ? lt("System") : lt("Custom")) }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Roles")}
        description={lt("Manage role definitions and permission sets.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Role.Create"><Link to="/roles/new"><Plus className="h-4 w-4" />{lt("New Role")}</Link></PermissionButton>
          </>
        }
      />
      <Card><CardContent className="pt-6">
        <DataTable
          data={paged}
          columns={columns}
          totalCount={filtered.length}
          pageNumber={pageNumber}
          pageSize={pageSize}
          search={search}
          onSearchChange={setSearch}
          isLoading={rolesQuery.isLoading}
          isError={rolesQuery.isError}
          onRetry={() => void rolesQuery.refetch()}
          onPaginationChange={(pn, ps) => {
            setPageNumber(pn);
            setPageSize(ps);
          }}
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <Button asChild size="sm" variant="ghost"><Link to={`/permissions/matrix?roleId=${row.id}`}><Eye className="h-4 w-4" /></Link></Button>
              <PermissionButton asChild permission="Role.Update" size="sm" variant="ghost"><Link to={`/roles/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton>
              {hasPermission("Role.Delete") ? (
                <ConfirmDialog title={lt("Delete role?")} description={`${lt("Delete")} ${row.name}?`} confirmText={lt("Delete")} variant="danger" onConfirm={async () => remove.mutateAsync(row.id)}>
                  <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </ConfirmDialog>
              ) : null}
            </div>
          )}
        />
      </CardContent></Card>
    </div>
  );
}
