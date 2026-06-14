import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useI18n } from "@/app/i18n";
import { createCurrencyRevaluation, getCurrencies } from "@/api/currencyApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { currencyButtonClass, currencyPanelClass, currencyPanelContentClass } from "@/modules/currencies/currencyUi";

export function CurrencyRevaluationPage() {
  const { t } = useI18n();
  const currenciesQuery = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const [currencyId, setCurrencyId] = useState("");
  const [revaluationDate, setRevaluationDate] = useState(new Date().toISOString().slice(0, 10));
  const [originalAmount, setOriginalAmount] = useState(0);
  const [revaluedAmount, setRevaluedAmount] = useState(0);
  const [sourceDocumentType, setSourceDocumentType] = useState("Manual");
  const [sourceDocumentId, setSourceDocumentId] = useState("");
  const differenceAmount = revaluedAmount - originalAmount;
  const mutation = useMutation({ mutationFn: createCurrencyRevaluation });
  return (
    <div className="space-y-4">
      <PageHeader title="Currency Revaluation" description="Record revaluation and variance for foreign balances." actions={<AuditTrailButton />} />
      <Card className={currencyPanelClass}><CardContent className={`${currencyPanelContentClass} grid gap-4 md:grid-cols-2`}>
        <div className="space-y-1"><Label>{t("Currency.Currency", "Currency")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}><option value="">{t("Common.Select", "Select")}</option>{(currenciesQuery.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.currencyCode}</option>)}</select></div>
        <div className="space-y-1"><Label>{t("Currency.RevaluationDate", "Revaluation Date")}</Label><Input type="date" value={revaluationDate} onChange={(e) => setRevaluationDate(e.target.value)} /></div>
        <div className="space-y-1"><Label>{t("Currency.OriginalAmount", "Original Amount")}</Label><Input type="number" step="0.01" value={originalAmount} onChange={(e) => setOriginalAmount(Number(e.target.value))} /></div>
        <div className="space-y-1"><Label>{t("Currency.RevaluedAmount", "Revalued Amount")}</Label><Input type="number" step="0.01" value={revaluedAmount} onChange={(e) => setRevaluedAmount(Number(e.target.value))} /></div>
        <div className="space-y-1"><Label>{t("Currency.SourceDocumentType", "Source Document Type")}</Label><Input value={sourceDocumentType} onChange={(e) => setSourceDocumentType(e.target.value)} /></div>
        <div className="space-y-1"><Label>{t("Currency.SourceDocumentId", "Source Document Id (GUID)")}</Label><Input value={sourceDocumentId} onChange={(e) => setSourceDocumentId(e.target.value)} /></div>
        <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-900">{t("Currency.DifferenceAmount", "Difference Amount")}: {differenceAmount.toFixed(2)}</div>
        <div className="md:col-span-2"><Button className={currencyButtonClass} disabled={!currencyId || !sourceDocumentId || mutation.isPending} onClick={() => mutation.mutate({ currencyId, revaluationDate, originalAmount, revaluedAmount, differenceAmount, sourceDocumentType, sourceDocumentId })}>{mutation.isPending ? t("Common.Saving", "Saving...") : t("Currency.RecordRevaluation", "Record Revaluation")}</Button></div>
      </CardContent></Card>
    </div>
  );
}
