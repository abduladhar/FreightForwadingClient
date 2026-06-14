import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getBranchById, updateBranch } from "@/api/branchApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { BranchForm } from "@/modules/branches/BranchForm";
import type { BranchFormValues } from "@/modules/branches/branchValidation";
import { lt } from "@/modules/operationsLocalization";

export function BranchEditPage() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["branch", branchId], queryFn: () => getBranchById(branchId!), enabled: Boolean(branchId) });
  const mutation = useMutation({
    mutationFn: (values: BranchFormValues) =>
      updateBranch(branchId!, {
        ...values,
        address: values.address || null,
        contactPerson: values.contactPerson || null,
        phone: values.phone || null,
        defaultWarehouseId: values.defaultWarehouseId || null
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      await queryClient.invalidateQueries({ queryKey: ["branch", branchId] });
      toast.success(lt("Branch updated"));
      navigate(`/branches/${branchId}`);
    }
  });

  if (!branchId) return <Navigate to="/branches" replace />;
  return (
    <div className="space-y-4">
      <PageHeader title={lt("Edit Branch")} description={lt("Update branch profile and status.")} />
      <Card><CardContent className="pt-6">
        {query.data ? <BranchForm initialValue={query.data} onSubmit={async (v) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /> : <p className="text-sm text-muted-foreground">{lt("Loading...")}</p>}
      </CardContent></Card>
    </div>
  );
}
