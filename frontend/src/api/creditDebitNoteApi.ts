import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface CreditDebitNoteSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  noteType?: string;
  partyType?: string;
  partyId?: string;
  sourceType?: string;
  sourceId?: string;
  status?: string;
  accountingPosted?: boolean;
}

export interface CreditDebitNoteItemRequest {
  chargeCode: string;
  chargeName: string;
  chargeHead: string;
  quantity: number;
  unitRate: number;
  discountAmount: number;
  isTaxApplicable: boolean;
  taxRate: number;
}

export interface CreditDebitNoteRequest {
  noteType: "Credit Note" | "Debit Note";
  partyType: "Customer" | "Vendor";
  partyId: string;
  partyName?: string | null;
  sourceType: string;
  sourceId?: string | null;
  sourceReferenceNo?: string | null;
  noteDate: string;
  partyCurrencyId: string;
  noteCurrencyId: string;
  exchangeRate: number;
  isExchangeRateOverride: boolean;
  exchangeRateOverrideReason?: string | null;
  roundOffAmount: number;
  remarks?: string | null;
  items: CreditDebitNoteItemRequest[];
}

export interface CreditDebitNoteItemDto extends CreditDebitNoteItemRequest {
  id: string;
  taxAmount: number;
  lineAmount: number;
}

export interface CreditDebitNoteDto {
  id: string;
  serialNo: number;
  noteNumber: string;
  noteType: "Credit Note" | "Debit Note";
  partyType: "Customer" | "Vendor";
  partyId: string;
  partyName: string;
  sourceType: string;
  sourceId?: string | null;
  sourceReferenceNo: string;
  noteDate: string;
  partyCurrencyId: string;
  noteCurrencyId: string;
  exchangeRate: number;
  isExchangeRateOverride: boolean;
  exchangeRateOverrideReason?: string | null;
  subTotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  roundOffAmount: number;
  totalAmount: number;
  baseCurrencyAmount: number;
  status: string;
  isAccountingPosted: boolean;
  approvedDate?: string | null;
  accountingPostedDate?: string | null;
  cancelledDate?: string | null;
  cancellationReason?: string | null;
  remarks?: string | null;
  items: CreditDebitNoteItemDto[];
}

const base = "/api/credit-debit-notes";

export async function searchCreditDebitNotes(params: CreditDebitNoteSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<CreditDebitNoteDto>>>(base, { params });
  return response.data.data;
}

export async function getCreditDebitNote(id: string) {
  const response = await httpClient.get<ApiResponse<CreditDebitNoteDto>>(`${base}/${id}`);
  return response.data.data;
}

export async function createCreditDebitNote(request: CreditDebitNoteRequest) {
  const response = await httpClient.post<ApiResponse<CreditDebitNoteDto>>(base, request);
  return response.data.data;
}

export async function updateCreditDebitNote(id: string, request: CreditDebitNoteRequest) {
  const response = await httpClient.put<ApiResponse<CreditDebitNoteDto>>(`${base}/${id}`, request);
  return response.data.data;
}

export async function deleteCreditDebitNote(id: string) {
  await httpClient.delete(`${base}/${id}`);
}

export async function approveCreditDebitNote(id: string) {
  const response = await httpClient.post<ApiResponse<CreditDebitNoteDto>>(`${base}/${id}/approve`);
  return response.data.data;
}

export async function postCreditDebitNoteAccounting(id: string) {
  const response = await httpClient.post<ApiResponse<CreditDebitNoteDto>>(`${base}/${id}/post-accounting`);
  return response.data.data;
}

export async function cancelCreditDebitNote(id: string, reason: string) {
  const response = await httpClient.post<ApiResponse<CreditDebitNoteDto>>(`${base}/${id}/cancel`, { reason });
  return response.data.data;
}
