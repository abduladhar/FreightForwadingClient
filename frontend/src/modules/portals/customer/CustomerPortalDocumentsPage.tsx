import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCustomerPortalShipmentTracking, uploadCustomerPortalDocument } from "@/api/portalApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";

export function CustomerPortalDocumentsPage() {
  const tracking = useQuery({ queryKey: ["customer-portal", "tracking"], queryFn: getCustomerPortalShipmentTracking });
  const [value, setValue] = useState({ shipmentType: "House", shipmentId: "", documentReference: "", documentType: "" });
  const upload = useMutation({ mutationFn: () => uploadCustomerPortalDocument({ ...value, documentType: value.documentType || null }) });
  return (
    <div className="space-y-4">
      <PortalPageHeader title="Documents" description="Attach and submit document references for your shipments." />
      <Card>
        <CardHeader><CardTitle>Upload Document Reference</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <select className="h-10 rounded-md border px-3 text-sm" value={value.shipmentId} onChange={(e) => {
            const shipment = (tracking.data ?? []).find((x) => x.shipmentId === e.target.value);
            setValue({ ...value, shipmentId: e.target.value, shipmentType: shipment?.shipmentType ?? value.shipmentType });
          }}>
            <option value="">Select shipment</option>
            {(tracking.data ?? []).map((s) => <option key={s.shipmentId} value={s.shipmentId}>{s.shipmentNumber} ({s.shipmentType})</option>)}
          </select>
          <Input placeholder="Document type" value={value.documentType} onChange={(e) => setValue({ ...value, documentType: e.target.value })} />
          <Input className="md:col-span-2" placeholder="Document reference" value={value.documentReference} onChange={(e) => setValue({ ...value, documentReference: e.target.value })} />
          <div className="md:col-span-2"><Button onClick={() => upload.mutate()} disabled={upload.isPending || !value.shipmentId || !value.documentReference}>Submit</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

