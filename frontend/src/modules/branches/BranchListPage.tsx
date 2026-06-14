import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { deleteBranch, getBranches } from "@/api/branchApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";
import type { Branch } from "@/types/branch";

export function BranchListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { hasPermission } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const remove = useMutation({
    mutationFn: deleteBranch,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success(lt("Branch deleted"));
    }
  });
  const canDelete = hasPermission("Branch.Delete");

  const filtered = useMemo(() => {
    const items = query.data ?? [];
    const q = search.trim().toLowerCase();
    return items.filter((x) => {
      if (statusFilter === "active" && !x.isActive) return false;
      if (statusFilter === "inactive" && x.isActive) return false;
      if (!q) return true;
      return [x.branchCode, x.branchName, x.email, x.country, x.city].join(" ").toLowerCase().includes(q);
    });
  }, [query.data, search, statusFilter]);
  const paged = filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const columns: ColumnDef<Branch>[] = [
    { accessorKey: "branchCode", header: lt("Code") },
    { accessorKey: "branchName", header: lt("Branch Name") },
    { accessorKey: "email", header: lt("Email") },
    { accessorKey: "country", header: lt("Country") },
    { accessorKey: "city", header: lt("City") },
    { accessorKey: "isActive", header: lt("Status"), cell: ({ row }) => <StatusBadge status={lt(row.original.isActive ? "Active" : "Inactive")} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Branches")}
        description={lt("Manage operational branches and branch-level setup.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Branch.Create"><Link to="/branches/new"><Plus className="h-4 w-4" /> {lt("New Branch")}</Link></PermissionButton>
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
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => void query.refetch()}
          onPaginationChange={(pn, ps) => {
            setPageNumber(pn);
            setPageSize(ps);
          }}
          filters={
            <select
              className="h-9 rounded-md border bg-white px-3 text-sm"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as "all" | "active" | "inactive");
                setPageNumber(1);
              }}
            >
              <option value="all">{lt("All Status")}</option>
              <option value="active">{lt("Active")}</option>
              <option value="inactive">{lt("Inactive")}</option>
            </select>
          }
          rowActions={(row) => (
            <div className="flex gap-1">
              <Button asChild size="sm" variant="ghost"><Link to={`/branches/${row.branchId}`}><Eye className="h-4 w-4" /></Link></Button>
              <PermissionButton asChild size="sm" variant="ghost" permission="Branch.Update"><Link to={`/branches/${row.branchId}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton>
              <PermissionButton asChild size="sm" variant="ghost" permission="Branch.Update"><Link to={`/branches/${row.branchId}/settings`}><Settings className="h-4 w-4" /></Link></PermissionButton>
              {canDelete ? (
                <ConfirmDialog title={lt("Delete branch?")} description={`${lt("Delete")} ${row.branchName}?`} confirmText={lt("Delete")} variant="danger" onConfirm={async () => remove.mutateAsync(row.branchId)}>
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
