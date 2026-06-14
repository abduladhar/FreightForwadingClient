import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getExpectedCostComparison } from "@/api/vendorBillApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function ExpectedCostComparisonPage() {
  const { vendorBillId } = useParams();
  const query = useQuery({ queryKey: ["vendor-bill-expected-cost", vendorBillId], queryFn: () => getExpectedCostComparison(vendorBillId!), enabled: Boolean(vendorBillId) });
  if (!vendorBillId) return <Navigate to="/vendor-bills" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const x = query.data;
  return <div className="space-y-4"><PageHeader title={`${lt("Expected Cost")}: ${x.vendorBillNumber}`} description={lt("Expected vs actual cost comparison with variance.")} actions={<AuditTrailButton />} /><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Metric title={lt("Expected Cost")} value={<CurrencyAmount value={x.expectedCostAmount} />} /><Metric title={lt("Actual Cost")} value={<CurrencyAmount value={x.actualCostAmount} />} /><Metric title={lt("Variance Amount")} value={<CurrencyAmount value={x.varianceAmount} />} /><Metric title={lt("Variance %")} value={`${x.variancePercent.toFixed(2)}%`} /></CardContent></Card></div>;
}

function Metric({ title, value }: { title: string; value: ReactNode }) {
  return <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{title}</p><div className="text-lg font-semibold">{value}</div></div>;
}
