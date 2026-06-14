import { useState, type ReactNode } from "react";
import type { JobTypeRequest } from "@/api/jobApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function JobTypeForm({ initialValue, isSubmitting, onSubmit }: { initialValue?: JobTypeRequest | null; isSubmitting?: boolean; onSubmit: (value: JobTypeRequest) => Promise<void> }) {
  const m = useMasterDataI18n("JobType");
  const [value, setValue] = useState<JobTypeRequest>(initialValue ?? { jobTypeCode: "", jobTypeShortCode: "", jobTypeName: "", description: "", isActive: true });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={m("Job Type Code")}><Input value={value.jobTypeCode} onChange={(event) => setValue({ ...value, jobTypeCode: event.target.value })} placeholder={m("IMPORT")} /></Field>
      <Field label={m("Short Code")}><Input value={value.jobTypeShortCode} onChange={(event) => setValue({ ...value, jobTypeShortCode: event.target.value })} placeholder={m("IMP")} /></Field>
      <Field label={m("Job Type Name")}><Input value={value.jobTypeName} onChange={(event) => setValue({ ...value, jobTypeName: event.target.value })} placeholder={m("Import")} /></Field>
      <Field label={m("Description")}><Input value={value.description ?? ""} onChange={(event) => setValue({ ...value, description: event.target.value })} placeholder={m("Optional description")} /></Field>
      <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} /> {m("Active")}</label>
      <div className="md:col-span-2"><Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? m("Saving") : m("Save Job Type")}</Button></div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
