import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getTenantById, updateTenant } from "@/api/tenantApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { TenantForm } from "@/modules/tenants/TenantForm";
import type { TenantFormValues } from "@/modules/tenants/tenantValidation";
import { lt } from "@/modules/operationsLocalization";

export function TenantEditPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["tenant", tenantId], queryFn: () => getTenantById(tenantId!), enabled: Boolean(tenantId) });
  const mutation = useMutation({
    mutationFn: (values: TenantFormValues) =>
      updateTenant(tenantId!, {
        ...values,
        phone: values.phone || null,
        address: values.address || null,
        taxNumber: values.taxNumber || null,
        baseCurrencyId: values.baseCurrencyId || null,
        defaultLanguageId: values.defaultLanguageId || null,
        logoUrl: values.logoUrl || null
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tenants"] });
      await queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      toast.success(lt("Tenant updated"));
      navigate(`/tenants/${tenantId}`);
    }
  });

  if (!tenantId) return <Navigate to="/tenants" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Edit Tenant")} description={lt("Update tenant profile and status.")} />
      <Card><CardContent className="pt-6">
        {query.data ? <TenantForm initialValue={query.data} onSubmit={async (v) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /> : <p className="text-sm text-muted-foreground">{lt("Loading...")}</p>}
      </CardContent></Card>
    </div>
  );
}
