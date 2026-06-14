import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getCurrencies } from "@/api/currencyApi";
import { getPendingInvoices } from "@/api/reconciliationApi";
import { getReceipt, getReceiptVoucher, replaceReceiptAllocations } from "@/api/receiptApi";
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

export function ReceiptAllocationPage() {
  const { receiptId } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const receipt = useQuery({ queryKey: ["receipt-allocation", receiptId], queryFn: () => getReceipt(receiptId!), enabled: Boolean(receiptId) });
  const partyType = receipt.data?.receivedFromPartyType || "Customer";
  const partyId = receipt.data?.receivedFromPartyId || receipt.data?.customerId;
  const pendingInvoices = useQuery({ queryKey: ["receipt-allocation-pending-invoices", partyType, partyId], queryFn: () => getPendingInvoices(partyType === "Customer" ? partyId : undefined, partyType, partyId), enabled: Boolean(partyId) && !receipt.data?.isAdvanceReceipt });
  const currencies = useQuery({ queryKey: ["receipt-currencies"], queryFn: getCurrencies });
  const voucher = useQuery({ queryKey: ["receipt-voucher", receiptId], queryFn: () => getReceiptVoucher(receiptId!), enabled: Boolean(receiptId) });
  const [allocations, setAllocations] = useState<Array<{ invoiceId: string; allocatedAmount: number }>>([]);

  useEffect(() => {
    if (receipt.data) setAllocations(receipt.data.allocations.map((x) => ({ invoiceId: x.invoiceId, allocatedAmount: x.allocatedAmount })));
  }, [receipt.data]);

  const invoiceById = useMemo(() => new Map((pendingInvoices.data ?? []).map((x) => [x.invoiceId, x])), [pendingInvoices.data]);
  const matchingPendingInvoices = useMemo(
    () => (pendingInvoices.data ?? []).filter((invoice) => invoice.invoiceCurrencyId === receipt.data?.receiptCurrencyId),
    [pendingInvoices.data, receipt.data?.receiptCurrencyId]
  );
  const allocatedTotal = allocations.reduce((sum, row) => sum + row.allocatedAmount, 0);
  const remainingAmount = Math.max(0, (receipt.data?.receiptAmount ?? 0) - allocatedTotal);
  const selectedInvoiceIds = new Set(allocations.map((x) => x.invoiceId).filter(Boolean));
  const canSave = Boolean(receipt.data) && !receipt.data!.isAdvanceReceipt && allocations.length > 0 && allocatedTotal === receipt.data!.receiptAmount && allocations.every((x) => {
    const invoice = invoiceById.get(x.invoiceId);
    return x.invoiceId && invoice?.invoiceCurrencyId === receipt.data!.receiptCurrencyId && x.allocatedAmount > 0 && x.allocatedAmount <= (invoice?.outstandingAmount ?? Number.MAX_SAFE_INTEGER);
  });

  const save = useMutation({ mutationFn: (payload: Array<{ invoiceId: string; allocatedAmount: number }>) => replaceReceiptAllocations(receiptId!, payload), onSuccess: async () => { toast.success(lt("Saved"), lt("Receipt allocation updated.")); await queryClient.invalidateQueries({ queryKey: ["receipt-allocation", receiptId] }); } });
  if (!receiptId) return <Navigate to="/receipts" replace />;
  if (receipt.isLoading || voucher.isLoading) return <LoadingScreen />;
  if (receipt.isError || voucher.isError || !receipt.data || !voucher.data) return <ErrorState onRetry={() => { void receipt.refetch(); void voucher.refetch(); }} />;
  const receiptCurrencyCode = currencies.data?.find((currency) => currency.id === receipt.data.receiptCurrencyId)?.currencyCode ?? "Receipt Currency";
  const currencyCode = (currencyId: string) => currencies.data?.find((currency) => currency.id === currencyId)?.currencyCode ?? currencyId;

  return <div className="space-y-4">
    <PageHeader title={`${lt("Receipt Allocation")} ${receipt.data.receiptNumber}`} description={lt("Allocate one customer payment across multiple pending invoices.")} actions={<AuditTrailButton />} />
    <Card><CardContent className="grid gap-4 pt-6 xl:grid-cols-[1fr_1.1fr]">
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{lt("Pending Invoices")}</h3>
          <span className="text-xs text-muted-foreground">{matchingPendingInvoices.length} {lt("matching invoice(s) in")} {receiptCurrencyCode}</span>
        </div>
        <div className="max-h-80 overflow-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-50"><tr><th className="p-2 text-left">{lt("Invoice")}</th><th className="p-2 text-left">{lt("Currency")}</th><th className="p-2 text-right">{lt("Outstanding")}</th><th className="p-2 text-right">{lt("Action")}</th></tr></thead>
            <tbody>
              {(pendingInvoices.data ?? []).map((invoice) => {
                const currencyMatches = invoice.invoiceCurrencyId === receipt.data.receiptCurrencyId;
                return <tr key={invoice.invoiceId} className="border-t">
                <td className="p-2 font-medium">{invoice.invoiceNumber}</td>
                <td className="p-2"><div>{currencyCode(invoice.invoiceCurrencyId)}</div>{!currencyMatches ? <div className="text-xs text-red-600">{lt("Receipt currency mismatch")}</div> : null}</td>
                <td className="p-2 text-right">{invoice.outstandingAmount.toFixed(2)}</td>
                <td className="p-2 text-right"><Button type="button" size="sm" variant="outline" disabled={selectedInvoiceIds.has(invoice.invoiceId) || !currencyMatches} onClick={() => setAllocations([...allocations, { invoiceId: invoice.invoiceId, allocatedAmount: Math.min(invoice.outstandingAmount, remainingAmount || invoice.outstandingAmount) }])}>{selectedInvoiceIds.has(invoice.invoiceId) ? lt("Added") : currencyMatches ? lt("Allocate") : lt("Blocked")}</Button></td>
              </tr>;
              })}
              {(pendingInvoices.data ?? []).length === 0 ? <tr><td className="p-4 text-center text-muted-foreground" colSpan={4}>{lt("No pending invoices for this party.")}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{lt("Allocation Rows")}</h3>
          <Button variant="outline" onClick={() => setAllocations([...allocations, { invoiceId: "", allocatedAmount: 0 }])}>{lt("Add Row")}</Button>
        </div>
        <div className="overflow-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("Invoice")}</th><th className="p-2 text-right">{lt("Outstanding")}</th><th className="p-2 text-left">{lt("Amount")}</th><th className="p-2 text-right">{lt("Action")}</th></tr></thead>
            <tbody>
              {allocations.map((row, index) => <tr key={`${row.invoiceId || "row"}-${index}`} className="border-t">
                <td className="p-2"><select className="h-10 w-full min-w-52 rounded-md border px-3 text-sm" value={row.invoiceId} onChange={(e) => { const next = [...allocations]; next[index] = { ...next[index], invoiceId: e.target.value }; setAllocations(next); }}><option value="">{lt("Select invoice")}</option>{matchingPendingInvoices.map((x) => <option key={x.invoiceId} value={x.invoiceId}>{x.invoiceNumber}</option>)}</select></td>
                <td className="p-2 text-right">{invoiceById.get(row.invoiceId)?.outstandingAmount.toFixed(2) ?? "-"}</td>
                <td className="p-2"><Input type="number" min="0" value={row.allocatedAmount} onChange={(e) => { const next = [...allocations]; next[index] = { ...next[index], allocatedAmount: Math.max(0, Number(e.target.value)) }; setAllocations(next); }} /></td>
                <td className="p-2 text-right"><Button type="button" variant="ghost" onClick={() => setAllocations(allocations.filter((_, i) => i !== index))}>{lt("Remove")}</Button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="grid gap-2 rounded-md bg-slate-50 p-3 text-sm md:grid-cols-3">
          <span>{lt("Receipt")}: <strong>{receipt.data.receiptAmount.toFixed(2)}</strong></span>
          <span>{lt("Allocated")}: <strong>{allocatedTotal.toFixed(2)}</strong></span>
          <span className={remainingAmount === 0 ? "text-emerald-700" : "text-amber-700"}>{lt("Remaining")}: <strong>{remainingAmount.toFixed(2)}</strong></span>
        </div>
        <Button disabled={!canSave || save.isPending} onClick={() => void save.mutateAsync(allocations)}>{save.isPending ? lt("Saving...") : lt("Save Allocation")}</Button>
      </section>
    </CardContent></Card>
    <PrintPreview title={`${lt("Receipt Voucher")} ${receipt.data.receiptNumber}`}><div className="rounded-md border p-3 whitespace-pre-wrap text-sm">{voucher.data.content}</div></PrintPreview>
  </div>;
}
