import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface QuotationItemRequest {
  packageTypeGuid?: string | null;
  packageTypeName?: string | null;
  description: string;
  pieces: number;
  actualWeight: number;
  length: number;
  width: number;
  height: number;
  distance: number;
  zone?: string | null;
}

export interface QuotationManualChargeRequest {
  rateMasterChargeId?: string | null;
  chargeHeadGuid?: string | null;
  chargeHeadName?: string | null;
  chargeCode: string;
  chargeName: string;
  currencyId?: string | null;
  rateBasis: string;
  unit?: string | null;
  quantity: number;
  unitRate: number;
  minimumAllowedAmount?: number | null;
  maximumAllowedAmount?: number | null;
  discountAmount: number;
  isTaxApplicable: boolean;
  taxRate: number;
  isManualOverride: boolean;
  overrideReason?: string | null;
}

export interface QuotationRequest {
  rateMasterId?: string | null;
  customerId: string;
  agentId?: string | null;
  originPortGuid?: string | null;
  originPortName?: string | null;
  destinationPortGuid?: string | null;
  destinationPortName?: string | null;
  origin: string;
  destination: string;
  serviceType: string;
  modeOfTransport: string;
  shipmentType: string;
  cargoType?: string | null;
  incoterms?: string | null;
  currencyId?: string | null;
  targetCurrencyId?: string | null;
  exchangeRate: number;
  discountAmount: number;
  isManualOverride: boolean;
  overrideReason?: string | null;
  items: QuotationItemRequest[];
  manualCharges: QuotationManualChargeRequest[];
}

export interface GenerateQuotationRequest {
  rateMasterId?: string | null;
  customerId?: string | null;
  agentId?: string | null;
  originPortGuid?: string | null;
  originPortName?: string | null;
  destinationPortGuid?: string | null;
  destinationPortName?: string | null;
  origin: string;
  destination: string;
  serviceType: string;
  modeOfTransport: string;
  shipmentType: string;
  cargoType?: string | null;
  incoterms?: string | null;
  zone?: string | null;
  currencyId?: string | null;
  targetCurrencyId?: string | null;
  exchangeRate?: number | null;
  discountAmount: number;
  isManualOverride: boolean;
  overrideReason?: string | null;
  items: QuotationItemRequest[];
}

export interface QuotationItemDto {
  id: string;
  packageTypeGuid?: string | null;
  packageTypeCode: string;
  packageTypeName: string;
  description: string;
  pieces: number;
  actualWeight: number;
  length: number;
  width: number;
  height: number;
  volumeCbm: number;
  volumetricWeight: number;
  chargeableWeight: number;
  distance: number;
  zone?: string | null;
}

export interface QuotationChargeDto {
  id: string;
  rateMasterChargeId?: string | null;
  chargeHeadGuid?: string | null;
  chargeHeadName: string;
  chargeCode: string;
  chargeName: string;
  rateBasis: string;
  quantity: number;
  unitRate: number;
  amount: number;
  minimumAllowedAmount?: number | null;
  maximumAllowedAmount?: number | null;
  discountAmount: number;
  isTaxApplicable: boolean;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  calculationBreakdown: string;
  isManualOverride: boolean;
  overrideReason?: string | null;
}

export interface QuotationDto {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  validUntilDate: string;
  rateMasterId?: string | null;
  customerId: string;
  agentId?: string | null;
  originPortGuid?: string | null;
  originPortCode: string;
  originPortName: string;
  originPortCountryName: string;
  destinationPortGuid?: string | null;
  destinationPortCode: string;
  destinationPortName: string;
  destinationPortCountryName: string;
  origin: string;
  destination: string;
  serviceType: string;
  modeOfTransport: string;
  shipmentType: string;
  cargoType?: string | null;
  incoterms?: string | null;
  currencyId: string;
  targetCurrencyId?: string | null;
  exchangeRate: number;
  subTotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  targetCurrencyTotalAmount: number;
  status: string;
  isManualOverride: boolean;
  overrideReason?: string | null;
  items: QuotationItemDto[];
  charges: QuotationChargeDto[];
}

export interface QuotationPreviewDto {
  quotationId: string;
  quotationNumber: string;
  previewContent: string;
}

export interface ConvertQuotationResponse {
  quotationId: string;
  shipmentId: string;
  shipmentType: string;
}

export async function searchQuotations(params: { pageNumber?: number; pageSize?: number; search?: string; status?: string; customerId?: string }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<QuotationDto>>>("/api/quotations", { params });
  return response.data.data;
}

export async function getQuotation(id: string) {
  const response = await httpClient.get<ApiResponse<QuotationDto>>(`/api/quotations/${id}`);
  return response.data.data;
}

export async function createQuotation(request: QuotationRequest) {
  const response = await httpClient.post<ApiResponse<QuotationDto>>("/api/quotations", request);
  return response.data.data;
}

export async function updateQuotation(id: string, request: QuotationRequest) {
  const response = await httpClient.put<ApiResponse<QuotationDto>>(`/api/quotations/${id}`, request);
  return response.data.data;
}

export async function deleteQuotation(id: string) {
  await httpClient.delete(`/api/quotations/${id}`);
}

export async function generateQuotation(request: GenerateQuotationRequest) {
  const response = await httpClient.post<ApiResponse<QuotationDto>>("/api/quotations/generate", request);
  return response.data.data;
}

export async function submitQuotation(id: string) {
  const response = await httpClient.post<ApiResponse<QuotationDto>>(`/api/quotations/${id}/submit`);
  return response.data.data;
}

export async function approveQuotation(id: string) {
  const response = await httpClient.post<ApiResponse<QuotationDto>>(`/api/quotations/${id}/approve`);
  return response.data.data;
}

export async function rejectQuotation(id: string, reason?: string) {
  const response = await httpClient.post<ApiResponse<QuotationDto>>(`/api/quotations/${id}/reject`, { reason: reason ?? null });
  return response.data.data;
}

export async function cancelQuotation(id: string, reason?: string) {
  const response = await httpClient.post<ApiResponse<QuotationDto>>(`/api/quotations/${id}/cancel`, { reason: reason ?? null });
  return response.data.data;
}

export async function getQuotationPdfPreview(id: string) {
  const response = await httpClient.get<ApiResponse<QuotationPreviewDto>>(`/api/quotations/${id}/pdf-preview`);
  return response.data.data;
}

export async function sendQuotationEmail(id: string, emailTo: string) {
  const response = await httpClient.post<ApiResponse<QuotationDto>>(`/api/quotations/${id}/send-email`, { emailTo });
  return response.data.data;
}

export async function convertQuotationToShipment(id: string) {
  const response = await httpClient.post<ApiResponse<ConvertQuotationResponse>>(`/api/quotations/${id}/convert-to-shipment`);
  return response.data.data;
}
