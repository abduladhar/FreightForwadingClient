import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { getAvailableStock, getWarehouseStockReport, searchWarehouses, type AvailableStockDto } from "@/api/warehouseApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { ExportButtons } from "@/components/common/ExportButtons";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { exportFilteredCsv } from "@/utils/csvExport";

export function WarehouseStockPage() {
  const [warehouseId, setWarehouseId] = useState("");
  const [search, setSearch] = useState("");
  const [rackBinFilter, setRackBinFilter] = useState("");
  const [barcodeQrSearch, setBarcodeQrSearch] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const warehouseQuery = useQuery({ queryKey: ["warehouse-ops-list-lookup"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 200 }) });
  const stockQuery = useQuery({ queryKey: ["warehouse-ops-available-stock", warehouseId], queryFn: () => getAvailableStock(warehouseId || undefined), enabled: Boolean(warehouseId) });
  const reportQuery = useQuery({ queryKey: ["warehouse-stock-report", warehouseId], queryFn: () => getWarehouseStockReport(warehouseId), enabled: Boolean(warehouseId) });
  const rows = useMemo(() => (stockQuery.data ?? []).filter((x) => {
    const filterText = `${x.locationCode} ${x.warehouseCode}`.toLowerCase();
    if (rackBinFilter && !filterText.includes(rackBinFilter.toLowerCase())) return false;
    if (barcodeQrSearch && !`${x.goodsReceiptItemId}`.toLowerCase().includes(barcodeQrSearch.toLowerCase())) return false;
    return true;
  }), [stockQuery.data, rackBinFilter, barcodeQrSearch]);
  const columns: ColumnDef<AvailableStockDto>[] = [
    { accessorKey: "warehouseCode", header: "Warehouse" },
    { accessorKey: "locationCode", header: "Rack/Bin" },
    { accessorKey: "goodsReceiptItemId", header: "GR Item Ref" },
    { accessorKey: "availablePieces", header: "Available" },
    { accessorKey: "reservedPieces", header: "Reserved" },
    { accessorKey: "damagedPieces", header: "Damaged" },
    { accessorKey: "returnedPieces", header: "Returned" },
    { accessorKey: "weight", header: "Weight" },
    { accessorKey: "volume", header: "Volume" }
  ];
  const exportCsv = () => exportFilteredCsv(rows.map((x) => ({
    warehouseCode: x.warehouseCode,
    locationCode: x.locationCode,
    goodsReceiptItemId: x.goodsReceiptItemId,
    availablePieces: x.availablePieces,
    reservedPieces: x.reservedPieces,
    damagedPieces: x.damagedPieces,
    returnedPieces: x.returnedPieces,
    weight: x.weight,
    volume: x.volume
  })), "warehouse-stock.csv");

  return <div className="space-y-4"><PageHeader title="Warehouse Stock Operations" description="Available stock table with rack/bin filters, export, and print-ready stock report." actions={<><AuditTrailButton /><ExportButtons onExportCsv={exportCsv} /></>} /><Card><CardContent className="space-y-4 pt-6"><div className="grid gap-3 md:grid-cols-4"><select className="h-10 rounded-md border px-3 text-sm" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}><option value="">Select warehouse</option>{(warehouseQuery.data?.items ?? []).map((w) => <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>)}</select><Input placeholder="Rack/bin filter" value={rackBinFilter} onChange={(e) => setRackBinFilter(e.target.value)} /><div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder="Barcode/QR search" value={barcodeQrSearch} onChange={(e) => setBarcodeQrSearch(e.target.value)} /></div><Button variant="outline" onClick={() => setShowPrintPreview(true)} disabled={!reportQuery.data}>Open Print Preview</Button></div><DataTable data={rows} columns={columns} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} search={search} onSearchChange={setSearch} onPaginationChange={() => undefined} isLoading={stockQuery.isLoading} isError={stockQuery.isError} onRetry={() => void stockQuery.refetch()} /></CardContent></Card>{reportQuery.data && showPrintPreview ? <PrintPreview title={`Warehouse Stock Report - ${reportQuery.data.warehouseCode}`}><div className="space-y-2 text-sm"><p><span className="font-medium">Warehouse:</span> {reportQuery.data.warehouseName} ({reportQuery.data.warehouseCode})</p><p><span className="font-medium">Available Pieces:</span> {reportQuery.data.availablePieces}</p><p><span className="font-medium">Reserved Pieces:</span> {reportQuery.data.reservedPieces}</p><p><span className="font-medium">Damaged Pieces:</span> {reportQuery.data.damagedPieces}</p><p><span className="font-medium">Returned Pieces:</span> {reportQuery.data.returnedPieces}</p><p><span className="font-medium">Weight:</span> {reportQuery.data.weight}</p><p><span className="font-medium">Volume:</span> {reportQuery.data.volume}</p></div></PrintPreview> : null}</div>;
}
