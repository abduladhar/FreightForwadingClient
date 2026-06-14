import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { assignPermissionToRole, getRoles } from "@/api/roleApi";
import { getPermissions } from "@/api/permissionApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

const actionOrder = ["Create", "Read", "Update", "Delete", "Print", "Export", "Approve", "Cancel", "Import", "Override"];

export function PermissionMatrixPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const permissionsQuery = useQuery({ queryKey: ["permissions"], queryFn: getPermissions });
  const [filter, setFilter] = useState("");
  const selectedRoleId = searchParams.get("roleId") ?? "";
  const selectedRole = (rolesQuery.data ?? []).find((role) => role.id === selectedRoleId) ?? null;

  const assignMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => assignPermissionToRole(roleId, permissionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(lt("Permission assigned"));
    }
  });

  const groupedRows = useMemo(() => {
    const map = new Map<string, Record<string, { id: string; name: string }>>();
    for (const permission of permissionsQuery.data ?? []) {
      if (filter && !permission.module.toLowerCase().includes(filter.toLowerCase()) && !permission.name.toLowerCase().includes(filter.toLowerCase())) continue;
      if (!map.has(permission.module)) map.set(permission.module, {});
      map.get(permission.module)![permission.action] = { id: permission.id, name: permission.name };
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissionsQuery.data, filter]);

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Permission Matrix")} description={lt("Assign module-level permissions to roles.")} actions={<AuditTrailButton />} />
      <Card><CardContent className="pt-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-[280px_1fr]">
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={selectedRoleId}
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              next.set("roleId", event.target.value);
              setSearchParams(next);
            }}
          >
            <option value="">{lt("Select Role")}</option>
            {(rolesQuery.data ?? []).map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <input className="h-10 rounded-md border px-3 text-sm" placeholder={lt("Filter modules...")} value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        {!selectedRole ? <p className="text-sm text-muted-foreground">{lt("Select a role to manage permissions.")}</p> : null}
        {selectedRole ? (
          <div className="overflow-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">{lt("Module")}</th>
                  {actionOrder.map((action) => (
                    <th key={action} className="px-2 py-2 text-center font-semibold">{lt(action)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedRows.map(([module, actions]) => (
                  <tr key={module} className="border-t">
                    <td className="px-3 py-2 font-medium">{lt(module)}</td>
                    {actionOrder.map((action) => {
                      const permission = actions[action];
                      const checked = permission ? selectedRole.permissions.includes(permission.name) : false;
                      return (
                        <td key={`${module}-${action}`} className="px-2 py-2 text-center">
                          {permission ? (
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={checked || assignMutation.isPending}
                              onChange={() => void assignMutation.mutateAsync({ roleId: selectedRole.id, permissionId: permission.id })}
                              title={checked ? lt("Already assigned. Removal is not supported by current backend endpoint.") : `${lt("Assign")} ${permission.name}`}
                            />
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent></Card>
    </div>
  );
}
