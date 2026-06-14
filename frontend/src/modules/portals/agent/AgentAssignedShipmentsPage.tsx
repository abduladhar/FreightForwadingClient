import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { getAgentPortalAssignedShipments, type AgentAssignedShipmentDto } from "@/api/portalApi";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { AgentPortalPageHeader } from "@/modules/portals/agent/_shared";
import { useLanguage } from "@/hooks/useLanguage";

export function AgentAssignedShipmentsPage() {
  const language = useLanguage();
  const query = useQuery({ queryKey: ["agent-portal", "assigned-shipments"], queryFn: getAgentPortalAssignedShipments });
  const columns: ColumnDef<AgentAssignedShipmentDto>[] = [
    { accessorKey: "shipmentNumber", header: "Shipment" },
    { accessorKey: "shipmentType", header: "Type" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "origin", header: "Origin" },
    { accessorKey: "destination", header: "Destination" },
    { accessorKey: "etd", header: "ETD", cell: ({ row }) => language.formatLocalizedDateTime(row.original.etd) },
    { accessorKey: "eta", header: "ETA", cell: ({ row }) => language.formatLocalizedDateTime(row.original.eta) },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const base = `shipmentType=${encodeURIComponent(row.original.shipmentType)}&shipmentId=${encodeURIComponent(row.original.shipmentId)}`;
        return (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline"><Link to={`/agent-portal/shipments/status?${base}`}>Status</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to={`/agent-portal/shipments/pod?${base}`}>POD</Link></Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <AgentPortalPageHeader title="Assigned Shipments" description="Only your assigned shipments are visible here." />
      <DataTable
        data={query.data ?? []}
        columns={columns}
        totalCount={query.data?.length ?? 0}
        pageNumber={1}
        pageSize={Math.max(10, query.data?.length ?? 10)}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        onPaginationChange={() => undefined}
      />
    </div>
  );
}
