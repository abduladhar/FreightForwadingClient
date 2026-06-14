import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export type AccountingReportType =
  | "ledger"
  | "general-ledger"
  | "customer-ledger"
  | "vendor-ledger"
  | "bank-book"
  | "cash-book"
  | "trial-balance"
  | "balance-sheet"
  | "profit-and-loss"
  | "trading-profit-and-loss"
  | "tax-report"
  | "customer-outstanding"
  | "vendor-outstanding"
  | "statement-of-account"
  | "currency-gain-loss"
  | "currency-revaluation";

export interface AccountingReportRequest {
  pageNumber?: number;
  pageSize?: number;
  financialYearId?: string;
  fromDate?: string;
  toDate?: string;
  accountId?: string;
  customerId?: string;
  vendorId?: string;
  currencyId?: string;
  reportCurrencyId?: string;
  exportFormat?: string;
  sortDirection?: "asc" | "desc";
}

export interface ReportEnvelope<T> {
  reportName: string;
  tenantId?: string | null;
  branchId?: string | null;
  financialYearId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  originalCurrencyId?: string | null;
  baseCurrencyId?: string | null;
  reportCurrencyId?: string | null;
  currencyMode: string;
  data: T;
}

export interface ReportExportDto {
  reportName: string;
  format: string;
  fileName: string;
  contentType: string;
  content: string;
}

export type OperationalReportType =
  | "quotation-report"
  | "goods-receipt-report"
  | "warehouse-stock-report"
  | "pickup-report"
  | "house-shipment-report"
  | "master-shipment-report"
  | "direct-shipment-report"
  | "air-freight-report"
  | "sea-freight-report"
  | "road-freight-report"
  | "courier-report"
  | "customs-clearance-report"
  | "container-report"
  | "unbilled-shipment-report"
  | "pending-bill-report"
  | "pending-pod-report"
  | "pending-document-report"
  | "shipment-ageing-report";

export interface OperationalReportRequest {
  pageNumber?: number;
  pageSize?: number;
  financialYearId?: string;
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  vendorId?: string;
  agentId?: string;
  salesmanId?: string;
  salesmanAssignmentStatus?: "Salesman Assigned" | "Without Salesman" | "Walk-in Customer";
  shipmentType?: string;
  shipmentStatus?: string;
  modeOfTransport?: string;
  currencyId?: string;
  origin?: string;
  destination?: string;
  route?: string;
  carrierId?: string;
  containerNumber?: string;
  userId?: string;
  exportFormat?: string;
  sortDirection?: "asc" | "desc";
}

export interface OperationalReportEnvelope<T> {
  reportName: string;
  tenantId?: string | null;
  branchId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  data: T;
}

export interface OperationalReportRow {
  recordId: string;
  reportType: string;
  referenceNumber: string;
  eventDate?: string | null;
  customerId?: string | null;
  vendorId?: string | null;
  agentId?: string | null;
  salesmanId?: string | null;
  salesmanAssignmentCategory: "Salesman Assigned" | "Without Salesman" | "Walk-in Customer";
  shipmentType?: string | null;
  status?: string | null;
  modeOfTransport?: string | null;
  currencyId?: string | null;
  origin?: string | null;
  destination?: string | null;
  route?: string | null;
  carrierId?: string | null;
  carrierName?: string | null;
  containerNumber?: string | null;
  userId?: string | null;
  pieces: number;
  weight: number;
  volume: number;
  amount: number;
  baseAmount: number;
  ageDays?: number | null;
  isPending: boolean;
  remarks?: string | null;
}

export interface OperationalReportExportDto {
  reportName: string;
  format: string;
  fileName: string;
  contentType: string;
  content: string;
}

export type ProfitReportType =
  | "shipment-profit"
  | "customer-wise-profit"
  | "salesman-wise-profit"
  | "agent-wise-profit"
  | "branch-wise-profit"
  | "route-wise-profit"
  | "destination-wise-profit";

export interface ProfitReportRequest {
  pageNumber?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  salesmanId?: string;
  agentId?: string;
  reportCurrencyId?: string;
  shipmentType?: string;
  modeOfTransport?: string;
  origin?: string;
  destination?: string;
}

export interface ProfitReportEnvelope<T> {
  reportName: string;
  tenantId?: string | null;
  branchId?: string | null;
  baseCurrencyId?: string | null;
  reportCurrencyId?: string | null;
  currencyMode: string;
  data: T;
}

export interface ShipmentProfitDto {
  shipmentId: string;
  shipmentType: string;
  shipmentNumber: string;
  customerId?: string | null;
  customerName?: string | null;
  salesmanId?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  branchId: string;
  modeOfTransport?: string | null;
  origin?: string | null;
  destination?: string | null;
  route: string;
  transactionCurrencyId?: string | null;
  baseCurrencyId?: string | null;
  reportCurrencyId?: string | null;
  customerInvoiceAmount: number;
  vendorBillAmount: number;
  agentCommissionAmount: number;
  otherExpenseAmount: number;
  shipmentProfitAmount: number;
  baseCustomerInvoiceAmount: number;
  baseVendorBillAmount: number;
  baseAgentCommissionAmount: number;
  baseOtherExpenseAmount: number;
  baseShipmentProfitAmount: number;
  reportShipmentProfitAmount: number;
}

