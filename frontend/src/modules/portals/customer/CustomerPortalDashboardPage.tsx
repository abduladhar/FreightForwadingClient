import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCustomerPortalDashboard } from "@/api/portalApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalPageHeader, PortalStatCard } from "@/modules/portals/customer/_shared";
import { lt } from "@/modules/operationsLocalization";

export function CustomerPortalDashboardPage() {
  const query = useQuery({ queryKey: ["customer-portal", "dashboard"], queryFn: getCustomerPortalDashboard });
  const d = query.data;

  return (
    <div className="space-y-4">
      <PortalPageHeader title={lt("Customer Portal")} description={lt("Welcome to your customer workspace.")} />
      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title={lt("Total Quotations")} value={d?.totalQuotations ?? 0} />
        <PortalStatCard title={lt("Pending Quotations")} value={d?.pendingQuotations ?? 0} />
        <PortalStatCard title={lt("Active Shipments")} value={d?.activeShipments ?? 0} />
        <PortalStatCard title={lt("Pending Invoices")} value={d?.pendingInvoices ?? 0} />
        <PortalStatCard title={lt("Outstanding Amount")} value={(d?.outstandingAmount ?? 0).toFixed(2)} />
        <PortalStatCard title={lt("Pending Pickups")} value={d?.pendingPickups ?? 0} />
      </div>
      <Card>
        <CardHeader><CardTitle>{lt("Quick Actions")}</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/quotations">{lt("View Quotations")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/shipment-request">{lt("Create Shipment Request")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/pickup-request">{lt("Request Pickup")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/tracking">{lt("Track Shipments")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/invoices">{lt("Invoices")}</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/statement-of-account">{lt("Statement of Account")}</Link>
        </CardContent>
      </Card>
    </div>
  );
}
