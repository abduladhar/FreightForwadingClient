import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";
import type { BillingSearchParams } from "@/api/invoiceApi";

export interface VendorBillItemRequest {
  id?: string | null;
  operationMode?: "New" | "Update" | "Delete";
  costCode: string;
  costName: string;
  costHead: string;
  shipmentId?: string | null;
  shipmentType?: string | null;
  allocationAmount: number;
  quantity: number;
  unitRate: number;
  discountAmount: number;
  isTaxApplicable: boolean;
  taxRate: number;
}

export interface VendorBillRequest {
  salesmanId?: string | null;
  vendorId: string;
  payToPartyType?: "Customer" | "Vendor" | "Agent" | "Carrier" | string | null;
  payToPartyId?: string | null;
  payToPartyName?: string | null;
  sourceType: string;
  sourceId?: string | null;
  sourceReferenceId?: string | null;
  sourceReferenceNo?: string | null;
  billDate: string;
  dueDate: string;
  vendorCurrencyId: string;
  billCurrencyId: string;
  exchangeRate: number;
  isExchangeRateOverride: boolean;
  exchangeRateOverrideReason?: string | null;
  expectedCostAmount: number;
  remarks?: string | null;
  items: VendorBillItemRequest[];
}

export interface VendorBillItemDto extends VendorBillItemRequest {
  id: string;
  taxAmount: number;
  lineAmount: number;
}
export interface VendorBillDto {
  salesmanId?: string | null;
  id: string;
  vendorBillNumber: string;
  vendorId: string;
  payToPartyType: "Customer" | "Vendor" | "Agent" | "Carrier" | string;
  payToPartyId: string;
  payToPartyName: string;
  sourceType: string;
  sourceId?: string | null;
  sourceReferenceId?: string | null;
  sourceReferenceNo: string;
  billDate: string;
  dueDate: string;
  vendorCurrencyId: string;
  billCurrencyId: string;
  exchangeRate: number;
  isExchangeRateOverride: boolean;
  exchangeRateOverrideReason?: string | null;
  expectedCostAmount: number;
  subTotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  baseCurrencyAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  approvedDate?: string | null;
  remarks?: string | null;
  items: VendorBillItemDto[];
}
export interface ExpectedCostComparisonDto {
  vendorBillId: string;
  vendorBillNumber: string;
  expectedCostAmount: number;
  actualCostAmount: number;
  varianceAmount: number;
  variancePercent: number;
}

const base = "/api/vendor-bills";
export async function searchVendorBills(params: BillingSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<VendorBillDto>>>(base, { params });
  return response.data.data;
}
export async function getVendorBill(id: string) {
  const response = await httpClient.get<ApiResponse<VendorBillDto>>(`${base}/${id}`);
  return response.data.data;
}
export async function createVendorBill(request: VendorBillRequest) {
  const response = await httpClient.post<ApiResponse<VendorBillDto>>(base, request);
  return response.data.data;
}
export async function updateVendorBill(id: string, request: VendorBillRequest) {
  const response = await httpClient.put<ApiResponse<VendorBillDto>>(`${base}/${id}`, request);
  return response.data.data;
}
export async function addVendorBillItem(vendorBillId: string, request: VendorBillItemRequest) {
  const response = await httpClient.post<ApiResponse<VendorBillDto>>(`${base}/${vendorBillId}/items`, {
    ...request,
    id: null,
    operationMode: "New"
  });
  return response.data.data;
}
export async function updateVendorBillItem(vendorBillId: string, itemId: string, request: VendorBillItemRequest) {
  const response = await httpClient.put<ApiResponse<VendorBillDto>>(`${base}/${vendorBillId}/items/${itemId}`, {
    ...request,
    id: itemId,
    operationMode: "Update"
  });
  return response.data.data;
}
export async function deleteVendorBillItem(vendorBillId: string, itemId: string) {
  const response = await httpClient.delete<ApiResponse<VendorBillDto>>(`${base}/${vendorBillId}/items/${itemId}`);
  return response.data.data;
}
export async function approveVendorBill(id: string) {
  const response = await httpClient.post<ApiResponse<VendorBillDto>>(`${base}/${id}/approve`);
  return response.data.data;
}
export async function cancelVendorBill(id: string, reason: string) {
  const response = await httpClient.post<ApiResponse<VendorBillDto>>(`${base}/${id}/cancel`, { reason });
  return response.data.data;
}
export async function getExpectedCostComparison(id: string) {
  const response = await httpClient.get<ApiResponse<ExpectedCostComparisonDto>>(`${base}/${id}/expected-cost-comparison`);
  return response.data.data;
}
