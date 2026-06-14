import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getRoleById, updateRole } from "@/api/roleApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { RoleForm } from "@/modules/roles/RoleForm";
import type { EditRoleFormValues } from "@/modules/roles/roleValidation";
import { lt } from "@/modules/operationsLocalization";

export function RoleEditPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const roleQuery = useQuery({ queryKey: ["role", roleId], queryFn: () => getRoleById(roleId!), enabled: Boolean(roleId) });
  const mutation = useMutation({
    mutationFn: (values: EditRoleFormValues) => updateRole(roleId!, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      await queryClient.invalidateQueries({ queryKey: ["role", roleId] });
      toast.success(lt("Role updated"));
      navigate("/roles");
    }
  });
  if (!roleId) return <Navigate to="/roles" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Edit Role")} description={lt("Update role and maintain permission model.")} />
      <Card><CardContent className="pt-6">
        {roleQuery.data ? <RoleForm mode="edit" initialValue={roleQuery.data} onSubmit={async (v) => mutation.mutateAsync(v as EditRoleFormValues)} isSubmitting={mutation.isPending} /> : <p className="text-sm text-muted-foreground">{lt("Loading role...")}</p>}
      </CardContent></Card>
    </div>
  );
}
