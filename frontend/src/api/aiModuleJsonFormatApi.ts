import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface AiModuleJsonFormatDto {
  id: string;
  tenantId: string;
  branchId?: string | null;
  moduleCode: string;
  moduleName: string;
  documentType?: string | null;
  jsonFormat: string;
  systemPrompt?: string | null;
  mappingJson?: string | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface AiModuleJsonFormatRequest {
  id?: string | null;
  branchId?: string | null;
  moduleCode: string;
  moduleName: string;
  documentType?: string | null;
  jsonFormat: string;
  systemPrompt?: string | null;
  mappingJson?: string | null;
  isDefault: boolean;
  isActive: boolean;
}

const basePath = "/api/ai-module-json-formats";

export async function getAiModuleJsonFormat(moduleCode: string) {
  const response = await httpClient.get<ApiResponse<AiModuleJsonFormatDto>>(`${basePath}/module/${moduleCode}`);
  return response.data.data;
}

export async function searchAiModuleJsonFormats(params?: { moduleCode?: string; documentType?: string; isActive?: boolean }) {
  const response = await httpClient.get<ApiResponse<AiModuleJsonFormatDto[]>>(basePath, { params });
  return response.data.data ?? [];
}

export async function saveAiModuleJsonFormat(request: AiModuleJsonFormatRequest) {
  const response = await httpClient.post<ApiResponse<AiModuleJsonFormatDto>>(basePath, request);
  return response.data.data;
}

export async function deleteAiModuleJsonFormat(id: string) {
  await httpClient.delete(`${basePath}/${id}`);
}
