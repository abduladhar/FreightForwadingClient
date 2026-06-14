import { Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMasterDataI18n } from "@/modules/masterDataI18n";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  rightActions?: ReactNode;
  onReset?: () => void;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  placeholder,
  filters,
  rightActions,
  onReset
}: SearchFilterBarProps) {
  const m = useMasterDataI18n("Common");
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input value={search} onChange={(event) => onSearchChange(event.target.value)} className="pl-9" placeholder={placeholder ?? m("Search...")} />
      </div>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2 [&>*]:max-w-full lg:w-auto">
        {filters}
        {onReset ? (
          <Button variant="outline" size="sm" onClick={onReset}>
            <X className="h-4 w-4" /> {m("Reset")}
          </Button>
        ) : null}
      </div>
      {rightActions ? <div className="flex w-full min-w-0 flex-wrap items-center gap-2 [&>*]:max-w-full lg:ml-auto lg:w-auto">{rightActions}</div> : null}
    </div>
  );
}
