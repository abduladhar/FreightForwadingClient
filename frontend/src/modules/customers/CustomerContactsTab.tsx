import { useI18n } from "@/app/i18n";
import type { ContactDto } from "@/api/customerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerButtonClass } from "@/modules/customers/customerUi";

export function CustomerContactsTab({ value, onChange }: { value: ContactDto[]; onChange: (next: ContactDto[]) => void }) {
  const { t } = useI18n();
  function update(index: number, patch: Partial<ContactDto>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }
  return (
    <div className="space-y-3">
      {value.map((contact, index) => (
        <div key={index} className="grid gap-2 rounded-md border p-3 md:grid-cols-5">
          <Input placeholder={t("Customer.ContactName", "Contact Name")} value={contact.contactName} onChange={(e) => update(index, { contactName: e.target.value })} />
          <Input placeholder={t("Customer.Designation", "Designation")} value={contact.designation ?? ""} onChange={(e) => update(index, { designation: e.target.value })} />
          <Input placeholder={t("Customer.Email", "Email")} value={contact.email ?? ""} onChange={(e) => update(index, { email: e.target.value })} />
          <Input placeholder={t("Customer.Phone", "Phone")} value={contact.phone ?? ""} onChange={(e) => update(index, { phone: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={contact.isPrimary} onChange={(e) => update(index, { isPrimary: e.target.checked })} /> {t("Customer.Primary", "Primary")}</label>
        </div>
      ))}
      <Button className={customerButtonClass} type="button" variant="outline" onClick={() => onChange([...value, { contactName: "", designation: "", email: "", phone: "", isPrimary: false }])}>{t("Customer.AddContact", "Add Contact")}</Button>
    </div>
  );
}
