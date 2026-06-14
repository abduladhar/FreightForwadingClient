import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/app/i18n";
import { createCustomer, type CustomerRequest } from "@/api/customerApi";
import { CustomerForm } from "@/modules/customers/CustomerForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { customerPanelClass, customerPanelContentClass } from "@/modules/customers/customerUi";

export function CustomerCreatePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: createCustomer, onSuccess: async (customer) => { await queryClient.invalidateQueries({ queryKey: ["customers"] }); navigate(`/customers/${customer.id}`); } });
  return <div className="space-y-4"><PageHeader title={t("Page.Title.CreateCustomer", "Create Customer")} description={t("Page.Description.CreateCustomerProfileAndControls", "Create customer profile and controls.")} /><Card className={customerPanelClass}><CardContent className={customerPanelContentClass}><CustomerForm onSubmit={async (v: CustomerRequest) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
