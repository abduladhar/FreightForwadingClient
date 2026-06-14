import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { searchLedgerAccounts } from "@/api/chargeHeadApi";
import type { TaxRuleRequest } from "@/api/taxApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function TaxRuleForm({
  initialValue,
  onSubmit,
  isSubmitting
}: {
  initialValue?: TaxRuleRequest | null;
  onSubmit: (value: TaxRuleRequest) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const m = useMasterDataI18n("TaxRule");
  const [value, setValue] = useState<TaxRuleRequest>(initialValue ?? { ledgerAccountId: "", taxCode: "", taxName: "", taxRate: 0, isRecoverable: true, isActive: true });
  const [taxMode, setTaxMode] = useState<"Inclusive" | "Exclusive">("Exclusive");
  const [taxType, setTaxType] = useState("GST");
  const ledgers = useQuery({ queryKey: ["tax-ledger-lookup"], queryFn: () => searchLedgerAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label={m("Tax Code")}><Input value={value.taxCode} onChange={(e) => setValue({ ...value, taxCode: e.target.value })} /></Field>
    <Field label={m("Tax Name")}><Input value={value.taxName} onChange={(e) => setValue({ ...value, taxName: e.target.value })} /></Field>
    <Field label={m("Tax Rate")}><Input type="number" value={value.taxRate} onChange={(e) => setValue({ ...value, taxRate: Number(e.target.value) })} /></Field>
    <Field label={m("Tax Type (GST/VAT)")}><Input value={taxType} onChange={(e) => setTaxType(e.target.value)} /></Field>
    <Field label={m("Tax Mode")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={taxMode} onChange={(e) => setTaxMode(e.target.value as "Inclusive" | "Exclusive")}><option value="Exclusive">{m("Exclusive")}</option><option value="Inclusive">{m("Inclusive")}</option></select></Field>
    <Field label={m("Tax Ledger")}>
      <select className="h-10 w-full rounded-md border px-3 text-sm" value={value.ledgerAccountId} onChange={(e) => setValue({ ...value, ledgerAccountId: e.target.value })}>
        <option value="">{m("Select Ledger")}</option>
        {(ledgers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.ledgerCode} - {x.ledgerName}</option>)}
      </select>
    </Field>
    <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isRecoverable} onChange={(e) => setValue({ ...value, isRecoverable: e.target.checked })} /> Recoverable</label>
    <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({ ...value, isActive: e.target.checked })} /> {m("Active")}</label>
    <div className="md:col-span-2"><Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? m("Saving") : m("Save Tax Rule")}</Button></div>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
