import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getHouseShipmentProfitPreview } from "@/api/houseShipmentApi";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function HouseShipmentProfitPreviewPage() {
  const { shipmentId } = useParams();
  const query = useQuery({ queryKey: ["house-shipment-profit", shipmentId], queryFn: () => getHouseShipmentProfitPreview(shipmentId!), enabled: Boolean(shipmentId) });
  if (!shipmentId) return <Navigate to="/house-shipments" replace />;
  const profit = query.data;
  return <div className="space-y-4">
    <PageHeader title={lt("House Shipment Profit Preview")} description={lt("Revenue, cost, gross profit, and margin for this shipment.")} />
    <Card><CardContent className="grid gap-4 pt-6 md:grid-cols-4">
      <Metric label={lt("Revenue")} value={<CurrencyAmount value={profit?.revenueAmount ?? 0} />} />
      <Metric label={lt("Cost")} value={<CurrencyAmount value={profit?.costAmount ?? 0} />} />
      <Metric label={lt("Profit")} value={<CurrencyAmount value={profit?.profitAmount ?? 0} />} />
      <Metric label={lt("Margin %")} value={(profit?.profitMarginPercent ?? 0).toFixed(2)} />
    </CardContent></Card>
  </div>;
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="text-lg font-semibold">{value}</div></div>;
}
