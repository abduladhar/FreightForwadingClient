import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { addHouseShipmentItem, getHouseShipment, removeHouseShipmentItem, updateHouseShipment, updateHouseShipmentItem } from "@/api/houseShipmentApi";
import { HouseShipmentForm } from "@/modules/shipments/house/HouseShipmentForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function HouseShipmentEditPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["house-shipment", shipmentId], queryFn: () => getHouseShipment(shipmentId!), enabled: Boolean(shipmentId) });
  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateHouseShipment>[1]) => updateHouseShipment(shipmentId!, payload)
  });

  if (!shipmentId) return <Navigate to="/house-shipments" replace />;
  if (!query.data) return <div className="p-4 text-sm text-muted-foreground">{lt("Loading house shipment...")}</div>;

  const value = {
    shipment: {
      customerId: query.data.customerId,
      quotationId: query.data.quotationId,
      originPortGuid: query.data.originPortGuid ?? null,
      destinationPortGuid: query.data.destinationPortGuid ?? null,
      origin: query.data.origin,
      destination: query.data.destination,
      dropLocation: query.data.dropLocation ?? "",
      consigneeName: query.data.consigneeName ?? "",
      consigneeContactNo: query.data.consigneeContactNo ?? "",
      consigneeAddress: query.data.consigneeAddress ?? "",
      shipperName: query.data.shipperName ?? "",
      shipperContactNo: query.data.shipperContactNo ?? "",
      shipperAddress: query.data.shipperAddress ?? "",
      etd: query.data.etd,
      eta: query.data.eta,
      actualDeparture: query.data.actualDeparture,
      actualArrival: query.data.actualArrival,
      customerInvoiceId: query.data.customerInvoiceId,
      vendorBillId: query.data.vendorBillId,
      revenueAmount: query.data.revenueAmount,
      costAmount: query.data.costAmount,
      remarks: query.data.remarks
    },
    transportMode: query.data.modeOfTransport || "Air",
    labelTemplateCode: query.data.labelTemplateCode ?? "DEFAULT",
    documents: query.data.documentReference ? [query.data.documentReference] : [],
    selectedGoods: query.data.items.map((x) => ({
      id: x.id,
      operationMode: "Update" as const,
      goodsReceiptItemId: x.goodsReceiptItemId ?? null,
      packageTypeGuid: x.packageTypeGuid ?? null,
      packageTypeName: x.packageTypeName ?? null,
      hsCode: x.hsCode ?? "",
      countryOfOrigin: x.countryOfOrigin ?? "",
      description: x.description ?? "",
      receivedPieces: x.receivedPieces ?? 0,
      receivedWeight: x.receivedWeight ?? 0,
      length: x.length ?? 0,
      width: x.width ?? 0,
      height: x.height ?? 0,
      volumeCbm: x.volumeCbm ?? 0,
      loadedPieces: x.loadedPieces ?? 0,
      loadedWeight: x.loadedWeight ?? 0,
      loadedVolume: x.loadedVolume ?? 0
    }))
  };

  return <div className="space-y-4">
    <PageHeader title={`Edit ${query.data.houseShipmentNumber}`} description={lt("Update route, timeline, references, and shipment details.")} />
    <HouseShipmentForm
      key={shipmentId}
      initialValue={value}
      enableGoodsSelection
      onSaveItem={async (item) => {
        const itemId = item.id ?? "";
        const mode = item.operationMode ?? (itemId && itemId !== EMPTY_GUID ? lt("Update") : lt("New"));
        const payload = {
          goodsReceiptItemId: item.goodsReceiptItemId ?? null,
          packageTypeGuid: item.packageTypeGuid ?? null,
          packageTypeName: item.packageTypeName ?? null,
          hsCode: item.hsCode ?? null,
          countryOfOrigin: item.countryOfOrigin ?? null,
          description: item.description ?? "",
          receivedPieces: item.receivedPieces ?? 0,
          receivedWeight: item.receivedWeight ?? 0,
          length: item.length ?? 0,
          width: item.width ?? 0,
          height: item.height ?? 0,
          volumeCbm: item.volumeCbm ?? 0,
          loadedPieces: item.loadedPieces ?? 0,
          loadedWeight: item.loadedWeight ?? 0,
          loadedVolume: item.loadedVolume ?? 0
        };

        if (mode === "Delete") {
          if (!itemId || itemId === EMPTY_GUID) return query.data.items.map((x) => ({
            id: x.id,
            operationMode: "Update" as const,
            goodsReceiptItemId: x.goodsReceiptItemId ?? null,
            packageTypeGuid: x.packageTypeGuid ?? null,
            packageTypeName: x.packageTypeName ?? null,
            hsCode: x.hsCode ?? "",
            countryOfOrigin: x.countryOfOrigin ?? "",
            description: x.description ?? "",
            receivedPieces: x.receivedPieces ?? 0,
            receivedWeight: x.receivedWeight ?? 0,
            length: x.length ?? 0,
            width: x.width ?? 0,
            height: x.height ?? 0,
            volumeCbm: x.volumeCbm ?? 0,
            loadedPieces: x.loadedPieces ?? 0,
            loadedWeight: x.loadedWeight ?? 0,
            loadedVolume: x.loadedVolume ?? 0
          }));
          await removeHouseShipmentItem(shipmentId, itemId);
          toast.success(lt("Item removed"), lt("Shipment item deleted."));
        } else if (mode === "Update" && itemId && itemId !== EMPTY_GUID) {
          await updateHouseShipmentItem(shipmentId, itemId, payload);
          toast.success(lt("Item updated"), lt("Shipment item updated."));
        } else {
          await addHouseShipmentItem(shipmentId, payload);
          toast.success(lt("Item created"), lt("Shipment item created."));
        }

        const latest = await getHouseShipment(shipmentId);
        return latest.items.map((x) => ({
          id: x.id,
          operationMode: "Update" as const,
          goodsReceiptItemId: x.goodsReceiptItemId ?? null,
          packageTypeGuid: x.packageTypeGuid ?? null,
          packageTypeName: x.packageTypeName ?? null,
          hsCode: x.hsCode ?? "",
          countryOfOrigin: x.countryOfOrigin ?? "",
          description: x.description ?? "",
          receivedPieces: x.receivedPieces ?? 0,
          receivedWeight: x.receivedWeight ?? 0,
          length: x.length ?? 0,
          width: x.width ?? 0,
          height: x.height ?? 0,
          volumeCbm: x.volumeCbm ?? 0,
          loadedPieces: x.loadedPieces ?? 0,
          loadedWeight: x.loadedWeight ?? 0,
          loadedVolume: x.loadedVolume ?? 0
        }));
      }}
      onApplyGrnItems={async (items) => {
        for (const item of items) {
          if (item.loadedPieces > 0 || item.loadedWeight > 0 || item.loadedVolume > 0) {
            await addHouseShipmentItem(shipmentId, item);
          }
        }
        toast.success(lt("Goods Receipt Note items saved"), lt("Selected Goods Receipt Note items were saved to the shipment."));
      }}
      onSubmit={async (form) => {
        await mutation.mutateAsync({ ...form.shipment, modeOfTransport: form.transportMode } as Parameters<typeof updateHouseShipment>[1]);
        toast.success(lt("Updated"), lt("House shipment updated."));
        navigate(`/house-shipments/${shipmentId}`);
      }}
      isSubmitting={mutation.isPending}
    />
  </div>;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
