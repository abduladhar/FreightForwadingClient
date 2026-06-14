import type { ReactNode } from "react";
import { useI18n } from "@/app/i18n";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { cn } from "@/utils/cn";
import { localizationKey } from "@/utils/localizationKey";

interface ResponsiveCardListProps {
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  className?: string;
}

interface ResponsiveRecordCardProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  badge?: ReactNode;
  fields: Array<{
    label: ReactNode;
    value: ReactNode;
    fullWidth?: boolean;
  }>;
  actions?: ReactNode;
  className?: string;
}

export function ResponsiveCardList({
  children,
  isLoading,
  isError,
  isEmpty,
  emptyText,
  onRetry,
  className
}: ResponsiveCardListProps) {
  const { t } = useI18n();
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="min-h-48 animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="h-5 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-5 space-y-3">
              <div className="h-4 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (isEmpty) {
    const title = emptyText
      ? t(`Ui.Message.${localizationKey(emptyText)}`, emptyText)
      : t("Common.NoRecords", "No records found");
    return <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"><EmptyState title={title} /></div>;
  }
  return <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>{children}</div>;
}

export function ResponsiveRecordCard({ title, eyebrow, badge, fields, actions, className }: ResponsiveRecordCardProps) {
  const { t } = useI18n();
  return (
    <article className={cn("flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900", className)}>
      <div className="flex min-w-0 items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
        <div className="min-w-0">
          {eyebrow ? <div className="break-words text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{eyebrow}</div> : null}
          <h2 className="mt-1 break-words text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
      <dl className="flex flex-1 flex-col">
        {fields.map((field, index) => (
          <div key={index} className={cn("flex min-w-0 flex-col gap-1 border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800", field.fullWidth && "w-full")}>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {typeof field.label === "string" ? t(`Ui.Label.${localizationKey(field.label)}`, field.label) : field.label}
            </dt>
            <dd className="break-words text-sm font-semibold text-gray-900 dark:text-gray-100">{field.value}</dd>
          </div>
        ))}
      </dl>
      {actions ? <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 [&_a]:inline-flex [&_a]:min-h-10 [&_a]:items-center [&_a]:justify-center [&_a]:rounded-lg [&_a]:border [&_a]:border-gray-300 [&_a]:px-3 [&_a]:py-2 [&_a]:text-sm [&_a]:font-medium [&_a]:transition [&_a]:hover:bg-gray-50 dark:[&_a]:border-gray-700 dark:[&_a]:hover:bg-gray-800 [&_button]:min-h-10 [&_button]:rounded-lg [&_button]:border [&_button]:border-gray-300 [&_button]:px-3 [&_button]:py-2 [&_button]:text-sm [&_button]:font-medium [&_button]:transition [&_button]:hover:bg-gray-50 dark:[&_button]:border-gray-700 dark:[&_button]:hover:bg-gray-800">{actions}</div> : null}
    </article>
  );
}
