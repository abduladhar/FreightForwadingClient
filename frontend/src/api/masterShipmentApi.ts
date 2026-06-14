import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface MasterShipmentSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  modeOfTransport?: string;
  originPortGuid?: string;
  destinationPortGuid?: string;
  originPort?: string;
  destinationPort?: string;
  masterWaybillNo?: string;
  invoiceDefined?: boolean;
  billDefined?: boolean;
  invoiceFullyReceived?: boolean;
  billFullyPaid?: boolean;
  invoiceCancelled?: boolean;
  billCancelled?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface MasterShipmentRequest {
  salesmanId?: string | null;
  modeOfTransport: string;
  carrierId?: string | null;
  carrierName?: string | null;
  flightNumber?: string | null;
  vesselName?: string | null;
  voyageNumber?: string | null;
  truckNumber?: string | null;
  originPortGuid?: string | null;
  destinationPortGuid?: string | null;
  etd?: string | null;
  eta?: string | null;
  totalCostAmount: number;
  costAllocationMethod: string;
  remarks?: string | null;
}

export interface MasterShipmentUpdateRequest extends MasterShipmentRequest {
  actualDeparture?: string | null;
  actualArrival?: string | null;
}

export interface MasterShipmentItemRequest {
  houseShipmentId: string;
  houseShipmentItemId: string;
  houseShipmentNumber?: string;
  packageTypeId?: string | null;
  packageTypeName?: string;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  length?: number;
  width?: number;
  height?: number;
  volumeCbm?: number;
  consolidatedPieces: number;
  consolidatedWeight: number;
  consolidatedVolume: number;
  chargeableWeight: number;
  manualAllocatedCostAmount?: number | null;
}
export interface MasterShipmentGoodsReceiptItemRequest {
  goodsReceiptId: string;
  goodsReceiptItemId: string;
  hawbNumber?: string;
  shipperName?: string;
  shipperAddress?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  consolidatedPieces: number;
  consolidatedWeight: number;
  consolidatedVolume: number;
  chargeableWeight: number;
  manualAllocatedCostAmount?: number | null;
}

export interface MasterShipmentItemDto {
  id: string;
  sourceEntityType: string;
  sourceEntityId: string;
  sourceEntityItemId: string;
  houseShipmentId: string;
  houseShipmentItemId: string;
  houseShipmentNumber: string;
  hawbNumber: string;
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  houseShipmentItemDescription: string;
  packageTypeId?: string | null;
  packageTypeName: string;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  length: number;
  width: number;
  height: number;
  volumeCbm: number;
  consolidatedPieces: number;
  consolidatedWeight: number;
  consolidatedVolume: number;
  chargeableWeight: number;
  allocatedCostAmount: number;
  manualAllocatedCostAmount?: number | null;
}

export interface MasterShipmentDto {
  salesmanId?: string | null;
  id: string;
  serialNo: number;
  masterShipmentNumber: string;
  mawbNumber?: string | null;
  mblNumber?: string | null;
  modeOfTransport: string;
  carrierId?: string | null;
  carrierName?: string | null;
  flightNumber?: string | null;
  vesselName?: string | null;
  voyageNumber?: string | null;
  truckNumber?: string | null;
  originPortGuid?: string | null;
  originPortCode: string;
  originPortName: string;
  originPortCountryName: string;
  destinationPortGuid?: string | null;
  destinationPortCode: string;
  destinationPortName: string;
  destinationPortCountryName: string;
  status: string;
  etd?: string | null;
  eta?: string | null;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  totalCostAmount: number;
  costAllocationMethod: string;
  documentReference?: string | null;
  remarks?: string | null;
  totalPieces: number;
  totalWeight: number;
  totalVolume: number;
  totalChargeableWeight: number;
  totalAllocatedCost: number;
  revenueAmount: number;
  profitAmount: number;
  items: MasterShipmentItemDto[];
  invoiceDefined: boolean;
  billDefined: boolean;
  invoiceFullyReceived: boolean;
  billFullyPaid: boolean;
  invoiceCancelled: boolean;
  billCancelled: boolean;
  pendingInvoicePostingCount: number;
  pendingBillPostingCount: number;
  unpaidInvoiceCount: number;
  unpaidBillCount: number;
}

