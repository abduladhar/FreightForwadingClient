import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface SettlementSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  partyId?: string;
}

export interface CustomerReceiptAllocationRequest {
  invoiceId: string;
  allocatedAmount: number;
}

export interface CustomerReceiptRequest {
  customerId: string;
  receivedFromPartyType?: "Customer" | "Vendor" | "Agent" | "Carrier" | string | null;
  receivedFromPartyId?: string | null;
  receivedFromPartyName?: string | null;
  receiptDate: string;
  receiptCurrencyId: string;
  baseCurrencyId: string;
  exchangeRate: number;
  receiptAmount: number;
  bankCharges: number;
  isAdvanceReceipt: boolean;
  bankAccountId?: string | null;
  cashAccountId?: string | null;
  remarks?: string | null;
  allocations: CustomerReceiptAllocationRequest[];
}

export interface CustomerReceiptAllocationDto {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  allocatedAmount: number;
  invoiceExchangeRate: number;
  receiptExchangeRate: number;
  exchangeGainAmount: number;
  exchangeLossAmount: number;
}

export interface CustomerReceiptDto {
  id: string;
  receiptNumber: string;
  customerId: string;
  receivedFromPartyType: "Customer" | "Vendor" | "Agent" | "Carrier" | string;
  receivedFromPartyId: string;
  receivedFromPartyName: string;
  receiptDate: string;
  receiptCurrencyId: string;
  baseCurrencyId: string;
  exchangeRate: number;
  receiptAmount: number;
  baseCurrencyAmount: number;
  bankCharges: number;
  exchangeGainAmount: number;
  exchangeLossAmount: number;
  isAdvanceReceipt: boolean;
  bankAccountId?: string | null;
  cashAccountId?: string | null;
  status: string;
  approvedDate?: string | null;
  remarks?: string | null;
  allocations: CustomerReceiptAllocationDto[];
}

export interface VoucherPreviewDto {
  id: string;
  voucherType: string;
  content: string;
}

const base = "/api/customer-receipts";

export async function searchReceipts(params: SettlementSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<CustomerReceiptDto>>>(base, { params });
  return response.data.data;
}
export async function getReceipt(id: string) {
  const response = await httpClient.get<ApiResponse<CustomerReceiptDto>>(`${base}/${id}`);
  return response.data.data;
}
export async function createReceipt(request: CustomerReceiptRequest) {
  const response = await httpClient.post<ApiResponse<CustomerReceiptDto>>(base, request);
  return response.data.data;
}
export async function updateReceipt(id: string, request: CustomerReceiptRequest) {
  const response = await httpClient.put<ApiResponse<CustomerReceiptDto>>(`${base}/${id}`, request);
  return response.data.data;
}
export async function replaceReceiptAllocations(id: string, request: CustomerReceiptAllocationRequest[]) {
  const response = await httpClient.put<ApiResponse<CustomerReceiptDto>>(`${base}/${id}/allocations`, request);
  return response.data.data;
}
export async function approveReceipt(id: string) {
  const response = await httpClient.post<ApiResponse<CustomerReceiptDto>>(`${base}/${id}/approve`);
  return response.data.data;
}
export async function cancelReceipt(id: string, reason: string) {
  const response = await httpClient.post<ApiResponse<CustomerReceiptDto>>(`${base}/${id}/cancel`, { reason });
  return response.data.data;
}
export async function getReceiptVoucher(id: string) {
  const response = await httpClient.get<ApiResponse<VoucherPreviewDto>>(`${base}/${id}/voucher`);
  return response.data.data;
}
