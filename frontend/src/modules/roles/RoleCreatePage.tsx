import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createRole } from "@/api/roleApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { RoleForm } from "@/modules/roles/RoleForm";
import type { CreateRoleFormValues } from "@/modules/roles/roleValidation";
import { lt } from "@/modules/operationsLocalization";

export function RoleCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createRole,
    onSuccess: async (role) => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(lt("Role created"));
      navigate(`/roles/${role.id}/edit`);
    }
  });

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Create Role")} description={lt("Create a role to assign users and permissions.")} />
      <Card><CardContent className="pt-6">
        <RoleForm mode="create" onSubmit={async (v) => mutation.mutateAsync(v as CreateRoleFormValues)} isSubmitting={mutation.isPending} />
      </CardContent></Card>
    </div>
  );
}
