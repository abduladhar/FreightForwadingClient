import { useNavigate } from "react-router-dom";
import { AgentCommissionForm } from "@/modules/commissions/AgentCommissionForm";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { lt } from "@/modules/operationsLocalization";

export function AgentCommissionCreatePage() {
  const navigate = useNavigate();
  return <div className="space-y-4"><PageHeader title={lt("Create Agent Commission")} description={lt("Calculate agent commission with currency and exchange support.")} actions={<AuditTrailButton />} /><div className="rounded-lg border bg-white p-4"><AgentCommissionForm onSaved={() => navigate("/commissions")} /></div></div>;
}
