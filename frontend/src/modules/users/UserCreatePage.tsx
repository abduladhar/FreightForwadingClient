import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getBranchOptions } from "@/api/branchApi";
import { createUser } from "@/api/userApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { UserForm } from "@/modules/users/UserForm";
import type { CreateUserFormValues } from "@/modules/users/userValidation";
import { lt } from "@/modules/operationsLocalization";

export function UserCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({ queryKey: ["branch-options"], queryFn: getBranchOptions });
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(lt("User created"));
      navigate(`/users/${user.id}`);
    }
  });

  async function onSubmit(values: CreateUserFormValues) {
    await mutation.mutateAsync({
      ...values,
      branchId: values.branchId || null,
      employeeId: values.employeeId || null
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Create User")} description={lt("Create user and assign tenant/branch scope.")} />
      <Card><CardContent className="pt-6">
        <UserForm mode="create" branchOptions={branchesQuery.data ?? []} onSubmit={async (v) => onSubmit(v as CreateUserFormValues)} isSubmitting={mutation.isPending} />
      </CardContent></Card>
    </div>
  );
}
