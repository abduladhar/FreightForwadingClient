import { groupedProfitColumns, ProfitReportPage } from "@/modules/reports/operations/_profitShared";
import { lt } from "@/modules/operationsLocalization";
export function RouteWiseProfitReportPage() { return <ProfitReportPage title={lt("Route Profit")} mode="route-wise-profit" columns={groupedProfitColumns} />; }
