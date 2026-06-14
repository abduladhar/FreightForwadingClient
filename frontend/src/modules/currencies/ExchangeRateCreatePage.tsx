import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCurrencies, upsertExchangeRate } from "@/api/currencyApi";
import { ExchangeRateForm, type ExchangeRateFormValues } from "@/modules/currencies/ExchangeRateForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { currencyPanelClass, currencyPanelContentClass } from "@/modules/currencies/currencyUi";

export function ExchangeRateCreatePage() {
  const navigate = useNavigate();
  const currenciesQuery = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: upsertExchangeRate, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["exchange-rates"] }); navigate("/exchange-rates"); } });
  async function onSubmit(v: ExchangeRateFormValues) { await mutation.mutateAsync({ ...v, providerId: null, overrideReason: v.overrideReason || null }); }
  return <div className="space-y-4"><PageHeader title="Create Exchange Rate" description="Create or override exchange rates by date." /><Card className={currencyPanelClass}><CardContent className={currencyPanelContentClass}><ExchangeRateForm currencies={currenciesQuery.data ?? []} onSubmit={onSubmit} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
