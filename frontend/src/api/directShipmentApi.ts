import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface DirectShipmentSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  customerId?: string;
  customer?: string;
  houseWaybillNo?: string;
  consigneeName?: string;
  shipperName?: string;
  originPort?: string;
  destinationPort?: string;
  consigneePhoneNo?: string;
  shipperPhoneNo?: string;
  status?: string;
  modeOfTransport?: string;
  invoiceDefined?: boolean;
  billDefined?: boolean;
  unpaidInvoice?: boolean;
  unpaidBill?: boolean;
  invoiceStatus?: string;
  billStatus?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface DirectShipmentItemRequest {
  id?: string | null;
  operationMode?: "New" | "Update" | "Delete";
  goodsReceiptItemId?: string | null;
  packageTypeGuid?: string | null;
  packageTypeName?: string | null;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  description: string;
  receivedPieces?: number;
  receivedWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  volumeCbm?: number;
  loadedPieces?: number;
  loadedWeight?: number;
  loadedVolume?: number;
  pieces: number;
  weight: number;
  volume: number;
  marksAndNumbers?: string | null;
}

export interface DirectShipmentRequest {
  salesmanId?: string | null;
  customerId: string;
  quotationId?: string | null;
  originPortGuid?: string | null;
  destinationPortGuid?: string | null;
  origin: string;
  destination: string;
  shipperName?: string | null;
  shipperPhoneNumber?: string | null;
  shipperAddress?: string | null;
  consigneeName?: string | null;
  consigneePhoneNumber?: string | null;
  consigneeAddress?: string | null;
  modeOfTransport: string;
  carrierId?: string | null;
  carrierName?: string | null;
  flightNumber?: string | null;
  mawbNumber?: string | null;
  vesselName?: string | null;
  truckNumber?: string | null;
  containerNumber?: string | null;
  etd?: string | null;
  eta?: string | null;
  revenueAmount: number;
  costAmount: number;
  remarks?: string | null;
}

export interface DirectShipmentUpdateRequest extends DirectShipmentRequest {
  actualDeparture?: string | null;
  actualArrival?: string | null;
  customerInvoiceId?: string | null;
  vendorBillId?: string | null;
}

export interface DirectShipmentItemDto {
  id: string;
  goodsReceiptItemId?: string | null;
  packageTypeGuid?: string | null;
  packageTypeName: string;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  description: string;
  receivedPieces: number;
  receivedWeight: number;
  length: number;
  width: number;
  height: number;
  volumeCbm: number;
  loadedPieces: number;
  loadedWeight: number;
  loadedVolume: number;
  pieces: number;
  weight: number;
  volume: number;
  marksAndNumbers?: string | null;
}

export interface DirectShipmentDto {
  salesmanId?: string | null;
  id: string;
  directShipmentNumber: string;
  customerId: string;
  customerName: string;
  quotationId?: string | null;
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
  shipperName: string;
  shipperPhoneNumber: string;
  shipperAddress: string;
  consigneeName: string;
  consigneePhoneNumber: string;
  consigneeAddress: string;
  modeOfTransport: string;
  carrierId?: string | null;
  carrierName?: string | null;
  flightNumber?: string | null;
  mawbNumber?: string | null;
  vesselName?: string | null;
  truckNumber?: string | null;
  containerNumber?: string | null;
  status: string;
  etd?: string | null;
  eta?: string | null;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  customerInvoiceId?: string | null;
  vendorBillId?: string | null;
  revenueAmount: number;
  costAmount: number;
  profitAmount: number;
  documentReference?: string | null;
  remarks?: string | null;
  items: DirectShipmentItemDto[];
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

export interface DirectShipmentStatusRequest { status: string }
export interface DirectShipmentCancelRequest { reason?: string | null }
export interface DirectShipmentDocumentRequest { documentReference: string }
export interface DirectShipmentPrintDto { shipmentId: string; documentType: string; content: string }
export interface DirectShipmentProfitDto { shipmentId: string; directShipmentNumber: string; revenueAmount: number; costAmount: number; profitAmount: number; profitMarginPercent: number }

const basePath = "/api/direct-shipments";

export async function searchDirectShipments(params: DirectShipmentSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<DirectShipmentDto>>>(basePath, { params: { sortBy: "CreatedDate", sortDirection: "desc", ...params } });
  return response.data.data;
}
export async function getDirectShipment(id: string) {
  const response = await httpClient.get<ApiResponse<DirectShipmentDto>>(`${basePath}/${id}`);
  return response.data.data;
}
export async function createDirectShipment(request: DirectShipmentRequest) {
  const response = await httpClient.post<ApiResponse<DirectShipmentDto>>(basePath, request);
  return response.data.data;
}
export async function updateDirectShipment(id: string, request: DirectShipmentUpdateRequest) {
  const response = await httpClient.put<ApiResponse<DirectShipmentDto>>(`${basePath}/${id}`, request);
  return response.data.data;
}
export async function deleteDirectShipment(id: string) { await httpClient.delete(`${basePath}/${id}`); }
export async function addDirectShipmentItem(id: string, request: DirectShipmentItemRequest) {
  const response = await httpClient.post<ApiResponse<DirectShipmentDto>>(`${basePath}/${id}/items`, request);
  return response.data.data;
}
export async function updateDirectShipmentItem(id: string, itemId: string, request: DirectShipmentItemRequest) {
  const response = await httpClient.put<ApiResponse<DirectShipmentDto>>(`${basePath}/${id}/items/${itemId}`, request);
  return response.data.data;
}
export async function removeDirectShipmentItem(id: string, itemId: string) {
  const response = await httpClient.delete<ApiResponse<DirectShipmentDto>>(`${basePath}/${id}/items/${itemId}`);
  return response.data.data;
}
export async function updateDirectShipmentStatus(id: string, request: DirectShipmentStatusRequest) {
  const response = await httpClient.post<ApiResponse<DirectShipmentDto>>(`${basePath}/${id}/status`, request);
  return response.data.data;
}
export async function cancelDirectShipment(id: string, request: DirectShipmentCancelRequest) {
  const response = await httpClient.post<ApiResponse<DirectShipmentDto>>(`${basePath}/${id}/cancel`, request);
  return response.data.data;
}
export async function getDirectShipmentLabel(id: string) {
  const response = await httpClient.get<ApiResponse<DirectShipmentPrintDto>>(`${basePath}/${id}/label`);
  return response.data.data;
}
export async function attachDirectShipmentDocument(id: string, request: DirectShipmentDocumentRequest) {
  const response = await httpClient.post<ApiResponse<DirectShipmentDto>>(`${basePath}/${id}/documents`, request);
  return response.data.data;
}
export async function getDirectShipmentProfitPreview(id: string) {
  const response = await httpClient.get<ApiResponse<DirectShipmentProfitDto>>(`${basePath}/${id}/profit-preview`);
  return response.data.data;
}
