import { useNavigate } from "react-router-dom";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { SalaryForm } from "@/modules/salary/SalaryForm";

export function SalaryCreatePage() {
  const navigate = useNavigate();
  return <div className="space-y-4"><PageHeader title="Create Salary" description="Calculate salary and incentive with ledger posting preview." actions={<AuditTrailButton />} /><div className="rounded-lg border bg-white p-4"><SalaryForm onSaved={() => navigate("/salary")} /></div></div>;
}

