import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface CarrierDto {
  id: string;
  carrierCode: string;
  carrierName: string;
  carrierType: string;
  contactPerson?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  country: string;
  city: string;
  taxNumber?: string | null;
  defaultCurrencyId?: string | null;
  isActive: boolean;
}
export type CarrierRequest = Omit<CarrierDto, "id">;

export async function searchCarriers(params: { pageNumber?: number; pageSize?: number; search?: string; type?: string; country?: string; city?: string; isActive?: boolean }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<CarrierDto>>>("/api/carriers", { params });
  return response.data.data;
}
export async function getCarrier(id: string) { const response = await httpClient.get<ApiResponse<CarrierRequest & { id: string }>>(`/api/carriers/${id}`); return response.data.data; }
export async function createCarrier(request: CarrierRequest) { const response = await httpClient.post<ApiResponse<CarrierDto>>("/api/carriers", request); return response.data.data; }
export async function updateCarrier(id: string, request: CarrierRequest) { const response = await httpClient.put<ApiResponse<CarrierDto>>(`/api/carriers/${id}`, request); return response.data.data; }
export async function deleteCarrier(id: string) { await httpClient.delete(`/api/carriers/${id}`); }
