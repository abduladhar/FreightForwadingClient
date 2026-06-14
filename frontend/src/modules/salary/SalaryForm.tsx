import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrencies } from "@/api/currencyApi";
import { getEmployees } from "@/api/employeeApi";
import { saveSalaryDraft } from "@/api/salaryApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { LedgerPostingPreview } from "@/components/common/LedgerPostingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function SalaryForm({ onSaved }: { onSaved?: () => void }) {
  const toast = useToast();
  const employees = useQuery({ queryKey: ["salary-employees"], queryFn: () => getEmployees(true, false) });
  const currencies = useQuery({ queryKey: ["salary-currencies"], queryFn: getCurrencies });
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [basicAmount, setBasicAmount] = useState(0);
  const [allowanceAmount, setAllowanceAmount] = useState(0);
  const [deductionAmount, setDeductionAmount] = useState(0);
  const [incentiveAmount, setIncentiveAmount] = useState(0);
  const [currencyId, setCurrencyId] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [remarks, setRemarks] = useState("");
  const employee = (employees.data ?? []).find((x) => x.id === employeeId);
  const employeeName = employee?.fullName ?? "";
  const netAmount = useMemo(() => basicAmount + allowanceAmount + incentiveAmount - deductionAmount, [basicAmount, allowanceAmount, incentiveAmount, deductionAmount]);

  function submit() {
    if (!employee || !currencyId) {
      toast.error("Missing fields", "Employee and currency are required.");
      return;
    }
    saveSalaryDraft({ employeeId, employeeName, month, basicAmount, allowanceAmount, deductionAmount, incentiveAmount, netAmount, currencyId, exchangeRate, remarks: remarks || null });
    toast.success("Saved", "Salary draft saved.");
    onSaved?.();
  }

  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-1"><Label>Employee</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}><option value="">Select employee</option>{(employees.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.employeeCode} - {x.fullName}</option>)}</select></div>
      <div className="space-y-1"><Label>Payroll Month</Label><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
      <div className="space-y-1"><Label>Currency</Label><select className="h-10 w-full rounded-md border px-3 text-sm" value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}><option value="">Select currency</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select></div>
      <div className="space-y-1"><Label>Exchange Rate</Label><Input type="number" min="0" value={exchangeRate} onChange={(e) => setExchangeRate(Math.max(0, Number(e.target.value)))} /></div>
      <div className="space-y-1"><Label>Basic</Label><Input type="number" min="0" value={basicAmount} onChange={(e) => setBasicAmount(Math.max(0, Number(e.target.value)))} /></div>
      <div className="space-y-1"><Label>Allowance</Label><Input type="number" min="0" value={allowanceAmount} onChange={(e) => setAllowanceAmount(Math.max(0, Number(e.target.value)))} /></div>
      <div className="space-y-1"><Label>Incentive</Label><Input type="number" min="0" value={incentiveAmount} onChange={(e) => setIncentiveAmount(Math.max(0, Number(e.target.value)))} /></div>
      <div className="space-y-1"><Label>Deduction</Label><Input type="number" min="0" value={deductionAmount} onChange={(e) => setDeductionAmount(Math.max(0, Number(e.target.value)))} /></div>
      <div className="space-y-1"><Label>Net Salary</Label><Input value={netAmount.toFixed(2)} disabled /></div>
      <div className="space-y-1 md:col-span-3"><Label>Remarks</Label><Input value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
    </div>
    <LedgerPostingPreview lines={[{ id: "1", account: "Salary Expense", debit: basicAmount + allowanceAmount + incentiveAmount, credit: 0, currency: "BASE" }, { id: "2", account: "Salary Payable", debit: 0, credit: netAmount, currency: "BASE" }, { id: "3", account: "Deductions Payable", debit: 0, credit: deductionAmount, currency: "BASE" }]} />
    <div className="flex gap-2"><PermissionButton permission="Accounting.Create" onClick={submit}>Save Salary Draft</PermissionButton><Button variant="outline" onClick={() => { setBasicAmount(0); setAllowanceAmount(0); setDeductionAmount(0); setIncentiveAmount(0); }}>Reset</Button></div>
  </div>;
}
