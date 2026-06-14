import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getPayment, updatePayment, type VendorPaymentRequest } from "@/api/paymentApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { VendorPaymentForm } from "@/modules/payments/VendorPaymentForm";
import { lt } from "@/modules/operationsLocalization";

export function VendorPaymentEditPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["payment-edit", paymentId], queryFn: () => getPayment(paymentId!), enabled: Boolean(paymentId) });
  const mutation = useMutation({ mutationFn: ({ id, request }: { id: string; request: VendorPaymentRequest }) => updatePayment(id, request), onSuccess: (payment) => { toast.success(lt("Payment updated"), payment.paymentNumber); navigate(`/payments/${payment.id}`); } });
  if (!paymentId) return <Navigate to="/payments" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const p = query.data;
  const initialValue: VendorPaymentRequest = { vendorId: p.vendorId, paidToPartyType: p.paidToPartyType, paidToPartyId: p.paidToPartyId, paidToPartyName: p.paidToPartyName, paymentDate: p.paymentDate, paymentCurrencyId: p.paymentCurrencyId, baseCurrencyId: p.baseCurrencyId, exchangeRate: p.exchangeRate, paymentAmount: p.paymentAmount, bankCharges: p.bankCharges, isAdvancePayment: p.isAdvancePayment, bankAccountId: p.bankAccountId ?? null, cashAccountId: p.cashAccountId ?? null, remarks: p.remarks ?? null, allocations: p.allocations.map((x) => ({ vendorBillId: x.vendorBillId, allocatedAmount: x.allocatedAmount })) };
  return <div className="space-y-4"><PageHeader title={`${lt("Edit Payment")} ${p.paymentNumber}`} description={lt("Update vendor payment and allocations.")} /><div className="rounded-lg border bg-white p-4"><VendorPaymentForm initialValue={initialValue} onSubmit={async (value) => mutation.mutateAsync({ id: paymentId, request: value }).then(() => undefined)} isSubmitting={mutation.isPending} /></div></div>;
}
