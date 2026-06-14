import { groupedProfitColumns, ProfitReportPage } from "@/modules/reports/operations/_profitShared";
import { lt } from "@/modules/operationsLocalization";
export function SalesmanWiseProfitReportPage() { return <ProfitReportPage title={lt("Salesman Profit")} mode="salesman-wise-profit" columns={groupedProfitColumns} />; }
