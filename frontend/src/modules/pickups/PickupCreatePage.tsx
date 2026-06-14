import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPickup, type PickupRequest } from "@/api/pickupApi";
import { PickupForm } from "@/modules/pickups/PickupForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PickupCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const p = usePickupI18n();
  const mutation = useMutation({ mutationFn: createPickup, onSuccess: async (pickup) => { await queryClient.invalidateQueries({ queryKey: ["pickups"] }); navigate(`/pickups/${pickup.id}`); } });
  return <div className="space-y-4"><PageHeader title={p("Create Pickup")} description={p("Create pickup request linked to customer and optional quotation.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><PickupForm onSubmit={async (value: PickupRequest) => { await mutation.mutateAsync(value); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
