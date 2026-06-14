import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/app/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Currency, ExchangeRate } from "@/types/currency";
import { currencyButtonClass } from "@/modules/currencies/currencyUi";

const schema = z.object({
  fromCurrencyId: z.string().uuid(),
  toCurrencyId: z.string().uuid(),
  rate: z.coerce.number().positive(),
  effectiveDate: z.string().min(1),
  isManualOverride: z.boolean(),
  overrideReason: z.string().max(250).optional().or(z.literal(""))
});

export type ExchangeRateFormValues = z.infer<typeof schema>;

export function ExchangeRateForm({
  currencies,
  initialValue,
  isSubmitting,
  onSubmit
}: {
  currencies: Currency[];
  initialValue?: ExchangeRate | null;
  isSubmitting?: boolean;
  onSubmit: (value: ExchangeRateFormValues) => Promise<void>;
}) {
  const { t } = useI18n();
  const form = useForm<ExchangeRateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromCurrencyId: initialValue?.fromCurrencyId ?? "",
      toCurrencyId: initialValue?.toCurrencyId ?? "",
      rate: initialValue?.rate ?? 1,
      effectiveDate: initialValue?.effectiveDate ?? new Date().toISOString().slice(0, 10),
      isManualOverride: initialValue?.isManualOverride ?? false,
      overrideReason: initialValue?.overrideReason ?? ""
    }
  });
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <div className="space-y-1"><Label>{t("Currency.FromCurrency", "From Currency")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("fromCurrencyId")}><option value="">{t("Common.Select", "Select")}</option>{currencies.map((c) => <option key={c.id} value={c.id}>{c.currencyCode} - {c.currencyName}</option>)}</select></div>
      <div className="space-y-1"><Label>{t("Currency.ToCurrency", "To Currency")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("toCurrencyId")}><option value="">{t("Common.Select", "Select")}</option>{currencies.map((c) => <option key={c.id} value={c.id}>{c.currencyCode} - {c.currencyName}</option>)}</select></div>
      <div className="space-y-1"><Label>{t("Currency.Rate", "Rate")}</Label><Input type="number" step="0.000001" {...form.register("rate", { valueAsNumber: true })} /></div>
      <div className="space-y-1"><Label>{t("Currency.EffectiveDate", "Effective Date")}</Label><Input type="date" {...form.register("effectiveDate")} /></div>
      <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isManualOverride")} /> {t("Currency.ManualOverride", "Manual override")}</label>
      <div className="md:col-span-2 space-y-1"><Label>{t("Currency.OverrideReason", "Override Reason")}</Label><Input {...form.register("overrideReason")} /></div>
      <div className="md:col-span-2"><Button className={currencyButtonClass} type="submit" disabled={isSubmitting || form.formState.isSubmitting}>{isSubmitting || form.formState.isSubmitting ? t("Common.Saving", "Saving...") : t("Currency.SaveExchangeRate", "Save Exchange Rate")}</Button></div>
    </form>
  );
}
