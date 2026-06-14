import { Link, useParams } from "react-router-dom";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";

export function TransportationEditPage() {
  const { type, id } = useParams();
  const targetEditPath =
    type === "pickup"
      ? `/pickups/${id}/edit`
      : type === "houseshipment"
        ? `/house-shipments/${id}/edit`
        : `/direct-shipments/${id}/edit`;
  return <div className="space-y-4">
    <PageHeader title="Edit Transportation" description="Open the source operational record to edit route, assignment, and movement details." actions={<AuditTrailButton />} />
    <Card>
      <CardContent className="pt-6 space-y-3 text-sm">
        <p>Record: <span className="font-medium">{type}:{id}</span></p>
        <p>This transportation record is owned by its operational module. Use the button below to edit it directly.</p>
        <PermissionButton asChild permission={type === "pickup" ? "Pickup.Update" : type === "houseshipment" ? "HouseShipment.Update" : "DirectShipment.Update"}>
          <Link to={targetEditPath}>Open Edit Screen</Link>
        </PermissionButton>
      </CardContent>
    </Card>
  </div>;
}
