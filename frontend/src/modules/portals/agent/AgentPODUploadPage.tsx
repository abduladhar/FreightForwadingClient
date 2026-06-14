import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getAgentPortalAssignedShipments, uploadAgentPortalPod } from "@/api/portalApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { AgentPortalPageHeader } from "@/modules/portals/agent/_shared";

export function AgentPODUploadPage() {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const assigned = useQuery({ queryKey: ["agent-portal", "assigned-shipments"], queryFn: getAgentPortalAssignedShipments });
  const preselected = useMemo(() => (assigned.data ?? []).find((x) => x.shipmentId === params.get("shipmentId")), [assigned.data, params]);
  const [value, setValue] = useState({
    shipmentType: params.get("shipmentType") ?? preselected?.shipmentType ?? "House",
    shipmentId: params.get("shipmentId") ?? "",
    proofOfDeliveryDocumentId: "",
    documentReference: ""
  });

  useEffect(() => {
    if (!preselected) return;
    setValue((previous) => ({
      ...previous,
      shipmentId: preselected.shipmentId,
      shipmentType: preselected.shipmentType
    }));
  }, [preselected]);

  const upload = useMutation({
    mutationFn: () => uploadAgentPortalPod({
      ...value,
      proofOfDeliveryDocumentId: value.proofOfDeliveryDocumentId || null,
      documentReference: value.documentReference || null
    }),
    onSuccess: () => {
      toast.success("POD details submitted.");
      void queryClient.invalidateQueries({ queryKey: ["agent-portal", "assigned-shipments"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-portal", "dashboard"] });
    }
  });

  return (
    <div className="space-y-4">
      <AgentPortalPageHeader title="Upload POD" description="Submit proof of delivery details for assigned shipments." />
      <Card>
        <CardHeader><CardTitle>POD Details</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <select className="h-10 rounded-md border px-3 text-sm" value={value.shipmentId} onChange={(e) => {
            const selected = (assigned.data ?? []).find((x) => x.shipmentId === e.target.value);
            setValue({ ...value, shipmentId: e.target.value, shipmentType: selected?.shipmentType ?? value.shipmentType });
          }}>
            <option value="">Select shipment</option>
            {(assigned.data ?? []).map((x) => <option key={x.shipmentId} value={x.shipmentId}>{x.shipmentNumber} ({x.shipmentType})</option>)}
          </select>
          <Input placeholder="POD Document Id (optional)" value={value.proofOfDeliveryDocumentId} onChange={(e) => setValue({ ...value, proofOfDeliveryDocumentId: e.target.value })} />
          <Input className="md:col-span-2" placeholder="Document reference" value={value.documentReference} onChange={(e) => setValue({ ...value, documentReference: e.target.value })} />
          <div className="md:col-span-2">
            <Button onClick={() => upload.mutate()} disabled={!value.shipmentId || upload.isPending || assigned.isLoading}>
              Submit POD
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
