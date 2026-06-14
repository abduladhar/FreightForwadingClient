import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createContainer } from "@/api/freightApi";
import { ContainerForm } from "@/modules/shipments/containers/ContainerForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";

export function ContainerCreatePage() {
  const [params] = useSearchParams();
  const seaShipmentDetailId = params.get("seaShipmentDetailId") ?? "";
  const navigate = useNavigate();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: createContainer });
  return <div className="space-y-4">
    <PageHeader title="New Container" description="Create container and set free days/demurrage/detention." />
    <ContainerForm
      initialValue={{ seaShipmentDetailId, containerNumber: "", sealNumber: null, containerType: "", freeDays: 0, demurrage: 0, detention: 0 }}
      onSubmit={async (value) => {
        await mutation.mutateAsync(value);
        toast.success("Created", "Container created.");
        navigate(`/containers?seaShipmentDetailId=${seaShipmentDetailId}`);
      }}
      isSubmitting={mutation.isPending}
    />
  </div>;
}
