import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addDirectShipmentItem, attachDirectShipmentDocument, createDirectShipment } from "@/api/directShipmentApi";
import { DirectShipmentForm } from "@/modules/shipments/direct/DirectShipmentForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function DirectShipmentCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: createDirectShipment });
  return <div className="space-y-4">
    <PageHeader title={lt("New Direct Shipment")} description={lt("Create direct shipment with customer, route, transport details, and shipment items.")} />
    <DirectShipmentForm
      onSubmit={async (value) => {
        const created = await mutation.mutateAsync(value.shipment as Parameters<typeof createDirectShipment>[0]);
        for (const item of value.items) {
          if (item.description && (item.pieces > 0 || item.weight > 0 || item.volume > 0)) {
            const pieces = item.pieces ?? 0;
            const weight = item.weight ?? 0;
            const volume = item.volume ?? 0;
            await addDirectShipmentItem(created.id, {
              goodsReceiptItemId: item.goodsReceiptItemId ?? null,
              packageTypeGuid: item.packageTypeGuid ?? null,
              packageTypeName: item.packageTypeName ?? null,
              description: item.description,
              receivedPieces: item.receivedPieces && item.receivedPieces > 0 ? item.receivedPieces : pieces,
              receivedWeight: item.receivedWeight && item.receivedWeight > 0 ? item.receivedWeight : weight,
              length: item.length ?? 0,
              width: item.width ?? 0,
              height: item.height ?? 0,
              volumeCbm: item.volumeCbm && item.volumeCbm > 0 ? item.volumeCbm : volume,
              loadedPieces: item.loadedPieces && item.loadedPieces > 0 ? item.loadedPieces : pieces,
              loadedWeight: item.loadedWeight && item.loadedWeight > 0 ? item.loadedWeight : weight,
              loadedVolume: item.loadedVolume && item.loadedVolume > 0 ? item.loadedVolume : volume,
              pieces,
              weight,
              volume,
              marksAndNumbers: item.marksAndNumbers ?? null
            });
          }
        }
        if (value.documentReference) await attachDirectShipmentDocument(created.id, { documentReference: value.documentReference });
        toast.success(lt("Created"), lt("Direct shipment created successfully."));
        navigate(`/direct-shipments/${created.id}`);
      }}
      isSubmitting={mutation.isPending}
    />
  </div>;
}
