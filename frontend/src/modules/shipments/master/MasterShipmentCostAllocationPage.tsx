import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getMasterShipmentCostAllocationPreview } from "@/api/masterShipmentApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function MasterShipmentCostAllocationPage() {
  const { masterShipmentId } = useParams();
  const query = useQuery({ queryKey: ["master-shipment-cost-allocation", masterShipmentId], queryFn: () => getMasterShipmentCostAllocationPreview(masterShipmentId!), enabled: Boolean(masterShipmentId) });
  if (!masterShipmentId) return <Navigate to="/master-shipments" replace />;
  const p = query.data;
  return <div className="space-y-4">
    <PageHeader title={lt("Cost Allocation Preview")} description={lt("Allocation by Weight, Volume, Pieces, Chargeable Weight, or Manual method.")} />
    <Card><CardContent className="pt-6 space-y-2">
      <p className="text-sm">{lt("Allocation Method")}: <span className="font-medium">{p?.allocationMethod ?? "-"}</span></p>
      <p className="text-sm">{lt("Total Cost")}: <span className="font-medium">{(p?.totalCostAmount ?? 0).toFixed(2)}</span></p>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("House Shipment")}</th><th className="p-2 text-left">{lt("Pieces")}</th><th className="p-2 text-left">{lt("Weight")}</th><th className="p-2 text-left">{lt("Volume")}</th><th className="p-2 text-left">{lt("Chargeable")}</th><th className="p-2 text-left">{lt("Allocated")}</th><th className="p-2 text-left">{lt("Manual")}</th></tr></thead>
          <tbody>{(p?.items ?? []).map((x) => <tr key={x.id} className="border-t"><td className="p-2">{x.houseShipmentNumber}</td><td className="p-2">{x.consolidatedPieces}</td><td className="p-2">{x.consolidatedWeight}</td><td className="p-2">{x.consolidatedVolume}</td><td className="p-2">{x.chargeableWeight}</td><td className="p-2">{x.allocatedCostAmount.toFixed(2)}</td><td className="p-2">{(x.manualAllocatedCostAmount ?? 0).toFixed(2)}</td></tr>)}</tbody>
        </table>
      </div>
    </CardContent></Card>
  </div>;
}
