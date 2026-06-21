import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { assignPermissionsToRole, getRoles } from "@/api/roleApi";
import { getPermissions, type PermissionDto } from "@/api/permissionApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

const actionOrder = ["Create", "Read", "Update", "Delete", "Print", "Export", "Approve", "Cancel", "Import", "Override"];
const permissionBatchSize = 50;
const hierarchyDependenciesByAction: Record<string, string[]> = {
  Create: ["Update", "Read"],
  Update: ["Read"],
  Delete: ["Read"],
  Print: ["Read"],
  Export: ["Read"],
  Approve: ["Read"],
  Cancel: ["Read"],
  Import: ["Read"],
  Override: ["Read"]
};

const commonPartyReadPermissions = [
  "Customer.Read",
  "Vendor.Read",
  "Agent.Read",
  "Carrier.Read"
];

const commonMasterDataReadPermissions = [
  "Branch.Read",
  "Currency.Read",
  "Language.Read",
  "Country.Read",
  "ShippingPort.Read",
  "PackageType.Read",
  "JobType.Read",
  "Employee.Read"
];

const shipmentMasterDataReadPermissions = [
  ...commonPartyReadPermissions,
  ...commonMasterDataReadPermissions,
  "Quotation.Read",
  "RateMaster.Read",
  "Warehouse.Read"
];

