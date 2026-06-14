import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";
import type { CreateCurrencyRequest, Currency, CurrencyConversionResponse, CurrencyUpsertRequest, ExchangeRate, ExchangeRateUpsertRequest, TenantCurrency } from "@/types/currency";

export async function getCurrencies() {
  const response = await httpClient.get<ApiResponse<Currency[]>>("/api/currencies", {
    headers: { "X-Suppress-Error-Toast": "true" }
  });
  return response.data.data ?? [];
}

export async function getTenantCurrencies() {
  const response = await httpClient.get<ApiResponse<TenantCurrency[]>>("/api/currencies/tenant", {
    headers: { "X-Suppress-Error-Toast": "true" }
  });
  return response.data.data ?? [];
}

export async function createCurrency(request: CreateCurrencyRequest) {
  const response = await httpClient.post<ApiResponse<Currency>>("/api/currencies", request);
  return response.data.data;
}

export async function updateCurrency(id: string, request: Omit<CurrencyUpsertRequest, "currencyCode">) {
  const response = await httpClient.put<ApiResponse<Currency>>(`/api/currencies/${id}`, request);
  return response.data.data;
}

export async function deleteCurrency(id: string) {
  await httpClient.delete(`/api/currencies/${id}`);
}

export async function setTenantCurrency(currencyId: string, isEnabled: boolean, isBaseCurrency: boolean) {
  const response = await httpClient.post<ApiResponse<TenantCurrency>>("/api/currencies/tenant", { currencyId, isEnabled, isBaseCurrency });
  return response.data.data;
}

export async function getExchangeRates(fromCurrencyId?: string, toCurrencyId?: string) {
  const response = await httpClient.get<ApiResponse<ExchangeRate[]>>("/api/currencies/exchange-rates", {
    params: { fromCurrencyId, toCurrencyId }
  });
  return response.data.data ?? [];
}

export async function upsertExchangeRate(request: ExchangeRateUpsertRequest) {
  const response = await httpClient.post<ApiResponse<ExchangeRate>>("/api/currencies/exchange-rates", request);
  return response.data.data;
}

export async function convertCurrency(request: { fromCurrencyId: string; toCurrencyId: string; amount: number; rateDate?: string | null; sourceModule?: string | null; referenceNumber?: string | null }) {
  const response = await httpClient.post<ApiResponse<CurrencyConversionResponse>>("/api/currencies/convert", request);
  return response.data.data;
}

export async function createCurrencyRevaluation(request: { currencyId: string; revaluationDate: string; originalAmount: number; revaluedAmount: number; differenceAmount: number; sourceDocumentType: string; sourceDocumentId: string }) {
  const response = await httpClient.post("/api/currencies/revaluations", request);
  return response.data.data;
}
