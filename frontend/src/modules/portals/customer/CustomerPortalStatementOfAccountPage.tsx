import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { downloadCustomerPortalStatementOfAccount, downloadPortalFile, getCustomerPortalStatementOfAccount, type CustomerStatementRowDto } from "@/api/portalApi";
import { getCurrencies } from "@/api/currencyApi";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { useWorkspace } from "@/hooks/useWorkspace";
import { formatCurrencyAmount } from "@/utils/currencyFormat";

export function CustomerPortalStatementOfAccountPage() {
  const workspace = useWorkspace();
  const language = useLanguage();
  const query = useQuery({ queryKey: ["customer-portal", "soa"], queryFn: getCustomerPortalStatementOfAccount });
  const currencies = useQuery({ queryKey: ["portal-currencies"], queryFn: getCurrencies });
  const currencyById = new Map((currencies.data ?? []).map((x) => [x.id, x.currencyCode]));
  const columns: ColumnDef<CustomerStatementRowDto>[] = [
    { accessorKey: "date", header: "Date", cell: ({ row }) => language.formatLocalizedDate(row.original.date) },
    { accessorKey: "documentType", header: "Type" },
    { accessorKey: "documentNumber", header: "Document" },
    { accessorKey: "particulars", header: "Particulars" },
    {
      accessorKey: "debit",
      header: "Debit",
      cell: ({ row }) => formatCurrencyAmount(row.original.debit, { cultureCode: workspace.cultureCode, currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency })
    },
    {
      accessorKey: "credit",
      header: "Credit",
      cell: ({ row }) => formatCurrencyAmount(row.original.credit, { cultureCode: workspace.cultureCode, currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency })
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => formatCurrencyAmount(row.original.balance, { cultureCode: workspace.cultureCode, currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency })
    }
  ];
  return (
    <div className="space-y-4">
      <PortalPageHeader title="Statement of Account" description="View and download your statement of account." />
      <div><Button variant="outline" onClick={async () => downloadPortalFile(await downloadCustomerPortalStatementOfAccount())}>Download Statement</Button></div>
      <DataTable data={query.data ?? []} columns={columns} totalCount={query.data?.length ?? 0} pageNumber={1} pageSize={Math.max(10, query.data?.length ?? 10)} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} onPaginationChange={() => undefined} />
    </div>
  );
}
