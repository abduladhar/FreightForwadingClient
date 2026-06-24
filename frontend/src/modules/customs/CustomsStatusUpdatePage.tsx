import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { updateCustomsJobStatus } from "@/api/customsApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

const statuses = ["Draft", "Document Pending", "Ready to Submit", "Submitted", "Under Review", "Query Raised", "Inspection", "Duty Assessed", "Duty Paid", "Cleared", "Rejected", "Cancelled"];

export function CustomsStatusUpdatePage() {
  const { customsId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState("Submitted");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const mutation = useMutation({ mutationFn: () => updateCustomsJobStatus(customsId!, status, reason, remarks) });
  const basePath = location.pathname.startsWith("/bill-of-entry") ? "/bill-of-entry" : "/customs";
  if (!customsId) return <Navigate to={basePath} replace />;
  return <div className="space-y-4">
    <PageHeader title={lt("Customs Status Update")} description={lt("Update customs workflow status with reason and remarks.")} />
    <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-4">
      <select className="h-10 rounded-md border px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((x) => <option key={x}>{lt(x)}</option>)}</select>
      <Input value={reason} placeholder={lt("Reason")} onChange={(e) => setReason(e.target.value)} />
      <Input value={remarks} placeholder={lt("Remarks")} onChange={(e) => setRemarks(e.target.value)} />
      <PermissionButton permission={status === "Cancelled" ? "CustomsClearance.Cancel" : "CustomsClearance.Update"} onClick={() => void mutation.mutateAsync().then(() => { toast.success(lt("Updated"), lt("Customs status updated.")); navigate(`${basePath}/${customsId}`); })}>{lt("Update Status")}</PermissionButton>
    </div>
  </div>;
}
