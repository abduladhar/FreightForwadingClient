import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createCreditDebitNote, type CreditDebitNoteRequest } from "@/api/creditDebitNoteApi";
import { getInvoice } from "@/api/invoiceApi";
import { getVendorBill } from "@/api/vendorBillApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { CreditDebitNoteForm } from "@/modules/creditDebitNotes/CreditDebitNoteForm";
import { lt } from "@/modules/operationsLocalization";

export function CreditDebitNoteCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const sourceTypeParam = searchParams.get("sourceType");
  const sourceType = sourceTypeParam === "Invoice" || sourceTypeParam === "VendorBill" ? sourceTypeParam : "Standalone";
  const sourceId = sourceType === "Standalone" ? null : searchParams.get("sourceId");
  const lockNoteType = Boolean(searchParams.get("noteType") && (sourceType === "Invoice" || sourceType === "VendorBill"));
  const lockSourceType = true;
  const invoiceQuery = useQuery({ queryKey: ["credit-debit-note-source-invoice", sourceId], queryFn: () => getInvoice(sourceId!), enabled: sourceType === "Invoice" && Boolean(sourceId) });
  const billQuery = useQuery({ queryKey: ["credit-debit-note-source-bill", sourceId], queryFn: () => getVendorBill(sourceId!), enabled: sourceType === "VendorBill" && Boolean(sourceId) });
  const mutation = useMutation({
    mutationFn: createCreditDebitNote,
    onSuccess: (note) => {
      toast.success(lt("Credit/debit note created"), note.noteNumber);
      navigate(`/credit-debit-notes/${note.id}`);
    }
  });
  if (invoiceQuery.isLoading || billQuery.isLoading) return <LoadingScreen />;
  const initialValue: CreditDebitNoteRequest = sourceType === "Invoice" && invoiceQuery.data
    ? {
      noteType: (searchParams.get("noteType") as CreditDebitNoteRequest["noteType"]) || "Credit Note",
      partyType: invoiceQuery.data.billToPartyType === "Vendor" ? ("Vendor" as const) : ("Customer" as const),
      partyId: invoiceQuery.data.billToPartyId || invoiceQuery.data.customerId,
      partyName: invoiceQuery.data.billToPartyName,
      sourceType: "Invoice",
      sourceId: invoiceQuery.data.id,
      sourceReferenceNo: invoiceQuery.data.invoiceNumber,
      noteDate: new Date().toISOString().slice(0, 10),
      partyCurrencyId: invoiceQuery.data.customerCurrencyId,
      noteCurrencyId: invoiceQuery.data.invoiceCurrencyId,
      exchangeRate: invoiceQuery.data.exchangeRate,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null,
      roundOffAmount: 0,
      remarks: null,
      items: invoiceQuery.data.items.map((item) => ({
        chargeCode: item.chargeCode,
        chargeName: item.chargeName,
        chargeHead: item.chargeHead,
        quantity: item.quantity,
        unitRate: item.unitRate,
        discountAmount: item.discountAmount,
        isTaxApplicable: item.isTaxApplicable,
        taxRate: item.taxRate
      }))
    }
    : sourceType === "VendorBill" && billQuery.data
      ? {
        noteType: (searchParams.get("noteType") as CreditDebitNoteRequest["noteType"]) || "Credit Note",
        partyType: "Vendor",
        partyId: billQuery.data.payToPartyId || billQuery.data.vendorId,
        partyName: billQuery.data.payToPartyName,
        sourceType: "VendorBill",
      sourceId: billQuery.data.id,
        sourceReferenceNo: billQuery.data.vendorBillNumber,
        noteDate: new Date().toISOString().slice(0, 10),
        partyCurrencyId: billQuery.data.vendorCurrencyId,
        noteCurrencyId: billQuery.data.billCurrencyId,
        exchangeRate: billQuery.data.exchangeRate,
        isExchangeRateOverride: false,
        exchangeRateOverrideReason: null,
        roundOffAmount: 0,
        remarks: null,
        items: billQuery.data.items.map((item) => ({
          chargeCode: item.costCode,
          chargeName: item.costName,
          chargeHead: item.costHead,
          quantity: item.quantity,
          unitRate: item.unitRate,
          discountAmount: item.discountAmount,
          isTaxApplicable: item.isTaxApplicable,
          taxRate: item.taxRate
        }))
      }
      : {
    noteType: (searchParams.get("noteType") as CreditDebitNoteRequest["noteType"]) || "Credit Note",
    partyType: (searchParams.get("partyType") as CreditDebitNoteRequest["partyType"]) || "Customer",
    partyId: searchParams.get("partyId") ?? "",
    partyName: searchParams.get("partyName"),
    sourceType: "Standalone",
    sourceId: null,
    sourceReferenceNo: "",
    noteDate: new Date().toISOString().slice(0, 10),
    partyCurrencyId: searchParams.get("partyCurrencyId") ?? "",
    noteCurrencyId: searchParams.get("noteCurrencyId") ?? searchParams.get("partyCurrencyId") ?? "",
    exchangeRate: Number(searchParams.get("exchangeRate") ?? 1),
    isExchangeRateOverride: false,
    exchangeRateOverrideReason: null,
    roundOffAmount: 0,
    remarks: null,
    items: [{ chargeCode: "", chargeName: "", chargeHead: "", quantity: 1, unitRate: 0, discountAmount: 0, isTaxApplicable: false, taxRate: 0 }]
  };

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Create Credit / Debit Note")} description={lt("Create a standalone or linked customer/vendor adjustment note.")} actions={<AuditTrailButton />} />
      <CreditDebitNoteForm initialValue={initialValue} lockNoteType={lockNoteType} lockSourceType={lockSourceType} isSubmitting={mutation.isPending} onSubmit={async (value) => mutation.mutateAsync(value).then(() => undefined)} />
    </div>
  );
}
