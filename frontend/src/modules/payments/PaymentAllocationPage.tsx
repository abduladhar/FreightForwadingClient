import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getCurrencies } from "@/api/currencyApi";
import { getPayment, getPaymentVoucher, replacePaymentAllocations } from "@/api/paymentApi";
import { getPendingBills } from "@/api/reconciliationApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function PaymentAllocationPage() {
  const { paymentId } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const payment = useQuery({ queryKey: ["payment-allocation", paymentId], queryFn: () => getPayment(paymentId!), enabled: Boolean(paymentId) });
  const partyType = payment.data?.paidToPartyType || "Vendor";
  const partyId = payment.data?.paidToPartyId || payment.data?.vendorId;
  const bills = useQuery({ queryKey: ["payment-allocation-bills", partyType, partyId], queryFn: () => getPendingBills(partyType === "Vendor" ? partyId : undefined, partyType, partyId), enabled: Boolean(partyId) && !payment.data?.isAdvancePayment });
  const currencies = useQuery({ queryKey: ["payment-currencies"], queryFn: getCurrencies });
  const voucher = useQuery({ queryKey: ["payment-voucher", paymentId], queryFn: () => getPaymentVoucher(paymentId!), enabled: Boolean(paymentId) });
  const [allocations, setAllocations] = useState<Array<{ vendorBillId: string; allocatedAmount: number }>>([]);

  useEffect(() => {
    if (payment.data) setAllocations(payment.data.allocations.map((x) => ({ vendorBillId: x.vendorBillId, allocatedAmount: x.allocatedAmount })));
  }, [payment.data]);

  const billById = useMemo(() => new Map((bills.data ?? []).map((x) => [x.vendorBillId, x])), [bills.data]);
  const matchingBills = useMemo(
    () => (bills.data ?? []).filter((bill) => bill.billCurrencyId === payment.data?.paymentCurrencyId),
    [bills.data, payment.data?.paymentCurrencyId]
  );
  const save = useMutation({ mutationFn: (payload: Array<{ vendorBillId: string; allocatedAmount: number }>) => replacePaymentAllocations(paymentId!, payload), onSuccess: async () => { toast.success(lt("Saved"), lt("Payment allocation updated.")); await queryClient.invalidateQueries({ queryKey: ["payment-allocation", paymentId] }); } });
  if (!paymentId) return <Navigate to="/payments" replace />;
  if (payment.isLoading || voucher.isLoading) return <LoadingScreen />;
  if (payment.isError || voucher.isError || !payment.data || !voucher.data) return <ErrorState onRetry={() => { void payment.refetch(); void voucher.refetch(); }} />;
  const rows = allocations;
  const paymentCurrencyCode = currencies.data?.find((currency) => currency.id === payment.data.paymentCurrencyId)?.currencyCode ?? "Payment Currency";
  const canSave = rows.length > 0 && rows.every((row) => {
    const bill = billById.get(row.vendorBillId);
    return row.vendorBillId && bill?.billCurrencyId === payment.data.paymentCurrencyId && row.allocatedAmount > 0 && row.allocatedAmount <= (bill?.outstandingAmount ?? Number.MAX_SAFE_INTEGER);
  });
  return <div className="space-y-4"><PageHeader title={`${lt("Payment Allocation")} ${payment.data.paymentNumber}`} description={`${lt("Allocate vendor payment against vendor bill outstanding amounts.")} (${paymentCurrencyCode})`} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6">
    <div className="rounded-md bg-slate-50 p-3 text-sm text-muted-foreground">{matchingBills.length} {lt("matching pending bill(s) in")} {paymentCurrencyCode}. {lt("Bills in other currencies cannot be allocated to this payment.")}</div>
    {rows.map((row, index) => {
      const bill = billById.get(row.vendorBillId);
      return <div key={`${row.vendorBillId || "row"}-${index}`} className="grid gap-2 md:grid-cols-[1fr_160px_200px]">
        <select className="h-10 w-full rounded-md border px-3 text-sm" value={row.vendorBillId} onChange={(e) => { const next = [...rows]; next[index] = { ...next[index], vendorBillId: e.target.value }; setAllocations(next); }}>
          <option value="">{lt("Select vendor bill")}</option>
          {matchingBills.map((x) => <option key={x.vendorBillId} value={x.vendorBillId}>{x.vendorBillNumber} - {lt("Outstanding")} {x.outstandingAmount.toFixed(2)}</option>)}
        </select>
        <div className="rounded-md border bg-white px-3 py-2 text-right text-sm">{bill ? bill.outstandingAmount.toFixed(2) : "-"}</div>
        <Input type="number" min="0" value={row.allocatedAmount} onChange={(e) => { const next = [...rows]; next[index] = { ...next[index], allocatedAmount: Math.max(0, Number(e.target.value)) }; setAllocations(next); }} />
      </div>;
    })}
    <div className="flex gap-2"><Button variant="outline" onClick={() => setAllocations([...rows, { vendorBillId: "", allocatedAmount: 0 }])}>{lt("Add Row")}</Button><Button disabled={!canSave || save.isPending} onClick={() => void save.mutateAsync(rows)}>{save.isPending ? lt("Saving...") : lt("Save Allocation")}</Button></div></CardContent></Card><PrintPreview title={`${lt("Payment Voucher")} ${payment.data.paymentNumber}`}><div className="rounded-md border p-3 whitespace-pre-wrap text-sm">{voucher.data.content}</div></PrintPreview></div>;
}
