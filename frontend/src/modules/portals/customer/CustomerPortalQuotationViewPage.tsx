import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { approveCustomerPortalQuotation, getCustomerPortalQuotations, rejectCustomerPortalQuotation } from "@/api/portalApi";
import { getCurrencies } from "@/api/currencyApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { useWorkspace } from "@/hooks/useWorkspace";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";
import { formatCurrencyAmount } from "@/utils/currencyFormat";

export function CustomerPortalQuotationViewPage() {
  const workspace = useWorkspace();
  const language = useLanguage();
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const listQuery = useQuery({ queryKey: ["customer-portal", "quotations"], queryFn: getCustomerPortalQuotations });
  const currencies = useQuery({ queryKey: ["portal-currencies"], queryFn: getCurrencies });
  const quote = useMemo(() => (listQuery.data ?? []).find((x) => x.id === quotationId), [listQuery.data, quotationId]);
  const currencyCode = useMemo(() => (currencies.data ?? []).find((x) => x.id === quote?.currencyId)?.currencyCode ?? workspace.baseCurrency, [currencies.data, quote?.currencyId, workspace.baseCurrency]);
  const canRespond = quote ? ["Submitted", "Approved", "Sent", "Draft"].includes(quote.status) : false;

  const approve = useMutation({
    mutationFn: () => approveCustomerPortalQuotation(quotationId!, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer-portal", "quotations"] });
      navigate("/customer-portal/quotations");
    }
  });
  const reject = useMutation({
    mutationFn: () => rejectCustomerPortalQuotation(quotationId!, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer-portal", "quotations"] });
      navigate("/customer-portal/quotations");
    }
  });

  return (
    <div className="space-y-4">
      <PortalPageHeader title={`Quotation ${quote?.quotationNumber ?? ""}`} description="Approve or reject this quotation." />
      <Card>
        <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p><span className="font-medium">Date:</span> {language.formatLocalizedDate(quote?.quotationDate)}</p>
          <p><span className="font-medium">Valid Until:</span> {language.formatLocalizedDate(quote?.validUntilDate)}</p>
          <p><span className="font-medium">Origin:</span> {quote?.origin}</p>
          <p><span className="font-medium">Destination:</span> {quote?.destination}</p>
          <p><span className="font-medium">Mode:</span> {quote?.modeOfTransport}</p>
          <p><span className="font-medium">Status:</span> {quote?.status}</p>
          <p><span className="font-medium">Total:</span> {formatCurrencyAmount(quote?.totalAmount ?? 0, { cultureCode: workspace.cultureCode, currencyCode })}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Response</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => approve.mutate()} disabled={!quote || !canRespond || approve.isPending}>Approve</Button>
            <Button variant="destructive" onClick={() => reject.mutate()} disabled={!quote || !canRespond || reject.isPending}>Reject</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
