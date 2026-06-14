import { useState, type ReactNode } from "react";
import type { PackageTypeRequest } from "@/api/packageTypeApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PackageTypeForm({
  initialValue,
  isSubmitting,
  onSubmit
}: {
  initialValue?: PackageTypeRequest | null;
  isSubmitting?: boolean;
  onSubmit: (value: PackageTypeRequest) => Promise<void>;
}) {
  const m = useMasterDataI18n("PackageType");
  const [value, setValue] = useState<PackageTypeRequest>(
    initialValue ?? {
      packageCode: "",
      packageName: "",
      description: "",
      isActive: true
    }
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={m("Package Code")}>
        <Input value={value.packageCode} onChange={(event) => setValue({ ...value, packageCode: event.target.value })} placeholder={m("BOX")} />
      </Field>
      <Field label={m("Package Name")}>
        <Input value={value.packageName} onChange={(event) => setValue({ ...value, packageName: event.target.value })} placeholder={m("Box")} />
      </Field>
      <Field label={m("Description")}>
        <Input value={value.description ?? ""} onChange={(event) => setValue({ ...value, description: event.target.value })} placeholder={m("Optional description")} />
      </Field>
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} />
        {m("Active")}
      </label>
      <div className="md:col-span-2">
        <Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>
          {isSubmitting ? m("Saving") : m("Save Package Type")}
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
