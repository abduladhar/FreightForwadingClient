import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function DirectShipmentReportPage() { return <OperationalReportPage title={lt("Direct Shipment Report")} reportType="direct-shipment-report" filters={{ customer: true, shipmentType: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, route: true, carrier: true }} />; }