export interface MasterShipmentStatusRequest { status: string }
export interface MasterShipmentCancelRequest { reason?: string | null }
export interface MasterShipmentDocumentRequest { documentReference: string }
export interface MasterShipmentPrintDto { masterShipmentId: string; documentType: string; content: string }
export interface ConsolidationReportDto {
  masterShipmentId: string;
  masterShipmentNumber: string;
  status: string;
  totalPieces: number;
  totalWeight: number;
  totalVolume: number;
  totalChargeableWeight: number;
  items: MasterShipmentItemDto[];
}
export interface CostAllocationPreviewDto {
  masterShipmentId: string;
  allocationMethod: string;
  totalCostAmount: number;
  items: MasterShipmentItemDto[];
}

const basePath = "/api/master-shipments";

export async function searchMasterShipments(params: MasterShipmentSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<MasterShipmentDto>>>(basePath, { params: { sortBy: "SerialNo", sortDirection: "desc", ...params } });
  return response.data.data;
}
export async function getMasterShipment(id: string) {
  const response = await httpClient.get<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}`);
  return response.data.data;
}
export async function createMasterShipment(request: MasterShipmentRequest) {
  const response = await httpClient.post<ApiResponse<MasterShipmentDto>>(basePath, request);
  return response.data.data;
}
export async function updateMasterShipment(id: string, request: MasterShipmentUpdateRequest) {
  const response = await httpClient.put<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}`, request);
  return response.data.data;
}
export async function deleteMasterShipment(id: string) { await httpClient.delete(`${basePath}/${id}`); }
export async function addMasterShipmentHouseShipment(id: string, request: MasterShipmentItemRequest) {
  const response = await httpClient.post<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}/house-shipments`, request);
  return response.data.data;
}
export async function addMasterShipmentHouseShipmentsBulk(id: string, requests: MasterShipmentItemRequest[]) {
  const response = await httpClient.post<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}/house-shipments/bulk`, requests);
  return response.data.data;
}
export async function addMasterShipmentGoodsReceiptsBulk(id: string, requests: MasterShipmentGoodsReceiptItemRequest[]) {
  const response = await httpClient.post<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}/goods-receipts/bulk`, requests);
  return response.data.data;
}
export async function removeMasterShipmentHouseShipment(id: string, itemId: string) {
  const response = await httpClient.delete<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}/house-shipments/${itemId}`);
  return response.data.data;
}
export async function updateMasterShipmentStatus(id: string, request: MasterShipmentStatusRequest) {
  const response = await httpClient.post<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}/status`, request);
  return response.data.data;
}
export async function cancelMasterShipment(id: string, request: MasterShipmentCancelRequest) {
  const response = await httpClient.post<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}/cancel`, request);
  return response.data.data;
}
export async function getMasterShipmentManifest(id: string) {
  const response = await httpClient.get<ApiResponse<MasterShipmentPrintDto>>(`${basePath}/${id}/manifest`);
  return response.data.data;
}
export async function getMasterShipmentConsolidationReport(id: string) {
  const response = await httpClient.get<ApiResponse<ConsolidationReportDto>>(`${basePath}/${id}/consolidation-report`);
  return response.data.data;
}
export async function getMasterShipmentCostAllocationPreview(id: string) {
  const response = await httpClient.get<ApiResponse<CostAllocationPreviewDto>>(`${basePath}/${id}/cost-allocation-preview`);
  return response.data.data;
}
export async function attachMasterShipmentDocument(id: string, request: MasterShipmentDocumentRequest) {
  const response = await httpClient.post<ApiResponse<MasterShipmentDto>>(`${basePath}/${id}/documents`, request);
  return response.data.data;
}
