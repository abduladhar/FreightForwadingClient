import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, useParams } from "react-router-dom";
import { FileText, Pencil, Printer } from "lucide-react";
import { getBillOfEntry, getBoeStockMovements, type BillOfEntryItemDto, type BillOfEntryTimelineDto, type BoeInventoryStockMovementDto } from "@/api/billOfEntryApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { DataTable } from "@/components/common/DataTable";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function BillOfEntryViewPage() {
  const { billOfEntryId } = useParams();
  const query = useQuery({ queryKey: ["bill-of-entry", billOfEntryId], queryFn: () => getBillOfEntry(billOfEntryId ?? ""), enabled: Boolean(billOfEntryId) });
  const movementsQuery = useQuery({ queryKey: ["bill-of-entry-movements", billOfEntryId], queryFn: () => getBoeStockMovements(billOfEntryId), enabled: Boolean(billOfEntryId) });

  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

  const boe = query.data;
  const itemColumns: ColumnDef<BillOfEntryItemDto>[] = [
    { accessorKey: "inventoryCode", header: lt("Inventory Code") },
    { accessorKey: "inventoryName", header: lt("Inventory Name") },
    { accessorKey: "hsCode", header: lt("HS Code"), cell: ({ row }) => row.original.hsCode || "-" },
    { accessorKey: "goodsDescription", header: lt("Goods Description") },
    { accessorKey: "countryOfOrigin", header: lt("Country") },
    { accessorKey: "quantity", header: lt("Quantity") },
    { accessorKey: "unit", header: lt("Unit") },
    { accessorKey: "netWeight", header: lt("Net Weight") },
    { accessorKey: "grossWeight", header: lt("Gross Weight") },
    { accessorKey: "cifForeignValue", header: lt("CIF Foreign") },
    { accessorKey: "cifLocalValue", header: lt("CIF Local") },
    { accessorKey: "dutyRate", header: lt("Duty %") },
    { accessorKey: "total", header: lt("Total") }
  ];
  const timelineColumns: ColumnDef<BillOfEntryTimelineDto>[] = [
    { accessorKey: "fromState", header: lt("From") },
    { accessorKey: "toState", header: lt("To") },
    { accessorKey: "actionDate", header: lt("Date"), cell: ({ row }) => row.original.actionDate?.replace("T", " ").slice(0, 16) },
    { accessorKey: "doneBy", header: lt("Done By") },
    { accessorKey: "remarks", header: lt("Remarks") }
  ];
  const movementColumns: ColumnDef<BoeInventoryStockMovementDto>[] = [
    { accessorKey: "movementType", header: lt("Movement Type") },
    { accessorKey: "quantity", header: lt("Quantity") },
    { accessorKey: "fromState", header: lt("From") },
    { accessorKey: "toState", header: lt("To") },
    { accessorKey: "movementDate", header: lt("Date"), cell: ({ row }) => row.original.movementDate?.replace("T", " ").slice(0, 16) }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${lt("Bill of Entry")} ${boe.boeNumber || boe.declarationNumber}`}
        description={lt("BOE declaration, warehouse stock state, and audit timeline.")}
        actions={
          <>
            <PermissionButton asChild permission="BillOfEntry.Read"><Link to={`/bill-of-entry/${boe.id}/print`} target="_blank" rel="noreferrer"><Printer className="h-4 w-4" />{lt("Print BOE")}</Link></PermissionButton>
            <PermissionButton asChild permission="BillOfEntry.Read"><Link to={`/bill-of-entry/${boe.id}/items/print`} target="_blank" rel="noreferrer"><Printer className="h-4 w-4" />{lt("Print Items")}</Link></PermissionButton>
            <PermissionButton asChild permission="BillOfEntry.Update"><Link to={`/bill-of-entry/${boe.id}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton>
            <PermissionButton asChild permission="BillOfEntry.StateUpdate"><Link to={`/bill-of-entry/${boe.id}/state`}><FileText className="h-4 w-4" />{lt("Update State")}</Link></PermissionButton>
          </>
        }
      />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">{lt("Header")} <StatusBadge status={boe.status} /></CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <Info label={lt("Declaration Number")} value={boe.declarationNumber} />
          <Info label={lt("Declaration Date")} value={boe.declarationDate?.slice(0, 10)} />
          <Info label={lt("Declaration Type")} value={boe.declarationType} />
          <Info label={lt("Port Type")} value={boe.portType} />
          <Info label={lt("Consignee / Exporter")} value={boe.consigneeExporterName} />
          <Info label={lt("Intercessor Company")} value={boe.intercessorCompanyName} />
          <Info label={lt("Warehouse")} value={boe.warehouseName} />
          <Info label={lt("Location")} value={boe.warehouseLocationName} />
          <Info label={lt("Currency")} value={boe.currencyCode} />
          <Info label={lt("Exchange Rate")} value={boe.exchangeRate} />
          <Info label={lt("Net Weight")} value={boe.netWeight} />
          <Info label={lt("Gross Weight")} value={boe.grossWeight} />
        </CardContent>
      </Card>
      <Card><CardContent className="pt-6"><DataTable data={boe.items ?? []} columns={itemColumns} totalCount={boe.items?.length ?? 0} pageNumber={1} pageSize={100} onPaginationChange={() => undefined} /></CardContent></Card>
      <Card><CardHeader><CardTitle>{lt("State Timeline")}</CardTitle></CardHeader><CardContent><DataTable data={boe.timeline ?? []} columns={timelineColumns} totalCount={boe.timeline?.length ?? 0} pageNumber={1} pageSize={100} onPaginationChange={() => undefined} /></CardContent></Card>
      <Card><CardHeader><CardTitle>{lt("Stock Movements")}</CardTitle></CardHeader><CardContent><DataTable data={movementsQuery.data ?? []} columns={movementColumns} totalCount={movementsQuery.data?.length ?? 0} pageNumber={1} pageSize={100} isLoading={movementsQuery.isLoading} onPaginationChange={() => undefined} /></CardContent></Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-md border bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">{label}</div><div className="break-words text-sm font-semibold">{String(value ?? "-")}</div></div>;
}
