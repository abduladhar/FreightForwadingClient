export const currencyPanelClass =
  "rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900";

export const currencyPanelContentClass = "p-4 sm:p-5";

export const currencyButtonClass = "h-10 min-h-10";

export function currencyKey(value: string) {
  return `Currency.${value}`;
}
