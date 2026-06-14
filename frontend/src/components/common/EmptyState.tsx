import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { useMasterDataI18n } from "@/modules/masterDataI18n";

export function EmptyState({
  title,
  description,
  action
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  const m = useMasterDataI18n("Common");
  return (
    <div className="flex min-h-[220px] min-w-0 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900 sm:p-8">
      <Inbox className="mb-3 h-8 w-8 text-slate-400" />
      <p className="break-words text-base font-semibold text-gray-900 dark:text-gray-100">{title ?? m("No data found")}</p>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description ?? m("There are no records to show for the selected filters.")}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
