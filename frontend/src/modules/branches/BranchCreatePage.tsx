import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createBranch } from "@/api/branchApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { BranchForm } from "@/modules/branches/BranchForm";
import type { BranchFormValues } from "@/modules/branches/branchValidation";
import { lt } from "@/modules/operationsLocalization";

export function BranchCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createBranch,
    onSuccess: async (branch) => {
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success(lt("Branch created"));
      navigate(`/branches/${branch.branchId}`);
    }
  });

  async function onSubmit(values: BranchFormValues) {
    await mutation.mutateAsync({
      ...values,
      address: values.address || null,
      contactPerson: values.contactPerson || null,
      phone: values.phone || null,
      defaultWarehouseId: values.defaultWarehouseId || null
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Create Branch")} description={lt("Create a new branch within current tenant scope.")} />
      <Card><CardContent className="pt-6"><BranchForm onSubmit={onSubmit} isSubmitting={mutation.isPending} /></CardContent></Card>
    </div>
  );
}
