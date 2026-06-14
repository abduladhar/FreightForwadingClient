import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { FilePlus2, FileText, Pencil, Plus, Printer, ScrollText, TrendingUp } from "lucide-react";
import { getShipmentDocuments } from "@/api/documentApi";
import { cancelDirectShipment, getDirectShipment, updateDirectShipmentStatus } from "@/api/directShipmentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/utils/dateFormat";
import { lt } from "@/modules/operationsLocalization";

const statuses = ["Draft", "Booked", "Picked Up", "In Transit", "Arrived", "Delivered", "Closed", "Cancelled"];

export function DirectShipmentViewPage() {
  const { directShipmentId } = useParams();
  const toast = useToast();
  const [status, setStatus] = useState("In Transit");
  const [reason, setReason] = useState("");
  const query = useQuery({ queryKey: ["direct-shipment", directShipmentId], queryFn: () => getDirectShipment(directShipmentId!), enabled: Boolean(directShipmentId) });
  const documents = useQuery({ queryKey: ["documents", "DirectShipment", directShipmentId], queryFn: () => getShipmentDocuments("DirectShipment", directShipmentId!), enabled: Boolean(directShipmentId) });
  const statusMutation = useMutation({ mutationFn: (next: string) => updateDirectShipmentStatus(directShipmentId!, { status: next }) });
  const cancelMutation = useMutation({ mutationFn: () => cancelDirectShipment(directShipmentId!, { reason }) });
  if (!directShipmentId) return <Navigate to="/direct-shipments" replace />;
  const s = query.data;
  useEffect(() => {
    if (s?.status) setStatus(s.status);
  }, [s?.status]);
  return <div className="space-y-4">
    <PageHeader title={s?.directShipmentNumber ?? "Direct Shipment"} description={`${s?.origin ?? ""} -> ${s?.destination ?? ""}`} actions={<><AuditTrailButton /><PermissionButton asChild permission="DirectShipment.Update"><Link to={`/direct-shipments/${directShipmentId}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton>{s?.customerId ? <PermissionButton asChild permission="Invoice.Create"><Link to={`/invoices/new?sourceType=DirectShipment&sourceId=${encodeURIComponent(directShipmentId)}&customerId=${encodeURIComponent(s.customerId)}`}><Plus className="h-4 w-4" />{lt("Create Invoice")}</Link></PermissionButton> : null}<PermissionButton asChild permission="Invoice.Read"><Link to={`/direct-shipments/${directShipmentId}/invoices`}><FileText className="h-4 w-4" />{lt("Show Invoices")}</Link></PermissionButton><PermissionButton asChild permission="VendorBill.Read"><Link to={`/direct-shipments/${directShipmentId}/bills`}><FilePlus2 className="h-4 w-4" />{lt("Show Bills")}</Link></PermissionButton><PermissionButton asChild permission="VendorBill.Create"><Link to={`/vendor-bills/new?sourceType=DirectShipment&sourceId=${encodeURIComponent(directShipmentId)}&expectedCostAmount=${s?.costAmount ?? 0}`}><FilePlus2 className="h-4 w-4" />{lt("Create Bill")}</Link></PermissionButton><PermissionButton asChild permission="DirectShipment.Print"><Link to={`/direct-shipments/${directShipmentId}/label`}><Printer className="h-4 w-4" />{lt("Label")}</Link></PermissionButton><PermissionButton asChild permission="DirectShipment.Print"><Link to={`/direct-shipments/${directShipmentId}/note`}><ScrollText className="h-4 w-4" />{lt("Receipt")}</Link></PermissionButton><PermissionButton asChild permission="DirectShipment.Read"><Link to={`/direct-shipments/${directShipmentId}/profit`}><TrendingUp className="h-4 w-4" />{lt("Profit")}</Link></PermissionButton></>} />
    {s ? <>
      <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-4">
        <Field label={lt("Status")}><StatusBadge status={s.status} /></Field><Field label={lt("Mode")}>{s.modeOfTransport}</Field><Field label={lt("Carrier")}>{s.carrierName ?? "-"}</Field><Field label={lt("Master Waybill No")}>{s.mawbNumber ?? "-"}</Field><Field label={lt("ETD/ETA")}>{formatDateTime(s.etd)} / {formatDateTime(s.eta)}</Field>
        <Field label={lt("Shipper Name")}>{s.shipperName || "-"}</Field><Field label={lt("Shipper Phone")}>{s.shipperPhoneNumber || "-"}</Field><Field label={lt("Consignee Name")}>{s.consigneeName || "-"}</Field><Field label={lt("Consignee Phone")}>{s.consigneePhoneNumber || "-"}</Field>
        <div className="md:col-span-2"><Field label={lt("Shipper Address")}>{s.shipperAddress || "-"}</Field></div><div className="md:col-span-2"><Field label={lt("Consignee Address")}>{s.consigneeAddress || "-"}</Field></div>
        <Field label={lt("Invoice Ref")}>{s.customerInvoiceId ?? "-"}</Field><Field label={lt("Vendor Bill Ref")}>{s.vendorBillId ?? "-"}</Field><Field label={lt("Revenue")}><CurrencyAmount value={s.revenueAmount} /></Field><Field label={lt("Cost")}><CurrencyAmount value={s.costAmount} /></Field>
      </CardContent></Card>
      <Card><CardContent className="pt-6"><h3 className="mb-2 font-medium">{lt("Items")}</h3><div className="space-y-2">{s.items.map((x) => <div key={x.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{x.description}</p><p className="text-muted-foreground">Pieces {x.pieces} | Weight {x.weight} | Volume {x.volume}</p></div>)}</div></CardContent></Card>
      <DocumentUploadPanel moduleName="DirectShipment" entityId={directShipmentId} defaultDocumentName="Direct Shipment Document" defaultDocumentCategory="Direct Shipment" emptyText="No documents uploaded for this direct shipment." documents={documents.data ?? []} onRefresh={() => void documents.refetch()} />
      <Card><CardContent className="pt-6 space-y-3"><h3 className="font-medium">{lt("Status Update")}</h3><div className="grid gap-3 md:grid-cols-3"><div className="space-y-1"><Label>{lt("Status")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((x) => <option key={x}>{x}</option>)}</select></div><div className="space-y-1 md:col-span-2"><Label>{lt("Cancel Reason")}</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div></div><div className="flex gap-2"><PermissionButton permission="DirectShipment.Update" onClick={() => void statusMutation.mutateAsync(status).then(() => { toast.success(lt("Updated"), lt("Shipment status updated.")); void query.refetch(); })}><FileText className="h-4 w-4" />{lt("Update Status")}</PermissionButton><PermissionButton permission="DirectShipment.Cancel" variant="destructive" disabled={!reason.trim()} onClick={() => void cancelMutation.mutateAsync().then(() => { toast.success(lt("Cancelled"), lt("Shipment cancelled.")); void query.refetch(); })}>{lt("Cancel Shipment")}</PermissionButton></div></CardContent></Card>
    </> : <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading direct shipment...")}</CardContent></Card>}
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><div className="font-medium">{children}</div></div>;
}
