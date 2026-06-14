import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { getHouseShipment } from "@/api/houseShipmentApi";
import { getTenantById } from "@/api/tenantApi";
import { getBranchById } from "@/api/branchApi";
import { getCustomer } from "@/api/customerApi";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { exportHouseShipmentPdf } from "@/utils/houseShipmentPdf";
import { lt } from "@/modules/operationsLocalization";

export function HouseShipmentNotePrintPage() {
  const { shipmentId } = useParams();
  const workspace = useWorkspace();
  const { session } = useAuth();
  const shipmentQuery = useQuery({ queryKey: ["house-shipment-note", shipmentId], queryFn: () => getHouseShipment(shipmentId!), enabled: Boolean(shipmentId) });
  const tenant = useQuery({
    queryKey: ["house-shipment-note-tenant", session?.tenantId],
    queryFn: () => getTenantById(session!.tenantId!),
    enabled: Boolean(session?.tenantId)
  });
  const branch = useQuery({
    queryKey: ["house-shipment-note-branch", session?.branchId],
    queryFn: () => getBranchById(session!.branchId!),
    enabled: Boolean(session?.branchId)
  });
  const customer = useQuery({
    queryKey: ["house-shipment-note-customer", shipmentQuery.data?.customerId],
    queryFn: () => getCustomer(shipmentQuery.data!.customerId),
    enabled: Boolean(shipmentQuery.data?.customerId)
  });
  if (!shipmentId) return <Navigate to="/house-shipments" replace />;
  if (shipmentQuery.isLoading) return <LoadingScreen />;
  if (shipmentQuery.isError || !shipmentQuery.data) return <ErrorState onRetry={() => void shipmentQuery.refetch()} />;

  const shipment = shipmentQuery.data;
  const fallbackLogoPath = `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const logoUrl = tenant.data?.logoUrl?.trim() || fallbackLogoPath;
  const branchAddress = branch.data?.address?.trim() || "Sample Address Line 1, City, Country";

  return <div className="space-y-4">
    <PageHeader
      title={`Job Card: ${shipment.houseShipmentNumber}`}
      description={lt("House shipment job card print preview and PDF export.")}
      actions={
        <>
          <AuditTrailButton />
          <PermissionButton
            permission="HouseShipment.Export"
            variant="outline"
            onClick={() =>
              void exportHouseShipmentPdf({
                fileName: `${shipment.houseShipmentNumber}.pdf`,
                tenantName: workspace.tenantCode,
                branchName: workspace.branchName ?? "Branch",
                branchAddress,
                logoUrl,
                customerName: customer.data?.customerName,
                houseShipment: shipment,
                reportTitle: lt("HOUSE SHIPMENT JOB CARD")
              })
            }
          >
            <Download className="h-4 w-4" />{lt("PDF Export")}</PermissionButton>
        </>
      }
    />
    <Card><CardContent className="pt-6">
      <PrintPreview title={`Job Card ${shipment.houseShipmentNumber}`}>
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="border-b pb-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr_160px] lg:grid-cols-[260px_1fr_260px] items-center">
              <div className="flex justify-center sm:justify-start">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 object-contain" /> : <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28" />}</div>
              <div className="text-center"><h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-wide">{lt("HOUSE SHIPMENT JOB CARD")}</h3></div>
              <div className="text-center sm:text-right"><p className="font-semibold">{workspace.branchName ?? "Branch"}</p><p className="text-muted-foreground break-words">{branchAddress}</p></div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 rounded-md border p-2">
              <p><span className="font-medium">{lt("Shipment No:")}</span> {shipment.houseShipmentNumber}</p>
              <p><span className="font-medium">{lt("HAWB:")}</span> {shipment.hawbNumber ?? "-"}</p>
              <p><span className="font-medium">{lt("Customer:")}</span> {customer.data?.customerName ?? shipment.customerId}</p>
              <p><span className="font-medium">{lt("Status:")}</span> {shipment.status}</p>
            </div>
            <div className="space-y-1 rounded-md border p-2">
              <p><span className="font-medium">{lt("Origin Port:")}</span> {shipment.originPortName || shipment.origin || "-"}</p>
              <p><span className="font-medium">{lt("Destination Port:")}</span> {shipment.destinationPortName || shipment.destination || "-"}</p>
              <p><span className="font-medium">{lt("ETD:")}</span> {shipment.etd ?? "-"}</p>
              <p><span className="font-medium">{lt("ETA:")}</span> {shipment.eta ?? "-"}</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 rounded-md border p-2">
              <p className="font-medium">{lt("Shipper")}</p>
              <p><span className="font-medium">{lt("Name:")}</span> {shipment.shipperName || "-"}</p>
              <p><span className="font-medium">{lt("Contact:")}</span> {shipment.shipperContactNo || "-"}</p>
              <p><span className="font-medium">{lt("Address:")}</span> {shipment.shipperAddress || "-"}</p>
            </div>
            <div className="space-y-1 rounded-md border p-2">
              <p className="font-medium">{lt("Consignee")}</p>
              <p><span className="font-medium">{lt("Name:")}</span> {shipment.consigneeName || "-"}</p>
              <p><span className="font-medium">{lt("Contact:")}</span> {shipment.consigneeContactNo || "-"}</p>
              <p><span className="font-medium">{lt("Address:")}</span> {shipment.consigneeAddress || "-"}</p>
            </div>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="px-2 py-2 text-left">{lt("Package Type")}</th>
                  <th className="px-2 py-2 text-left">{lt("Description")}</th>
                  <th className="px-2 py-2 text-right">{lt("Packages")}</th>
                  <th className="px-2 py-2 text-right">{lt("Gross Wt")}</th>
                  <th className="px-2 py-2 text-right">L</th>
                  <th className="px-2 py-2 text-right">W</th>
                  <th className="px-2 py-2 text-right">H</th>
                  <th className="px-2 py-2 text-right">{lt("Vol (CBM)")}</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-2 py-1.5">{item.packageTypeName || "-"}</td>
                    <td className="px-2 py-1.5">{item.description || "-"}</td>
                    <td className="px-2 py-1.5 text-right">{item.loadedPieces.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{item.loadedWeight.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{item.length.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{item.width.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{item.height.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{item.loadedVolume.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PrintPreview>
    </CardContent></Card>
  </div>;
}
