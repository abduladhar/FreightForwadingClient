import { Fragment, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionButton } from "@/auth/PermissionButton";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { getTenantCurrencies } from "@/api/currencyApi";
import { calculateSalesmanIncentive, calculateSalesmanPerformance, getSalesmanIncentives, getSalesmanTargets, markSalesmanIncentivePaid, postSalesmanIncentive, recalculateSalesmanIncentive, saveSalesmanTarget } from "@/api/salesPerformanceApi";
import { lt } from "@/modules/operationsLocalization";

const bases = ["Revenue", "Collection", "Profit", "Operations"];

export function SalesmanTargetPage() {
  const queryClient = useQueryClient();
  const today = new Date();
  const firstDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [salesmanId, setSalesmanId] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState(firstDay);
  const [periodEnd, setPeriodEnd] = useState(lastDay);
  const [targetType, setTargetType] = useState("Revenue");
  const [targetAmount, setTargetAmount] = useState(0);
  const [incentiveBasis, setIncentiveBasis] = useState("Revenue");
  const [currencyId, setCurrencyId] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [expandedIncentiveId, setExpandedIncentiveId] = useState<string | null>(null);
  const targets = useQuery({ queryKey: ["salesman-targets"], queryFn: getSalesmanTargets });
  const currencies = useQuery({ queryKey: ["tenant-currencies"], queryFn: getTenantCurrencies });
  const performance = useQuery({ queryKey: ["salesman-performance", periodStart, periodEnd, salesmanId], queryFn: () => calculateSalesmanPerformance(periodStart, periodEnd, salesmanId), enabled: Boolean(periodStart && periodEnd) });
  const incentives = useQuery({ queryKey: ["salesman-incentives", salesmanId], queryFn: () => getSalesmanIncentives(salesmanId) });
  const baseCurrencyId = useMemo(() => (currencies.data ?? []).find((x) => x.isBaseCurrency)?.currencyId ?? (currencies.data ?? []).find((x) => x.isEnabled)?.currencyId ?? "", [currencies.data]);
  const selectedCurrencyId = currencyId || baseCurrencyId;
  const save = useMutation({ mutationFn: () => saveSalesmanTarget({ salesmanId: salesmanId!, periodStart, periodEnd, targetType, targetAmount, isActive: true }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesman-targets"] }) });
  const calculate = useMutation({
    mutationFn: () => calculateSalesmanIncentive({ salesmanId: salesmanId!, fromDate: periodStart, toDate: periodEnd, basis: incentiveBasis, currencyId: selectedCurrencyId, exchangeRate, remarks: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesman-incentives"] });
      queryClient.invalidateQueries({ queryKey: ["salesman-performance"] });
    }
  });
  const recalculate = useMutation({
    mutationFn: recalculateSalesmanIncentive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesman-incentives"] });
      queryClient.invalidateQueries({ queryKey: ["salesman-performance"] });
    }
  });
  const post = useMutation({ mutationFn: postSalesmanIncentive, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesman-incentives"] }) });
  const markPaid = useMutation({ mutationFn: (id: string) => markSalesmanIncentivePaid(id, new Date().toISOString().slice(0, 10)), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesman-incentives"] }) });
  return (
    <div className="space-y-4">
      <PageHeader title={lt("Salesman Targets")} description={lt("Targets and incentives include only records linked to a Salesman. Already calculated invoices or collections are skipped in the next run.")} actions={<><Button variant="outline" onClick={() => { targets.refetch(); performance.refetch(); incentives.refetch(); }}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button><AuditTrailButton /></>} />
      <Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-5">
        <Field label={lt("Salesman")}><SalesmanSelect value={salesmanId} onChange={setSalesmanId} /></Field>
        <Field label={lt("Period Start")}><Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /></Field>
        <Field label={lt("Period End")}><Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></Field>
        <Field label={lt("Target Basis")}><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={targetType} onChange={(e) => setTargetType(e.target.value)}>{bases.map((x) => <option key={x} value={x}>{lt(x)}</option>)}</select></Field>
        <Field label={lt("Target Amount")}><Input type="number" min={0} step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} /></Field>
        <div className="md:col-span-2 xl:col-span-5"><PermissionButton permission="SalesPerformance.Create" disabled={!salesmanId || save.isPending} onClick={() => save.mutate()}>{lt("Save Target")}</PermissionButton></div>
      </CardContent></Card>
      <Card><CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-5">
        <Field label={lt("Incentive Basis")}><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={incentiveBasis} onChange={(e) => setIncentiveBasis(e.target.value)}>{bases.map((x) => <option key={x} value={x}>{lt(x)}</option>)}</select></Field>
        <Field label={lt("Currency")}><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={selectedCurrencyId} onChange={(e) => setCurrencyId(e.target.value)}>{(currencies.data ?? []).filter((x) => x.isEnabled).map((x) => <option key={x.currencyId} value={x.currencyId}>{x.currencyCode} - {x.currencyName}</option>)}</select></Field>
        <Field label={lt("Exchange Rate")}><Input type="number" min={0.00000001} step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} /></Field>
        <div className="flex items-end md:col-span-2"><PermissionButton permission="SalesPerformance.Create" disabled={!salesmanId || !selectedCurrencyId || calculate.isPending} onClick={() => calculate.mutate()}>{lt("Calculate Incentive")}</PermissionButton></div>
      </CardContent></Card>
      <Card><CardContent className="overflow-x-auto pt-6"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b text-left"><th className="p-2">{lt("Salesman")}</th><th>{lt("Period")}</th><th>{lt("Basis")}</th><th className="text-right">{lt("Target")}</th></tr></thead><tbody>{(targets.data ?? []).map((row) => <tr key={row.id} className="border-b"><td className="p-2 font-medium">{row.salesmanName}</td><td>{row.periodStart} {lt("to")} {row.periodEnd}</td><td>{lt(row.targetType)}</td><td className="text-right">{row.targetAmount.toFixed(2)}</td></tr>)}</tbody></table></CardContent></Card>
      <Card><CardContent className="overflow-x-auto pt-6"><table className="w-full min-w-[820px] text-sm"><thead><tr className="border-b text-left"><th className="p-2">{lt("Salesman")}</th><th className="text-right">{lt("Revenue")}</th><th className="text-right">{lt("Collection")}</th><th className="text-right">{lt("Profit")}</th><th className="text-right">{lt("Achievement")}</th><th className="text-right">{lt("Preview Incentive")}</th></tr></thead><tbody>{(performance.data ?? []).map((row) => <tr key={row.salesmanId} className="border-b"><td className="p-2 font-medium">{row.salesmanName}</td><td className="text-right">{row.revenueAmount.toFixed(2)}</td><td className="text-right">{row.collectionAmount.toFixed(2)}</td><td className="text-right">{row.profitAmount.toFixed(2)}</td><td className="text-right">{row.achievementPercent.toFixed(2)}%</td><td className="text-right">{row.incentiveAmount.toFixed(2)}</td></tr>)}</tbody></table></CardContent></Card>
      <Card><CardContent className="overflow-x-auto pt-6"><table className="w-full min-w-[1180px] text-sm"><thead><tr className="border-b text-left"><th className="p-2">{lt("Salesman")}</th><th>{lt("Basis")}</th><th>{lt("Period")}</th><th className="text-right">{lt("Basis Amount")}</th><th className="text-right">{lt("Target")}</th><th className="text-right">{lt("Eligible")}</th><th className="text-right">{lt("Incentive")}</th><th>{lt("Status")}</th><th className="text-right">{lt("Actions")}</th></tr></thead><tbody>{(incentives.data ?? []).map((row) => <Fragment key={row.id}><tr className="border-b"><td className="p-2 font-medium">{row.salesmanName}</td><td>{lt(row.basis)}</td><td>{row.fromDate} {lt("to")} {row.toDate}</td><td className="text-right">{row.basisAmount.toFixed(2)}</td><td className="text-right">{row.targetAmount.toFixed(2)}</td><td className="text-right">{row.eligibleAmount.toFixed(2)}</td><td className="text-right">{row.incentiveAmount.toFixed(2)}</td><td>{lt(row.status)}{row.isPaid ? ` / ${lt("Paid")}` : ""}</td><td className="space-x-2 text-right"><Button size="sm" variant="outline" disabled={!row.slabBreakdown?.length} onClick={() => setExpandedIncentiveId(expandedIncentiveId === row.id ? null : row.id)}>{expandedIncentiveId === row.id ? lt("Hide Slabs") : lt("View Slabs")}</Button><PermissionButton permission="SalesPerformance.Update" size="sm" variant="outline" disabled={row.status !== "Calculated" || Boolean(row.ledgerEntryId) || row.isPaid || recalculate.isPending} onClick={() => recalculate.mutate(row.id)}>{lt("Recalculate")}</PermissionButton><PermissionButton permission="SalesPerformance.Approve" size="sm" variant="outline" disabled={row.status !== "Calculated" || post.isPending} onClick={() => post.mutate(row.id)}>{lt("Post")}</PermissionButton><PermissionButton permission="SalesPerformance.Approve" size="sm" variant="outline" disabled={row.status !== "Posted" || markPaid.isPending} onClick={() => markPaid.mutate(row.id)}>{lt("Mark Paid")}</PermissionButton></td></tr>{expandedIncentiveId === row.id ? <tr className="border-b bg-slate-50"><td colSpan={9} className="p-3"><div className="rounded-md border bg-white"><table className="w-full text-xs"><thead className="bg-slate-100"><tr><th className="p-2 text-left">{lt("Slab Range")}</th><th className="p-2 text-right">{lt("Applied Amount")}</th><th className="p-2 text-right">{lt("Percentage")}</th><th className="p-2 text-right">{lt("Fixed Amount")}</th><th className="p-2 text-right">{lt("Incentive Amount")}</th></tr></thead><tbody>{row.slabBreakdown.map((slab, index) => <tr key={slab.slabId ?? index} className="border-t"><td className="p-2">{slab.fromAmount.toFixed(2)} {lt("to")} {slab.toAmount == null ? lt("Above") : slab.toAmount.toFixed(2)}</td><td className="p-2 text-right">{slab.appliedAmount.toFixed(2)}</td><td className="p-2 text-right">{slab.incentiveType === "Percentage" ? `${slab.incentivePercentage.toFixed(2)}%` : "-"}</td><td className="p-2 text-right">{slab.incentiveType === "Fixed" ? slab.fixedAmount.toFixed(2) : "-"}</td><td className="p-2 text-right font-medium">{slab.incentiveAmount.toFixed(2)}</td></tr>)}</tbody><tfoot><tr className="border-t font-semibold"><td className="p-2" colSpan={4}>{lt("Slab Total")}</td><td className="p-2 text-right">{row.slabBreakdown.reduce((sum, slab) => sum + slab.incentiveAmount, 0).toFixed(2)}</td></tr></tfoot></table></div></td></tr> : null}</Fragment>)}</tbody></table></CardContent></Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
