import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getTenantCurrencies } from "@/api/currencyApi";
import { approveInvoice, cancelInvoice, getInvoice } from "@/api/invoiceApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { lt } from "@/modules/operationsLocalization";

export function InvoiceApprovalPage() {
  const { invoiceId } = useParams();
  const [reason, setReason] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["invoice-approval", invoiceId], queryFn: () => getInvoice(invoiceId!), enabled: Boolean(invoiceId) });
  const currencies = useQuery({ queryKey: ["tenant-currencies", "invoice-approval"], queryFn: getTenantCurrencies });
  const approve = useMutation({ mutationFn: approveInvoice, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["invoice-approval", invoiceId] }); navigate(`/invoices/${invoiceId}`); } });
  const cancel = useMutation({ mutationFn: ({ id, cancelReason }: { id: string; cancelReason: string }) => cancelInvoice(id, cancelReason), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["invoice-approval", invoiceId] }); navigate(`/invoices/${invoiceId}`); } });
  if (!invoiceId) return <Navigate to="/invoices" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const currencyCode = currencies.data?.find((currency) => currency.currencyId === query.data.invoiceCurrencyId)?.currencyCode ?? "USD";
  const baseCurrencyCode = currencies.data?.find((currency) => currency.isBaseCurrency)?.currencyCode ?? currencyCode;
  return <div className="space-y-4"><PageHeader title={`${lt("Approval")}: ${query.data.invoiceNumber}`} description={lt("Approve or cancel invoice with reason capture.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-4 pt-6"><div className="grid gap-2 md:grid-cols-3"><div><p className="text-xs text-muted-foreground">{lt("Status")}</p><StatusBadge status={query.data.status} /></div><div><p className="text-xs text-muted-foreground">{lt("Total Amount")} ({currencyCode})</p><CurrencyAmount value={query.data.totalAmount} currency={currencyCode} /></div><div><p className="text-xs text-muted-foreground">{lt("Base Amount")} ({baseCurrencyCode})</p><CurrencyAmount value={query.data.baseCurrencyAmount} currency={baseCurrencyCode} /></div></div><Input placeholder={lt("Cancellation reason (required for cancel)")} value={reason} onChange={(e) => setReason(e.target.value)} /><div className="flex gap-2"><PermissionButton permission="Invoice.Approve" onClick={() => void approve.mutateAsync(invoiceId)} disabled={approve.isPending}>{lt("Approve")}</PermissionButton><PermissionButton permission="Invoice.Cancel" variant="destructive" onClick={() => void cancel.mutateAsync({ id: invoiceId, cancelReason: reason })} disabled={!reason.trim() || cancel.isPending}>{lt("Cancel Invoice")}</PermissionButton></div></CardContent></Card></div>;
}
