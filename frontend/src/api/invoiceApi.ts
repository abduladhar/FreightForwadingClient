import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface BillingSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sourceType?: string;
  sourceId?: string;
}

export interface InvoiceItemRequest {
  id?: string | null;
  operationMode?: "New" | "Update" | "Delete";
  chargeCode: string;
  chargeName: string;
  chargeHead: string;
  quantity: number;
  unitRate: number;
  discountAmount: number;
  isTaxApplicable: boolean;
  taxRate: number;
}

export interface InvoiceRequest {
  salesmanId?: string | null;
  documentType: string;
  customerId: string;
  billToPartyType?: "Customer" | "Vendor" | "Agent" | "Carrier";
  billToPartyId?: string | null;
  billToPartyName?: string | null;
  sourceType: string;
  sourceId?: string | null;
  sourceReferenceId?: string | null;
  sourceReferenceNo?: string | null;
  invoiceDate: string;
  dueDate: string;
  customerCurrencyId: string;
  invoiceCurrencyId: string;
  exchangeRate: number;
  isExchangeRateOverride: boolean;
  exchangeRateOverrideReason?: string | null;
  roundOffAmount: number;
  remarks?: string | null;
  items: InvoiceItemRequest[];
}

export interface InvoiceItemDto extends InvoiceItemRequest {
  id: string;
  taxAmount: number;
  lineAmount: number;
}

export interface InvoiceDto {
  salesmanId?: string | null;
  salesmanName?: string | null;
  id: string;
  invoiceNumber: string;
  documentType: string;
  customerId: string;
  billToPartyType: "Customer" | "Vendor" | "Agent" | "Carrier";
  billToPartyId: string;
  billToPartyName: string;
  sourceType: string;
  sourceId?: string | null;
  sourceReferenceId?: string | null;
  sourceReferenceNo: string;
  invoiceDate: string;
  dueDate: string;
  customerCurrencyId: string;
  invoiceCurrencyId: string;
  exchangeRate: number;
  isExchangeRateOverride: boolean;
  exchangeRateOverrideReason?: string | null;
  subTotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  roundOffAmount: number;
  totalAmount: number;
  baseCurrencyAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  approvedDate?: string | null;
  sentDate?: string | null;
  emailTo?: string | null;
  remarks?: string | null;
  items: InvoiceItemDto[];
}

export interface BillingPreviewDto { documentId: string; documentType: string; content: string }

const base = "/api/invoices";
export async function searchInvoices(params: BillingSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<InvoiceDto>>>(base, { params });
  return response.data.data;
}
export async function getInvoice(id: string) {
  const response = await httpClient.get<ApiResponse<InvoiceDto>>(`${base}/${id}`);
  return response.data.data;
}
export async function createInvoice(request: InvoiceRequest) {
  const response = await httpClient.post<ApiResponse<InvoiceDto>>(base, request);
  return response.data.data;
}
export async function updateInvoice(id: string, request: InvoiceRequest) {
  const response = await httpClient.put<ApiResponse<InvoiceDto>>(`${base}/${id}`, request);
  return response.data.data;
}
export async function addInvoiceItem(invoiceId: string, request: InvoiceItemRequest) {
  const response = await httpClient.post<ApiResponse<InvoiceDto>>(`${base}/${invoiceId}/items`, {
    ...request,
    id: null,
    operationMode: "New"
  });
  return response.data.data;
}
export async function updateInvoiceItem(invoiceId: string, itemId: string, request: InvoiceItemRequest) {
  const response = await httpClient.put<ApiResponse<InvoiceDto>>(`${base}/${invoiceId}/items/${itemId}`, {
    ...request,
    id: itemId,
    operationMode: "Update"
  });
  return response.data.data;
}
export async function deleteInvoiceItem(invoiceId: string, itemId: string) {
  const response = await httpClient.delete<ApiResponse<InvoiceDto>>(`${base}/${invoiceId}/items/${itemId}`);
  return response.data.data;
}
export async function approveInvoice(id: string) {
  const response = await httpClient.post<ApiResponse<InvoiceDto>>(`${base}/${id}/approve`);
  return response.data.data;
}
export async function cancelInvoice(id: string, reason: string) {
  const response = await httpClient.post<ApiResponse<InvoiceDto>>(`${base}/${id}/cancel`, { reason });
  return response.data.data;
}
export async function getInvoicePdf(id: string) {
  const response = await httpClient.get<ApiResponse<BillingPreviewDto>>(`${base}/${id}/pdf`);
  return response.data.data;
}
export async function sendInvoiceEmail(id: string, emailTo: string) {
  const response = await httpClient.post<ApiResponse<InvoiceDto>>(`${base}/${id}/send-email`, { emailTo });
  return response.data.data;
}
