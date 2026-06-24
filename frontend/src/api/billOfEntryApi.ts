import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface BillOfEntrySearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  boeNumber?: string;
  declarationNumber?: string;
  status?: string;
  warehouseId?: string;
  warehouseLocationId?: string;
  dateFrom?: string;
  dateTo?: string;
  invoiceDefined?: boolean;
  billDefined?: boolean;
  unpaidInvoice?: boolean;
  unpaidBill?: boolean;
  invoiceStatus?: string;
  billStatus?: string;
}

export interface BillOfEntryItemRequest {
  id?: string | null;
  operationMode?: "New" | "Update" | "Delete";
  inventoryId: string;
  inventoryCode?: string | null;
  inventoryName?: string | null;
  hsCode?: string | null;
  goodsDescription: string;
  countryOfOrigin: string;
  quantity: number;
  netWeight: number;
  grossWeight: number;
  unit?: string | null;
  cifForeignValue: number;
  currencyId?: string | null;
  currencyCode?: string | null;
  exchangeRate?: number | null;
  dutyRate: number;
  incomeType?: string | null;
}

export interface BillOfEntryRequest {
  portType: string;
  declarationType: string;
  declarationDate: string;
  declarationNumber: string;
  boeNumber: string;
  consigneeExporterBranchId?: string | null;
  consigneeExporterName?: string | null;
  intercessorCompanyId?: string | null;
  intercessorCompanyName?: string | null;
  commercialRegistrationNumber?: string | null;
  exportTo?: string | null;
  tinNumber?: string | null;
  deliveryOrderNumber?: string | null;
  measurement?: string | null;
  netWeight: number;
  grossWeight: number;
  numberOfPackages: number;
  carCaptain?: string | null;
  carrierName?: string | null;
  voyageFlightNumber?: string | null;
  portOfLoading?: string | null;
  portOfDischarge?: string | null;
  destination?: string | null;
  marksAndNumbers?: string | null;
  transportDocumentNumber?: string | null;
  currencyId: string;
  currencyCode?: string | null;
  exchangeRate: number;
  warehouseId: string;
  warehouseName?: string | null;
  warehouseLocationId: string;
  warehouseLocationName?: string | null;
  remarks?: string | null;
  items: BillOfEntryItemRequest[];
}

export interface BillOfEntryDto extends Omit<BillOfEntryRequest, "items"> {
  id: string;
  serialNo: number;
  status: string;
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
  items: BillOfEntryItemDto[];
  timeline: BillOfEntryTimelineDto[];
}

export interface BillOfEntryItemDto {
  id: string;
  inventoryId: string;
  inventoryCode: string;
  inventoryName: string;
  warehouseId: string;
  warehouseLocationId: string;
  hsCode?: string | null;
  goodsDescription: string;
  countryOfOrigin: string;
  quantity: number;
  netWeight: number;
  grossWeight: number;
  unit: string;
  cifForeignValue: number;
  currencyId: string;
  currencyCode: string;
  exchangeRate: number;
  cifLocalValue: number;
  dutyRate: number;
  incomeType: string;
  total: number;
}

export interface BillOfEntryTimelineDto { id: string; fromState: string; toState: string; actionDate: string; doneBy: string; remarks: string }
export interface BoeInventoryDto { id: string; serialNo: number; inventoryCode: string; inventoryName: string; description: string; isActive: boolean }
export interface InventoryStockReportRow { inventoryId: string; inventoryCode: string; inventoryName: string; warehouseId: string; warehouseName: string; warehouseLocationId: string; warehouseLocationName: string; customerName: string; consigneeExporterName: string; billOfEntryNumbers: string; actualStock: number; availableStock: number; unapprovedInboundStock: number; unapprovedOutboundStock: number }
export interface BillOfEntrySummaryRow {
  inventoryId: string;
  m1: string;
  m2: string;
  declarationDate: string;
  hsCode: string;
  particulars: string;
  countryOfOrigin: string;
  packageType: string;
  goodsInQuantity: number;
  goodsInWeight: number;
  goodsInValue: number;
  availableQuantity: number;
  availableWeight: number;
  availableValue: number;
  itemCodeRelated: string;
  comments: string;
}
export interface BillOfEntrySummaryTotals {
  lineCount: number;
  goodsInQuantity: number;
  goodsInWeight: number;
  goodsInValue: number;
  availableQuantity: number;
  availableWeight: number;
  availableValue: number;
}
export interface BoeInventoryStockMovementDto { id: string; inventoryId: string; billOfEntryId: string; billOfEntryItemId: string; warehouseId: string; warehouseLocationId: string; movementType: string; quantity: number; fromState: string; toState: string; movementDate: string }
export interface BillOfEntryAiHeaderDto {
  portType?: string | null;
  declarationType?: string | null;
  declarationDate?: string | null;
  declarationNumber?: string | null;
  boeNumber?: string | null;
  consigneeExporterName?: string | null;
  intercessorCompanyName?: string | null;
  commercialRegistrationNumber?: string | null;
  exportTo?: string | null;
  tinNumber?: string | null;
  deliveryOrderNumber?: string | null;
  measurement?: string | null;
  netWeight?: number | null;
  grossWeight?: number | null;
  numberOfPackages?: number | null;
  carCaptain?: string | null;
  carrierName?: string | null;
  voyageFlightNumber?: string | null;
  portOfLoading?: string | null;
  portOfLoadingCountry?: string | null;
  portOfDischarge?: string | null;
  portOfDischargeCountry?: string | null;
  destination?: string | null;
  destinationCountry?: string | null;
  marksAndNumbers?: string | null;
  transportDocumentNumber?: string | null;
  currencyCode?: string | null;
  exchangeRate?: number | null;
  remarks?: string | null;
}
export interface BillOfEntryAiItemDto {
  inventoryCode?: string | null;
  inventoryName?: string | null;
  hsCode?: string | null;
  goodsDescription?: string | null;
  countryOfOrigin?: string | null;
  quantity?: number | null;
  netWeight?: number | null;
  grossWeight?: number | null;
  unit?: string | null;
  cifForeignValue?: number | null;
  currencyCode?: string | null;
  exchangeRate?: number | null;
  dutyRate?: number | null;
  incomeType?: string | null;
}
export interface BillOfEntryAiExtractionResultDto {
  header: BillOfEntryAiHeaderDto;
  items: BillOfEntryAiItemDto[];
  warnings: string[];
  model: string;
  documentType: string;
  documentLanguage: string;
  prompt: string;
  rawJson: string;
}

