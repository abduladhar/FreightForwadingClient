import { useState, type ReactNode } from "react";
import type { RoadShipmentDetailRequest } from "@/api/freightApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { FileUploader } from "@/components/common/FileUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RoadShipmentForm({
  initialValue,
  onSubmit,
  isSubmitting,
  savePermission
}: {
  initialValue?: RoadShipmentDetailRequest | null;
  onSubmit: (value: RoadShipmentDetailRequest) => Promise<void>;
  isSubmitting?: boolean;
  savePermission: string;
}) {
  const [value, setValue] = useState<RoadShipmentDetailRequest>(initialValue ?? {
    shipmentId: "",
    shipmentType: "Direct",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    transporterId: null,
    route: "",
    origin: "",
    destination: "",
    borderCrossingDetails: null,
    tripSheetNumber: null,
    loadingPoint: null,
    deliveryPoint: null,
    proofOfDeliveryDocumentId: null
  });
  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Shipment Id"><Input value={value.shipmentId} onChange={(e) => setValue({ ...value, shipmentId: e.target.value })} /></Field>
      <Field label="Shipment Type"><Input value={value.shipmentType} onChange={(e) => setValue({ ...value, shipmentType: e.target.value })} /></Field>
      <Field label="Vehicle Number"><Input value={value.vehicleNumber} onChange={(e) => setValue({ ...value, vehicleNumber: e.target.value })} /></Field>
      <Field label="Driver Name"><Input value={value.driverName} onChange={(e) => setValue({ ...value, driverName: e.target.value })} /></Field>
      <Field label="Driver Phone"><Input value={value.driverPhone} onChange={(e) => setValue({ ...value, driverPhone: e.target.value })} /></Field>
      <Field label="Transporter"><Input value={value.transporterId ?? ""} onChange={(e) => setValue({ ...value, transporterId: e.target.value || null })} /></Field>
      <Field label="Route"><Input value={value.route} onChange={(e) => setValue({ ...value, route: e.target.value })} /></Field>
      <Field label="Origin"><Input value={value.origin} onChange={(e) => setValue({ ...value, origin: e.target.value })} /></Field>
      <Field label="Destination"><Input value={value.destination} onChange={(e) => setValue({ ...value, destination: e.target.value })} /></Field>
      <Field label="Border Crossing"><Input value={value.borderCrossingDetails ?? ""} onChange={(e) => setValue({ ...value, borderCrossingDetails: e.target.value || null })} /></Field>
      <Field label="Trip Sheet"><Input value={value.tripSheetNumber ?? ""} onChange={(e) => setValue({ ...value, tripSheetNumber: e.target.value || null })} /></Field>
      <Field label="Loading Point"><Input value={value.loadingPoint ?? ""} onChange={(e) => setValue({ ...value, loadingPoint: e.target.value || null })} /></Field>
      <Field label="Delivery Point"><Input value={value.deliveryPoint ?? ""} onChange={(e) => setValue({ ...value, deliveryPoint: e.target.value || null })} /></Field>
    </div>
    <div className="rounded-lg border p-3"><h3 className="mb-2 text-sm font-medium">POD Upload</h3><FileUploader multiple={false} canDeletePermission="RoadFreight.Update" onChange={(files) => setValue({ ...value, proofOfDeliveryDocumentId: files[0]?.name || null })} /></div>
    <PermissionButton permission={savePermission} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Road Details"}</PermissionButton>
  </div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
