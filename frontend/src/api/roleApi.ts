import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface RoleDto {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  isSystemRole: boolean;
  permissions: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string | null;
  isSystemRole: boolean;
}

export async function getRoles() {
  const response = await httpClient.get<ApiResponse<RoleDto[]>>("/api/roles");
  return response.data.data ?? [];
}

export async function getRoleById(id: string) {
  const response = await httpClient.get<ApiResponse<RoleDto>>(`/api/roles/${id}`);
  return response.data.data;
}

export async function createRole(request: CreateRoleRequest) {
  const response = await httpClient.post<ApiResponse<RoleDto>>("/api/roles", request);
  return response.data.data;
}

export async function updateRole(id: string, request: UpdateRoleRequest) {
  const response = await httpClient.put<ApiResponse<RoleDto>>(`/api/roles/${id}`, request);
  return response.data.data;
}

export async function deleteRole(id: string) {
  await httpClient.delete(`/api/roles/${id}`);
}

export async function assignPermissionToRole(roleId: string, permissionId: string) {
  await httpClient.post("/api/roles/assign-permission", { roleId, permissionId });
}

export async function assignPermissionsToRole(roleId: string, permissionIds: string[]) {
  await httpClient.post("/api/roles/assign-permissions", { roleId, permissionIds });
}
