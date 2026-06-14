import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrencies } from "@/api/currencyApi";
import { getLedgerAccounts, saveVoucherDraft, updateVoucherDraft, type VoucherDraft, type VoucherLine } from "@/api/accountingApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { LedgerPostingPreview } from "@/components/common/LedgerPostingPreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DebitCreditEntryTable } from "@/modules/accounting/DebitCreditEntryTable";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

export function VoucherForm({ type, draft }: { type: VoucherDraft["voucherType"]; draft?: VoucherDraft | null }) {
  const toast = useToast();
  const accounts = useQuery({ queryKey: ["voucher-accounts"], queryFn: () => getLedgerAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const currencies = useQuery({ queryKey: ["voucher-currencies"], queryFn: getCurrencies });
  const [voucherDate, setVoucherDate] = useState(draft?.voucherDate ?? new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState(draft?.referenceNumber ?? "");
  const [narration, setNarration] = useState(draft?.narration ?? "");
  const [attachmentName, setAttachmentName] = useState(draft?.attachmentName ?? "");
  const [approvalStatus, setApprovalStatus] = useState<VoucherDraft["approvalStatus"]>(draft?.approvalStatus ?? "Draft");
  const [lines, setLines] = useState<VoucherLine[]>(draft?.lines?.length ? draft.lines : [{ id: crypto.randomUUID(), accountId: "", currencyId: "", exchangeRate: 1, debit: 0, credit: 0, baseDebit: 0, baseCredit: 0, narration: "" }]);
  const totals = useMemo(() => ({
    debit: lines.reduce((s, x) => s + x.debit, 0),
    credit: lines.reduce((s, x) => s + x.credit, 0),
    baseDebit: lines.reduce((s, x) => s + x.baseDebit, 0),
    baseCredit: lines.reduce((s, x) => s + x.baseCredit, 0)
  }), [lines]);
  const balanced = Math.abs(totals.debit - totals.credit) < 0.001 && Math.abs(totals.baseDebit - totals.baseCredit) < 0.001;

  function submit() {
    if (!balanced) {
      toast.error(lt("Voucher not balanced"), lt("Total debit/credit and base debit/credit must be equal."));
      return;
    }
    const payload = { voucherType: type, voucherDate, referenceNumber: referenceNumber || null, approvalStatus, attachmentName: attachmentName || null, narration: narration || null, lines };
    if (draft) {
      updateVoucherDraft(draft.id, payload);
      toast.success(lt("Voucher updated"), `${lt(type)} ${lt("voucher draft updated.")}`);
    } else {
      saveVoucherDraft(payload);
      toast.success(lt("Voucher saved"), `${lt(type)} ${lt("voucher draft saved.")}`);
    }
  }

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">{lt(type)} {lt("Voucher")}</h2><p className="text-sm text-muted-foreground">{lt("Balanced double-entry validation enabled.")}</p></div><AuditTrailButton /></div>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-1"><Label>{lt("Voucher Date")}</Label><Input type="date" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} /></div>
      <div className="space-y-1"><Label>{lt("Reference Number")}</Label><Input placeholder={lt("Enter reference number")} value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} /></div>
      <div className="space-y-1"><Label>{lt("Approval Status")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value as VoucherDraft["approvalStatus"])}><option value="Draft">{lt("Draft")}</option><option value="Submitted">{lt("Submitted")}</option><option value="Approved">{lt("Approved")}</option></select></div>
      <div className="space-y-1 md:col-span-2"><Label>{lt("Narration")}</Label><Input placeholder={lt("Enter voucher narration")} value={narration} onChange={(e) => setNarration(e.target.value)} /></div>
      <div className="space-y-1"><Label>{lt("Attachment")}</Label><Input type="file" onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? "")} /></div>
    </div>
    <DebitCreditEntryTable lines={lines} accounts={(accounts.data?.items ?? []).map((x) => ({ id: x.id, name: `${x.ledgerCode} - ${x.ledgerName}` }))} currencies={(currencies.data ?? []).map((x) => ({ id: x.id, code: x.currencyCode }))} onChange={setLines} onAdd={() => setLines([...lines, { id: crypto.randomUUID(), accountId: "", currencyId: "", exchangeRate: 1, debit: 0, credit: 0, baseDebit: 0, baseCredit: 0, narration: "" }])} onRemove={(id) => setLines(lines.filter((x) => x.id !== id))} />
    <div className="rounded-lg border bg-white p-4 text-sm">
      <p>{lt("Total Debit")}: {totals.debit.toFixed(2)} | {lt("Total Credit")}: {totals.credit.toFixed(2)} | {lt("Difference")}: {(totals.debit - totals.credit).toFixed(2)}</p>
      <p>{lt("Total Base Debit")}: {totals.baseDebit.toFixed(2)} | {lt("Total Base Credit")}: {totals.baseCredit.toFixed(2)} | {lt("Base Difference")}: {(totals.baseDebit - totals.baseCredit).toFixed(2)}</p>
      {!balanced ? <p className="mt-1 text-red-600">{lt("Voucher is not balanced. Submission disabled.")}</p> : <p className="mt-1 text-emerald-700">{lt("Voucher is balanced.")}</p>}
    </div>
    <LedgerPostingPreview lines={lines.map((x) => ({ id: x.id, account: (accounts.data?.items ?? []).find((a) => a.id === x.accountId)?.ledgerName ?? lt("Account"), debit: x.baseDebit, credit: x.baseCredit, currency: lt("Base Currency"), narration: x.narration ?? undefined }))} />
    <PermissionButton permission={draft ? "Accounting.Update" : "Accounting.Create"} disabled={!balanced} onClick={submit}>{lt("Save Voucher Draft")}</PermissionButton>
  </div>;
}
