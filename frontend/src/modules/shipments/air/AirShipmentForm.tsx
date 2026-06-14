import { useState, type ReactNode } from "react";
import type { AirShipmentDetailRequest } from "@/api/freightApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AirShipmentForm({
  initialValue,
  onSubmit,
  isSubmitting,
  savePermission
}: {
  initialValue?: AirShipmentDetailRequest | null;
  onSubmit: (value: AirShipmentDetailRequest) => Promise<void>;
  isSubmitting?: boolean;
  savePermission: string;
}) {
  const [value, setValue] = useState<AirShipmentDetailRequest>(initialValue ?? {
    shipmentId: "",
    shipmentType: "Direct",
    airlineId: null,
    flightNumber: "",
    mawb: null,
    hawb: null,
    airportOfDeparture: "",
    airportOfArrival: "",
    etd: null,
    eta: null,
    actualDeparture: null,
    actualArrival: null,
    actualWeight: 0,
    volumetricWeight: 0,
    chargeableWeight: 0,
    iataDetails: null,
    manifestNumber: null
  });
  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Shipment Id"><Input value={value.shipmentId} onChange={(e) => setValue({ ...value, shipmentId: e.target.value })} /></Field>
      <Field label="Shipment Type"><Input value={value.shipmentType} onChange={(e) => setValue({ ...value, shipmentType: e.target.value })} /></Field>
      <Field label="Airline"><Input value={value.airlineId ?? ""} onChange={(e) => setValue({ ...value, airlineId: e.target.value || null })} /></Field>
      <Field label="Flight Number"><Input value={value.flightNumber} onChange={(e) => setValue({ ...value, flightNumber: e.target.value })} /></Field>
      <Field label="MAWB"><Input value={value.mawb ?? ""} onChange={(e) => setValue({ ...value, mawb: e.target.value || null })} /></Field>
      <Field label="HAWB"><Input value={value.hawb ?? ""} onChange={(e) => setValue({ ...value, hawb: e.target.value || null })} /></Field>
      <Field label="Airport of Departure"><Input value={value.airportOfDeparture} onChange={(e) => setValue({ ...value, airportOfDeparture: e.target.value })} /></Field>
      <Field label="Airport of Arrival"><Input value={value.airportOfArrival} onChange={(e) => setValue({ ...value, airportOfArrival: e.target.value })} /></Field>
      <Field label="ETD"><Input type="datetime-local" value={toInput(value.etd)} onChange={(e) => setValue({ ...value, etd: e.target.value || null })} /></Field>
      <Field label="ETA"><Input type="datetime-local" value={toInput(value.eta)} onChange={(e) => setValue({ ...value, eta: e.target.value || null })} /></Field>
      <Field label="Actual Weight"><Input type="number" min="0" value={value.actualWeight} onChange={(e) => setValue({ ...value, actualWeight: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label="Volumetric Weight"><Input type="number" min="0" value={value.volumetricWeight} onChange={(e) => setValue({ ...value, volumetricWeight: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label="Chargeable Weight"><Input type="number" min="0" value={value.chargeableWeight} onChange={(e) => setValue({ ...value, chargeableWeight: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label="IATA Details"><Input value={value.iataDetails ?? ""} onChange={(e) => setValue({ ...value, iataDetails: e.target.value || null })} /></Field>
      <Field label="Manifest Number"><Input value={value.manifestNumber ?? ""} onChange={(e) => setValue({ ...value, manifestNumber: e.target.value || null })} /></Field>
    </div>
    <PermissionButton permission={savePermission} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Air Details"}</PermissionButton>
  </div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
function toInput(v: string | null | undefined) { return v ? v.slice(0, 16) : ""; }
