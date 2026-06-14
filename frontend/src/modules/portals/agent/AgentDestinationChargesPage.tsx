import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAgentPortalDestinationCharge, getAgentPortalAssignedShipments } from "@/api/portalApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { AgentPortalPageHeader } from "@/modules/portals/agent/_shared";

export function AgentDestinationChargesPage() {
  const queryClient = useQueryClient();
  const assigned = useQuery({ queryKey: ["agent-portal", "assigned-shipments"], queryFn: getAgentPortalAssignedShipments });
  const currencies = useQuery({ queryKey: ["portal-tenant-currencies"], queryFn: getTenantCurrencies });
  const enabledCurrencies = useMemo(() => (currencies.data ?? []).filter((x) => x.isEnabled), [currencies.data]);
  const defaultCurrencyId = useMemo(() => enabledCurrencies.find((x) => x.isBaseCurrency)?.currencyId ?? enabledCurrencies[0]?.currencyId ?? "", [enabledCurrencies]);
  const [value, setValue] = useState({
    shipmentType: "House",
    shipmentId: "",
    chargeName: "",
    amount: 0,
    currencyId: "",
    remarks: ""
  });
  const create = useMutation({
    mutationFn: () => createAgentPortalDestinationCharge({
      ...value,
      currencyId: value.currencyId || defaultCurrencyId,
      remarks: value.remarks || null
    }),
    onSuccess: () => {
      toast.success("Destination charge submitted.");
      setValue((previous) => ({ ...previous, chargeName: "", amount: 0, remarks: "" }));
      void queryClient.invalidateQueries({ queryKey: ["agent-portal", "dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-portal", "commission-statement"] });
    }
  });

  return (
    <div className="space-y-4">
      <AgentPortalPageHeader title="Destination Charges" description="Enter destination charges for assigned shipments." />
      <Card>
        <CardHeader><CardTitle>Charge Entry</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <select className="h-10 rounded-md border px-3 text-sm" value={value.shipmentId} onChange={(e) => {
            const selected = (assigned.data ?? []).find((x) => x.shipmentId === e.target.value);
            setValue({ ...value, shipmentId: e.target.value, shipmentType: selected?.shipmentType ?? value.shipmentType });
          }}>
            <option value="">Select shipment</option>
            {(assigned.data ?? []).map((x) => <option key={x.shipmentId} value={x.shipmentId}>{x.shipmentNumber} ({x.shipmentType})</option>)}
          </select>
          <Input placeholder="Charge name" value={value.chargeName} onChange={(e) => setValue({ ...value, chargeName: e.target.value })} />
          <Input type="number" min="0" step="0.01" placeholder="Amount" value={value.amount} onChange={(e) => setValue({ ...value, amount: Number(e.target.value) })} />
          <select className="h-10 rounded-md border px-3 text-sm" value={value.currencyId} onChange={(e) => setValue({ ...value, currencyId: e.target.value })}>
            <option value="">Select currency</option>
            {enabledCurrencies.map((x) => <option key={x.currencyId} value={x.currencyId}>{x.currencyCode}</option>)}
          </select>
          <Input className="md:col-span-2" placeholder="Remarks" value={value.remarks} onChange={(e) => setValue({ ...value, remarks: e.target.value })} />
          <div className="md:col-span-2">
            <Button
              onClick={() => create.mutate()}
              disabled={!value.shipmentId || !value.chargeName.trim() || value.amount <= 0 || (!value.currencyId && !defaultCurrencyId) || create.isPending}
            >
              Submit Charge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
