import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getCommissionAgents, saveCommissionDraft } from "@/api/commissionApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { LedgerPostingPreview } from "@/components/common/LedgerPostingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function AgentCommissionForm({ onSaved }: { onSaved?: () => void }) {
  const toast = useToast();
  const agents = useQuery({ queryKey: ["commission-agents"], queryFn: getCommissionAgents });
  const currencies = useQuery({ queryKey: ["tenant-currencies", "agent-commission"], queryFn: getTenantCurrencies });
  const [agentId, setAgentId] = useState("");
  const [sourceType, setSourceType] = useState("HouseShipment");
  const [sourceId, setSourceId] = useState("");
  const [commissionCurrencyId, setCommissionCurrencyId] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [baseAmount, setBaseAmount] = useState(0);
  const [commissionPercent, setCommissionPercent] = useState(0);
  const [remarks, setRemarks] = useState("");
  const commissionAmount = useMemo(() => (baseAmount * commissionPercent) / 100, [baseAmount, commissionPercent]);
  const enabledCurrencies = (currencies.data ?? []).filter((currency) => currency.isEnabled);
  const baseCurrencyCode = enabledCurrencies.find((currency) => currency.isBaseCurrency)?.currencyCode
    ?? enabledCurrencies[0]?.currencyCode
    ?? "USD";

  function submit() {
    if (!agentId || !commissionCurrencyId) {
      toast.error(lt("Missing fields"), lt("Agent and commission currency are required."));
      return;
    }
    saveCommissionDraft({ agentId, sourceType, sourceId: sourceId || null, commissionCurrencyId, exchangeRate, baseAmount, commissionPercent, commissionAmount, remarks: remarks || null });
    toast.success(lt("Saved"), lt("Commission draft saved."));
    onSaved?.();
  }

  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-1"><Label>{lt("Agent")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={agentId} onChange={(e) => setAgentId(e.target.value)}><option value="">{lt("Select agent")}</option>{(agents.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.agentCode} - {x.agentName}</option>)}</select></div>
      <div className="space-y-1"><Label>{lt("Source Type")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={sourceType} onChange={(e) => setSourceType(e.target.value)}><option value="HouseShipment">{lt("House Shipment")}</option><option value="MasterShipment">{lt("Master Shipment")}</option><option value="DirectShipment">{lt("Direct Shipment")}</option><option value="Pickup">{lt("Pickup")}</option></select></div>
      <div className="space-y-1"><Label>{lt("Source Id")}</Label><Input placeholder={lt("Enter source reference id")} value={sourceId} onChange={(e) => setSourceId(e.target.value)} /></div>
      <div className="space-y-1"><Label>{lt("Commission Currency")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={commissionCurrencyId} onChange={(e) => setCommissionCurrencyId(e.target.value)}><option value="">{lt("Select currency")}</option>{enabledCurrencies.map((x) => <option key={x.currencyId} value={x.currencyId}>{x.currencyCode} - {x.currencyName}</option>)}</select></div>
      <div className="space-y-1"><Label>{lt("Exchange Rate")}</Label><Input type="number" min="0" value={exchangeRate} onChange={(e) => setExchangeRate(Math.max(0, Number(e.target.value)))} /></div>
      <div className="space-y-1"><Label>{lt("Base Amount")}</Label><Input type="number" min="0" value={baseAmount} onChange={(e) => setBaseAmount(Math.max(0, Number(e.target.value)))} /></div>
      <div className="space-y-1"><Label>{lt("Commission %")}</Label><Input type="number" min="0" value={commissionPercent} onChange={(e) => setCommissionPercent(Math.max(0, Number(e.target.value)))} /></div>
      <div className="space-y-1"><Label>{lt("Commission Amount")}</Label><Input value={commissionAmount.toFixed(2)} disabled /></div>
      <div className="space-y-1 md:col-span-3"><Label>{lt("Remarks")}</Label><Input placeholder={lt("Enter remarks")} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
    </div>
    <LedgerPostingPreview lines={[{ id: "1", account: lt("Agent Commission Expense"), debit: commissionAmount, credit: 0, currency: baseCurrencyCode }, { id: "2", account: lt("Agent Payable"), debit: 0, credit: commissionAmount, currency: baseCurrencyCode }]} />
    <div className="flex gap-2"><PermissionButton permission="Accounting.Create" onClick={submit}>{lt("Save Commission Draft")}</PermissionButton><Button variant="outline" onClick={() => { setBaseAmount(0); setCommissionPercent(0); setSourceId(""); setRemarks(""); }}>{lt("Reset")}</Button></div>
  </div>;
}
