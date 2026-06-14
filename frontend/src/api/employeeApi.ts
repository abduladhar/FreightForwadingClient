import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface DesignationDto {
  id: string;
  serialNo: number;
  designationCode: string;
  designationName: string;
  description: string;
  isActive: boolean;
}

export interface EmployeeDto {
  id: string;
  serialNo: number;
  branchId?: string | null;
  designationId: string;
  designationCode: string;
  designationName: string;
  parentEmployeeGuid?: string | null;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  joiningDate?: string | null;
  isSalesman: boolean;
  isActive: boolean;
  userId?: string | null;
  userName?: string | null;
}

export interface EmployeeRequest {
  branchId?: string | null;
  designationId: string;
  parentEmployeeGuid?: string | null;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  joiningDate?: string | null;
  isSalesman: boolean;
  isActive: boolean;
}

export async function getEmployees(activeOnly = false, salesmenOnly = false) {
  const response = await httpClient.get<ApiResponse<EmployeeDto[]>>("/api/employees", { params: { activeOnly, salesmenOnly } });
  return response.data.data ?? [];
}
export async function getEmployee(id: string) { const response = await httpClient.get<ApiResponse<EmployeeDto>>(`/api/employees/${id}`); return response.data.data; }
export async function createEmployee(request: EmployeeRequest) { const response = await httpClient.post<ApiResponse<EmployeeDto>>("/api/employees", request); return response.data.data; }
export async function updateEmployee(id: string, request: EmployeeRequest) { const response = await httpClient.put<ApiResponse<EmployeeDto>>(`/api/employees/${id}`, request); return response.data.data; }
export async function deleteEmployee(id: string) { await httpClient.delete(`/api/employees/${id}`); }
export async function getDesignations(activeOnly = false) { const response = await httpClient.get<ApiResponse<DesignationDto[]>>("/api/designations", { params: { activeOnly } }); return response.data.data ?? []; }
export async function createDesignation(request: Omit<DesignationDto, "id" | "serialNo">) { const response = await httpClient.post<ApiResponse<DesignationDto>>("/api/designations", request); return response.data.data; }
export async function updateDesignation(id: string, request: Omit<DesignationDto, "id" | "serialNo">) { const response = await httpClient.put<ApiResponse<DesignationDto>>(`/api/designations/${id}`, request); return response.data.data; }
export async function deleteDesignation(id: string) { await httpClient.delete(`/api/designations/${id}`); }
