import { OperationalReportPage } from "@/modules/reports/operations/_shared";
import { lt } from "@/modules/operationsLocalization";
export function QuotationReportPage() { return <OperationalReportPage title={lt("Quotation Report")} reportType="quotation-report" filters={{ customer: true, agent: true, shipmentType: true, shipmentStatus: true, modeOfTransport: true, currency: true, originDestination: true }} />; }

