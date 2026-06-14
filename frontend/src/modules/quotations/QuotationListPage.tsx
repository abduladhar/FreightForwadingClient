import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { ArrowRightLeft, Eye, MoreHorizontal, Pencil, Plus, Printer, Send } from "lucide-react";
import { searchQuotations, submitQuotation, type QuotationDto } from "@/api/quotationApi";
import { getCurrencies } from "@/api/currencyApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { useQuotationI18n } from "@/modules/quotations/quotationI18n";

export function QuotationListPage() {
  const q = useQuotationI18n();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const query = useQuery({ queryKey: ["quotations", pageNumber, pageSize, search], queryFn: () => searchQuotations({ pageNumber, pageSize, search }) });
  const currencies = useQuery({ queryKey: ["quotation-currencies"], queryFn: getCurrencies });
  const currencyCode = (currencyId: string) => currencies.data?.find((currency) => currency.id === currencyId)?.currencyCode ?? "Amount";
  const submit = useMutation({ mutationFn: submitQuotation, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["quotations"] }) });
  const columns: ColumnDef<QuotationDto>[] = [
    { accessorKey: "quotationNumber", header: q("Quotation No") },
    { accessorKey: "quotationDate", header: q("Date") },
    { accessorKey: "origin", header: q("Origin") },
    { accessorKey: "destination", header: q("Destination") },
    { accessorKey: "modeOfTransport", header: q("Mode"), cell: ({ row }) => q(row.original.modeOfTransport) },
    { accessorKey: "shipmentType", header: q("Shipment Type"), cell: ({ row }) => q(row.original.shipmentType) },
    { id: "currency", header: q("Currency"), cell: ({ row }) => currencyCode(row.original.currencyId) },
    { accessorKey: "totalAmount", header: q("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCode(row.original.currencyId)} /> },
    { accessorKey: "status", header: q("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} label={q(row.original.status)} /> }
  ];
  return <div className="space-y-4"><PageHeader title={q("Quotations")} description={q("Quotation lifecycle with generation, approval, print, and email actions.")} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="Quotation.Create"><Link to="/quotations/new"><Plus className="h-4 w-4" /> {q("New Quotation")}</Link></PermissionButton></>} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <QuotationActions row={row} hasPermission={hasPermission} submitQuotation={() => submit.mutateAsync(row.id)} isSubmitting={submit.isPending} q={q} />} /></CardContent></Card></div>;
}

function QuotationActions({
  row,
  hasPermission,
  submitQuotation: submitRow,
  isSubmitting,
  q
}: {
  row: QuotationDto;
  hasPermission: (permission?: string | string[]) => boolean;
  submitQuotation: () => Promise<unknown>;
  isSubmitting: boolean;
  q: (value: string) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{q("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("Quotation.Read") ? <DropdownMenuItem asChild><Link to={`/quotations/${row.id}`}><Eye className="mr-2 h-4 w-4" /> {q("View Quotation")}</Link></DropdownMenuItem> : null}
        {row.status === "Draft" && hasPermission("Quotation.Update") ? <DropdownMenuItem asChild><Link to={`/quotations/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> {q("Edit Quotation")}</Link></DropdownMenuItem> : null}
        {hasPermission("Quotation.Print") ? <DropdownMenuItem asChild><Link to={`/quotations/${row.id}/print`}><Printer className="mr-2 h-4 w-4" /> {q("Print Quotation")}</Link></DropdownMenuItem> : null}
        {row.status === "Draft" && hasPermission("Quotation.Update") ? <DropdownMenuItem disabled={isSubmitting} onSelect={() => void submitRow()}><Send className="mr-2 h-4 w-4" /> {q("Submit for Approval")}</DropdownMenuItem> : null}
        {row.status === "Submitted" && hasPermission("Quotation.Approve") ? <DropdownMenuItem asChild><Link to={`/quotations/${row.id}/approval`}><ArrowRightLeft className="mr-2 h-4 w-4" /> {q("Review Approval")}</Link></DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
