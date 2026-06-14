import { groupedProfitColumns, ProfitReportPage } from "@/modules/reports/operations/_profitShared";
import { lt } from "@/modules/operationsLocalization";
export function CustomerWiseProfitReportPage() { return <ProfitReportPage title={lt("Customer Profit")} mode="customer-wise-profit" columns={groupedProfitColumns} />; }
