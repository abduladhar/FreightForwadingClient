import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getTrackingRecord, type TrackingRecord } from "@/api/trackingApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShipmentTrackingPage() {
  const [type, setType] = useState<TrackingRecord["shipmentType"]>("House");
  const [id, setId] = useState("");
  const [record, setRecord] = useState<TrackingRecord | null>(null);
  const mutation = useMutation({ mutationFn: () => getTrackingRecord(type, id) });
  return <div className="space-y-4"><PageHeader title="Shipment Tracking" description="Track shipment by type and record id." /><div className="rounded-lg border bg-white p-4 flex flex-wrap gap-2"><select className="h-10 rounded-md border px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as TrackingRecord["shipmentType"])}><option>House</option><option>Direct</option><option>Master</option></select><Input value={id} onChange={(e) => setId(e.target.value)} placeholder="Shipment Id" className="max-w-sm" /><Button onClick={() => void mutation.mutateAsync().then(setRecord)} disabled={!id}>Track</Button></div>{record ? <div className="rounded-lg border bg-white p-4 text-sm">Number: {record.shipmentNumber} | Route: {record.origin} → {record.destination} | Status: {record.status}</div> : null}</div>;
}
