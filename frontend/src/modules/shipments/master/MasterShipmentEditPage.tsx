import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { addMasterShipmentGoodsReceiptsBulk, addMasterShipmentHouseShipmentsBulk, getMasterShipment, removeMasterShipmentHouseShipment, updateMasterShipment } from "@/api/masterShipmentApi";
import type { AssignmentRow } from "@/modules/shipments/master/HouseShipmentSelectionTable";
import { MasterShipmentForm } from "@/modules/shipments/master/MasterShipmentForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function MasterShipmentEditPage() {
  const { masterShipmentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({
    queryKey: ["master-shipment", masterShipmentId],
    queryFn: () => getMasterShipment(masterShipmentId!),
    enabled: Boolean(masterShipmentId),
    staleTime: 0,
    refetchOnMount: "always"
  });
  const mutation = useMutation({ mutationFn: (payload: Parameters<typeof updateMasterShipment>[1]) => updateMasterShipment(masterShipmentId!, payload) });
  if (!masterShipmentId) return <Navigate to="/master-shipments" replace />;
  if (!query.data) return <div className="p-4 text-sm text-muted-foreground">{lt("Loading master shipment...")}</div>;
  const toFormItems = (
    items: typeof query.data.items,
    dimensionSource?: Array<{
      houseShipmentId: string;
      houseShipmentItemId: string;
      length?: number;
      width?: number;
      height?: number;
      volumeCbm?: number;
    }>
  ): Array<AssignmentRow & { id?: string }> => {
    const dimsByKey = new Map((dimensionSource ?? []).map((x) => [`${x.houseShipmentId}:${x.houseShipmentItemId}`, x] as const));
    return items.map((x) => {
      const dim = dimsByKey.get(`${x.houseShipmentId}:${x.houseShipmentItemId}`);
        return {
          id: x.id,
          loadMode: (x.sourceEntityType === "GOODS_RECEIVED_NOTE" ? lt("grn") : lt("house")) as "house" | "grn",
        goodsReceiptId: x.sourceEntityType === "GOODS_RECEIVED_NOTE" ? x.sourceEntityId : undefined,
        goodsReceiptItemId: x.sourceEntityType === "GOODS_RECEIVED_NOTE" ? x.sourceEntityItemId : undefined,
        houseShipmentId: x.houseShipmentId,
        houseShipmentItemId: x.houseShipmentItemId,
        houseShipmentNumber: x.houseShipmentNumber,
        hawbNumber: x.hawbNumber,
        shipperName: x.shipperName,
        consigneeName: x.consigneeName,
        houseShipmentItemDescription: x.houseShipmentItemDescription,
        packageTypeId: x.packageTypeId ?? null,
        packageTypeName: x.packageTypeName,
        hsCode: x.hsCode ?? "",
        countryOfOrigin: x.countryOfOrigin ?? "",
        length: dim?.length ?? x.length ?? 0,
        width: dim?.width ?? x.width ?? 0,
        height: dim?.height ?? x.height ?? 0,
        volumeCbm: dim?.volumeCbm ?? x.volumeCbm ?? 0,
        consolidatedPieces: x.consolidatedPieces,
        consolidatedWeight: x.consolidatedWeight,
        consolidatedVolume: x.consolidatedVolume,
        chargeableWeight: x.chargeableWeight,
        manualAllocatedCostAmount: x.manualAllocatedCostAmount ?? null
      };
    });
  };
  return <div className="space-y-4">
    <PageHeader title={`Edit ${query.data.masterShipmentNumber}`} description={lt("Update master shipment details and schedule.")} />
    <MasterShipmentForm
      enableConsolidation
      initialValue={{
        shipment: {
          modeOfTransport: query.data.modeOfTransport,
          carrierId: query.data.carrierId,
          carrierName: query.data.carrierName,
          flightNumber: query.data.flightNumber,
          vesselName: query.data.vesselName,
          voyageNumber: query.data.voyageNumber,
          truckNumber: query.data.truckNumber,
          originPortGuid: query.data.originPortGuid ?? null,
          destinationPortGuid: query.data.destinationPortGuid ?? null,
          etd: query.data.etd,
          eta: query.data.eta,
          actualDeparture: query.data.actualDeparture,
          actualArrival: query.data.actualArrival,
          totalCostAmount: query.data.totalCostAmount,
          costAllocationMethod: query.data.costAllocationMethod,
          remarks: query.data.remarks
        },
        selectedHouseShipments: toFormItems(query.data.items)
      }}
      onPersistAssignments={async (rows, mode) => {
        // Send selected rows as incremental loads, including already assigned house item keys.
        if (rows.length > 0 && mode === "house") {
          await addMasterShipmentHouseShipmentsBulk(masterShipmentId, rows.filter((x) => x.loadMode !== "grn").map((row) => ({
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
        if (rows.length > 0 && mode === "grn") {
          await addMasterShipmentGoodsReceiptsBulk(masterShipmentId, rows.filter((x) => x.loadMode === "grn").map((row) => ({
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

        const latest = await getMasterShipment(masterShipmentId);
      return toFormItems(latest.items, rows);
      }}
      onRemoveAssignedItem={async (itemId) => {
        await removeMasterShipmentHouseShipment(masterShipmentId, itemId);
        const latest = await getMasterShipment(masterShipmentId);
        return toFormItems(latest.items);
      }}
      onSubmit={async (value) => {
        await mutation.mutateAsync(value.shipment as Parameters<typeof updateMasterShipment>[1]);
        toast.success(lt("Updated"), lt("Master shipment updated."));
        navigate(`/master-shipments/${masterShipmentId}`);
      }}
      isSubmitting={mutation.isPending}
    />
  </div>;
}
