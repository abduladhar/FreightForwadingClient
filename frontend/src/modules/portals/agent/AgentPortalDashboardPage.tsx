import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAgentPortalDashboard } from "@/api/portalApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AgentPortalPageHeader, AgentPortalStatCard } from "@/modules/portals/agent/_shared";
import { lt } from "@/modules/operationsLocalization";
import { formatCurrencyAmount } from "@/utils/currencyFormat";

export function AgentPortalDashboardPage() {
  const workspace = useWorkspace();
  const query = useQuery({ queryKey: ["agent-portal", "dashboard"], queryFn: getAgentPortalDashboard });
  const d = query.data;

  return (
    <div className="space-y-4">
      <AgentPortalPageHeader title={lt("Agent Portal")} description={lt("Assigned shipments, POD updates, destination charges, and commission visibility.")} />
      <div className="grid gap-4 md:grid-cols-3">
        <AgentPortalStatCard title={lt("Assigned Shipments")} value={d?.assignedShipments ?? 0} />
        <AgentPortalStatCard title={lt("In Transit")} value={d?.inTransitShipments ?? 0} />
        <AgentPortalStatCard title={lt("Delivered")} value={d?.deliveredShipments ?? 0} />
        <AgentPortalStatCard title={lt("Pending POD")} value={d?.pendingPod ?? 0} />
        <AgentPortalStatCard
          title={lt("Commission Amount")}
          value={formatCurrencyAmount(d?.commissionAmount ?? 0, { cultureCode: workspace.cultureCode, currencyCode: workspace.baseCurrency })}
        />
        <AgentPortalStatCard
          title={lt("Destination Charges")}
          value={formatCurrencyAmount(d?.destinationCharges ?? 0, { cultureCode: workspace.cultureCode, currencyCode: workspace.baseCurrency })}
        />
      </div>
      <Card>
        <CardHeader><CardTitle>{lt("Quick Actions")}</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/assigned-shipments">{lt("Assigned Shipments")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/shipments/status">{lt("Update Shipment Status")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/shipments/pod">{lt("Upload POD")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/destination-charges">{lt("Destination Charges")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/commission-statement">{lt("Commission Statement")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/agent-portal/documents">{lt("Download Documents")}</Link>
        </CardContent>
      </Card>
    </div>
  );
}
