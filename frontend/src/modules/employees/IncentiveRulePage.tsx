import { useState } from "react";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionButton } from "@/auth/PermissionButton";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { getIncentiveRules, saveIncentiveRule, type IncentiveRule, type IncentiveSlab } from "@/api/salesPerformanceApi";
import { lt } from "@/modules/operationsLocalization";

const bases = ["Revenue", "Collection", "Profit", "Operations"];
const emptySlab = (): IncentiveSlab => ({ fromAmount: 0, toAmount: null, incentiveType: "Percentage", incentivePercentage: 0, fixedAmount: 0, isActive: true });

export function IncentiveRulePage() {
  const queryClient = useQueryClient();
  const [salesmanId, setSalesmanId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState("");
  const [basis, setBasis] = useState("Revenue");
  const [fromAchievementPercentage, setFromAchievementPercentage] = useState(0);
  const [toAchievementPercentage, setToAchievementPercentage] = useState(100);
  const [ownIncentivePercentage, setOwnIncentivePercentage] = useState(0);
  const [childIncentivePercentage, setChildIncentivePercentage] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [slabs, setSlabs] = useState<IncentiveSlab[]>([{ fromAmount: 1000, toAmount: 2000, incentiveType: "Percentage", incentivePercentage: 5, fixedAmount: 0, isActive: true }]);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [viewingRule, setViewingRule] = useState<IncentiveRule | null>(null);
  const rules = useQuery({ queryKey: ["salesman-incentive-rules"], queryFn: getIncentiveRules });
  const save = useMutation({
    mutationFn: () => {
      const first = slabs[0] ?? emptySlab();
      return saveIncentiveRule({
        salesmanId,
        ruleName,
        basis,
        thresholdAmount: first.fromAmount,
        incentivePercentage: first.incentivePercentage,
        incentiveType: first.incentiveType,
        fixedAmount: first.fixedAmount,
        fromAchievementPercentage,
        toAchievementPercentage,
        ownIncentivePercentage,
        childIncentivePercentage,
        isActive,
        slabs
      }, editingRuleId ?? undefined);
    },
    onSuccess: () => {
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["salesman-incentive-rules"] });
    }
  });

  function updateSlab(index: number, patch: Partial<IncentiveSlab>) {
    setSlabs((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function loadRule(rule: IncentiveRule) {
    setEditingRuleId(rule.id);
    setSalesmanId(rule.salesmanId ?? null);
    setRuleName(rule.ruleName);
    setBasis(rule.basis);
    setFromAchievementPercentage(rule.fromAchievementPercentage ?? 0);
    setToAchievementPercentage(rule.toAchievementPercentage ?? 100);
    setOwnIncentivePercentage(rule.ownIncentivePercentage ?? rule.incentivePercentage ?? 0);
    setChildIncentivePercentage(rule.childIncentivePercentage ?? 0);
    setIsActive(rule.isActive);
    setSlabs(rule.slabs.length ? rule.slabs.map((slab) => ({ ...slab })) : [{
      fromAmount: rule.thresholdAmount,
      toAmount: null,
      incentiveType: rule.incentiveType,
      incentivePercentage: rule.incentivePercentage,
      fixedAmount: rule.fixedAmount,
      isActive: rule.isActive
    }]);
  }

  function resetForm() {
    setEditingRuleId(null);
    setSalesmanId(null);
    setRuleName("");
    setBasis("Revenue");
    setFromAchievementPercentage(0);
    setToAchievementPercentage(100);
    setOwnIncentivePercentage(0);
    setChildIncentivePercentage(0);
    setIsActive(true);
    setSlabs([emptySlab()]);
  }

  function addFinalSlab() {
    setSlabs((rows) => {
      const lastTo = rows.map((row) => row.toAmount ?? row.fromAmount).reduce((max, amount) => Math.max(max, Number(amount) || 0), 0);
      return [...rows, { fromAmount: lastTo > 0 ? lastTo + 1 : 30000, toAmount: null, incentiveType: "Percentage", incentivePercentage: 0, fixedAmount: 0, isActive: true }];
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Incentive Rules")} description={lt("Create slab-based incentives after target achievement. Leave To Amount empty for the final slab, for example From 30000 and above.")} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {editingRuleId ? <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 md:col-span-2 xl:col-span-4">{lt("Editing existing incentive rule. Use Clear to create a new rule.")}</div> : null}
            <Field label={lt("Salesman (optional)")}><SalesmanSelect value={salesmanId} onChange={setSalesmanId} /></Field>
            <Field label={lt("Rule Name")}><Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder={lt("Revenue slab incentive")} /></Field>
            <Field label={lt("Basis")}>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={basis} onChange={(e) => setBasis(e.target.value)}>{bases.map((x) => <option key={x} value={x}>{lt(x)}</option>)}</select>
            </Field>
            <Field label={lt("Status")}>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={isActive ? "active" : "inactive"} onChange={(e) => setIsActive(e.target.value === "active")}><option value="active">{lt("Active")}</option><option value="inactive">{lt("Inactive")}</option></select>
            </Field>
            <Field label={lt("From Achievement %")}><Input type="number" min={0} step="0.01" value={fromAchievementPercentage} onChange={(e) => setFromAchievementPercentage(Number(e.target.value))} /></Field>
            <Field label={lt("To Achievement %")}><Input type="number" min={0} step="0.01" value={toAchievementPercentage} onChange={(e) => setToAchievementPercentage(Number(e.target.value))} /></Field>
            <Field label={lt("Own Incentive %")}><Input type="number" min={0} step="0.01" value={ownIncentivePercentage} onChange={(e) => setOwnIncentivePercentage(Number(e.target.value))} /></Field>
            <Field label={lt("Child Incentive %")}><Input type="number" min={0} step="0.01" value={childIncentivePercentage} onChange={(e) => setChildIncentivePercentage(Number(e.target.value))} /></Field>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b text-left">
                  <th className="p-2">{lt("From Amount")}</th><th className="p-2">{lt("To Amount")}</th><th className="p-2">{lt("Type")}</th><th className="p-2">{lt("Percentage")}</th><th className="p-2">{lt("Fixed Amount")}</th><th className="p-2">{lt("Active")}</th><th className="p-2 text-right">{lt("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {slabs.map((slab, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="p-2"><Input type="number" min={0} step="0.01" value={slab.fromAmount} onChange={(e) => updateSlab(index, { fromAmount: Number(e.target.value) })} /></td>
                    <td className="p-2"><Input type="number" min={0} step="0.01" value={slab.toAmount ?? ""} onChange={(e) => updateSlab(index, { toAmount: e.target.value === "" ? null : Number(e.target.value) })} placeholder={lt("No limit")} /></td>
                    <td className="p-2"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={slab.incentiveType} onChange={(e) => updateSlab(index, { incentiveType: e.target.value as "Percentage" | "Fixed" })}><option value="Percentage">{lt("Percentage")}</option><option value="Fixed">{lt("Fixed")}</option></select></td>
                    <td className="p-2"><Input type="number" min={0} step="0.01" disabled={slab.incentiveType === "Fixed"} value={slab.incentivePercentage} onChange={(e) => updateSlab(index, { incentivePercentage: Number(e.target.value) })} /></td>
                    <td className="p-2"><Input type="number" min={0} step="0.01" disabled={slab.incentiveType === "Percentage"} value={slab.fixedAmount} onChange={(e) => updateSlab(index, { fixedAmount: Number(e.target.value) })} /></td>
                    <td className="p-2"><input type="checkbox" checked={slab.isActive} onChange={(e) => updateSlab(index, { isActive: e.target.checked })} /></td>
                    <td className="p-2 text-right"><Button type="button" size="icon" variant="ghost" disabled={slabs.length === 1} onClick={() => setSlabs((rows) => rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setSlabs((rows) => [...rows, emptySlab()])}><Plus className="h-4 w-4" />{lt("Add Slab")}</Button>
            <Button type="button" variant="outline" onClick={addFinalSlab}><Plus className="h-4 w-4" />{lt("Add Final Slab")}</Button>
            <PermissionButton permission={editingRuleId ? "SalesPerformance.Update" : "SalesPerformance.Create"} disabled={!ruleName.trim() || slabs.length === 0 || save.isPending} onClick={() => save.mutate()}>{editingRuleId ? lt("Update Rule") : lt("Save Rule")}</PermissionButton>
            {editingRuleId ? <Button type="button" variant="ghost" onClick={resetForm}><X className="h-4 w-4" />{lt("Clear")}</Button> : null}
          </div>
        </CardContent>
      </Card>
      {viewingRule ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">{viewingRule.ruleName}</h3>
                <p className="text-sm text-muted-foreground">{viewingRule.salesmanName} | {lt(viewingRule.basis)} | {viewingRule.isActive ? lt("Active") : lt("Inactive")}</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setViewingRule(null)}><X className="h-4 w-4" />{lt("Close")}</Button>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-muted/50"><tr className="border-b text-left"><th className="p-2">{lt("Range")}</th><th className="p-2">{lt("Type")}</th><th className="p-2 text-right">{lt("Percentage")}</th><th className="p-2 text-right">{lt("Fixed Amount")}</th><th className="p-2">{lt("Status")}</th></tr></thead>
                <tbody>{viewingRule.slabs.map((slab) => <tr key={slab.id ?? `${slab.fromAmount}-${slab.toAmount ?? "above"}`} className="border-b last:border-0"><td className="p-2 font-medium">{formatSlabRange(slab)}</td><td className="p-2">{lt(slab.incentiveType)}</td><td className="p-2 text-right">{slab.incentivePercentage.toFixed(2)}%</td><td className="p-2 text-right">{slab.fixedAmount.toFixed(2)}</td><td className="p-2">{slab.isActive ? lt("Active") : lt("Inactive")}</td></tr>)}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b text-left"><th className="p-2">{lt("Rule")}</th><th>{lt("Salesman")}</th><th>{lt("Basis")}</th><th>{lt("Slabs")}</th><th>{lt("Status")}</th><th className="text-right">{lt("Action")}</th></tr></thead>
            <tbody>{(rules.data ?? []).map((row) => <tr key={row.id} className="border-b"><td className="p-2 font-medium">{row.ruleName}</td><td>{row.salesmanName}</td><td>{lt(row.basis)}</td><td>{row.slabs.map((s) => `${formatSlabRange(s)}: ${s.incentiveType === "Fixed" ? s.fixedAmount.toFixed(2) : `${s.incentivePercentage.toFixed(2)}%`}`).join(", ")}</td><td>{row.isActive ? lt("Active") : lt("Inactive")}</td><td className="space-x-1 text-right"><Button type="button" size="sm" variant="outline" onClick={() => setViewingRule(row)}><Eye className="h-4 w-4" />{lt("View")}</Button><PermissionButton permission="SalesPerformance.Update" size="sm" variant="outline" onClick={() => loadRule(row)}><Pencil className="h-4 w-4" />{lt("Edit")}</PermissionButton></td></tr>)}</tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }

function formatSlabRange(slab: IncentiveSlab) {
  return slab.toAmount == null ? `${slab.fromAmount} ${lt("and above")}` : `${slab.fromAmount} - ${slab.toAmount}`;
}
