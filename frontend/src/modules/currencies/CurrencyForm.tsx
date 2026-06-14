import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import type { ReactNode } from "react";
import { useI18n } from "@/app/i18n";
import { getActiveCountriesForDropdown } from "@/api/countryApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Currency } from "@/types/currency";
import { currencyButtonClass } from "@/modules/currencies/currencyUi";

const schema = z.object({
  currencyCode: z.string().trim().min(3).max(3),
  currencyName: z.string().trim().min(2).max(100),
  symbol: z.string().trim().min(1).max(10),
  decimalPlaces: z.coerce.number().int().min(0).max(6),
  roundingPrecision: z.coerce.number().min(0).max(1000),
  formatPattern: z.string().trim().min(1).max(50),
  countryRegion: z.string().trim().max(100).optional().or(z.literal("")),
  isActive: z.boolean(),
  defaultExchangeRateToBaseCurrency: z.number().positive("Exchange rate must be greater than zero.").nullable().optional(),
  defaultExchangeRateEffectiveDate: z.string().optional()
}).superRefine((value, context) => {
  if (value.defaultExchangeRateToBaseCurrency && !value.isActive) {
    context.addIssue({ code: "custom", path: ["defaultExchangeRateToBaseCurrency"], message: "Currency must be active to create a default exchange rate." });
  }
});

export type CurrencyFormValues = z.infer<typeof schema>;

export function CurrencyForm({
  initialValue,
  initialExchangeRate,
  initialExchangeRateDate,
  isSubmitting,
  disableCode,
  onSubmit
}: {
  initialValue?: Currency | null;
  initialExchangeRate?: number | null;
  initialExchangeRateDate?: string | null;
  isSubmitting?: boolean;
  disableCode?: boolean;
  onSubmit: (values: CurrencyFormValues) => Promise<void>;
}) {
  const { t } = useI18n();
  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currencyCode: initialValue?.currencyCode ?? "",
      currencyName: initialValue?.currencyName ?? "",
      symbol: initialValue?.symbol ?? "",
      decimalPlaces: initialValue?.decimalPlaces ?? 2,
      roundingPrecision: initialValue?.roundingPrecision ?? 0.01,
      formatPattern: initialValue?.formatPattern ?? "#,##0.00",
      countryRegion: initialValue?.countryRegion ?? "",
      isActive: initialValue?.isActive ?? true,
      defaultExchangeRateToBaseCurrency: initialExchangeRate ?? null,
      defaultExchangeRateEffectiveDate: initialExchangeRateDate ?? new Date().toISOString().slice(0, 10)
    }
  });
  useEffect(() => {
    if (initialExchangeRate == null || form.formState.dirtyFields.defaultExchangeRateToBaseCurrency) return;
    form.setValue("defaultExchangeRateToBaseCurrency", initialExchangeRate);
    if (initialExchangeRateDate && !form.formState.dirtyFields.defaultExchangeRateEffectiveDate) {
      form.setValue("defaultExchangeRateEffectiveDate", initialExchangeRateDate);
    }
  }, [form, initialExchangeRate, initialExchangeRateDate]);
  const countries = useQuery({ queryKey: ["currency-country-dropdown"], queryFn: () => getActiveCountriesForDropdown() });
  const tenantCurrencies = useQuery({ queryKey: ["tenant-currencies", "currency-form"], queryFn: getTenantCurrencies });
  const baseCurrency = (tenantCurrencies.data ?? []).find((currency) => currency.isEnabled && currency.isBaseCurrency);
  const isEditingBaseCurrency = Boolean(disableCode && initialValue?.id && initialValue.id === baseCurrency?.currencyId);
  const countryOptions = (countries.data ?? []).map((country) => ({
    value: country.name,
    label: `${country.isoCode} - ${country.name}`
  }));
  if (initialValue?.countryRegion && !countryOptions.some((country) => country.value === initialValue.countryRegion)) {
    countryOptions.unshift({ value: initialValue.countryRegion, label: initialValue.countryRegion });
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <Field label={t("Currency.CurrencyCode", "Currency Code")} error={form.formState.errors.currencyCode?.message}><Input {...form.register("currencyCode")} disabled={disableCode} /></Field>
      <Field label={t("Currency.CurrencyName", "Currency Name")} error={form.formState.errors.currencyName?.message}><Input {...form.register("currencyName")} /></Field>
      <Field label={t("Currency.Symbol", "Symbol")} error={form.formState.errors.symbol?.message}><Input {...form.register("symbol")} /></Field>
      <Field label={t("Currency.CountryRegion", "Country/Region")} error={form.formState.errors.countryRegion?.message}>
        <Controller
          control={form.control}
          name="countryRegion"
          render={({ field }) => <FilterableSelect value={field.value ?? ""} onChange={field.onChange} options={countryOptions} placeholder={t("Currency.SearchCountry", "Search country")} noResultsText={t("Currency.NoCountriesFound", "No countries found")} />}
        />
      </Field>
      <Field label={t("Currency.DecimalPlaces", "Decimal Places")} error={form.formState.errors.decimalPlaces?.message}><Input type="number" {...form.register("decimalPlaces", { valueAsNumber: true })} /></Field>
      <Field label={t("Currency.RoundingPrecision", "Rounding Precision")} error={form.formState.errors.roundingPrecision?.message}><Input type="number" step="0.0001" {...form.register("roundingPrecision", { valueAsNumber: true })} /></Field>
      <Field label={t("Currency.FormatPattern", "Format Pattern")} error={form.formState.errors.formatPattern?.message}><Input {...form.register("formatPattern")} /></Field>
      {!isEditingBaseCurrency ? (
        <>
          <Field
            label={baseCurrency ? t("Currency.DefaultExchangeRateWithBase", "Default Exchange Rate (1 {0} = ? {1})").replace("{0}", form.watch("currencyCode").toUpperCase() || t("Currency.CurrencyLower", "currency")).replace("{1}", baseCurrency.currencyCode) : t("Currency.DefaultExchangeRateToBaseCurrency", "Default Exchange Rate to Base Currency")}
            error={form.formState.errors.defaultExchangeRateToBaseCurrency?.message}
          >
            <Input
              type="number"
              min="0"
              step="0.00000001"
              placeholder={baseCurrency ? t("Currency.ExchangeRateExample", "Example: 1 {0} in {1}").replace("{0}", form.watch("currencyCode").toUpperCase() || t("Currency.CurrencyLower", "currency")).replace("{1}", baseCurrency.currencyCode) : t("Currency.ConfigureTenantBaseCurrencyFirst", "Configure tenant base currency first")}
              disabled={!baseCurrency}
              {...form.register("defaultExchangeRateToBaseCurrency", {
                setValueAs: (value) => value === "" ? null : Number(value)
              })}
            />
          </Field>
          <Field label={t("Currency.ExchangeRateEffectiveDate", "Exchange Rate Effective Date")} error={form.formState.errors.defaultExchangeRateEffectiveDate?.message}>
            <Input type="date" disabled={!baseCurrency} {...form.register("defaultExchangeRateEffectiveDate")} />
          </Field>
          <div className="md:col-span-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100">
            {baseCurrency
              ? t("Currency.DefaultRateHelp", "Optional. Enter how much {0} equals one unit of this currency. Saving a rate enables the currency for this tenant automatically.").replace("{0}", baseCurrency.currencyCode)
              : t("Currency.BaseCurrencyRequiredHelp", "A tenant base currency must be configured before a default exchange rate can be saved.")}
          </div>
        </>
      ) : <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{t("Currency.BaseCurrencyFixedRateHelp", "This is the tenant base currency and always uses exchange rate 1.")}</div>}
      <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isActive")} /> {t("Common.Active", "Active")}</label>
      <div className="md:col-span-2"><Button className={currencyButtonClass} type="submit" disabled={isSubmitting || form.formState.isSubmitting}>{isSubmitting || form.formState.isSubmitting ? t("Common.Saving", "Saving...") : t("Currency.SaveCurrency", "Save Currency")}</Button></div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}{error ? <p className="text-xs text-red-600">{error}</p> : null}</div>;
}

