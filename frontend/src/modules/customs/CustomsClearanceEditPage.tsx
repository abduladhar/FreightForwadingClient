import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getCustomsJob, updateCustomsJob, type CustomsClearanceJobRequest } from "@/api/customsApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { RefreshCw } from "lucide-react";
import { buildCustomsJobInitialValue, CustomsJobForm } from "./CustomsJobForm";
import { lt } from "@/modules/operationsLocalization";

export function CustomsClearanceEditPage() {
  const { customsId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["customs-job", customsId], queryFn: () => getCustomsJob(customsId!), enabled: Boolean(customsId) });
  const [value, setValue] = useState<CustomsClearanceJobRequest | null>(null);
  const mutation = useMutation({ mutationFn: (payload: CustomsClearanceJobRequest) => updateCustomsJob(customsId!, payload) });
  useEffect(() => { if (query.data) setValue(buildCustomsJobInitialValue(query.data)); }, [query.data]);
  if (!customsId) return <Navigate to="/customs" replace />;
  if (!value) return <div className="p-4 text-sm text-muted-foreground">{lt("Loading customs job...")}</div>;
  return <div className="space-y-4">
    <PageHeader title={`Edit ${query.data?.jobNumber ?? "Customs Job"}`} description={lt("Update customs job and declaration details.")} actions={<><Button variant="outline" onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button><AuditTrailButton /></>} />
    <CustomsJobForm value={value} onChange={setValue} submitPermission="CustomsClearance.Update" submitLabel={lt("Update Customs Job")} isSubmitting={mutation.isPending} onSubmit={() => void mutation.mutateAsync(value).then(() => { toast.success(lt("Updated"), lt("Customs clearance job updated.")); navigate(`/customs/${customsId}`); })} />
  </div>;
}
