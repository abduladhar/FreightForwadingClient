import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Banknote,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileClock,
  FileText,
  PackageCheck,
  Receipt,
  Truck
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useDashboardQuery } from "@/api/dashboardApi";
import { useCurrency } from "@/hooks/useCurrency";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

const pieColors = ["#2563eb", "#16a34a", "#d97706", "#0f766e", "#9333ea", "#dc2626", "#475569"];

export function DashboardPage() {
  useDocumentTitle(lt("Dashboard"));
  const language = useLanguage();
  const currency = useCurrency();
  const dashboardQuery = useDashboardQuery({ pageNumber: 1, pageSize: 50 });
  const payload = dashboardQuery.data?.data;

  const formatAmount = (amount: number) => currency.formatAmount(amount, currency.selectedCurrencyCode);
  const formatCount = (count: number) => language.formatLocalizedNumber(count, 0);

  const monthlySeries = (payload?.monthlyRevenue ?? []).map((item) => ({
    label: item.label,
    revenue: item.amount,
    cost: payload?.monthlyCost.find((x) => x.key === item.key)?.amount ?? 0,
    profit: payload?.monthlyProfit.find((x) => x.key === item.key)?.amount ?? 0
  }));

  const receivablePayableSeries = (payload?.currencyWiseReceivables ?? []).map((item) => ({
    currency: item.label,
    receivable: item.amount,
    payable: payload?.currencyWisePayables.find((x) => x.key === item.key || x.label === item.label)?.amount ?? 0
  }));

  const kpis = [
    { id: "total-quotations", label: lt("Total quotations"), value: formatCount(payload?.totalQuotations ?? 0), icon: FileText, tone: "text-blue-700", link: "/quotation" },
    { id: "pending-quotations", label: lt("Pending quotations"), value: formatCount(payload?.pendingQuotations ?? 0), icon: Clock3, tone: "text-amber-700", link: "/quotation" },
    { id: "approved-quotations", label: lt("Approved quotations"), value: formatCount(payload?.approvedQuotations ?? 0), icon: CheckCircle2, tone: "text-emerald-700", link: "/quotation" },
    { id: "goods-received", label: lt("Goods received"), value: formatCount(payload?.goodsReceived ?? 0), icon: Boxes, tone: "text-indigo-700", link: "/goods-receipt" },
    { id: "warehouse-stock", label: lt("Warehouse stock"), value: formatCount(payload?.warehouseStock ?? 0), icon: PackageCheck, tone: "text-cyan-700", link: "/warehouse" },
    { id: "shipments-in-transit", label: lt("Shipments in transit"), value: formatCount(payload?.shipmentsInTransit ?? 0), icon: Truck, tone: "text-violet-700", link: "/house-shipment" },
    { id: "delivered-shipments", label: lt("Delivered shipments"), value: formatCount(payload?.deliveredShipments ?? 0), icon: ClipboardCheck, tone: "text-green-700", link: "/direct-shipment" },
    { id: "pending-customer-invoices", label: lt("Pending customer invoices"), value: formatCount(payload?.pendingCustomerInvoices ?? 0), icon: Receipt, tone: "text-orange-700", link: "/invoice" },
    { id: "pending-vendor-bills", label: lt("Pending vendor bills"), value: formatCount(payload?.pendingVendorBills ?? 0), icon: FileClock, tone: "text-rose-700", link: "/vendor-bill" },
    { id: "customer-outstanding", label: lt("Customer outstanding"), value: formatAmount(payload?.customerOutstanding ?? 0), icon: Banknote, tone: "text-emerald-700", link: "/reports" },
    { id: "vendor-outstanding", label: lt("Vendor outstanding"), value: formatAmount(payload?.vendorOutstanding ?? 0), icon: Banknote, tone: "text-red-700", link: "/reports" },
    { id: "monthly-profit", label: lt("Monthly profit"), value: formatAmount((payload?.monthlyProfit ?? []).reduce((sum, item) => sum + item.amount, 0)), icon: Activity, tone: "text-blue-700", link: "/reports" }
  ];

  const timelineEntries = [
    { label: lt("Pending approvals in queue"), value: payload?.pendingApprovals ?? 0 },
    { label: lt("Pending POD follow-up"), value: payload?.pendingPod ?? 0 },
    { label: lt("Pending shipment documents"), value: payload?.pendingDocuments ?? 0 },
    { label: lt("Delivered shipments recorded"), value: payload?.deliveredShipments ?? 0 }
  ];

  return (
    <div className="erp-page space-y-5">
      <PageHeader
        title={lt("Dashboard")}
        description={lt("Operations, shipment, and finance intelligence for the selected tenant and branch.")}
        showBreadcrumbs
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>{kpi.label}</span>
                <kpi.icon className={`h-4 w-4 ${kpi.tone}`} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{kpi.value}</p>
              <Link to={kpi.link} className="inline-flex items-center text-xs font-medium text-blue-700 hover:text-blue-600">
                {lt("View details")} <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 2xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{lt("Monthly revenue, cost, and profit")}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => language.formatLocalizedNumber(Number(v), 0)} />
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name={lt("Revenue")} stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cost" name={lt("Cost")} stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" name={lt("Profit")} stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lt("Shipment status distribution")}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={payload?.shipmentStatusChart ?? []} nameKey="label" dataKey="count" innerRadius={56} outerRadius={100} paddingAngle={2}>
                  {(payload?.shipmentStatusChart ?? []).map((entry, index) => (
                    <Cell key={entry.key} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{lt("Currency-wise receivables and payables")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receivablePayableSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="currency" />
                <YAxis tickFormatter={(v) => language.formatLocalizedNumber(Number(v), 0)} />
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Legend />
                <Bar dataKey="receivable" name={lt("Receivable")} fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payable" name={lt("Payable")} fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lt("Salesman performance")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payload?.salesmanPerformance ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => language.formatLocalizedNumber(Number(v), 0)} />
                <YAxis type="category" width={130} dataKey="label" />
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Bar dataKey="amount" name={lt("Amount")} fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{lt("Top customers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(payload?.topCustomers ?? []).slice(0, 8).map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{formatAmount(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lt("Top destinations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(payload?.topDestinations ?? []).slice(0, 8).map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <Badge tone="blue">{formatCount(item.count)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lt("Pending action queue")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-amber-100 bg-amber-50 px-3 py-2">
              <span className="text-sm font-medium text-amber-900">{lt("Pending approvals")}</span>
              <Badge tone="amber">{formatCount(payload?.pendingApprovals ?? 0)}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
              <span className="text-sm font-medium text-blue-900">{lt("Pending POD")}</span>
              <Badge tone="blue">{formatCount(payload?.pendingPod ?? 0)}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-rose-100 bg-rose-50 px-3 py-2">
              <span className="text-sm font-medium text-rose-900">{lt("Pending documents")}</span>
              <Badge tone="red">{formatCount(payload?.pendingDocuments ?? 0)}</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{lt("Recent activity timeline")}</CardTitle>
          <Button variant="outline" asChild>
            <Link to="/audit-logs">{lt("Open audit logs")}</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {timelineEntries.map((entry) => (
            <div key={entry.label} className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <p className="text-sm text-slate-700">{entry.label}: {formatCount(entry.value)}</p>
            </div>
          ))}
          {dashboardQuery.isLoading ? <p className="text-sm text-muted-foreground">{lt("Loading dashboard activity...")}</p> : null}
          {dashboardQuery.isError ? <p className="text-sm text-red-600">{lt("Unable to load dashboard data for the current filters.")}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
