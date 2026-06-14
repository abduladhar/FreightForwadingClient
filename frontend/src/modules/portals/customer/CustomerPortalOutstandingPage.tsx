import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getCustomerPortalOutstanding, type CustomerInvoicePortalDto } from "@/api/portalApi";
import { getCurrencies } from "@/api/currencyApi";
import { DataTable } from "@/components/common/DataTable";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { useWorkspace } from "@/hooks/useWorkspace";
import { formatCurrencyAmount } from "@/utils/currencyFormat";

export function CustomerPortalOutstandingPage() {
  const workspace = useWorkspace();
  const language = useLanguage();
  const query = useQuery({ queryKey: ["customer-portal", "outstanding"], queryFn: getCustomerPortalOutstanding });
  const currencies = useQuery({ queryKey: ["portal-currencies"], queryFn: getCurrencies });
  const currencyById = new Map((currencies.data ?? []).map((x) => [x.id, x.currencyCode]));
  const columns: ColumnDef<CustomerInvoicePortalDto>[] = [
    { accessorKey: "invoiceNumber", header: "Invoice" },
    { accessorKey: "invoiceDate", header: "Date", cell: ({ row }) => language.formatLocalizedDate(row.original.invoiceDate) },
    { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => language.formatLocalizedDate(row.original.dueDate) },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => formatCurrencyAmount(row.original.totalAmount, { cultureCode: workspace.cultureCode, currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency })
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: ({ row }) => formatCurrencyAmount(row.original.paidAmount, { cultureCode: workspace.cultureCode, currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency })
    },
    {
      accessorKey: "outstandingAmount",
      header: "Outstanding",
      cell: ({ row }) => formatCurrencyAmount(row.original.outstandingAmount, { cultureCode: workspace.cultureCode, currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency })
    }
  ];
  return (
    <div className="space-y-4">
      <PortalPageHeader title="Outstanding" description="Monitor your outstanding invoices." />
      <DataTable data={query.data ?? []} columns={columns} totalCount={query.data?.length ?? 0} pageNumber={1} pageSize={Math.max(10, query.data?.length ?? 10)} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} onPaginationChange={() => undefined} />
    </div>
  );
}
