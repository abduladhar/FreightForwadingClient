import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addMasterShipmentGoodsReceiptsBulk, addMasterShipmentHouseShipmentsBulk, createMasterShipment } from "@/api/masterShipmentApi";
import { MasterShipmentForm } from "@/modules/shipments/master/MasterShipmentForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function MasterShipmentCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: createMasterShipment });
  return <div className="space-y-4">
    <PageHeader title={lt("New Master Shipment")} description={lt("Create master shipment and consolidate house shipments.")} />
    <MasterShipmentForm
      enableConsolidation
      onSubmit={async (value) => {
        const created = await mutation.mutateAsync(value.shipment as Parameters<typeof createMasterShipment>[0]);
        if (value.selectedHouseShipments.length > 0) {
          const houseRows = value.selectedHouseShipments.filter((x) => x.loadMode !== "grn");
          const grnRows = value.selectedHouseShipments.filter((x) => x.loadMode === "grn");
          if (houseRows.length) {
            await addMasterShipmentHouseShipmentsBulk(created.id, houseRows.map((row) => ({
            houseShipmentId: row.houseShipmentId,
            houseShipmentItemId: row.houseShipmentItemId,
            houseShipmentNumber: row.houseShipmentNumber,
            packageTypeId: row.packageTypeId ?? null,
            packageTypeName: row.packageTypeName ?? "",
            hsCode: row.hsCode ?? "",
            countryOfOrigin: row.countryOfOrigin ?? "",
            length: row.length ?? 0,
            width: row.width ?? 0,
            height: row.height ?? 0,
            volumeCbm: row.volumeCbm ?? 0,
            consolidatedPieces: row.consolidatedPieces,
            consolidatedWeight: row.consolidatedWeight,
            consolidatedVolume: row.consolidatedVolume,
            chargeableWeight: row.chargeableWeight,
            manualAllocatedCostAmount: row.id ? (row.manualAllocatedCostAmount ?? 0) : 0
          })));
          }
          if (grnRows.length) {
            await addMasterShipmentGoodsReceiptsBulk(created.id, grnRows.map((row) => ({
              goodsReceiptId: row.goodsReceiptId ?? row.houseShipmentId,
              goodsReceiptItemId: row.goodsReceiptItemId ?? row.houseShipmentItemId,
              hawbNumber: row.hawbNumber ?? "",
              shipperName: row.shipperName ?? "",
              shipperAddress: row.shipperAddress ?? "",
              consigneeName: row.consigneeName ?? "",
              consigneeAddress: row.consigneeAddress ?? "",
              hsCode: row.hsCode ?? "",
              countryOfOrigin: row.countryOfOrigin ?? "",
              consolidatedPieces: row.consolidatedPieces,
              consolidatedWeight: row.consolidatedWeight,
              consolidatedVolume: row.consolidatedVolume,
              chargeableWeight: row.chargeableWeight,
              manualAllocatedCostAmount: row.manualAllocatedCostAmount ?? 0
            })));
          }
        }
        toast.success(lt("Created"), lt("Master shipment created."));
        navigate(`/master-shipments/${created.id}`);
      }}
      isSubmitting={mutation.isPending}
    />
  </div>;
}
