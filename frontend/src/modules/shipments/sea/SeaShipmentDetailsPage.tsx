import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getSeaFreight, createSeaFreight, updateSeaFreight } from "@/api/freightApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { SeaShipmentForm } from "@/modules/shipments/sea/SeaShipmentForm";
import { useToast } from "@/components/ui/toast";

export function SeaShipmentDetailsPage() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const toast = useToast();
  const query = useQuery({ queryKey: ["sea-freight", id], queryFn: () => getSeaFreight(id!), enabled: Boolean(id) });
  const createMutation = useMutation({ mutationFn: createSeaFreight });
  const updateMutation = useMutation({ mutationFn: (payload: Parameters<typeof updateSeaFreight>[1]) => updateSeaFreight(id!, payload) });
  return <div className="space-y-4">
    <PageHeader title="Sea Shipment Details" description="Shipping line, vessel, ports, and sea cargo details." actions={<><AuditTrailButton />{id ? <PermissionButton asChild permission="SeaFreight.Read" variant="outline"><Link to={`/containers?seaShipmentDetailId=${id}`}>Manage Containers</Link></PermissionButton> : null}</>} />
    <SeaShipmentForm
      initialValue={query.data ?? null}
      onSubmit={async (value) => {
        if (id) await updateMutation.mutateAsync(value);
        else await createMutation.mutateAsync(value);
        toast.success("Saved", "Sea shipment details saved.");
      }}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      savePermission={id ? "SeaFreight.Update" : "SeaFreight.Create"}
    />
  </div>;
}
