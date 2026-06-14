import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getAgent, updateAgent } from "@/api/agentApi";
import { getCurrencies } from "@/api/currencyApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function AgentCommissionSettingsPage() {
  const m = useMasterDataI18n("Agent");
  const { agentId } = useParams();
  const queryClient = useQueryClient();
  const agentQuery = useQuery({ queryKey: ["agent", agentId], queryFn: () => getAgent(agentId!), enabled: Boolean(agentId) });
  const currencies = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const [commissionCurrencyId, setCommissionCurrencyId] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState(0);
  const [minimumCommissionAmount, setMinimumCommissionAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const mutation = useMutation({
    mutationFn: () => updateAgent(agentId!, { ...agentQuery.data!, commissionSetting: { commissionCurrencyId, commissionPercentage, minimumCommissionAmount, notes } }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agent", agentId] })
  });
  if (!agentId) return <Navigate to="/agents" replace />;
  return <div className="space-y-4"><PageHeader title={m("Agent Commission Settings")} description={m("Define commission currency and rates.")} /><Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} grid gap-4 md:grid-cols-2`}><div className="space-y-1"><Label>{m("Commission Currency")}</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={commissionCurrencyId} onChange={(e) => setCommissionCurrencyId(e.target.value)}><option value="">{m("Select")}</option>{(currencies.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.currencyCode}</option>)}</select></div><div className="space-y-1"><Label>{m("Commission %")}</Label><Input type="number" step="0.01" value={commissionPercentage} onChange={(e) => setCommissionPercentage(Number(e.target.value))} /></div><div className="space-y-1"><Label>{m("Minimum Commission")}</Label><Input type="number" step="0.01" value={minimumCommissionAmount} onChange={(e) => setMinimumCommissionAmount(Number(e.target.value))} /></div><div className="space-y-1"><Label>{m("Notes")}</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div><div className="md:col-span-2"><Button className={masterDataButtonClass} onClick={() => mutation.mutate()} disabled={mutation.isPending || !agentQuery.data}>{m("Save Commission Settings")}</Button></div></CardContent></Card></div>;
}
