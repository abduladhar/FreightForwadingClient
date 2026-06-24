import { useEffect, useId, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, RefreshCw } from "lucide-react";
import { getInventoryStockReport, searchBoeInventories, type InventoryStockReportRow } from "@/api/billOfEntryApi";
import { searchWarehouseLocations, searchWarehouses } from "@/api/warehouseApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/modules/operationsLocalization";

interface StockReportProps {
  title: string;
  description: string;
  locationFocused?: boolean;
}

export function InventoryStockReportPage() {
  return <BillOfEntryStockReport title="Inventory Stock Report" description="Actual, available, unapproved inbound, and unapproved outbound inventory stock." />;
}

export function WarehouseLocationInventoryReportPage() {
  return <BillOfEntryStockReport title="Warehouse Location Inventory Report" description="Inventory stock by warehouse and warehouse location." locationFocused />;
}

function BillOfEntryStockReport({ title, description, locationFocused }: StockReportProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [inventoryId, setInventoryId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouseLocationId, setWarehouseLocationId] = useState("");
  const inventories = useQuery({ queryKey: ["boe-stock-report-inventories"], queryFn: () => searchBoeInventories({ pageNumber: 1, pageSize: 500 }) });
  const warehouses = useQuery({ queryKey: ["boe-stock-report-warehouses"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const locations = useQuery({
    queryKey: ["boe-stock-report-locations", warehouseId],
    queryFn: () => searchWarehouseLocations({ pageNumber: 1, pageSize: 500, isActive: true, warehouseId: warehouseId || undefined }),
    enabled: Boolean(warehouseId)
  });
  const query = useQuery({
    queryKey: ["boe-stock-report", pageNumber, pageSize, search, inventoryId, warehouseId, warehouseLocationId],
    queryFn: () => getInventoryStockReport({
      pageNumber,
      pageSize,
      search,
      inventoryId: inventoryId || undefined,
      warehouseId: warehouseId || undefined,
      warehouseLocationId: warehouseLocationId || undefined
    })
  });

  const columns: ColumnDef<InventoryStockReportRow>[] = [
    { accessorKey: "inventoryCode", header: lt("Inventory Code") },
    { accessorKey: "inventoryName", header: lt("Inventory Name") },
    { accessorKey: "customerName", header: lt("Customer") },
    { accessorKey: "consigneeExporterName", header: lt("Consignee / Exporter") },
    { accessorKey: "billOfEntryNumbers", header: lt("BOE Numbers") },
    { accessorKey: "warehouseName", header: lt("Warehouse") },
    { accessorKey: "warehouseLocationName", header: lt("Location") },
    { accessorKey: "actualStock", header: lt("Actual") },
    { accessorKey: "availableStock", header: lt("Available") },
    { accessorKey: "unapprovedInboundStock", header: lt("Unapproved Inbound") },
    { accessorKey: "unapprovedOutboundStock", header: lt("Unapproved Outbound") }
  ];

  function exportCsv() {
    const rows = query.data?.items ?? [];
    const header = ["Inventory Code", "Inventory Name", "Customer", "Consignee / Exporter", "BOE Numbers", "Warehouse", "Location", "Actual", "Available", "Unapproved Inbound", "Unapproved Outbound"];
    const body = rows.map((row) => [row.inventoryCode, row.inventoryName, row.customerName, row.consigneeExporterName, row.billOfEntryNumbers, row.warehouseName, row.warehouseLocationName, row.actualStock, row.availableStock, row.unapprovedInboundStock, row.unapprovedOutboundStock]);
    const csv = [header.map((value) => lt(value)), ...body].map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${locationFocused ? "warehouse-location-inventory" : "inventory-stock"}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt(title)}
        description={lt(description)}
        actions={
          <>
            <Button variant="outline" onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button>
            <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />{lt("Export")}</Button>
          </>
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-3">
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
