import type { ColumnDef } from "@tanstack/react-table";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";
type Row = { groupName: string; accountCode: string; accountName: string; amount: number };
const columns: ColumnDef<Row>[] = [{ accessorKey: "groupName", header: lt("Group") }, { accessorKey: "accountCode", header: lt("Account Code") }, { accessorKey: "accountName", header: lt("Account Name") }, { accessorKey: "amount", header: lt("Amount") }];
export function TradingProfitAndLossPage() {
  return <AccountingReportPage<Row> title={lt("Trading P&L")} reportType="trading-profit-and-loss" mapRows={(data) => {
    const payload = data as { rows?: Row[] } | undefined;
    return payload?.rows ?? [];
  }} columns={columns} showCurrency summaryBuilder={(rows, data) => {
    const payload = data as { tradingIncome?: number; directCost?: number; tradingProfit?: number; indirectExpenses?: number; netProfit?: number } | undefined;
    if (payload) {
      return [
        { label: lt("Trading Income"), value: (payload.tradingIncome ?? 0).toFixed(2) },
        { label: lt("Direct Cost"), value: (payload.directCost ?? 0).toFixed(2) },
        { label: lt("Trading Profit"), value: (payload.tradingProfit ?? 0).toFixed(2) },
        { label: lt("Indirect Expenses"), value: (payload.indirectExpenses ?? 0).toFixed(2) },
        { label: lt("Net Profit"), value: (payload.netProfit ?? 0).toFixed(2) }
      ];
    }
    return [{ label: lt("Rows"), value: rows.length }];
  }} totalsBuilder={(rows) => [{ label: lt("Rows Total"), value: rows.reduce((s, x) => s + x.amount, 0).toFixed(2) }]} />;
}
