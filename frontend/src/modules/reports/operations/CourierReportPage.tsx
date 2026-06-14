import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function CourierReportPage() { return <OperationalReportPage title={lt("Courier Report")} reportType="courier-report" filters={{ customer: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, route: true }} />; }

