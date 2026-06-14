import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { addDirectShipmentItem, attachDirectShipmentDocument, getDirectShipment, removeDirectShipmentItem, updateDirectShipment, updateDirectShipmentItem, type DirectShipmentItemRequest } from "@/api/directShipmentApi";
import { DirectShipmentForm } from "@/modules/shipments/direct/DirectShipmentForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function DirectShipmentEditPage() {
  const { directShipmentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["direct-shipment", directShipmentId], queryFn: () => getDirectShipment(directShipmentId!), enabled: Boolean(directShipmentId) });
  const mutation = useMutation({ mutationFn: (payload: Parameters<typeof updateDirectShipment>[1]) => updateDirectShipment(directShipmentId!, payload) });
  if (!directShipmentId) return <Navigate to="/direct-shipments" replace />;
  if (!query.data) return <div className="p-4 text-sm text-muted-foreground">{lt("Loading direct shipment...")}</div>;
  const s = query.data;
  return <div className="space-y-4">
    <PageHeader title={`Edit ${s.directShipmentNumber}`} description={lt("Update shipment details, transport data, and references.")} />
    <DirectShipmentForm
      initialValue={{
        shipment: {
          customerId: s.customerId,
          quotationId: s.quotationId,
          originPortGuid: s.originPortGuid ?? null,
          destinationPortGuid: s.destinationPortGuid ?? null,
          origin: s.origin,
          destination: s.destination,
          shipperName: s.shipperName,
          shipperPhoneNumber: s.shipperPhoneNumber,
          shipperAddress: s.shipperAddress,
          consigneeName: s.consigneeName,
          consigneePhoneNumber: s.consigneePhoneNumber,
          consigneeAddress: s.consigneeAddress,
          modeOfTransport: s.modeOfTransport,
          carrierId: s.carrierId,
          carrierName: s.carrierName,
          flightNumber: s.flightNumber,
          mawbNumber: s.mawbNumber ?? null,
          vesselName: s.vesselName,
          truckNumber: s.truckNumber,
          containerNumber: s.containerNumber,
          etd: s.etd,
          eta: s.eta,
          actualDeparture: s.actualDeparture,
          actualArrival: s.actualArrival,
          customerInvoiceId: s.customerInvoiceId,
          vendorBillId: s.vendorBillId,
          revenueAmount: s.revenueAmount,
          costAmount: s.costAmount,
          remarks: s.remarks
        },
        items: s.items.map((x) => ({
          id: x.id,
          operationMode: "Update" as const,
          goodsReceiptItemId: x.goodsReceiptItemId,
          packageTypeGuid: x.packageTypeGuid ?? null,
          packageTypeName: x.packageTypeName ?? null,
          hsCode: x.hsCode ?? "",
          countryOfOrigin: x.countryOfOrigin ?? "",
          description: x.description,
          pieces: x.pieces,
          weight: x.weight,
          volume: x.volume,
          length: x.length ?? 0,
          width: x.width ?? 0,
          height: x.height ?? 0,
          marksAndNumbers: x.marksAndNumbers
        })),
        documentReference: s.documentReference ?? ""
      }}
      onSaveItem={async (item) => {
        const itemId = item.id ?? "";
        const mode = item.operationMode ?? (itemId && itemId !== EMPTY_GUID ? "Update" : "New");
        const payload: DirectShipmentItemRequest = {
          id: itemId || null,
          operationMode: mode,
          goodsReceiptItemId: item.goodsReceiptItemId ?? null,
          packageTypeGuid: item.packageTypeGuid ?? null,
          packageTypeName: item.packageTypeName ?? null,
          hsCode: item.hsCode ?? null,
          countryOfOrigin: item.countryOfOrigin ?? null,
          description: item.description ?? "",
          receivedPieces: (item.receivedPieces && item.receivedPieces > 0) ? item.receivedPieces : (item.pieces ?? 0),
          receivedWeight: (item.receivedWeight && item.receivedWeight > 0) ? item.receivedWeight : (item.weight ?? 0),
          length: item.length ?? 0,
          width: item.width ?? 0,
          height: item.height ?? 0,
          volumeCbm: (item.volumeCbm && item.volumeCbm > 0) ? item.volumeCbm : (item.volume ?? 0),
          loadedPieces: (item.loadedPieces && item.loadedPieces > 0) ? item.loadedPieces : (item.pieces ?? 0),
          loadedWeight: (item.loadedWeight && item.loadedWeight > 0) ? item.loadedWeight : (item.weight ?? 0),
          loadedVolume: (item.loadedVolume && item.loadedVolume > 0) ? item.loadedVolume : (item.volume ?? 0),
          pieces: item.pieces ?? 0,
          weight: item.weight ?? 0,
          volume: item.volume ?? 0,
          marksAndNumbers: item.marksAndNumbers ?? null
        };

        if (mode === "Delete") {
          if (!itemId || itemId === EMPTY_GUID) {
            return query.data.items
              .filter((x) => x.id !== itemId)
              .map((x) => ({
                id: x.id,
                operationMode: "Update" as const,
                goodsReceiptItemId: x.goodsReceiptItemId ?? null,
                packageTypeGuid: x.packageTypeGuid ?? null,
                packageTypeName: x.packageTypeName ?? null,
                hsCode: x.hsCode ?? "",
                countryOfOrigin: x.countryOfOrigin ?? "",
                description: x.description ?? "",
                receivedPieces: (x.receivedPieces && x.receivedPieces > 0) ? x.receivedPieces : (x.pieces ?? 0),
                receivedWeight: (x.receivedWeight && x.receivedWeight > 0) ? x.receivedWeight : (x.weight ?? 0),
                length: x.length ?? 0,
                width: x.width ?? 0,
                height: x.height ?? 0,
                volumeCbm: (x.volumeCbm && x.volumeCbm > 0) ? x.volumeCbm : (x.volume ?? 0),
                loadedPieces: (x.loadedPieces && x.loadedPieces > 0) ? x.loadedPieces : (x.pieces ?? 0),
                loadedWeight: (x.loadedWeight && x.loadedWeight > 0) ? x.loadedWeight : (x.weight ?? 0),
                loadedVolume: (x.loadedVolume && x.loadedVolume > 0) ? x.loadedVolume : (x.volume ?? 0),
                pieces: x.pieces ?? 0,
                weight: x.weight ?? 0,
                volume: x.volume ?? 0,
                marksAndNumbers: x.marksAndNumbers ?? null
              }));
          }
          await removeDirectShipmentItem(directShipmentId, itemId);
          toast.success(lt("Item removed"), lt("Shipment item deleted."));
        } else if (mode === "Update" && itemId && itemId !== EMPTY_GUID) {
          await updateDirectShipmentItem(directShipmentId, itemId, payload);
          toast.success(lt("Item updated"), lt("Shipment item updated."));
        } else {
          await addDirectShipmentItem(directShipmentId, payload);
          toast.success(lt("Item created"), lt("Shipment item created."));
        }

        const latest = await getDirectShipment(directShipmentId);
        return latest.items.map((x) => ({
          id: x.id,
          operationMode: "Update" as const,
          goodsReceiptItemId: x.goodsReceiptItemId ?? null,
          packageTypeGuid: x.packageTypeGuid ?? null,
          packageTypeName: x.packageTypeName ?? null,
          hsCode: x.hsCode ?? "",
          countryOfOrigin: x.countryOfOrigin ?? "",
          description: x.description ?? "",
          receivedPieces: (x.receivedPieces && x.receivedPieces > 0) ? x.receivedPieces : (x.pieces ?? 0),
          receivedWeight: (x.receivedWeight && x.receivedWeight > 0) ? x.receivedWeight : (x.weight ?? 0),
          length: x.length ?? 0,
          width: x.width ?? 0,
          height: x.height ?? 0,
          volumeCbm: (x.volumeCbm && x.volumeCbm > 0) ? x.volumeCbm : (x.volume ?? 0),
          loadedPieces: (x.loadedPieces && x.loadedPieces > 0) ? x.loadedPieces : (x.pieces ?? 0),
          loadedWeight: (x.loadedWeight && x.loadedWeight > 0) ? x.loadedWeight : (x.weight ?? 0),
          loadedVolume: (x.loadedVolume && x.loadedVolume > 0) ? x.loadedVolume : (x.volume ?? 0),
          pieces: x.pieces ?? 0,
          weight: x.weight ?? 0,
          volume: x.volume ?? 0,
          marksAndNumbers: x.marksAndNumbers ?? null
        }));
      }}
      onSubmit={async (value) => {
        await mutation.mutateAsync(value.shipment as Parameters<typeof updateDirectShipment>[1]);
        if (value.documentReference && value.documentReference !== (s.documentReference ?? "")) {
          await attachDirectShipmentDocument(directShipmentId, { documentReference: value.documentReference });
        }
        toast.success(lt("Updated"), lt("Direct shipment updated."));
        navigate(`/direct-shipments/${directShipmentId}`);
      }}
      isSubmitting={mutation.isPending}
      />
  </div>;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
