import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

export interface SalesmanTarget {
  id: string; salesmanId: string; salesmanName: string; periodStart: string; periodEnd: string; targetType: string; targetAmount: number; isActive: boolean;
}
export interface IncentiveRule {
  id: string; salesmanId?: string | null; salesmanName: string; ruleName: string; basis: string; thresholdAmount: number; incentivePercentage: number; incentiveType: "Percentage" | "Fixed"; fixedAmount: number; fromAchievementPercentage: number; toAchievementPercentage: number; ownIncentivePercentage: number; childIncentivePercentage: number; isActive: boolean; slabs: IncentiveSlab[];
}
export interface IncentiveSlab {
  id?: string; fromAmount: number; toAmount?: number | null; incentiveType: "Percentage" | "Fixed"; incentivePercentage: number; fixedAmount: number; isActive: boolean;
}
export interface SalesmanPerformance {
  salesmanId: string; salesmanName: string; fromDate: string; toDate: string; revenueAmount: number; collectionAmount: number; profitAmount: number; operationCount: number; targetAmount: number; achievementPercent: number; incentiveAmount: number;
}
export interface SalesmanIncentiveSlabBreakdown {
  slabId?: string | null; fromAmount: number; toAmount?: number | null; appliedAmount: number; incentiveType: "Percentage" | "Fixed"; incentivePercentage: number; fixedAmount: number; incentiveAmount: number;
}
export interface SalesmanIncentive {
  id: string; salesmanId: string; salesmanName: string; basis: string; fromDate: string; toDate: string; basisAmount: number; targetAmount: number; eligibleAmount: number; incentiveAmount: number; currencyId: string; exchangeRate: number; status: string; isPaid: boolean; paidDate?: string | null; ledgerEntryId?: string | null; remarks: string; sources: { id: string; sourceType: string; sourceId: string; sourceNumber: string; sourceDate: string; basisAmount: number }[]; slabBreakdown: SalesmanIncentiveSlabBreakdown[];
}
export interface EmployeeIncentiveReportRequest {
  branchId?: string | null; employeeGuid?: string | null; periodFrom: string; periodTo: string; includeInactiveEmployees: boolean; includeOnlySalesEmployees: boolean; pageNumber?: number; pageSize?: number;
}
export interface EmployeeIncentiveTreeReport {
  employeeId: number; employeeGuid: string; employeeName: string; roleName: string; parentEmployeeGuid?: string | null; level: number; ownTargetAmount: number; ownAchievedAmount: number; ownAchievementPercentage: number; ownIncentiveAmount: number; childTargetAmount: number; childAchievedAmount: number; childAchievementPercentage: number; childIncentiveAmount: number; totalTeamTargetAmount: number; totalTeamAchievedAmount: number; totalTeamAchievementPercentage: number; totalIncentiveAmount: number; directChildCount: number; totalChildCount: number; hierarchyPath: string;
}
export async function getSalesmanTargets() { const response = await httpClient.get<ApiResponse<SalesmanTarget[]>>("/api/sales-performance/targets"); return response.data.data ?? []; }
export async function saveSalesmanTarget(request: Omit<SalesmanTarget, "id" | "salesmanName">, id?: string) { const response = id ? await httpClient.put<ApiResponse<SalesmanTarget>>(`/api/sales-performance/targets/${id}`, request) : await httpClient.post<ApiResponse<SalesmanTarget>>("/api/sales-performance/targets", request); return response.data.data; }
export async function getIncentiveRules() { const response = await httpClient.get<ApiResponse<IncentiveRule[]>>("/api/sales-performance/incentive-rules"); return response.data.data ?? []; }
export async function saveIncentiveRule(request: Omit<IncentiveRule, "id" | "salesmanName">, id?: string) { const response = id ? await httpClient.put<ApiResponse<IncentiveRule>>(`/api/sales-performance/incentive-rules/${id}`, request) : await httpClient.post<ApiResponse<IncentiveRule>>("/api/sales-performance/incentive-rules", request); return response.data.data; }
export async function calculateSalesmanPerformance(fromDate: string, toDate: string, salesmanId?: string | null) { const response = await httpClient.get<ApiResponse<SalesmanPerformance[]>>("/api/sales-performance/calculate", { params: { fromDate, toDate, salesmanId: salesmanId || undefined } }); return response.data.data ?? []; }
export async function getSalesmanIncentives(salesmanId?: string | null, status?: string | null) { const response = await httpClient.get<ApiResponse<SalesmanIncentive[]>>("/api/sales-performance/incentives", { params: { salesmanId: salesmanId || undefined, status: status || undefined } }); return response.data.data ?? []; }
export async function calculateSalesmanIncentive(request: { salesmanId: string; fromDate: string; toDate: string; basis: string; currencyId: string; exchangeRate: number; remarks?: string | null }) { const response = await httpClient.post<ApiResponse<SalesmanIncentive>>("/api/sales-performance/incentives/calculate", request); return response.data.data; }
export async function recalculateSalesmanIncentive(id: string) { const response = await httpClient.post<ApiResponse<SalesmanIncentive>>(`/api/sales-performance/incentives/${id}/recalculate`, {}); return response.data.data; }
export async function postSalesmanIncentive(id: string) { const response = await httpClient.post<ApiResponse<SalesmanIncentive>>(`/api/sales-performance/incentives/${id}/post`, {}); return response.data.data; }
export async function markSalesmanIncentivePaid(id: string, paidDate: string) { const response = await httpClient.post<ApiResponse<SalesmanIncentive>>(`/api/sales-performance/incentives/${id}/mark-paid`, { paidDate }); return response.data.data; }
export async function getEmployeeIncentiveTreeReport(request: EmployeeIncentiveReportRequest) { const response = await httpClient.post<ApiResponse<EmployeeIncentiveTreeReport[]>>("/api/incentive/employee-tree-report", request); return response.data.data ?? []; }
