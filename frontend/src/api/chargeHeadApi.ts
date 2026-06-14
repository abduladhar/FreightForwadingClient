import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface ChargeHeadDto {
  id: string;
  mappingKey: string;
  mappingName: string;
  ledgerAccountId: string;
  sourceModule: string;
  isActive: boolean;
}

export interface ChargeHeadRequest {
  mappingKey: string;
  mappingName: string;
  ledgerAccountId: string;
  sourceModule: string;
  isActive: boolean;
}

export interface LedgerAccountLookupDto {
  id: string;
  ledgerCode: string;
  ledgerName: string;
  isActive: boolean;
}

export async function searchChargeHeads(params: { pageNumber?: number; pageSize?: number; search?: string; isActive?: boolean; sourceModule?: string }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<ChargeHeadDto>>>("/api/accounting/account-mappings", { params });
  return response.data.data;
}

export async function getActiveChargeHeadsForDropdown(search?: string, sourceModule?: string) {
  const response = await httpClient.get<ApiResponse<PagedResponse<ChargeHeadDto>>>("/api/accounting/account-mappings", {
    params: { pageNumber: 1, pageSize: 500, search, isActive: true, sourceModule }
  });
  return response.data.data.items;
}

export async function upsertChargeHead(request: ChargeHeadRequest) {
  const response = await httpClient.post<ApiResponse<ChargeHeadDto>>("/api/accounting/account-mappings", request);
  return response.data.data;
}

export async function searchLedgerAccounts(params: { pageNumber?: number; pageSize?: number; search?: string; isActive?: boolean }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<LedgerAccountLookupDto>>>("/api/accounting/ledger-accounts", { params });
  return response.data.data;
}
