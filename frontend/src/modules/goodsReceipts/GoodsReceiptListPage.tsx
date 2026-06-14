import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, FilePlus2, FileText, MoreHorizontal, Pencil, Plus, Printer, QrCode, Receipt, SlidersHorizontal } from "lucide-react";
import { searchGoodsReceipts, type GoodsReceiptDto } from "@/api/goodsReceiptApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/modules/operationsLocalization";

type FlagFilterValue = "" | "true" | "false";

export function GoodsReceiptListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [grnNumber, setGrnNumber] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [invoiceDefined, setInvoiceDefined] = useState<FlagFilterValue>("");
  const [billDefined, setBillDefined] = useState<FlagFilterValue>("");
  const [invoiceFullyReceived, setInvoiceFullyReceived] = useState<FlagFilterValue>("");
  const [billFullyPaid, setBillFullyPaid] = useState<FlagFilterValue>("");
  const [showFilters, setShowFilters] = useState(false);
  const { hasPermission } = useAuth();

  const query = useQuery({
    queryKey: ["goods-receipts", pageNumber, pageSize, search, customer, grnNumber, warehouse, warehouseLocation, invoiceDefined, billDefined, invoiceFullyReceived, billFullyPaid],
    queryFn: () => searchGoodsReceipts({
      pageNumber,
      pageSize,
      search,
      customer: customer || undefined,
      grnNumber: grnNumber || undefined,
      warehouse: warehouse || undefined,
      warehouseLocation: warehouseLocation || undefined,
      invoiceDefined: toBooleanFilter(invoiceDefined),
      billDefined: toBooleanFilter(billDefined),
      invoiceFullyReceived: toBooleanFilter(invoiceFullyReceived),
      billFullyPaid: toBooleanFilter(billFullyPaid)
    })
  });

  const columns: ColumnDef<GoodsReceiptDto>[] = [
    { accessorKey: "goodsReceiptNumber", header: lt("Goods Receipt Note No") },
    { accessorKey: "receivedDateTime", header: lt("Received Date") },
    { accessorKey: "receivedFrom", header: lt("Received From") },
    { accessorKey: "warehouseLocation", header: lt("Warehouse Location") },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: "invoiceDefined", header: () => <FinanceFlagHeader label={lt("Invoice Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.invoiceDefined} /> },
    { id: "billDefined", header: () => <FinanceFlagHeader label={lt("Bill Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.billDefined} /> },
    { id: "financeStatus", header: () => <FinanceFlagHeader label={lt("Finance Status")} />, cell: ({ row }) => <FinanceStatusDropdown row={row.original} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Goods Receipts")}
        description={lt("Receive goods, print Goods Receipt Notes, labels, and monitor available goods quantity.")}
        actions={<><AuditTrailButton /><PermissionButton asChild permission="GoodsReceipt.Create"><Link to="/goods-receipts/new"><Plus className="h-4 w-4" />{lt("New Goods Receipt Note")}</Link></PermissionButton></>}
      />
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowFilters((value) => !value)}>
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? lt("Hide Filters") : lt("Show Filters")}
            </Button>
          </div>
          {showFilters ? (
            <div className="mb-4 rounded-lg border bg-slate-50/60 p-3">
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                <FilterField label={lt("Customer")}><Input value={customer} placeholder={lt("Customer name/code")} onChange={(event) => { setCustomer(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("Goods Receipt Note Number")}><Input value={grnNumber} placeholder={lt("Goods Receipt Note No...")} onChange={(event) => { setGrnNumber(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("Warehouse")}><Input value={warehouse} placeholder={lt("Warehouse name/code")} onChange={(event) => { setWarehouse(event.target.value); setPageNumber(1); }} /></FilterField>
                <FilterField label={lt("Warehouse Location")}><Input value={warehouseLocation} placeholder={lt("Rack/bin/location")} onChange={(event) => { setWarehouseLocation(event.target.value); setPageNumber(1); }} /></FilterField>
                <FlagSelect label={lt("Invoice Defined")} value={invoiceDefined} onChange={setInvoiceDefined} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Bill Defined")} value={billDefined} onChange={setBillDefined} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Invoice Fully Received")} value={invoiceFullyReceived} onChange={setInvoiceFullyReceived} resetPage={() => setPageNumber(1)} />
                <FlagSelect label={lt("Bill Fully Paid")} value={billFullyPaid} onChange={setBillFullyPaid} resetPage={() => setPageNumber(1)} />
              </div>
            </div>
          ) : null}
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search={search}
            onSearchChange={setSearch}
            onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => <GoodsReceiptActions row={row} hasPermission={hasPermission} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function GoodsReceiptActions({ row, hasPermission }: { row: GoodsReceiptDto; hasPermission: (permission?: string | string[]) => boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{lt("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("GoodsReceipt.Read") ? <DropdownMenuItem asChild><Link to={`/goods-receipts/${row.id}`}><Eye className="mr-2 h-4 w-4" />{lt("View Goods Receipt Note")}</Link></DropdownMenuItem> : null}
        {hasPermission("Invoice.Read") ? <DropdownMenuItem asChild><Link to={`/goods-receipts/${row.id}/invoices`}><Receipt className="mr-2 h-4 w-4" />{lt("Show Invoices")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Read") ? <DropdownMenuItem asChild><Link to={`/goods-receipts/${row.id}/bills`}><FileText className="mr-2 h-4 w-4" />{lt("Show Bills")}</Link></DropdownMenuItem> : null}
        {hasPermission("VendorBill.Create") ? <DropdownMenuItem asChild><Link to={`/vendor-bills/new?sourceType=GoodsReceipt&sourceId=${row.id}&expectedCostAmount=0`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Bill")}</Link></DropdownMenuItem> : null}
        {hasPermission("GoodsReceipt.Update") ? <DropdownMenuItem asChild><Link to={`/goods-receipts/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit Goods Receipt Note")}</Link></DropdownMenuItem> : null}
        {hasPermission("GoodsReceipt.Print") ? <DropdownMenuItem asChild><Link to={`/goods-receipts/${row.id}/note`}><Printer className="mr-2 h-4 w-4" />{lt("Print Goods Receipt Note")}</Link></DropdownMenuItem> : null}
        {hasPermission("GoodsReceipt.Print") ? <DropdownMenuItem asChild><Link to={`/goods-receipts/${row.id}/labels`}><QrCode className="mr-2 h-4 w-4" />{lt("Print Labels")}</Link></DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FinanceStatusDropdown({ row }: { row: GoodsReceiptDto }) {
  const pendingCount = row.pendingInvoicePostingCount + row.pendingBillPostingCount;
  const hasWarning = row.invoiceCancelled || row.billCancelled || pendingCount > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 px-2">
          <Badge tone={hasWarning ? "amber" : "green"}>{hasWarning ? lt("Review") : lt("Clear")}</Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{lt("Finance Status")}</div>
          <div className="space-y-1 rounded-md bg-slate-50 p-2">
            <FinanceStatusRow label={lt("Invoice Fully Received")} value={<FinanceFlagCell active={row.invoiceFullyReceived} compact />} />
            <FinanceStatusRow label={lt("Bill Fully Paid")} value={<FinanceFlagCell active={row.billFullyPaid} compact />} />
            <FinanceStatusRow label={lt("Invoice Cancelled")} value={<FinanceFlagCell active={row.invoiceCancelled} warning compact />} />
            <FinanceStatusRow label={lt("Bill Cancelled")} value={<FinanceFlagCell active={row.billCancelled} warning compact />} />
            <FinanceStatusRow label={lt("Pending Invoice To Post")} value={<PostingCount value={row.pendingInvoicePostingCount} compact />} />
            <FinanceStatusRow label={lt("Pending Bill To Post")} value={<PostingCount value={row.pendingBillPostingCount} compact />} />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function toBooleanFilter(value: FlagFilterValue) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function FinanceFlagHeader({ label }: { label: string }) {
  return <span className="block min-w-24 whitespace-normal text-center leading-snug">{label}</span>;
}

function FinanceFlagCell({ active, warning = false, compact = false }: { active: boolean; warning?: boolean; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={active ? (warning ? "red" : "green") : "slate"}>{active ? lt("Yes") : lt("No")}</Badge></div>;
}

function PostingCount({ value, compact = false }: { value: number; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={value > 0 ? "amber" : "slate"}>{value}</Badge></div>;
}

function FinanceStatusRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs">
      <span className="text-slate-600">{label}</span>
      {value}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function FlagSelect({ label, value, onChange, resetPage }: { label: string; value: FlagFilterValue; onChange: (value: FlagFilterValue) => void; resetPage: () => void }) {
  return (
    <FilterField label={label}>
      <select className="h-10 w-full rounded-md border px-3 text-sm" value={value} onChange={(event) => { onChange(event.target.value as FlagFilterValue); resetPage(); }}>
        <option value="">{lt("All")}</option>
        <option value="true">{lt("Yes")}</option>
        <option value="false">{lt("No")}</option>
      </select>
    </FilterField>
  );
}
