import { useState, type ReactNode } from "react";
import type { ContainerRequest } from "@/api/freightApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContainerForm({
  initialValue,
  onSubmit,
  isSubmitting
}: {
  initialValue?: ContainerRequest | null;
  onSubmit: (value: ContainerRequest) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [value, setValue] = useState<ContainerRequest>(initialValue ?? {
    seaShipmentDetailId: "",
    containerNumber: "",
    sealNumber: null,
    containerType: "",
    freeDays: 0,
    demurrage: 0,
    detention: 0
  });
  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Sea Shipment Detail Id"><Input value={value.seaShipmentDetailId} onChange={(e) => setValue({ ...value, seaShipmentDetailId: e.target.value })} /></Field>
      <Field label="Container Number"><Input value={value.containerNumber} onChange={(e) => setValue({ ...value, containerNumber: e.target.value })} /></Field>
      <Field label="Seal Number"><Input value={value.sealNumber ?? ""} onChange={(e) => setValue({ ...value, sealNumber: e.target.value || null })} /></Field>
      <Field label="Container Type / Size"><Input value={value.containerType} onChange={(e) => setValue({ ...value, containerType: e.target.value })} /></Field>
      <Field label="Free Days"><Input type="number" min="0" value={value.freeDays} onChange={(e) => setValue({ ...value, freeDays: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label="Demurrage"><Input type="number" min="0" value={value.demurrage} onChange={(e) => setValue({ ...value, demurrage: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label="Detention"><Input type="number" min="0" value={value.detention} onChange={(e) => setValue({ ...value, detention: Math.max(0, Number(e.target.value)) })} /></Field>
    </div>
    <Button onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Container"}</Button>
  </div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
