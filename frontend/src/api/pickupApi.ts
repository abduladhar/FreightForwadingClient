import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface PickupItemRequest {
  id?: string | null;
  operationMode?: "New" | "Update" | "Delete";
  packageTypeGuid?: string | null;
  packageTypeName?: string | null;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  description?: string | null;
  pieces: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  packageType?: string | null;
  marksAndNumbers?: string | null;
}

export interface PickupRequest {
  salesmanId?: string | null;
  customerId: string;
  quotationId?: string | null;
  customerLocation: string;
  contactPerson: string;
  contactPhone: string;
  dropLocation?: string;
  consigneeName?: string;
  consigneeContactNo?: string;
  consigneeAddress?: string;
  pickupDateTime: string;
  pickupCharges: number;
  currencyId?: string | null;
  items: PickupItemRequest[];
}

export interface PickupAssignRequest {
  driverId?: string | null;
  driverName?: string | null;
  vehicleNumber: string;
  transporterVendorId?: string | null;
}

export interface PickupStatusRequest {
  status: string;
  proofOfPickupDocumentReference?: string | null;
}

export interface PickupItemDto {
  id: string;
  packageTypeGuid?: string | null;
  packageTypeCode: string;
  packageTypeName: string;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  description: string;
  pieces: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  volumeCbm: number;
  packageType?: string | null;
  marksAndNumbers?: string | null;
}

export interface PickupDto {
  salesmanId?: string | null;
  id: string;
  serialNo: number;
  pickupNumber: string;
  customerId: string;
  quotationId?: string | null;
  customerLocation: string;
  contactPerson: string;
  contactPhone: string;
  dropLocation: string;
  consigneeName: string;
  consigneeContactNo: string;
  consigneeAddress: string;
  driverId?: string | null;
  driverName?: string | null;
  vehicleNumber?: string | null;
  transporterVendorId?: string | null;
  pickupDateTime: string;
  status: string;
  pickupCharges: number;
  currencyId?: string | null;
  pickupReceiptNumber?: string | null;
  pickupInvoiceId?: string | null;
  pickupVendorBillId?: string | null;
  proofOfPickupDocumentReference?: string | null;
  items: PickupItemDto[];
  invoiceDefined: boolean;
  billDefined: boolean;
  invoiceFullyReceived: boolean;
  billFullyPaid: boolean;
  invoiceCancelled: boolean;
  billCancelled: boolean;
  pendingInvoicePostingCount: number;
  pendingBillPostingCount: number;
  invoiceTotalAmount: number;
  billTotalAmount: number;
  profitAmount: number;
}

export interface PickupReceiptDto {
  pickupId: string;
  pickupNumber: string;
  receiptNumber: string;
  content: string;
}

export async function searchPickups(params: { pageNumber?: number; pageSize?: number; search?: string; status?: string; customerId?: string; customer?: string; pickupNumber?: string; contactNo?: string; invoiceDefined?: boolean; billDefined?: boolean; invoiceFullyReceived?: boolean; billFullyPaid?: boolean; sortBy?: string; sortDirection?: "asc" | "desc" }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<PickupDto>>>("/api/pickups", { params: { sortBy: "SerialNo", sortDirection: "desc", ...params } });
  return response.data.data;
}

export async function getPickup(id: string) {
  const response = await httpClient.get<ApiResponse<PickupDto>>(`/api/pickups/${id}`);
  return response.data.data;
}

export async function createPickup(request: PickupRequest) {
  const response = await httpClient.post<ApiResponse<PickupDto>>("/api/pickups", request);
  return response.data.data;
}

export async function updatePickup(id: string, request: PickupRequest) {
  const response = await httpClient.put<ApiResponse<PickupDto>>(`/api/pickups/${id}`, request);
  return response.data.data;
}

export async function addPickupItem(pickupId: string, request: PickupItemRequest) {
  const response = await httpClient.post<ApiResponse<PickupDto>>(`/api/pickups/${pickupId}/items`, request);
  return response.data.data;
}

export async function updatePickupItem(pickupId: string, itemId: string, request: PickupItemRequest) {
  const response = await httpClient.put<ApiResponse<PickupDto>>(`/api/pickups/${pickupId}/items/${itemId}`, request);
  return response.data.data;
}

export async function deletePickupItem(pickupId: string, itemId: string) {
  const response = await httpClient.delete<ApiResponse<PickupDto>>(`/api/pickups/${pickupId}/items/${itemId}`);
  return response.data.data;
}

export async function deletePickup(id: string) {
  await httpClient.delete(`/api/pickups/${id}`);
}

export async function assignPickup(id: string, request: PickupAssignRequest) {
  const response = await httpClient.post<ApiResponse<PickupDto>>(`/api/pickups/${id}/assign`, request);
  return response.data.data;
}

export async function updatePickupStatus(id: string, request: PickupStatusRequest) {
  const response = await httpClient.post<ApiResponse<PickupDto>>(`/api/pickups/${id}/status`, request);
  return response.data.data;
}

export async function getPickupReceipt(id: string) {
  const response = await httpClient.get<ApiResponse<PickupReceiptDto>>(`/api/pickups/${id}/receipt`);
  return response.data.data;
}
