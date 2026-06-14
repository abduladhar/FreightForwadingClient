import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface PermissionDto {
  id: string;
  module: string;
  action: string;
  name: string;
  description?: string | null;
}

export async function getPermissions() {
  const response = await httpClient.get<ApiResponse<PermissionDto[]>>("/api/permissions");
  return response.data.data ?? [];
}
