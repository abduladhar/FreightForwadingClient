import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getCourier } from "@/api/freightApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";

export function CourierBaggingPage() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const query = useQuery({ queryKey: ["courier", id], queryFn: () => getCourier(id), enabled: Boolean(id) });
  return <div className="space-y-4">
    <PageHeader title="Courier Bagging" description="Bag number and piece-level grouping overview for courier shipment." actions={<><AuditTrailButton /><PermissionButton asChild permission="Courier.Update"><Link to={`/courier/piece-tracking?id=${id}`}>Go To Piece Tracking</Link></PermissionButton></>} />
    <Card><CardContent className="pt-6 space-y-2"><p className="text-sm">Bag Number: <span className="font-medium">{query.data?.bagNumber ?? "-"}</span></p><p className="text-sm">Pieces in Bag: <span className="font-medium">{query.data?.pieces?.length ?? 0}</span></p></CardContent></Card>
  </div>;
}
