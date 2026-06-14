import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface JobTypeDto {
  id: string;
  jobTypeCode: string;
  jobTypeShortCode: string;
  jobTypeName: string;
  description?: string | null;
  isActive: boolean;
}

export interface JobTypeRequest {
  jobTypeCode: string;
  jobTypeShortCode: string;
  jobTypeName: string;
  description?: string | null;
  isActive: boolean;
}

export interface JobDto {
  id: string;
  jobTypeId: string;
  jobTypeCode: string;
  jobTypeShortCode: string;
  jobTypeName: string;
  jobNumber: string;
  description: string;
  isActive: boolean;
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

export interface JobRequest {
  jobTypeId: string;
  description?: string | null;
  isActive: boolean;
}

export interface JobTypeSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  jobTypeCode?: string;
  jobTypeShortCode?: string;
  jobTypeName?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface JobSearchParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  jobTypeId?: string;
  jobNumber?: string;
  description?: string;
  isActive?: boolean;
  invoiceDefined?: boolean;
  billDefined?: boolean;
  invoiceFullyReceived?: boolean;
  billFullyPaid?: boolean;
  invoiceCancelled?: boolean;
  billCancelled?: boolean;
  unpaidInvoice?: boolean;
  unpaidBill?: boolean;
  pendingInvoicePosting?: boolean;
  pendingBillPosting?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export async function searchJobTypes(params: JobTypeSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<JobTypeDto>>>("/api/job-types/search-job-types", {
    params: { ...params, sortBy: params.sortBy ?? "SerialNo", sortDirection: params.sortDirection ?? "desc" }
  });
  return response.data.data;
}

export async function getJobTypeByGuid(id: string) {
  const response = await httpClient.get<ApiResponse<JobTypeDto>>(`/api/job-types/get-job-type-by-guid/${id}`);
  return response.data.data;
}

export async function createJobType(request: JobTypeRequest) {
  const response = await httpClient.post<ApiResponse<JobTypeDto>>("/api/job-types/create-job-type", request);
  return response.data.data;
}

export async function updateJobType(id: string, request: JobTypeRequest) {
  const response = await httpClient.put<ApiResponse<JobTypeDto>>(`/api/job-types/update-job-type/${id}`, request);
  return response.data.data;
}

export async function deleteJobType(id: string) {
  await httpClient.delete(`/api/job-types/delete-job-type/${id}`);
}

export async function getActiveJobTypesForDropdown(search?: string) {
  const response = await httpClient.get<ApiResponse<JobTypeDto[]>>("/api/job-types/active-dropdown", { params: { search } });
  return response.data.data ?? [];
}

export async function searchJobs(params: JobSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<JobDto>>>("/api/jobs/search-jobs", {
    params: { ...params, jobTypeId: params.jobTypeId || undefined, sortBy: params.sortBy ?? "SerialNo", sortDirection: params.sortDirection ?? "desc" }
  });
  return response.data.data;
}

export async function getJobByGuid(id: string) {
  const response = await httpClient.get<ApiResponse<JobDto>>(`/api/jobs/get-job-by-guid/${id}`);
  return response.data.data;
}

export async function createJob(request: JobRequest) {
  const response = await httpClient.post<ApiResponse<JobDto>>("/api/jobs/create-job", request);
  return response.data.data;
}

export async function updateJob(id: string, request: JobRequest) {
  const response = await httpClient.put<ApiResponse<JobDto>>(`/api/jobs/update-job/${id}`, request);
  return response.data.data;
}

export async function deleteJob(id: string) {
  await httpClient.delete(`/api/jobs/delete-job/${id}`);
}

export async function getActiveJobsForDropdown(search?: string) {
  const response = await httpClient.get<ApiResponse<JobDto[]>>("/api/jobs/active-dropdown", { params: { search } });
  return response.data.data ?? [];
}
