import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function MasterShipmentReportPage() { return <OperationalReportPage title={lt("Master Shipment Report")} reportType="master-shipment-report" filters={{ shipmentType: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, route: true, carrier: true, container: true }} />; }

