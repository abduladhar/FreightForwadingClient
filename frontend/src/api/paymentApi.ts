import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";
import type { SettlementSearchParams, VoucherPreviewDto } from "@/api/receiptApi";

export interface VendorPaymentAllocationRequest {
  vendorBillId: string;
  allocatedAmount: number;
}

export interface VendorPaymentRequest {
  vendorId: string;
  paidToPartyType?: string | null;
  paidToPartyId?: string | null;
  paidToPartyName?: string | null;
  paymentDate: string;
  paymentCurrencyId: string;
  baseCurrencyId: string;
  exchangeRate: number;
  paymentAmount: number;
  bankCharges: number;
  isAdvancePayment: boolean;
  bankAccountId?: string | null;
  cashAccountId?: string | null;
  remarks?: string | null;
  allocations: VendorPaymentAllocationRequest[];
}

export interface VendorPaymentAllocationDto {
  id: string;
  vendorBillId: string;
  allocatedAmount: number;
  billExchangeRate: number;
  paymentExchangeRate: number;
  exchangeGainAmount: number;
  exchangeLossAmount: number;
}

export interface VendorPaymentDto {
  id: string;
  paymentNumber: string;
  vendorId: string;
  paidToPartyType: string;
  paidToPartyId: string;
  paidToPartyName: string;
  paymentDate: string;
  paymentCurrencyId: string;
  baseCurrencyId: string;
  exchangeRate: number;
  paymentAmount: number;
  baseCurrencyAmount: number;
  bankCharges: number;
  exchangeGainAmount: number;
  exchangeLossAmount: number;
  isAdvancePayment: boolean;
  bankAccountId?: string | null;
  cashAccountId?: string | null;
  status: string;
  approvedDate?: string | null;
  remarks?: string | null;
  allocations: VendorPaymentAllocationDto[];
}

export interface BulkVendorPaymentVoucherRequest {
  vendorBillId: string;
  paymentAmount: number;
}

export interface BulkVendorPaymentRequest {
  paymentDate: string;
  paymentCurrencyId: string;
  baseCurrencyId: string;
  exchangeRate: number;
  bankCharges: number;
  bankAccountId?: string | null;
  cashAccountId?: string | null;
  remarks?: string | null;
  autoApprove: boolean;
  vouchers: BulkVendorPaymentVoucherRequest[];
}

export interface BulkVendorPaymentResultDto {
  totalPaymentAmount: number;
  paymentCount: number;
  payments: VendorPaymentDto[];
}

const base = "/api/vendor-payments";

export async function searchPayments(params: SettlementSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<VendorPaymentDto>>>(base, { params });
  return response.data.data;
}
export async function getPayment(id: string) {
  const response = await httpClient.get<ApiResponse<VendorPaymentDto>>(`${base}/${id}`);
  return response.data.data;
}
export async function createPayment(request: VendorPaymentRequest) {
  const response = await httpClient.post<ApiResponse<VendorPaymentDto>>(base, request);
  return response.data.data;
}
export async function createBulkPayment(request: BulkVendorPaymentRequest) {
  const endpoint = request.autoApprove ? `${base}/bulk/approve` : `${base}/bulk`;
  const response = await httpClient.post<ApiResponse<BulkVendorPaymentResultDto>>(endpoint, request);
  return response.data.data;
}
export async function updatePayment(id: string, request: VendorPaymentRequest) {
  const response = await httpClient.put<ApiResponse<VendorPaymentDto>>(`${base}/${id}`, request);
  return response.data.data;
}
export async function replacePaymentAllocations(id: string, request: VendorPaymentAllocationRequest[]) {
  const response = await httpClient.put<ApiResponse<VendorPaymentDto>>(`${base}/${id}/allocations`, request);
  return response.data.data;
}
export async function approvePayment(id: string) {
  const response = await httpClient.post<ApiResponse<VendorPaymentDto>>(`${base}/${id}/approve`);
  return response.data.data;
}
export async function cancelPayment(id: string, reason: string) {
  const response = await httpClient.post<ApiResponse<VendorPaymentDto>>(`${base}/${id}/cancel`, { reason });
  return response.data.data;
}
export async function getPaymentVoucher(id: string) {
  const response = await httpClient.get<ApiResponse<VoucherPreviewDto>>(`${base}/${id}/voucher`);
  return response.data.data;
}
