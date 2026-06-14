import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getAgentPortalAssignedShipments, updateAgentPortalShipmentStatus } from "@/api/portalApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { AgentPortalPageHeader } from "@/modules/portals/agent/_shared";

const nextStatuses = ["In Transit", "Arrived", "Delivered"];

export function AgentShipmentStatusUpdatePage() {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const assigned = useQuery({ queryKey: ["agent-portal", "assigned-shipments"], queryFn: getAgentPortalAssignedShipments });
  const preselected = useMemo(() => (assigned.data ?? []).find((x) => x.shipmentId === params.get("shipmentId")), [assigned.data, params]);
  const [value, setValue] = useState({
    shipmentType: params.get("shipmentType") ?? preselected?.shipmentType ?? "House",
    shipmentId: params.get("shipmentId") ?? "",
    status: "In Transit",
    remarks: ""
  });

  useEffect(() => {
    if (!preselected) return;
    setValue((previous) => ({
      ...previous,
      shipmentId: preselected.shipmentId,
      shipmentType: preselected.shipmentType
    }));
  }, [preselected]);

  const update = useMutation({
    mutationFn: () => updateAgentPortalShipmentStatus({ ...value, remarks: value.remarks || null }),
    onSuccess: () => {
      toast.success("Shipment status updated.");
      void queryClient.invalidateQueries({ queryKey: ["agent-portal", "assigned-shipments"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-portal", "dashboard"] });
    }
  });

  return (
    <div className="space-y-4">
      <AgentPortalPageHeader title="Update Shipment Status" description="Submit shipment status updates for assigned records." />
      <Card>
        <CardHeader><CardTitle>Status Update</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <select className="h-10 rounded-md border px-3 text-sm" value={value.shipmentId} onChange={(e) => {
            const selected = (assigned.data ?? []).find((x) => x.shipmentId === e.target.value);
            setValue({ ...value, shipmentId: e.target.value, shipmentType: selected?.shipmentType ?? value.shipmentType });
          }}>
            <option value="">Select shipment</option>
            {(assigned.data ?? []).map((x) => <option key={x.shipmentId} value={x.shipmentId}>{x.shipmentNumber} ({x.shipmentType})</option>)}
          </select>
          <select className="h-10 rounded-md border px-3 text-sm" value={value.status} onChange={(e) => setValue({ ...value, status: e.target.value })}>
            {nextStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Input className="md:col-span-2" placeholder="Remarks" value={value.remarks} onChange={(e) => setValue({ ...value, remarks: e.target.value })} />
          <div className="md:col-span-2">
            <Button onClick={() => update.mutate()} disabled={!value.shipmentId || update.isPending || assigned.isLoading}>
              Update Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
