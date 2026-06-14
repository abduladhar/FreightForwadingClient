import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveJobTypesForDropdown, type JobRequest } from "@/api/jobApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lt } from "@/modules/operationsLocalization";

export function JobForm({ initialValue, jobNumber, isSubmitting, onSubmit }: { initialValue?: JobRequest | null; jobNumber?: string | null; isSubmitting?: boolean; onSubmit: (value: JobRequest) => Promise<void> }) {
  const [value, setValue] = useState<JobRequest>(initialValue ?? { jobTypeId: "", description: "", isActive: true });
  const jobTypes = useQuery({ queryKey: ["job-types", "active-dropdown"], queryFn: () => getActiveJobTypesForDropdown() });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobNumber ? <Field label={lt("Job Number")}><Input value={jobNumber} readOnly className="bg-muted" /></Field> : null}
      <Field label={lt("Job Type")}>
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={value.jobTypeId} onChange={(event) => setValue({ ...value, jobTypeId: event.target.value })}>
          <option value="">{lt("Select job type")}</option>
          {(jobTypes.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.jobTypeCode} - {x.jobTypeName}</option>)}
        </select>
      </Field>
      <div className="space-y-1 md:col-span-2">
        <Label>{lt("Description")}</Label>
        <Textarea value={value.description ?? ""} onChange={(event) => setValue({ ...value, description: event.target.value })} placeholder={lt("Job description")} />
      </div>
      <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} /> {lt("Active")}</label>
      <div className="md:col-span-2"><Button onClick={() => void onSubmit(value)} disabled={isSubmitting || !value.jobTypeId}>{isSubmitting ? lt("Saving...") : lt("Save Job")}</Button></div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
