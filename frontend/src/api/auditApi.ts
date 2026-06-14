import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface AuditSearchRequest {
  pageNumber?: number;
  pageSize?: number;
  tenantId?: string;
  branchId?: string;
  userId?: string;
  role?: string;
  module?: string;
  actionType?: string;
  entityName?: string;
  recordNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
  status?: string;
  failedOnly?: boolean;
}

export interface AuditLogDto {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  moduleName: string;
  entityName: string;
  recordId?: string | null;
  recordNumber?: string | null;
  actionType: string;
  actionName: string;
  actionDescription?: string | null;
  oldValuesJson?: string | null;
  newValuesJson?: string | null;
  changedFieldsJson?: string | null;
  reason?: string | null;
  remarks?: string | null;
  status: string;
  errorMessage?: string | null;
  ipAddress?: string | null;
  requestUrl?: string | null;
  httpMethod?: string | null;
  responseStatusCode?: number | null;
  correlationId?: string | null;
  createdDate: string;
}

export interface UserActivityLogDto {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  activityType: string;
  activityName: string;
  moduleName?: string | null;
  status: string;
  ipAddress?: string | null;
  requestUrl?: string | null;
  httpMethod?: string | null;
  correlationId?: string | null;
  createdDate: string;
}

export interface EntityChangeLogDto {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  entityName: string;
  recordId?: string | null;
  recordNumber?: string | null;
  actionType: string;
  oldValuesJson?: string | null;
  newValuesJson?: string | null;
  changedFieldsJson?: string | null;
  correlationId?: string | null;
  createdDate: string;
}

export interface FinancialAuditLogDto {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  moduleName: string;
  documentType: string;
  documentId?: string | null;
  documentNumber?: string | null;
  actionName: string;
  amount?: number | null;
  currencyId?: string | null;
  status: string;
  errorMessage?: string | null;
  correlationId?: string | null;
  createdDate: string;
}

export interface AccessLogDto {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  moduleName: string;
  actionName: string;
  status: string;
  ipAddress?: string | null;
  requestUrl?: string | null;
  correlationId?: string | null;
  createdDate: string;
  detail1?: string | null;
  detail2?: string | null;
}

export interface ApiRequestLogDto {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  requestUrl: string;
  httpMethod: string;
  requestPayloadJson?: string | null;
  responseStatusCode: number;
  status: string;
  errorMessage?: string | null;
  ipAddress?: string | null;
  durationMs: number;
  correlationId?: string | null;
  createdDate: string;
}

const base = "/api/audit-logs";

export async function searchAuditLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<AuditLogDto>>>(base, { params });
  return response.data.data;
}

export async function getUserActivityLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<UserActivityLogDto>>>(`${base}/user-activity`, { params });
  return response.data.data;
}

export async function getEntityChangeLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<EntityChangeLogDto>>>(`${base}/entity-changes`, { params });
  return response.data.data;
}

export async function getFinancialAuditLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<FinancialAuditLogDto>>>(`${base}/financial`, { params });
  return response.data.data;
}

export async function getReportAccessLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<AccessLogDto>>>(`${base}/reports`, { params });
  return response.data.data;
}

export async function getExportLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<AccessLogDto>>>(`${base}/exports`, { params });
  return response.data.data;
}

export async function getPrintLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<AccessLogDto>>>(`${base}/prints`, { params });
  return response.data.data;
}

export async function getEmailLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<AccessLogDto>>>(`${base}/emails`, { params });
  return response.data.data;
}

export async function getFileAccessLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<AccessLogDto>>>(`${base}/files`, { params });
  return response.data.data;
}

export async function getApiRequestLogs(params: AuditSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<ApiRequestLogDto>>>(`${base}/api-requests`, { params });
  return response.data.data;
}
