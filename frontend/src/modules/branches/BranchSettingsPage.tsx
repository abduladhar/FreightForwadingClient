import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getBranchById, getBranchSettings, updateBranchSettings } from "@/api/branchApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { branchSettingsSchema, type BranchSettingsFormValues } from "@/modules/branches/branchValidation";
import { lt } from "@/modules/operationsLocalization";
import { BranchBankDetailsPanel } from "@/modules/branches/BranchBankDetailsPanel";

export function BranchSettingsPage() {
  const { branchId } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["branch-settings", branchId], queryFn: () => getBranchSettings(branchId!), enabled: Boolean(branchId) });
  const branch = useQuery({ queryKey: ["branch", branchId], queryFn: () => getBranchById(branchId!), enabled: Boolean(branchId) });
  const form = useForm<BranchSettingsFormValues>({
    resolver: zodResolver(branchSettingsSchema),
    values: query.data
      ? {
          localTimeZone: query.data.localTimeZone ?? "",
          workingDays: query.data.workingDays ?? "",
          openingTime: query.data.openingTime ?? "",
          closingTime: query.data.closingTime ?? "",
          configurationJson: query.data.configurationJson ?? ""
        }
      : undefined
  });
  const mutation = useMutation({
    mutationFn: (values: BranchSettingsFormValues) =>
      updateBranchSettings(branchId!, {
        ...values,
        localTimeZone: values.localTimeZone || null,
        workingDays: values.workingDays || null,
        openingTime: values.openingTime || null,
        closingTime: values.closingTime || null,
        configurationJson: values.configurationJson || null
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branch-settings", branchId] });
      toast.success(lt("Branch settings updated"));
    }
  });
  if (!branchId) return <Navigate to="/branches" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Branch Settings")} description={lt("Working schedule and branch-specific preferences.")} />
      <Card><CardContent className="pt-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
          <Field label={lt("Local Time Zone")} error={form.formState.errors.localTimeZone?.message}><Input {...form.register("localTimeZone")} /></Field>
          <Field label={lt("Working Days")} error={form.formState.errors.workingDays?.message}><Input {...form.register("workingDays")} /></Field>
          <Field label={lt("Opening Time")} error={form.formState.errors.openingTime?.message}><Input {...form.register("openingTime")} placeholder="08:30" /></Field>
          <Field label={lt("Closing Time")} error={form.formState.errors.closingTime?.message}><Input {...form.register("closingTime")} placeholder="18:30" /></Field>
          <div className="md:col-span-2">
            <Label>{lt("Configuration JSON")}</Label>
            <textarea className="mt-1 min-h-28 w-full rounded-md border px-3 py-2 text-sm" {...form.register("configurationJson")} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? lt("Saving...") : lt("Save Settings")}</Button>
          </div>
        </form>
      </CardContent></Card>
      <BranchBankDetailsPanel branchId={branchId} branchName={branch.data?.branchName ?? lt("Branch")} />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
