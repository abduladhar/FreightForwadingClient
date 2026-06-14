import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { addGoodsReceiptItem, deleteGoodsReceiptItemRow, getGoodsReceipt, updateGoodsReceipt, updateGoodsReceiptItemRow, type GoodsReceiptDto, type GoodsReceiptItemRequest, type GoodsReceiptRequest } from "@/api/goodsReceiptApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { GoodsReceiptForm } from "@/modules/goodsReceipts/GoodsReceiptForm";
import { lt } from "@/modules/operationsLocalization";

export function GoodsReceiptEditPage() {
  const { goodsReceiptId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const query = useQuery({ queryKey: ["goods-receipt", goodsReceiptId], queryFn: () => getGoodsReceipt(goodsReceiptId), enabled: Boolean(goodsReceiptId) });
  const mutation = useMutation({ mutationFn: (request: GoodsReceiptRequest) => updateGoodsReceipt(goodsReceiptId, request), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["goods-receipt", goodsReceiptId] }); await queryClient.invalidateQueries({ queryKey: ["goods-receipts"] }); navigate(`/goods-receipts/${goodsReceiptId}`); } });
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const initial: GoodsReceiptRequest = { customerId: query.data.customerId, pickupId: query.data.pickupId ?? null, receivedFrom: query.data.receivedFrom, receivedDateTime: query.data.receivedDateTime, warehouseId: query.data.warehouseId ?? null, warehouseLocation: query.data.warehouseLocation ?? "", remarks: query.data.remarks ?? "", items: toEditableItems(query.data) };
  return <div className="space-y-4"><PageHeader title={`Edit ${query.data.goodsReceiptNumber}`} description={lt("Update received goods and warehouse assignment.")} /><Card><CardContent className="pt-6"><GoodsReceiptForm
    initialValue={initial}
    onSaveItem={async (item) => {
      const mode = item.operationMode ?? (item.id && item.id !== EMPTY_GUID ? lt("Update") : lt("New"));
      let updated: GoodsReceiptDto;
      if (mode === "Delete") {
        if (!item.id || item.id === EMPTY_GUID) return toEditableItems(query.data!);
        updated = await deleteGoodsReceiptItemRow(goodsReceiptId, item.id);
        toast.success(lt("Item deleted"), lt("Goods receipt item deleted successfully."));
      } else if (mode === "Update" && item.id && item.id !== EMPTY_GUID) {
        updated = await updateGoodsReceiptItemRow(goodsReceiptId, item.id, item);
        toast.success(lt("Item updated"), lt("Goods receipt item updated successfully."));
      } else {
        updated = await addGoodsReceiptItem(goodsReceiptId, item);
        toast.success(lt("Item created"), lt("Goods receipt item created successfully."));
      }
      await queryClient.invalidateQueries({ queryKey: ["goods-receipt", goodsReceiptId] });
      await queryClient.invalidateQueries({ queryKey: ["goods-receipts"] });
      await query.refetch();
      return toEditableItems(updated);
    }}
    onSubmit={async (value) => { await mutation.mutateAsync(value); }}
    isSubmitting={mutation.isPending}
  /></CardContent></Card></div>;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function toEditableItems(receipt: GoodsReceiptDto): GoodsReceiptItemRequest[] {
  return receipt.items.map((x) => ({
    id: x.id,
    operationMode: "Update",
    packageTypeGuid: x.packageTypeGuid ?? null,
    packageTypeName: x.packageTypeName ?? null,
    hsCode: x.hsCode ?? "",
    countryOfOrigin: x.countryOfOrigin ?? "",
    description: x.description,
    receivedPieces: x.receivedPieces,
    receivedWeight: x.receivedWeight,
    length: x.length,
    width: x.width,
    height: x.height
  }));
}
