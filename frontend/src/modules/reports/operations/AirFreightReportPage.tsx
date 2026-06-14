import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function AirFreightReportPage() { return <OperationalReportPage title={lt("Air Freight Report")} reportType="air-freight-report" filters={{ customer: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, carrier: true }} />; }

