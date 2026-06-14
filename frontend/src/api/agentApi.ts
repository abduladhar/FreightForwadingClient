import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface AgentCommissionSettingDto { commissionCurrencyId: string; commissionPercentage: number; minimumCommissionAmount: number; notes?: string | null }
export interface AgentDto {
  id: string;
  agentCode: string;
  agentName: string;
  agentType: string;
  contactPerson?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  country: string;
  city: string;
  taxNumber?: string | null;
  defaultCurrencyId?: string | null;
  isActive: boolean;
  commissionSetting?: AgentCommissionSettingDto | null;
}
export type AgentRequest = Omit<AgentDto, "id">;

export async function searchAgents(params: { pageNumber?: number; pageSize?: number; search?: string; type?: string; country?: string; city?: string; isActive?: boolean }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<AgentDto>>>("/api/agents", { params });
  return response.data.data;
}
export async function getAgent(id: string) { const response = await httpClient.get<ApiResponse<AgentRequest & { id: string }>>(`/api/agents/${id}`); return response.data.data; }
export async function createAgent(request: AgentRequest) { const response = await httpClient.post<ApiResponse<AgentDto>>("/api/agents", request); return response.data.data; }
export async function updateAgent(id: string, request: AgentRequest) { const response = await httpClient.put<ApiResponse<AgentDto>>(`/api/agents/${id}`, request); return response.data.data; }
export async function deleteAgent(id: string) { await httpClient.delete(`/api/agents/${id}`); }
