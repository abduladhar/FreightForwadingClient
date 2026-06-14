import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getDirectShipmentProfitPreview } from "@/api/directShipmentApi";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function DirectShipmentProfitPreviewPage() {
  const { directShipmentId } = useParams();
  const query = useQuery({ queryKey: ["direct-shipment-profit", directShipmentId], queryFn: () => getDirectShipmentProfitPreview(directShipmentId!), enabled: Boolean(directShipmentId) });
  if (!directShipmentId) return <Navigate to="/direct-shipments" replace />;
  const p = query.data;
  return <div className="space-y-4">
    <PageHeader title={lt("Direct Shipment Profit Preview")} description={lt("Revenue, cost, profit, and margin for this direct shipment.")} />
    <Card><CardContent className="grid gap-4 pt-6 md:grid-cols-4">
      <Metric label={lt("Revenue")} value={<CurrencyAmount value={p?.revenueAmount ?? 0} />} />
      <Metric label={lt("Cost")} value={<CurrencyAmount value={p?.costAmount ?? 0} />} />
      <Metric label={lt("Profit")} value={<CurrencyAmount value={p?.profitAmount ?? 0} />} />
      <Metric label={lt("Margin %")} value={(p?.profitMarginPercent ?? 0).toFixed(2)} />
    </CardContent></Card>
  </div>;
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="text-lg font-semibold">{value}</div></div>;
}
