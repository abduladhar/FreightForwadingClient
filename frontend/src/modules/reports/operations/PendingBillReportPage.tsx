import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function PendingBillReportPage() { return <OperationalReportPage title={lt("Pending Bill Report")} reportType="pending-bill-report" filters={{ customer: true, vendor: true, shipmentStatus: true, modeOfTransport: true, originDestination: true }} />; }

