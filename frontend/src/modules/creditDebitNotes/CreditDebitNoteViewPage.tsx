import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Pencil, XCircle } from "lucide-react";
import { approveCreditDebitNote, cancelCreditDebitNote, getCreditDebitNote } from "@/api/creditDebitNoteApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function CreditDebitNoteViewPage() {
  const { noteId } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const query = useQuery({ queryKey: ["credit-debit-note", noteId], queryFn: () => getCreditDebitNote(noteId!), enabled: Boolean(noteId) });
  const currencies = useQuery({ queryKey: ["tenant-currencies", "credit-debit-note-view"], queryFn: getTenantCurrencies });
  const approve = useMutation({ mutationFn: approveCreditDebitNote, onSuccess: async (note) => { toast.success(lt("Note approved and posted"), note.noteNumber); await queryClient.invalidateQueries({ queryKey: ["credit-debit-note", noteId] }); } });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelCreditDebitNote(id, reason), onSuccess: async (note) => { toast.success(lt("Note cancelled"), note.noteNumber); await queryClient.invalidateQueries({ queryKey: ["credit-debit-note", noteId] }); } });
  if (!noteId) return <Navigate to="/credit-debit-notes" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const note = query.data;
  const noteCurrency = currencies.data?.find((currency) => currency.currencyId === note.noteCurrencyId)?.currencyCode ?? "USD";
  const baseCurrency = currencies.data?.find((currency) => currency.isBaseCurrency)?.currencyCode ?? noteCurrency;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${lt(note.noteType)}: ${note.noteNumber}`}
        description={lt("Credit/debit note detail, approval with accounting posting, and cancellation.")}
        actions={<>
          <AuditTrailButton />
          {note.status === "Draft" ? <PermissionButton asChild permission="CreditDebitNote.Update"><Link to={`/credit-debit-notes/${note.id}/edit`}><Pencil className="h-4 w-4" /> {lt("Edit")}</Link></PermissionButton> : null}
          {hasPermission("CreditDebitNote.Approve") && note.status === "Draft" ? <Button onClick={() => void approve.mutateAsync(note.id)}><CheckCircle2 className="h-4 w-4" /> {lt("Approve")}</Button> : null}
          {hasPermission("CreditDebitNote.Cancel") && note.status !== "Cancelled" ? <ConfirmDialog title={lt("Cancel note?")} description={note.noteNumber} confirmText={lt("Cancel Note")} variant="danger" onConfirm={async () => cancel.mutateAsync({ id: note.id, reason: "Cancelled from detail page" }).then(() => undefined)}><Button variant="destructive"><XCircle className="h-4 w-4" /> {lt("Cancel")}</Button></ConfirmDialog> : null}
        </>}
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <KV k={lt("Status")} v={<StatusBadge status={note.status} />} />
            <KV k={lt("Accounting")} v={lt(note.isAccountingPosted ? lt("Posted") : lt("Pending"))} />
            <KV k={lt("Party Type")} v={lt(note.partyType)} />
            <KV k={lt("Party")} v={note.partyName} />
            <KV k={lt("Source Type")} v={lt(displaySourceType(note.sourceType))} />
            <KV k={lt("Source Reference No")} v={note.sourceReferenceNo || "-"} />
            <KV k={lt("Note Date")} v={note.noteDate} />
            <KV k={lt("Exchange Rate")} v={note.exchangeRate.toFixed(8)} />
            <KV k={`${lt("Total")} (${noteCurrency})`} v={<CurrencyAmount value={note.totalAmount} currency={noteCurrency} />} />
            <KV k={`${lt("Base Amount")} (${baseCurrency})`} v={<CurrencyAmount value={note.baseCurrencyAmount} currency={baseCurrency} />} />
            <KV k={lt("Approved Date")} v={note.approvedDate ? new Date(note.approvedDate).toLocaleString() : "-"} />
            <KV k={lt("Posted Date")} v={note.accountingPostedDate ? new Date(note.accountingPostedDate).toLocaleString() : "-"} />
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">{lt("Charge Code")}</th>
                  <th className="p-2 text-left">{lt("Charge Name")}</th>
                  <th className="p-2 text-left">{lt("Head")}</th>
                  <th className="p-2 text-right">{lt("Qty")}</th>
                  <th className="p-2 text-right">{lt("Rate")}</th>
                  <th className="p-2 text-right">{lt("Discount")}</th>
                  <th className="p-2 text-right">{lt("Tax")}</th>
                  <th className="p-2 text-right">{lt("Line")}</th>
                </tr>
              </thead>
              <tbody>
                {note.items.map((item) => <tr key={item.id} className="border-t">
                  <td className="p-2">{item.chargeCode}</td>
                  <td className="p-2">{item.chargeName}</td>
                  <td className="p-2">{item.chargeHead}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">{item.unitRate.toFixed(2)}</td>
                  <td className="p-2 text-right">{item.discountAmount.toFixed(2)}</td>
                  <td className="p-2 text-right">{item.taxAmount.toFixed(2)}</td>
                  <td className="p-2 text-right font-semibold">{item.lineAmount.toFixed(2)}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          {note.remarks ? <KV k={lt("Remarks")} v={note.remarks} /> : null}
          {note.cancellationReason ? <KV k={lt("Cancellation Reason")} v={note.cancellationReason} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function KV({ k, v }: { k: string; v: ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{k}</p><div className="font-medium">{v}</div></div>;
}

function displaySourceType(value: string) {
  switch (value) {
    case "VendorBill": return "Vendor Bill";
    case "GoodsReceipt": return "Goods Receipt Note";
    case "HouseShipment": return "House Shipment";
    case "MasterShipment": return "Master Shipment";
    case "DirectShipment": return "Direct Shipment";
    case "CustomsClearance": return "Customs Clearance";
    default: return value;
  }
}
