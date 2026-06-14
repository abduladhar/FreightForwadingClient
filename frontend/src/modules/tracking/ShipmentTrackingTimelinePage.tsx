import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getTrackingRecord, type TrackingRecord } from "@/api/trackingApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShipmentStatusTimeline } from "@/components/common/ShipmentStatusTimeline";

export function ShipmentTrackingTimelinePage() {
  const [type, setType] = useState<TrackingRecord["shipmentType"]>("House");
  const [id, setId] = useState("");
  const [record, setRecord] = useState<TrackingRecord | null>(null);
  const mutation = useMutation({ mutationFn: () => getTrackingRecord(type, id) });
  return <div className="space-y-4"><PageHeader title="Tracking Timeline" description="Visual timeline for shipment status journey." /><div className="rounded-lg border bg-white p-4 flex flex-wrap gap-2"><select className="h-10 rounded-md border px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as TrackingRecord["shipmentType"])}><option>House</option><option>Direct</option><option>Master</option></select><Input value={id} onChange={(e) => setId(e.target.value)} placeholder="Shipment Id" className="max-w-sm" /><Button onClick={() => void mutation.mutateAsync().then(setRecord)} disabled={!id}>Load Timeline</Button></div>{record ? <ShipmentStatusTimeline items={[{ id: "1", status: "Booked", location: record.origin, timestamp: record.etd ?? undefined }, { id: "2", status: record.status, location: record.destination, timestamp: record.actualArrival ?? record.eta ?? undefined }]} /> : null}</div>;
}
