import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getJobTypeByGuid, updateJobType, type JobTypeRequest } from "@/api/jobApi";
import { JobTypeForm } from "./JobTypeForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function JobTypeEditPage() {
  const m = useMasterDataI18n("JobType");
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const query = useQuery({ queryKey: ["job-type", id], queryFn: () => getJobTypeByGuid(id!), enabled: Boolean(id) });
  const mutation = useMutation({ mutationFn: (value: JobTypeRequest) => updateJobType(id!, value), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["job-types"] }); toast.success("Job type updated"); navigate("/job-types"); } });
  if (!id) return <Navigate to="/job-types" replace />;
  const initialValue = query.data ? { jobTypeCode: query.data.jobTypeCode, jobTypeShortCode: query.data.jobTypeShortCode, jobTypeName: query.data.jobTypeName, description: query.data.description ?? "", isActive: query.data.isActive } : null;
  return <div className="space-y-4"><PageHeader title={m("Edit Job Type")} description={m("Update job type and numbering short code.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}>{initialValue ? <JobTypeForm initialValue={initialValue} isSubmitting={mutation.isPending} onSubmit={async (value) => { await mutation.mutateAsync(value); }} /> : <p className="text-sm text-muted-foreground">{m("Loading Job Type")}</p>}</CardContent></Card></div>;
}
