import { format } from "date-fns";

export interface DateFormatOptions {
  cultureCode?: string;
  datePattern?: string;
  dateTimePattern?: string;
}

export function formatDate(value: Date | string | number | null | undefined, options?: DateFormatOptions) {
  if (!value) return "-";
  const pattern = options?.datePattern ?? "dd MMM yyyy";
  return format(new Date(value), pattern);
}

export function formatDateTime(value: Date | string | number | null | undefined, options?: DateFormatOptions) {
  if (!value) return "-";
  const pattern = options?.dateTimePattern ?? "dd MMM yyyy HH:mm";
  return format(new Date(value), pattern);
}

export function formatDateRange(
  from: Date | string | number | null | undefined,
  to: Date | string | number | null | undefined,
  options?: DateFormatOptions
) {
  if (!from && !to) return "-";
  if (from && !to) return `${formatDate(from, options)} onward`;
  if (!from && to) return `Until ${formatDate(to, options)}`;
  return `${formatDate(from, options)} - ${formatDate(to, options)}`;
}

export function formatByCulture(value: Date | string | number, cultureCode = "en-US", includeTime = false) {
  return new Intl.DateTimeFormat(cultureCode, includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(new Date(value));
}
