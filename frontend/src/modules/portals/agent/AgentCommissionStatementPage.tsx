import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getCurrencies } from "@/api/currencyApi";
import { getAgentPortalCommissionStatement, type AgentCommissionStatementRow } from "@/api/portalApi";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useLanguage } from "@/hooks/useLanguage";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AgentPortalPageHeader } from "@/modules/portals/agent/_shared";
import { formatCurrencyAmount } from "@/utils/currencyFormat";

export function AgentCommissionStatementPage() {
  const workspace = useWorkspace();
  const language = useLanguage();
  const rowsQuery = useQuery({ queryKey: ["agent-portal", "commission-statement"], queryFn: getAgentPortalCommissionStatement });
  const currencies = useQuery({ queryKey: ["portal-currencies"], queryFn: getCurrencies });
  const currencyById = useMemo(() => new Map((currencies.data ?? []).map((x) => [x.id, x.currencyCode])), [currencies.data]);
  const columns: ColumnDef<AgentCommissionStatementRow>[] = [
    { accessorKey: "sourceType", header: "Source Type" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "date", header: "Date", cell: ({ row }) => language.formatLocalizedDate(row.original.date) },
    {
      accessorKey: "commissionAmount",
      header: "Commission",
      cell: ({ row }) => formatCurrencyAmount(row.original.commissionAmount, {
        cultureCode: workspace.cultureCode,
        currencyCode: currencyById.get(row.original.currencyId) ?? workspace.baseCurrency
      })
    },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];

  return (
    <div className="space-y-4">
      <AgentPortalPageHeader title="Commission Statement" description="Review your commission entries and status." />
      <DataTable
        data={rowsQuery.data ?? []}
        columns={columns}
        totalCount={rowsQuery.data?.length ?? 0}
        pageNumber={1}
        pageSize={Math.max(10, rowsQuery.data?.length ?? 10)}
        isLoading={rowsQuery.isLoading}
        isError={rowsQuery.isError}
        onRetry={() => void rowsQuery.refetch()}
        onPaginationChange={() => undefined}
      />
    </div>
  );
}
