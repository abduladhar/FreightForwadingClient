import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Download, Mail } from "lucide-react";
import { getBranchById } from "@/api/branchApi";
import { getQuotation, getQuotationPdfPreview, sendQuotationEmail } from "@/api/quotationApi";
import { getTenantById } from "@/api/tenantApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/hooks/useWorkspace";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { useQuotationI18n } from "@/modules/quotations/quotationI18n";
import { exportQuotationPdf } from "@/utils/quotationPdf";

export function QuotationPrintPreviewPage() {
  const q = useQuotationI18n();
  const { quotationId = "" } = useParams();
  const workspace = useWorkspace();
  const { session } = useAuth();
  const [emailTo, setEmailTo] = useState("");
  const quotation = useQuery({ queryKey: ["quotation-print", quotationId], queryFn: () => getQuotation(quotationId), enabled: Boolean(quotationId) });
  const preview = useQuery({ queryKey: ["quotation-pdf-preview", quotationId], queryFn: () => getQuotationPdfPreview(quotationId), enabled: Boolean(quotationId) });
  const tenant = useQuery({ queryKey: ["tenant-logo", session?.tenantId], queryFn: () => getTenantById(session!.tenantId!), enabled: Boolean(session?.tenantId) });
  const branch = useQuery({ queryKey: ["branch-print", session?.branchId], queryFn: () => getBranchById(session!.branchId!), enabled: Boolean(session?.branchId) });
  if (quotation.isLoading || preview.isLoading) return <LoadingScreen />;
  if (quotation.isError || preview.isError || !quotation.data || !preview.data) return <ErrorState onRetry={() => { void quotation.refetch(); void preview.refetch(); }} />;

  const data = quotation.data;
  const fallbackLogoPath = `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const logoUrl = tenant.data?.logoUrl?.trim() || fallbackLogoPath;
  const branchAddress = branch.data?.address?.trim() || q("Sample Address Line 1, City, Country");
  const isRightToLeft = workspace.cultureCode.toLowerCase().startsWith("ar");

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${q("Print")}: ${data.quotationNumber}`}
        description={q("Print preview, PDF export, and email quotation.")}
        actions={<>
          <AuditTrailButton />
          <PermissionButton
            className={masterDataButtonClass}
            permission="Quotation.Export"
            variant="outline"
            onClick={() => void exportQuotationPdf({
              fileName: `${data.quotationNumber}.pdf`,
              tenantName: workspace.tenantCode,
              branchName: workspace.branchName ?? q("Branch"),
              branchAddress,
              logoUrl,
              quotation: data,
              translate: q,
              isRightToLeft
            })}
          >
            <Download className="h-4 w-4" /> {q("PDF Export")}
          </PermissionButton>
          <PermissionButton className={masterDataButtonClass} permission="Quotation.Export" variant="outline" onClick={() => void sendQuotationEmail(quotationId, emailTo)} disabled={!emailTo.trim()}><Mail className="h-4 w-4" /> {q("Email Quotation")}</PermissionButton>
        </>}
      />
      <Card className={masterDataPanelClass}>
        <CardContent className={`${masterDataPanelContentClass} grid gap-3 md:grid-cols-2`}>
          <Input placeholder={q("Email to")} value={emailTo} onChange={(event) => setEmailTo(event.target.value)} />
          <Input value={logoUrl} readOnly />
        </CardContent>
      </Card>
      <PrintPreview title={`${q("Quotation")} ${data.quotationNumber}`}>
        <div className="space-y-4 text-sm" dir={isRightToLeft ? "rtl" : "ltr"}>
          <div className="border-b pb-3">
            <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[260px_1fr_260px]">
              <div className="flex justify-start">{logoUrl ? <img src={logoUrl} alt={q("Logo")} className="h-28 w-28 object-contain" /> : <div className="h-28 w-28" />}</div>
              <div className="text-center"><h3 className="text-xl font-bold tracking-wide">{q("Quotation").toLocaleUpperCase()}</h3></div>
              <div className="text-right"><p className="font-semibold">{workspace.branchName ?? q("Branch")}</p><p className="text-muted-foreground">{branchAddress}</p></div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 rounded-md border p-2">
              <p><span className="font-medium">{q("Quotation No")}:</span> {data.quotationNumber}</p>
              <p><span className="font-medium">{q("Date")}:</span> {data.quotationDate}</p>
              <p><span className="font-medium">{q("Valid Until")}:</span> {data.validUntilDate}</p>
              <p><span className="font-medium">{q("Status")}:</span> {q(data.status)}</p>
            </div>
            <div className="space-y-1 rounded-md border p-2">
              <p><span className="font-medium">{q("Service Type")}:</span> {data.serviceType}</p>
              <p><span className="font-medium">{q("Mode")}:</span> {q(data.modeOfTransport)}</p>
              <p><span className="font-medium">{q("Shipment Type")}:</span> {q(data.shipmentType)}</p>
              <p><span className="font-medium">{q("Route")}:</span> {data.origin} - {data.destination}</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-xs">
              <thead className="bg-muted"><tr><th className="px-2 py-2 text-left">{q("Charge Head")}</th><th className="px-2 py-2 text-left">{q("Code")}</th><th className="px-2 py-2 text-right">{q("Qty")}</th><th className="px-2 py-2 text-right">{q("Rate")}</th><th className="px-2 py-2 text-right">{q("Tax")}</th><th className="px-2 py-2 text-right">{q("Amount")}</th></tr></thead>
              <tbody>{data.charges.map((charge) => <tr key={charge.id} className="border-t"><td className="px-2 py-1.5">{charge.chargeHeadName || charge.chargeName}</td><td className="px-2 py-1.5">{charge.chargeCode}</td><td className="px-2 py-1.5 text-right">{charge.quantity.toFixed(2)}</td><td className="px-2 py-1.5 text-right">{charge.unitRate.toFixed(2)}</td><td className="px-2 py-1.5 text-right">{charge.taxAmount.toFixed(2)}</td><td className="px-2 py-1.5 text-right">{charge.totalAmount.toFixed(2)}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="ml-auto w-full rounded-md border p-2 text-xs sm:w-64">
            <div className="flex justify-between"><span>{q("Sub Total")}</span><span>{data.subTotalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>{q("Discount")}</span><span>{data.discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>{q("Tax")}</span><span>{data.taxAmount.toFixed(2)}</span></div>
            <div className="mt-1 flex justify-between border-t pt-1 font-semibold"><span>{q("Grand Total")}</span><span>{data.totalAmount.toFixed(2)}</span></div>
          </div>
        </div>
      </PrintPreview>
    </div>
  );
}
