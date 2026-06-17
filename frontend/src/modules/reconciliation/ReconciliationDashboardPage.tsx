import { useQuery } from "@tanstack/react-query";
import { getPendingBills, getPendingInvoices, getUnbilledShipments, searchReconciliations } from "@/api/reconciliationApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ResponsiveCardList, ResponsiveRecordCard } from "@/components/common/ResponsiveCardList";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function ReconciliationDashboardPage() {
  const reconciliations = useQuery({ queryKey: ["reconciliation-dashboard"], queryFn: () => searchReconciliations({ pageNumber: 1, pageSize: 10 }) });
  const pendingInvoices = useQuery({ queryKey: ["reconciliation-pending-invoices"], queryFn: () => getPendingInvoices() });
  const pendingBills = useQuery({ queryKey: ["reconciliation-pending-bills"], queryFn: () => getPendingBills() });
  const unbilled = useQuery({ queryKey: ["reconciliation-unbilled"], queryFn: getUnbilledShipments });
  const rows = reconciliations.data?.items ?? [];
  return <div className="space-y-4"><PageHeader title={lt("Reconciliation Dashboard")} description={lt("Pending invoice/bill and shipment profit reconciliation overview.")} actions={<AuditTrailButton />} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title={lt("Pending Invoices")} value={pendingInvoices.data?.length ?? 0} /><Metric title={lt("Pending Bills")} value={pendingBills.data?.length ?? 0} /><Metric title={lt("Unbilled Shipments")} value={unbilled.data?.length ?? 0} /><Metric title={lt("Recent Reconciliations")} value={rows.length} /></div><div><h2 className="mb-3 text-lg font-semibold">{lt("Latest Reconciliation Entries")}</h2><ResponsiveCardList isLoading={reconciliations.isLoading} isError={reconciliations.isError} isEmpty={!rows.length} onRetry={() => void reconciliations.refetch()}>{rows.map((x) => <ResponsiveRecordCard key={x.id} eyebrow={lt(x.reconciliationType)} title={x.reconciliationNumber} badge={lt(x.status)} fields={[{ label: lt("Revenue"), value: <CurrencyAmount value={x.revenueAmount} /> }, { label: lt("Cost"), value: <CurrencyAmount value={x.costAmount} /> }, { label: lt("Profit Difference"), value: <CurrencyAmount value={x.profitDifferenceAmount} />, fullWidth: true }]} />)}</ResponsiveCardList></div></div>;
}

function Metric({ title, value }: { title: string; value: number }) {
  return <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{value}</p></CardContent></Card>;
}
