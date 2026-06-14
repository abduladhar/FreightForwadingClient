import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { getCustomerPortalPaymentHistory, type CustomerPaymentHistoryDto } from "@/api/portalApi";
import { getCurrencies } from "@/api/currencyApi";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { useWorkspace } from "@/hooks/useWorkspace";
import { formatCurrencyAmount } from "@/utils/currencyFormat";

export function CustomerPortalPaymentHistoryPage() {
  const workspace = useWorkspace();
  const language = useLanguage();
  const query = useQuery({ queryKey: ["customer-portal", "payment-history"], queryFn: getCustomerPortalPaymentHistory });
  const currencies = useQuery({ queryKey: ["portal-currencies"], queryFn: getCurrencies });
  const currencyById = new Map((currencies.data ?? []).map((x) => [x.id, x.currencyCode]));
  const columns: ColumnDef<CustomerPaymentHistoryDto>[] = [
    { accessorKey: "receiptNumber", header: "Receipt" },
    { accessorKey: "receiptDate", header: "Date", cell: ({ row }) => language.formatLocalizedDate(row.original.receiptDate) },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "receiptAmount",
      header: "Amount",
      cell: ({ row }) => formatCurrencyAmount(row.original.receiptAmount, { cultureCode: workspace.cultureCode, currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency })
    },
    {
      accessorKey: "bankCharges",
      header: "Bank Charges",
      cell: ({ row }) => formatCurrencyAmount(row.original.bankCharges, { cultureCode: workspace.cultureCode, currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency })
    }
  ];
  return (
    <div className="space-y-4">
      <PortalPageHeader title="Payment History" description="View your receipt and payment records." />
      <DataTable data={query.data ?? []} columns={columns} totalCount={query.data?.length ?? 0} pageNumber={1} pageSize={Math.max(10, query.data?.length ?? 10)} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} onPaginationChange={() => undefined} />
    </div>
  );
}
