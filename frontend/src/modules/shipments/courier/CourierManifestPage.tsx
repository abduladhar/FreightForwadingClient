import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getCourier } from "@/api/freightApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ExportButtons } from "@/components/common/ExportButtons";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { exportFilteredCsv } from "@/utils/csvExport";

export function CourierManifestPage() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const query = useQuery({ queryKey: ["courier", id], queryFn: () => getCourier(id), enabled: Boolean(id) });
  const rows = (query.data?.pieces ?? []).map((x) => ({ pieceNumber: x.pieceNumber, barcode: x.barcode, scanStatus: x.scanStatus, lastScanLocation: x.lastScanLocation ?? "", lastScanTime: x.lastScanTime ?? "" }));
  return <div className="space-y-4">
    <PageHeader title="Courier Manifest" description="Courier manifest and delivery scan view." actions={<><AuditTrailButton /><ExportButtons onExportCsv={() => exportFilteredCsv(rows, `courier-manifest-${id}.csv`)} /></>} />
    <Card><CardContent className="pt-6 space-y-2"><p className="text-sm">Manifest Number: <span className="font-medium">{query.data?.manifestNumber ?? "-"}</span></p><p className="text-sm">Return Shipment: <span className="font-medium">{query.data?.isReturnShipment ? "Yes" : "No"}</span></p><p className="text-sm">COD Required: <span className="font-medium">{query.data?.isCodRequired ? `Yes (${query.data.codAmount})` : "No"}</span></p><div className="space-y-2">{rows.map((x) => <div key={x.pieceNumber} className="rounded-md border p-3 text-sm"><p className="font-medium">{x.pieceNumber} ({x.barcode})</p><p className="text-muted-foreground">{x.scanStatus} | {x.lastScanLocation || "-"} | {x.lastScanTime || "-"}</p></div>)}</div></CardContent></Card>
  </div>;
}
