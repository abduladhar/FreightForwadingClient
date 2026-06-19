import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { getQuotationRequest, updateQuotationRequest, type PublicQuotationRequestCreateRequest } from "@/api/quotationRequestApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { translateQuotationStatus, useQuotationRequestI18n } from "@/modules/quotationRequests/quotationRequestI18n";

type QuotationRequestEditForm = PublicQuotationRequestCreateRequest & { status: string };

const emptyValue: QuotationRequestEditForm = {
  customerName: "",
  email: "",
  phone: "",
  companyName: "",
  origin: "",
  destination: "",
  modeOfTransport: "Air",
  shipmentType: "General",
  cargoDescription: "",
  status: "Open"
};

export function QuotationRequestEditPage() {
  const qr = useQuotationRequestI18n();
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["quotation-request", requestId], queryFn: () => getQuotationRequest(requestId), enabled: Boolean(requestId) });
  const [value, setValue] = useState<QuotationRequestEditForm>(emptyValue);

  useEffect(() => {
    if (!query.data) return;
    setValue({
      customerName: query.data.customerName,
      email: query.data.email,
      phone: query.data.phone,
      companyName: query.data.companyName,
      origin: query.data.origin,
      destination: query.data.destination,
      modeOfTransport: query.data.modeOfTransport,
      shipmentType: query.data.shipmentType,
      cargoDescription: query.data.cargoDescription,
      status: query.data.status
    });
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: () => updateQuotationRequest(requestId, value),
    onSuccess: async (updated) => {
      toast.success(qr("Edit.UpdatedToast", "Quotation request updated"), updated.requestNumber);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quotation-request", requestId] }),
        queryClient.invalidateQueries({ queryKey: ["quotation-requests"] })
      ]);
      navigate(`/quotation-requests/${updated.id}`);
    }
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return <div className="space-y-4">
    <PageHeader
      title={query.data ? qr("Edit.TitleWithNumber", "Edit Quotation Request {0}").replace("{0}", query.data.requestNumber) : qr("Edit.Title", "Edit Quotation Request")}
      description={qr("Edit.Description", "Update client request details and status.")}
      actions={<Button variant="outline" asChild><Link to={requestId ? `/quotation-requests/${requestId}` : "/quotation-requests"}>{qr("View.Back", "Back")}</Link></Button>}
    />
    <Card>
      <CardHeader><CardTitle>{qr("View.RequestDetails", "Request Details")}</CardTitle></CardHeader>
      <CardContent>
        {query.isLoading ? <p className="text-sm text-muted-foreground">{qr("View.Loading", "Loading request...")}</p> : query.data ? <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={qr("Label.CustomerName", "Customer Name")}><Input required placeholder={qr("Placeholder.CustomerName", "Enter customer name")} value={value.customerName} onChange={(e) => setValue({ ...value, customerName: e.target.value })} /></Field>
            <Field label={qr("Label.Company", "Company")}><Input placeholder={qr("Placeholder.Company", "Enter company name")} value={value.companyName ?? ""} onChange={(e) => setValue({ ...value, companyName: e.target.value })} /></Field>
            <Field label={qr("Label.Email", "Email")}><Input required type="email" placeholder={qr("Placeholder.Email", "Enter email address")} value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} /></Field>
            <Field label={qr("Label.Phone", "Phone")}><Input required placeholder={qr("Placeholder.Phone", "Enter phone number")} value={value.phone} onChange={(e) => setValue({ ...value, phone: e.target.value })} /></Field>
            <Field label={qr("Label.Origin", "Origin")}><Input required placeholder={qr("Placeholder.Origin", "Enter origin")} value={value.origin} onChange={(e) => setValue({ ...value, origin: e.target.value })} /></Field>
            <Field label={qr("Label.Destination", "Destination")}><Input required placeholder={qr("Placeholder.Destination", "Enter destination")} value={value.destination} onChange={(e) => setValue({ ...value, destination: e.target.value })} /></Field>
            <Field label={qr("Label.Mode", "Mode")}>
              <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={value.modeOfTransport} onChange={(e) => setValue({ ...value, modeOfTransport: e.target.value })}>
                <option value="Air">{qr("Mode.Air", "Air")}</option>
                <option value="Sea">{qr("Mode.Sea", "Sea")}</option>
                <option value="Road">{qr("Mode.Road", "Road")}</option>
                <option value="Courier">{qr("Mode.Courier", "Courier")}</option>
              </select>
            </Field>
            <Field label={qr("Label.ShipmentType", "Shipment Type")}>
              <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={value.shipmentType} onChange={(e) => setValue({ ...value, shipmentType: e.target.value })}>
                <option value="General">{qr("ShipmentType.General", "General")}</option>
                <option value="Import">{qr("ShipmentType.Import", "Import")}</option>
                <option value="Export">{qr("ShipmentType.Export", "Export")}</option>
                <option value="Door to Door">{qr("ShipmentType.DoorToDoor", "Door to Door")}</option>
              </select>
            </Field>
            <Field label={qr("Label.Status", "Status")}>
              <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={value.status} onChange={(e) => setValue({ ...value, status: e.target.value })}>
                {["Open", "Submitted", "Closed", "Cancelled"].map((status) => <option key={status} value={status}>{translateQuotationStatus(qr, status)}</option>)}
              </select>
            </Field>
          </div>
          <Field label={qr("Label.CargoDescription", "Cargo Description")}><Textarea rows={4} placeholder={qr("Placeholder.CargoDescription", "Describe cargo, weight, volume, and handling notes")} value={value.cargoDescription ?? ""} onChange={(e) => setValue({ ...value, cargoDescription: e.target.value })} /></Field>
          <div className="flex justify-end"><Button type="submit" disabled={mutation.isPending}><Save className="h-4 w-4" />{mutation.isPending ? qr("Edit.Updating", "Updating...") : qr("Edit.UpdateRequest", "Update Request")}</Button></div>
        </form> : <p className="text-sm text-muted-foreground">{qr("View.NotFound", "Quotation request was not found.")}</p>}
      </CardContent>
    </Card>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-1.5"><Label>{label}</Label>{children}</label>;
}
