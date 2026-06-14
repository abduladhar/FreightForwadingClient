import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { getSeaFreight } from "@/api/freightApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function ContainerListPage() {
  const [params] = useSearchParams();
  const seaShipmentDetailId = params.get("seaShipmentDetailId");
  const query = useQuery({ queryKey: ["sea-freight", seaShipmentDetailId], queryFn: () => getSeaFreight(seaShipmentDetailId!), enabled: Boolean(seaShipmentDetailId) });
  const rows = query.data?.containers ?? [];
  const columns = useMemo(() => [
    { accessorKey: "containerNumber", header: "Container" },
    { accessorKey: "sealNumber", header: "Seal" },
    { accessorKey: "containerType", header: "Type/Size" },
    { accessorKey: "freeDays", header: "Free Days" },
    { accessorKey: "demurrage", header: "Demurrage" },
    { accessorKey: "detention", header: "Detention" }
  ], []);
  return <div className="space-y-4">
    <PageHeader title="Containers" description="Container list for selected sea shipment." actions={<><AuditTrailButton />{seaShipmentDetailId ? <PermissionButton asChild permission="SeaFreight.Create"><Link to={`/containers/new?seaShipmentDetailId=${seaShipmentDetailId}`}><Plus className="h-4 w-4" /> New Container</Link></PermissionButton> : null}</>} />
    <Card><CardContent className="pt-6"><DataTable data={rows} columns={columns as never} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} onPaginationChange={() => {}} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row: { id: string }) => <div className="flex gap-1"><PermissionButton asChild permission="SeaFreight.Read" size="sm" variant="ghost"><Link to={`/containers/${row.id}?seaShipmentDetailId=${seaShipmentDetailId}`}>View</Link></PermissionButton><PermissionButton asChild permission="SeaFreight.Update" size="sm" variant="ghost"><Link to={`/containers/${row.id}/edit?seaShipmentDetailId=${seaShipmentDetailId}`}>Edit</Link></PermissionButton></div>} /></CardContent></Card>
  </div>;
}
