import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { History, Pencil } from "lucide-react";
import { getUserById } from "@/api/userApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { lt } from "@/modules/operationsLocalization";

export function UserViewPage() {
  const { userId } = useParams();
  const query = useQuery({ queryKey: ["user", userId], queryFn: () => getUserById(userId!), enabled: Boolean(userId) });
  if (!userId) return <Navigate to="/users" replace />;
  const user = query.data;

  return (
    <div className="space-y-4">
      <PageHeader
        title={user ? `${user.firstName} ${user.lastName}` : lt("User")}
        description={user?.userName}
        actions={
          <>
            <AuditTrailButton />
            <Button asChild variant="outline"><Link to="/audit?module=Identity&action=Login"><History className="h-4 w-4" />{lt("Login History")}</Link></Button>
            <PermissionButton asChild permission="User.Update"><Link to={`/users/${userId}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton>
          </>
        }
      />
      {user ? (
        <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-2">
          <Field label={lt("Email")} value={user.email} />
          <Field label={lt("Username")} value={user.userName} />
          <Field label={lt("Linked Employee")} value={user.employeeName ? `${user.employeeCode ?? ""} - ${user.employeeName}` : lt("No employee linked")} />
          <Field label={lt("Branch Id")} value={user.branchId || "-"} />
          <Field label={lt("Roles")} value={user.roles.join(", ") || "-"} />
          <div><p className="text-xs text-muted-foreground">{lt("Active Status")}</p><StatusBadge status={user.isActive ? "Active" : "Inactive"} /></div>
          <div><p className="text-xs text-muted-foreground">{lt("Lock Status")}</p><StatusBadge status={user.isLocked ? "Locked" : "Unlocked"} /></div>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading user...")}</CardContent></Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
