import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getTenantSettings, updateTenantSettings } from "@/api/tenantApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { tenantSettingsSchema, type TenantSettingsFormValues } from "@/modules/tenants/tenantValidation";
import { lt } from "@/modules/operationsLocalization";

export function TenantSettingsPage() {
  const { tenantId } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["tenant-settings", tenantId], queryFn: () => getTenantSettings(tenantId!), enabled: Boolean(tenantId) });
  const form = useForm<TenantSettingsFormValues>({
    resolver: zodResolver(tenantSettingsSchema),
    values: query.data
      ? {
          timeZone: query.data.timeZone,
          dateFormat: query.data.dateFormat,
          numberFormat: query.data.numberFormat,
          defaultTheme: query.data.defaultTheme ?? "",
          enableCustomerPortal: query.data.enableCustomerPortal,
          enableAgentPortal: query.data.enableAgentPortal,
          requireTwoFactorAuthentication: query.data.requireTwoFactorAuthentication,
          awsS3AccessKeyId: query.data.awsS3AccessKeyId ?? "",
          awsS3SecretAccessKey: "",
          awsS3Region: query.data.awsS3Region ?? "",
          configurationJson: query.data.configurationJson ?? ""
        }
      : undefined
  });

  const mutation = useMutation({
    mutationFn: (values: TenantSettingsFormValues) =>
      updateTenantSettings(tenantId!, {
        ...values,
        defaultTheme: values.defaultTheme || null,
        awsS3AccessKeyId: values.awsS3AccessKeyId || null,
        awsS3SecretAccessKey: values.awsS3SecretAccessKey || null,
        awsS3Region: values.awsS3Region || null,
        configurationJson: values.configurationJson || null
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tenant-settings", tenantId] });
      toast.success(lt("Tenant settings updated"));
    }
  });

  if (!tenantId) return <Navigate to="/tenants" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Tenant Settings")} description={lt("Portal, security, and localization preferences.")} />
      <Card><CardContent className="pt-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
          <Field label={lt("Time Zone")} error={form.formState.errors.timeZone?.message}><Input {...form.register("timeZone")} /></Field>
          <Field label={lt("Date Format")} error={form.formState.errors.dateFormat?.message}><Input {...form.register("dateFormat")} /></Field>
          <Field label={lt("Number Format")} error={form.formState.errors.numberFormat?.message}><Input {...form.register("numberFormat")} /></Field>
          <Field label={lt("Default Theme")} error={form.formState.errors.defaultTheme?.message}><Input {...form.register("defaultTheme")} /></Field>
          <Field label={lt("AWS S3 Access Key ID")} error={form.formState.errors.awsS3AccessKeyId?.message}><Input autoComplete="off" {...form.register("awsS3AccessKeyId")} /></Field>
          <Field label={lt("AWS S3 Region")} error={form.formState.errors.awsS3Region?.message}><Input autoComplete="off" placeholder="eu-central-1" {...form.register("awsS3Region")} /></Field>
          <Field label={lt("AWS S3 Secret Access Key")} error={form.formState.errors.awsS3SecretAccessKey?.message}>
            <Input
              autoComplete="new-password"
              type="password"
              placeholder={query.data?.hasAwsS3SecretAccessKey ? lt("Secret key configured. Leave blank to keep existing key.") : undefined}
              {...form.register("awsS3SecretAccessKey")}
            />
          </Field>
          <div className="md:col-span-2 grid gap-2 md:grid-cols-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("enableCustomerPortal")} /> {lt("Enable Customer Portal")}</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("enableAgentPortal")} /> {lt("Enable Agent Portal")}</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("requireTwoFactorAuthentication")} /> {lt("Require 2FA")}</label>
          </div>
          <div className="md:col-span-2">
            <Label>{lt("Configuration JSON")}</Label>
            <textarea className="mt-1 min-h-28 w-full rounded-md border px-3 py-2 text-sm" {...form.register("configurationJson")} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? lt("Saving...") : lt("Save Settings")}</Button>
          </div>
        </form>
      </CardContent></Card>
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
