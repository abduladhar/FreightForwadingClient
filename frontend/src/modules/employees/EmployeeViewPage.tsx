import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { getEmployee } from "@/api/employeeApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { lt } from "@/modules/operationsLocalization";

export function EmployeeViewPage() {
  const { employeeId } = useParams(); const query = useQuery({ queryKey: ["employee", employeeId], queryFn: () => getEmployee(employeeId!), enabled: Boolean(employeeId) });
  if (!employeeId) return <Navigate to="/employees" replace />; const employee = query.data;
  return <div className="space-y-4"><PageHeader title={employee?.fullName ?? lt("Employee")} description={employee ? `${employee.employeeCode} | ${employee.designationName}` : undefined} actions={<><AuditTrailButton /><PermissionButton asChild permission="Employee.Update"><Link to={`/employees/${employeeId}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton></>} />
    {employee ? <Card><CardContent className="grid gap-4 pt-6 md:grid-cols-3"><Field label={lt("Designation")} value={employee.designationName} /><Field label={lt("Email")} value={employee.email || "-"} /><Field label={lt("Phone")} value={employee.phone || "-"} /><Field label={lt("Joining Date")} value={employee.joiningDate || "-"} /><Field label={lt("Linked User")} value={employee.userName || lt("No login linked")} /><div><p className="text-xs text-muted-foreground">{lt("Salesman")}</p><StatusBadge status={employee.isSalesman ? "Active" : "Inactive"} /></div><div><p className="text-xs text-muted-foreground">{lt("Employee Status")}</p><StatusBadge status={employee.isActive ? "Active" : "Inactive"} /></div><div className="md:col-span-3"><Field label={lt("Address")} value={employee.address || "-"} /></div></CardContent></Card> : <Card><CardContent className="pt-6">{lt("Loading employee...")}</CardContent></Card>}
  </div>;
}
function Field({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium whitespace-pre-wrap">{value}</p></div>; }
