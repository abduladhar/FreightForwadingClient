import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useI18n } from "@/app/i18n";
import { getCurrencies, getExchangeRates } from "@/api/currencyApi";
import type { ExchangeRate } from "@/types/currency";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { currencyButtonClass, currencyPanelClass, currencyPanelContentClass } from "@/modules/currencies/currencyUi";

export function ExchangeRateListPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const currencyQuery = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const ratesQuery = useQuery({ queryKey: ["exchange-rates"], queryFn: () => getExchangeRates() });
  const codeById = new Map((currencyQuery.data ?? []).map((x) => [x.id, x.currencyCode]));
  const rows = useMemo(() => (ratesQuery.data ?? []).filter((x) => `${codeById.get(x.fromCurrencyId)} ${codeById.get(x.toCurrencyId)} ${x.overrideReason ?? ""}`.toLowerCase().includes(search.toLowerCase())), [ratesQuery.data, search, currencyQuery.data]);
  const paged = rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const columns: ColumnDef<ExchangeRate>[] = [
    { id: "pair", header: t("Currency.Pair", "Pair"), cell: ({ row }) => `${codeById.get(row.original.fromCurrencyId)} -> ${codeById.get(row.original.toCurrencyId)}` },
    { accessorKey: "rate", header: t("Currency.Rate", "Rate") },
    { accessorKey: "effectiveDate", header: t("Currency.EffectiveDate", "Effective Date") },
    { accessorKey: "isManualOverride", header: t("Currency.ManualOverride", "Manual Override"), cell: ({ row }) => (row.original.isManualOverride ? t("Common.Yes", "Yes") : t("Common.No", "No")) },
    { accessorKey: "overrideReason", header: t("Currency.Reason", "Reason") }
  ];
  return <div className="space-y-4"><PageHeader title="Exchange Rates" description="Historical and manual override rates." actions={<><AuditTrailButton /><PermissionButton asChild permission="Currency.Override" className={currencyButtonClass}><Link to="/exchange-rates/new"><Plus className="h-4 w-4" /> {t("Currency.NewRate", "New Rate")}</Link></PermissionButton></>} /><Card className={currencyPanelClass}><CardContent className={currencyPanelContentClass}><DataTable data={paged} columns={columns} totalCount={rows.length} pageNumber={pageNumber} pageSize={pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={ratesQuery.isLoading} isError={ratesQuery.isError} onRetry={() => void ratesQuery.refetch()} /></CardContent></Card></div>;
}
