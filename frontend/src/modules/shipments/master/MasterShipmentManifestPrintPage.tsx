import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { getMasterShipment } from "@/api/masterShipmentApi";
import { getTenantById } from "@/api/tenantApi";
import { getBranchById } from "@/api/branchApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { PermissionGuard } from "@/auth/PermissionGuard";
import { EmailReportAction } from "@/components/common/EmailReportAction";
import { EmailPdfReportButton } from "@/components/common/EmailPdfReportButton";
import { PrintPreview } from "@/components/common/PrintPreview";
import { useWorkspace } from "@/hooks/useWorkspace";
import { PageHeader } from "@/components/PageHeader";
import { createMasterManifestPdfBlob, exportMasterManifestPdf } from "@/utils/masterManifestPdf";
import { lt } from "@/modules/operationsLocalization";

export function MasterShipmentManifestPrintPage() {
  const { masterShipmentId } = useParams();
  const workspace = useWorkspace();
  const { session } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  const query = useQuery({ queryKey: ["master-shipment-manifest", masterShipmentId], queryFn: () => getMasterShipment(masterShipmentId!), enabled: Boolean(masterShipmentId) });
  const tenant = useQuery({
    queryKey: ["master-shipment-manifest-tenant", session?.tenantId],
    queryFn: () => getTenantById(session!.tenantId!),
    enabled: Boolean(session?.tenantId)
  });
  const branch = useQuery({
    queryKey: ["master-shipment-manifest-branch", session?.branchId],
    queryFn: () => getBranchById(session!.branchId!),
    enabled: Boolean(session?.branchId)
  });
  if (!masterShipmentId) return <Navigate to="/master-shipments" replace />;
  if (!query.data) return <div className="p-4 text-sm text-muted-foreground">{lt("Loading manifest preview...")}</div>;
  const shipment = query.data;
  const fallbackLogoPath = `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const logoUrl = tenant.data?.logoUrl?.trim() || fallbackLogoPath;
  const branchAddress = branch.data?.address?.trim() || lt("Sample Address Line 1, City, Country");
  return <div className="space-y-4">
    <PageHeader
      title={`${lt("Manifest")}: ${shipment.masterShipmentNumber}`}
      description={lt("Master shipment manifest with consolidated item details.")}
      actions={
        <>
          <PermissionGuard permission="MasterShipment.Export" fallback="hidden">
            <EmailReportAction
              subject={`Master Shipment Manifest - ${shipment.masterShipmentNumber}`}
              reportName={`Manifest ${shipment.masterShipmentNumber}`}
              module="MasterShipment"
              getHtml={() => reportRef.current?.outerHTML ?? ""}
            />
          </PermissionGuard>
          <PermissionGuard permission="MasterShipment.Export" fallback="hidden">
            <EmailPdfReportButton
              fileName={`${shipment.masterShipmentNumber}.pdf`}
              subject={`Master Shipment Manifest - ${shipment.masterShipmentNumber}`}
              reportName={`Manifest ${shipment.masterShipmentNumber}`}
              module="MasterShipment"
              createPdfBlob={() => createMasterManifestPdfBlob({
                fileName: `${shipment.masterShipmentNumber}.pdf`,
                tenantName: workspace.tenantCode,
                branchName: workspace.branchName ?? lt("Branch"),
                branchAddress,
                logoUrl,
                masterShipment: shipment
              })}
            />
          </PermissionGuard>
          <PermissionButton
            permission="MasterShipment.Print"
            variant="outline"
            onClick={() => void exportMasterManifestPdf({
              fileName: `${shipment.masterShipmentNumber}.pdf`,
              tenantName: workspace.tenantCode,
              branchName: workspace.branchName ?? lt("Branch"),
              branchAddress,
              logoUrl,
              masterShipment: shipment
            })}
          >
            <Download className="h-4 w-4" />{lt("PDF Export")}</PermissionButton>
        </>
      }
    />
    <PrintPreview title={`${lt("Manifest")} ${shipment.masterShipmentNumber}`}>
      <div ref={reportRef} className="space-y-4 text-xs sm:text-sm">
        <div className="border-b pb-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr_160px] lg:grid-cols-[260px_1fr_260px] items-center">
            <div className="flex justify-center sm:justify-start">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 object-contain" /> : <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28" />}</div>
            <div className="text-center"><h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-wide">{lt("MASTER SHIPMENT MANIFEST")}</h3></div>
            <div className="text-center sm:text-right"><p className="font-semibold">{workspace.branchName ?? lt("Branch")}</p><p className="text-muted-foreground break-words">{branchAddress}</p></div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1 rounded-md border p-2">
            <p><span className="font-medium">{lt("Master No:")}</span> {shipment.masterShipmentNumber}</p>
            <p><span className="font-medium">{lt("MAWB:")}</span> {shipment.mawbNumber ?? "-"}</p>
            <p><span className="font-medium">{lt("MBL:")}</span> {shipment.mblNumber ?? "-"}</p>
            <p><span className="font-medium">{lt("Status:")}</span> {shipment.status}</p>
          </div>
          <div className="space-y-1 rounded-md border p-2">
            <p><span className="font-medium">{lt("Mode:")}</span> {shipment.modeOfTransport}</p>
            <p><span className="font-medium">{lt("Carrier:")}</span> {shipment.carrierName || "-"}</p>
            <p><span className="font-medium">{lt("Origin Port:")}</span> {shipment.originPortName || "-"}</p>
            <p><span className="font-medium">{lt("Destination Port:")}</span> {shipment.destinationPortName || "-"}</p>
          </div>
        </div>
        <div className="rounded-md border overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[1100px] print:min-w-0 text-xs print:text-[10px] table-fixed">
            <thead className="bg-muted">
              <tr>
                <th className="px-2 py-2 text-left w-[10%]">{lt("HAWB")}</th>
                <th className="px-2 py-2 text-left w-[10%]">{lt("Shipper Name")}</th>
                <th className="px-2 py-2 text-left w-[15%]">{lt("Shipper Address")}</th>
                <th className="px-2 py-2 text-left w-[10%]">{lt("Consignee Name")}</th>
                <th className="px-2 py-2 text-left w-[15%]">{lt("Consignee Address")}</th>
                <th className="px-2 py-2 text-left w-[14%]">{lt("Description")}</th>
                <th className="px-2 py-2 text-left w-[8%]">{lt("Package Type")}</th>
                <th className="px-2 py-2 text-right w-[6%]">{lt("Pieces")}</th>
                <th className="px-2 py-2 text-right w-[6%]">{lt("Weight")}</th>
                <th className="px-2 py-2 text-right w-[6%]">{lt("Volume")}</th>
              </tr>
            </thead>
            <tbody>
              {shipment.items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-2 py-1.5 break-all">{item.hawbNumber || item.houseShipmentNumber || "-"}</td>
                  <td className="px-2 py-1.5 break-words">{item.shipperName || "-"}</td>
                  <td className="px-2 py-1.5 break-words whitespace-pre-wrap">{item.shipperAddress || "-"}</td>
                  <td className="px-2 py-1.5 break-words">{item.consigneeName || "-"}</td>
                  <td className="px-2 py-1.5 break-words whitespace-pre-wrap">{item.consigneeAddress || "-"}</td>
                  <td className="px-2 py-1.5 break-words">{item.houseShipmentItemDescription || "-"}</td>
                  <td className="px-2 py-1.5 break-words">{item.packageTypeName || "-"}</td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">{item.consolidatedPieces.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">{item.consolidatedWeight.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">{item.consolidatedVolume.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PrintPreview>
  </div>;
}
