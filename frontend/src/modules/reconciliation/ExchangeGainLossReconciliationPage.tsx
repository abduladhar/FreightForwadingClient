import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExchangeGainLossPreview } from "@/api/reconciliationApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ExchangeGainLossReconciliationPage() {
  const [amount, setAmount] = useState(0);
  const [sourceExchangeRate, setSourceExchangeRate] = useState(1);
  const [settlementExchangeRate, setSettlementExchangeRate] = useState(1);
  const preview = useQuery({ queryKey: ["exchange-gain-loss-preview", amount, sourceExchangeRate, settlementExchangeRate], queryFn: () => getExchangeGainLossPreview(amount, sourceExchangeRate, settlementExchangeRate) });
  return <div className="space-y-4"><PageHeader title="Exchange Gain/Loss Reconciliation" description="Preview settlement exchange gain/loss for multi-currency allocations." actions={<AuditTrailButton />} /><Card><CardContent className="grid gap-3 pt-6 md:grid-cols-3"><Input type="number" min="0" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} placeholder="Amount" /><Input type="number" min="0" value={sourceExchangeRate} onChange={(e) => setSourceExchangeRate(Math.max(0, Number(e.target.value)))} placeholder="Source Exchange Rate" /><Input type="number" min="0" value={settlementExchangeRate} onChange={(e) => setSettlementExchangeRate(Math.max(0, Number(e.target.value)))} placeholder="Settlement Exchange Rate" /></CardContent></Card><Card><CardContent className="grid gap-4 pt-6 md:grid-cols-3"><Metric title="Source Base Amount" value={<CurrencyAmount value={preview.data?.sourceBaseAmount ?? 0} />} /><Metric title="Settlement Base Amount" value={<CurrencyAmount value={preview.data?.settlementBaseAmount ?? 0} />} /><Metric title="Exchange Gain" value={<CurrencyAmount value={preview.data?.exchangeGainAmount ?? 0} />} /><Metric title="Exchange Loss" value={<CurrencyAmount value={preview.data?.exchangeLossAmount ?? 0} />} /></CardContent></Card></div>;
}

function Metric({ title, value }: { title: string; value: React.ReactNode }) {
  return <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{title}</p><div className="text-lg font-semibold">{value}</div></div>;
}

