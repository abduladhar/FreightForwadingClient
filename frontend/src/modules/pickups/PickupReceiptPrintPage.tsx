import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { getBranchById } from "@/api/branchApi";
import { getCustomer } from "@/api/customerApi";
import { getPickup, getPickupReceipt } from "@/api/pickupApi";
import { getTenantById } from "@/api/tenantApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataButtonClass } from "@/modules/masterDataUi";
import { exportPickupPdf } from "@/utils/pickupPdf";

export function PickupReceiptPrintPage() {
  const { pickupId = "" } = useParams();
  const workspace = useWorkspace();
  const p = usePickupI18n();
  const { session } = useAuth();
  const receipt = useQuery({ queryKey: ["pickup-receipt", pickupId], queryFn: () => getPickupReceipt(pickupId), enabled: Boolean(pickupId) });
  const pickup = useQuery({ queryKey: ["pickup-print-detail", pickupId], queryFn: () => getPickup(pickupId), enabled: Boolean(pickupId) });
  const customer = useQuery({ queryKey: ["pickup-print-customer", pickup.data?.customerId], queryFn: () => getCustomer(pickup.data!.customerId), enabled: Boolean(pickup.data?.customerId) });
  const tenant = useQuery({ queryKey: ["pickup-print-tenant", session?.tenantId], queryFn: () => getTenantById(session!.tenantId!), enabled: Boolean(session?.tenantId) });
  const branch = useQuery({ queryKey: ["pickup-print-branch", session?.branchId], queryFn: () => getBranchById(session!.branchId!), enabled: Boolean(session?.branchId) });
  if (receipt.isLoading || pickup.isLoading || customer.isLoading || tenant.isLoading || branch.isLoading) return <LoadingScreen />;
  if (receipt.isError || pickup.isError || customer.isError || tenant.isError || branch.isError || !receipt.data || !pickup.data) return <ErrorState onRetry={() => { void receipt.refetch(); void pickup.refetch(); void customer.refetch(); void tenant.refetch(); void branch.refetch(); }} />;

  const data = pickup.data;
  const customerName = customer.data?.customerName ?? data.customerId;
  const pickupDateTime = data.pickupDateTime ? new Date(data.pickupDateTime).toLocaleString(workspace.cultureCode) : "-";
  const logoUrl = tenant.data?.logoUrl?.trim() || `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const branchAddress = branch.data?.address?.trim() || p("Sample Address Line 1, City, Country");
  const printTitle = `${p("Pickup Receipt")} ${receipt.data.receiptNumber}`;
  const isRightToLeft = workspace.cultureCode.toLowerCase().startsWith("ar");

  return (
    <div className="space-y-4">
      <PageHeader title={printTitle} description={`${p("Pickup")} ${receipt.data.pickupNumber}`} actions={<PermissionButton className={masterDataButtonClass} permission="Pickup.Print" variant="outline" onClick={() => void exportPickupPdf({ fileName: `${data.pickupNumber}.pdf`, tenantName: workspace.tenantCode, branchName: workspace.branchName ?? p("Branch"), branchAddress, logoUrl, customerName, pickup: data, translate: p, cultureCode: workspace.cultureCode })}><Download className="h-4 w-4" /> {p("PDF Export")}</PermissionButton>} />
      <PrintPreview title={printTitle}>
        <div className="space-y-4 text-sm" dir={isRightToLeft ? "rtl" : "ltr"}>
          <div className="border-b pb-3">
            <div className="grid grid-cols-[260px_1fr_260px] items-center">
              <div className="flex justify-start">{logoUrl ? <img src={logoUrl} alt={p("Logo")} className="h-28 w-28 object-contain" /> : <div className="h-28 w-28" />}</div>
              <div className="text-center"><h3 className="text-xl font-bold tracking-wide">{p("PICKUP RECEIPT")}</h3></div>
              <div className="text-end"><p className="font-semibold">{workspace.branchName ?? p("Branch")}</p><p className="text-muted-foreground">{branchAddress}</p></div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <InfoCard rows={[
              [p("Pickup No"), data.pickupNumber], [p("Pickup DateTime"), pickupDateTime], [p("Contact"), data.contactPerson],
              [p("Phone"), data.contactPhone], [p("Drop Location"), data.dropLocation || "-"], [p("Driver Name"), data.driverName || "-"],
              [p("Vehicle Number"), data.vehicleNumber || "-"], [p("Status"), p(data.status)]
            ]} />
            <InfoCard rows={[
              [p("Customer Name"), customerName], [p("Customer Location"), data.customerLocation], [p("Consignee Name"), data.consigneeName || "-"],
              [p("Consignee Contact No"), data.consigneeContactNo || "-"], [p("Consignee Contact Address"), data.consigneeAddress || "-"],
              [p("Charges"), data.pickupCharges.toFixed(2)]
            ]} />
          </div>
          <div className="overflow-auto rounded-md border">
            <table className="min-w-[900px] w-full text-xs">
              <thead className="bg-muted"><tr>{[p("Package Type"), p("Description"), p("Packages"), p("Gross Weight"), p("Length"), p("Width"), p("Height"), p("Volume"), p("Chargeable Weight")].map((label) => <th key={label} className="px-2 py-2 text-start">{label}</th>)}</tr></thead>
              <tbody>{data.items.map((item) => {
                const chargeable = Math.max(item.weight || 0, (item.volumeCbm || 0) * 167);
                return <tr key={item.id} className="border-t"><td className="px-2 py-1.5">{item.packageTypeCode ? `${item.packageTypeCode} - ${item.packageTypeName}` : item.packageTypeName}</td><td className="px-2 py-1.5">{item.description}</td><td className="px-2 py-1.5">{item.pieces.toFixed(2)}</td><td className="px-2 py-1.5">{item.weight.toFixed(2)}</td><td className="px-2 py-1.5">{item.length.toFixed(2)}</td><td className="px-2 py-1.5">{item.width.toFixed(2)}</td><td className="px-2 py-1.5">{item.height.toFixed(2)}</td><td className="px-2 py-1.5">{item.volumeCbm.toFixed(4)}</td><td className="px-2 py-1.5">{chargeable.toFixed(4)}</td></tr>;
              })}</tbody>
            </table>
          </div>
        </div>
      </PrintPreview>
    </div>
  );
}

function InfoCard({ rows }: { rows: Array<[string, string]> }) {
  return <div className="space-y-1 rounded-md border p-2">{rows.map(([label, value]) => <p key={label}><span className="font-medium">{label}:</span> {value}</p>)}</div>;
}
