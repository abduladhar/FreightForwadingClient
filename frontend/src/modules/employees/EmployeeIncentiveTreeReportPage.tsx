import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, RefreshCw } from "lucide-react";
import { getEmployeeIncentiveTreeReport, type EmployeeIncentiveTreeReport } from "@/api/salesPerformanceApi";
import { getBranchOptions } from "@/api/branchApi";
import { getEmployees } from "@/api/employeeApi";
import { PageHeader } from "@/components/PageHeader";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ResponsiveCardList, ResponsiveRecordCard } from "@/components/common/ResponsiveCardList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportFilteredCsv } from "@/utils/csvExport";
import { lt } from "@/modules/operationsLocalization";

const money = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function EmployeeIncentiveTreeReportPage() {
  const [branchId, setBranchId] = useState("");
  const [employeeGuid, setEmployeeGuid] = useState("");
  const [periodFrom, setPeriodFrom] = useState(monthStart());
  const [periodTo, setPeriodTo] = useState(today());
  const [includeInactiveEmployees, setIncludeInactiveEmployees] = useState(false);
  const [includeOnlySalesEmployees, setIncludeOnlySalesEmployees] = useState(false);
  const [rows, setRows] = useState<EmployeeIncentiveTreeReport[]>([]);

  const branches = useQuery({ queryKey: ["branch-options"], queryFn: getBranchOptions });
  const employees = useQuery({ queryKey: ["employees", "report-options"], queryFn: () => getEmployees(false, false) });
  const report = useMutation({
    mutationFn: () => getEmployeeIncentiveTreeReport({
      branchId: branchId || null,
      employeeGuid: employeeGuid || null,
      periodFrom,
      periodTo,
      includeInactiveEmployees,
      includeOnlySalesEmployees,
      pageNumber: 1,
      pageSize: 1000
    }),
    onSuccess: setRows
  });

  const totals = useMemo(() => rows.reduce((sum, row) => ({
    ownTarget: sum.ownTarget + row.ownTargetAmount,
    ownAchieved: sum.ownAchieved + row.ownAchievedAmount,
    ownIncentive: sum.ownIncentive + row.ownIncentiveAmount,
    childTarget: sum.childTarget + row.childTargetAmount,
    childAchieved: sum.childAchieved + row.childAchievedAmount,
    childIncentive: sum.childIncentive + row.childIncentiveAmount,
    teamTarget: sum.teamTarget + row.totalTeamTargetAmount,
    teamAchieved: sum.teamAchieved + row.totalTeamAchievedAmount,
    totalIncentive: sum.totalIncentive + row.totalIncentiveAmount
  }), { ownTarget: 0, ownAchieved: 0, ownIncentive: 0, childTarget: 0, childAchieved: 0, childIncentive: 0, teamTarget: 0, teamAchieved: 0, totalIncentive: 0 }), [rows]);

  function exportCsv() {
    exportFilteredCsv(rows.map((row) => ({ ...row })), `employee-incentive-tree-${periodFrom}-${periodTo}.csv`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Parent-Child Incentive Report")}
        description={lt("Hierarchy report for own target, child target, team achievement, and incentive rollup.")}
        actions={<><AuditTrailButton /><Button type="button" variant="outline" disabled={!rows.length} onClick={exportCsv}><Download className="h-4 w-4" />{lt("CSV Export")}</Button></>}
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label={lt("Branch")}>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                <option value="">{lt("All allowed branches")}</option>
                {(branches.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}
              </select>
            </Field>
            <Field label={lt("Parent / Employee")}>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={employeeGuid} onChange={(e) => setEmployeeGuid(e.target.value)}>
                <option value="">{lt("Full hierarchy")}</option>
                {(employees.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.employeeCode} - {x.fullName}</option>)}
              </select>
            </Field>
            <Field label={lt("Period From")}><Input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} /></Field>
            <Field label={lt("Period To")}><Input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} /></Field>
            <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><input type="checkbox" checked={includeInactiveEmployees} onChange={(e) => setIncludeInactiveEmployees(e.target.checked)} /> {lt("Include inactive employees")}</label>
            <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><input type="checkbox" checked={includeOnlySalesEmployees} onChange={(e) => setIncludeOnlySalesEmployees(e.target.checked)} /> {lt("Sales employees only")}</label>
            <div className="flex items-end">
              <Button type="button" disabled={report.isPending || !periodFrom || !periodTo} onClick={() => report.mutate()}><RefreshCw className="h-4 w-4" />{lt("View Report")}</Button>
            </div>
          </div>
          {report.isError ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{lt("Unable to load incentive report. Please check filters and try again.")}</div> : null}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Summary label={lt("Own Achieved")} value={totals.ownAchieved} />
        <Summary label={lt("Own Incentive")} value={totals.ownIncentive} />
        <Summary label={lt("Child Achieved")} value={totals.childAchieved} />
        <Summary label={lt("Child Incentive")} value={totals.childIncentive} />
        <Summary label={lt("Team Achieved")} value={totals.teamAchieved} />
        <Summary label={lt("Total Incentive")} value={totals.totalIncentive} strong />
      </div>

      <ResponsiveCardList
        isLoading={report.isPending}
        isError={report.isError}
        isEmpty={!rows.length}
        emptyText={lt("Select filters and view the report")}
      >
        {rows.map((row) => (
          <ResponsiveRecordCard
            key={row.employeeGuid}
            eyebrow={`${row.roleName || lt("Employee")} - ${lt("Level")} ${row.level}`}
            title={row.employeeName}
            fields={[
              { label: lt("Own Target"), value: money.format(row.ownTargetAmount) },
              { label: lt("Own Achieved"), value: money.format(row.ownAchievedAmount) },
              { label: lt("Own Achievement"), value: `${percent.format(row.ownAchievementPercentage)}%` },
              { label: lt("Own Incentive"), value: money.format(row.ownIncentiveAmount) },
              { label: lt("Child Target"), value: money.format(row.childTargetAmount) },
              { label: lt("Child Achieved"), value: money.format(row.childAchievedAmount) },
              { label: lt("Child Achievement"), value: `${percent.format(row.childAchievementPercentage)}%` },
              { label: lt("Child Incentive"), value: money.format(row.childIncentiveAmount) },
              { label: lt("Team Target"), value: money.format(row.totalTeamTargetAmount) },
              { label: lt("Team Achieved"), value: money.format(row.totalTeamAchievedAmount) },
              { label: lt("Team Achievement"), value: `${percent.format(row.totalTeamAchievementPercentage)}%` },
              { label: lt("Total Incentive"), value: <strong className="text-primary">{money.format(row.totalIncentiveAmount)}</strong> },
              { label: lt("Direct Children"), value: row.directChildCount },
              { label: lt("Total Children"), value: row.totalChildCount },
              { label: lt("Hierarchy Path"), value: row.hierarchyPath, fullWidth: true }
            ]}
          />
        ))}
      </ResponsiveCardList>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function Summary({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return <Card><CardContent className="pt-4"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className={`mt-1 text-lg ${strong ? "font-bold text-primary" : "font-semibold"}`}>{money.format(value)}</p></CardContent></Card>;
}
