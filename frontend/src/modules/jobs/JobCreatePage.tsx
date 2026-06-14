import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createJob, type JobRequest } from "@/api/jobApi";
import { JobForm } from "./JobForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function JobCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: createJob, onSuccess: async (job) => { await queryClient.invalidateQueries({ queryKey: ["jobs"] }); toast.success(lt("Job created"), job?.jobNumber); navigate("/customs/jobs"); } });
  return <div className="space-y-4"><PageHeader title={lt("Create Job")} description={lt("Create a job and generate the job number automatically.")} /><Card><CardContent className="pt-6"><JobForm isSubmitting={mutation.isPending} onSubmit={async (value: JobRequest) => { await mutation.mutateAsync(value); }} /></CardContent></Card></div>;
}
