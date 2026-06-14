import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getSeaFreight, updateContainer } from "@/api/freightApi";
import { ContainerForm } from "@/modules/shipments/containers/ContainerForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";

export function ContainerEditPage() {
  const { containerId } = useParams();
  const [params] = useSearchParams();
  const seaShipmentDetailId = params.get("seaShipmentDetailId");
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["sea-freight", seaShipmentDetailId], queryFn: () => getSeaFreight(seaShipmentDetailId!), enabled: Boolean(seaShipmentDetailId) });
  const container = useMemo(() => (query.data?.containers ?? []).find((x) => x.id === containerId), [query.data, containerId]);
  const mutation = useMutation({ mutationFn: (payload: Parameters<typeof updateContainer>[1]) => updateContainer(containerId!, payload) });
  if (!containerId || !seaShipmentDetailId) return <Navigate to="/containers" replace />;
  if (!container) return <div className="p-4 text-sm text-muted-foreground">Loading container...</div>;
  return <div className="space-y-4">
    <PageHeader title={`Edit ${container.containerNumber}`} description="Update seal/type and detention settings." />
    <ContainerForm
      initialValue={{
        seaShipmentDetailId,
        containerNumber: container.containerNumber,
        sealNumber: container.sealNumber,
        containerType: container.containerType,
        freeDays: container.freeDays,
        demurrage: container.demurrage,
        detention: container.detention
      }}
      onSubmit={async (value) => {
        await mutation.mutateAsync(value);
        toast.success("Updated", "Container updated.");
        navigate(`/containers/${containerId}?seaShipmentDetailId=${seaShipmentDetailId}`);
      }}
      isSubmitting={mutation.isPending}
    />
  </div>;
}
