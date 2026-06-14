import { Navigate, useParams } from "react-router-dom";
import { getVoucherDraft } from "@/api/accountingApi";
import { VoucherForm } from "@/modules/accounting/VoucherForm";

export function JournalVoucherEditPage() {
  const { voucherId } = useParams();
  if (!voucherId) return <Navigate to="/accounting/journal-vouchers" replace />;
  const draft = getVoucherDraft(voucherId);
  if (!draft || draft.voucherType !== "Journal") return <Navigate to="/accounting/journal-vouchers" replace />;
  return <VoucherForm type="Journal" draft={draft} />;
}

