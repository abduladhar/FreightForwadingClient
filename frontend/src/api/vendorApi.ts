import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";
import type { ContactDto, AddressDto, DocumentDto } from "@/api/customerApi";

export interface VendorDto {
  id: string;
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  contactPerson?: string | null;
  email: string;
  phone?: string | null;
  billingAddress?: string | null;
  country: string;
  city: string;
  taxNumber?: string | null;
  defaultCurrencyId?: string | null;
  paymentTerms?: string | null;
  isActive: boolean;
}
export interface VendorRequest extends Omit<VendorDto, "id"> { contacts: ContactDto[]; addresses: AddressDto[]; documents: DocumentDto[] }

export async function searchVendors(params: { pageNumber?: number; pageSize?: number; search?: string; type?: string; country?: string; city?: string; isActive?: boolean }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<VendorDto>>>("/api/vendors", { params });
  return response.data.data;
}
export async function getVendor(id: string) { const response = await httpClient.get<ApiResponse<VendorRequest & { id: string }>>(`/api/vendors/${id}`); return response.data.data; }
export async function createVendor(request: VendorRequest) { const response = await httpClient.post<ApiResponse<VendorDto>>("/api/vendors", request); return response.data.data; }
export async function updateVendor(id: string, request: VendorRequest) { const response = await httpClient.put<ApiResponse<VendorDto>>(`/api/vendors/${id}`, request); return response.data.data; }
export async function deleteVendor(id: string) { await httpClient.delete(`/api/vendors/${id}`); }
