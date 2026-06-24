import { useEffect, useId, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, RefreshCw } from "lucide-react";
import { exportBillOfEntrySummary, getBillOfEntrySummary, getBillOfEntrySummaryTotals, searchBoeInventories, type BillOfEntrySummaryRow } from "@/api/billOfEntryApi";
import { searchWarehouseLocations, searchWarehouses } from "@/api/warehouseApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/modules/operationsLocalization";

export function BillOfEntrySummaryPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouseLocationId, setWarehouseLocationId] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const inventories = useQuery({ queryKey: ["boe-summary-inventories"], queryFn: () => searchBoeInventories({ pageNumber: 1, pageSize: 500 }) });
  const warehouses = useQuery({ queryKey: ["boe-summary-warehouses"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const locations = useQuery({
    queryKey: ["boe-summary-locations", warehouseId],
    queryFn: () => searchWarehouseLocations({ pageNumber: 1, pageSize: 500, isActive: true, warehouseId: warehouseId || undefined }),
    enabled: Boolean(warehouseId)
  });
  const query = useQuery({
    queryKey: ["bill-of-entry-summary", pageNumber, pageSize, search, inventoryId, warehouseId, warehouseLocationId, onlyAvailable],
    queryFn: () => getBillOfEntrySummary({
      pageNumber,
      pageSize,
      search,
      inventoryId: inventoryId || undefined,
      warehouseId: warehouseId || undefined,
      warehouseLocationId: warehouseLocationId || undefined,
      onlyAvailable
    })
  });
  const totalsQuery = useQuery({
    queryKey: ["bill-of-entry-summary-totals", search, inventoryId, warehouseId, warehouseLocationId, onlyAvailable],
    queryFn: () => getBillOfEntrySummaryTotals({
      search,
      inventoryId: inventoryId || undefined,
      warehouseId: warehouseId || undefined,
      warehouseLocationId: warehouseLocationId || undefined,
      onlyAvailable
    })
  });

  const columns: ColumnDef<BillOfEntrySummaryRow>[] = [
    { accessorKey: "m1", header: lt("M1") },
    { accessorKey: "m2", header: lt("M2") },
    { accessorKey: "declarationDate", header: lt("Date"), cell: ({ row }) => formatDate(row.original.declarationDate) },
    { accessorKey: "hsCode", header: lt("HS Code"), cell: ({ row }) => row.original.hsCode || "-" },
    { accessorKey: "particulars", header: lt("Particulars") },
    { accessorKey: "countryOfOrigin", header: lt("COG") },
    { accessorKey: "packageType", header: lt("PKG Type") },
    { accessorKey: "goodsInQuantity", header: lt("Goods In Qty"), cell: ({ row }) => formatNumber(row.original.goodsInQuantity) },
    { accessorKey: "goodsInWeight", header: lt("Goods In WT"), cell: ({ row }) => formatNumber(row.original.goodsInWeight) },
    { accessorKey: "goodsInValue", header: lt("Goods In Value"), cell: ({ row }) => formatNumber(row.original.goodsInValue) },
    { accessorKey: "availableQuantity", header: lt("Available Qty"), cell: ({ row }) => formatNumber(row.original.availableQuantity) },
    { accessorKey: "availableWeight", header: lt("Available WT"), cell: ({ row }) => formatNumber(row.original.availableWeight) },
    { accessorKey: "availableValue", header: lt("Available Value"), cell: ({ row }) => formatNumber(row.original.availableValue) },
    { accessorKey: "itemCodeRelated", header: lt("Item Code Related") },
    { accessorKey: "comments", header: lt("Comments"), cell: ({ row }) => row.original.comments || "-" }
  ];

  function exportSummary() {
    void exportBillOfEntrySummary({
      search: search || undefined,
      inventoryId: inventoryId || undefined,
      warehouseId: warehouseId || undefined,
      warehouseLocationId: warehouseLocationId || undefined,
      onlyAvailable
    });
  }

  function refreshSummary() {
    void query.refetch();
    void totalsQuery.refetch();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Stock Declaration Summary")}
        description={lt("BOE item stock summary with goods-in and available stock values for customs audit review.")}
        actions={
          <>
            <Button variant="outline" onClick={refreshSummary}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button>
            <Button variant="outline" onClick={exportSummary}><Download className="h-4 w-4" />{lt("Export Excel")}</Button>
          </>
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <FilterField label={lt("Inventory")}>
              <FilterableSelect
                value={inventoryId}
                onChange={(value) => { setInventoryId(value); setPageNumber(1); }}
                placeholder={lt("All inventories")}
                options={(inventories.data?.items ?? []).map((item) => ({ value: item.id, label: `${item.inventoryCode} - ${item.inventoryName}` }))}
              />
            </FilterField>
            <FilterField label={lt("Warehouse")}>
              <FilterableSelect
                value={warehouseId}
                onChange={(value) => { setWarehouseId(value); setWarehouseLocationId(""); setPageNumber(1); }}
                placeholder={lt("All warehouses")}
                options={(warehouses.data?.items ?? []).map((item) => ({ value: item.id, label: `${item.warehouseCode} - ${item.warehouseName}` }))}
              />
            </FilterField>
            <FilterField label={lt("Warehouse Location")}>
              <FilterableSelect
                value={warehouseLocationId}
                onChange={(value) => { setWarehouseLocationId(value); setPageNumber(1); }}
                placeholder={!warehouseId ? lt("Select warehouse first") : locations.isLoading ? lt("Loading locations...") : lt("All locations")}
                options={(locations.data?.items ?? []).map((item) => ({ value: item.id, label: warehouseLocationLabel(item) }))}
                disabled={!warehouseId || locations.isLoading}
              />
            </FilterField>
            <div className="flex items-end gap-2 pb-2">
              <input type="checkbox" className="h-4 w-4" checked={onlyAvailable} onChange={(event) => { setOnlyAvailable(event.target.checked); setPageNumber(1); }} />
              <Label>{lt("Only available stock")}</Label>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
            <SummaryMetric label={lt("Lines")} value={totalsQuery.data?.lineCount ?? 0} />
            <SummaryMetric label={lt("Goods In Qty")} value={totalsQuery.data?.goodsInQuantity ?? 0} />
            <SummaryMetric label={lt("Goods In WT")} value={totalsQuery.data?.goodsInWeight ?? 0} />
            <SummaryMetric label={lt("Goods In Value")} value={totalsQuery.data?.goodsInValue ?? 0} />
            <SummaryMetric label={lt("Available Qty")} value={totalsQuery.data?.availableQuantity ?? 0} />
            <SummaryMetric label={lt("Available WT")} value={totalsQuery.data?.availableWeight ?? 0} />
            <SummaryMetric label={lt("Available Value")} value={totalsQuery.data?.availableValue ?? 0} />
          </div>
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search={search}
            onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
            onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/25 px-3 py-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums">{formatNumber(value)}</div>
    </div>
  );
}

function FilterableSelect({ value, onChange, placeholder, options, disabled }: { value: string; onChange: (value: string) => void; placeholder: string; options: Array<{ value: string; label: string }>; disabled?: boolean }) {
  const listId = useId();
  const [text, setText] = useState("");

  useEffect(() => {
    const selected = options.find((option) => option.value === value);
    setText(selected?.label ?? "");
  }, [value, options]);

  return (
    <div className="space-y-1">
      <Input
        list={listId}
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => {
          const nextText = event.target.value;
          setText(nextText);
          if (!nextText.trim()) {
            onChange("");
            return;
          }
          const selected = options.find((option) => option.label.toLowerCase() === nextText.trim().toLowerCase());
          if (selected) onChange(selected.value);
        }}
      />
      <datalist id={listId}>
        {options.map((option) => <option key={option.value} value={option.label} />)}
      </datalist>
    </div>
  );
}

function warehouseLocationLabel(location: { locationCode: string; rack?: string | null; bin?: string | null }) {
  const parts = [location.locationCode];
  if (location.rack) parts.push(`${lt("Rack")}: ${location.rack}`);
  if (location.bin) parts.push(`${lt("Bin")}: ${location.bin}`);
  return parts.join(" - ");
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
}
