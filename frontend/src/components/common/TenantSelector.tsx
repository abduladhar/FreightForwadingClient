import { Building2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface TenantOption {
  code: string;
  label: string;
}

interface TenantSelectorProps {
  value: string;
  options: TenantOption[];
  onChange: (tenantCode: string) => void;
  className?: string;
}

export function TenantSelector({ value, options, onChange, className }: TenantSelectorProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-xs text-slate-700", className)}>
      <Building2 className="h-4 w-4 text-slate-500" />
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-24 bg-transparent outline-none">
        {options.map((option) => (
          <option key={option.code} value={option.code}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
