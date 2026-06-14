import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateTrackingStatus, type TrackingRecord } from "@/api/trackingApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";

export function TrackingStatusUpdatePage() {
  const [type, setType] = useState<TrackingRecord["shipmentType"]>("House");
  const [id, setId] = useState("");
  const [status, setStatus] = useState("In Transit");
  const mutation = useMutation({ mutationFn: () => updateTrackingStatus(type, id, status) });
  const permission = type === "House" ? "HouseShipment.Update" : type === "Direct" ? "DirectShipment.Update" : "MasterShipment.Update";
  return <div className="space-y-4"><PageHeader title="Tracking Status Update" description="Update shipment status for internal tracking timelines." /><div className="rounded-lg border bg-white p-4 flex flex-wrap gap-2"><select className="h-10 rounded-md border px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as TrackingRecord["shipmentType"])}><option>House</option><option>Direct</option><option>Master</option></select><Input value={id} onChange={(e) => setId(e.target.value)} placeholder="Shipment Id" className="max-w-sm" /><Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status" className="max-w-sm" /><PermissionButton permission={permission} disabled={!id} onClick={() => void mutation.mutateAsync()}>Update Status</PermissionButton></div></div>;
}
