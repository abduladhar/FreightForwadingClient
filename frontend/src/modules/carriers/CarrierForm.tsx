import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCurrencies } from "@/api/currencyApi";
import type { CarrierRequest } from "@/api/carrierApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CountrySelect } from "@/components/common/CountrySelect";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function CarrierForm({ initialValue, onSubmit, isSubmitting }: { initialValue?: CarrierRequest | null; onSubmit: (value: CarrierRequest) => Promise<void>; isSubmitting?: boolean }) {
  const m = useMasterDataI18n("Carrier");
  const currencies = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const [value, setValue] = useState<CarrierRequest>(initialValue ?? { carrierCode: "", carrierName: "", carrierType: "", contactPerson: "", email: "", phone: "", address: "", country: "", city: "", taxNumber: "", defaultCurrencyId: null, isActive: true });
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label={m("Carrier Code")}><Input value={value.carrierCode} onChange={(e) => setValue({ ...value, carrierCode: e.target.value })} /></Field>
    <Field label={m("Carrier Name")}><Input value={value.carrierName} onChange={(e) => setValue({ ...value, carrierName: e.target.value })} /></Field>
    <Field label={m("Carrier Type")}><Input value={value.carrierType} onChange={(e) => setValue({ ...value, carrierType: e.target.value })} /></Field>
    <Field label={m("Email")}><Input value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} /></Field>
    <Field label={m("Country")}><CountrySelect value={value.country} onChange={(country) => setValue({ ...value, country })} /></Field>
    <Field label={m("City")}><Input value={value.city} onChange={(e) => setValue({ ...value, city: e.target.value })} /></Field>
    <Field label={m("Default Currency")}>
      <select className="h-10 w-full rounded-md border px-3 text-sm disabled:bg-slate-50 disabled:text-slate-600" value={value.defaultCurrencyId ?? ""} onChange={(e) => setValue({ ...value, defaultCurrencyId: e.target.value || null })} disabled={Boolean(initialValue)}>
        <option value="">{m("Select")}</option>
        {(currencies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.currencyCode}</option>)}
      </select>
      {initialValue ? <p className="mt-1 text-xs text-muted-foreground">Carrier currency is locked after creation.</p> : null}
    </Field>
    <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({ ...value, isActive: e.target.checked })} /> {m("Active")}</label>
    <div className="md:col-span-2">
      {initialValue ? (
        <Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? m("Saving") : m("Save Carrier")}</Button>
      ) : (
        <ConfirmDialog
          title={m("Confirm carrier currency")}
          description={m("Carrier currency cannot be changed once the carrier is created. Do you want to continue?")}
          confirmText={isSubmitting ? m("Saving") : m("Continue")}
          cancelText={m("Review")}
          onConfirm={() => void onSubmit(value)}
        >
          <Button className={masterDataButtonClass} disabled={isSubmitting}>{m("Save Carrier")}</Button>
        </ConfirmDialog>
      )}
    </div>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
