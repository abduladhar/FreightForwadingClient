import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function PendingDocumentReportPage() { return <OperationalReportPage title={lt("Pending Document Report")} reportType="pending-document-report" filters={{ customer: true, shipmentType: true, shipmentStatus: true, modeOfTransport: true, originDestination: true, carrier: true, container: true }} />; }

