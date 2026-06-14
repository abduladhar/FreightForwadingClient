import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";
import type { DashboardEnvelope, DashboardRequest } from "@/types/dashboard";

export async function getDashboard(params?: DashboardRequest) {
  const response = await httpClient.get<ApiResponse<DashboardEnvelope>>("/api/dashboard", { params });
  return response.data.data;
}

export function useDashboardQuery(params?: DashboardRequest) {
  return useQuery({
    queryKey: ["dashboard", params],
    queryFn: () => getDashboard(params)
  });
}
