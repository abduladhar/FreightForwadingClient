import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getTrackingRecord, type TrackingRecord } from "@/api/trackingApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PublicTrackingPage() {
  const [type, setType] = useState<TrackingRecord["shipmentType"]>("Direct");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{ status: string; route: string } | null>(null);
  const mutation = useMutation({ mutationFn: async () => {
    const rec = await getTrackingRecord(type, reference);
    return { status: rec.status, route: `${rec.origin} → ${rec.destination}` };
  }});
  return <div className="space-y-4"><PageHeader title="Public Tracking" description="Public-facing shipment tracking by type and reference id." /><div className="rounded-lg border bg-white p-4 flex flex-wrap gap-2"><select className="h-10 rounded-md border px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as TrackingRecord["shipmentType"])}><option>House</option><option>Direct</option><option>Master</option></select><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Shipment Reference" className="max-w-sm" /><Button onClick={() => void mutation.mutateAsync().then(setResult)} disabled={!reference}>Track</Button></div>{result ? <div className="rounded-lg border bg-white p-4 text-sm">Route: {result.route} | Status: {result.status}</div> : null}</div>;
}
