import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getEmployee, updateEmployee } from "@/api/employeeApi";
import { EmployeeForm } from "./EmployeeForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function EmployeeEditPage() {
  const { employeeId } = useParams(); const navigate = useNavigate(); const client = useQueryClient(); const toast = useToast();
  const query = useQuery({ queryKey: ["employee", employeeId], queryFn: () => getEmployee(employeeId!), enabled: Boolean(employeeId) });
  const mutation = useMutation({ mutationFn: (value: Parameters<typeof updateEmployee>[1]) => updateEmployee(employeeId!, value), onSuccess: async () => { await client.invalidateQueries({ queryKey: ["employees"] }); await client.invalidateQueries({ queryKey: ["employee", employeeId] }); toast.success(lt("Employee updated")); navigate(`/employees/${employeeId}`); } });
  if (!employeeId) return <Navigate to="/employees" replace />;
  return <div className="space-y-4"><PageHeader title={lt("Edit Employee")} description={lt("Update employee, designation, branch, and Salesman eligibility.")} /><Card><CardContent className="pt-6">{query.data ? <EmployeeForm initialValue={query.data} isSubmitting={mutation.isPending} onSubmit={async (value) => { await mutation.mutateAsync({ ...value, branchId: value.branchId || null, parentEmployeeGuid: value.parentEmployeeGuid || null, joiningDate: value.joiningDate || null }); }} /> : <p>{lt("Loading employee...")}</p>}</CardContent></Card></div>;
}
