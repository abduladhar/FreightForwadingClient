import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { createCourier, getCourier, updateCourier, type CourierShipmentDetailRequest } from "@/api/freightApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export function CourierShipmentDetailsPage() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const toast = useToast();
  const query = useQuery({ queryKey: ["courier", id], queryFn: () => getCourier(id!), enabled: Boolean(id) });
  const [value, setValue] = useState<CourierShipmentDetailRequest>({
    shipmentId: "",
    shipmentType: "Direct",
    bagNumber: null,
    manifestNumber: null,
    isReturnShipment: false,
    isCodRequired: false,
    codAmount: 0,
    deliveryProofDocumentId: null
  });
  const createMutation = useMutation({ mutationFn: createCourier });
  const updateMutation = useMutation({ mutationFn: (payload: CourierShipmentDetailRequest) => updateCourier(id!, payload) });
  const current = query.data ?? value;
  return <div className="space-y-4">
    <PageHeader title="Courier Shipment Details" description="Courier bagging, manifest, COD, and return shipment setup." actions={<><AuditTrailButton />{id ? <Button asChild variant="outline"><Link to={`/courier/piece-tracking?id=${id}`}>Piece Tracking</Link></Button> : null}</>} />
    <div className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-3">
      <Field label="Shipment Id"><Input value={current.shipmentId} onChange={(e) => setValue({ ...current, shipmentId: e.target.value })} /></Field>
      <Field label="Shipment Type"><Input value={current.shipmentType} onChange={(e) => setValue({ ...current, shipmentType: e.target.value })} /></Field>
      <Field label="Bag Number"><Input value={current.bagNumber ?? ""} onChange={(e) => setValue({ ...current, bagNumber: e.target.value || null })} /></Field>
      <Field label="Manifest Number"><Input value={current.manifestNumber ?? ""} onChange={(e) => setValue({ ...current, manifestNumber: e.target.value || null })} /></Field>
      <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={current.isReturnShipment} onChange={(e) => setValue({ ...current, isReturnShipment: e.target.checked })} /> Return Shipment</label>
      <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={current.isCodRequired} onChange={(e) => setValue({ ...current, isCodRequired: e.target.checked })} /> COD Required</label>
      <Field label="COD Amount"><Input type="number" min="0" value={current.codAmount} onChange={(e) => setValue({ ...current, codAmount: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label="Delivery Proof Document Id"><Input value={current.deliveryProofDocumentId ?? ""} onChange={(e) => setValue({ ...current, deliveryProofDocumentId: e.target.value || null })} /></Field>
      <div className="md:col-span-3"><PermissionButton permission={id ? "Courier.Update" : "Courier.Create"} onClick={() => void (id ? updateMutation.mutateAsync(current) : createMutation.mutateAsync(current)).then(() => toast.success("Saved", "Courier details saved."))} disabled={createMutation.isPending || updateMutation.isPending}>{(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Courier Details"}</PermissionButton></div>
    </div>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
