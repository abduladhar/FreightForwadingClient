import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Copy, ExternalLink, Send } from "lucide-react";
import { createPublicQuotationRequest, type PublicQuotationRequestCreateRequest, type PublicQuotationRequestCreated } from "@/api/quotationRequestApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { PublicLanguageSelector } from "@/modules/quotationRequests/PublicLanguageSelector";
import { useQuotationRequestI18n } from "@/modules/quotationRequests/quotationRequestI18n";

const initialValue: PublicQuotationRequestCreateRequest = {
  customerName: "",
  email: "",
  phone: "",
  companyName: "",
  origin: "",
  destination: "",
  modeOfTransport: "Air",
  shipmentType: "General",
  cargoDescription: ""
};

export function PublicQuotationRequestCreatePage() {
  const qr = useQuotationRequestI18n();
  const [value, setValue] = useState(initialValue);
  const [created, setCreated] = useState<PublicQuotationRequestCreated | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploadUrl = useMemo(() => created ? `${window.location.origin}${created.uploadPath}` : "", [created]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await createPublicQuotationRequest(value);
      setCreated(response);
      toast.success(qr("Create.CreatedToast", "Quotation request created"), response.request.requestNumber);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(uploadUrl);
    toast.success(qr("Create.LinkCopiedToast", "Link copied"), qr("Create.LinkCopiedDetail", "Share it with the client to upload files, video, or audio."));
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <p className="text-sm font-medium text-blue-700">{qr("AppName", "Freight Forwarding ERP")}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">{qr("Create.Title", "Quotation Request")}</h1>
      </header>

      <PublicLanguageSelector />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <Card>
            <CardHeader><CardTitle>{qr("Create.ShipmentDetails", "Shipment Details")}</CardTitle></CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={submit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={qr("Label.CustomerName", "Customer Name")}><Input required placeholder={qr("Placeholder.CustomerName", "Enter customer name")} value={value.customerName} onChange={(e) => setValue({ ...value, customerName: e.target.value })} /></Field>
                  <Field label={qr("Label.Company", "Company")}><Input placeholder={qr("Placeholder.Company", "Enter company name")} value={value.companyName ?? ""} onChange={(e) => setValue({ ...value, companyName: e.target.value })} /></Field>
                  <Field label={qr("Label.Email", "Email")}><Input required type="email" placeholder={qr("Placeholder.Email", "Enter email address")} value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} /></Field>
                  <Field label={qr("Label.Phone", "Phone")}><Input required placeholder={qr("Placeholder.Phone", "Enter phone number")} value={value.phone} onChange={(e) => setValue({ ...value, phone: e.target.value })} /></Field>
                  <Field label={qr("Label.Origin", "Origin")}><Input required placeholder={qr("Placeholder.Origin", "Enter origin")} value={value.origin} onChange={(e) => setValue({ ...value, origin: e.target.value })} /></Field>
                  <Field label={qr("Label.Destination", "Destination")}><Input required placeholder={qr("Placeholder.Destination", "Enter destination")} value={value.destination} onChange={(e) => setValue({ ...value, destination: e.target.value })} /></Field>
                  <Field label={qr("Label.Mode", "Mode")}>
                    <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={value.modeOfTransport} onChange={(e) => setValue({ ...value, modeOfTransport: e.target.value })}>
                      <option value="Air">{qr("Mode.Air", "Air")}</option><option value="Sea">{qr("Mode.Sea", "Sea")}</option><option value="Road">{qr("Mode.Road", "Road")}</option><option value="Courier">{qr("Mode.Courier", "Courier")}</option>
                    </select>
                  </Field>
                  <Field label={qr("Label.ShipmentType", "Shipment Type")}>
                    <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={value.shipmentType} onChange={(e) => setValue({ ...value, shipmentType: e.target.value })}>
                      <option value="General">{qr("ShipmentType.General", "General")}</option><option value="Import">{qr("ShipmentType.Import", "Import")}</option><option value="Export">{qr("ShipmentType.Export", "Export")}</option><option value="Door to Door">{qr("ShipmentType.DoorToDoor", "Door to Door")}</option>
                    </select>
                  </Field>
                </div>
                <Field label={qr("Label.CargoDescription", "Cargo Description")}><Textarea rows={4} placeholder={qr("Placeholder.CargoDescription", "Describe cargo, weight, volume, and handling notes")} value={value.cargoDescription ?? ""} onChange={(e) => setValue({ ...value, cargoDescription: e.target.value })} /></Field>
                <div className="flex justify-end"><Button type="submit" disabled={isSubmitting}><Send className="h-4 w-4" />{isSubmitting ? qr("Create.Creating", "Creating...") : qr("Create.CreateRequest", "Create Request")}</Button></div>
              </form>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{qr("Create.UploadLink", "Upload Link")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {created ? <>
                <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{qr("Create.RequestReady", "Request {0} is ready.").replace("{0}", created.request.requestNumber)}</div>
                <div className="break-all rounded-md border bg-slate-50 p-3 text-sm text-slate-700">{uploadUrl}</div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <Button type="button" variant="outline" onClick={() => void copyLink()}><Copy className="h-4 w-4" />{qr("Create.CopyLink", "Copy Link")}</Button>
                  <Button asChild><Link to={created.uploadPath}><ExternalLink className="h-4 w-4" />{qr("Create.OpenUpload", "Open Upload")}</Link></Button>
                </div>
              </> : <p className="text-sm text-muted-foreground">{qr("Create.EmptyUploadLink", "Create a request to generate a private upload link.")}</p>}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  </main>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-1.5"><Label>{label}</Label>{children}</label>;
}
