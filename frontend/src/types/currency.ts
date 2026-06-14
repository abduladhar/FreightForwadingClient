export interface Currency {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  decimalPlaces: number;
  roundingPrecision: number;
  formatPattern: string;
  countryRegion?: string | null;
  isActive: boolean;
}

export interface TenantCurrency {
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  isEnabled: boolean;
  isBaseCurrency: boolean;
}

export interface CurrencyUpsertRequest {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  decimalPlaces: number;
  roundingPrecision: number;
  formatPattern: string;
  countryRegion?: string | null;
  isActive: boolean;
  defaultExchangeRateToBaseCurrency?: number | null;
  defaultExchangeRateEffectiveDate?: string | null;
}

export type CreateCurrencyRequest = CurrencyUpsertRequest;

export interface ExchangeRate {
  id: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  effectiveDate: string;
  isManualOverride: boolean;
  overrideReason?: string | null;
}

export interface ExchangeRateUpsertRequest {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  effectiveDate: string;
  providerId?: string | null;
  isManualOverride: boolean;
  overrideReason?: string | null;
}

export interface CurrencyConversionResponse {
  sourceAmount: number;
  convertedAmount: number;
  rate: number;
  rateDate: string;
  formattedAmount: string;
}
