import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface WorkbenchSignal {
  label: string;
  value: string;
  tone: "blue" | "green" | "amber" | "red" | "slate";
}

export interface WorkbenchActivityRow {
  id: string;
  event: string;
  status: string;
  owner: string;
}

export interface ModuleWorkbenchPayload {
  signals: WorkbenchSignal[];
  activityRows: WorkbenchActivityRow[];
}

export function useModuleWorkbenchQuery(moduleId: string) {
  return useQuery({
    queryKey: ["workbench", moduleId],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<ModuleWorkbenchPayload>>(`/api/modules/${moduleId}/workbench`);
      return response.data.data ?? { signals: [], activityRows: [] };
    },
    enabled: Boolean(moduleId)
  });
}
