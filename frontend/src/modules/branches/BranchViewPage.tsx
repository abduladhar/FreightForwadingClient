import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Pencil, Settings } from "lucide-react";
import { getBranchById } from "@/api/branchApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function BranchViewPage() {
  const { branchId } = useParams();
  const query = useQuery({ queryKey: ["branch", branchId], queryFn: () => getBranchById(branchId!), enabled: Boolean(branchId) });
  if (!branchId) return <Navigate to="/branches" replace />;
  const branch = query.data;

  return (
    <div className="space-y-4">
      <PageHeader
        title={branch?.branchName ?? lt("Branch")}
        description={branch?.branchCode}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Branch.Update"><Link to={`/branches/${branchId}/edit`}><Pencil className="h-4 w-4" /> {lt("Edit")}</Link></PermissionButton>
            <PermissionButton asChild permission="Branch.Update"><Link to={`/branches/${branchId}/settings`}><Settings className="h-4 w-4" /> {lt("Settings")}</Link></PermissionButton>
          </>
        }
      />
      {branch ? (
        <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-2">
          <Field label={lt("Email")} value={branch.email} />
          <Field label={lt("Contact Person")} value={branch.contactPerson} />
          <Field label={lt("Phone")} value={branch.phone} />
          <Field label={lt("Address")} value={branch.address} />
          <Field label={lt("Country")} value={branch.country} />
          <Field label={lt("City")} value={branch.city} />
          <Field label={lt("Tenant ID")} value={branch.tenantId} />
          <div><p className="text-xs text-muted-foreground">{lt("Status")}</p><StatusBadge status={lt(branch.isActive ? "Active" : "Inactive")} /></div>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading branch...")}</CardContent></Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
