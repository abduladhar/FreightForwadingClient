import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { branchSchema, type BranchFormValues } from "@/modules/branches/branchValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Branch } from "@/types/branch";
import { lt } from "@/modules/operationsLocalization";

export function BranchForm({
  initialValue,
  isSubmitting,
  onSubmit
}: {
  initialValue?: Branch | null;
  isSubmitting?: boolean;
  onSubmit: (value: BranchFormValues) => Promise<void>;
}) {
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      branchCode: initialValue?.branchCode ?? "",
      branchName: initialValue?.branchName ?? "",
      address: initialValue?.address ?? "",
      contactPerson: initialValue?.contactPerson ?? "",
      email: initialValue?.email ?? "",
      phone: initialValue?.phone ?? "",
      country: initialValue?.country ?? "",
      city: initialValue?.city ?? "",
      defaultWarehouseId: initialValue?.defaultWarehouseId ?? "",
      isActive: initialValue?.isActive ?? true
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <Field label={lt("Branch Code")} error={form.formState.errors.branchCode?.message}><Input {...form.register("branchCode")} /></Field>
      <Field label={lt("Branch Name")} error={form.formState.errors.branchName?.message}><Input {...form.register("branchName")} /></Field>
      <Field label={lt("Email")} error={form.formState.errors.email?.message}><Input {...form.register("email")} /></Field>
      <Field label={lt("Contact Person")} error={form.formState.errors.contactPerson?.message}><Input {...form.register("contactPerson")} /></Field>
      <Field label={lt("Phone")} error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
      <Field label={lt("Default Warehouse Id (GUID)")} error={form.formState.errors.defaultWarehouseId?.message}><Input {...form.register("defaultWarehouseId")} /></Field>
      <Field label={lt("Country")} error={form.formState.errors.country?.message}><Input {...form.register("country")} /></Field>
      <Field label={lt("City")} error={form.formState.errors.city?.message}><Input {...form.register("city")} /></Field>
      <div className="md:col-span-2">
        <Label>{lt("Address")}</Label>
        <textarea className="mt-1 min-h-20 w-full rounded-md border px-3 py-2 text-sm" {...form.register("address")} />
      </div>
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isActive")} />
        {lt("Active")}
      </label>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>{isSubmitting || form.formState.isSubmitting ? lt("Saving...") : lt("Save Branch")}</Button>
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
