import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function ContainerReportPage() { return <OperationalReportPage title={lt("Container Report")} reportType="container-report" filters={{ shipmentStatus: true, modeOfTransport: true, originDestination: true, carrier: true, container: true }} />; }

