import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getCarrier, updateCarrier, type CarrierRequest } from "@/api/carrierApi";
import { CarrierForm } from "@/modules/carriers/CarrierForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function CarrierEditPage() {
  const m = useMasterDataI18n("Carrier");
  const { carrierId } = useParams();
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["carrier", carrierId], queryFn: () => getCarrier(carrierId!), enabled: Boolean(carrierId) });
  const mutation = useMutation({ mutationFn: (v: CarrierRequest) => updateCarrier(carrierId!, v), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["carriers"] }); navigate("/carriers"); } });
  if (!carrierId) return <Navigate to="/carriers" replace />;
  return <div className="space-y-4"><PageHeader title={m("Edit Carrier")} description={m("Update carrier profile.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}>{query.data ? <CarrierForm initialValue={query.data} onSubmit={async (v: CarrierRequest) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /> : <p className="text-sm text-muted-foreground">{m("Loading")}</p>}</CardContent></Card></div>;
}
