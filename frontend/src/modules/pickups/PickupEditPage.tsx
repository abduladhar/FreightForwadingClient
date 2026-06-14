import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { addPickupItem, deletePickupItem, getPickup, updatePickup, updatePickupItem, type PickupDto, type PickupItemRequest, type PickupRequest } from "@/api/pickupApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { PickupForm } from "@/modules/pickups/PickupForm";
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PickupEditPage() {
  const { pickupId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const p = usePickupI18n();
  const query = useQuery({ queryKey: ["pickup", pickupId], queryFn: () => getPickup(pickupId), enabled: Boolean(pickupId) });
  const mutation = useMutation({ mutationFn: (request: PickupRequest) => updatePickup(pickupId, request), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["pickup", pickupId] }); await queryClient.invalidateQueries({ queryKey: ["pickups"] }); navigate(`/pickups/${pickupId}`); } });
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const initial: PickupRequest = { customerId: query.data.customerId, quotationId: query.data.quotationId ?? null, customerLocation: query.data.customerLocation, contactPerson: query.data.contactPerson, contactPhone: query.data.contactPhone, dropLocation: query.data.dropLocation ?? "", consigneeName: query.data.consigneeName ?? "", consigneeContactNo: query.data.consigneeContactNo ?? "", consigneeAddress: query.data.consigneeAddress ?? "", pickupDateTime: query.data.pickupDateTime, pickupCharges: query.data.pickupCharges, currencyId: query.data.currencyId ?? null, items: toEditableItems(query.data) };
  return <div className="space-y-4"><PageHeader title={`${p("Edit")} ${query.data.pickupNumber}`} description={p("Update pickup details and tracked goods.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><PickupForm initialValue={initial} onSubmit={async (value) => { await mutation.mutateAsync(value); }} isSubmitting={mutation.isPending} onSaveItem={async (item) => {
    const itemId = item.id ?? "";
    const mode = item.operationMode ?? (itemId && itemId !== EMPTY_GUID ? "Update" : "New");
    let updated: PickupDto;
    if (mode === "Delete") {
      if (!itemId || itemId === EMPTY_GUID) return initial.items.filter((x) => x !== item);
      updated = await deletePickupItem(pickupId, itemId);
      toast.success(p("Pickup item deleted"), p("Pickup item deleted successfully."));
    } else if (!itemId || itemId === EMPTY_GUID || mode === "New") {
      updated = await addPickupItem(pickupId, { ...item, id: null, operationMode: "New" });
      toast.success(p("Pickup item created"), p("Pickup item created successfully."));
    } else {
      updated = await updatePickupItem(pickupId, itemId, { ...item, operationMode: "Update" });
      toast.success(p("Pickup item updated"), p("Pickup item updated successfully."));
    }
    await queryClient.invalidateQueries({ queryKey: ["pickup", pickupId] });
    await queryClient.invalidateQueries({ queryKey: ["pickups"] });
    return toEditableItems(updated);
  }} /></CardContent></Card></div>;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function toEditableItems(pickup: PickupDto): PickupItemRequest[] {
  return pickup.items.map((x) => ({
    id: x.id,
    operationMode: "Update" as const,
    packageTypeGuid: x.packageTypeGuid ?? null,
    packageTypeName: x.packageTypeName ?? null,
    hsCode: x.hsCode ?? "",
    countryOfOrigin: x.countryOfOrigin ?? "",
    description: x.description,
    pieces: x.pieces,
    weight: x.weight,
    length: x.length,
    width: x.width,
    height: x.height,
    packageType: x.packageTypeName || x.packageType || "",
    marksAndNumbers: x.marksAndNumbers ?? ""
  }));
}
