import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getPickup, updatePickupStatus } from "@/api/pickupApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

const statuses = ["Created", "Assigned", "In Progress", "Picked Up", "Cancelled", "Completed"];

export function PickupStatusUpdatePage() {
  const { pickupId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const p = usePickupI18n();
  const pickup = useQuery({ queryKey: ["pickup-status", pickupId], queryFn: () => getPickup(pickupId), enabled: Boolean(pickupId) });
  const [status, setStatus] = useState("Assigned");
  const [proofReference, setProofReference] = useState("");
  const mutation = useMutation({ mutationFn: () => updatePickupStatus(pickupId, { status, proofOfPickupDocumentReference: proofReference || null }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["pickup", pickupId] }); await queryClient.invalidateQueries({ queryKey: ["pickups"] }); navigate(`/pickups/${pickupId}`); } });
  return <div className="space-y-4"><PageHeader title={`${p("Update Pickup Status")} ${pickup.data?.pickupNumber ?? ""}`} description={p("Track assignment, in-progress, pickup completion, and proof reference.")} /><Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} space-y-4`}><div className="grid gap-4 md:grid-cols-2"><div className="space-y-1"><Label>{p("Status")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((x) => <option key={x} value={x}>{p(x)}</option>)}</select></div><div className="space-y-1"><Label>{p("Proof Reference")}</Label><Input value={proofReference} onChange={(e) => setProofReference(e.target.value)} placeholder={p("Document reference")} /></div></div><p className="text-xs text-muted-foreground">{p("Upload proof and other pickup documents from the Pickup detail page after the pickup is created.")}</p><PermissionButton className={masterDataButtonClass} permission="Pickup.Update" onClick={() => void mutation.mutate()} disabled={mutation.isPending}>{p("Update Status")}</PermissionButton></CardContent></Card></div>;
}
