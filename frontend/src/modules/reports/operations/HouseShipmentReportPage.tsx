import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function HouseShipmentReportPage() { return <OperationalReportPage title={lt("House Shipment Report")} reportType="house-shipment-report" filters={{ customer: true, shipmentType: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, route: true }} />; }

