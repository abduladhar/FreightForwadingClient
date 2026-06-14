import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getCurrencies, getExchangeRates, getTenantCurrencies, updateCurrency } from "@/api/currencyApi";
import { CurrencyForm, type CurrencyFormValues } from "@/modules/currencies/CurrencyForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { currencyPanelClass, currencyPanelContentClass } from "@/modules/currencies/currencyUi";

export function CurrencyEditPage() {
  const { currencyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const tenantCurrencies = useQuery({ queryKey: ["tenant-currencies", "currency-edit"], queryFn: getTenantCurrencies });
  const current = (query.data ?? []).find((x) => x.id === currencyId);
  const baseCurrencyId = (tenantCurrencies.data ?? []).find((currency) => currency.isEnabled && currency.isBaseCurrency)?.currencyId;
  const rates = useQuery({
    queryKey: ["currency-edit-exchange-rates", currencyId, baseCurrencyId],
    queryFn: () => getExchangeRates(currencyId!, baseCurrencyId!),
    enabled: Boolean(currencyId && baseCurrencyId && currencyId !== baseCurrencyId)
  });
  const latestRate = rates.data?.[0];
  const mutation = useMutation({ mutationFn: (v: Omit<CurrencyFormValues, "currencyCode">) => updateCurrency(currencyId!, { ...v, countryRegion: v.countryRegion || null }), onSuccess: async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ["currencies"] }), queryClient.invalidateQueries({ queryKey: ["exchange-rates"] }), queryClient.invalidateQueries({ queryKey: ["tenant-currencies"] })]); navigate("/currencies"); } });
  if (!currencyId) return <Navigate to="/currencies" replace />;
  return <div className="space-y-4"><PageHeader title="Edit Currency" description="Update currency setup and its default rate to tenant base currency." /><Card className={currencyPanelClass}><CardContent className={currencyPanelContentClass}>{current ? <CurrencyForm initialValue={current} initialExchangeRate={latestRate?.rate} initialExchangeRateDate={latestRate?.effectiveDate} disableCode onSubmit={async (v) => { const { currencyCode: _code, ...rest } = v; await mutation.mutateAsync(rest); }} isSubmitting={mutation.isPending} /> : <p className="text-sm text-muted-foreground">Loading...</p>}</CardContent></Card></div>;
}
