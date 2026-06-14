import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { tenantSchema, type TenantFormValues } from "@/modules/tenants/tenantValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tenant } from "@/types/tenant";
import { lt } from "@/modules/operationsLocalization";

export function TenantForm({
  initialValue,
  isSubmitting,
  onSubmit
}: {
  initialValue?: Tenant | null;
  isSubmitting?: boolean;
  onSubmit: (value: TenantFormValues) => Promise<void>;
}) {
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      tenantCode: initialValue?.tenantCode ?? "",
      tenantName: initialValue?.tenantName ?? "",
      legalName: initialValue?.legalName ?? "",
      email: initialValue?.email ?? "",
      phone: initialValue?.phone ?? "",
      address: initialValue?.address ?? "",
      country: initialValue?.country ?? "",
      city: initialValue?.city ?? "",
      taxNumber: initialValue?.taxNumber ?? "",
      baseCurrencyId: initialValue?.baseCurrencyId ?? "",
      defaultLanguageId: initialValue?.defaultLanguageId ?? "",
      financialYearStartMonth: initialValue?.financialYearStartMonth ?? 1,
      logoUrl: initialValue?.logoUrl ?? "",
      isActive: initialValue?.isActive ?? true
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <Field label={lt("Tenant Code")} error={form.formState.errors.tenantCode?.message}><Input {...form.register("tenantCode")} /></Field>
      <Field label={lt("Tenant Name")} error={form.formState.errors.tenantName?.message}><Input {...form.register("tenantName")} /></Field>
      <Field label={lt("Legal Name")} error={form.formState.errors.legalName?.message}><Input {...form.register("legalName")} /></Field>
      <Field label={lt("Email")} error={form.formState.errors.email?.message}><Input {...form.register("email")} /></Field>
      <Field label={lt("Phone")} error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
      <Field label={lt("Tax Number")} error={form.formState.errors.taxNumber?.message}><Input {...form.register("taxNumber")} /></Field>
      <Field label={lt("Country")} error={form.formState.errors.country?.message}><Input {...form.register("country")} /></Field>
      <Field label={lt("City")} error={form.formState.errors.city?.message}><Input {...form.register("city")} /></Field>
      <Field label={lt("Base Currency Id (GUID)")} error={form.formState.errors.baseCurrencyId?.message}><Input {...form.register("baseCurrencyId")} /></Field>
      <Field label={lt("Default Language Id (GUID)")} error={form.formState.errors.defaultLanguageId?.message}><Input {...form.register("defaultLanguageId")} /></Field>
      <Field label={lt("Financial Year Start Month")} error={form.formState.errors.financialYearStartMonth?.message}><Input type="number" min={1} max={12} {...form.register("financialYearStartMonth", { valueAsNumber: true })} /></Field>
      <Field label={lt("Logo URL")} error={form.formState.errors.logoUrl?.message}><Input {...form.register("logoUrl")} /></Field>
      <div className="md:col-span-2">
        <Label>{lt("Address")}</Label>
        <textarea className="mt-1 min-h-20 w-full rounded-md border px-3 py-2 text-sm" {...form.register("address")} />
      </div>
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isActive")} />
        {lt("Active")}
      </label>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>{isSubmitting || form.formState.isSubmitting ? lt("Saving...") : lt("Save Tenant")}</Button>
      </div>
    </form>
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
