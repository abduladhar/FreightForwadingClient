import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/app/i18n";
import { getCurrencies, getTenantCurrencies, setTenantCurrency } from "@/api/currencyApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { currencyPanelClass, currencyPanelContentClass } from "@/modules/currencies/currencyUi";

export function TenantCurrencySetupPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["tenant-currencies"], queryFn: getTenantCurrencies });
  const currenciesQuery = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const mutation = useMutation({
    mutationFn: ({ currencyId, isEnabled, isBaseCurrency }: { currencyId: string; isEnabled: boolean; isBaseCurrency: boolean }) =>
      setTenantCurrency(currencyId, isEnabled, isBaseCurrency),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["tenant-currencies"] })
  });
  const tenantCurrencyById = new Map((query.data ?? []).map((currency) => [currency.currencyId, currency]));
  const rows = (currenciesQuery.data ?? [])
    .filter((currency) => currency.isActive)
    .map((currency) => tenantCurrencyById.get(currency.id) ?? {
      currencyId: currency.id,
      currencyCode: currency.currencyCode,
      currencyName: currency.currencyName,
      isEnabled: false,
      isBaseCurrency: false
    });

  return (
    <div className="space-y-4">
      <PageHeader title="Tenant Currency Setup" description="Enable currencies and define base currency for the tenant." actions={<AuditTrailButton />} />
      <Card className={currencyPanelClass}><CardContent className={`${currencyPanelContentClass} overflow-auto`}>
        <table className="min-w-full text-sm">
          <thead><tr className="border-b bg-slate-50 dark:bg-slate-900"><th className="px-3 py-2 text-left">{t("Currency.Currency", "Currency")}</th><th className="px-3 py-2">{t("Currency.Enabled", "Enabled")}</th><th className="px-3 py-2">{t("Currency.Base", "Base")}</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.currencyId} className="border-b last:border-b-0">
                <td className="px-3 py-2">{row.currencyCode} - {row.currencyName}</td>
                <td className="px-3 py-2 text-center"><input type="checkbox" checked={row.isEnabled} onChange={(e) => void mutation.mutateAsync({ currencyId: row.currencyId, isEnabled: e.target.checked, isBaseCurrency: row.isBaseCurrency })} /></td>
                <td className="px-3 py-2 text-center"><input type="radio" name="baseCurrency" checked={row.isBaseCurrency} onChange={() => void mutation.mutateAsync({ currencyId: row.currencyId, isEnabled: true, isBaseCurrency: true })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
