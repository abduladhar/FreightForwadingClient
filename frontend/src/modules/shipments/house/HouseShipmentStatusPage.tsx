import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { cancelHouseShipment, getHouseShipment, updateHouseShipmentStatus } from "@/api/houseShipmentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { ShipmentStatusTimeline } from "@/components/common/ShipmentStatusTimeline";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

const statuses = ["Draft", "Booked", "Goods Received", "In Warehouse", "Loaded", "In Transit", "Arrived", "Delivered", "Closed", "Cancelled"];

export function HouseShipmentStatusPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["house-shipment", shipmentId], queryFn: () => getHouseShipment(shipmentId!), enabled: Boolean(shipmentId) });
  const statusMutation = useMutation({ mutationFn: (status: string) => updateHouseShipmentStatus(shipmentId!, { status }) });
  const cancelMutation = useMutation({ mutationFn: (reason: string) => cancelHouseShipment(shipmentId!, { reason }) });
  const [status, setStatus] = useState("In Transit");
  const [reason, setReason] = useState("");
  if (!shipmentId) return <Navigate to="/house-shipments" replace />;

  return <div className="space-y-4">
    <PageHeader title={lt("House Shipment Status")} description={lt("Track movement and update shipment milestone status.")} />
    <ShipmentStatusTimeline items={[
      { id: "s1", status: "Draft", location: query.data?.origin, timestamp: query.data?.etd ?? undefined },
      { id: "s2", status: query.data?.status ?? "Draft", location: query.data?.destination, timestamp: query.data?.actualArrival ?? query.data?.eta ?? undefined }
    ]} />
    <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <div className="space-y-1">
        <Label>{lt("New Status")}</Label>
        <select className="h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label>{lt("Cancellation Reason (required for cancel)")}</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="md:col-span-3 flex flex-wrap gap-2">
        <PermissionButton permission="HouseShipment.Update" onClick={() => void statusMutation.mutateAsync(status).then(() => { toast.success(lt("Updated"), lt("Shipment status updated.")); navigate(`/house-shipments/${shipmentId}`); })}>{lt("Update Status")}</PermissionButton>
        <PermissionButton permission="HouseShipment.Cancel" variant="destructive" onClick={() => void cancelMutation.mutateAsync(reason).then(() => { toast.success(lt("Cancelled"), lt("Shipment cancelled.")); navigate(`/house-shipments/${shipmentId}`); })} disabled={!reason.trim()}>{lt("Cancel Shipment")}</PermissionButton>
      </div>
    </div>
  </div>;
}
