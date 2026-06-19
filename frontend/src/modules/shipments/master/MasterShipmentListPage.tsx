import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, FileBarChart, FilePlus2, MoreHorizontal, Pencil, Plus, Printer, Receipt, Scale } from "lucide-react";
import { searchMasterShipments, type MasterShipmentDto } from "@/api/masterShipmentApi";
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
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { lt } from "@/modules/operationsLocalization";

type FlagFilterValue = "" | "true" | "false";

export function MasterShipmentListPage() {
  const paging = useCursorPagination(25);
  const [search, setSearch] = useState("");
  const [originPort, setOriginPort] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [masterWaybillNo, setMasterWaybillNo] = useState("");
  const [invoiceDefined, setInvoiceDefined] = useState<FlagFilterValue>("");
  const [billDefined, setBillDefined] = useState<FlagFilterValue>("");
  const [invoiceFullyReceived, setInvoiceFullyReceived] = useState<FlagFilterValue>("");
  const [billFullyPaid, setBillFullyPaid] = useState<FlagFilterValue>("");
  const [invoiceCancelled, setInvoiceCancelled] = useState<FlagFilterValue>("");
  const [billCancelled, setBillCancelled] = useState<FlagFilterValue>("");
  const { hasPermission } = useAuth();

  const query = useQuery({
    queryKey: ["master-shipments", paging.pageNumber, paging.pageSize, paging.cursor, search, originPort, destinationPort, masterWaybillNo, invoiceDefined, billDefined, invoiceFullyReceived, billFullyPaid, invoiceCancelled, billCancelled],
    queryFn: () => searchMasterShipments({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      cursor: paging.cursor,
      search,
      originPort: originPort || undefined,
      destinationPort: destinationPort || undefined,
      masterWaybillNo: masterWaybillNo || undefined,
      invoiceDefined: toBooleanFilter(invoiceDefined),
      billDefined: toBooleanFilter(billDefined),
      invoiceFullyReceived: toBooleanFilter(invoiceFullyReceived),
      billFullyPaid: toBooleanFilter(billFullyPaid),
      invoiceCancelled: toBooleanFilter(invoiceCancelled),
      billCancelled: toBooleanFilter(billCancelled)
    }),
    staleTime: 0,
    refetchOnMount: "always"
  });

  useEffect(() => {
    const handler = () => {
      paging.reset();
      void query.refetch();
    };
    window.addEventListener("master-shipments:refresh", handler);
    return () => window.removeEventListener("master-shipments:refresh", handler);
  }, [paging.reset, query]);

  const columns: ColumnDef<MasterShipmentDto>[] = [
    { accessorKey: "masterShipmentNumber", header: lt("Master No") },
    { id: "masterWaybill", header: lt("Master Waybill No"), cell: ({ row }) => row.original.mawbNumber || row.original.mblNumber || "-" },
    { accessorKey: "modeOfTransport", header: lt("Mode") },
    { accessorKey: "carrierName", header: lt("Carrier") },
    { accessorKey: "originPortName", header: lt("Origin Port") },
    { accessorKey: "destinationPortName", header: lt("Destination Port") },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: "invoiceDefined", header: () => <FinanceFlagHeader label={lt("Invoice Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.invoiceDefined} /> },
    { id: "billDefined", header: () => <FinanceFlagHeader label={lt("Bill Defined")} />, cell: ({ row }) => <FinanceFlagCell active={row.original.billDefined} /> },
    { id: "financeStatus", header: () => <FinanceFlagHeader label={lt("Finance Status")} />, cell: ({ row }) => <FinanceStatusDropdown row={row.original} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Master Shipments")}
        description={lt("Consolidation, manifest, and cost allocation for master shipments.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="MasterShipment.Create">
              <Link to="/master-shipments/new">
                <Plus className="h-4 w-4" />{lt("New Master Shipment")}</Link>
            </PermissionButton>
          </>
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-9">
            <FilterField label={lt("Origin Port")}>
              <Input value={originPort} placeholder={lt("Dubai Port")} onChange={(event) => { setOriginPort(event.target.value); paging.reset(); }} />
            </FilterField>
            <FilterField label={lt("Destination Port")}>
              <Input value={destinationPort} placeholder={lt("Chennai Port")} onChange={(event) => { setDestinationPort(event.target.value); paging.reset(); }} />
            </FilterField>
            <FilterField label={lt("Master Waybill No")}>
              <Input value={masterWaybillNo} placeholder="MAWB / MBL" onChange={(event) => { setMasterWaybillNo(event.target.value); paging.reset(); }} />
            </FilterField>
            <FlagSelect label={lt("Invoice Defined")} value={invoiceDefined} onChange={setInvoiceDefined} resetPage={paging.reset} />
            <FlagSelect label={lt("Bill Defined")} value={billDefined} onChange={setBillDefined} resetPage={paging.reset} />
            <FlagSelect label={lt("Invoice Fully Received")} value={invoiceFullyReceived} onChange={setInvoiceFullyReceived} resetPage={paging.reset} />
            <FlagSelect label={lt("Bill Fully Paid")} value={billFullyPaid} onChange={setBillFullyPaid} resetPage={paging.reset} />
            <FlagSelect label={lt("Invoice Cancelled")} value={invoiceCancelled} onChange={setInvoiceCancelled} resetPage={paging.reset} />
            <FlagSelect label={lt("Bill Cancelled")} value={billCancelled} onChange={setBillCancelled} resetPage={paging.reset} />
          </div>
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={paging.pageNumber}
            pageSize={query.data?.pageSize ?? paging.pageSize}
            search={search}
            onSearchChange={(value) => { setSearch(value); paging.reset(); }}
            onPaginationChange={(_, ps) => paging.setPageSize(ps)}
            paginationMode="cursor"
            nextCursor={query.data?.nextCursor}
            canPreviousCursorPage={paging.canPrevious}
            onNextCursorPage={() => paging.next(query.data?.nextCursor)}
            onPreviousCursorPage={paging.previous}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => <MasterShipmentActions row={row} hasPermission={hasPermission} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function toBooleanFilter(value: FlagFilterValue) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function FlagBadge({ active, warning = false }: { active: boolean; warning?: boolean }) {
  return <Badge tone={active ? (warning ? "red" : "green") : "slate"}>{active ? lt("Yes") : lt("No")}</Badge>;
}

function FinanceFlagHeader({ label }: { label: string }) {
  return <span className="block min-w-24 whitespace-normal text-center leading-snug">{label}</span>;
}

function FinanceFlagCell({ active, warning = false, compact = false }: { active: boolean; warning?: boolean; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><FlagBadge active={active} warning={warning} /></div>;
}

function FinanceStatusDropdown({ row }: { row: MasterShipmentDto }) {
  const hasWarning = row.invoiceCancelled || row.billCancelled || row.pendingInvoicePostingCount > 0 || row.pendingBillPostingCount > 0 || row.unpaidInvoiceCount > 0 || row.unpaidBillCount > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2">
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
            <FinanceStatusRow label={lt("Unpaid Invoice")} value={<PostingCount value={row.unpaidInvoiceCount} compact />} />
            <FinanceStatusRow label={lt("Unpaid Bill")} value={<PostingCount value={row.unpaidBillCount} compact />} />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FinanceStatusRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs">
      <span className="text-slate-600">{label}</span>
      {value}
    </div>
  );
}

function PostingCount({ value, compact = false }: { value: number; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={value > 0 ? "amber" : "slate"}>{value}</Badge></div>;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function FlagSelect({
  label,
  value,
  onChange,
  resetPage
}: {
  label: string;
  value: FlagFilterValue;
  onChange: (value: FlagFilterValue) => void;
  resetPage: () => void;
}) {
  return (
    <FilterField label={label}>
      <select
        className="h-10 w-full rounded-md border px-3 text-sm"
        value={value}
        onChange={(event) => {
          onChange(event.target.value as FlagFilterValue);
          resetPage();
        }}
      >
        <option value="">{lt("All")}</option>
        <option value="true">{lt("Yes")}</option>
        <option value="false">{lt("No")}</option>
      </select>
    </FilterField>
  );
}

function MasterShipmentActions({
  row,
  hasPermission
}: {
  row: MasterShipmentDto;
  hasPermission: (permission?: string | string[]) => boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{lt("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("MasterShipment.Read") ? (
          <DropdownMenuItem asChild>
            <Link to={`/master-shipments/${row.id}`}><Eye className="mr-2 h-4 w-4" />{lt("View Master Shipment")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("MasterShipment.Update") ? (
          <DropdownMenuItem asChild>
            <Link to={`/master-shipments/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{lt("Edit Master Shipment")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("Invoice.Read") ? (
          <DropdownMenuItem asChild>
            <Link to={`/master-shipments/${row.id}/invoices`}><Receipt className="mr-2 h-4 w-4" />{lt("Show Invoices")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("Invoice.Create") ? (
          <DropdownMenuItem asChild>
            <Link to={`/invoices/new?sourceType=MasterShipment&sourceId=${row.id}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Invoice")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("VendorBill.Read") ? (
          <DropdownMenuItem asChild>
            <Link to={`/master-shipments/${row.id}/bills`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Show Bills")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("VendorBill.Create") ? (
          <DropdownMenuItem asChild>
            <Link to={`/vendor-bills/new?sourceType=MasterShipment&sourceId=${row.id}&expectedCostAmount=${row.totalCostAmount ?? 0}`}><FilePlus2 className="mr-2 h-4 w-4" />{lt("Create Bill")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("MasterShipment.Print") ? (
          <DropdownMenuItem asChild>
            <Link to={`/master-shipments/${row.id}/manifest`}><Printer className="mr-2 h-4 w-4" />{lt("Print Manifest")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("MasterShipment.Export") ? (
          <DropdownMenuItem asChild>
            <Link to={`/master-shipments/${row.id}/consolidation`}><FileBarChart className="mr-2 h-4 w-4" />{lt("Consolidation Report")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("MasterShipment.Read") ? (
          <DropdownMenuItem asChild>
            <Link to={`/master-shipments/${row.id}/cost-allocation`}><Scale className="mr-2 h-4 w-4" />{lt("Cost Allocation")}</Link>
          </DropdownMenuItem>
        ) : null}
        {hasPermission("Profit.Read") ? (
          <DropdownMenuItem asChild>
            <Link to={`/master-shipments/${row.id}/profit-loss`}><FileBarChart className="mr-2 h-4 w-4" />{lt("Profit & Loss")}</Link>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
