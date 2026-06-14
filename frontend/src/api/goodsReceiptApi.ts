import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface GoodsReceiptItemRequest {
  id?: string | null;
  operationMode?: "New" | "Update" | "Delete";
  packageTypeGuid?: string | null;
  packageTypeName?: string | null;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  description: string;
  receivedPieces: number;
  receivedWeight: number;
  length: number;
  width: number;
  height: number;
}

export interface GoodsReceiptRequest {
  salesmanId?: string | null;
  customerId: string;
  pickupId?: string | null;
  receivedFrom: string;
  receivedDateTime: string;
  warehouseId?: string | null;
  warehouseLocation?: string | null;
  remarks?: string | null;
  items: GoodsReceiptItemRequest[];
}

export interface GoodsReceiptItemUpdateRequest {
  shipPieces?: number | null;
  damagedPieces?: number | null;
  returnedPieces?: number | null;
  damageRemarks?: string | null;
}

export interface GoodsReceiptItemDto {
  id: string;
  operationMode?: "Update";
  packageTypeGuid?: string | null;
  packageTypeCode: string;
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
  shippedPieces: number;
  damagedPieces: number;
  returnedPieces: number;
  availablePieces: number;
  status: string;
  barcodeValue?: string | null;
  qrCodeValue?: string | null;
  damageRemarks?: string | null;
}

export interface GoodsReceiptDto {
  salesmanId?: string | null;
  id: string;
  serialNo: number;
  goodsReceiptNumber: string;
  customerId: string;
  pickupId?: string | null;
  receivedFrom: string;
  receivedDateTime: string;
  warehouseId?: string | null;
  warehouseLocation?: string | null;
  status: string;
  remarks?: string | null;
  items: GoodsReceiptItemDto[];
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

export interface GoodsReceiptPrintDto {
  goodsReceiptId: string;
  goodsReceiptNumber: string;
  content: string;
}

export interface LabelPrintDto {
  goodsReceiptItemId: string;
  labelType: string;
  value: string;
  content: string;
}

export interface AvailableGoodsDto {
  goodsReceiptId: string;
  goodsReceiptNumber: string;
  goodsReceiptItemId: string;
  packageTypeGuid?: string | null;
  packageTypeCode: string;
  packageTypeName: string;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  description: string;
  availablePieces: number;
  receivedWeight: number;
  volumeCbm: number;
  status: string;
}

export async function searchGoodsReceipts(params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  customerId?: string;
  pickupId?: string;
  customer?: string;
  grnNumber?: string;
  warehouseId?: string;
  warehouse?: string;
  warehouseLocation?: string;
  invoiceDefined?: boolean;
  billDefined?: boolean;
  invoiceFullyReceived?: boolean;
  billFullyPaid?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}) {
  const response = await httpClient.get<ApiResponse<PagedResponse<GoodsReceiptDto>>>("/api/goods-receipts", { params: { sortBy: "SerialNo", sortDirection: "desc", ...params } });
  return response.data.data;
}

export async function getGoodsReceipt(id: string) {
  const response = await httpClient.get<ApiResponse<GoodsReceiptDto>>(`/api/goods-receipts/${id}`);
  return response.data.data;
}

export async function createGoodsReceipt(request: GoodsReceiptRequest) {
  const response = await httpClient.post<ApiResponse<GoodsReceiptDto>>("/api/goods-receipts", request);
  return response.data.data;
}

export async function updateGoodsReceipt(id: string, request: GoodsReceiptRequest) {
  const response = await httpClient.put<ApiResponse<GoodsReceiptDto>>(`/api/goods-receipts/${id}`, request);
  return response.data.data;
}

export async function addGoodsReceiptItem(goodsReceiptId: string, request: GoodsReceiptItemRequest) {
  const response = await httpClient.post<ApiResponse<GoodsReceiptDto>>(`/api/goods-receipts/${goodsReceiptId}/items`, {
    ...request,
    id: null,
    operationMode: "New"
  });
  return response.data.data;
}

export async function updateGoodsReceiptItemRow(goodsReceiptId: string, itemId: string, request: GoodsReceiptItemRequest) {
  const response = await httpClient.put<ApiResponse<GoodsReceiptDto>>(`/api/goods-receipts/${goodsReceiptId}/items/${itemId}`, {
    ...request,
    id: itemId,
    operationMode: "Update"
  });
  return response.data.data;
}

export async function deleteGoodsReceiptItemRow(goodsReceiptId: string, itemId: string) {
  const response = await httpClient.delete<ApiResponse<GoodsReceiptDto>>(`/api/goods-receipts/${goodsReceiptId}/items/${itemId}`);
  return response.data.data;
}

export async function deleteGoodsReceipt(id: string) {
  await httpClient.delete(`/api/goods-receipts/${id}`);
}

export async function updateGoodsReceiptItem(itemId: string, request: GoodsReceiptItemUpdateRequest) {
  const response = await httpClient.put<ApiResponse<GoodsReceiptDto>>(`/api/goods-receipts/items/${itemId}`, request);
  return response.data.data;
}

export async function getGoodsReceiptNote(id: string) {
  const response = await httpClient.get<ApiResponse<GoodsReceiptPrintDto>>(`/api/goods-receipts/${id}/note`);
  return response.data.data;
}

export async function getGoodsBarcode(itemId: string) {
  const response = await httpClient.get<ApiResponse<LabelPrintDto>>(`/api/goods-receipts/items/${itemId}/barcode`);
  return response.data.data;
}

export async function getGoodsQr(itemId: string) {
  const response = await httpClient.get<ApiResponse<LabelPrintDto>>(`/api/goods-receipts/items/${itemId}/qr`);
  return response.data.data;
}

export async function getAvailableGoods(customerId?: string) {
  const response = await httpClient.get<ApiResponse<AvailableGoodsDto[]>>("/api/goods-receipts/available", { params: { customerId } });
  return response.data.data ?? [];
}
