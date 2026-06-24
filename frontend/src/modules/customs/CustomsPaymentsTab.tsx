import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Landmark, Pencil, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  createCustomsJobChild,
  deleteCustomsJobChild,
  getCustomsPaymentAccountOptions,
  postCustomsPayment,
  updateCustomsJobChild,
  type CustomsPaymentDto,
  type CustomsPaymentRequest
} from "@/api/customsApi";
import { lt } from "@/modules/operationsLocalization";
import { PermissionButton } from "@/auth/PermissionButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type Option = { value: string; label: string };

type Props = {
  jobId: string;
  rows: CustomsPaymentDto[];
  locked: boolean;
  currencyOptions: Option[];
  onRefresh: () => void;
};

const emptyPayment = (): CustomsPaymentRequest => ({
  paymentReference: "",
  paymentDate: localDateTime(),
  amount: 0,
  paymentMode: "Bank",
  paidBy: "",
  remarks: "",
  paymentResponsibility: "Customer",
  paymentAccountType: null,
  bankAccountId: null,
  cashAccountId: null,
  customsLedgerAccountId: null,
  currencyId: null,
  exchangeRate: 1
});

export function CustomsPaymentsTab({ jobId, rows, locked, currencyOptions, onRefresh }: Props) {
  const toast = useToast();
  const accounts = useQuery({
    queryKey: ["customs-payment-account-options"],
    queryFn: getCustomsPaymentAccountOptions
  });
  const [value, setValue] = useState<CustomsPaymentRequest>(emptyPayment);
  const [editingId, setEditingId] = useState<string | null>(null);
  const companyPaid = value.paymentResponsibility === "Company";
  const accountOptions = value.paymentAccountType === "Cash"
    ? accounts.data?.cashAccounts ?? []
    : accounts.data?.bankAccounts ?? [];
  const isValid = useMemo(() => {
    if (!value.paymentReference.trim() || !value.paymentDate || value.amount <= 0 || !value.paymentMode) return false;
    if (!companyPaid) return true;
    const companyAccountId = value.paymentAccountType === "Bank" ? value.bankAccountId : value.cashAccountId;
    return Boolean(value.paymentAccountType && companyAccountId && value.customsLedgerAccountId && value.currencyId && value.exchangeRate > 0);
  }, [companyPaid, value]);

  const saveMutation = useMutation({
    mutationFn: () => editingId
      ? updateCustomsJobChild(jobId, "payments", editingId, value)
      : createCustomsJobChild(jobId, "payments", value)
  });
  const deleteMutation = useMutation({
    mutationFn: (paymentId: string) => deleteCustomsJobChild(jobId, "payments", paymentId)
  });
  const postMutation = useMutation({
    mutationFn: (paymentId: string) => postCustomsPayment(jobId, paymentId)
  });

  useEffect(() => {
    if (!companyPaid) {
      setValue((current) => ({
        ...current,
        paymentAccountType: null,
        bankAccountId: null,
        cashAccountId: null,
        customsLedgerAccountId: null,
        currencyId: null,
        exchangeRate: 1
      }));
    }
  }, [companyPaid]);

  function reset() {
    setValue(emptyPayment());
    setEditingId(null);
  }

  function edit(row: CustomsPaymentDto) {
    setValue({
      paymentReference: row.paymentReference,
      paymentDate: editorDate(row.paymentDate),
      amount: row.amount,
      paymentMode: row.paymentMode,
      paidBy: row.paidBy,
      remarks: row.remarks,
      paymentResponsibility: row.paymentResponsibility,
      paymentAccountType: row.paymentAccountType === "Bank" || row.paymentAccountType === "Cash" ? row.paymentAccountType : null,
      bankAccountId: row.bankAccountId ?? null,
      cashAccountId: row.cashAccountId ?? null,
      customsLedgerAccountId: row.customsLedgerAccountId ?? null,
      currencyId: row.currencyId ?? null,
      exchangeRate: row.exchangeRate || 1
    });
    setEditingId(row.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    await saveMutation.mutateAsync();
    toast.success(editingId ? lt("Customs payment updated") : lt("Customs payment added"), lt("The payment record was saved."));
    reset();
    onRefresh();
  }

  async function remove(row: CustomsPaymentDto) {
    await deleteMutation.mutateAsync(row.id);
    toast.success(lt("Customs payment deleted"), row.postingStatus === "Posted" ? lt("The accounting entry was reversed.") : lt("The payment record was removed."));
    if (editingId === row.id) reset();
    onRefresh();
  }

  async function post(row: CustomsPaymentDto) {
    await postMutation.mutateAsync(row.id);
    toast.success(lt("Customs payment posted"), lt("The ledger and bank/cash book entries were created."));
    onRefresh();
  }

  return <div className="space-y-4">
    {!locked ? <Card><CardContent className="pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{editingId ? lt("Update Customs Payment") : lt("Add Customs Payment")}</h3>
          <p className="text-xs text-muted-foreground">{lt("Company-paid amounts can be posted after the payment is saved.")}</p>
        </div>
        {editingId ? <Button type="button" variant="outline" size="sm" onClick={reset}><RotateCcw className="h-4 w-4" />{lt("Cancel edit")}</Button> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Editor label={lt("Payment Reference")} required><Input value={value.paymentReference} onChange={(e) => setValue({ ...value, paymentReference: e.target.value })} /></Editor>
        <Editor label={lt("Payment Date")} required><Input type="datetime-local" value={value.paymentDate} onChange={(e) => setValue({ ...value, paymentDate: e.target.value })} /></Editor>
        <Editor label={lt("Amount")} required><Input type="number" min={0.01} step={0.01} value={value.amount} onChange={(e) => setValue({ ...value, amount: numberValue(e.target.value) })} /></Editor>
        <Editor label={lt("Paid By")} required>
          <Select value={value.paymentResponsibility} onChange={(next) => setValue({ ...value, paymentResponsibility: next as "Customer" | "Company" })} options={[{ value: "Customer", label: lt("Customer") }, { value: "Company", label: lt("Our Company") }]} />
        </Editor>
        <Editor label={lt("Payment Mode")} required>
          <Select value={value.paymentMode} onChange={(next) => setValue({ ...value, paymentMode: next })} options={["Cash", "Bank", "Cheque", "Online", "Other"].map(asOption)} />
        </Editor>
        <Editor label={lt("Paid By Name")}><Input value={value.paidBy ?? ""} onChange={(e) => setValue({ ...value, paidBy: e.target.value })} /></Editor>

        {companyPaid ? <>
          <Editor label={lt("Our Account Type")} required>
            <Select value={value.paymentAccountType ?? ""} onChange={(next) => setValue({ ...value, paymentAccountType: next as "Bank" | "Cash", bankAccountId: null, cashAccountId: null })} options={[asOption("Bank"), asOption("Cash")]} />
          </Editor>
          <Editor label={value.paymentAccountType === "Cash" ? lt("Our Cash Account") : lt("Our Bank Account")} required>
            <Select
              value={(value.paymentAccountType === "Cash" ? value.cashAccountId : value.bankAccountId) ?? ""}
              onChange={(next) => {
                const selected = accountOptions.find((x) => x.id === next);
                setValue({
                  ...value,
                  bankAccountId: value.paymentAccountType === "Bank" ? next : null,
                  cashAccountId: value.paymentAccountType === "Cash" ? next : null,
                  currencyId: selected?.currencyId ?? value.currencyId
                });
              }}
              options={accountOptions.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}` }))}
              placeholder={value.paymentAccountType ? lt("Select company account") : lt("Select account type first")}
              disabled={!value.paymentAccountType}
            />
          </Editor>
          <Editor label={lt("Customs Account")} required>
            <Select value={value.customsLedgerAccountId ?? ""} onChange={(next) => setValue({ ...value, customsLedgerAccountId: next })} options={(accounts.data?.customsAccounts ?? []).map((x) => ({ value: x.id, label: `${x.code} - ${x.name}` }))} />
          </Editor>
          <Editor label={lt("Currency")} required>
            <Select value={value.currencyId ?? ""} onChange={(next) => setValue({ ...value, currencyId: next })} options={currencyOptions} />
          </Editor>
          <Editor label={lt("Exchange Rate")} required><Input type="number" min={0.000001} step={0.000001} value={value.exchangeRate} onChange={(e) => setValue({ ...value, exchangeRate: numberValue(e.target.value) })} /></Editor>
        </> : null}

        <div className="md:col-span-4"><Editor label={lt("Remarks")}><Textarea rows={2} value={value.remarks ?? ""} onChange={(e) => setValue({ ...value, remarks: e.target.value })} /></Editor></div>
        <div className="flex items-end md:col-span-4">
          <PermissionButton permission="CustomsClearance.Update" disabled={!isValid || saveMutation.isPending} onClick={() => void save()}>
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {saveMutation.isPending ? lt("Saving...") : editingId ? lt("Update Payment") : lt("Add Payment")}
          </PermissionButton>
        </div>
      </div>
    </CardContent></Card> : null}

    <Card><CardContent className="overflow-auto pt-6">
      <table className="min-w-[1100px] text-sm">
        <thead><tr>{["Reference", "Date", "Amount", "Paid By", "Mode", "Our Account", "Customs Account", "Posting"].map((label) => <th key={label} className="whitespace-nowrap border-b bg-slate-50 px-3 py-2 text-left font-semibold">{lt(label)}</th>)}<th className="border-b bg-slate-50 px-3 py-2 text-center font-semibold">{lt("Action")}</th></tr></thead>
        <tbody>{rows.length ? rows.map((row) => {
          const ownAccount = row.paymentAccountType === "Bank"
            ? accounts.data?.bankAccounts.find((x) => x.id === row.bankAccountId)
            : accounts.data?.cashAccounts.find((x) => x.id === row.cashAccountId);
          const customsAccount = accounts.data?.customsAccounts.find((x) => x.id === row.customsLedgerAccountId);
          return <tr key={row.id}>
            <td className="border-b px-3 py-2">{row.paymentReference}</td>
            <td className="whitespace-nowrap border-b px-3 py-2">{new Date(row.paymentDate).toLocaleString()}</td>
            <td className="border-b px-3 py-2 text-right font-medium">{row.amount.toFixed(2)}</td>
            <td className="border-b px-3 py-2">{lt(row.paymentResponsibility)}</td>
            <td className="border-b px-3 py-2">{lt(row.paymentMode)}</td>
            <td className="border-b px-3 py-2">{ownAccount ? `${ownAccount.code} - ${ownAccount.name}` : "-"}</td>
            <td className="border-b px-3 py-2">{customsAccount ? `${customsAccount.code} - ${customsAccount.name}` : "-"}</td>
            <td className="border-b px-3 py-2"><StatusBadge status={row.postingStatus} /></td>
            <td className="border-b px-3 py-2"><div className="flex justify-center gap-1">
              {!locked && row.postingStatus !== "Posted" ? <PermissionButton permission="CustomsClearance.Update" variant="ghost" size="sm" onClick={() => edit(row)}><Pencil className="h-4 w-4" />{lt("Edit")}</PermissionButton> : null}
              {row.paymentResponsibility === "Company" && row.postingStatus !== "Posted" ? <PermissionButton permission="CustomsClearance.Approve" variant="ghost" size="sm" disabled={postMutation.isPending} onClick={() => void post(row)}><Landmark className="h-4 w-4" />{lt("Post")}</PermissionButton> : null}
              {!locked ? <ConfirmDialog title={lt("Delete customs payment?")} description={row.postingStatus === "Posted" ? lt("The original accounting entry will be reversed before the payment is removed.") : lt("The payment record will be removed.")} confirmText={lt("Delete")} variant="danger" onConfirm={() => remove(row)}>
                <PermissionButton permission="CustomsClearance.Delete" variant="ghost" size="sm" disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" />{lt("Delete")}</PermissionButton>
              </ConfirmDialog> : null}
            </div></td>
          </tr>;
        }) : <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">{lt("No customs payment records yet.")}</td></tr>}</tbody>
      </table>
    </CardContent></Card>
  </div>;
}

function Editor({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs uppercase text-slate-600">{label}{required ? " *" : ""}</Label>{children}</div>;
}

function Select({ value, options, onChange, placeholder, disabled }: { value: string; options: Option[]; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return <select className="h-10 w-full rounded-md border bg-white px-3 text-sm disabled:bg-slate-100" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
    <option value="">{placeholder ?? lt("Select")}</option>
    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>;
}

function asOption(value: string) { return { value, label: lt(value) }; }
function numberValue(value: string) { return value === "" ? 0 : Number(value); }
function localDateTime() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
function editorDate(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
