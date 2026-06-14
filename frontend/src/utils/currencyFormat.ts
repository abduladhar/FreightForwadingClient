export interface CurrencyFormatOptions {
  cultureCode?: string;
  currencyCode: string;
  decimalPlaces?: number;
  currencySymbol?: string;
  formatPattern?: "symbol-first" | "code-first" | "symbol-last";
}

export interface CurrencyContext {
  tenantBaseCurrency: string;
  transactionCurrency: string;
  selectedReportCurrency?: string;
  exchangeRate?: number;
  cultureCode?: string;
  decimalPlaces?: number;
}

export function formatCurrencyAmount(amount: number, options: CurrencyFormatOptions) {
  const cultureCode = options.cultureCode ?? "en-US";
  const decimalPlaces = options.decimalPlaces ?? 2;
  const formatter = new Intl.NumberFormat(cultureCode, {
    style: "currency",
    currency: options.currencyCode,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  });

  const formatted = formatter.format(amount);
  if (!options.currencySymbol && !options.formatPattern) return formatted;

  const symbol = options.currencySymbol ?? getCurrencySymbol(options.currencyCode, cultureCode);
  const rawNumber = new Intl.NumberFormat(cultureCode, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(amount);

  switch (options.formatPattern) {
    case "code-first":
      return `${options.currencyCode} ${rawNumber}`;
    case "symbol-last":
      return `${rawNumber} ${symbol}`;
    case "symbol-first":
      return `${symbol} ${rawNumber}`;
    default:
      return formatted;
  }
}

export function formatCurrencyWithContext(amount: number, context: CurrencyContext) {
  const reportCurrency = context.selectedReportCurrency ?? context.transactionCurrency;
  const baseCurrencyAmount =
    context.transactionCurrency === context.tenantBaseCurrency
      ? amount
      : context.exchangeRate
        ? amount * context.exchangeRate
        : amount;

  const reportCurrencyAmount =
    reportCurrency === context.tenantBaseCurrency
      ? baseCurrencyAmount
      : reportCurrency === context.transactionCurrency
        ? amount
        : context.exchangeRate
          ? baseCurrencyAmount / context.exchangeRate
          : baseCurrencyAmount;

  return {
    transaction: formatCurrencyAmount(amount, {
      cultureCode: context.cultureCode,
      currencyCode: context.transactionCurrency,
      decimalPlaces: context.decimalPlaces
    }),
    base: formatCurrencyAmount(baseCurrencyAmount, {
      cultureCode: context.cultureCode,
      currencyCode: context.tenantBaseCurrency,
      decimalPlaces: context.decimalPlaces
    }),
    report: formatCurrencyAmount(reportCurrencyAmount, {
      cultureCode: context.cultureCode,
      currencyCode: reportCurrency,
      decimalPlaces: context.decimalPlaces
    })
  };
}

export function formatExchangeRate(
  rate: number,
  fromCurrency: string,
  toCurrency: string,
  options?: Pick<CurrencyFormatOptions, "cultureCode" | "decimalPlaces">
) {
  const decimals = options?.decimalPlaces ?? 6;
  const value = new Intl.NumberFormat(options?.cultureCode ?? "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(rate);
  return `1 ${fromCurrency} = ${value} ${toCurrency}`;
}

export function getCurrencySymbol(currencyCode: string, cultureCode = "en-US") {
  const sample = (0).toLocaleString(cultureCode, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol"
  });
  return sample.replace(/[\d\s.,-]/g, "").trim() || currencyCode;
}
