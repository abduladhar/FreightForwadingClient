import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function UnbilledShipmentReportPage() { return <OperationalReportPage title={lt("Unbilled Shipment Report")} reportType="unbilled-shipment-report" filters={{ customer: true, shipmentType: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, route: true }} />; }

