import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { downloadAgentPortalDocument, downloadPortalFile, getAgentPortalAssignedShipments, type AgentAssignedShipmentDto } from "@/api/portalApi";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { AgentPortalPageHeader } from "@/modules/portals/agent/_shared";

export function AgentDocumentsPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["agent-portal", "assigned-shipments"], queryFn: getAgentPortalAssignedShipments });
  const columns: ColumnDef<AgentAssignedShipmentDto>[] = [
    { accessorKey: "shipmentNumber", header: "Shipment" },
    { accessorKey: "shipmentType", header: "Type" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "origin", header: "Origin" },
    { accessorKey: "destination", header: "Destination" },
    {
      id: "download",
      header: "Document",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            setDownloadingId(row.original.shipmentId);
            try {
              const doc = await downloadAgentPortalDocument(row.original.shipmentType, row.original.shipmentId);
              downloadPortalFile(doc);
              toast.success("Document download started.");
            } finally {
              setDownloadingId((activeId) => (activeId === row.original.shipmentId ? null : activeId));
            }
          }}
          disabled={downloadingId === row.original.shipmentId}
        >
          {downloadingId === row.original.shipmentId ? "Downloading..." : "Download"}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <AgentPortalPageHeader title="Documents" description="Download shipment documents for your assigned records." />
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
