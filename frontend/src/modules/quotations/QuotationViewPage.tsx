import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRightLeft, CheckCircle2, Mail, Pencil, Printer, Send, XCircle } from "lucide-react";
import { cancelQuotation, getQuotation, sendQuotationEmail, submitQuotation } from "@/api/quotationApi";
import { getCurrencies } from "@/api/currencyApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { useQuotationI18n } from "@/modules/quotations/quotationI18n";

export function QuotationViewPage() {
  const q = useQuotationI18n();
  const { quotationId } = useParams();
  const [emailTo, setEmailTo] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["quotation", quotationId], queryFn: () => getQuotation(quotationId!), enabled: Boolean(quotationId) });
  const currencies = useQuery({ queryKey: ["quotation-currencies"], queryFn: getCurrencies });
  const submit = useMutation({ mutationFn: submitQuotation, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] }) });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelQuotation(id, reason), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] }) });
  const sendEmail = useMutation({ mutationFn: ({ id, email }: { id: string; email: string }) => sendQuotationEmail(id, email) });
  if (!quotationId) return <Navigate to="/quotations" replace />;

  const quotation = query.data;
  const currencyCode = currencies.data?.find((currency) => currency.id === quotation?.currencyId)?.currencyCode ?? q("Amount");

  return (
    <div className="space-y-4">
      <PageHeader
        title={quotation?.quotationNumber ?? q("Quotation")}
        description={quotation ? `${quotation.origin} → ${quotation.destination}` : ""}
        actions={<>
          <AuditTrailButton />
          <PermissionButton className={masterDataButtonClass} asChild permission="Quotation.Update"><Link to={`/quotations/${quotationId}/edit`}><Pencil className="h-4 w-4" /> {q("Edit")}</Link></PermissionButton>
          <PermissionButton className={masterDataButtonClass} asChild permission="Quotation.Read" variant="outline"><Link to={`/quotations/${quotationId}/calculation`}><CheckCircle2 className="h-4 w-4" /> {q("Calculation")}</Link></PermissionButton>
          <PermissionButton className={masterDataButtonClass} asChild permission="Quotation.Print" variant="outline"><Link to={`/quotations/${quotationId}/print`}><Printer className="h-4 w-4" /> {q("Print")}</Link></PermissionButton>
          <PermissionButton className={masterDataButtonClass} asChild permission="Quotation.Approve"><Link to={`/quotations/${quotationId}/approval`}><ArrowRightLeft className="h-4 w-4" /> {q("Approval")}</Link></PermissionButton>
        </>}
      />
      {quotation ? <>
        <Card className={masterDataPanelClass}>
          <CardContent className={`${masterDataPanelContentClass} grid gap-3 md:grid-cols-3`}>
            <Field label={q("Status")}><StatusBadge status={quotation.status} label={q(quotation.status)} /></Field>
            <Field label={q("Quotation Date")}>{quotation.quotationDate}</Field>
            <Field label={q("Valid Until")}>{quotation.validUntilDate}</Field>
            <Field label={q("Service")}>{quotation.serviceType}</Field>
            <Field label={q("Mode")}>{q(quotation.modeOfTransport)}</Field>
            <Field label={q("Shipment Type")}>{q(quotation.shipmentType)}</Field>
            <Field label={q("Currency")}>{currencyCode}</Field>
            <Field label={q("Total")}><CurrencyAmount value={quotation.totalAmount} currency={currencyCode} /></Field>
            <Field label={q("Manual Override")}>{q(quotation.isManualOverride ? "Yes" : "No")}</Field>
          </CardContent>
        </Card>
        <Card className={masterDataPanelClass}>
          <CardContent className={`${masterDataPanelContentClass} space-y-3`}>
            <h3 className="font-medium">{q("Workflow Actions")}</h3>
            <div className="flex flex-wrap gap-2">
              <PermissionButton className={masterDataButtonClass} permission="Quotation.Update" onClick={() => void submit.mutateAsync(quotationId)}><Send className="h-4 w-4" /> {q("Submit")}</PermissionButton>
              <PermissionButton className={masterDataButtonClass} permission="Quotation.Cancel" variant="outline" onClick={() => void cancel.mutateAsync({ id: quotationId, reason: q("Cancelled from quotation view") })}><XCircle className="h-4 w-4" /> {q("Cancel")}</PermissionButton>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input placeholder={q("customer@email.com")} value={emailTo} onChange={(event) => setEmailTo(event.target.value)} />
              <PermissionButton className={masterDataButtonClass} permission="Quotation.Export" variant="outline" onClick={() => void sendEmail.mutateAsync({ id: quotationId, email: emailTo })} disabled={!emailTo.trim()}><Mail className="h-4 w-4" /> {q("Email Quotation")}</PermissionButton>
            </div>
          </CardContent>
        </Card>
      </> : <Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} text-sm text-muted-foreground`}>{q("Loading quotation...")}</CardContent></Card>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><div className="font-medium">{children}</div></div>;
}
