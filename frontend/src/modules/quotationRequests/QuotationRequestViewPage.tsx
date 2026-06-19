import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Download, FileText, Pencil } from "lucide-react";
import { getQuotationRequest, getQuotationRequestAttachmentDownloadUrl } from "@/api/quotationRequestApi";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translateAttachmentType, translateQuotationMode, translateQuotationStatus, translateShipmentType, useQuotationRequestI18n } from "@/modules/quotationRequests/quotationRequestI18n";

export function QuotationRequestViewPage() {
  const qr = useQuotationRequestI18n();
  const { requestId = "" } = useParams();
  const query = useQuery({ queryKey: ["quotation-request", requestId], queryFn: () => getQuotationRequest(requestId), enabled: Boolean(requestId) });
  const request = query.data;

  return <div className="space-y-4">
    <PageHeader
      title={request ? qr("View.TitleWithNumber", "Quotation Request {0}").replace("{0}", request.requestNumber) : qr("View.Title", "Quotation Request")}
      description={qr("View.Description", "Client request details and uploaded attachments.")}
      actions={<div className="flex gap-2"><Button variant="outline" asChild><Link to="/quotation-requests">{qr("View.Back", "Back")}</Link></Button>{request ? <Button asChild><Link to={`/quotation-requests/${request.id}/edit`}><Pencil className="h-4 w-4" />{qr("List.EditRequest", "Edit Request")}</Link></Button> : null}</div>}
    />
    {request ? <>
      <Card>
        <CardHeader><CardTitle>{qr("View.RequestDetails", "Request Details")}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label={qr("Label.CustomerName", "Customer Name")} value={request.customerName} />
          <Field label={qr("Label.Company", "Company")} value={request.companyName || "-"} />
          <Field label={qr("Label.Email", "Email")} value={request.email} />
          <Field label={qr("Label.Phone", "Phone")} value={request.phone} />
          <Field label={qr("Label.Origin", "Origin")} value={request.origin} />
          <Field label={qr("Label.Destination", "Destination")} value={request.destination} />
          <Field label={qr("Label.Mode", "Mode")} value={translateQuotationMode(qr, request.modeOfTransport)} />
          <Field label={qr("Label.ShipmentType", "Shipment Type")} value={translateShipmentType(qr, request.shipmentType)} />
          <div><p className="text-xs text-muted-foreground">{qr("Label.Status", "Status")}</p><StatusBadge status={request.status} label={translateQuotationStatus(qr, request.status)} /></div>
          <div className="md:col-span-3"><Field label={qr("Label.CargoDescription", "Cargo Description")} value={request.cargoDescription || "-"} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{qr("View.Attachments", "Attachments")}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {request.attachments.length ? request.attachments.map((attachment) => <div key={attachment.id} className="flex flex-col gap-3 rounded-md border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{attachment.originalFileName}</p>
                <p className="text-xs text-muted-foreground">{translateAttachmentType(qr, attachment.attachmentType)} - {attachment.contentType || "application/octet-stream"} - {formatBytes(attachment.fileSizeBytes)}</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void getQuotationRequestAttachmentDownloadUrl(request.id, attachment.documentFileId).then((signed) => window.location.assign(signed.downloadUrl))}><Download className="h-4 w-4" />{qr("View.Download", "Download")}</Button>
          </div>) : <p className="text-sm text-muted-foreground">{qr("View.NoAttachments", "No attachments uploaded.")}</p>}
        </CardContent>
      </Card>
    </> : <Card><CardContent className="pt-6 text-sm text-muted-foreground">{query.isLoading ? qr("View.Loading", "Loading request...") : qr("View.NotFound", "Quotation request was not found.")}</CardContent></Card>}
  </div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="break-words text-sm font-medium text-slate-900">{value}</p></div>;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
