import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, KeyRound, Lock, Pencil, Plus, Power, Shield, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { assignRoleToUser, deleteUser, getUsers, updateUser, type UserDto } from "@/api/userApi";
import { getRoles } from "@/api/roleApi";
import { requestPasswordReset } from "@/api/authApi";
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

export function UserListPage() {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleAssignments, setRoleAssignments] = useState<Record<string, string>>({});
  const { hasPermission } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(lt("User deleted"));
    }
  });

  const filtered = useMemo(() => {
    const items = usersQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => [x.userName, x.email, x.firstName, x.lastName, ...(x.roles ?? [])].join(" ").toLowerCase().includes(q));
  }, [usersQuery.data, search]);
  const paged = filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const columns: ColumnDef<UserDto>[] = [
    { accessorKey: "userName", header: lt("Username") },
    { accessorKey: "email", header: lt("Email") },
    { id: "employee", header: lt("Employee"), cell: ({ row }) => row.original.employeeName ? `${row.original.employeeCode ?? ""} - ${row.original.employeeName}` : "-" },
    { id: "name", header: lt("Name"), cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { id: "roles", header: lt("Roles"), cell: ({ row }) => row.original.roles.join(", ") || "-" },
    { id: "active", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> },
    { id: "locked", header: lt("Lock Status"), cell: ({ row }) => <StatusBadge status={row.original.isLocked ? "Locked" : "Unlocked"} /> }
  ];

  async function handleRoleAssign(userId: string) {
    const roleId = roleAssignments[userId];
    if (!roleId) return;
    await assignRoleToUser(userId, roleId);
    await queryClient.invalidateQueries({ queryKey: ["users"] });
    toast.success(lt("Role assigned"));
  }

  async function handlePasswordReset(user: UserDto) {
    await requestPasswordReset(user.userName || user.email);
    toast.info(lt("Password reset requested"), `${lt("Reset workflow triggered for")} ${user.userName}.`);
  }

  async function handleLockToggle(user: UserDto) {
    await updateUser(user.id, {
      branchId: user.branchId ?? null,
      email: user.email,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: !user.isActive
    });
    await queryClient.invalidateQueries({ queryKey: ["users"] });
    toast.info(lt("User status changed"), `${user.userName} ${lt("is now")} ${!user.isActive ? lt("active") : lt("inactive")}.`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Users")}
        description={lt("Manage users, role assignments, access status, and security actions.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="User.Create"><Link to="/users/new"><Plus className="h-4 w-4" />{lt("New User")}</Link></PermissionButton>
          </>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={paged}
            columns={columns}
            totalCount={filtered.length}
            pageNumber={pageNumber}
            pageSize={pageSize}
            search={search}
            onSearchChange={setSearch}
            isLoading={usersQuery.isLoading}
            isError={usersQuery.isError}
            onRetry={() => void usersQuery.refetch()}
            onPaginationChange={(pn, ps) => {
              setPageNumber(pn);
              setPageSize(ps);
            }}
            rowActions={(row) => (
              <div className="flex items-center gap-1">
                <Button asChild size="sm" variant="ghost"><Link to={`/users/${row.id}`}><Eye className="h-4 w-4" /></Link></Button>
                <PermissionButton asChild permission="User.Update" size="sm" variant="ghost"><Link to={`/users/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton>
                <PermissionButton permission="User.Override" size="sm" variant="ghost" onClick={() => void handlePasswordReset(row)}><KeyRound className="h-4 w-4" /></PermissionButton>
                <PermissionButton permission="User.Update" size="sm" variant="ghost" onClick={() => void handleLockToggle(row)} title={row.isActive ? lt("Deactivate user") : lt("Activate user")}>
                  <Power className="h-4 w-4" />
                </PermissionButton>
                <Button size="sm" variant="ghost" disabled title={lt("Lock/Unlock endpoint is not available in current backend")}>
                  <Lock className="h-4 w-4" />
                </Button>
                {hasPermission("User.Delete") ? (
                  <ConfirmDialog title={lt("Delete user?")} description={`${lt("Delete")} ${row.userName}?`} confirmText={lt("Delete")} variant="danger" onConfirm={async () => remove.mutateAsync(row.id)}>
                    <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </ConfirmDialog>
                ) : null}
                <div className="ml-1 flex items-center gap-1">
                  <select
                    className="h-8 rounded-md border px-2 text-xs"
                    value={roleAssignments[row.id] ?? ""}
                    onChange={(event) => setRoleAssignments((prev) => ({ ...prev, [row.id]: event.target.value }))}
                  >
                    <option value="">{lt("Assign role")}</option>
                    {(rolesQuery.data ?? []).map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <PermissionButton permission="User.Override" size="sm" variant="outline" onClick={() => void handleRoleAssign(row.id)}>
                    <Shield className="h-3.5 w-3.5" />
                  </PermissionButton>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
