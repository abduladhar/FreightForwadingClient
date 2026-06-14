import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { searchTransportationRecords } from "@/api/transportationApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function TransportationListPage() {
  const query = useQuery({ queryKey: ["transportation"], queryFn: () => searchTransportationRecords({}) });
  const columns = [
    { accessorKey: "type", header: "Type" },
    { accessorKey: "number", header: "Reference" },
    { accessorKey: "origin", header: "Origin" },
    { accessorKey: "destination", header: "Destination" },
    { accessorKey: "status", header: "Status", cell: ({ row }: { row: { original: { status: string } } }) => <StatusBadge status={row.original.status} /> }
  ];
  return <div className="space-y-4"><PageHeader title="Transportation" description="Pickup and shipment transportation status board." actions={<><AuditTrailButton /><PermissionButton asChild permission="Pickup.Create"><Link to="/transportation/new"><Plus className="h-4 w-4" /> New Transportation</Link></PermissionButton></>} /><Card><CardContent className="pt-6"><DataTable data={query.data?.items ?? []} columns={columns as never} totalCount={query.data?.totalCount ?? 0} pageNumber={1} pageSize={query.data?.items?.length || 10} onPaginationChange={() => {}} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row: { id: string; type: string }) => <PermissionButton asChild permission="Pickup.Update" size="sm" variant="ghost"><Link to={`/transportation/${row.type.toLowerCase()}/${row.id}/status`}>Status</Link></PermissionButton>} /></CardContent></Card></div>;
}
