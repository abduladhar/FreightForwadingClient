import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "@/api/employeeApi";
import { EmployeeForm } from "./EmployeeForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function EmployeeCreatePage() {
  const navigate = useNavigate(); const client = useQueryClient(); const toast = useToast();
  const mutation = useMutation({ mutationFn: createEmployee, onSuccess: async (employee) => { await client.invalidateQueries({ queryKey: ["employees"] }); toast.success(lt("Employee created")); navigate(`/employees/${employee.id}`); } });
  return <div className="space-y-4"><PageHeader title={lt("Create Employee")} description={lt("Create a business employee independently from login access.")} /><Card><CardContent className="pt-6"><EmployeeForm isSubmitting={mutation.isPending} onSubmit={async (value) => { await mutation.mutateAsync({ ...value, branchId: value.branchId || null, parentEmployeeGuid: value.parentEmployeeGuid || null, joiningDate: value.joiningDate || null }); }} /></CardContent></Card></div>;
}
