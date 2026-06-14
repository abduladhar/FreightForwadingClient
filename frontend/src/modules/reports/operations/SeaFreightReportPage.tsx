import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function SeaFreightReportPage() { return <OperationalReportPage title={lt("Sea Freight Report")} reportType="sea-freight-report" filters={{ customer: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, carrier: true, container: true }} />; }