const base = "/api/bill-of-entry";

export async function searchBillOfEntries(params: BillOfEntrySearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<BillOfEntryDto>>>(base, { params });
  return response.data.data;
}
export async function getBillOfEntry(id: string) {
  const response = await httpClient.get<ApiResponse<BillOfEntryDto>>(`${base}/${id}`);
  return response.data.data;
}
export async function createBillOfEntry(request: BillOfEntryRequest) {
  const response = await httpClient.post<ApiResponse<BillOfEntryDto>>(base, request);
  return response.data.data;
}
export async function updateBillOfEntry(id: string, request: BillOfEntryRequest) {
  const response = await httpClient.put<ApiResponse<BillOfEntryDto>>(`${base}/${id}`, request);
  return response.data.data;
}
export async function deleteBillOfEntry(id: string) {
  await httpClient.delete(`${base}/${id}`);
}
export async function updateBillOfEntryState(id: string, status: string, remarks?: string) {
  const response = await httpClient.post<ApiResponse<BillOfEntryDto>>(`${base}/${id}/state`, { status, remarks: remarks ?? null });
  return response.data.data;
}
export async function extractBillOfEntryPdf(file: File, options?: { documentType?: string }) {
  const form = new FormData();
  form.append("file", file);
  if (options?.documentType) form.append("documentType", options.documentType);
  const response = await httpClient.post<ApiResponse<BillOfEntryAiExtractionResultDto>>(`${base}/extract-pdf`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data.data;
}
export async function searchBoeInventories(params: { pageNumber?: number; pageSize?: number; search?: string }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<BoeInventoryDto>>>(`${base}/inventories`, { params });
  return response.data.data;
}
export async function saveBoeInventory(request: { inventoryCode: string; inventoryName: string; description?: string | null; isActive: boolean }) {
  const response = await httpClient.post<ApiResponse<BoeInventoryDto>>(`${base}/inventories`, request);
  return response.data.data;
}
export async function getInventoryStockReport(params: { pageNumber?: number; pageSize?: number; search?: string; inventoryId?: string; warehouseId?: string; warehouseLocationId?: string }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<InventoryStockReportRow>>>(`${base}/stock-report`, { params });
  return response.data.data;
}
export async function getBillOfEntrySummary(params: { pageNumber?: number; pageSize?: number; search?: string; inventoryId?: string; warehouseId?: string; warehouseLocationId?: string; onlyAvailable?: boolean }) {
  const response = await httpClient.get<ApiResponse<PagedResponse<BillOfEntrySummaryRow>>>(`${base}/summary`, { params });
  return response.data.data;
}
export async function getBillOfEntrySummaryTotals(params: { search?: string; inventoryId?: string; warehouseId?: string; warehouseLocationId?: string; onlyAvailable?: boolean }) {
  const response = await httpClient.get<ApiResponse<BillOfEntrySummaryTotals>>(`${base}/summary/totals`, { params });
  return response.data.data;
}
export async function exportBillOfEntrySummary(params: { search?: string; inventoryId?: string; warehouseId?: string; warehouseLocationId?: string; onlyAvailable?: boolean }) {
  const response = await httpClient.get<Blob>(`${base}/summary/export`, { params, responseType: "blob" });
  const blob = new Blob([response.data], { type: String(response.headers["content-type"] ?? "text/csv;charset=utf-8") });
  const disposition = String(response.headers["content-disposition"] ?? "");
  const fileName = /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? "bill-of-entry-summary.csv";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
export async function getBoeStockMovements(billOfEntryId?: string) {
  const response = await httpClient.get<ApiResponse<BoeInventoryStockMovementDto[]>>(`${base}/stock-movements`, { params: { billOfEntryId } });
  return response.data.data ?? [];
}
