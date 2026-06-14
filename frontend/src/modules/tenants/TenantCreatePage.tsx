import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createTenant } from "@/api/tenantApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { TenantForm } from "@/modules/tenants/TenantForm";
import type { TenantFormValues } from "@/modules/tenants/tenantValidation";
import { lt } from "@/modules/operationsLocalization";

export function TenantCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTenant,
    onSuccess: async (tenant) => {
      await queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success(lt("Tenant created"));
      navigate(`/tenants/${tenant.tenantId}`);
    }
  });

  async function onSubmit(values: TenantFormValues) {
    await mutation.mutateAsync({
      ...values,
      phone: values.phone || null,
      address: values.address || null,
      taxNumber: values.taxNumber || null,
      baseCurrencyId: values.baseCurrencyId || null,
      defaultLanguageId: values.defaultLanguageId || null,
      logoUrl: values.logoUrl || null
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Create Tenant")} description={lt("Create a new tenant profile.")} />
      <Card><CardContent className="pt-6"><TenantForm onSubmit={onSubmit} isSubmitting={mutation.isPending} /></CardContent></Card>
    </div>
  );
}
