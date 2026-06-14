import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAgentPortalDashboard } from "@/api/portalApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AgentPortalPageHeader, AgentPortalStatCard } from "@/modules/portals/agent/_shared";
import { formatCurrencyAmount } from "@/utils/currencyFormat";

export function AgentPortalDashboardPage() {
  const workspace = useWorkspace();
  const query = useQuery({ queryKey: ["agent-portal", "dashboard"], queryFn: getAgentPortalDashboard });
  const d = query.data;

  return (
    <div className="space-y-4">
      <AgentPortalPageHeader title="Agent Portal" description="Assigned shipments, POD updates, destination charges, and commission visibility." />
      <div className="grid gap-4 md:grid-cols-3">
        <AgentPortalStatCard title="Assigned Shipments" value={d?.assignedShipments ?? 0} />
        <AgentPortalStatCard title="In Transit" value={d?.inTransitShipments ?? 0} />
        <AgentPortalStatCard title="Delivered" value={d?.deliveredShipments ?? 0} />
        <AgentPortalStatCard title="Pending POD" value={d?.pendingPod ?? 0} />
        <AgentPortalStatCard
          title="Commission Amount"
          value={formatCurrencyAmount(d?.commissionAmount ?? 0, { cultureCode: workspace.cultureCode, currencyCode: workspace.baseCurrency })}
        />
        <AgentPortalStatCard
          title="Destination Charges"
          value={formatCurrencyAmount(d?.destinationCharges ?? 0, { cultureCode: workspace.cultureCode, currencyCode: workspace.baseCurrency })}
        />
      </div>
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/assigned-shipments">Assigned Shipments</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/shipments/status">Update Shipment Status</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/shipments/pod">Upload POD</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/destination-charges">Destination Charges</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/commission-statement">Commission Statement</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/documents">Download Documents</Link>
        </CardContent>
      </Card>
    </div>
  );
}
