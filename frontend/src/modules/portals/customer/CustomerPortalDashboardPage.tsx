import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCustomerPortalDashboard } from "@/api/portalApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalPageHeader, PortalStatCard } from "@/modules/portals/customer/_shared";

export function CustomerPortalDashboardPage() {
  const query = useQuery({ queryKey: ["customer-portal", "dashboard"], queryFn: getCustomerPortalDashboard });
  const d = query.data;

  return (
    <div className="space-y-4">
      <PortalPageHeader title="Customer Portal" description="Welcome to your customer workspace." />
      <div className="grid gap-4 md:grid-cols-3">
        <PortalStatCard title="Total Quotations" value={d?.totalQuotations ?? 0} />
        <PortalStatCard title="Pending Quotations" value={d?.pendingQuotations ?? 0} />
        <PortalStatCard title="Active Shipments" value={d?.activeShipments ?? 0} />
        <PortalStatCard title="Pending Invoices" value={d?.pendingInvoices ?? 0} />
        <PortalStatCard title="Outstanding Amount" value={(d?.outstandingAmount ?? 0).toFixed(2)} />
        <PortalStatCard title="Pending Pickups" value={d?.pendingPickups ?? 0} />
      </div>
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/quotations">View Quotations</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/shipment-request">Create Shipment Request</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/pickup-request">Request Pickup</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/tracking">Track Shipments</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/invoices">Invoices</Link>
          <Link className="rounded-md border p-3 hover:bg-slate-50" to="/customer-portal/statement-of-account">Statement of Account</Link>
        </CardContent>
      </Card>
    </div>
  );
}

