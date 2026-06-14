import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { listSalaryDrafts } from "@/api/salaryApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";

export function SalaryViewPage() {
  const { salaryId } = useParams();
  const salary = useMemo(() => listSalaryDrafts().find((x) => x.id === salaryId), [salaryId]);
  if (!salaryId) return <Navigate to="/salary" replace />;
  if (!salary) return <div className="space-y-4"><PageHeader title="Salary View" description="Selected salary row is not a local draft entry." actions={<AuditTrailButton />} /><Card><CardContent className="pt-6 text-sm text-muted-foreground">Only salary drafts can be opened in detail. Posted ledger rows are viewable from Salary List.</CardContent></Card></div>;
  return <div className="space-y-4"><PageHeader title={`Salary ${salary.month}`} description={`Salary draft for ${salary.employeeName}`} actions={<AuditTrailButton />} /><Card><CardContent className="grid gap-3 pt-6 md:grid-cols-4"><KV k="Employee" v={salary.employeeName} /><KV k="Month" v={salary.month} /><KV k="Status" v={<StatusBadge status="Draft" />} /><KV k="Net Amount" v={<CurrencyAmount value={salary.netAmount} />} /><KV k="Basic" v={<CurrencyAmount value={salary.basicAmount} />} /><KV k="Allowance" v={<CurrencyAmount value={salary.allowanceAmount} />} /><KV k="Incentive" v={<CurrencyAmount value={salary.incentiveAmount} />} /><KV k="Deduction" v={<CurrencyAmount value={salary.deductionAmount} />} /></CardContent></Card></div>;
}

function KV({ k, v }: { k: string; v: React.ReactNode }) { return <div><p className="text-xs text-muted-foreground">{k}</p><div className="font-medium">{v}</div></div>; }

