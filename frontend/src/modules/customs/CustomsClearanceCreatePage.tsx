import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createCustomsJob, type CustomsClearanceJobRequest } from "@/api/customsApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { buildCustomsJobInitialValue, CustomsJobForm } from "./CustomsJobForm";
import { lt } from "@/modules/operationsLocalization";

export function CustomsClearanceCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [value, setValue] = useState<CustomsClearanceJobRequest>(buildCustomsJobInitialValue());
  const mutation = useMutation({ mutationFn: createCustomsJob });
  return <div className="space-y-4">
    <PageHeader title={lt("New Customs Clearance Job")} description={lt("Create a job with source shipment, broker, declaration, and routing details.")} actions={<AuditTrailButton />} />
    <CustomsJobForm value={value} onChange={setValue} submitPermission="CustomsClearance.Create" submitLabel={lt("Save Customs Job")} isSubmitting={mutation.isPending} onSubmit={() => void mutation.mutateAsync(value).then((x) => { toast.success(lt("Created"), lt("Customs clearance job created.")); navigate(`/customs/${x.id}`); })} />
  </div>;
}