function FilterableSelect({
  value,
  onChange,
  options,
  placeholder,
  noResultsText
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  noResultsText: string;
}) {
  const selected = options.find((option) => option.value === value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(selected?.label ?? value);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  useEffect(() => {
    setText(selected?.label ?? value);
  }, [selected?.label, value]);

  function openMenu(resetSearch = false) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) setMenuStyle({ position: "fixed", left: rect.left, top: rect.bottom + 4, width: rect.width, zIndex: 1000 });
    if (resetSearch) setText("");
    setOpen(true);
  }

  const filtered = options.filter((option) => option.label.toLowerCase().includes(text.trim().toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={text}
        placeholder={placeholder}
        className="pr-9"
        onFocus={() => openMenu(true)}
        onChange={(event) => {
          setText(event.target.value);
          openMenu();
          if (!event.target.value.trim()) onChange("");
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            setText(options.find((option) => option.value === value)?.label ?? value);
          }, 120);
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
        onMouseDown={(event) => {
          event.preventDefault();
          if (open) setOpen(false);
          else openMenu(true);
        }}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="max-h-64 overflow-auto rounded-md border bg-white shadow-lg" style={menuStyle}>
              {filtered.length ? filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-sky-50 ${option.value === value ? "bg-sky-100 text-sky-800" : ""}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(option.value);
                    setText(option.label);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              )) : <div className="px-3 py-2 text-sm text-slate-500">{noResultsText}</div>}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
