import { Building } from "lucide-react";
import { cn } from "@/utils/cn";

export interface BranchOption {
  id: string;
  label: string;
}

interface BranchSelectorProps {
  value?: string;
  options: BranchOption[];
  onChange: (branchId: string) => void;
  className?: string;
}

export function BranchSelector({ value, options, onChange, className }: BranchSelectorProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-xs text-slate-700", className)}>
      <Building className="h-4 w-4 text-slate-500" />
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-24 bg-transparent outline-none">
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
