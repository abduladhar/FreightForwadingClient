import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface HouseShipmentSearchParams {
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
  invoiceDefined?: boolean;
  billDefined?: boolean;
  unpaidInvoice?: boolean;
  unpaidBill?: boolean;
  invoiceStatus?: string;
  billStatus?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface HouseShipmentItemRequest {
  id?: string | null;
  operationMode?: "New" | "Update" | "Delete";
  goodsReceiptItemId?: string | null;
  packageTypeId?: string | null;
  packageTypeGuid?: string | null;
  packageTypeName?: string | null;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  description?: string | null;
  receivedPieces: number;
  receivedWeight: number;
  length: number;
  width: number;
  height: number;
  volumeCbm: number;
  loadedPieces: number;
  loadedWeight: number;
  loadedVolume: number;
}

export interface HouseShipmentRequest {
  salesmanId?: string | null;
  customerId: string;
  quotationId?: string | null;
  originPortGuid?: string | null;
  destinationPortGuid?: string | null;
  origin: string;
  destination: string;
  dropLocation?: string | null;
  consigneeName?: string | null;
  consigneeContactNo?: string | null;
  consigneeAddress?: string | null;
  shipperName?: string | null;
  shipperContactNo?: string | null;
  shipperAddress?: string | null;
  modeOfTransport?: string | null;
  etd?: string | null;
  eta?: string | null;
  revenueAmount: number;
  costAmount: number;
  remarks?: string | null;
}

export interface HouseShipmentUpdateRequest {
  salesmanId?: string | null;
  customerId: string;
  quotationId?: string | null;
  originPortGuid?: string | null;
  destinationPortGuid?: string | null;
  origin: string;
  destination: string;
  dropLocation?: string | null;
  consigneeName?: string | null;
  consigneeContactNo?: string | null;
  consigneeAddress?: string | null;
  shipperName?: string | null;
  shipperContactNo?: string | null;
  shipperAddress?: string | null;
  modeOfTransport?: string | null;
  etd?: string | null;
  eta?: string | null;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  customerInvoiceId?: string | null;
  vendorBillId?: string | null;
  revenueAmount: number;
  costAmount: number;
  remarks?: string | null;
}

export interface HouseShipmentItemDto {
  id: string;
  goodsReceiptItemId?: string | null;
  packageTypeId?: string | null;
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
}

export interface HouseShipmentDto {
  salesmanId?: string | null;
  id: string;
  houseShipmentNumber: string;
  hawbNumber?: string | null;
  modeOfTransport: string;
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
  dropLocation: string;
  consigneeName: string;
  consigneeContactNo: string;
  consigneeAddress: string;
  shipperName: string;
  shipperContactNo: string;
  shipperAddress: string;
  labelTemplateCode?: string | null;
  status: string;
  etd?: string | null;
  eta?: string | null;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  documentReference?: string | null;
  customerInvoiceId?: string | null;
  vendorBillId?: string | null;
  revenueAmount: number;
  costAmount: number;
  profitAmount: number;
  remarks?: string | null;
  items: HouseShipmentItemDto[];
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

export interface ShipmentStatusRequest {
  status: string;
}

export interface ShipmentCancelRequest {
  reason: string;
}

export interface ShipmentDocumentRequest {
  documentReference: string;
}

export interface ShipmentPrintDto {
  shipmentId: string;
  documentType: string;
  templateCode: string;
  content: string;
}

export interface ShipmentProfitDto {
  shipmentId: string;
  houseShipmentNumber: string;
  revenueAmount: number;
  costAmount: number;
  profitAmount: number;
  profitMarginPercent: number;
}

const basePath = "/api/house-shipments";

export async function searchHouseShipments(params: HouseShipmentSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<HouseShipmentDto>>>(basePath, { params: { sortBy: "CreatedDate", sortDirection: "desc", ...params } });
  return response.data.data;
}

export async function getHouseShipment(id: string) {
  const response = await httpClient.get<ApiResponse<HouseShipmentDto>>(`${basePath}/${id}`);
  return normalizeHouseShipment(response.data.data);
}

export async function createHouseShipment(request: HouseShipmentRequest) {
  const response = await httpClient.post<ApiResponse<HouseShipmentDto>>(basePath, request);
  return normalizeHouseShipment(response.data.data);
}

export async function updateHouseShipment(id: string, request: HouseShipmentUpdateRequest) {
  const response = await httpClient.put<ApiResponse<HouseShipmentDto>>(`${basePath}/${id}`, request);
  return normalizeHouseShipment(response.data.data);
}

export async function deleteHouseShipment(id: string) {
  await httpClient.delete(`${basePath}/${id}`);
}

export async function addHouseShipmentItem(shipmentId: string, request: HouseShipmentItemRequest) {
  const response = await httpClient.post<ApiResponse<HouseShipmentDto>>(`${basePath}/${shipmentId}/items`, toHouseShipmentItemPayload(request));
  return normalizeHouseShipment(response.data.data);
}

export async function updateHouseShipmentItem(shipmentId: string, itemId: string, request: HouseShipmentItemRequest) {
  const response = await httpClient.put<ApiResponse<HouseShipmentDto>>(`${basePath}/${shipmentId}/items/${itemId}`, toHouseShipmentItemPayload(request));
  return normalizeHouseShipment(response.data.data);
}

export async function removeHouseShipmentItem(shipmentId: string, itemId: string) {
  const response = await httpClient.delete<ApiResponse<HouseShipmentDto>>(`${basePath}/${shipmentId}/items/${itemId}`);
  return normalizeHouseShipment(response.data.data);
}

export async function updateHouseShipmentStatus(shipmentId: string, request: ShipmentStatusRequest) {
  const response = await httpClient.post<ApiResponse<HouseShipmentDto>>(`${basePath}/${shipmentId}/status`, request);
  return normalizeHouseShipment(response.data.data);
}

export async function cancelHouseShipment(shipmentId: string, request: ShipmentCancelRequest) {
  const response = await httpClient.post<ApiResponse<HouseShipmentDto>>(`${basePath}/${shipmentId}/cancel`, request);
  return normalizeHouseShipment(response.data.data);
}

export async function getHouseShipmentLabel(shipmentId: string) {
  const response = await httpClient.get<ApiResponse<ShipmentPrintDto>>(`${basePath}/${shipmentId}/label`);
  return response.data.data;
}

export async function getHouseShipmentHawb(shipmentId: string) {
  const response = await httpClient.get<ApiResponse<ShipmentPrintDto>>(`${basePath}/${shipmentId}/hawb`);
  return response.data.data;
}

export async function attachHouseShipmentDocument(shipmentId: string, request: ShipmentDocumentRequest) {
  const response = await httpClient.post<ApiResponse<HouseShipmentDto>>(`${basePath}/${shipmentId}/documents`, request);
  return normalizeHouseShipment(response.data.data);
}

export async function getHouseShipmentProfitPreview(shipmentId: string) {
  const response = await httpClient.get<ApiResponse<ShipmentProfitDto>>(`${basePath}/${shipmentId}/profit-preview`);
  return response.data.data;
}

function toHouseShipmentItemPayload(request: HouseShipmentItemRequest) {
  const packageTypeGuid = request.packageTypeGuid ?? request.packageTypeId ?? null;
  return {
    ...request,
    packageTypeGuid,
    packageTypeId: request.packageTypeId ?? packageTypeGuid,
    packageTypeName: request.packageTypeName ?? null
  };
}

function normalizeHouseShipment(shipment: HouseShipmentDto) {
  return {
    ...shipment,
    items: shipment.items.map((item) => ({
      ...item,
      packageTypeGuid: item.packageTypeGuid ?? item.packageTypeId ?? null,
      packageTypeId: item.packageTypeId ?? item.packageTypeGuid ?? null,
      packageTypeName: item.packageTypeName ?? "",
      hsCode: item.hsCode ?? null,
      countryOfOrigin: item.countryOfOrigin ?? null
    }))
  };
}
