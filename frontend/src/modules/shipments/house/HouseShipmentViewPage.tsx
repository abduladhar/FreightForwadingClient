import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { FileText, FilePlus2, Pencil, Receipt, Printer, TrendingUp } from "lucide-react";
import { getShipmentDocuments } from "@/api/documentApi";
import { getHouseShipment } from "@/api/houseShipmentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { ShipmentStatusTimeline } from "@/components/common/ShipmentStatusTimeline";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function HouseShipmentViewPage() {
  const { shipmentId } = useParams();
  const query = useQuery({ queryKey: ["house-shipment", shipmentId], queryFn: () => getHouseShipment(shipmentId!), enabled: Boolean(shipmentId) });
  const documents = useQuery({ queryKey: ["documents", "HouseShipment", shipmentId], queryFn: () => getShipmentDocuments("HouseShipment", shipmentId!), enabled: Boolean(shipmentId) });
  if (!shipmentId) return <Navigate to="/house-shipments" replace />;
  const shipment = query.data;
  const originPortLabel = shipment?.originPortName || shipment?.origin || "";
  const destinationPortLabel = shipment?.destinationPortName || shipment?.destination || "";
  return <div className="space-y-4">
    <PageHeader title={shipment?.houseShipmentNumber ?? lt("House Shipment")} description={`${originPortLabel} -> ${destinationPortLabel}`} actions={<>
      <AuditTrailButton />
      <PermissionButton asChild permission="HouseShipment.Update"><Link to={`/house-shipments/${shipmentId}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton>
      <PermissionButton asChild permission="HouseShipment.Update"><Link to={`/house-shipments/${shipmentId}/status`}><FileText className="h-4 w-4" />{lt("Status")}</Link></PermissionButton>
      <PermissionButton asChild permission="HouseShipment.Print"><Link to={`/house-shipments/${shipmentId}/label`} target="_blank" rel="noreferrer"><Printer className="h-4 w-4" />{lt("Labels")}</Link></PermissionButton>
      <PermissionButton asChild permission="HouseShipment.Print"><Link to={`/house-shipments/${shipmentId}/note`} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" />{lt("Job Card")}</Link></PermissionButton>
      <PermissionButton asChild permission="HouseShipment.Read"><Link to={`/house-shipments/${shipmentId}/profit`}><TrendingUp className="h-4 w-4" />{lt("Profit")}</Link></PermissionButton>
      <PermissionButton asChild permission="Invoice.Read"><Link to={`/house-shipments/${shipmentId}/invoices`}><Receipt className="h-4 w-4" />{lt("Show Invoices")}</Link></PermissionButton>
      <PermissionButton asChild permission="Invoice.Create"><Link to={`/invoices/new?sourceType=HouseShipment&sourceId=${shipmentId}&customerId=${shipment?.customerId ?? ""}`}><Receipt className="h-4 w-4" />{lt("Create Invoice")}</Link></PermissionButton>
      <PermissionButton asChild permission="VendorBill.Read"><Link to={`/house-shipments/${shipmentId}/bills`}><FilePlus2 className="h-4 w-4" />{lt("Show Bills")}</Link></PermissionButton>
      <PermissionButton asChild permission="VendorBill.Create"><Link to={`/vendor-bills/new?sourceType=HouseShipment&sourceId=${shipmentId}&expectedCostAmount=${shipment?.costAmount ?? 0}`}><FilePlus2 className="h-4 w-4" />{lt("Create Bill")}</Link></PermissionButton>
    </>} />
      {shipment ? <>
      <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-4">
        <Field label={lt("Status")}><StatusBadge status={shipment.status} /></Field>
        <Field label={lt("HAWB")}>{shipment.hawbNumber ?? "-"}</Field>
        <Field label={lt("ETD")}>{shipment.etd ?? "-"}</Field>
        <Field label={lt("ETA")}>{shipment.eta ?? "-"}</Field>
        <Field label={lt("Drop Location")}>{shipment.dropLocation ?? "-"}</Field>
        <Field label={lt("Actual Departure")}>{shipment.actualDeparture ?? "-"}</Field>
        <Field label={lt("Actual Arrival")}>{shipment.actualArrival ?? "-"}</Field>
        <Field label={lt("Revenue")}><CurrencyAmount value={shipment.revenueAmount} /></Field>
        <Field label={lt("Cost")}><CurrencyAmount value={shipment.costAmount} /></Field>
        <Field label={lt("Customer Invoice")}>{shipment.customerInvoiceId ? <Link className="text-primary underline" to={`/invoices/${shipment.customerInvoiceId}`}>{shipment.customerInvoiceId}</Link> : "-"}</Field>
        <Field label={lt("Vendor Bill")}>{shipment.vendorBillId ?? "-"}</Field>
        <div className="md:col-span-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-md border p-3">
            <h3 className="text-sm font-medium">{lt("Shipper Information")}</h3>
            <Field label={lt("Shipper Name")}>{shipment.shipperName ?? "-"}</Field>
            <Field label={lt("Shipper Contact")}>{shipment.shipperContactNo ?? "-"}</Field>
            <Field label={lt("Shipper Address")}>{shipment.shipperAddress ?? "-"}</Field>
          </div>
          <div className="space-y-2 rounded-md border p-3">
            <h3 className="text-sm font-medium">{lt("Consignee Information")}</h3>
            <Field label={lt("Consignee Name")}>{shipment.consigneeName ?? "-"}</Field>
            <Field label={lt("Consignee Contact")}>{shipment.consigneeContactNo ?? "-"}</Field>
            <Field label={lt("Consignee Address")}>{shipment.consigneeAddress ?? "-"}</Field>
          </div>
        </div>
      </CardContent></Card>
      <ShipmentStatusTimeline items={[
        { id: "1", status: "Draft", location: shipment.originPortName || shipment.origin, timestamp: shipment.etd ?? undefined },
        { id: "2", status: shipment.status, location: shipment.destinationPortName || shipment.destination, timestamp: shipment.actualArrival ?? shipment.eta ?? undefined }
      ]} />
      <Card><CardContent className="pt-6">
        <h3 className="mb-2 font-medium">{lt("Loaded Goods")}</h3>
        <div className="space-y-2">{shipment.items.map((x) => <div key={x.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{x.description}</p><p className="text-muted-foreground">Pieces {x.loadedPieces} | Weight {x.loadedWeight} | Volume {x.loadedVolume}</p></div>)}</div>
      </CardContent></Card>
      <DocumentUploadPanel moduleName="HouseShipment" entityId={shipmentId} defaultDocumentName={lt("House Shipment Document")} defaultDocumentCategory={lt("House Shipment")} emptyText={lt("No documents uploaded for this house shipment.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} />
    </> : <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading house shipment...")}</CardContent></Card>}
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><div className="font-medium">{children}</div></div>;
}
