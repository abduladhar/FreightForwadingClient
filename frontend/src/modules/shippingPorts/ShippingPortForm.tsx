import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ShippingPortRequest } from "@/api/shippingPortApi";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function ShippingPortForm({
  initialValue,
  isSubmitting,
  onSubmit
}: {
  initialValue?: ShippingPortRequest | null;
  isSubmitting?: boolean;
  onSubmit: (value: ShippingPortRequest) => Promise<void>;
}) {
  const m = useMasterDataI18n("ShippingPort");
  const [value, setValue] = useState<ShippingPortRequest>(
    initialValue ?? {
      portCode: "",
      portName: "",
      countryGuid: "",
      countryName: "",
      portType: "Sea",
      isActive: true
    }
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={m("Port Code")}>
        <Input value={value.portCode} onChange={(event) => setValue({ ...value, portCode: event.target.value })} placeholder={m("INNSA")} />
      </Field>
      <Field label={m("Port Name")}>
        <Input value={value.portName} onChange={(event) => setValue({ ...value, portName: event.target.value })} placeholder={m("Nhava Sheva (JNPT)")} />
      </Field>
      <Field label={m("Country")}>
        <Input value={value.countryName} onChange={(event) => setValue({ ...value, countryName: event.target.value })} placeholder={m("India")} />
      </Field>
      <Field label={m("Country Guid")}>
        <Input value={value.countryGuid} onChange={(event) => setValue({ ...value, countryGuid: event.target.value })} placeholder={m("Country identifier (GUID)")} />
      </Field>
      <Field label={m("Port Type")}>
        <select
          className="h-10 w-full rounded-md border px-3 text-sm"
          value={value.portType}
          onChange={(event) => setValue({ ...value, portType: event.target.value })}
        >
          <option value="Sea">{m("Sea")}</option>
          <option value="Air">{m("Air")}</option>
          <option value="Road">{m("Road")}</option>
          <option value="Inland">{m("Inland")}</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input type="checkbox" checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} />
        {m("Active")}
      </label>
      <div className="md:col-span-2">
        <Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>
          {isSubmitting ? m("Saving") : m("Save Shipping Port")}
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
