import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createCustomerPortalPickupRequest } from "@/api/portalApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";

export function CustomerPortalPickupRequestPage() {
  const [item, setItem] = useState({ description: "", pieces: 1, weight: 1, length: 1, width: 1, height: 1, packageType: "", marksAndNumbers: "" });
  const [value, setValue] = useState({ customerLocation: "", contactPerson: "", contactPhone: "", pickupDateTime: "", items: [item] });
  const create = useMutation({
    mutationFn: () => createCustomerPortalPickupRequest({ ...value, pickupDateTime: new Date(value.pickupDateTime).toISOString() })
  });

  return (
    <div className="space-y-4">
      <PortalPageHeader title="Pickup Request" description="Request pickup from your location." />
      <Card>
        <CardHeader><CardTitle>Pickup Form</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Customer Location" value={value.customerLocation} onChange={(e) => setValue({ ...value, customerLocation: e.target.value })} />
          <Input placeholder="Contact Person" value={value.contactPerson} onChange={(e) => setValue({ ...value, contactPerson: e.target.value })} />
          <Input placeholder="Contact Phone" value={value.contactPhone} onChange={(e) => setValue({ ...value, contactPhone: e.target.value })} />
          <Input type="datetime-local" value={value.pickupDateTime} onChange={(e) => setValue({ ...value, pickupDateTime: e.target.value })} />
          <Input placeholder="Item Description" value={item.description} onChange={(e) => { const next = { ...item, description: e.target.value }; setItem(next); setValue({ ...value, items: [next] }); }} />
          <Input type="number" min="1" placeholder="Pieces" value={item.pieces} onChange={(e) => { const next = { ...item, pieces: Number(e.target.value) }; setItem(next); setValue({ ...value, items: [next] }); }} />
          <Input type="number" min="0" step="0.01" placeholder="Weight" value={item.weight} onChange={(e) => { const next = { ...item, weight: Number(e.target.value) }; setItem(next); setValue({ ...value, items: [next] }); }} />
          <Input placeholder="Package Type" value={item.packageType} onChange={(e) => { const next = { ...item, packageType: e.target.value }; setItem(next); setValue({ ...value, items: [next] }); }} />
          <div className="md:col-span-2"><Button onClick={() => create.mutate()} disabled={create.isPending}>Submit Pickup Request</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

