import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { approveQuotation, getQuotation, rejectQuotation, submitQuotation } from "@/api/quotationApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { useQuotationI18n } from "@/modules/quotations/quotationI18n";

export function QuotationApprovalPage() {
  const q = useQuotationI18n();
  const { quotationId = "" } = useParams();
  const [reason, setReason] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["quotation-approval", quotationId], queryFn: () => getQuotation(quotationId), enabled: Boolean(quotationId) });
  const submit = useMutation({
    mutationFn: submitQuotation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["quotation-approval", quotationId] });
      await queryClient.invalidateQueries({ queryKey: ["quotation", quotationId] });
      await queryClient.invalidateQueries({ queryKey: ["quotations"] });
    }
  });
  const approve = useMutation({
    mutationFn: approveQuotation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["quotation-approval", quotationId] });
      navigate(`/quotations/${quotationId}`);
    }
  });
  const reject = useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason?: string }) => rejectQuotation(id, rejectionReason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["quotation-approval", quotationId] });
      navigate(`/quotations/${quotationId}`);
    }
  });
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

  const isDraft = query.data.status === "Draft";
  const isSubmitted = query.data.status === "Submitted";

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${q("Approval")}: ${query.data.quotationNumber}`}
        description={q("Submit draft quotations, then approve or reject submitted quotations.")}
        actions={<AuditTrailButton />}
      />
      <Card className={masterDataPanelClass}>
        <CardContent className={`${masterDataPanelContentClass} space-y-4`}>
          <div className="grid gap-2 md:grid-cols-2">
            <div><p className="text-xs text-muted-foreground">{q("Status")}</p><StatusBadge status={query.data.status} label={q(query.data.status)} /></div>
            <div><p className="text-xs text-muted-foreground">{q("Total Amount")}</p><p className="font-medium">{query.data.totalAmount.toFixed(2)}</p></div>
          </div>
          {isSubmitted ? <Input placeholder={q("Rejection reason (required for reject)")} value={reason} onChange={(event) => setReason(event.target.value)} /> : null}
          <div className="flex flex-wrap gap-2">
            {isDraft ? <Button className={masterDataButtonClass} onClick={() => void submit.mutateAsync(quotationId)} disabled={submit.isPending}>{q(submit.isPending ? "Submitting..." : "Submit for Approval")}</Button> : null}
            {isSubmitted ? <>
              <Button className={masterDataButtonClass} onClick={() => void approve.mutateAsync(quotationId)} disabled={approve.isPending}>{q(approve.isPending ? "Approving..." : "Approve")}</Button>
              <Button className={masterDataButtonClass} variant="destructive" onClick={() => void reject.mutateAsync({ id: quotationId, rejectionReason: reason })} disabled={!reason.trim() || reject.isPending}>{q("Reject")}</Button>
            </> : null}
            {!isDraft && !isSubmitted ? <p className="text-sm text-muted-foreground">{q("No approval action is available for this quotation status.")}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
