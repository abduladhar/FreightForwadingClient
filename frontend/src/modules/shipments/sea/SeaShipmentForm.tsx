import { useState, type ReactNode } from "react";
import type { SeaShipmentDetailRequest } from "@/api/freightApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SeaShipmentForm({
  initialValue,
  onSubmit,
  isSubmitting,
  savePermission
}: {
  initialValue?: SeaShipmentDetailRequest | null;
  onSubmit: (value: SeaShipmentDetailRequest) => Promise<void>;
  isSubmitting?: boolean;
  savePermission: string;
}) {
  const [value, setValue] = useState<SeaShipmentDetailRequest>(initialValue ?? {
    shipmentId: "",
    shipmentType: "Direct",
    shippingLineId: null,
    vessel: "",
    voyageNumber: "",
    mbl: null,
    hbl: null,
    portOfLoading: "",
    portOfDischarge: "",
    placeOfReceipt: null,
    placeOfDelivery: null,
    loadType: "FCL",
    freeDays: 0,
    demurrage: 0,
    detention: 0
  });
  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Shipment Id"><Input value={value.shipmentId} onChange={(e) => setValue({ ...value, shipmentId: e.target.value })} /></Field>
      <Field label="Shipment Type"><Input value={value.shipmentType} onChange={(e) => setValue({ ...value, shipmentType: e.target.value })} /></Field>
      <Field label="Shipping Line"><Input value={value.shippingLineId ?? ""} onChange={(e) => setValue({ ...value, shippingLineId: e.target.value || null })} /></Field>
      <Field label="Vessel"><Input value={value.vessel} onChange={(e) => setValue({ ...value, vessel: e.target.value })} /></Field>
      <Field label="Voyage Number"><Input value={value.voyageNumber} onChange={(e) => setValue({ ...value, voyageNumber: e.target.value })} /></Field>
      <Field label="MBL"><Input value={value.mbl ?? ""} onChange={(e) => setValue({ ...value, mbl: e.target.value || null })} /></Field>
      <Field label="HBL"><Input value={value.hbl ?? ""} onChange={(e) => setValue({ ...value, hbl: e.target.value || null })} /></Field>
      <Field label="POL"><Input value={value.portOfLoading} onChange={(e) => setValue({ ...value, portOfLoading: e.target.value })} /></Field>
      <Field label="POD"><Input value={value.portOfDischarge} onChange={(e) => setValue({ ...value, portOfDischarge: e.target.value })} /></Field>
      <Field label="Place of Receipt"><Input value={value.placeOfReceipt ?? ""} onChange={(e) => setValue({ ...value, placeOfReceipt: e.target.value || null })} /></Field>
      <Field label="Place of Delivery"><Input value={value.placeOfDelivery ?? ""} onChange={(e) => setValue({ ...value, placeOfDelivery: e.target.value || null })} /></Field>
      <Field label="FCL/LCL"><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.loadType} onChange={(e) => setValue({ ...value, loadType: e.target.value })}><option>FCL</option><option>LCL</option></select></Field>
      <Field label="Free Days"><Input type="number" min="0" value={value.freeDays} onChange={(e) => setValue({ ...value, freeDays: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label="Demurrage"><Input type="number" min="0" value={value.demurrage} onChange={(e) => setValue({ ...value, demurrage: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label="Detention"><Input type="number" min="0" value={value.detention} onChange={(e) => setValue({ ...value, detention: Math.max(0, Number(e.target.value)) })} /></Field>
    </div>
    <PermissionButton permission={savePermission} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Sea Details"}</PermissionButton>
  </div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
