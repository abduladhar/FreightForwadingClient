import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";
import type { Branch, BranchOption, BranchSettings, BranchSettingsUpdateRequest, BranchUpsertRequest } from "@/types/branch";

export async function getBranches() {
  const response = await httpClient.get<ApiResponse<Branch[]>>("/api/branches", {
    headers: { "X-Suppress-Error-Toast": "true" }
  });
  return response.data.data ?? [];
}

export async function getBranchOptions(): Promise<BranchOption[]> {
  const branches = await getBranches();
  return branches.map((branch) => ({
    id: branch.branchId,
    code: branch.branchCode,
    name: branch.branchName
  }));
}

export async function getBranchById(branchId: string) {
  const response = await httpClient.get<ApiResponse<Branch>>(`/api/branches/${branchId}`);
  return response.data.data;
}

export async function createBranch(request: BranchUpsertRequest) {
  const response = await httpClient.post<ApiResponse<Branch>>("/api/branches", request);
  return response.data.data;
}

export async function updateBranch(branchId: string, request: BranchUpsertRequest) {
  const response = await httpClient.put<ApiResponse<Branch>>(`/api/branches/${branchId}`, request);
  return response.data.data;
}

export async function deleteBranch(branchId: string) {
  await httpClient.delete(`/api/branches/${branchId}`);
}

export async function getBranchSettings(branchId: string) {
  const response = await httpClient.get<ApiResponse<BranchSettings>>(`/api/branches/${branchId}/settings`);
  return response.data.data;
}

export async function updateBranchSettings(branchId: string, request: BranchSettingsUpdateRequest) {
  const response = await httpClient.put<ApiResponse<BranchSettings>>(`/api/branches/${branchId}/settings`, request);
  return response.data.data;
}
