import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Pencil, Settings } from "lucide-react";
import { getTenantById } from "@/api/tenantApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function TenantViewPage() {
  const { tenantId } = useParams();
  const query = useQuery({ queryKey: ["tenant", tenantId], queryFn: () => getTenantById(tenantId!), enabled: Boolean(tenantId) });
  if (!tenantId) return <Navigate to="/tenants" replace />;
  const tenant = query.data;

  return (
    <div className="space-y-4">
      <PageHeader
        title={tenant?.tenantName ?? lt("Tenant")}
        description={tenant?.tenantCode}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Tenant.Update"><Link to={`/tenants/${tenantId}/edit`}><Pencil className="h-4 w-4" /> {lt("Edit")}</Link></PermissionButton>
            <PermissionButton asChild permission="Tenant.Update"><Link to={`/tenants/${tenantId}/settings`}><Settings className="h-4 w-4" /> {lt("Settings")}</Link></PermissionButton>
          </>
        }
      />
      {tenant ? (
        <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-2">
          <Field label={lt("Legal Name")} value={tenant.legalName} />
          <Field label={lt("Email")} value={tenant.email} />
          <Field label={lt("Phone")} value={tenant.phone} />
          <Field label={lt("Address")} value={tenant.address} />
          <Field label={lt("Country")} value={tenant.country} />
          <Field label={lt("City")} value={tenant.city} />
          <Field label={lt("Tax Number")} value={tenant.taxNumber} />
          <Field label={lt("Financial Year Start Month")} value={String(tenant.financialYearStartMonth)} />
          <div><p className="text-xs text-muted-foreground">{lt("Status")}</p><StatusBadge status={tenant.isActive ? "Active" : "Inactive"} /></div>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading tenant...")}</CardContent></Card>
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
