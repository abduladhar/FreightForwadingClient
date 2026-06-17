import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { getAvailableGoods, type AvailableGoodsDto } from "@/api/goodsReceiptApi";
import { searchCustomers } from "@/api/customerApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { lt } from "@/modules/operationsLocalization";

export function AvailableGoodsLookupPage() {
  const [customerId, setCustomerId] = useState("");
  const [search, setSearch] = useState("");
  const [barcodeQrSearch, setBarcodeQrSearch] = useState("");
  const customers = useQuery({ queryKey: ["warehouse-ops-customers"], queryFn: () => searchCustomers({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const goods = useQuery({ queryKey: ["warehouse-ops-available-goods", customerId], queryFn: () => getAvailableGoods(customerId || undefined) });
  const rows = useMemo(() => (goods.data ?? []).filter((x) => !barcodeQrSearch || `${x.goodsReceiptItemId} ${x.goodsReceiptNumber} ${x.packageTypeCode} ${x.packageTypeName} ${x.description}`.toLowerCase().includes(barcodeQrSearch.toLowerCase())), [goods.data, barcodeQrSearch]);
  const columns: ColumnDef<AvailableGoodsDto>[] = [
    { accessorKey: "goodsReceiptNumber", header: lt("GRN No") },
    { accessorKey: "goodsReceiptItemId", header: lt("GR Item Ref") },
    { id: "packageType", header: lt("Package Type"), cell: ({ row }) => row.original.packageTypeCode ? `${row.original.packageTypeCode} - ${row.original.packageTypeName}` : row.original.packageTypeName },
    { accessorKey: "description", header: lt("Description") },
    { accessorKey: "availablePieces", header: lt("Available Qty") },
    { accessorKey: "receivedWeight", header: lt("Weight") },
    { accessorKey: "volumeCbm", header: lt("Volume") },
    { accessorKey: "status", header: lt("Status") }
  ];
  return <div className="space-y-4"><PageHeader title={lt("Available Goods Lookup")} description={lt("Goods receipt item lookup with barcode/QR-style search and availability insight.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-4 pt-6"><div className="grid gap-3 md:grid-cols-3"><select className="h-10 rounded-md border px-3 text-sm" value={customerId} onChange={(e) => setCustomerId(e.target.value)}><option value="">{lt("All customers")}</option>{(customers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.customerCode} - {x.customerName}</option>)}</select><div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder={lt("Barcode/QR/package search")} value={barcodeQrSearch} onChange={(e) => setBarcodeQrSearch(e.target.value)} /></div></div><DataTable data={rows} columns={columns} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} search={search} onSearchChange={setSearch} onPaginationChange={() => undefined} isLoading={goods.isLoading} isError={goods.isError} onRetry={() => void goods.refetch()} /></CardContent></Card></div>;
}
