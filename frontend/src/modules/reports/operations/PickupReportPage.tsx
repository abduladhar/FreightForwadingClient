import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function PickupReportPage() { return <OperationalReportPage title={lt("Pickup Report")} reportType="pickup-report" filters={{ customer: true, vendor: true, shipmentStatus: true, currency: true, originDestination: true }} />; }

