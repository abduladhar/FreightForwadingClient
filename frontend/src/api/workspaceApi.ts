import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface TenantOptionDto {
  id?: string;
  code: string;
  tenantCode?: string;
  name?: string;
  tenantName?: string;
}

export interface BranchOptionDto {
  id: string;
  branchId?: string;
  code: string;
  branchCode?: string;
  name: string;
  branchName?: string;
}

export interface LanguageOptionDto {
  id?: string;
  languageCode: string;
  cultureCode: string;
  displayName?: string;
  name?: string;
}

export interface CurrencyOptionDto {
  id?: string;
  currencyId?: string;
  currencyCode: string;
  code?: string;
  currencyName?: string;
  name?: string;
}

export function useTenantOptionsQuery(fallbackTenantCode: string) {
  return useQuery({
    queryKey: ["workspace", "tenants"],
    queryFn: async () => {
      try {
        const response = await httpClient.get<ApiResponse<TenantOptionDto[]>>("/api/tenants", {
          headers: { "X-Suppress-Error-Toast": "true" }
        });
        const items = response.data.data ?? [];
        if (!items.length) return [{ code: fallbackTenantCode, label: fallbackTenantCode }];
        return items.map((tenant) => {
          const code = tenant.tenantCode ?? tenant.code;
          const name = tenant.tenantName ?? tenant.name ?? code;
          return { code, label: `${code} - ${name}` };
        });
      } catch {
        return [{ code: fallbackTenantCode, label: fallbackTenantCode }];
      }
    }
  });
}

export function useBranchOptionsQuery(tenantCode: string, fallbackBranchId?: string, fallbackBranchName?: string) {
  return useQuery({
    queryKey: ["workspace", "branches", tenantCode],
    queryFn: async () => {
      try {
        const response = await httpClient.get<ApiResponse<BranchOptionDto[]>>("/api/branches", {
          headers: { "X-Suppress-Error-Toast": "true" }
        });
        const items = response.data.data ?? [];
        if (!items.length && fallbackBranchId) {
          return [{ id: fallbackBranchId, label: fallbackBranchName ?? fallbackBranchId }];
        }
        return items.map((branch) => {
          const id = branch.branchId ?? branch.id;
          const code = branch.branchCode ?? branch.code;
          const name = branch.branchName ?? branch.name ?? code;
          return { id, label: `${code} - ${name}` };
        });
      } catch {
        return fallbackBranchId ? [{ id: fallbackBranchId, label: fallbackBranchName ?? fallbackBranchId }] : [];
      }
    },
    enabled: Boolean(tenantCode)
  });
}

export function useLanguageOptionsQuery(fallbackLanguageCode: string, fallbackCultureCode: string) {
  return useQuery({
    queryKey: ["workspace", "languages"],
    queryFn: async () => {
      try {
        const response = await httpClient.get<ApiResponse<LanguageOptionDto[]>>("/api/languages", {
          headers: { "X-Suppress-Error-Toast": "true" }
        });
        const items = response.data.data ?? [];
        if (!items.length) return [{ code: fallbackLanguageCode, culture: fallbackCultureCode, label: fallbackLanguageCode }];
        return items.map((language) => ({
          code: language.languageCode,
          culture: language.cultureCode,
          label: language.displayName ?? language.name ?? language.languageCode
        }));
      } catch {
        return [{ code: fallbackLanguageCode, culture: fallbackCultureCode, label: fallbackLanguageCode }];
      }
    }
  });
}

export function useCurrencyOptionsQuery(fallbackCurrencyCode: string) {
  return useQuery({
    queryKey: ["workspace", "currencies"],
    queryFn: async () => {
      try {
        const response = await httpClient.get<ApiResponse<CurrencyOptionDto[]>>("/api/currencies", {
          headers: { "X-Suppress-Error-Toast": "true" }
        });
        const items = response.data.data ?? [];
        if (!items.length) return [fallbackCurrencyCode];
        return items.map((currency) => currency.currencyCode ?? currency.code ?? fallbackCurrencyCode);
      } catch {
        return [fallbackCurrencyCode];
      }
    }
  });
}
