import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { getVendor } from "@/api/vendorApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function VendorViewPage() {
  const m = useMasterDataI18n("Vendor");
  const { vendorId } = useParams();
  const query = useQuery({ queryKey: ["vendor", vendorId], queryFn: () => getVendor(vendorId!), enabled: Boolean(vendorId) });
  if (!vendorId) return <Navigate to="/vendors" replace />;
  const vendor = query.data;
  return <div className="space-y-4"><PageHeader title={vendor?.vendorName ?? m("Vendor")} description={vendor?.vendorCode} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="Vendor.Update"><Link to={`/vendors/${vendorId}/edit`}><Pencil className="h-4 w-4" /> {m("Edit")}</Link></PermissionButton></>} />{vendor ? <Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} grid gap-3 md:grid-cols-2`}><Field label={m("Type")} value={vendor.vendorType} /><Field label={m("Email")} value={vendor.email} /><Field label={m("Phone")} value={vendor.phone} /><Field label={m("Country")} value={vendor.country} /><Field label={m("City")} value={vendor.city} /><Field label={m("Payment Terms")} value={vendor.paymentTerms} /></CardContent></Card> : <Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} text-sm text-muted-foreground`}>{m("Loading Vendor")}</CardContent></Card>}</div>;
}
function Field({ label, value }: { label: string; value?: string | null }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value || "-"}</p></div>; }
