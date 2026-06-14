import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createGoodsReceipt, type GoodsReceiptRequest } from "@/api/goodsReceiptApi";
import { GoodsReceiptForm } from "@/modules/goodsReceipts/GoodsReceiptForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function GoodsReceiptCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: createGoodsReceipt, onSuccess: async (receipt) => { await queryClient.invalidateQueries({ queryKey: ["goods-receipts"] }); navigate(`/goods-receipts/${receipt.id}`); } });
  return <div className="space-y-4"><PageHeader title={lt("Create Goods Receipt")} description={lt("Receive goods from customer and store warehouse references.")} /><Card><CardContent className="pt-6"><GoodsReceiptForm onSubmit={async (value: GoodsReceiptRequest) => { await mutation.mutateAsync(value); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