const explicitPermissionDependencies: Record<string, string[]> = {
  "Tenant.Create": ["Language.Read", "Currency.Read", "Country.Read"],
  "Tenant.Update": ["Language.Read", "Currency.Read", "Country.Read"],
  "Branch.Create": ["Tenant.Read", "Country.Read", "Currency.Read", "Language.Read"],
  "Branch.Update": ["Tenant.Read", "Country.Read", "Currency.Read", "Language.Read"],
  "Authentication.Create": ["User.Read", "Role.Read"],
  "Authentication.Update": ["User.Read", "Role.Read"],
  "User.Create": ["Role.Read", "Branch.Read", "Employee.Read", "Language.Read"],
  "User.Update": ["Role.Read", "Branch.Read", "Employee.Read", "Language.Read"],
  "Employee.Create": ["Branch.Read", "Designation.Read", "Country.Read", "User.Read"],
  "Employee.Update": ["Branch.Read", "Designation.Read", "Country.Read", "User.Read"],
  "Designation.Create": ["Employee.Read"],
  "Designation.Update": ["Employee.Read"],
  "Role.Create": ["Permission.Read"],
  "Role.Update": ["Permission.Read"],
  "Permission.Create": ["Role.Read"],
  "Permission.Update": ["Role.Read"],
  "Currency.Create": ["Country.Read"],
  "Currency.Update": ["Country.Read"],
  "Language.Create": ["Tenant.Read"],
  "Language.Update": ["Tenant.Read"],
  "Customer.Create": ["Country.Read", "Currency.Read", "Employee.Read", "DocumentManagement.Read"],
  "Customer.Update": ["Country.Read", "Currency.Read", "Employee.Read", "DocumentManagement.Read"],
  "Vendor.Create": ["Country.Read", "Currency.Read", "DocumentManagement.Read"],
  "Vendor.Update": ["Country.Read", "Currency.Read", "DocumentManagement.Read"],
  "Agent.Create": ["Country.Read", "Currency.Read", "DocumentManagement.Read"],
  "Agent.Update": ["Country.Read", "Currency.Read", "DocumentManagement.Read"],
  "Carrier.Create": ["Country.Read", "Currency.Read", "DocumentManagement.Read"],
  "Carrier.Update": ["Country.Read", "Currency.Read", "DocumentManagement.Read"],
  "Country.Create": ["Currency.Read"],
  "Country.Update": ["Currency.Read"],
  "ShippingPort.Create": ["Country.Read"],
  "ShippingPort.Update": ["Country.Read"],
  "PackageType.Create": ["GoodsReceipt.Read", "HouseShipment.Read", "DirectShipment.Read"],
  "PackageType.Update": ["GoodsReceipt.Read", "HouseShipment.Read", "DirectShipment.Read"],
  "JobType.Create": ["Job.Read"],
  "JobType.Update": ["Job.Read"],
  "Job.Create": ["JobType.Read", "Customer.Read", "Employee.Read", "Branch.Read"],
  "Job.Update": ["JobType.Read", "Customer.Read", "Employee.Read", "Branch.Read"],
  "RateMaster.Create": ["Customer.Read", "Vendor.Read", "Agent.Read", "Carrier.Read", "Currency.Read", "ShippingPort.Read", "PackageType.Read"],
  "RateMaster.Update": ["Customer.Read", "Vendor.Read", "Agent.Read", "Carrier.Read", "Currency.Read", "ShippingPort.Read", "PackageType.Read"],
  "Quotation.Create": ["Customer.Read", "Currency.Read", "PackageType.Read", "ShippingPort.Read", "RateMaster.Read", "Country.Read"],
  "Quotation.Update": ["Customer.Read", "Currency.Read", "PackageType.Read", "ShippingPort.Read", "RateMaster.Read", "Country.Read"],
  "Pickup.Create": ["Customer.Read", "ShippingPort.Read", "PackageType.Read", "Currency.Read", "Country.Read", "Employee.Read"],
  "Pickup.Update": ["Customer.Read", "ShippingPort.Read", "PackageType.Read", "Currency.Read", "Country.Read", "Employee.Read"],
  "GoodsReceipt.Create": ["Customer.Read", "Pickup.Read", "PackageType.Read", "Warehouse.Read", "Employee.Read"],
  "GoodsReceipt.Update": ["Customer.Read", "Pickup.Read", "PackageType.Read", "Warehouse.Read", "Employee.Read"],
  "Warehouse.Create": ["Branch.Read", "Country.Read", "Employee.Read"],
  "Warehouse.Update": ["Branch.Read", "Country.Read", "Employee.Read"],
  "HouseShipment.Create": shipmentMasterDataReadPermissions,
  "HouseShipment.Update": shipmentMasterDataReadPermissions,
  "MasterShipment.Create": shipmentMasterDataReadPermissions,
  "MasterShipment.Update": shipmentMasterDataReadPermissions,
  "DirectShipment.Create": shipmentMasterDataReadPermissions,
  "DirectShipment.Update": shipmentMasterDataReadPermissions,
  "AirFreight.Create": ["HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Carrier.Read", "ShippingPort.Read", "Currency.Read"],
  "AirFreight.Update": ["HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Carrier.Read", "ShippingPort.Read", "Currency.Read"],
  "SeaFreight.Create": ["HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Carrier.Read", "ShippingPort.Read", "Currency.Read"],
  "SeaFreight.Update": ["HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Carrier.Read", "ShippingPort.Read", "Currency.Read"],
  "RoadFreight.Create": ["HouseShipment.Read", "DirectShipment.Read", "Carrier.Read", "ShippingPort.Read", "Country.Read", "Currency.Read"],
  "RoadFreight.Update": ["HouseShipment.Read", "DirectShipment.Read", "Carrier.Read", "ShippingPort.Read", "Country.Read", "Currency.Read"],
  "Courier.Create": ["HouseShipment.Read", "DirectShipment.Read", "Carrier.Read", "Customer.Read", "Currency.Read"],
  "Courier.Update": ["HouseShipment.Read", "DirectShipment.Read", "Carrier.Read", "Customer.Read", "Currency.Read"],
  "CustomsClearance.Create": ["Customer.Read", "Vendor.Read", "Agent.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Currency.Read", "Country.Read", "DocumentManagement.Read"],
  "CustomsClearance.Update": ["Customer.Read", "Vendor.Read", "Agent.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Currency.Read", "Country.Read", "DocumentManagement.Read"],
  "Invoice.Create": ["Customer.Read", "Currency.Read", "Quotation.Read", "Pickup.Read", "GoodsReceipt.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "CustomsClearance.Read", "Accounting.Read"],
  "Invoice.Update": ["Customer.Read", "Currency.Read", "Quotation.Read", "Pickup.Read", "GoodsReceipt.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "CustomsClearance.Read", "Accounting.Read"],
  "VendorBill.Create": ["Vendor.Read", "Agent.Read", "Carrier.Read", "Currency.Read", "Pickup.Read", "GoodsReceipt.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "CustomsClearance.Read", "Accounting.Read"],
  "VendorBill.Update": ["Vendor.Read", "Agent.Read", "Carrier.Read", "Currency.Read", "Pickup.Read", "GoodsReceipt.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "CustomsClearance.Read", "Accounting.Read"],
  "CreditDebitNote.Create": ["Customer.Read", "Vendor.Read", "Invoice.Read", "VendorBill.Read", "Currency.Read", "Accounting.Read"],
  "CreditDebitNote.Update": ["Customer.Read", "Vendor.Read", "Invoice.Read", "VendorBill.Read", "Currency.Read", "Accounting.Read"],
  "Receipt.Create": ["Customer.Read", "Invoice.Read", "Currency.Read", "Accounting.Read"],
  "Receipt.Update": ["Customer.Read", "Invoice.Read", "Currency.Read", "Accounting.Read"],
  "Payment.Create": ["Vendor.Read", "VendorBill.Read", "Currency.Read", "Accounting.Read"],
  "Payment.Update": ["Vendor.Read", "VendorBill.Read", "Currency.Read", "Accounting.Read"],
  "Reconciliation.Create": ["Invoice.Read", "VendorBill.Read", "Receipt.Read", "Payment.Read", "Accounting.Read"],
  "Reconciliation.Update": ["Invoice.Read", "VendorBill.Read", "Receipt.Read", "Payment.Read", "Accounting.Read"],
  "Accounting.Create": ["Currency.Read", "Customer.Read", "Vendor.Read", "Invoice.Read", "VendorBill.Read", "Receipt.Read", "Payment.Read"],
  "Accounting.Update": ["Currency.Read", "Customer.Read", "Vendor.Read", "Invoice.Read", "VendorBill.Read", "Receipt.Read", "Payment.Read"],
  "Reports.Create": ["Dashboard.Read"],
  "Reports.Update": ["Dashboard.Read"],
  "Profit.Create": ["HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Pickup.Read", "CustomsClearance.Read", "Invoice.Read", "VendorBill.Read"],
  "Profit.Update": ["HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Pickup.Read", "CustomsClearance.Read", "Invoice.Read", "VendorBill.Read"],
  "SalesPerformance.Create": ["Employee.Read", "Customer.Read", "Invoice.Read", "Receipt.Read"],
  "SalesPerformance.Update": ["Employee.Read", "Customer.Read", "Invoice.Read", "Receipt.Read"],
  "Dashboard.Create": ["Reports.Read"],
  "Dashboard.Update": ["Reports.Read"],
  "AuditLog.Create": ["User.Read", "Role.Read", "Permission.Read"],
  "AuditLog.Update": ["User.Read", "Role.Read", "Permission.Read"],
  "Notification.Create": ["User.Read", "Role.Read", "Branch.Read"],
  "Notification.Update": ["User.Read", "Role.Read", "Branch.Read"],
  "DocumentManagement.Create": ["Customer.Read", "Vendor.Read", "Agent.Read", "Carrier.Read", "Quotation.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Invoice.Read", "VendorBill.Read"],
  "DocumentManagement.Update": ["Customer.Read", "Vendor.Read", "Agent.Read", "Carrier.Read", "Quotation.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Invoice.Read", "VendorBill.Read"],
  "CustomerPortal.Create": ["Customer.Read", "User.Read", "Role.Read", "Quotation.Read", "HouseShipment.Read", "DirectShipment.Read", "Invoice.Read", "Receipt.Read"],
  "CustomerPortal.Update": ["Customer.Read", "User.Read", "Role.Read", "Quotation.Read", "HouseShipment.Read", "DirectShipment.Read", "Invoice.Read", "Receipt.Read"],
  "AgentPortal.Create": ["Agent.Read", "User.Read", "Role.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Invoice.Read", "VendorBill.Read"],
  "AgentPortal.Update": ["Agent.Read", "User.Read", "Role.Read", "HouseShipment.Read", "MasterShipment.Read", "DirectShipment.Read", "Invoice.Read", "VendorBill.Read"]
};

function chunkPermissionIds(permissionIds: string[]) {
  const batches: string[][] = [];
  for (let index = 0; index < permissionIds.length; index += permissionBatchSize) {
    batches.push(permissionIds.slice(index, index + permissionBatchSize));
  }
  return batches;
}

function getPermissionDependencyNames(permission: PermissionDto) {
  const dependencyNames = new Set(explicitPermissionDependencies[permission.name] ?? []);

  for (const dependentAction of hierarchyDependenciesByAction[permission.action] ?? []) {
    dependencyNames.add(`${permission.module}.${dependentAction}`);
  }

  return Array.from(dependencyNames);
}

function addPermissionWithDependencies(
  permission: PermissionDto,
  allPermissions: PermissionDto[],
  assignedPermissionNames: Set<string>,
  currentPermissionIds: string[]
) {
  const permissionsByName = new Map(allPermissions.map((item) => [item.name, item]));
  const nextPermissionIds = new Set(currentPermissionIds);
  const visitedPermissionNames = new Set<string>();

  function visit(item: PermissionDto) {
    if (visitedPermissionNames.has(item.name)) return;
    visitedPermissionNames.add(item.name);

    if (!assignedPermissionNames.has(item.name)) {
      nextPermissionIds.add(item.id);
    }

    for (const dependencyName of getPermissionDependencyNames(item)) {
      const dependency = permissionsByName.get(dependencyName);
      if (dependency) visit(dependency);
    }
  }

  visit(permission);
  return Array.from(nextPermissionIds);
}

export function PermissionMatrixPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const permissionsQuery = useQuery({ queryKey: ["permissions"], queryFn: getPermissions });
  const [filter, setFilter] = useState("");
  const [pendingPermissionIds, setPendingPermissionIds] = useState<string[]>([]);
  const selectedRoleId = searchParams.get("roleId") ?? "";
  const selectedRole = (rolesQuery.data ?? []).find((role) => role.id === selectedRoleId) ?? null;
  const pendingPermissionIdSet = useMemo(() => new Set(pendingPermissionIds), [pendingPermissionIds]);

  const assignMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      for (const permissionIdBatch of chunkPermissionIds(permissionIds)) {
        await assignPermissionsToRole(roleId, permissionIdBatch);
      }
    },
    onSuccess: async () => {
      setPendingPermissionIds([]);
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(lt("Permissions assigned"));
    }
  });

  const groupedRows = useMemo(() => {
    const map = new Map<string, Record<string, PermissionDto>>();
    for (const permission of permissionsQuery.data ?? []) {
      if (filter && !permission.module.toLowerCase().includes(filter.toLowerCase()) && !permission.name.toLowerCase().includes(filter.toLowerCase())) continue;
      if (!map.has(permission.module)) map.set(permission.module, {});
      map.get(permission.module)![permission.action] = permission;
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
              setPendingPermissionIds([]);
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
        {selectedRole ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-slate-50 px-3 py-2">
            <p className="text-sm text-muted-foreground">{pendingPermissionIds.length} {lt("pending permission selections")}</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPendingPermissionIds([])} disabled={pendingPermissionIds.length === 0 || assignMutation.isPending}>{lt("Clear")}</Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void assignMutation.mutateAsync({ roleId: selectedRole.id, permissionIds: pendingPermissionIds })}
                disabled={pendingPermissionIds.length === 0 || assignMutation.isPending}
              >
                {assignMutation.isPending ? lt("Saving...") : lt("Save Permissions")}
              </Button>
            </div>
          </div>
        ) : null}
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
                      const assigned = permission ? selectedRole.permissions.includes(permission.name) : false;
                      const checked = assigned || (permission ? pendingPermissionIdSet.has(permission.id) : false);
                      return (
                        <td key={`${module}-${action}`} className="px-2 py-2 text-center">
                          {permission ? (
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={assigned || assignMutation.isPending}
                              onChange={(event) => {
                                setPendingPermissionIds((current) => {
                                  if (event.target.checked) {
                                    return addPermissionWithDependencies(
                                      permission,
                                      permissionsQuery.data ?? [],
                                      new Set(selectedRole.permissions),
                                      current
                                    );
                                  }
                                  return current.filter((permissionId) => permissionId !== permission.id);
                                });
                              }}
                              title={assigned ? lt("Already assigned. Removal is not supported by current backend endpoint.") : `${lt("Select")} ${permission.name} ${lt("and required dependencies")}`}
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
