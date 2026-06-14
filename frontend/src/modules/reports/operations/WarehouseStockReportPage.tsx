import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function WarehouseStockReportPage() { return <OperationalReportPage title={lt("Warehouse Stock Report")} reportType="warehouse-stock-report" filters={{ shipmentStatus: true, originDestination: true, container: true }} />; }

