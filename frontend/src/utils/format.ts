import { formatCurrencyAmount } from "@/utils/currencyFormat";
import { formatDate } from "@/utils/dateFormat";

export function formatCurrency(value: number, currency = "USD") {
  return formatCurrencyAmount(value, {
    currencyCode: currency,
    cultureCode: "en-US",
    decimalPlaces: 0
  });
}

export function formatShortDate(value: string | Date, pattern = "dd MMM yyyy") {
  return formatDate(value, { datePattern: pattern });
}
