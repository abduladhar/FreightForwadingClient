import { useQuery } from "@tanstack/react-query";
import { getUnbilledShipments } from "@/api/reconciliationApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ResponsiveCardList, ResponsiveRecordCard } from "@/components/common/ResponsiveCardList";
import { PageHeader } from "@/components/PageHeader";

export function ShipmentProfitReconciliationPage() {
  const query = useQuery({ queryKey: ["shipment-profit-reconciliation"], queryFn: getUnbilledShipments });
  const rows = query.data ?? [];
  return <div className="space-y-4"><PageHeader title="Shipment Profit Reconciliation" description="Review unbilled shipments and revenue/cost differences." actions={<AuditTrailButton />} /><ResponsiveCardList isLoading={query.isLoading} isError={query.isError} isEmpty={!rows.length} onRetry={() => void query.refetch()}>{rows.map((x) => <ResponsiveRecordCard key={x.shipmentId} eyebrow={x.shipmentType} title={x.shipmentNumber} fields={[{ label: "Revenue", value: <CurrencyAmount value={x.revenueAmount} /> }, { label: "Cost", value: <CurrencyAmount value={x.costAmount} /> }, { label: "Margin", value: <CurrencyAmount value={x.revenueAmount - x.costAmount} />, fullWidth: true }]} />)}</ResponsiveCardList></div>;
}
