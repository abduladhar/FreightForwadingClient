import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface ShipmentRow {
  number: string;
  customer: string;
  mode: "Air" | "Sea" | "Road" | "Courier";
  origin: string;
  destination: string;
  status: string;
  eta?: string | null;
  profit: number;
}

export function useActiveShipmentsQuery() {
  return useQuery({
    queryKey: ["operations", "active-shipments"],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<ShipmentRow[]>>("/api/shipments/active");
      return response.data.data ?? [];
    }
  });
}
