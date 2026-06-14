import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function RoadFreightReportPage() { return <OperationalReportPage title={lt("Road Freight Report")} reportType="road-freight-report" filters={{ customer: true, vendor: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, route: true }} />; }

