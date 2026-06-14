import { useI18n } from "@/app/i18n";
import type { AddressDto } from "@/api/customerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerButtonClass } from "@/modules/customers/customerUi";

export function CustomerAddressesTab({ value, onChange }: { value: AddressDto[]; onChange: (next: AddressDto[]) => void }) {
  const { t } = useI18n();
  function update(index: number, patch: Partial<AddressDto>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }
  return (
    <div className="space-y-3">
      {value.map((address, index) => (
        <div key={index} className="grid gap-2 rounded-md border p-3 md:grid-cols-5">
          <Input placeholder={t("Customer.Type", "Type")} value={address.addressType} onChange={(e) => update(index, { addressType: e.target.value })} />
          <Input placeholder={t("Customer.Address", "Address")} value={address.addressLine} onChange={(e) => update(index, { addressLine: e.target.value })} />
          <Input placeholder={t("Customer.Country", "Country")} value={address.country ?? ""} onChange={(e) => update(index, { country: e.target.value })} />
          <Input placeholder={t("Customer.City", "City")} value={address.city ?? ""} onChange={(e) => update(index, { city: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={address.isDefault} onChange={(e) => update(index, { isDefault: e.target.checked })} /> {t("Customer.Default", "Default")}</label>
        </div>
      ))}
      <Button className={customerButtonClass} type="button" variant="outline" onClick={() => onChange([...value, { addressType: "", addressLine: "", country: "", city: "", isDefault: false }])}>{t("Customer.AddAddress", "Add Address")}</Button>
    </div>
  );
}
