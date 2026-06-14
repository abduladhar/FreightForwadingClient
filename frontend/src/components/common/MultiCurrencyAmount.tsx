import { ArrowLeftRight } from "lucide-react";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";

interface MultiCurrencyAmountProps {
  transactionAmount: number;
  transactionCurrency: string;
  baseAmount: number;
  baseCurrency: string;
  className?: string;
}

export function MultiCurrencyAmount({
  transactionAmount,
  transactionCurrency,
  baseAmount,
  baseCurrency,
  className
}: MultiCurrencyAmountProps) {
  return (
    <div className={className}>
      <div className="font-medium">
        <CurrencyAmount value={transactionAmount} currency={transactionCurrency} />
      </div>
      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowLeftRight className="h-3 w-3" />
        <CurrencyAmount value={baseAmount} currency={baseCurrency} />
      </div>
    </div>
  );
}
