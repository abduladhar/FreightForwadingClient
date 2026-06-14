import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/app/i18n";
import { deleteCurrency, getCurrencies } from "@/api/currencyApi";
import { useAuth } from "@/auth/useAuth";
import type { Currency } from "@/types/currency";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionButton } from "@/auth/PermissionButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { currencyButtonClass, currencyPanelClass, currencyPanelContentClass } from "@/modules/currencies/currencyUi";

export function CurrencyListPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { hasPermission } = useAuth();
  const query = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const queryClient = useQueryClient();
  const remove = useMutation({ mutationFn: deleteCurrency, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["currencies"] }) });
  const rows = useMemo(() => (query.data ?? []).filter((x) => [x.currencyCode, x.currencyName, x.symbol].join(" ").toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  const paged = rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const columns: ColumnDef<Currency>[] = [
    { accessorKey: "currencyCode", header: t("Currency.Code", "Code") },
    { accessorKey: "currencyName", header: t("Currency.Name", "Name") },
    { accessorKey: "symbol", header: t("Currency.Symbol", "Symbol") },
    { accessorKey: "decimalPlaces", header: t("Currency.Decimals", "Decimals") },
    { accessorKey: "formatPattern", header: t("Currency.Format", "Format") },
    { id: "status", header: t("Common.Status", "Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];
  return (
    <div className="space-y-4">
      <PageHeader
        title="Currencies"
        description="Currency master with formatting and activation."
        actions={<><AuditTrailButton /><PermissionButton asChild permission="Currency.Create" className={currencyButtonClass}><Link to="/currencies/new"><Plus className="h-4 w-4" /> {t("Currency.NewCurrency", "New Currency")}</Link></PermissionButton></>}
      />
      <Card className={currencyPanelClass}><CardContent className={currencyPanelContentClass}>
        <DataTable data={paged} columns={columns} totalCount={rows.length} pageNumber={pageNumber} pageSize={pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()}
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <PermissionButton asChild permission="Currency.Update" size="sm" variant="ghost" className="h-10 min-h-10"><Link to={`/currencies/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton>
              {hasPermission("Currency.Delete") ? (
                <ConfirmDialog title={t("Currency.DeleteCurrencyQuestion", "Delete currency?")} description={row.currencyCode} confirmText={t("Common.Delete", "Delete")} variant="danger" onConfirm={async () => remove.mutateAsync(row.id)}>
                  <Button size="sm" variant="ghost" className="h-10 min-h-10"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </ConfirmDialog>
              ) : null}
            </div>
          )}
        />
      </CardContent></Card>
    </div>
  );
}
