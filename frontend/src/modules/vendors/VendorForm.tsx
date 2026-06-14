import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCurrencies } from "@/api/currencyApi";
import type { VendorRequest } from "@/api/vendorApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

const vendorTypes = [
  "Transporter",
  "Airline",
  "Shipping Line",
  "Courier Company",
  "Warehouse Vendor",
  "Destination Agent",
  "Customs Agent",
  "Local Delivery Agent",
  "Overseas Agent"
] as const;

export function VendorForm({ initialValue, onSubmit, isSubmitting }: { initialValue?: VendorRequest | null; onSubmit: (value: VendorRequest) => Promise<void>; isSubmitting?: boolean }) {
  const m = useMasterDataI18n("Vendor");
  const currencies = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const [value, setValue] = useState<VendorRequest>(initialValue ?? { vendorCode: "", vendorName: "", vendorType: "Transporter", contactPerson: "", email: "", phone: "", billingAddress: "", country: "", city: "", taxNumber: "", defaultCurrencyId: null, paymentTerms: "", isActive: true, contacts: [], addresses: [], documents: [] });
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label={m("Vendor Code")}><Input value={value.vendorCode} onChange={(e) => setValue({ ...value, vendorCode: e.target.value })} /></Field>
    <Field label={m("Vendor Name")}><Input value={value.vendorName} onChange={(e) => setValue({ ...value, vendorName: e.target.value })} /></Field>
    <Field label={m("Vendor Type")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.vendorType} onChange={(e) => setValue({ ...value, vendorType: e.target.value })}><option value="">{m("Select Vendor Type")}</option>{vendorTypes.map((type) => <option key={type} value={type}>{m(type)}</option>)}</select></Field>
    <Field label={m("Email")}><Input value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} /></Field>
    <Field label={m("Contact Person")}><Input value={value.contactPerson ?? ""} onChange={(e) => setValue({ ...value, contactPerson: e.target.value })} /></Field>
    <Field label={m("Phone")}><Input value={value.phone ?? ""} onChange={(e) => setValue({ ...value, phone: e.target.value })} /></Field>
    <Field label={m("Country")}><Input value={value.country} onChange={(e) => setValue({ ...value, country: e.target.value })} /></Field>
    <Field label={m("City")}><Input value={value.city} onChange={(e) => setValue({ ...value, city: e.target.value })} /></Field>
    <Field label={m("Default Currency")}>
      <select className="h-10 w-full rounded-md border px-3 text-sm disabled:bg-slate-50 disabled:text-slate-600" value={value.defaultCurrencyId ?? ""} onChange={(e) => setValue({ ...value, defaultCurrencyId: e.target.value || null })} disabled={Boolean(initialValue)}>
        <option value="">{m("Select")}</option>
        {(currencies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.currencyCode}</option>)}
      </select>
      {initialValue ? <p className="mt-1 text-xs text-muted-foreground">Vendor currency is locked after creation.</p> : null}
    </Field>
    <Field label={m("Payment Terms")}><Input value={value.paymentTerms ?? ""} onChange={(e) => setValue({ ...value, paymentTerms: e.target.value })} /></Field>
    <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({ ...value, isActive: e.target.checked })} /> {m("Active")}</label>
    <div className="md:col-span-2">
      {initialValue ? (
        <Button className={masterDataButtonClass} onClick={() => void onSubmit({ ...value, vendorType: value.vendorType.trim() })} disabled={isSubmitting || !value.vendorType.trim()}>{isSubmitting ? m("Saving") : m("Save Vendor")}</Button>
      ) : (
        <ConfirmDialog
          title={m("Confirm vendor currency")}
          description={m("Vendor currency cannot be changed once the vendor is created. Do you want to continue?")}
          confirmText={isSubmitting ? m("Saving") : m("Continue")}
          cancelText={m("Review")}
          onConfirm={() => void onSubmit({ ...value, vendorType: value.vendorType.trim() })}
        >
          <Button className={masterDataButtonClass} disabled={isSubmitting || !value.vendorType.trim()}>{m("Save Vendor")}</Button>
        </ConfirmDialog>
      )}
    </div>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
