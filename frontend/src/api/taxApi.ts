import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface TaxRuleDto {
  id: string;
  ledgerAccountId: string;
  taxCode: string;
  taxName: string;
  taxRate: number;
  isRecoverable: boolean;
  isActive: boolean;
}

export interface TaxRuleRequest {
  ledgerAccountId: string;
  taxCode: string;
  taxName: string;
  taxRate: number;
  isRecoverable: boolean;
  isActive: boolean;
}

export async function searchTaxRules(params: { pageNumber?: number; pageSize?: number; search?: string; isActive?: boolean }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<TaxRuleDto>>>("/api/accounting/tax-ledgers", { params });
  return response.data.data;
}

export async function upsertTaxRule(request: TaxRuleRequest) {
  const response = await httpClient.post<ApiResponse<TaxRuleDto>>("/api/accounting/tax-ledgers", request);
  return response.data.data;
}
