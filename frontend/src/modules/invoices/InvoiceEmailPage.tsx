import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getInvoice, sendInvoiceEmail } from "@/api/invoiceApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function InvoiceEmailPage() {
  const { invoiceId } = useParams();
  const [emailTo, setEmailTo] = useState("");
  const toast = useToast();
  const invoice = useQuery({ queryKey: ["invoice-email", invoiceId], queryFn: () => getInvoice(invoiceId!), enabled: Boolean(invoiceId) });
  const mutation = useMutation({ mutationFn: ({ id, email }: { id: string; email: string }) => sendInvoiceEmail(id, email), onSuccess: () => toast.success(lt("Invoice emailed"), lt("Invoice sent successfully.")) });
  if (!invoiceId) return <Navigate to="/invoices" replace />;
  if (invoice.isLoading) return <LoadingScreen />;
  if (invoice.isError || !invoice.data) return <ErrorState onRetry={() => void invoice.refetch()} />;
  return <div className="space-y-4"><PageHeader title={`${lt("Email Invoice")}: ${invoice.data.invoiceNumber}`} description={lt("Send invoice to customer email.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6"><Input placeholder={lt("Email recipient")} value={emailTo} onChange={(e) => setEmailTo(e.target.value)} /><Button onClick={() => void mutation.mutateAsync({ id: invoiceId, email: emailTo })} disabled={!emailTo.trim() || mutation.isPending}>{lt("Send Invoice Email")}</Button></CardContent></Card></div>;
}
