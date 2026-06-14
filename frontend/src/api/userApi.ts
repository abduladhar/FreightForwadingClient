import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface UserDto {
  id: string;
  tenantId: string;
  branchId?: string | null;
  employeeId?: string | null;
  employeeCode?: string | null;
  employeeName?: string | null;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isLocked: boolean;
  roles: string[];
}

export interface CreateUserRequest {
  branchId?: string | null;
  employeeId?: string | null;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  password: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  branchId?: string | null;
  employeeId?: string | null;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export async function getUsers() {
  const response = await httpClient.get<ApiResponse<UserDto[]>>("/api/users");
  return response.data.data ?? [];
}

export async function getUserById(id: string) {
  const response = await httpClient.get<ApiResponse<UserDto>>(`/api/users/${id}`);
  return response.data.data;
}

export async function createUser(request: CreateUserRequest) {
  const response = await httpClient.post<ApiResponse<UserDto>>("/api/users", request);
  return response.data.data;
}

export async function updateUser(id: string, request: UpdateUserRequest) {
  const response = await httpClient.put<ApiResponse<UserDto>>(`/api/users/${id}`, request);
  return response.data.data;
}

export async function deleteUser(id: string) {
  await httpClient.delete(`/api/users/${id}`);
}

export async function assignRoleToUser(userId: string, roleId: string) {
  await httpClient.post("/api/users/assign-role", { userId, roleId });
}
