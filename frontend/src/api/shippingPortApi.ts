import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface ShippingPortDto {
  id: string;
  portCode: string;
  portName: string;
  countryGuid: string;
  countryName: string;
  portType: string;
  isActive: boolean;
}

export interface ShippingPortRequest {
  portCode: string;
  portName: string;
  countryGuid: string;
  countryName: string;
  portType: string;
  isActive: boolean;
}

export interface ShippingPortSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  portCode?: string;
  portName?: string;
  countryName?: string;
  portType?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export async function searchShippingPorts(params: ShippingPortSearchParams) {
  const search = params.search?.trim() || undefined;
  const response = await httpClient.get<ApiResponse<PagedResponse<ShippingPortDto>>>("/api/shipping-ports/search-shipping-ports", {
    params: {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: [search, params.portCode, params.portName, params.countryName].filter(Boolean).join(" ").trim() || undefined,
      portType: params.portType || undefined,
      isActive: params.isActive,
      sortBy: params.sortBy ?? "CreatedDate",
      sortDirection: params.sortDirection ?? "desc"
    }
  });
  return response.data.data;
}

export async function getShippingPortByGuid(id: string) {
  const response = await httpClient.get<ApiResponse<ShippingPortDto>>(`/api/shipping-ports/get-shipping-port-by-guid/${id}`);
  return response.data.data;
}

export async function createShippingPort(request: ShippingPortRequest) {
  const response = await httpClient.post<ApiResponse<ShippingPortDto>>("/api/shipping-ports/create-shipping-port", request);
  return response.data.data;
}

export async function updateShippingPort(id: string, request: ShippingPortRequest) {
  const response = await httpClient.put<ApiResponse<ShippingPortDto>>(`/api/shipping-ports/update-shipping-port/${id}`, request);
  return response.data.data;
}

export async function deleteShippingPort(id: string) {
  await httpClient.delete(`/api/shipping-ports/delete-shipping-port/${id}`);
}

export async function getActiveShippingPortsForDropdown(search?: string, portType?: string) {
  const response = await httpClient.get<ApiResponse<ShippingPortDto[]>>("/api/shipping-ports/active-dropdown", {
    params: {
      search: search || undefined,
      portType: portType || undefined
    }
  });
  return response.data.data;
}
