import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function GoodsReceiptReportPage() { return <OperationalReportPage title={lt("Goods Receipt Report")} reportType="goods-receipt-report" filters={{ customer: true, shipmentStatus: true, originDestination: true }} />; }

