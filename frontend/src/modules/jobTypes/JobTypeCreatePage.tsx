import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createJobType, type JobTypeRequest } from "@/api/jobApi";
import { JobTypeForm } from "./JobTypeForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function JobTypeCreatePage() {
  const m = useMasterDataI18n("JobType");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: createJobType, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["job-types"] }); toast.success("Job type created"); navigate("/job-types"); } });
  return <div className="space-y-4"><PageHeader title={m("Create Job Type")} description={m("Create a job type with short code used for job number generation.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><JobTypeForm isSubmitting={mutation.isPending} onSubmit={async (value: JobTypeRequest) => { await mutation.mutateAsync(value); }} /></CardContent></Card></div>;
}
