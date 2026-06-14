import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";
import type { Tenant, TenantOption, TenantSettings, TenantSettingsUpdateRequest, TenantUpsertRequest } from "@/types/tenant";

export async function getTenants() {
  const response = await httpClient.get<ApiResponse<Tenant[]>>("/api/tenants", {
    headers: { "X-Suppress-Error-Toast": "true" }
  });
  return response.data.data ?? [];
}

export async function getTenantOptions(): Promise<TenantOption[]> {
  const tenants = await getTenants();
  return tenants.map((tenant) => ({
    id: tenant.tenantId,
    code: tenant.tenantCode,
    name: tenant.tenantName
  }));
}

export async function resolveTenantIdByCode(tenantCode: string) {
  const normalized = tenantCode.trim().toLowerCase();
  if (!normalized) return null;

  try {
    const tenants = await getTenants();
    return tenants.find((tenant) => tenant.tenantCode.trim().toLowerCase() === normalized)?.tenantId ?? null;
  } catch {
    return null;
  }
}

export async function getTenantById(tenantId: string) {
  const response = await httpClient.get<ApiResponse<Tenant>>(`/api/tenants/${tenantId}`);
  return response.data.data;
}

export async function createTenant(request: TenantUpsertRequest) {
  const response = await httpClient.post<ApiResponse<Tenant>>("/api/tenants", request);
  return response.data.data;
}

export async function updateTenant(tenantId: string, request: TenantUpsertRequest) {
  const response = await httpClient.put<ApiResponse<Tenant>>(`/api/tenants/${tenantId}`, request);
  return response.data.data;
}

export async function deleteTenant(tenantId: string) {
  await httpClient.delete(`/api/tenants/${tenantId}`);
}

export async function getTenantSettings(tenantId: string) {
  const response = await httpClient.get<ApiResponse<TenantSettings>>(`/api/tenants/${tenantId}/settings`);
  return response.data.data;
}

export async function updateTenantSettings(tenantId: string, request: TenantSettingsUpdateRequest) {
  const response = await httpClient.put<ApiResponse<TenantSettings>>(`/api/tenants/${tenantId}/settings`, request);
  return response.data.data;
}
