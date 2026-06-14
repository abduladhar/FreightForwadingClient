import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { assignPickup, getPickup } from "@/api/pickupApi";
import { searchVendors } from "@/api/vendorApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PickupAssignPage() {
  const { pickupId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const p = usePickupI18n();
  const pickup = useQuery({ queryKey: ["pickup-assign", pickupId], queryFn: () => getPickup(pickupId), enabled: Boolean(pickupId) });
  const vendors = useQuery({ queryKey: ["pickup-assign-vendors"], queryFn: () => searchVendors({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [transporterVendorId, setTransporterVendorId] = useState("");
  useEffect(() => {
    if (!pickup.data) return;
    setDriverName(pickup.data.driverName ?? "");
    setVehicleNumber(pickup.data.vehicleNumber ?? "");
    setTransporterVendorId(pickup.data.transporterVendorId ?? "");
  }, [pickup.data]);
  const mutation = useMutation({ mutationFn: () => assignPickup(pickupId, { driverName: driverName || null, vehicleNumber, transporterVendorId: transporterVendorId || null, driverId: null }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["pickup", pickupId] }); await queryClient.invalidateQueries({ queryKey: ["pickups"] }); navigate(`/pickups/${pickupId}`); } });
  return <div className="space-y-4"><PageHeader title={`${p("Assign Pickup")} ${pickup.data?.pickupNumber ?? ""}`} description={p("Assign driver, vehicle, and transporter/vendor.")} /><Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} grid gap-4 md:grid-cols-2`}><Field label={p("Driver Name")}><Input value={driverName} onChange={(e) => setDriverName(e.target.value)} /></Field><Field label={p("Vehicle Number")}><Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} /></Field><Field label={p("Transporter Vendor")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={transporterVendorId} onChange={(e) => setTransporterVendorId(e.target.value)}><option value="">{p("Select vendor")}</option>{(vendors.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.vendorCode} - {x.vendorName}</option>)}</select></Field><div className="md:col-span-2"><Button className={masterDataButtonClass} onClick={() => void mutation.mutate()} disabled={!vehicleNumber.trim() || mutation.isPending}>{p("Assign Pickup")}</Button></div></CardContent></Card></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
