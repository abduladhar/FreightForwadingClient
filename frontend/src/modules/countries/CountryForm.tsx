import { useEffect, useState, type ReactNode } from "react";
import type { CountryRequest } from "@/api/countryApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function CountryForm({
  initialValue,
  isSubmitting,
  onSubmit
}: {
  initialValue?: CountryRequest | null;
  isSubmitting?: boolean;
  onSubmit: (value: CountryRequest) => Promise<void>;
}) {
  const m = useMasterDataI18n("Country");
  const [value, setValue] = useState<CountryRequest>(
    initialValue ?? {
      name: "",
      countryCode: "",
      isoCode: "",
      mobileCode: "",
      isActive: true
    }
  );

  useEffect(() => {
    if (!initialValue) return;
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={m("Name")}>
        <Input value={value.name} onChange={(event) => setValue({ ...value, name: event.target.value })} placeholder={m("India")} />
      </Field>
      <Field label={m("Country Code")}>
        <Input value={value.countryCode} onChange={(event) => setValue({ ...value, countryCode: event.target.value.toUpperCase() })} placeholder={m("IN")} maxLength={16} />
      </Field>
      <Field label={m("ISO Code")}>
        <Input value={value.isoCode} onChange={(event) => setValue({ ...value, isoCode: event.target.value.toUpperCase() })} placeholder={m("IND")} maxLength={3} />
      </Field>
      <Field label={m("Mobile Code")}>
        <Input value={value.mobileCode} onChange={(event) => setValue({ ...value, mobileCode: event.target.value })} placeholder={m("+91")} maxLength={16} />
      </Field>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input type="checkbox" checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} />
        Active
      </label>
      <div className="md:col-span-2">
        <Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>
          {isSubmitting ? m("Saving") : m("Save Country")}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
