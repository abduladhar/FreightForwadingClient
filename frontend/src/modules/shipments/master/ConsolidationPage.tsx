import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getMasterShipmentConsolidationReport } from "@/api/masterShipmentApi";
import { ExportButtons } from "@/components/common/ExportButtons";
import { useWorkspace } from "@/hooks/useWorkspace";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { exportFilteredCsv } from "@/utils/csvExport";
import { exportExcelReport } from "@/utils/excelExport";
import { exportPdfReport } from "@/utils/pdfExport";
import { lt } from "@/modules/operationsLocalization";

export function ConsolidationPage() {
  const { masterShipmentId } = useParams();
  const workspace = useWorkspace();
  const query = useQuery({ queryKey: ["master-shipment-consolidation", masterShipmentId], queryFn: () => getMasterShipmentConsolidationReport(masterShipmentId!), enabled: Boolean(masterShipmentId) });
  if (!masterShipmentId) return <Navigate to="/master-shipments" replace />;
  const r = query.data;
  const rows = (r?.items ?? []).map((x) => ({
    houseShipmentNumber: x.houseShipmentNumber,
    consolidatedPieces: x.consolidatedPieces,
    consolidatedWeight: x.consolidatedWeight,
    consolidatedVolume: x.consolidatedVolume,
    chargeableWeight: x.chargeableWeight,
    allocatedCostAmount: x.allocatedCostAmount
  }));

  return <div className="space-y-4">
    <PageHeader
      title={lt("Consolidation Report")}
      description={lt("House shipment consolidation report for this master shipment.")}
      actions={
        <ExportButtons
          onExportCsv={() => exportFilteredCsv(rows, `${r?.masterShipmentNumber ?? "master-shipment"}-consolidation.csv`)}
          onExportExcel={() => void exportExcelReport({
            fileName: `${r?.masterShipmentNumber ?? "master-shipment"}-consolidation.xlsx`,
            reportTitle: lt("Master Shipment Consolidation Report"),
            tenantName: workspace.tenantCode,
            branchName: workspace.branchName,
            sheets: [{
              sheetName: lt("Consolidation"),
              columns: [
                { key: "houseShipmentNumber", header: lt("House Shipment") },
                { key: "consolidatedPieces", header: lt("Pieces"), type: "number" },
                { key: "consolidatedWeight", header: lt("Weight"), type: "number" },
                { key: "consolidatedVolume", header: lt("Volume"), type: "number" },
                { key: "chargeableWeight", header: lt("Chargeable Weight"), type: "number" },
                { key: "allocatedCostAmount", header: lt("Allocated Cost"), type: "currency", currencyCode: workspace.baseCurrency }
              ],
              rows
            }]
          })}
          onExportPdf={() => void exportPdfReport({
            fileName: `${r?.masterShipmentNumber ?? "master-shipment"}-consolidation.pdf`,
            title: lt("Master Shipment Consolidation Report"),
            tenantName: workspace.tenantCode,
            branchName: workspace.branchName,
            currencyCode: workspace.baseCurrency,
            cultureCode: workspace.cultureCode,
            rtl: workspace.languageCode.toLowerCase().startsWith("ar"),
            columns: [
              { key: "houseShipmentNumber", label: lt("House Shipment") },
              { key: "consolidatedPieces", label: lt("Pieces"), align: "right" },
              { key: "consolidatedWeight", label: lt("Weight"), align: "right" },
              { key: "consolidatedVolume", label: lt("Volume"), align: "right" },
              { key: "chargeableWeight", label: lt("Chargeable"), align: "right" },
              { key: "allocatedCostAmount", label: lt("Allocated Cost"), align: "right" }
            ],
            rows
          })}
        />
      }
    />
    <Card><CardContent className="pt-6 space-y-2">
      <p className="text-sm">{lt("Master Shipment")}: <span className="font-medium">{r?.masterShipmentNumber ?? "-"}</span></p>
      <p className="text-sm">{lt("Status")}: <span className="font-medium">{r?.status ?? "-"}</span></p>
      <p className="text-sm">{lt("Totals")}: {lt("Pieces")} {r?.totalPieces ?? 0} | {lt("Weight")} {r?.totalWeight ?? 0} | {lt("Volume")} {r?.totalVolume ?? 0} | {lt("Chargeable")} {r?.totalChargeableWeight ?? 0}</p>
      <div className="space-y-2">{(r?.items ?? []).map((x) => <div key={x.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{x.houseShipmentNumber}</p><p className="text-muted-foreground">{lt("Pieces")} {x.consolidatedPieces} | {lt("Weight")} {x.consolidatedWeight} | {lt("Volume")} {x.consolidatedVolume}</p></div>)}</div>
    </CardContent></Card>
  </div>;
}
