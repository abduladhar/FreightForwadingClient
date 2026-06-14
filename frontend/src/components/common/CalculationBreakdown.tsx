import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CalculationBreakdownRow {
  key: string;
  label: string;
  value: number;
  currency?: string;
}

export function CalculationBreakdown({ title = "Calculation Breakdown", rows, totalCurrency = "USD", totalLabel = "Total" }: { title?: string; rows: CalculationBreakdownRow[]; totalCurrency?: string; totalLabel?: string }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2 text-sm">
            <span>{row.label}</span>
            <CurrencyAmount value={row.value} currency={row.currency ?? totalCurrency} />
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-3 text-sm font-semibold">
          <span>{totalLabel}</span>
          <CurrencyAmount value={total} currency={totalCurrency} />
        </div>
      </CardContent>
    </Card>
  );
}
