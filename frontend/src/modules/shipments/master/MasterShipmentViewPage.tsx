import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { FileBarChart, FilePlus2, Pencil, Printer, Receipt, Scale } from "lucide-react";
import { getShipmentDocuments } from "@/api/documentApi";
import { getMasterShipment } from "@/api/masterShipmentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function MasterShipmentViewPage() {
  const { masterShipmentId } = useParams();
  const query = useQuery({ queryKey: ["master-shipment", masterShipmentId], queryFn: () => getMasterShipment(masterShipmentId!), enabled: Boolean(masterShipmentId) });
  const documents = useQuery({ queryKey: ["documents", "MasterShipment", masterShipmentId], queryFn: () => getShipmentDocuments("MasterShipment", masterShipmentId!), enabled: Boolean(masterShipmentId) });
  if (!masterShipmentId) return <Navigate to="/master-shipments" replace />;
  const m = query.data;
  return <div className="space-y-4">
    <PageHeader title={m?.masterShipmentNumber ?? lt("Master Shipment")} description={`${m?.originPortName ?? ""} -> ${m?.destinationPortName ?? ""}`} actions={<><AuditTrailButton />{m ? <PermissionButton asChild permission="Invoice.Read"><Link to={`/master-shipments/${masterShipmentId}/invoices`}><Receipt className="h-4 w-4" />{lt("Show Invoices")}</Link></PermissionButton> : null}{m ? <PermissionButton asChild permission="Invoice.Create"><Link to={`/invoices/new?sourceType=MasterShipment&sourceId=${masterShipmentId}`}><Receipt className="h-4 w-4" />{lt("Create Invoice")}</Link></PermissionButton> : null}{m ? <PermissionButton asChild permission="VendorBill.Read"><Link to={`/master-shipments/${masterShipmentId}/bills`}><FilePlus2 className="h-4 w-4" />{lt("Show Bills")}</Link></PermissionButton> : null}{m ? <PermissionButton asChild permission="VendorBill.Create"><Link to={`/vendor-bills/new?sourceType=MasterShipment&sourceId=${masterShipmentId}&expectedCostAmount=${m.totalCostAmount ?? 0}`}><FilePlus2 className="h-4 w-4" />{lt("Create Bill")}</Link></PermissionButton> : null}<PermissionButton asChild permission="MasterShipment.Update"><Link to={`/master-shipments/${masterShipmentId}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton><PermissionButton asChild permission="MasterShipment.Print"><Link to={`/master-shipments/${masterShipmentId}/manifest`}><Printer className="h-4 w-4" />{lt("Manifest")}</Link></PermissionButton><PermissionButton asChild permission="MasterShipment.Export"><Link to={`/master-shipments/${masterShipmentId}/consolidation`}><FileBarChart className="h-4 w-4" />{lt("Consolidation")}</Link></PermissionButton><PermissionButton asChild permission="MasterShipment.Read"><Link to={`/master-shipments/${masterShipmentId}/cost-allocation`}><Scale className="h-4 w-4" />{lt("Cost Allocation")}</Link></PermissionButton><PermissionButton asChild permission="Profit.Read"><Link to={`/master-shipments/${masterShipmentId}/profit-loss`}><FileBarChart className="h-4 w-4" />{lt("Profit & Loss")}</Link></PermissionButton></>} />
    {m ? <>
    <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-4">
      <Field label={lt("Status")}><StatusBadge status={m.status} /></Field><Field label={lt("Mode")}>{m.modeOfTransport}</Field><Field label={lt("Carrier")}>{m.carrierName ?? "-"}</Field><Field label={lt("MAWB/MBL")}>{m.mawbNumber ?? m.mblNumber ?? "-"}</Field>
      <Field label={lt("ETD - Expected Time of Departure")}>{m.etd ?? "-"}</Field><Field label={lt("ETA - Expected Time of Arrival")}>{m.eta ?? "-"}</Field><Field label={lt("Total Cost")}>{m.totalCostAmount.toFixed(2)}</Field><Field label={lt("Allocation")}>{m.costAllocationMethod}</Field>
      <div className="md:col-span-4"><h3 className="mb-2 font-medium">{lt("Consolidated Items")}</h3><div className="space-y-2">{m.items.map((x) => <div key={x.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{x.houseShipmentNumber} - {x.houseShipmentItemDescription}</p><p className="text-muted-foreground">{lt("Source")} {x.sourceEntityType} | {lt("Package Type")} {x.packageTypeName || "-"} | {lt("L")} {x.length.toFixed(2)} {lt("W")} {x.width.toFixed(2)} {lt("H")} {x.height.toFixed(2)} {lt("CBM")} {x.volumeCbm.toFixed(4)} | {lt("Pieces")} {x.consolidatedPieces} | {lt("Weight")} {x.consolidatedWeight} | {lt("Volume")} {x.consolidatedVolume} | {lt("Allocated")} {x.allocatedCostAmount.toFixed(2)}</p></div>)}</div></div>
    </CardContent></Card>
    <DocumentUploadPanel moduleName="MasterShipment" entityId={masterShipmentId} defaultDocumentName={lt("Master Shipment Document")} defaultDocumentCategory={lt("Master Shipment")} emptyText={lt("No documents uploaded for this master shipment.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} />
    </> : <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading master shipment...")}</CardContent></Card>}
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><div className="font-medium">{children}</div></div>;
}
