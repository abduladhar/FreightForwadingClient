import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { updateTransportationStatus, type TransportationRecord } from "@/api/transportationApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { PageHeader } from "@/components/PageHeader";

export function TransportationStatusPage() {
  const { type, id } = useParams();
  const [status, setStatus] = useState("In Transit");
  const normalizedType: TransportationRecord["type"] = type === "pickup" ? "Pickup" : type === "directshipment" ? "DirectShipment" : "HouseShipment";
  const mutation = useMutation({ mutationFn: () => updateTransportationStatus({ id: id!, type: normalizedType, number: "", origin: "", destination: "", status }, status) });
  if (!type || !id) return <Navigate to="/transportation" replace />;
  return <div className="space-y-4"><PageHeader title="Transportation Status" description="Update transportation status across operational records." /><div className="rounded-lg border bg-white p-4 flex gap-2"><select className="h-10 rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option>Created</option><option>Assigned</option><option>In Transit</option><option>Arrived</option><option>Delivered</option><option>Cancelled</option></select><PermissionButton permission={normalizedType === "Pickup" ? "Pickup.Update" : normalizedType === "HouseShipment" ? "HouseShipment.Update" : "DirectShipment.Update"} onClick={() => void mutation.mutateAsync()}>Update</PermissionButton></div></div>;
}
