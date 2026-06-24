import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface BillOfExitSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  declarationNumber?: string;
  billOfEntryNumber?: string;
  billOfExitNumber?: string;
  state?: string;
  warehouseId?: string;
  warehouseLocationId?: string;
  declarationDateFrom?: string;
  declarationDateTo?: string;
  invoiceDefined?: boolean;
  billDefined?: boolean;
  unpaidInvoice?: boolean;
  unpaidBill?: boolean;
  invoiceStatus?: string;
  billStatus?: string;
}

export interface BillOfExitItemRequest {
  id?: string | null;
  operationMode?: "New" | "Update" | "Delete";
  billOfEntryId: string;
  billOfEntryItemId: string;
  billOfEntryNumber?: string | null;
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

export interface BillOfExitRequest {
  portType: string;
  declarationType: string;
  declarationDate: string;
  declarationNumber: string;
  billOfExitNumber: string;
  consigneeExporterBranchId?: string | null;
  consigneeExporterName?: string | null;
  intercessorCustomerId?: string | null;
  intercessorCustomerName?: string | null;
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
  items: BillOfExitItemRequest[];
}

export interface BillOfExitDto extends Omit<BillOfExitRequest, "items"> {
  id: string;
  serialNo: number;
  state: string;
  isApproved: boolean;
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
  items: BillOfExitItemDto[];
  timeline: BillOfExitTimelineDto[];
}

export interface BillOfExitItemDto extends Required<Omit<BillOfExitItemRequest, "operationMode">> {
  warehouseId: string;
  warehouseLocationId: string;
  currencyCode: string;
  exchangeRate: number;
  cifLocalValue: number;
  total: number;
}

export interface BillOfExitTimelineDto { id: string; fromState: string; toState: string; actionDate: string; doneByUserId: string; doneByUserName: string; remarks: string }

export interface BillOfEntryItemFifoSearchParams {
  pageNumber?: number;
  pageSize?: number;
  declarationNumber?: string;
  billOfEntryNumber?: string;
  inventoryId?: string;
  declarationDateFrom?: string;
  declarationDateTo?: string;
  warehouseId?: string;
  warehouseLocationId?: string;
}

export interface BillOfEntryItemFifoDto {
  billOfEntryId: string;
  billOfEntryItemId: string;
  billOfEntryNumber: string;
  declarationNumber: string;
  declarationDate: string;
  inventoryId: string;
  inventoryCode: string;
  inventoryName: string;
  hsCode?: string | null;
  goodsDescription: string;
  countryOfOrigin: string;
  availableCount: number;
  actualCount: number;
  unapprovedOutboundCount: number;
  warehouseId: string;
  warehouseName: string;
  warehouseLocationId: string;
  warehouseLocationName: string;
  cifForeignValue: number;
  currencyId: string;
  currencyCode: string;
  exchangeRate: number;
  cifLocalValue: number;
  dutyRate: number;
  incomeType: string;
  grossWeight: number;
  netWeight: number;
  unit: string;
}

const base = "/api/bill-of-exits";

export async function searchBillOfExits(params: BillOfExitSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<BillOfExitDto>>>(base, { params });
  return response.data.data;
}
export async function getBillOfExit(id: string) {
  const response = await httpClient.get<ApiResponse<BillOfExitDto>>(`${base}/${id}`);
  return response.data.data;
}
export async function createBillOfExit(request: BillOfExitRequest) {
  const response = await httpClient.post<ApiResponse<BillOfExitDto>>(base, request);
  return response.data.data;
}
export async function updateBillOfExit(id: string, request: BillOfExitRequest) {
  const response = await httpClient.put<ApiResponse<BillOfExitDto>>(`${base}/${id}`, request);
  return response.data.data;
}
export async function deleteBillOfExit(id: string) {
  await httpClient.delete(`${base}/${id}`);
}
export async function updateBillOfExitState(id: string, toState: string, remarks?: string) {
  const response = await httpClient.post<ApiResponse<BillOfExitDto>>(`${base}/${id}/state`, { toState, remarks: remarks ?? null });
  return response.data.data;
}
export async function searchBillOfEntryItemsForExit(params: BillOfEntryItemFifoSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<BillOfEntryItemFifoDto>>>(`${base}/bill-of-entry-items/search`, { params });
  return response.data.data;
}
