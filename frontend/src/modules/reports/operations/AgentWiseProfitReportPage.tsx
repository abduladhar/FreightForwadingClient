import { groupedProfitColumns, ProfitReportPage } from "@/modules/reports/operations/_profitShared";
import { lt } from "@/modules/operationsLocalization";
export function AgentWiseProfitReportPage() { return <ProfitReportPage title={lt("Agent Profit")} mode="agent-wise-profit" columns={groupedProfitColumns} />; }
