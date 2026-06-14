import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getReceipt, updateReceipt, type CustomerReceiptRequest } from "@/api/receiptApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { CustomerReceiptForm } from "@/modules/receipts/CustomerReceiptForm";
import { lt } from "@/modules/operationsLocalization";

export function CustomerReceiptEditPage() {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["receipt-edit", receiptId], queryFn: () => getReceipt(receiptId!), enabled: Boolean(receiptId) });
  const mutation = useMutation({ mutationFn: ({ id, request }: { id: string; request: CustomerReceiptRequest }) => updateReceipt(id, request), onSuccess: (receipt) => { toast.success(lt("Receipt updated"), receipt.receiptNumber); navigate(`/receipts/${receipt.id}`); } });
  if (!receiptId) return <Navigate to="/receipts" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const r = query.data;
  const initialValue: CustomerReceiptRequest = { customerId: r.customerId, receivedFromPartyType: r.receivedFromPartyType ?? "Customer", receivedFromPartyId: r.receivedFromPartyId ?? r.customerId, receivedFromPartyName: r.receivedFromPartyName ?? null, receiptDate: r.receiptDate, receiptCurrencyId: r.receiptCurrencyId, baseCurrencyId: r.baseCurrencyId, exchangeRate: r.exchangeRate, receiptAmount: r.receiptAmount, bankCharges: r.bankCharges, isAdvanceReceipt: r.isAdvanceReceipt, bankAccountId: r.bankAccountId ?? null, cashAccountId: r.cashAccountId ?? null, remarks: r.remarks ?? null, allocations: r.allocations.map((x) => ({ invoiceId: x.invoiceId, allocatedAmount: x.allocatedAmount })) };
  return <div className="space-y-4"><PageHeader title={`${lt("Edit Receipt")} ${r.receiptNumber}`} description={lt("Update receipt and allocation details.")} /><div className="rounded-lg border bg-white p-4"><CustomerReceiptForm initialValue={initialValue} onSubmit={async (value) => mutation.mutateAsync({ id: receiptId, request: value }).then(() => undefined)} isSubmitting={mutation.isPending} /></div></div>;
}
