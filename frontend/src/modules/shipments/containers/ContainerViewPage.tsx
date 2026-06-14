import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { addContainerItem, deleteContainer, deleteContainerItem, getSeaFreight } from "@/api/freightApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export function ContainerViewPage() {
  const { containerId } = useParams();
  const [params] = useSearchParams();
  const seaShipmentDetailId = params.get("seaShipmentDetailId");
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["sea-freight", seaShipmentDetailId], queryFn: () => getSeaFreight(seaShipmentDetailId!), enabled: Boolean(seaShipmentDetailId) });
  const container = useMemo(() => (query.data?.containers ?? []).find((x) => x.id === containerId), [query.data, containerId]);
  const removeMutation = useMutation({ mutationFn: () => deleteContainer(containerId!) });
  const addItemMutation = useMutation({ mutationFn: (payload: { description: string; pieces: number; weight: number; volume: number }) => addContainerItem(containerId!, payload) });
  const removeItemMutation = useMutation({ mutationFn: (itemId: string) => deleteContainerItem(containerId!, itemId) });
  const [item, setItem] = useState({ description: "", pieces: 0, weight: 0, volume: 0 });
  if (!containerId || !seaShipmentDetailId) return <Navigate to="/containers" replace />;
  if (!container) return <div className="p-4 text-sm text-muted-foreground">Loading container...</div>;
  return <div className="space-y-4">
    <PageHeader title={container.containerNumber} description={`Seal ${container.sealNumber ?? "-"} | Type ${container.containerType}`} actions={<><AuditTrailButton /><PermissionButton asChild permission="SeaFreight.Update"><Link to={`/containers/${containerId}/edit?seaShipmentDetailId=${seaShipmentDetailId}`}>Edit</Link></PermissionButton><PermissionButton permission="SeaFreight.Delete" variant="destructive" onClick={() => void removeMutation.mutateAsync().then(() => { toast.success("Deleted", "Container deleted."); navigate(`/containers?seaShipmentDetailId=${seaShipmentDetailId}`); })}>Delete</PermissionButton></>} />
    <Card><CardContent className="pt-6 space-y-2"><p className="text-sm">Free Days: {container.freeDays}</p><p className="text-sm">Demurrage: {container.demurrage}</p><p className="text-sm">Detention: {container.detention}</p></CardContent></Card>
    <Card><CardContent className="pt-6 space-y-3"><h3 className="font-medium">Container Items</h3><div className="grid gap-2 md:grid-cols-5"><Input placeholder="Description" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} /><Input type="number" min="0" placeholder="Pieces" value={item.pieces} onChange={(e) => setItem({ ...item, pieces: Math.max(0, Number(e.target.value)) })} /><Input type="number" min="0" placeholder="Weight" value={item.weight} onChange={(e) => setItem({ ...item, weight: Math.max(0, Number(e.target.value)) })} /><Input type="number" min="0" placeholder="Volume" value={item.volume} onChange={(e) => setItem({ ...item, volume: Math.max(0, Number(e.target.value)) })} /><PermissionButton permission="SeaFreight.Update" onClick={() => void addItemMutation.mutateAsync(item).then(() => { setItem({ description: "", pieces: 0, weight: 0, volume: 0 }); void query.refetch(); })}>Add</PermissionButton></div><div className="space-y-2">{container.items.map((x) => <div key={x.id} className="flex items-center justify-between rounded-md border p-3 text-sm"><span>{x.description} | Pcs {x.pieces} | Wt {x.weight} | Vol {x.volume}</span><PermissionButton permission="SeaFreight.Update" variant="ghost" size="sm" onClick={() => void removeItemMutation.mutateAsync(x.id).then(() => void query.refetch())}>Remove</PermissionButton></div>)}</div></CardContent></Card>
  </div>;
}
