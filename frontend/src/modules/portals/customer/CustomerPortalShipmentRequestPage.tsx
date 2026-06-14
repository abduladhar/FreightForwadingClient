import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createCustomerPortalShipmentRequest, getCustomerPortalQuotations } from "@/api/portalApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";

export function CustomerPortalShipmentRequestPage() {
  const quotations = useQuery({ queryKey: ["customer-portal", "quotations"], queryFn: getCustomerPortalQuotations });
  const [value, setValue] = useState({ shipmentType: "Direct", quotationId: "", origin: "", destination: "", modeOfTransport: "Air", remarks: "" });
  const create = useMutation({ mutationFn: () => createCustomerPortalShipmentRequest({ ...value, quotationId: value.quotationId || null, remarks: value.remarks || null }) });

  return (
    <div className="space-y-4">
      <PortalPageHeader title="Shipment Request" description="Create shipment request linked to quotation or direct." />
      <Card>
        <CardHeader><CardTitle>Request Form</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <select className="h-10 rounded-md border px-3 text-sm" value={value.shipmentType} onChange={(e) => setValue({ ...value, shipmentType: e.target.value })}><option>Direct</option><option>House</option></select>
          <select className="h-10 rounded-md border px-3 text-sm" value={value.quotationId} onChange={(e) => setValue({ ...value, quotationId: e.target.value })}><option value="">Quotation (optional)</option>{(quotations.data ?? []).map((q) => <option key={q.id} value={q.id}>{q.quotationNumber}</option>)}</select>
          <Input placeholder="Origin" value={value.origin} onChange={(e) => setValue({ ...value, origin: e.target.value })} />
          <Input placeholder="Destination" value={value.destination} onChange={(e) => setValue({ ...value, destination: e.target.value })} />
          <select className="h-10 rounded-md border px-3 text-sm" value={value.modeOfTransport} onChange={(e) => setValue({ ...value, modeOfTransport: e.target.value })}><option>Air</option><option>Sea</option><option>Road</option><option>Courier</option></select>
          <Input placeholder="Remarks" value={value.remarks} onChange={(e) => setValue({ ...value, remarks: e.target.value })} />
          <div className="md:col-span-2"><Button onClick={() => create.mutate()} disabled={create.isPending}>Submit Request</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

