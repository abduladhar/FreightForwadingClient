import { ProfitReportPage, shipmentProfitColumns } from "@/modules/reports/operations/_profitShared";
import { lt } from "@/modules/operationsLocalization";
export function ShipmentProfitReportPage() { return <ProfitReportPage title={lt("Shipment Profit")} mode="shipment-profit" columns={shipmentProfitColumns} />; }
