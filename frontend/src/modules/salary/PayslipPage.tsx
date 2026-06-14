import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { exportPdfReport } from "@/utils/pdfExport";
import { listSalaryDrafts } from "@/api/salaryApi";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PayslipPage() {
  const { salaryId } = useParams();
  const workspace = useWorkspace();
  const salary = useMemo(() => listSalaryDrafts().find((x) => x.id === salaryId), [salaryId]);
  if (!salary) return <div className="space-y-4"><PageHeader title="Payslip" description="Create a salary draft first, then open payslip preview." actions={<AuditTrailButton />} /></div>;
  return <div className="space-y-4"><PageHeader title={`Payslip ${salary.month}`} description={`Payslip preview for ${salary.employeeName}`} actions={<><AuditTrailButton /><Button variant="outline" onClick={() => void exportPdfReport({ fileName: `Payslip-${salary.employeeName}-${salary.month}.pdf`, title: "Employee Payslip", tenantName: workspace.tenantCode, branchName: workspace.branchName ?? "Branch", documentNumber: salary.id, documentDate: new Date(), currencyCode: workspace.baseCurrency, cultureCode: workspace.cultureCode, columns: [{ key: "component", label: "Component" }, { key: "amount", label: "Amount", align: "right" }], rows: [{ component: "Basic", amount: salary.basicAmount }, { component: "Allowance", amount: salary.allowanceAmount }, { component: "Incentive", amount: salary.incentiveAmount }, { component: "Deduction", amount: -salary.deductionAmount }, { component: "Net Pay", amount: salary.netAmount }] })}><Download className="h-4 w-4" /> PDF</Button></>} /><PrintPreview title={`Payslip ${salary.employeeName}`}><div className="space-y-1 text-sm"><p>Employee: {salary.employeeName}</p><p>Month: {salary.month}</p><p>Basic: {salary.basicAmount.toFixed(2)}</p><p>Allowance: {salary.allowanceAmount.toFixed(2)}</p><p>Incentive: {salary.incentiveAmount.toFixed(2)}</p><p>Deduction: {salary.deductionAmount.toFixed(2)}</p><p className="font-semibold">Net Pay: {salary.netAmount.toFixed(2)}</p></div></PrintPreview></div>;
}

