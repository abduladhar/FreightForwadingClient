import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { getShipmentDocuments } from "@/api/documentApi";
import { getPayment } from "@/api/paymentApi";
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

export function VendorPaymentViewPage() {
  const { paymentId } = useParams();
  const query = useQuery({ queryKey: ["payment-view", paymentId], queryFn: () => getPayment(paymentId!), enabled: Boolean(paymentId) });
  const documents = useQuery({ queryKey: ["documents", "VendorPayment", paymentId], queryFn: () => getShipmentDocuments("VendorPayment", paymentId!), enabled: Boolean(paymentId) });
  if (!paymentId) return <Navigate to="/payments" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const p = query.data;
  return <div className="space-y-4"><PageHeader title={`${lt("Payment")} ${p.paymentNumber}`} description={lt("Payment details, allocations, and exchange gain/loss.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Payment.Update"><Link to={`/payments/${p.id}/allocation`}>{lt("Allocation")}</Link></PermissionButton></>} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-3 md:grid-cols-4"><KV k={lt("Status")} v={<StatusBadge status={p.status} />} /><KV k={lt("Date")} v={p.paymentDate} /><KV k={lt("Payment Amount")} v={<CurrencyAmount value={p.paymentAmount} />} /><KV k={lt("Base Amount")} v={<CurrencyAmount value={p.baseCurrencyAmount} />} /><KV k={lt("Bank Charges")} v={<CurrencyAmount value={p.bankCharges} />} /><KV k={lt("Exchange Gain")} v={<CurrencyAmount value={p.exchangeGainAmount} />} /><KV k={lt("Exchange Loss")} v={<CurrencyAmount value={p.exchangeLossAmount} />} /><KV k={lt("Advance")} v={p.isAdvancePayment ? lt("Yes") : lt("No")} /></div><div className="overflow-hidden rounded-lg border"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("Vendor Bill Id")}</th><th className="p-2 text-right">{lt("Allocated")}</th><th className="p-2 text-right">{lt("Exchange Gain")}</th><th className="p-2 text-right">{lt("Exchange Loss")}</th></tr></thead><tbody>{p.allocations.map((x) => <tr key={x.id} className="border-t"><td className="p-2">{x.vendorBillId}</td><td className="p-2 text-right">{x.allocatedAmount.toFixed(2)}</td><td className="p-2 text-right">{x.exchangeGainAmount.toFixed(2)}</td><td className="p-2 text-right">{x.exchangeLossAmount.toFixed(2)}</td></tr>)}</tbody></table></div></CardContent></Card><DocumentUploadPanel moduleName="VendorPayment" entityId={paymentId} defaultDocumentName={lt("Payment Document")} defaultDocumentCategory={lt("Vendor Payment")} emptyText={lt("No documents uploaded for this payment.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} /></div>;
}

function KV({ k, v }: { k: string; v: ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{k}</p><div className="font-medium">{v}</div></div>;
}
