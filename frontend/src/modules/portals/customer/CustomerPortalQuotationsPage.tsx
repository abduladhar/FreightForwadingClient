import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCustomerPortalQuotations } from "@/api/portalApi";
import { getCurrencies } from "@/api/currencyApi";
import { DataTable } from "@/components/common/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { CustomerPortalQuotationDto } from "@/api/portalApi";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/modules/portals/customer/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrencyAmount } from "@/utils/currencyFormat";
import { useWorkspace } from "@/hooks/useWorkspace";

export function CustomerPortalQuotationsPage() {
  const workspace = useWorkspace();
  const language = useLanguage();
  const query = useQuery({ queryKey: ["customer-portal", "quotations"], queryFn: getCustomerPortalQuotations });
  const currencies = useQuery({ queryKey: ["portal-currencies"], queryFn: getCurrencies });
  const currencyById = new Map((currencies.data ?? []).map((x) => [x.id, x.currencyCode]));
  const columns: ColumnDef<CustomerPortalQuotationDto>[] = [
    { accessorKey: "quotationNumber", header: "Quotation" },
    { accessorKey: "quotationDate", header: "Date", cell: ({ row }) => language.formatLocalizedDate(row.original.quotationDate) },
    { accessorKey: "validUntilDate", header: "Valid Until", cell: ({ row }) => language.formatLocalizedDate(row.original.validUntilDate) },
    { accessorKey: "origin", header: "Origin" },
    { accessorKey: "destination", header: "Destination" },
    { accessorKey: "modeOfTransport", header: "Mode" },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => formatCurrencyAmount(row.original.totalAmount, {
        cultureCode: workspace.cultureCode,
        currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency
      })
    },
    { id: "actions", header: "Actions", cell: ({ row }) => <Button asChild size="sm" variant="outline"><Link to={`/customer-portal/quotations/${row.original.id}`}>View</Link></Button> }
  ];

  return (
    <div className="space-y-4">
      <PortalPageHeader title="Quotations" description="Review and respond to your quotations." />
      <DataTable
        data={query.data ?? []}
        columns={columns}
        totalCount={query.data?.length ?? 0}
        pageNumber={1}
        pageSize={Math.max(10, query.data?.length ?? 10)}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        onPaginationChange={() => undefined}
      />
    </div>
  );
}
