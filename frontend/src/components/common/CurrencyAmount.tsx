import { useMoney } from "@/hooks/useMoney";

interface CurrencyAmountProps {
  value: number;
  currency?: string;
  className?: string;
}

export function CurrencyAmount({ value, currency, className }: CurrencyAmountProps) {
  const money = useMoney();
  return <span className={className}>{money(value, currency)}</span>;
}
