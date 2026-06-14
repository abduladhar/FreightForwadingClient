import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PermissionButton } from "@/auth/PermissionButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function TransportationCreatePage() {
  const navigate = useNavigate();
  const [type, setType] = useState("Pickup");
  const [referenceId, setReferenceId] = useState("");
  return <div className="space-y-4">
    <PageHeader title="Create Transportation" description="Create transportation through pickup/house/direct operational flows." />
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Transportation Type</Label>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option>Pickup</option>
              <option>HouseShipment</option>
              <option>DirectShipment</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Existing Reference Id (optional)</Label>
            <Input value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="Use when updating existing transportation" />
          </div>
          <div className="flex items-end gap-2">
            <PermissionButton permission={type === "Pickup" ? "Pickup.Create" : type === "HouseShipment" ? "HouseShipment.Create" : "DirectShipment.Create"} onClick={() => {
              if (referenceId) {
                navigate(`/transportation/${type.toLowerCase()}/${referenceId}/status`);
                return;
              }
              if (type === "Pickup") navigate("/pickups/new");
              else if (type === "HouseShipment") navigate("/house-shipments/new");
              else navigate("/direct-shipments/new");
            }}>
              Continue
            </PermissionButton>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Tip: if you already have a record, provide its id to jump directly to status update.</p>
      </CardContent>
    </Card>
  </div>;
}
