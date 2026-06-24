import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, useParams } from "react-router-dom";
import { FileText, Pencil, Printer } from "lucide-react";
import { getBillOfExit, type BillOfExitItemDto, type BillOfExitTimelineDto } from "@/api/billOfExitApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { DataTable } from "@/components/common/DataTable";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function BillOfExitViewPage() {
  const { billOfExitId } = useParams();
  const query = useQuery({ queryKey: ["bill-of-exit", billOfExitId], queryFn: () => getBillOfExit(billOfExitId ?? ""), enabled: Boolean(billOfExitId) });

  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

  const box = query.data;
  const itemColumns: ColumnDef<BillOfExitItemDto>[] = [
    { accessorKey: "billOfEntryNumber", header: lt("Bill of Entry No.") },
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
    { accessorKey: "total", header: lt("Total") }
  ];
  const timelineColumns: ColumnDef<BillOfExitTimelineDto>[] = [
    { accessorKey: "fromState", header: lt("From") },
    { accessorKey: "toState", header: lt("To") },
    { accessorKey: "actionDate", header: lt("Date"), cell: ({ row }) => row.original.actionDate?.replace("T", " ").slice(0, 16) },
    { accessorKey: "doneByUserName", header: lt("Done By") },
    { accessorKey: "remarks", header: lt("Remarks") }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${lt("Bill of Exit")} ${box.billOfExitNumber || box.declarationNumber}`}
        description={lt("Outbound declaration, FIFO items, and state timeline.")}
        actions={
          <>
            <PermissionButton asChild permission="BillOfExit.Read"><Link to={`/bill-of-exits/${box.id}/print`} target="_blank" rel="noreferrer"><Printer className="h-4 w-4" />{lt("Print Bill of Exit")}</Link></PermissionButton>
            <PermissionButton asChild permission="BillOfExit.Read"><Link to={`/bill-of-exits/${box.id}/items/print`} target="_blank" rel="noreferrer"><Printer className="h-4 w-4" />{lt("Print Items")}</Link></PermissionButton>
            {box.state !== "Approved" ? <PermissionButton asChild permission="BillOfExit.Update"><Link to={`/bill-of-exits/${box.id}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton> : null}
            {["Created", "PendingApproval"].includes(box.state) ? <PermissionButton asChild permission="BillOfExit.StateUpdate"><Link to={`/bill-of-exits/${box.id}/state`}><FileText className="h-4 w-4" />{lt("Update State")}</Link></PermissionButton> : null}
          </>
        }
      />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">{lt("Header")} <StatusBadge status={box.state} /></CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <Info label={lt("Declaration Number")} value={box.declarationNumber} />
          <Info label={lt("Declaration Date")} value={box.declarationDate?.slice(0, 10)} />
          <Info label={lt("Declaration Type")} value={box.declarationType} />
          <Info label={lt("Port Type")} value={box.portType} />
          <Info label={lt("Consignee / Exporter")} value={box.consigneeExporterName} />
          <Info label={lt("Intercessor Co.")} value={box.intercessorCustomerName} />
          <Info label={lt("Warehouse")} value={box.warehouseName} />
          <Info label={lt("Location")} value={box.warehouseLocationName} />
          <Info label={lt("Currency")} value={box.currencyCode} />
          <Info label={lt("Exchange Rate")} value={box.exchangeRate} />
          <Info label={lt("Net Weight")} value={box.netWeight} />
          <Info label={lt("Gross Weight")} value={box.grossWeight} />
        </CardContent>
      </Card>
      <Card><CardContent className="pt-6"><DataTable data={box.items ?? []} columns={itemColumns} totalCount={box.items?.length ?? 0} pageNumber={1} pageSize={100} onPaginationChange={() => undefined} /></CardContent></Card>
      <Card><CardHeader><CardTitle>{lt("State Timeline")}</CardTitle></CardHeader><CardContent><DataTable data={box.timeline ?? []} columns={timelineColumns} totalCount={box.timeline?.length ?? 0} pageNumber={1} pageSize={100} onPaginationChange={() => undefined} /></CardContent></Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-md border bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">{label}</div><div className="break-words text-sm font-semibold">{String(value ?? "-")}</div></div>;
}
