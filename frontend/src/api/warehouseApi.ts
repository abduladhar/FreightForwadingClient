import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface WarehouseDto { id: string; warehouseCode: string; warehouseName: string; address?: string | null; contactPerson?: string | null; phone?: string | null; isActive: boolean }
export interface WarehouseRequest { warehouseCode: string; warehouseName: string; address?: string | null; contactPerson?: string | null; phone?: string | null; isActive: boolean }
export interface WarehouseLocationDto { id: string; warehouseId: string; locationCode: string; rack?: string | null; bin?: string | null; description?: string | null; isActive: boolean }
export interface WarehouseLocationRequest { warehouseId: string; locationCode: string; rack?: string | null; bin?: string | null; description?: string | null; isActive: boolean }
export interface StockTransactionDto { id: string; transactionType: string; goodsReceiptItemId: string; warehouseId: string; warehouseLocationId: string; pieces: number; weight: number; volume: number; transactionDate: string; referenceType: string; referenceId?: string | null; remarks?: string | null }
export interface StockTransactionRequest { transactionType: string; goodsReceiptItemId: string; warehouseId: string; warehouseLocationId: string; pieces: number; weight: number; volume: number; referenceType: string; referenceId?: string | null; remarks?: string | null }
export interface StockTransferRequest { goodsReceiptItemId: string; fromWarehouseLocationId: string; toWarehouseId: string; toWarehouseLocationId: string; pieces: number; weight: number; volume: number; referenceType: string; referenceId?: string | null; remarks?: string | null }
export interface AvailableStockDto { goodsReceiptItemId: string; warehouseId: string; warehouseLocationId: string; warehouseCode: string; locationCode: string; availablePieces: number; reservedPieces: number; damagedPieces: number; returnedPieces: number; weight: number; volume: number; reservedWeight: number; reservedVolume: number }
export interface WarehouseStockReportDto { warehouseId: string; warehouseCode: string; warehouseName: string; availablePieces: number; reservedPieces: number; damagedPieces: number; returnedPieces: number; weight: number; volume: number; locations: AvailableStockDto[] }

export async function searchWarehouses(params: { pageNumber?: number; pageSize?: number; search?: string; isActive?: boolean }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<WarehouseDto>>>("/api/warehouses", { params });
  return response.data.data;
}
export async function getWarehouse(id: string) { const response = await httpClient.get<ApiResponse<WarehouseDto>>(`/api/warehouses/${id}`); return response.data.data; }
export async function createWarehouse(request: WarehouseRequest) { const response = await httpClient.post<ApiResponse<WarehouseDto>>("/api/warehouses", request); return response.data.data; }
export async function updateWarehouse(id: string, request: WarehouseRequest) { const response = await httpClient.put<ApiResponse<WarehouseDto>>(`/api/warehouses/${id}`, request); return response.data.data; }
export async function deleteWarehouse(id: string) { await httpClient.delete(`/api/warehouses/${id}`); }

export async function searchWarehouseLocations(params: { pageNumber?: number; pageSize?: number; search?: string; isActive?: boolean; warehouseId?: string }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<WarehouseLocationDto>>>("/api/warehouses/locations", { params });
  return response.data.data;
}
export async function createWarehouseLocation(request: WarehouseLocationRequest) { const response = await httpClient.post<ApiResponse<WarehouseLocationDto>>("/api/warehouses/locations", request); return response.data.data; }
export async function updateWarehouseLocation(id: string, request: WarehouseLocationRequest) { const response = await httpClient.put<ApiResponse<WarehouseLocationDto>>(`/api/warehouses/locations/${id}`, request); return response.data.data; }
export async function deleteWarehouseLocation(id: string) { await httpClient.delete(`/api/warehouses/locations/${id}`); }

export async function getStockTransactions(goodsReceiptItemId?: string) { const response = await httpClient.get<ApiResponse<StockTransactionDto[]>>("/api/warehouses/stock-transactions", { params: { goodsReceiptItemId } }); return response.data.data ?? []; }
export async function createStockTransaction(request: StockTransactionRequest) { const response = await httpClient.post<ApiResponse<StockTransactionDto>>("/api/warehouses/stock-transactions", request); return response.data.data; }
export async function transferStock(request: StockTransferRequest) { const response = await httpClient.post<ApiResponse<StockTransactionDto[]>>("/api/warehouses/stock-transfer", request); return response.data.data ?? []; }
export async function getAvailableStock(warehouseId?: string, goodsReceiptItemId?: string) { const response = await httpClient.get<ApiResponse<AvailableStockDto[]>>("/api/warehouses/available-stock", { params: { warehouseId, goodsReceiptItemId } }); return response.data.data ?? []; }
export async function getWarehouseStockReport(warehouseId: string) { const response = await httpClient.get<ApiResponse<WarehouseStockReportDto>>(`/api/warehouses/${warehouseId}/stock-report`); return response.data.data; }
