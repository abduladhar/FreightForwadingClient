import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { ClipboardCheck, FilePlus2, FileText, Pencil, Printer, Receipt, Truck } from "lucide-react";
import { getShipmentDocuments } from "@/api/documentApi";
import { getPickup } from "@/api/pickupApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PickupViewPage() {
  const { pickupId } = useParams();
  const p = usePickupI18n();
  const query = useQuery({ queryKey: ["pickup", pickupId], queryFn: () => getPickup(pickupId!), enabled: Boolean(pickupId) });
  const documents = useQuery({ queryKey: ["documents", "Pickup", pickupId], queryFn: () => getShipmentDocuments("Pickup", pickupId!), enabled: Boolean(pickupId) });
  if (!pickupId) return <Navigate to="/pickups" replace />;

  const pickup = query.data;
  return (
    <div className="space-y-4">
      <PageHeader
        title={pickup?.pickupNumber ?? p("Pickup")}
        description={pickup?.customerLocation ?? ""}
        actions={<>
          <AuditTrailButton />
          {pickup ? <PermissionButton className={masterDataButtonClass} asChild permission="Invoice.Read"><Link to={`/pickups/${pickupId}/invoices`}><Receipt className="h-4 w-4" /> {p("Show Invoices")}</Link></PermissionButton> : null}
          {pickup ? <PermissionButton className={masterDataButtonClass} asChild permission="Invoice.Create"><Link to={`/invoices/new?sourceType=Pickup&sourceId=${pickupId}&customerId=${pickup.customerId}`}><Receipt className="h-4 w-4" /> {p("Create Invoice")}</Link></PermissionButton> : null}
          {pickup ? <PermissionButton className={masterDataButtonClass} asChild permission="VendorBill.Read"><Link to={`/pickups/${pickupId}/bills`}><FileText className="h-4 w-4" /> {p("Show Bills")}</Link></PermissionButton> : null}
          {pickup ? <PermissionButton className={masterDataButtonClass} asChild permission="VendorBill.Create"><Link to={`/vendor-bills/new?sourceType=Pickup&sourceId=${pickupId}&vendorId=${pickup.transporterVendorId ?? ""}&expectedCostAmount=${pickup.pickupCharges || 0}`}><FilePlus2 className="h-4 w-4" /> {p("Create Bill")}</Link></PermissionButton> : null}
          <PermissionButton className={masterDataButtonClass} asChild permission="Pickup.Update"><Link to={`/pickups/${pickupId}/edit`}><Pencil className="h-4 w-4" /> {p("Edit")}</Link></PermissionButton>
          <PermissionButton className={masterDataButtonClass} asChild permission="Pickup.Update"><Link to={`/pickups/${pickupId}/assign`}><Truck className="h-4 w-4" /> {p("Assign")}</Link></PermissionButton>
          <PermissionButton className={masterDataButtonClass} asChild permission="Pickup.Update"><Link to={`/pickups/${pickupId}/status`}><ClipboardCheck className="h-4 w-4" /> {p("Status")}</Link></PermissionButton>
          <PermissionButton className={masterDataButtonClass} asChild permission="Pickup.Print"><Link to={`/pickups/${pickupId}/receipt`}><Printer className="h-4 w-4" /> {p("Receipt")}</Link></PermissionButton>
        </>}
      />

      {pickup ? <>
        <Card className={masterDataPanelClass}>
          <CardContent className={`${masterDataPanelContentClass} grid gap-3 md:grid-cols-3`}>
            <Field label={p("Status")}><StatusBadge status={pickup.status} label={p(pickup.status)} /></Field>
            <Field label={p("Contact")}>{pickup.contactPerson}</Field>
            <Field label={p("Phone")}>{pickup.contactPhone}</Field>
            <Field label={p("Pickup Date")}>{pickup.pickupDateTime}</Field>
            <Field label={p("Drop Location")}>{pickup.dropLocation || "-"}</Field>
            <Field label={p("Consignee Name")}>{pickup.consigneeName || "-"}</Field>
            <Field label={p("Consignee Contact No")}>{pickup.consigneeContactNo || "-"}</Field>
            <Field label={p("Consignee Contact Address")}>{pickup.consigneeAddress || "-"}</Field>
            <Field label={p("Driver")}>{pickup.driverName ?? "-"}</Field>
            <Field label={p("Vehicle")}>{pickup.vehicleNumber ?? "-"}</Field>
            <Field label={p("Charges")}>{pickup.pickupCharges.toFixed(2)}</Field>
            <Field label={p("Proof")}>{pickup.proofOfPickupDocumentReference ?? "-"}</Field>
          </CardContent>
        </Card>

        <Card className={masterDataPanelClass}>
          <CardContent className={masterDataPanelContentClass}>
            <h3 className="mb-2 font-medium">{p("Pickup Items")}</h3>
            <div className="space-y-2">
              {pickup.items.map((item) => {
                const chargeableWeight = Math.max(item.weight || 0, (item.volumeCbm || 0) * 167);
                return (
                  <div key={item.id} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{item.packageTypeCode ? `${item.packageTypeCode} - ${item.packageTypeName}` : item.packageTypeName} | {item.description}</p>
                    <p className="text-muted-foreground">{p("Packages")} {item.pieces} | {p("Gross Weight")} {item.weight} | {p("Volume")} {item.volumeCbm.toFixed(3)} | {p("L/W/H")} {item.length}/{item.width}/{item.height} | {p("Chargeable Weight")} {chargeableWeight.toFixed(3)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <DocumentUploadPanel moduleName="Pickup" entityId={pickupId} title={p("Documents")} description={p("Upload one document at a time. Files are stored securely with signed upload and download URLs.")} defaultDocumentName={p("Pickup Document")} defaultDocumentCategory="Pickup" emptyText={p("No documents uploaded for this pickup.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} />
      </> : <Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} text-sm text-muted-foreground`}>{p("Loading pickup...")}</CardContent></Card>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><div className="font-medium">{children}</div></div>;
}
