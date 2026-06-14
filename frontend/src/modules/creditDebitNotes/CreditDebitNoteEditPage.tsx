import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getCreditDebitNote, updateCreditDebitNote, type CreditDebitNoteRequest } from "@/api/creditDebitNoteApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { CreditDebitNoteForm } from "@/modules/creditDebitNotes/CreditDebitNoteForm";
import { lt } from "@/modules/operationsLocalization";

export function CreditDebitNoteEditPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["credit-debit-note-edit", noteId], queryFn: () => getCreditDebitNote(noteId!), enabled: Boolean(noteId) });
  const mutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: CreditDebitNoteRequest }) => updateCreditDebitNote(id, request),
    onSuccess: (note) => {
      toast.success(lt("Credit/debit note updated"), note.noteNumber);
      navigate(`/credit-debit-notes/${note.id}`);
    }
  });
  if (!noteId) return <Navigate to="/credit-debit-notes" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const note = query.data;
  const initialValue: CreditDebitNoteRequest = {
    noteType: note.noteType,
    partyType: note.partyType,
    partyId: note.partyId,
    partyName: note.partyName,
    sourceType: note.sourceType,
    sourceId: note.sourceId ?? null,
    sourceReferenceNo: note.sourceReferenceNo,
    noteDate: note.noteDate,
    partyCurrencyId: note.partyCurrencyId,
    noteCurrencyId: note.noteCurrencyId,
    exchangeRate: note.exchangeRate,
    isExchangeRateOverride: note.isExchangeRateOverride,
    exchangeRateOverrideReason: note.exchangeRateOverrideReason ?? null,
    roundOffAmount: note.roundOffAmount,
    remarks: note.remarks ?? null,
    items: note.items.map((item) => ({
      chargeCode: item.chargeCode,
      chargeName: item.chargeName,
      chargeHead: item.chargeHead,
      quantity: item.quantity,
      unitRate: item.unitRate,
      discountAmount: item.discountAmount,
      isTaxApplicable: item.isTaxApplicable,
      taxRate: item.taxRate
    }))
  };

  return (
    <div className="space-y-4">
      <PageHeader title={`${lt("Edit")} ${note.noteNumber}`} description={lt("Update draft note details before approval.")} />
      <CreditDebitNoteForm initialValue={initialValue} noteStatus={note.status} isSubmitting={mutation.isPending} onSubmit={async (value) => mutation.mutateAsync({ id: noteId, request: value }).then(() => undefined)} />
    </div>
  );
}
