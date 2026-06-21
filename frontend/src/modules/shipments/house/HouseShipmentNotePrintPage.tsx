import { useRef } from "react";
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
import { PermissionGuard } from "@/auth/PermissionGuard";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { EmailReportAction } from "@/components/common/EmailReportAction";
import { EmailPdfReportButton } from "@/components/common/EmailPdfReportButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { createHouseShipmentPdfBlob, exportHouseShipmentPdf } from "@/utils/houseShipmentPdf";
import { lt } from "@/modules/operationsLocalization";

export function HouseShipmentNotePrintPage() {
  const { shipmentId } = useParams();
  const workspace = useWorkspace();
  const reportRef = useRef<HTMLDivElement>(null);
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
          <PermissionGuard permission="HouseShipment.Export" fallback="hidden">
            <EmailReportAction
              subject={`House Shipment Job Card - ${shipment.houseShipmentNumber}`}
              reportName={`Job Card ${shipment.houseShipmentNumber}`}
              module="HouseShipment"
              defaultEmail={customer.data?.email}
              getHtml={() => reportRef.current?.outerHTML ?? ""}
            />
          </PermissionGuard>
          <PermissionGuard permission="HouseShipment.Export" fallback="hidden">
            <EmailPdfReportButton
              fileName={`${shipment.houseShipmentNumber}.pdf`}
              subject={`House Shipment Job Card - ${shipment.houseShipmentNumber}`}
              reportName={`Job Card ${shipment.houseShipmentNumber}`}
              module="HouseShipment"
              defaultEmail={customer.data?.email}
              createPdfBlob={() => createHouseShipmentPdfBlob({
                fileName: `${shipment.houseShipmentNumber}.pdf`,
                tenantName: workspace.tenantCode,
                branchName: workspace.branchName ?? "Branch",
                branchAddress,
                logoUrl,
                customerName: customer.data?.customerName,
                houseShipment: shipment,
                reportTitle: lt("HOUSE SHIPMENT JOB CARD")
              })}
            />
          </PermissionGuard>
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
        <div ref={reportRef} className="mx-auto w-full max-w-[190mm] space-y-4 text-sm">
          <div className="border-b pb-3">
            <div className="grid grid-cols-[150px_1fr_190px] items-center gap-3">
              <div className="flex justify-start">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-24 w-24 object-contain" /> : <div className="h-24 w-24" />}</div>
              <div className="text-center"><h3 className="text-xl font-bold tracking-wide">{lt("HOUSE SHIPMENT JOB CARD")}</h3></div>
              <div className="text-right"><p className="font-semibold">{workspace.branchName ?? "Branch"}</p><p className="break-words text-muted-foreground">{branchAddress}</p></div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 rounded-md border p-2">
              <p><span className="font-medium">{lt("Shipment No:")}</span> {shipment.houseShipmentNumber}</p>
              <p><span className="font-medium">{lt("HAWB:")}</span> {shipment.hawbNumber ?? "-"}</p>
              <p><span className="font-medium">{lt("Customer:")}</span> {customer.data?.customerName ?? shipment.customerId}</p>
              <p><span className="font-medium">{lt("Status:")}</span> {lt(shipment.status)}</p>
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
          <div className="rounded-md border">
            <table className="w-full table-fixed text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="w-[20%] px-2 py-2 text-left">{lt("Package Type")}</th>
                  <th className="w-[24%] px-2 py-2 text-left">{lt("Description")}</th>
                  <th className="w-[11%] px-2 py-2 text-right">{lt("Packages")}</th>
                  <th className="w-[11%] px-2 py-2 text-right">{lt("Gross Wt")}</th>
                  <th className="w-[7%] px-2 py-2 text-right">L</th>
                  <th className="w-[7%] px-2 py-2 text-right">W</th>
                  <th className="w-[7%] px-2 py-2 text-right">H</th>
                  <th className="w-[13%] px-2 py-2 text-right">{lt("Vol (CBM)")}</th>
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
