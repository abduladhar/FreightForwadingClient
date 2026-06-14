import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getRateMaster } from "@/api/rateMasterApi";
import { convertCurrency, getCurrencies } from "@/api/currencyApi";
import { useCurrency } from "@/hooks/useCurrency";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRateMasterI18n } from "@/modules/rateMasters/rateMasterI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function RateCalculatorPreviewPage() {
  const { rateMasterId = "" } = useParams();
  const { formatAmount, selectedCurrencyCode } = useCurrency();
  const r = useRateMasterI18n();
  const query = useQuery({ queryKey: ["rate-master-calc", rateMasterId], queryFn: () => getRateMaster(rateMasterId), enabled: Boolean(rateMasterId) });
  const currencies = useQuery({ queryKey: ["rate-master-calc-currencies"], queryFn: getCurrencies });
  const [metrics, setMetrics] = useState({ weight: 0, volume: 0, pieces: 0, chargeableWeight: 0, distance: 0, zoneUnits: 0, discount: 0 });
  const rate = query.data;
  const baseCharge = useMemo(() => {
    if (!rate) return 0;
    const slabMetric = resolveMetric(rate.rateBasis, metrics);
    const slab = rate.slabs.find((x) => slabMetric >= x.fromValue && slabMetric <= x.toValue);
    const rateValue = slab ? slab.rate : rate.baseRate;
    const amount = rateBasisAmount(rate.rateBasis, metrics, rateValue);
    const minApplied = Math.max(amount, slab?.minimumCharge ?? rate.minimumCharge);
    const maxApplied = rate.maximumCharge == null ? minApplied : Math.min(minApplied, rate.maximumCharge);
    return maxApplied;
  }, [rate, metrics]);

  const additional = useMemo(() => {
    if (!rate) return 0;
    const surcharge = baseCharge * (rate.fuelSurchargeRate / 100);
    const predefined = rate.handlingCharge + rate.pickupCharge + rate.deliveryCharge + rate.customsCharge + rate.documentationCharge + rate.warehouseCharge + rate.destinationCharge;
    const customCharges = rate.charges.filter((x) => x.isActive).reduce((sum, charge) => {
      if (charge.chargeType === "Percentage") return sum + (baseCharge * charge.percentage) / 100;
      if (charge.chargeType === "Range") {
        const quantity = resolveMetric(charge.rangeBasis, metrics);
        const range = (charge.ranges ?? []).find((x) => quantity >= x.fromValue && (x.toValue == null || quantity <= x.toValue));
        if (!range) return sum;
        const calculated = quantity * range.rate;
        const minimumApplied = Math.max(calculated, range.minimumCharge ?? 0);
        return sum + (range.maximumCharge == null ? minimumApplied : Math.min(minimumApplied, range.maximumCharge));
      }
      return sum + charge.amount;
    }, 0);
    return surcharge + predefined + customCharges;
  }, [rate, baseCharge]);
  const subTotal = baseCharge + additional;
  const discountAmount = (subTotal * metrics.discount) / 100;
  const taxable = subTotal - discountAmount;
  const taxAmount = rate?.isTaxApplicable ? (taxable * (rate.taxRate ?? 0)) / 100 : 0;
  const total = taxable + taxAmount;
  const selectedCurrencyId = useMemo(
    () => (currencies.data ?? []).find((x) => x.currencyCode === selectedCurrencyCode)?.id ?? null,
    [currencies.data, selectedCurrencyCode]
  );
  const conversionQuery = useQuery({
    queryKey: ["rate-master-calc-conversion", rate?.currencyId, selectedCurrencyId, total],
    queryFn: async () => {
      if (!rate?.currencyId || !selectedCurrencyId) return null;
      return convertCurrency({
        fromCurrencyId: rate.currencyId,
        toCurrencyId: selectedCurrencyId,
        amount: total,
        sourceModule: "RateMaster",
        referenceNumber: rate.rateCode
      });
    },
    enabled: Boolean(rate?.currencyId && selectedCurrencyId && total > 0)
  });

  return <div className="space-y-4"><PageHeader title={r("Rate Calculator Preview")} description={r("Preview calculation with slabs, basis, surcharges, tax, and discount.")} /><Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} grid gap-4 md:grid-cols-4`}><Metric label={r("Weight")} value={metrics.weight} onChange={(v) => setMetrics({ ...metrics, weight: v })} /><Metric label={r("Volume")} value={metrics.volume} onChange={(v) => setMetrics({ ...metrics, volume: v })} /><Metric label={r("Pieces")} value={metrics.pieces} onChange={(v) => setMetrics({ ...metrics, pieces: v })} /><Metric label={r("Chargeable Weight")} value={metrics.chargeableWeight} onChange={(v) => setMetrics({ ...metrics, chargeableWeight: v })} /><Metric label={r("Distance")} value={metrics.distance} onChange={(v) => setMetrics({ ...metrics, distance: v })} /><Metric label={r("Zone Units")} value={metrics.zoneUnits} onChange={(v) => setMetrics({ ...metrics, zoneUnits: v })} /><Metric label={r("Discount %")} value={metrics.discount} onChange={(v) => setMetrics({ ...metrics, discount: v })} /><div className="flex items-end"><Button className={masterDataButtonClass} variant="outline" onClick={() => setMetrics({ weight: 0, volume: 0, pieces: 0, chargeableWeight: 0, distance: 0, zoneUnits: 0, discount: 0 })}>{r("Reset")}</Button></div></CardContent></Card><Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} grid gap-3 md:grid-cols-2`}><Line label={r("Rate Basis")} value={rate?.rateBasis ? r(rate.rateBasis) : "-"} /><Line label={r("Base Charge")} value={formatAmount(baseCharge)} /><Line label={r("Additional Charges")} value={formatAmount(additional)} /><Line label={r("Sub Total")} value={formatAmount(subTotal)} /><Line label={r("Discount")} value={formatAmount(discountAmount)} /><Line label={r("Tax")} value={formatAmount(taxAmount)} /><Line label={r("Total")} value={formatAmount(total)} /><Line label={r("Currency Conversion Display")} value={conversionQuery.data?.formattedAmount ?? `${r("No conversion result for")} ${selectedCurrencyCode}`} /></CardContent></Card></div>;
}

function Metric({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div className="space-y-1"><Label>{label}</Label><Input type="number" min="0" value={value} onChange={(e) => onChange(Number(e.target.value))} /></div>;
}

function Line({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}

function resolveMetric(rateBasis: string, metrics: { weight: number; volume: number; pieces: number; chargeableWeight: number; distance: number; zoneUnits: number }) {
  switch (rateBasis) {
    case "Weight": return metrics.weight;
    case "Volume": return metrics.volume;
    case "Pieces": return metrics.pieces;
    case "ChargeableWeight": return metrics.chargeableWeight;
    case "Distance": return metrics.distance;
    case "Zone": return metrics.zoneUnits;
    default: return 1;
  }
}

function rateBasisAmount(rateBasis: string, metrics: { weight: number; volume: number; pieces: number; chargeableWeight: number; distance: number; zoneUnits: number }, rateValue: number) {
  if (rateBasis === "Flat") return rateValue;
  if (rateBasis === "Slab") return resolveMetric("Weight", metrics) * rateValue;
  return resolveMetric(rateBasis, metrics) * rateValue;
}
