import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { getCurrencies } from "@/api/currencyApi";
import { getShipmentDocuments } from "@/api/documentApi";
import { getReceipt } from "@/api/receiptApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function CustomerReceiptViewPage() {
  const { receiptId } = useParams();
  const query = useQuery({ queryKey: ["receipt-view", receiptId], queryFn: () => getReceipt(receiptId!), enabled: Boolean(receiptId) });
  const currencies = useQuery({ queryKey: ["receipt-currencies"], queryFn: getCurrencies });
  const documents = useQuery({ queryKey: ["documents", "CustomerReceipt", receiptId], queryFn: () => getShipmentDocuments("CustomerReceipt", receiptId!), enabled: Boolean(receiptId) });
  if (!receiptId) return <Navigate to="/receipts" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const r = query.data;
  const receiptCurrencyCode = currencies.data?.find((currency) => currency.id === r.receiptCurrencyId)?.currencyCode;
  const baseCurrencyCode = currencies.data?.find((currency) => currency.id === r.baseCurrencyId)?.currencyCode;
  return <div className="space-y-4"><PageHeader title={`${lt("Receipt")} ${r.receiptNumber}`} description={lt("Receipt details, allocations, and exchange gain/loss.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Receipt.Print"><Link to={`/receipts/${r.id}/print`}><Printer className="h-4 w-4" />{lt("Print Receipt")}</Link></PermissionButton><PermissionButton asChild permission="Receipt.Update"><Link to={`/receipts/${r.id}/allocation`}>{lt("Allocation")}</Link></PermissionButton></>} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-3 md:grid-cols-4"><KV k={lt("Status")} v={<StatusBadge status={r.status} />} /><KV k={lt("Received From Type")} v={lt(r.receivedFromPartyType || "Customer")} /><KV k={lt("Received From")} v={r.receivedFromPartyName || r.customerId} /><KV k={lt("Date")} v={r.receiptDate} /><KV k={lt("Receipt Currency")} v={receiptCurrencyCode || r.receiptCurrencyId} /><KV k={lt("Base Currency")} v={baseCurrencyCode || r.baseCurrencyId} /><KV k={lt("Exchange Rate")} v={`1 ${receiptCurrencyCode || ""} = ${r.exchangeRate} ${baseCurrencyCode || ""}`} /><KV k={lt("Receipt Amount")} v={<CurrencyAmount value={r.receiptAmount} currency={receiptCurrencyCode} />} /><KV k={lt("Base Amount")} v={<CurrencyAmount value={r.baseCurrencyAmount} currency={baseCurrencyCode} />} /><KV k={lt("Bank Charges")} v={<CurrencyAmount value={r.bankCharges} currency={receiptCurrencyCode} />} /><KV k={lt("Exchange Gain")} v={<CurrencyAmount value={r.exchangeGainAmount} currency={baseCurrencyCode} />} /><KV k={lt("Exchange Loss")} v={<CurrencyAmount value={r.exchangeLossAmount} currency={baseCurrencyCode} />} /><KV k={lt("Advance")} v={r.isAdvanceReceipt ? lt("Yes") : lt("No")} /></div><div className="overflow-hidden rounded-lg border"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("Invoice No")}</th><th className="p-2 text-right">{lt("Allocated")}</th><th className="p-2 text-right">{lt("Exchange Gain")} ({baseCurrencyCode})</th><th className="p-2 text-right">{lt("Exchange Loss")} ({baseCurrencyCode})</th></tr></thead><tbody>{r.allocations.map((x) => <tr key={x.id} className="border-t"><td className="p-2">{x.invoiceNumber || x.invoiceId}</td><td className="p-2 text-right">{x.allocatedAmount.toFixed(2)}</td><td className="p-2 text-right">{x.exchangeGainAmount.toFixed(2)}</td><td className="p-2 text-right">{x.exchangeLossAmount.toFixed(2)}</td></tr>)}</tbody></table></div></CardContent></Card><DocumentUploadPanel moduleName="CustomerReceipt" entityId={receiptId} defaultDocumentName={lt("Receipt Document")} defaultDocumentCategory={lt("Customer Receipt")} emptyText={lt("No documents uploaded for this receipt.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} /></div>;
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{k}</p><div className="font-medium">{v}</div></div>;
}
