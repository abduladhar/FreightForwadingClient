import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMasterDataI18n } from "@/modules/masterDataI18n";

export function ErrorState({
  title,
  description,
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const m = useMasterDataI18n("Common");
  return (
    <div className="flex min-h-[220px] min-w-0 flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900 dark:bg-red-950/20 sm:p-8">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-600" />
      <p className="break-words text-base font-semibold text-gray-900 dark:text-gray-100">{title ?? m("Something went wrong")}</p>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description ?? m("We could not load this data. Please retry.")}</p>
      {onRetry ? <Button className="mt-4" variant="outline" onClick={onRetry}>{m("Retry")}</Button> : null}
    </div>
  );
}
