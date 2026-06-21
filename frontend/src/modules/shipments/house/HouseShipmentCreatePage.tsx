import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addHouseShipmentItem, attachHouseShipmentDocument, createHouseShipment, linkHouseShipmentPdf } from "@/api/houseShipmentApi";
import { HouseShipmentForm } from "@/modules/shipments/house/HouseShipmentForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function HouseShipmentCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useMutation({ mutationFn: createHouseShipment });

  async function handleSubmit(value: NonNullable<Parameters<typeof HouseShipmentForm>[0]["initialValue"]>) {
    if (!value) return;
    let createdId: string | null = null;
    try {
      const created = await createMutation.mutateAsync({ ...value.shipment, modeOfTransport: value.transportMode } as Parameters<typeof createHouseShipment>[0]);
      createdId = created.id;
      for (const item of value.selectedGoods) {
        if (item.loadedPieces > 0 || item.loadedWeight > 0 || item.loadedVolume > 0) {
          await addHouseShipmentItem(created.id, item);
        }
      }
      if (value.documents[0]) {
        await attachHouseShipmentDocument(created.id, { documentReference: value.documents[0] });
      }
      for (const documentId of value.aiDocumentIds ?? []) {
        await linkHouseShipmentPdf(created.id, documentId);
      }
      toast.success(lt("Created"), lt("House shipment created successfully."));
      navigate(`/house-shipments/${created.id}`);
    } catch (error) {
      if (createdId) {
        try {
          // Rollback partial create if downstream item/document operations fail.
          const { deleteHouseShipment } = await import("@/api/houseShipmentApi");
          await deleteHouseShipment(createdId);
        } catch {
          // Intentionally swallow rollback errors and surface original failure.
        }
      }
      throw error;
    }
  }

  return <div className="space-y-4">
    <PageHeader title={lt("New House Shipment")} description={lt("Create a house shipment and load goods receipt items.")} />
    <HouseShipmentForm
      onSubmit={handleSubmit}
      enableGoodsSelection
      onApplyGrnItems={async () => {
        toast.info(lt("Items staged"), lt("Goods Receipt Note items are selected. They will be saved when you create the shipment."));
      }}
      isSubmitting={createMutation.isPending}
    />
  </div>;
}