export interface ProfitGroupRow {
  groupKey: string;
  groupName: string;
  shipmentCount: number;
  baseCustomerInvoiceAmount: number;
  baseVendorBillAmount: number;
  baseAgentCommissionAmount: number;
  baseOtherExpenseAmount: number;
  baseShipmentProfitAmount: number;
  reportShipmentProfitAmount: number;
}

export interface MasterShipmentProfitLossRowDto {
  sourceType: string;
  sourceId: string;
  sourceNumber: string;
  loadedPieces: number;
  totalPieces: number;
  allocationRatio: number;
  invoiceAmount: number;
  billAmount: number;
  profitAmount: number;
  baseInvoiceAmount: number;
  baseBillAmount: number;
  baseProfitAmount: number;
}

export interface MasterShipmentProfitLossSectionDto {
  sectionName: string;
  invoiceAmount: number;
  billAmount: number;
  profitAmount: number;
  baseInvoiceAmount: number;
  baseBillAmount: number;
  baseProfitAmount: number;
  rows: MasterShipmentProfitLossRowDto[];
}

export interface MasterShipmentProfitLossReportDto {
  masterShipmentId: string;
  masterShipmentNumber: string;
  masterWaybillNumber?: string | null;
  modeOfTransport: string;
  origin: string;
  destination: string;
  invoiceAmount: number;
  billAmount: number;
  profitAmount: number;
  baseInvoiceAmount: number;
  baseBillAmount: number;
  baseProfitAmount: number;
  sections: MasterShipmentProfitLossSectionDto[];
}

export async function getAccountingReport<T>(reportType: AccountingReportType, params: AccountingReportRequest) {
  const response = await httpClient.get<ApiResponse<ReportEnvelope<T>>>(`/api/accounting/reports/${reportType}`, { params });
  return response.data.data;
}

export async function exportAccountingReport(reportType: AccountingReportType, params: AccountingReportRequest) {
  const response = await httpClient.get<ApiResponse<ReportExportDto>>(`/api/accounting/reports/${reportType}/export`, { params });
  return response.data.data;
}

export async function printPreviewAccountingReport(reportType: AccountingReportType, params: AccountingReportRequest) {
  const response = await httpClient.get<ApiResponse<ReportExportDto>>(`/api/accounting/reports/${reportType}/print-preview`, { params });
  return response.data.data;
}

export async function getOperationalReport(reportType: OperationalReportType, params: OperationalReportRequest) {
  const response = await httpClient.get<ApiResponse<OperationalReportEnvelope<OperationalReportRow[]>>>(`/api/operational-reports/${reportType}`, { params });
  return response.data.data;
}

export async function exportOperationalReport(reportType: OperationalReportType, params: OperationalReportRequest) {
  const response = await httpClient.get<ApiResponse<OperationalReportExportDto>>(`/api/operational-reports/${reportType}/export`, { params });
  return response.data.data;
}

export async function printPreviewOperationalReport(reportType: OperationalReportType, params: OperationalReportRequest) {
  const response = await httpClient.get<ApiResponse<OperationalReportExportDto>>(`/api/operational-reports/${reportType}/print-preview`, { params });
  return response.data.data;
}

export async function getShipmentProfitReport(params: ProfitReportRequest) {
  const response = await httpClient.get<ApiResponse<ProfitReportEnvelope<ShipmentProfitDto[]>>>("/api/profit/shipments", { params });
  return response.data.data;
}

export async function getCustomerWiseProfitReport(params: ProfitReportRequest) {
  const response = await httpClient.get<ApiResponse<ProfitReportEnvelope<ProfitGroupRow[]>>>("/api/profit/by-customer", { params });
  return response.data.data;
}

export async function getSalesmanWiseProfitReport(params: ProfitReportRequest) {
  const response = await httpClient.get<ApiResponse<ProfitReportEnvelope<ProfitGroupRow[]>>>("/api/profit/by-salesman", { params });
  return response.data.data;
}

export async function getAgentWiseProfitReport(params: ProfitReportRequest) {
  const response = await httpClient.get<ApiResponse<ProfitReportEnvelope<ProfitGroupRow[]>>>("/api/profit/by-agent", { params });
  return response.data.data;
}

export async function getBranchWiseProfitReport(params: ProfitReportRequest) {
  const response = await httpClient.get<ApiResponse<ProfitReportEnvelope<ProfitGroupRow[]>>>("/api/profit/by-branch", { params });
  return response.data.data;
}

export async function getRouteWiseProfitReport(params: ProfitReportRequest) {
  const response = await httpClient.get<ApiResponse<ProfitReportEnvelope<ProfitGroupRow[]>>>("/api/profit/by-route", { params });
  return response.data.data;
}

export async function getDestinationWiseProfitReport(params: ProfitReportRequest) {
  const response = await httpClient.get<ApiResponse<ProfitReportEnvelope<ProfitGroupRow[]>>>("/api/profit/by-destination", { params });
  return response.data.data;
}

export async function getMasterShipmentProfitLossReport(masterShipmentId: string, reportCurrencyId?: string) {
  const response = await httpClient.get<ApiResponse<ProfitReportEnvelope<MasterShipmentProfitLossReportDto>>>(`/api/profit/master-shipments/${masterShipmentId}/profit-loss`, { params: { reportCurrencyId } });
  return response.data.data;
}
