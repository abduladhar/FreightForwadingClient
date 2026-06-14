import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function ShipmentAgeingReportPage() { return <OperationalReportPage title={lt("Shipment Ageing Report")} reportType="shipment-ageing-report" filters={{ customer: true, shipmentType: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, route: true }} />; }

