import { groupedProfitColumns, ProfitReportPage } from "@/modules/reports/operations/_profitShared";
import { lt } from "@/modules/operationsLocalization";
export function BranchWiseProfitReportPage() { return <ProfitReportPage title={lt("Branch Profit")} mode="branch-wise-profit" columns={groupedProfitColumns} />; }
