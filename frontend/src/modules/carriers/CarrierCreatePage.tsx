import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createCarrier, type CarrierRequest } from "@/api/carrierApi";
import { CarrierForm } from "@/modules/carriers/CarrierForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function CarrierCreatePage() {
  const m = useMasterDataI18n("Carrier");
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: createCarrier, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["carriers"] }); navigate("/carriers"); } });
  return <div className="space-y-4"><PageHeader title={m("Create Carrier")} description={m("Create carrier profile.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><CarrierForm onSubmit={async (v: CarrierRequest) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
