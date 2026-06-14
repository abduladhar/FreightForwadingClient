import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@/app/i18n";
import { convertCurrency, getCurrencies } from "@/api/currencyApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currencyButtonClass, currencyPanelClass, currencyPanelContentClass } from "@/modules/currencies/currencyUi";

export function CurrencyConversionPage() {
  const { t } = useI18n();
  const currenciesQuery = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const currencies = currenciesQuery.data ?? [];
  const [fromCurrencyId, setFromCurrencyId] = useState("");
  const [toCurrencyId, setToCurrencyId] = useState("");
  const [amount, setAmount] = useState(0);
  const [rateDate, setRateDate] = useState("");
  const mutation = useMutation({ mutationFn: convertCurrency });
  const result = mutation.data;
  const canSubmit = useMemo(() => Boolean(fromCurrencyId && toCurrencyId && amount > 0), [fromCurrencyId, toCurrencyId, amount]);

  return (
    <div className="space-y-4">
      <PageHeader title="Currency Conversion" description="Convert between currencies using saved historical rates." />
      <Card className={currencyPanelClass}><CardContent className={`${currencyPanelContentClass} grid gap-4 md:grid-cols-2`}>
        <div className="space-y-1"><Label>{t("Currency.From", "From")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={fromCurrencyId} onChange={(e) => setFromCurrencyId(e.target.value)}><option value="">{t("Common.Select", "Select")}</option>{currencies.map((c) => <option key={c.id} value={c.id}>{c.currencyCode}</option>)}</select></div>
        <div className="space-y-1"><Label>{t("Currency.To", "To")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={toCurrencyId} onChange={(e) => setToCurrencyId(e.target.value)}><option value="">{t("Common.Select", "Select")}</option>{currencies.map((c) => <option key={c.id} value={c.id}>{c.currencyCode}</option>)}</select></div>
        <div className="space-y-1"><Label>{t("Currency.Amount", "Amount")}</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
        <div className="space-y-1"><Label>{t("Currency.RateDate", "Rate Date")}</Label><Input type="date" value={rateDate} onChange={(e) => setRateDate(e.target.value)} /></div>
        <div className="md:col-span-2"><Button className={currencyButtonClass} disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate({ fromCurrencyId, toCurrencyId, amount, rateDate: rateDate || null, sourceModule: "CurrencyConversion", referenceNumber: null })}>{t("Currency.Convert", "Convert")}</Button></div>
        {result ? <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">{t("Currency.Source", "Source")}: {result.sourceAmount} | {t("Currency.Converted", "Converted")}: {result.convertedAmount} | {t("Currency.Rate", "Rate")}: {result.rate} | {t("Currency.Date", "Date")}: {result.rateDate} | {t("Currency.Formatted", "Formatted")}: {result.formattedAmount}</div> : null}
      </CardContent></Card>
    </div>
  );
}
