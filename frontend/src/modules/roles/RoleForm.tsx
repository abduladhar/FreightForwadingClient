import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoleDto } from "@/api/roleApi";
import { createRoleSchema, editRoleSchema, type CreateRoleFormValues, type EditRoleFormValues } from "@/modules/roles/roleValidation";
import { lt } from "@/modules/operationsLocalization";

export function RoleForm({
  mode,
  initialValue,
  isSubmitting,
  onSubmit
}: {
  mode: "create" | "edit";
  initialValue?: RoleDto | null;
  isSubmitting?: boolean;
  onSubmit: (values: CreateRoleFormValues | EditRoleFormValues) => Promise<unknown>;
}) {
  const form = useForm<CreateRoleFormValues | EditRoleFormValues>({
    resolver: zodResolver(mode === "create" ? createRoleSchema : editRoleSchema),
    defaultValues: {
      name: initialValue?.name ?? "",
      description: initialValue?.description ?? "",
      ...(mode === "edit" ? { isSystemRole: initialValue?.isSystemRole ?? false } : {})
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <Field label={lt("Role Name")} error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
      <Field label={lt("Description")} error={form.formState.errors.description?.message as string | undefined}><Input {...form.register("description")} /></Field>
      {mode === "edit" ? (
        <label className="md:col-span-2 flex items-center gap-2 text-sm">
          <input type="checkbox" {...(form.register as (name: "isSystemRole") => Record<string, unknown>)("isSystemRole")} />
          {lt("System Role")}
        </label>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>{isSubmitting || form.formState.isSubmitting ? lt("Saving...") : lt("Save Role")}</Button>
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
