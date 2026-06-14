import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { getHouseShipment } from "@/api/houseShipmentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Barcode } from "@/components/common/Barcode";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { exportGoodsLabelsPdf, type GoodsLabelTemplateStyle } from "@/utils/goodsLabelsPdf";
import { labelSizeOptions, type LabelOrientation, type LabelUnit, type ResolvedLabelSize } from "@/modules/goodsReceipts/labelSizeConfig";
import { lt } from "@/modules/operationsLocalization";

export function HouseShipmentLabelPrintPage() {
  const { shipmentId } = useParams();
  const [sizeId, setSizeId] = useState("h30c_4x6");
  const [orientation, setOrientation] = useState<LabelOrientation>("portrait");
  const [customWidth, setCustomWidth] = useState(100);
  const [customHeight, setCustomHeight] = useState(150);
  const [customUnit, setCustomUnit] = useState<LabelUnit>("mm");
  const [templateStyle, setTemplateStyle] = useState<GoodsLabelTemplateStyle>("classic");
  const resolvedLabel: ResolvedLabelSize = (() => {
    const preset = labelSizeOptions.find((x) => x.id === sizeId) ?? labelSizeOptions[0];
    if (preset.custom) return { width: customWidth, height: customHeight, unit: customUnit, orientation };
    return { width: preset.width, height: preset.height, unit: preset.unit, orientation };
  })();
  const shipmentQuery = useQuery({ queryKey: ["house-shipment-print", shipmentId], queryFn: () => getHouseShipment(shipmentId!), enabled: Boolean(shipmentId) });
  if (!shipmentId) return <Navigate to="/house-shipments" replace />;
  if (shipmentQuery.isLoading) return <LoadingScreen />;
  if (shipmentQuery.isError || !shipmentQuery.data) return <ErrorState onRetry={() => void shipmentQuery.refetch()} />;

  const shipment = shipmentQuery.data;
  const hawbCode = shipment.hawbNumber?.trim() || shipment.houseShipmentNumber;
  const previewStyle = toCssSize(resolvedLabel);
  let globalIndex = 0;
  const labelItems = (shipment.items ?? []).flatMap((row) => {
    const groupQty = Math.max(1, Math.floor(row.loadedPieces ?? row.receivedPieces ?? 1));
    return Array.from({ length: groupQty }).map((_, groupIndex) => {
      globalIndex += 1;
      const seq = `${hawbCode}_${globalIndex}`;
      return {
        sequenceNo: seq,
        barcodeValue: seq,
        customerName: shipment.shipperName || "-",
        receivedFrom: shipment.consigneeName || "-",
        receivedDateTime: shipment.originPortName || shipment.origin || "-",
        warehouseLocation: shipment.destinationPortName || shipment.destination || "-",
        length: row.length ?? 0,
        width: row.width ?? 0,
        height: row.height ?? 0,
        qtyText: `${groupIndex + 1}/${groupQty}`
      };
    });
  });

  return <div className="space-y-4">
    <PageHeader
      title={`Print: ${shipment.houseShipmentNumber}`}
      description={lt("House shipment label print preview (HAWB-based barcode).")}
      actions={
        <>
          <PermissionButton
            permission="HouseShipment.Print"
            variant="outline"
            onClick={() => void exportGoodsLabelsPdf(`${shipment.houseShipmentNumber}-labels.pdf`, labelItems, resolvedLabel, templateStyle)}
          >
            <Download className="h-4 w-4" />{lt("Label PDF")}</PermissionButton>
        </>
      }
    />
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="flex h-10 items-center rounded-md border px-3 text-sm text-muted-foreground md:col-span-2">
            All item groups ({shipment.items.length}) are included
          </div>
          <select className="h-10 w-full rounded-md border px-3 text-sm" value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
            {labelSizeOptions.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <select className="h-10 w-full rounded-md border px-3 text-sm" value={orientation} onChange={(e) => setOrientation(e.target.value as LabelOrientation)}>
            <option value="portrait">{lt("Portrait")}</option>
            <option value="landscape">{lt("Landscape")}</option>
          </select>
          <select className="h-10 w-full rounded-md border px-3 text-sm" value={templateStyle} onChange={(e) => setTemplateStyle(e.target.value as GoodsLabelTemplateStyle)}>
            <option value="classic">{lt("Style 1 - Classic Table")}</option>
            <option value="compact">{lt("Style 2 - Compact Card")}</option>
          </select>
        </div>
        {sizeId === "custom" ? (
          <div className="grid gap-3 md:grid-cols-3">
            <input className="h-10 rounded-md border px-3 text-sm" type="number" min={1} value={customWidth} onChange={(e) => setCustomWidth(Math.max(1, Number(e.target.value) || 1))} placeholder={lt("Width")} />
            <input className="h-10 rounded-md border px-3 text-sm" type="number" min={1} value={customHeight} onChange={(e) => setCustomHeight(Math.max(1, Number(e.target.value) || 1))} placeholder={lt("Height")} />
            <select className="h-10 rounded-md border px-3 text-sm" value={customUnit} onChange={(e) => setCustomUnit(e.target.value as LabelUnit)}>
              <option value="mm">{lt("mm")}</option>
              <option value="in">{lt("inch")}</option>
              <option value="px">{lt("px")}</option>
            </select>
          </div>
        ) : null}
      </CardContent>
    </Card>
    <Card><CardContent className="pt-6">
      <PrintPreview title={lt("House Shipment Labels")}>
        <style>{`
          @media print {
            @page { size: ${previewStyle.width} ${previewStyle.height}; margin: 0; }
            body { margin: 0; padding: 0; }
            .labels-container { margin: 0 !important; padding: 0 !important; gap: 0 !important; }
            .label-page {
              width: ${previewStyle.width};
              height: ${previewStyle.height};
              margin: 0 !important;
              padding: 0 !important;
              border: 0 !important;
              box-sizing: border-box !important;
              page-break-after: always;
              break-after: page;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .label-page:last-child { page-break-after: avoid; break-after: avoid-page; }
            .label-inner {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              padding: 10px;
              overflow: hidden;
            }
          }
        `}</style>
        <div className="labels-container space-y-3">
          {labelItems.map((label) => (
            <div key={label.sequenceNo} className="label-page relative overflow-hidden rounded-md border bg-white p-3" style={{ width: previewStyle.width, height: previewStyle.height }}>
              <div className="label-inner relative">
                <div className="flex justify-center">
                  <Barcode value={label.barcodeValue} height={44} />
                </div>
                <p className="mt-1 text-center text-xs font-semibold">{label.sequenceNo}</p>
                {templateStyle === "compact" ? (
                  <div className="mt-2 rounded-md border border-sky-400 p-2 text-[11px]">
                    <p className="font-semibold">{shipment.shipperName || "-"}</p>
                    <p><span className="font-medium">{lt("Consignee:")}</span> {shipment.consigneeName || "-"}</p>
                    <p><span className="font-medium">{lt("Origin Port:")}</span> {shipment.originPortName || shipment.origin || "-"}</p>
                    <p><span className="font-medium">{lt("Destination Port:")}</span> {shipment.destinationPortName || shipment.destination || "-"}</p>
                    <p><span className="font-medium">{lt("Drop Location:")}</span> {shipment.dropLocation || "-"}</p>
                    <p><span className="font-medium">{lt("Dimensions:")}</span> {label.length} x {label.width} x {label.height}</p>
                    <div className="mt-1 flex items-center justify-between border-t border-sky-300 pt-1">
                      <span className="font-semibold">{lt("QTY")}</span>
                      <span className="font-semibold">{label.qtyText}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 rounded-md border border-sky-400">
                    <table className="w-full text-[11px]">
                      <tbody>
                        <tr className="border-b border-sky-300"><td className="w-1/2 px-2 py-1 text-right">{lt("Shipper Name")}</td><td className="px-2 py-1 font-semibold">{shipment.shipperName || "-"}</td></tr>
                        <tr className="border-b border-sky-300"><td className="px-2 py-1 text-right">{lt("Consignee Name")}</td><td className="px-2 py-1 font-semibold">{shipment.consigneeName || "-"}</td></tr>
                        <tr className="border-b border-sky-300"><td className="px-2 py-1 text-right">{lt("Origin Port")}</td><td className="px-2 py-1 font-semibold">{shipment.originPortName || shipment.origin || "-"}</td></tr>
                        <tr className="border-b border-sky-300"><td className="px-2 py-1 text-right">{lt("Destination Port")}</td><td className="px-2 py-1 font-semibold">{shipment.destinationPortName || shipment.destination || "-"}</td></tr>
                        <tr className="border-b border-sky-300"><td className="px-2 py-1 text-right">{lt("Drop Location")}</td><td className="px-2 py-1 font-semibold">{shipment.dropLocation || "-"}</td></tr>
                        <tr className="border-b border-sky-300"><td className="px-2 py-1 text-right">{lt("Dimensions")}</td><td className="px-2 py-1 font-semibold">{label.length} x {label.width} x {label.height}</td></tr>
                        <tr><td className="px-2 py-1 text-right">{lt("QTY")}</td><td className="px-2 py-1 text-left font-semibold">{label.qtyText}</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </PrintPreview>
    </CardContent></Card>
  </div>;
}

function toCssSize(size: ResolvedLabelSize) {
  const width = `${size.width}${size.unit}`;
  const height = `${size.height}${size.unit}`;
  if (size.orientation === "landscape") return { width: height, height: width };
  return { width, height };
}
