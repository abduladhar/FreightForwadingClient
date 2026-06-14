import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface RateMasterSlabDto {
  id: string;
  fromValue: number;
  toValue: number;
  rate: number;
  minimumCharge?: number | null;
  maximumCharge?: number | null;
}

export interface RateMasterChargeDto {
  id: string;
  chargeHeadGuid?: string | null;
  chargeCode: string;
  chargeName: string;
  chargeType: string;
  rangeBasis: string;
  amount: number;
  percentage: number;
  isTaxApplicable: boolean;
  isActive: boolean;
  ranges: RateMasterChargeRangeDto[];
}

export interface RateMasterChargeRangeDto {
  id: string;
  fromValue: number;
  toValue: number | null;
  rate: number;
  minimumCharge?: number | null;
  maximumCharge?: number | null;
}

export interface RateMasterDto {
  id: string;
  rateCode: string;
  rateName: string;
  rateScope: string;
  customerId?: string | null;
  vendorId?: string | null;
  agentId?: string | null;
  origin?: string | null;
  destination?: string | null;
  country?: string | null;
  city?: string | null;
  zone?: string | null;
  serviceType: string;
  modeOfTransport: string;
  shipmentType: string;
  cargoType?: string | null;
  incoterms?: string | null;
  rateBasis: string;
  baseRate: number;
  minimumCharge: number;
  maximumCharge?: number | null;
  fuelSurchargeRate: number;
  handlingCharge: number;
  pickupCharge: number;
  deliveryCharge: number;
  customsCharge: number;
  documentationCharge: number;
  warehouseCharge: number;
  destinationCharge: number;
  agentCommissionRate: number;
  validFromDate: string;
  validToDate: string;
  currencyId: string;
  isTaxApplicable: boolean;
  taxRate: number;
  isActive: boolean;
  slabs: RateMasterSlabDto[];
  charges: RateMasterChargeDto[];
}

export interface RateMasterSlabRequest {
  fromValue: number;
  toValue: number;
  rate: number;
  minimumCharge?: number | null;
  maximumCharge?: number | null;
}

export interface RateMasterChargeRequest {
  chargeHeadGuid?: string | null;
  chargeCode: string;
  chargeName: string;
  chargeType: string;
  rangeBasis: string;
  amount: number;
  percentage: number;
  isTaxApplicable: boolean;
  isActive: boolean;
  ranges: RateMasterChargeRangeRequest[];
}

export interface RateMasterChargeRangeRequest {
  fromValue: number;
  toValue: number | null;
  rate: number;
  minimumCharge?: number | null;
  maximumCharge?: number | null;
}

export interface RateMasterRequest {
  rateCode: string;
  rateName: string;
  rateScope: string;
  customerId?: string | null;
  vendorId?: string | null;
  agentId?: string | null;
  origin?: string | null;
  destination?: string | null;
  country?: string | null;
  city?: string | null;
  zone?: string | null;
  serviceType: string;
  modeOfTransport: string;
  shipmentType: string;
  cargoType?: string | null;
  incoterms?: string | null;
  rateBasis: string;
  baseRate: number;
  minimumCharge: number;
  maximumCharge?: number | null;
  fuelSurchargeRate: number;
  handlingCharge: number;
  pickupCharge: number;
  deliveryCharge: number;
  customsCharge: number;
  documentationCharge: number;
  warehouseCharge: number;
  destinationCharge: number;
  agentCommissionRate: number;
  validFromDate: string;
  validToDate: string;
  currencyId: string;
  isTaxApplicable: boolean;
  taxRate: number;
  isActive: boolean;
  slabs: RateMasterSlabRequest[];
  charges: RateMasterChargeRequest[];
}

export async function searchRateMasters(params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  modeOfTransport?: string;
  shipmentType?: string;
  serviceType?: string;
  origin?: string;
  destination?: string;
  isActive?: boolean;
}) {
  const response = await httpClient.get<ApiResponse<PagedResponse<RateMasterDto>>>("/api/rate-masters", { params });
  return response.data.data;
}

export async function getRateMaster(id: string) {
  const response = await httpClient.get<ApiResponse<RateMasterDto>>(`/api/rate-masters/${id}`);
  return response.data.data;
}

export async function createRateMaster(request: RateMasterRequest) {
  const response = await httpClient.post<ApiResponse<RateMasterDto>>("/api/rate-masters", request);
  return response.data.data;
}

export async function updateRateMaster(id: string, request: RateMasterRequest) {
  const response = await httpClient.put<ApiResponse<RateMasterDto>>(`/api/rate-masters/${id}`, request);
  return response.data.data;
}

export async function replaceRateMasterSlabs(id: string, request: RateMasterSlabRequest[]) {
  const response = await httpClient.put<ApiResponse<RateMasterDto>>(`/api/rate-masters/${id}/slabs`, request);
  return response.data.data;
}

export async function replaceRateMasterCharges(id: string, request: RateMasterChargeRequest[]) {
  const response = await httpClient.put<ApiResponse<RateMasterDto>>(`/api/rate-masters/${id}/charges`, request);
  return response.data.data;
}

export async function deleteRateMaster(id: string) {
  await httpClient.delete(`/api/rate-masters/${id}`);
}

export async function activateRateMaster(id: string) {
  const response = await httpClient.post<ApiResponse<RateMasterDto>>(`/api/rate-masters/${id}/activate`);
  return response.data.data;
}

export async function deactivateRateMaster(id: string) {
  const response = await httpClient.post<ApiResponse<RateMasterDto>>(`/api/rate-masters/${id}/deactivate`);
  return response.data.data;
}
