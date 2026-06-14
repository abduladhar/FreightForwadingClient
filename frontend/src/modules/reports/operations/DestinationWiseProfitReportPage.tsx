import { groupedProfitColumns, ProfitReportPage } from "@/modules/reports/operations/_profitShared";
import { lt } from "@/modules/operationsLocalization";
export function DestinationWiseProfitReportPage() { return <ProfitReportPage title={lt("Destination Profit")} mode="destination-wise-profit" columns={groupedProfitColumns} />; }
