import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { getCustomerPortalShipmentTracking, type ShipmentTrackingDto } from "@/api/portalApi";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";

export function CustomerPortalTrackingPage() {
  const query = useQuery({ queryKey: ["customer-portal", "tracking"], queryFn: getCustomerPortalShipmentTracking });
  const columns: ColumnDef<ShipmentTrackingDto>[] = [
    { accessorKey: "shipmentNumber", header: "Shipment" },
    { accessorKey: "shipmentType", header: "Type" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "origin", header: "Origin" },
    { accessorKey: "destination", header: "Destination" },
    { accessorKey: "etd", header: "ETD" },
    { accessorKey: "eta", header: "ETA" },
    { accessorKey: "actualDeparture", header: "Actual Departure" },
    { accessorKey: "actualArrival", header: "Actual Arrival" }
  ];
  return (
    <div className="space-y-4">
      <PortalPageHeader title="Shipment Tracking" description="Track your active shipments." />
      <DataTable data={query.data ?? []} columns={columns} totalCount={query.data?.length ?? 0} pageNumber={1} pageSize={Math.max(10, query.data?.length ?? 10)} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} onPaginationChange={() => undefined} />
    </div>
  );
}

