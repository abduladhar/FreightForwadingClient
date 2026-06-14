import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getBranchOptions } from "@/api/branchApi";
import { getUserById, updateUser } from "@/api/userApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { UserForm } from "@/modules/users/UserForm";
import type { EditUserFormValues } from "@/modules/users/userValidation";
import { lt } from "@/modules/operationsLocalization";

export function UserEditPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: ["user", userId], queryFn: () => getUserById(userId!), enabled: Boolean(userId) });
  const branchesQuery = useQuery({ queryKey: ["branch-options"], queryFn: getBranchOptions });
  const mutation = useMutation({
    mutationFn: (values: EditUserFormValues) => updateUser(userId!, { ...values, branchId: values.branchId || null, employeeId: values.employeeId || null }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success(lt("User updated"));
      navigate(`/users/${userId}`);
    }
  });

  if (!userId) return <Navigate to="/users" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Edit User")} description={lt("Update user identity, branch scope, and active status.")} />
      <Card><CardContent className="pt-6">
        {userQuery.data ? (
          <UserForm mode="edit" initialValue={userQuery.data} branchOptions={branchesQuery.data ?? []} onSubmit={async (v) => { await mutation.mutateAsync(v as EditUserFormValues); }} isSubmitting={mutation.isPending} />
        ) : (
          <p className="text-sm text-muted-foreground">{lt("Loading user...")}</p>
        )}
      </CardContent></Card>
    </div>
  );
}
