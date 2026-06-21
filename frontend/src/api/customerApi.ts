import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface ContactDto { contactName: string; designation?: string | null; email?: string | null; phone?: string | null; isPrimary: boolean }
export interface AddressDto { addressType: string; addressLine: string; country?: string | null; city?: string | null; isDefault: boolean }
export interface DocumentDto { documentType: string; documentName: string; documentReference: string; expiryDate?: string | null }

export interface CustomerDto {
  id: string;
  customerCode: string;
  customerName: string;
  customerType: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  country: string;
  city?: string | null;
  taxNumber?: string | null;
  defaultCurrencyId?: string | null;
  creditLimit: number;
  paymentTerms?: string | null;
  salesmanId?: string | null;
  portalAccessEnabled: boolean;
  isActive: boolean;
}
export interface CustomerSearchDto {
  id: string;
  customerName: string;
  customerCode: string;
  phone?: string | null;
  email?: string | null;
  salesmanId?: string | null;
  defaultCurrencyId?: string | null;
}

export interface CustomerRequest extends Omit<CustomerDto, "id"> {
  contacts: ContactDto[];
  addresses: AddressDto[];
  documents: DocumentDto[];
}
export interface CustomerSalesmanTransferDto {
  id: string; customerId: string; oldSalesmanId?: string | null; oldSalesmanName: string; newSalesmanId: string; newSalesmanName: string; changedByUserId: string; changedByUserName: string; changedDate: string; reason: string;
}

export async function searchCustomers(params: { pageNumber?: number; pageSize?: number; search?: string; type?: string; country?: string; city?: string; isActive?: boolean }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<CustomerDto>>>("/api/customers", { params });
  return response.data.data;
}
export async function searchCustomerLookup(term: string, limit = 20) {
  const response = await httpClient.get<ApiResponse<CustomerSearchDto[]>>("/api/customers/search", { params: { term, limit } });
  return response.data.data ?? [];
}
export async function getCustomer(id: string) { const response = await httpClient.get<ApiResponse<CustomerRequest & { id: string }>>(`/api/customers/${id}`); return response.data.data; }
export async function createCustomer(request: CustomerRequest) { const response = await httpClient.post<ApiResponse<CustomerDto>>("/api/customers", request); return response.data.data; }
export async function updateCustomer(id: string, request: CustomerRequest) { const response = await httpClient.put<ApiResponse<CustomerDto>>(`/api/customers/${id}`, request); return response.data.data; }
export async function deleteCustomer(id: string) { await httpClient.delete(`/api/customers/${id}`); }
export async function activateCustomer(id: string) { await httpClient.post(`/api/customers/${id}/activate`); }
export async function deactivateCustomer(id: string) { await httpClient.post(`/api/customers/${id}/deactivate`); }
export async function transferCustomerSalesman(id: string, newSalesmanId: string, reason: string) { const response = await httpClient.post<ApiResponse<CustomerDto>>(`/api/customers/${id}/salesman-transfer`, { newSalesmanId, reason }); return response.data.data; }
export async function getCustomerSalesmanHistory(id: string) { const response = await httpClient.get<ApiResponse<CustomerSalesmanTransferDto[]>>(`/api/customers/${id}/salesman-history`); return response.data.data ?? []; }
