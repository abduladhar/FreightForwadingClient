import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import { searchQuotationRequests, type PublicQuotationRequest } from "@/api/quotationRequestApi";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { translateQuotationMode, translateQuotationStatus, useQuotationRequestI18n } from "@/modules/quotationRequests/quotationRequestI18n";

export function QuotationRequestListPage() {
  const qr = useQuotationRequestI18n();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useQuery({ queryKey: ["quotation-requests", pageNumber, pageSize], queryFn: () => searchQuotationRequests({ pageNumber, pageSize }) });
  const columns: ColumnDef<PublicQuotationRequest>[] = [
    { accessorKey: "requestNumber", header: qr("List.RequestNo", "Request No") },
    { accessorKey: "customerName", header: qr("List.Customer", "Customer") },
    { accessorKey: "companyName", header: qr("List.Company", "Company"), cell: ({ row }) => row.original.companyName || "-" },
    { accessorKey: "origin", header: qr("List.Origin", "Origin") },
    { accessorKey: "destination", header: qr("List.Destination", "Destination") },
    { accessorKey: "modeOfTransport", header: qr("List.Mode", "Mode"), cell: ({ row }) => translateQuotationMode(qr, row.original.modeOfTransport) },
    { id: "attachments", header: qr("List.Attachments", "Attachments"), cell: ({ row }) => row.original.attachments.length },
    { accessorKey: "status", header: qr("List.Status", "Status"), cell: ({ row }) => <StatusBadge status={row.original.status} label={translateQuotationStatus(qr, row.original.status)} /> }
  ];

  return <div className="space-y-4">
    <PageHeader title={qr("List.Title", "Quotation Requests")} description={qr("List.Description", "Client quotation requests received from public upload links.")} />
    <Card className={masterDataPanelClass}>
      <CardContent className={masterDataPanelContentClass}>
        <DataTable
          data={query.data?.items ?? []}
          columns={columns}
          totalCount={query.data?.totalCount ?? 0}
          pageNumber={query.data?.pageNumber ?? pageNumber}
          pageSize={query.data?.pageSize ?? pageSize}
          onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => void query.refetch()}
          rowActions={(row) => <QuotationRequestActions row={row} />}
        />
      </CardContent>
    </Card>
  </div>;
}

function QuotationRequestActions({ row }: { row: PublicQuotationRequest }) {
  const qr = useQuotationRequestI18n();
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 gap-2 px-2"><MoreHorizontal className="h-4 w-4" /><span className="hidden sm:inline">{qr("List.Actions", "Actions")}</span></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem asChild><Link to={`/quotation-requests/${row.id}`}><Eye className="mr-2 h-4 w-4" />{qr("List.ViewRequest", "View Request")}</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to={`/quotation-requests/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" />{qr("List.EditRequest", "Edit Request")}</Link></DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
