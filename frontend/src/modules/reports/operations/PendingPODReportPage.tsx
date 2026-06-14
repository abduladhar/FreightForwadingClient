import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function PendingPODReportPage() { return <OperationalReportPage title={lt("Pending POD Report")} reportType="pending-pod-report" filters={{ customer: true, vendor: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, route: true }} />; }

