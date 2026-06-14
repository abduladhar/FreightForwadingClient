import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getJobByGuid, updateJob, type JobRequest } from "@/api/jobApi";
import { JobForm } from "./JobForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function JobEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const query = useQuery({ queryKey: ["job", id], queryFn: () => getJobByGuid(id!), enabled: Boolean(id) });
  const mutation = useMutation({ mutationFn: (value: JobRequest) => updateJob(id!, value), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["jobs"] }); toast.success(lt("Job updated")); navigate("/customs/jobs"); } });
  if (!id) return <Navigate to="/customs/jobs" replace />;
  const initialValue = query.data ? { jobTypeId: query.data.jobTypeId, description: query.data.description, isActive: query.data.isActive } : null;
  return <div className="space-y-4"><PageHeader title={lt("Edit Job")} description={lt("Update job type, description, and status.")} /><Card><CardContent className="pt-6">{initialValue ? <JobForm initialValue={initialValue} jobNumber={query.data?.jobNumber} isSubmitting={mutation.isPending} onSubmit={async (value) => { await mutation.mutateAsync(value); }} /> : <p className="text-sm text-muted-foreground">{lt("Loading job...")}</p>}</CardContent></Card></div>;
}
