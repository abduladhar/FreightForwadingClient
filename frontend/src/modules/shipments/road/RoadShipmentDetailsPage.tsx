import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { createRoadFreight, getRoadFreight, updateRoadFreight } from "@/api/freightApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { RoadShipmentForm } from "@/modules/shipments/road/RoadShipmentForm";
import { useToast } from "@/components/ui/toast";

export function RoadShipmentDetailsPage() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const toast = useToast();
  const query = useQuery({ queryKey: ["road-freight", id], queryFn: () => getRoadFreight(id!), enabled: Boolean(id) });
  const createMutation = useMutation({ mutationFn: createRoadFreight });
  const updateMutation = useMutation({ mutationFn: (payload: Parameters<typeof updateRoadFreight>[1]) => updateRoadFreight(id!, payload) });
  return <div className="space-y-4">
    <PageHeader title="Road Shipment Details" description="Vehicle, driver, route, border crossing, trip sheet, and POD reference." actions={<AuditTrailButton />} />
    <RoadShipmentForm
      initialValue={query.data ?? null}
      onSubmit={async (value) => {
        if (id) await updateMutation.mutateAsync(value);
        else await createMutation.mutateAsync(value);
        toast.success("Saved", "Road shipment details saved.");
      }}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      savePermission={id ? "RoadFreight.Update" : "RoadFreight.Create"}
    />
  </div>;
}
