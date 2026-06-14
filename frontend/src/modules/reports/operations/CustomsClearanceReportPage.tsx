import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function CustomsClearanceReportPage() { return <OperationalReportPage title={lt("Customs Report")} reportType="customs-clearance-report" filters={{ customer: true, vendor: true, shipmentStatus: true, currency: true, originDestination: true }} />; }
