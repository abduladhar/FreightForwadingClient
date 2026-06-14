import { Coins } from "lucide-react";
import { cn } from "@/utils/cn";

interface CurrencySelectorProps {
  value: string;
  options: string[];
  onChange: (currencyCode: string) => void;
  className?: string;
}

export function CurrencySelector({ value, options, onChange, className }: CurrencySelectorProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-xs text-slate-700", className)}>
      <Coins className="h-4 w-4 text-slate-500" />
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-20 bg-transparent outline-none">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
