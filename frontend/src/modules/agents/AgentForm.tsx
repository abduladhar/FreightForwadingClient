import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCurrencies } from "@/api/currencyApi";
import type { AgentRequest } from "@/api/agentApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function AgentForm({ initialValue, onSubmit, isSubmitting }: { initialValue?: AgentRequest | null; onSubmit: (value: AgentRequest) => Promise<void>; isSubmitting?: boolean }) {
  const m = useMasterDataI18n("Agent");
  const currencies = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const [value, setValue] = useState<AgentRequest>(initialValue ?? { agentCode: "", agentName: "", agentType: "", contactPerson: "", email: "", phone: "", address: "", country: "", city: "", taxNumber: "", defaultCurrencyId: null, isActive: true, commissionSetting: null });
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label={m("Agent Code")}><Input value={value.agentCode} onChange={(e) => setValue({ ...value, agentCode: e.target.value })} /></Field>
    <Field label={m("Agent Name")}><Input value={value.agentName} onChange={(e) => setValue({ ...value, agentName: e.target.value })} /></Field>
    <Field label={m("Agent Type")}><Input value={value.agentType} onChange={(e) => setValue({ ...value, agentType: e.target.value })} /></Field>
    <Field label={m("Email")}><Input value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} /></Field>
    <Field label={m("Country")}><Input value={value.country} onChange={(e) => setValue({ ...value, country: e.target.value })} /></Field>
    <Field label={m("City")}><Input value={value.city} onChange={(e) => setValue({ ...value, city: e.target.value })} /></Field>
    <Field label={m("Default Currency")}>
      <select className="h-10 w-full rounded-md border px-3 text-sm disabled:bg-slate-50 disabled:text-slate-600" value={value.defaultCurrencyId ?? ""} onChange={(e) => setValue({ ...value, defaultCurrencyId: e.target.value || null })} disabled={Boolean(initialValue)}>
        <option value="">{m("Select")}</option>
        {(currencies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.currencyCode}</option>)}
      </select>
      {initialValue ? <p className="mt-1 text-xs text-muted-foreground">Agent currency is locked after creation.</p> : null}
    </Field>
    <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({ ...value, isActive: e.target.checked })} /> {m("Active")}</label>
    <div className="md:col-span-2">
      {initialValue ? (
        <Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? m("Saving") : m("Save Agent")}</Button>
      ) : (
        <ConfirmDialog
          title={m("Confirm agent currency")}
          description={m("Agent currency cannot be changed once the agent is created. Do you want to continue?")}
          confirmText={isSubmitting ? m("Saving") : m("Continue")}
          cancelText={m("Review")}
          onConfirm={() => void onSubmit(value)}
        >
          <Button className={masterDataButtonClass} disabled={isSubmitting}>{m("Save Agent")}</Button>
        </ConfirmDialog>
      )}
    </div>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
