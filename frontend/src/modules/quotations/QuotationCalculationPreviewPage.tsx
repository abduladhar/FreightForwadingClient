import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import { getQuotation } from "@/api/quotationApi";
import { CalculationBreakdown } from "@/components/common/CalculationBreakdown";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { useQuotationI18n } from "@/modules/quotations/quotationI18n";

export function QuotationCalculationPreviewPage() {
  const q = useQuotationI18n();
  const { quotationId = "" } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["quotation-calc", quotationId], queryFn: () => getQuotation(quotationId), enabled: Boolean(quotationId) });
  const rows = useMemo(() => {
    const data = query.data;
    if (!data) return [];
    return [
      { key: "sub", label: q("Sub Total"), value: data.subTotalAmount },
      { key: "discount", label: q("Discount"), value: -data.discountAmount },
      { key: "tax", label: q("Tax"), value: data.taxAmount },
      { key: "total", label: q("Total"), value: data.totalAmount },
      { key: "target", label: q("Target Currency Total"), value: data.targetCurrencyTotalAmount }
    ];
  }, [q, query.data]);
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${q("Calculation")}: ${query.data.quotationNumber}`}
        description={q("Charge-level calculation and breakdown preview.")}
        actions={<Button className={masterDataButtonClass} variant="outline" onClick={() => void queryClient.invalidateQueries({ queryKey: ["quotation-calc", quotationId] })}><RefreshCcw className="h-4 w-4" /> {q("Refresh")}</Button>}
      />
      <Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><CalculationBreakdown title={q("Quotation Summary")} rows={rows} totalLabel={q("Total")} /></CardContent></Card>
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <h3 className="mb-2 font-medium">{q("Charge Breakdown")}</h3>
          <div className="space-y-2">{query.data.charges.map((charge) => <div key={charge.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{charge.chargeCode} - {charge.chargeName}</p><p className="text-muted-foreground">{charge.calculationBreakdown}</p></div>)}</div>
        </CardContent>
      </Card>
      <Link className="text-sm text-blue-700 hover:underline" to={`/quotations/${quotationId}`}>{q("Back to quotation")}</Link>
    </div>
  );
}
