import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createCurrency, setTenantCurrency } from "@/api/currencyApi";
import { CurrencyForm, type CurrencyFormValues } from "@/modules/currencies/CurrencyForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { currencyPanelClass, currencyPanelContentClass } from "@/modules/currencies/currencyUi";

export function CurrencyCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (value: CurrencyFormValues) => {
      const currency = await createCurrency({ ...value, countryRegion: value.countryRegion || null });
      if (value.isActive && !value.defaultExchangeRateToBaseCurrency) await setTenantCurrency(currency.id, true, false);
      return currency;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["currencies"] }),
        queryClient.invalidateQueries({ queryKey: ["tenant-currencies"] }),
        queryClient.invalidateQueries({ queryKey: ["invoice-currencies"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-bill-currencies"] })
      ]);
      navigate("/currencies");
    }
  });
  async function onSubmit(value: CurrencyFormValues) { await mutation.mutateAsync(value); }
  return <div className="space-y-4"><PageHeader title="Create Currency" description="Create and activate new currency." /><Card className={currencyPanelClass}><CardContent className={currencyPanelContentClass}><CurrencyForm onSubmit={onSubmit} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
