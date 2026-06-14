import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { createAirFreight, getAirFreight, updateAirFreight } from "@/api/freightApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { AirShipmentForm } from "@/modules/shipments/air/AirShipmentForm";
import { useToast } from "@/components/ui/toast";

export function AirShipmentDetailsPage() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const toast = useToast();
  const query = useQuery({ queryKey: ["air-freight", id], queryFn: () => getAirFreight(id!), enabled: Boolean(id) });
  const createMutation = useMutation({ mutationFn: createAirFreight });
  const updateMutation = useMutation({ mutationFn: (payload: Parameters<typeof updateAirFreight>[1]) => updateAirFreight(id!, payload) });
  return <div className="space-y-4">
    <PageHeader title="Air Shipment Details" description="Airline, MAWB/HAWB, airports, weight and schedule details." actions={<AuditTrailButton />} />
    <AirShipmentForm
      initialValue={query.data ?? null}
      onSubmit={async (value) => {
        if (id) await updateMutation.mutateAsync(value);
        else await createMutation.mutateAsync(value);
        toast.success("Saved", "Air shipment details saved.");
      }}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      savePermission={id ? "AirFreight.Update" : "AirFreight.Create"}
    />
  </div>;
}
