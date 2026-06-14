import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface PackageTypeDto {
  id: string;
  packageCode: string;
  packageName: string;
  description?: string | null;
  isActive: boolean;
}

export interface PackageTypeRequest {
  packageCode: string;
  packageName: string;
  description?: string | null;
  isActive: boolean;
}

export interface PackageTypeSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  packageCode?: string;
  packageName?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export async function searchPackageTypes(params: PackageTypeSearchParams) {
  const search = params.search?.trim() || undefined;
  const response = await httpClient.get<ApiResponse<PagedResponse<PackageTypeDto>>>("/api/package-types/search-package-types", {
    params: {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: [search, params.packageCode, params.packageName].filter(Boolean).join(" ").trim() || undefined,
      isActive: params.isActive,
      sortBy: params.sortBy ?? "CreatedDate",
      sortDirection: params.sortDirection ?? "desc"
    }
  });
  return response.data.data;
}

export async function getPackageTypeByGuid(id: string) {
  const response = await httpClient.get<ApiResponse<PackageTypeDto>>(`/api/package-types/get-package-type-by-guid/${id}`);
  return response.data.data;
}

export async function createPackageType(request: PackageTypeRequest) {
  const response = await httpClient.post<ApiResponse<PackageTypeDto>>("/api/package-types/create-package-type", request);
  return response.data.data;
}

export async function updatePackageType(id: string, request: PackageTypeRequest) {
  const response = await httpClient.put<ApiResponse<PackageTypeDto>>(`/api/package-types/update-package-type/${id}`, request);
  return response.data.data;
}

export async function deletePackageType(id: string) {
  await httpClient.delete(`/api/package-types/delete-package-type/${id}`);
}

export async function getActivePackageTypesForDropdown(search?: string) {
  const response = await httpClient.get<ApiResponse<PackageTypeDto[]>>("/api/package-types/active-dropdown", { params: { search } });
  return response.data.data;
}
