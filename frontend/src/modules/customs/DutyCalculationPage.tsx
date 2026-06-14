import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { addCustomsJobAssessment, previewCustomsJobDuty, type CustomsDutyPreviewDto } from "@/api/customsApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function DutyCalculationPage() {
  const { customsId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [assessableValue, setAssessableValue] = useState(0);
  const [dutyRate, setDutyRate] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [otherChargesAmount, setOtherChargesAmount] = useState(0);
  const [preview, setPreview] = useState<CustomsDutyPreviewDto | null>(null);
  const payload = { assessableValue, dutyRate, taxRate, penaltyAmount, otherChargesAmount };
  const previewMutation = useMutation({ mutationFn: () => previewCustomsJobDuty(payload) });
  const applyMutation = useMutation({ mutationFn: () => addCustomsJobAssessment(customsId!, { assessableValue, dutyAmount: preview?.dutyAmount ?? 0, taxAmount: preview?.taxAmount ?? 0, penaltyAmount, otherChargesAmount, assessmentReference: `ASM-${Date.now()}`, assessmentDate: new Date().toISOString() }) });
  return <div className="space-y-4">
    <PageHeader title={lt("Customs Duty Calculation")} description={lt("Preview and save duty/tax assessment for the customs job.")} />
    <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-6">
      <Input type="number" min="0" value={assessableValue} onChange={(e) => setAssessableValue(Math.max(0, Number(e.target.value)))} placeholder={lt("Assessable Value")} />
      <Input type="number" min="0" value={dutyRate} onChange={(e) => setDutyRate(Math.max(0, Number(e.target.value)))} placeholder={lt("Duty Rate %")} />
      <Input type="number" min="0" value={taxRate} onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value)))} placeholder={lt("Tax Rate %")} />
      <Input type="number" min="0" value={penaltyAmount} onChange={(e) => setPenaltyAmount(Math.max(0, Number(e.target.value)))} placeholder={lt("Penalty")} />
      <Input type="number" min="0" value={otherChargesAmount} onChange={(e) => setOtherChargesAmount(Math.max(0, Number(e.target.value)))} placeholder={lt("Other Charges")} />
      <PermissionButton permission="CustomsClearance.Read" onClick={() => void previewMutation.mutateAsync().then(setPreview)}>{lt("Preview")}</PermissionButton>
    </div>
    {preview ? <div className="rounded-lg border bg-white p-4 text-sm">
      {lt("Duty")}: {preview.dutyAmount.toFixed(2)} | {lt("Tax")}: {preview.taxAmount.toFixed(2)} | {lt("Total Payable")}: {preview.totalPayableAmount.toFixed(2)}
    </div> : null}
    {customsId && preview ? <PermissionButton permission="CustomsClearance.Update" onClick={() => void applyMutation.mutateAsync().then(() => { toast.success(lt("Assessment saved"), lt("Customs duty assessment saved.")); navigate(`/customs/${customsId}`); })}>{lt("Save Assessment")}</PermissionButton> : null}
  </div>;
}
