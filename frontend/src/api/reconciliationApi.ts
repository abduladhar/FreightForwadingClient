import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";
import type { SettlementSearchParams } from "@/api/receiptApi";

export interface ReconciliationRequest {
  reconciliationType: string;
  shipmentId?: string | null;
  shipmentType?: string | null;
  invoiceId?: string | null;
  customerReceiptId?: string | null;
  vendorBillId?: string | null;
  vendorPaymentId?: string | null;
  reconciliationDate: string;
  remarks?: string | null;
}

export interface ReconciliationDto {
  id: string;
  reconciliationNumber: string;
  reconciliationType: string;
  shipmentId?: string | null;
  shipmentType?: string | null;
  invoiceId?: string | null;
  customerReceiptId?: string | null;
  vendorBillId?: string | null;
  vendorPaymentId?: string | null;
  reconciliationDate: string;
  revenueAmount: number;
  costAmount: number;
  profitDifferenceAmount: number;
  exchangeGainAmount: number;
  exchangeLossAmount: number;
  status: string;
  remarks?: string | null;
}

export interface PendingInvoiceDto {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  billToPartyType: string;
  billToPartyId: string;
  billToPartyName: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  invoiceCurrencyId: string;
  exchangeRate: number;
}
export interface PendingBillDto {
  vendorBillId: string;
  vendorBillNumber: string;
  vendorId: string;
  payToPartyType: string;
  payToPartyId: string;
  payToPartyName: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  billCurrencyId: string;
  exchangeRate: number;
}
export interface UnbilledShipmentDto {
  shipmentId: string;
  shipmentType: string;
  shipmentNumber: string;
  revenueAmount: number;
  costAmount: number;
}
export interface ExchangeGainLossPreviewDto {
  sourceAmount: number;
  sourceExchangeRate: number;
  settlementExchangeRate: number;
  sourceBaseAmount: number;
  settlementBaseAmount: number;
  exchangeGainAmount: number;
  exchangeLossAmount: number;
}

const base = "/api/reconciliations";

export async function searchReconciliations(params: SettlementSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<ReconciliationDto>>>(base, { params });
  return response.data.data;
}
export async function getReconciliation(id: string) {
  const response = await httpClient.get<ApiResponse<ReconciliationDto>>(`${base}/${id}`);
  return response.data.data;
}
export async function createReconciliation(request: ReconciliationRequest) {
  const response = await httpClient.post<ApiResponse<ReconciliationDto>>(base, request);
  return response.data.data;
}
export async function updateReconciliation(id: string, request: ReconciliationRequest) {
  const response = await httpClient.put<ApiResponse<ReconciliationDto>>(`${base}/${id}`, request);
  return response.data.data;
}
export async function getPendingInvoices(customerId?: string, partyType?: string, partyId?: string) {
  const response = await httpClient.get<ApiResponse<PendingInvoiceDto[]>>(`${base}/pending-invoices`, { params: { customerId, partyType, partyId } });
  return response.data.data;
}
export async function getPendingBills(vendorId?: string, partyType?: string, partyId?: string) {
  const response = await httpClient.get<ApiResponse<PendingBillDto[]>>(`${base}/pending-bills`, { params: { vendorId, partyType, partyId } });
  return response.data.data;
}
export async function getUnbilledShipments() {
  const response = await httpClient.get<ApiResponse<UnbilledShipmentDto[]>>(`${base}/unbilled-shipments`);
  return response.data.data;
}
export async function getExchangeGainLossPreview(amount: number, sourceExchangeRate: number, settlementExchangeRate: number) {
  const response = await httpClient.get<ApiResponse<ExchangeGainLossPreviewDto>>(`${base}/exchange-gain-loss-preview`, { params: { amount, sourceExchangeRate, settlementExchangeRate } });
  return response.data.data;
}
