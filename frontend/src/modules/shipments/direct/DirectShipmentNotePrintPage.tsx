import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { getDirectShipment } from "@/api/directShipmentApi";
import { getCustomer } from "@/api/customerApi";
import { getBranchById } from "@/api/branchApi";
import { getTenantById } from "@/api/tenantApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspace } from "@/hooks/useWorkspace";
import { formatDateTime } from "@/utils/dateFormat";
import { exportDirectShipmentPdf } from "@/utils/directShipmentPdf";
import { lt } from "@/modules/operationsLocalization";

export function DirectShipmentNotePrintPage() {
  const { directShipmentId } = useParams();
  const workspace = useWorkspace();
  const { session } = useAuth();
  const query = useQuery({ queryKey: ["direct-shipment-note", directShipmentId], queryFn: () => getDirectShipment(directShipmentId!), enabled: Boolean(directShipmentId) });
  const customer = useQuery({
    queryKey: ["direct-shipment-note-customer", query.data?.customerId],
    queryFn: () => getCustomer(query.data!.customerId),
    enabled: Boolean(query.data?.customerId)
  });
  const tenant = useQuery({
    queryKey: ["direct-shipment-note-tenant", session?.tenantId],
    queryFn: () => getTenantById(session!.tenantId!),
    enabled: Boolean(session?.tenantId)
  });
  const branch = useQuery({
    queryKey: ["direct-shipment-note-branch", session?.branchId],
    queryFn: () => getBranchById(session!.branchId!),
    enabled: Boolean(session?.branchId)
  });
  if (!directShipmentId) return <Navigate to="/direct-shipments" replace />;
  if (query.isLoading || tenant.isLoading || branch.isLoading || customer.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data || customer.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const shipment = query.data;
  const customerName = customer.data?.customerName ?? shipment.customerId;
  const fallbackLogoPath = `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const logoUrl = tenant.data?.logoUrl?.trim() || fallbackLogoPath;
  const branchAddress = branch.data?.address?.trim() || "Sample Address Line 1, City, Country";

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Direct Shipment Receipt: ${shipment.directShipmentNumber}`}
        description={lt("Direct shipment job card and receipt preview.")}
        actions={
          <PermissionButton
            permission="DirectShipment.Print"
            variant="outline"
            onClick={() =>
              void exportDirectShipmentPdf({
                fileName: `${shipment.directShipmentNumber}-receipt.pdf`,
                tenantName: workspace.tenantCode,
                branchName: workspace.branchName ?? "Branch",
                branchAddress,
                logoUrl,
                customerName,
                directShipment: shipment,
                reportTitle: lt("DIRECT SHIPMENT RECEIPT")
              })
            }
          >
            <Download className="h-4 w-4" />{lt("PDF Export")}</PermissionButton>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <PrintPreview title={`Direct Shipment Receipt ${shipment.directShipmentNumber}`}>
            <div className="mx-auto w-full max-w-[190mm] space-y-4 text-[11px] leading-4 print:max-w-none">
              <div className="border-b pb-3">
                <div className="grid grid-cols-[190px_1fr_190px] items-center gap-3">
                  <div className="flex justify-start">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-24 w-24 object-contain" /> : <div className="h-24 w-24" />}</div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold tracking-wide">{lt("DIRECT SHIPMENT RECEIPT")}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{workspace.branchName ?? "Branch"}</p>
                    <p className="text-muted-foreground text-xs">{branchAddress}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 rounded-md border p-2">
                  <p><span className="font-medium">{lt("Customer:")}</span> {customerName}</p>
                  <p><span className="font-medium">{lt("Shipper:")}</span> {shipment.shipperName || "-"}</p>
                  <p><span className="font-medium">{lt("Consignee:")}</span> {shipment.consigneeName || "-"}</p>
                  <p><span className="font-medium">{lt("Status:")}</span> {shipment.status}</p>
                  <p><span className="font-medium">{lt("Mode:")}</span> {shipment.modeOfTransport}</p>
                  <p><span className="font-medium">{lt("Master Waybill No:")}</span> {shipment.mawbNumber ?? "-"}</p>
                </div>
                <div className="space-y-1 rounded-md border p-2">
                  <p><span className="font-medium">{lt("Origin Port:")}</span> {shipment.originPortName || shipment.origin || "-"}</p>
                  <p><span className="font-medium">{lt("Destination Port:")}</span> {shipment.destinationPortName || shipment.destination || "-"}</p>
                  <p><span className="font-medium">{lt("Shipper Phone:")}</span> {shipment.shipperPhoneNumber || "-"}</p>
                  <p><span className="font-medium">{lt("Consignee Phone:")}</span> {shipment.consigneePhoneNumber || "-"}</p>
                  <p><span className="font-medium">{lt("ETD:")}</span> {formatDateTime(shipment.etd)}</p>
                  <p><span className="font-medium">{lt("ETA:")}</span> {formatDateTime(shipment.eta)}</p>
                  <p><span className="font-medium">{lt("Revenue:")}</span> {shipment.revenueAmount.toFixed(2)}</p>
                  <p><span className="font-medium">{lt("Cost:")}</span> {shipment.costAmount.toFixed(2)}</p>
                </div>
              </div>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full table-fixed text-[10px]">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-1.5 py-2 text-left w-[17%]">{lt("Package Type")}</th>
                      <th className="px-1.5 py-2 text-left w-[29%]">{lt("Description")}</th>
                      <th className="px-1.5 py-2 text-right w-[9%]">{lt("Pieces")}</th>
                      <th className="px-1.5 py-2 text-right w-[11%]">{lt("Weight")}</th>
                      <th className="px-1.5 py-2 text-right w-[8%]">L</th>
                      <th className="px-1.5 py-2 text-right w-[8%]">W</th>
                      <th className="px-1.5 py-2 text-right w-[8%]">H</th>
                      <th className="px-1.5 py-2 text-right w-[10%]">{lt("Vol (CBM)")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipment.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-1.5 py-1.5 break-words">{item.packageTypeName || "-"}</td>
                        <td className="px-1.5 py-1.5 break-words">{item.description || "-"}</td>
                        <td className="px-1.5 py-1.5 text-right">{item.pieces.toFixed(2)}</td>
                        <td className="px-1.5 py-1.5 text-right">{item.weight.toFixed(2)}</td>
                        <td className="px-1.5 py-1.5 text-right">{item.length.toFixed(2)}</td>
                        <td className="px-1.5 py-1.5 text-right">{item.width.toFixed(2)}</td>
                        <td className="px-1.5 py-1.5 text-right">{item.height.toFixed(2)}</td>
                        <td className="px-1.5 py-1.5 text-right">{item.volume.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PrintPreview>
        </CardContent>
      </Card>
    </div>
  );
}
