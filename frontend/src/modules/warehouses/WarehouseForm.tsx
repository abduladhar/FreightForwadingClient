import { useState, type ReactNode } from "react";
import type { WarehouseRequest } from "@/api/warehouseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function WarehouseForm({
  initialValue,
  onSubmit,
  isSubmitting
}: {
  initialValue?: WarehouseRequest | null;
  onSubmit: (value: WarehouseRequest) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const m = useMasterDataI18n("Warehouse");
  const [value, setValue] = useState<WarehouseRequest>(
    initialValue ?? { warehouseCode: "", warehouseName: "", address: "", contactPerson: "", phone: "", isActive: true }
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={m("Warehouse Code")}><Input value={value.warehouseCode} onChange={(e) => setValue({ ...value, warehouseCode: e.target.value })} /></Field>
      <Field label={m("Warehouse Name")}><Input value={value.warehouseName} onChange={(e) => setValue({ ...value, warehouseName: e.target.value })} /></Field>
      <Field label={m("Contact Person")}><Input value={value.contactPerson ?? ""} onChange={(e) => setValue({ ...value, contactPerson: e.target.value })} /></Field>
      <Field label={m("Phone")}><Input value={value.phone ?? ""} onChange={(e) => setValue({ ...value, phone: e.target.value })} /></Field>
      <Field label={m("Address")}><Input value={value.address ?? ""} onChange={(e) => setValue({ ...value, address: e.target.value })} /></Field>
      <label className="flex items-center gap-2 pt-7 text-sm">
        <input type="checkbox" checked={value.isActive} onChange={(e) => setValue({ ...value, isActive: e.target.checked })} />
        {m("Active")}
      </label>
      <div className="md:col-span-2">
        <Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? m("Saving") : m("Save Warehouse")}</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
