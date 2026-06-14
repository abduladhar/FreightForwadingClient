import { useMemo, useState } from "react";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function IncentiveCalculationPage() {
  const [achievedRevenue, setAchievedRevenue] = useState(0);
  const [thresholdRevenue, setThresholdRevenue] = useState(0);
  const [incentivePercent, setIncentivePercent] = useState(0);
  const [fixedBonus, setFixedBonus] = useState(0);
  const incentive = useMemo(() => (achievedRevenue > thresholdRevenue ? ((achievedRevenue - thresholdRevenue) * incentivePercent) / 100 + fixedBonus : fixedBonus), [achievedRevenue, thresholdRevenue, incentivePercent, fixedBonus]);
  return <div className="space-y-4"><PageHeader title="Incentive Calculation" description="Finance support calculator for employee incentive estimation." actions={<AuditTrailButton />} /><Card><CardContent className="grid gap-3 pt-6 md:grid-cols-2"><Input type="number" min="0" value={achievedRevenue} onChange={(e) => setAchievedRevenue(Math.max(0, Number(e.target.value)))} placeholder="Achieved Revenue" /><Input type="number" min="0" value={thresholdRevenue} onChange={(e) => setThresholdRevenue(Math.max(0, Number(e.target.value)))} placeholder="Threshold Revenue" /><Input type="number" min="0" value={incentivePercent} onChange={(e) => setIncentivePercent(Math.max(0, Number(e.target.value)))} placeholder="Incentive %" /><Input type="number" min="0" value={fixedBonus} onChange={(e) => setFixedBonus(Math.max(0, Number(e.target.value)))} placeholder="Fixed Bonus" /><div className="md:col-span-2 rounded-lg border p-4"><p className="text-sm text-muted-foreground">Calculated Incentive</p><p className="text-xl font-semibold"><CurrencyAmount value={incentive} /></p></div></CardContent></Card></div>;
}

