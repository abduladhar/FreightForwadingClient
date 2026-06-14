import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { searchWarehouseLocations, searchWarehouses, transferStock } from "@/api/warehouseApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function WarehouseStockTransferPage() {
  const toast = useToast();
  const warehouseQuery = useQuery({ queryKey: ["warehouse-ops-transfer-warehouses"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const locationQuery = useQuery({ queryKey: ["warehouse-ops-transfer-locations"], queryFn: () => searchWarehouseLocations({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const [barcodeQrSearch, setBarcodeQrSearch] = useState("");
  const [value, setValue] = useState({ goodsReceiptItemId: "", fromWarehouseLocationId: "", toWarehouseId: "", toWarehouseLocationId: "", pieces: "0", weight: "0", volume: "0", referenceType: "StockTransfer", referenceId: "", remarks: "" });
  const mutation = useMutation({
    mutationFn: () => transferStock({
      goodsReceiptItemId: value.goodsReceiptItemId,
      fromWarehouseLocationId: value.fromWarehouseLocationId,
      toWarehouseId: value.toWarehouseId,
      toWarehouseLocationId: value.toWarehouseLocationId,
      pieces: Number(value.pieces),
      weight: Number(value.weight),
      volume: Number(value.volume),
      referenceType: value.referenceType,
      referenceId: value.referenceId || null,
      remarks: value.remarks || null
    }),
    onSuccess: () => toast.success("Stock transfer completed.")
  });
  const locations = (locationQuery.data?.items ?? []).filter((x) => !barcodeQrSearch || `${x.locationCode} ${x.id}`.toLowerCase().includes(barcodeQrSearch.toLowerCase()));
  const toLocations = locations.filter((l) => !value.toWarehouseId || l.warehouseId === value.toWarehouseId);
  const canSubmit = Boolean(value.goodsReceiptItemId && value.fromWarehouseLocationId && value.toWarehouseId && value.toWarehouseLocationId && Number(value.pieces) > 0);
  return <div className="space-y-4"><PageHeader title="Stock Transfer Operations" description="Transfer stock by warehouse/rack/bin with barcode/QR assisted lookup." actions={<AuditTrailButton />} /><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><div className="md:col-span-2 space-y-1"><Label>Barcode/QR Search</Label><div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder="Search location/barcode/QR ref" value={barcodeQrSearch} onChange={(e) => setBarcodeQrSearch(e.target.value)} /></div></div>{field("Goods Receipt Item Id", <Input value={value.goodsReceiptItemId} onChange={(e) => setValue({ ...value, goodsReceiptItemId: e.target.value })} />)}{field("From Rack/Bin", <select className="h-10 rounded-md border px-3 text-sm" value={value.fromWarehouseLocationId} onChange={(e) => setValue({ ...value, fromWarehouseLocationId: e.target.value })}><option value="">Select location</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.locationCode}</option>)}</select>)}{field("To Warehouse", <select className="h-10 rounded-md border px-3 text-sm" value={value.toWarehouseId} onChange={(e) => setValue({ ...value, toWarehouseId: e.target.value, toWarehouseLocationId: "" })}><option value="">Select warehouse</option>{(warehouseQuery.data?.items ?? []).map((w) => <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>)}</select>)}{field("To Rack/Bin", <select className="h-10 rounded-md border px-3 text-sm" value={value.toWarehouseLocationId} onChange={(e) => setValue({ ...value, toWarehouseLocationId: e.target.value })}><option value="">Select location</option>{toLocations.map((l) => <option key={l.id} value={l.id}>{l.locationCode}</option>)}</select>)}{field("Pieces", <Input type="number" min="0" step="0.01" value={value.pieces} onChange={(e) => setValue({ ...value, pieces: e.target.value })} />)}{field("Weight", <Input type="number" min="0" step="0.01" value={value.weight} onChange={(e) => setValue({ ...value, weight: e.target.value })} />)}{field("Volume", <Input type="number" min="0" step="0.01" value={value.volume} onChange={(e) => setValue({ ...value, volume: e.target.value })} />)}{field("Remarks", <Input value={value.remarks} onChange={(e) => setValue({ ...value, remarks: e.target.value })} />)}<div className="md:col-span-2"><PermissionButton permission="Warehouse.Update" onClick={() => void mutation.mutate()} disabled={!canSubmit || mutation.isPending}>Transfer Stock</PermissionButton></div></CardContent></Card></div>;
}

function field(label: string, element: ReactNode) {
  return <div className="space-y-1"><Label>{label}</Label>{element}</div>;
}
