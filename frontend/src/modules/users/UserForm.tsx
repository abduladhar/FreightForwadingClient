import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { BranchOption } from "@/types/branch";
import { createUserSchema, editUserSchema, type CreateUserFormValues, type EditUserFormValues } from "@/modules/users/userValidation";
import type { UserDto } from "@/api/userApi";
import { getEmployees } from "@/api/employeeApi";
import { useQuery } from "@tanstack/react-query";
import { lt } from "@/modules/operationsLocalization";

export function UserForm({
  mode,
  initialValue,
  branchOptions,
  isSubmitting,
  onSubmit
}: {
  mode: "create" | "edit";
  initialValue?: UserDto | null;
  branchOptions: BranchOption[];
  isSubmitting?: boolean;
  onSubmit: (values: CreateUserFormValues | EditUserFormValues) => Promise<unknown>;
}) {
  const employees = useQuery({ queryKey: ["employees", "active"], queryFn: () => getEmployees(true, false) });
  const form = useForm<CreateUserFormValues | EditUserFormValues>({
    resolver: zodResolver(mode === "create" ? createUserSchema : editUserSchema),
    defaultValues: {
      email: initialValue?.email ?? "",
      userName: initialValue?.userName ?? "",
      firstName: initialValue?.firstName ?? "",
      lastName: initialValue?.lastName ?? "",
      branchId: initialValue?.branchId ?? "",
      employeeId: initialValue?.employeeId ?? "",
      isActive: initialValue?.isActive ?? true,
      ...(mode === "create" ? { password: "" } : {})
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <Field label={lt("Email")} error={form.formState.errors.email?.message}><Input {...form.register("email")} /></Field>
      <Field label={lt("Username")} error={form.formState.errors.userName?.message}><Input {...form.register("userName")} /></Field>
      <Field label={lt("First Name")} error={form.formState.errors.firstName?.message}><Input {...form.register("firstName")} /></Field>
      <Field label={lt("Last Name")} error={form.formState.errors.lastName?.message}><Input {...form.register("lastName")} /></Field>
      <Field label={lt("Branch")} error={form.formState.errors.branchId?.message as string | undefined}>
        <select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("branchId")}>
          <option value="">{lt("Tenant Scope")}</option>
          {branchOptions.map((branch) => (
            <option key={branch.id} value={branch.id}>{branch.code} - {branch.name}</option>
          ))}
        </select>
      </Field>
      <Field label={lt("Employee (optional)")} error={form.formState.errors.employeeId?.message as string | undefined}>
        <select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("employeeId")}>
          <option value="">{lt("No employee link")}</option>
          {(employees.data ?? []).map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode} - {employee.fullName}</option>)}
        </select>
      </Field>
      {mode === "create" ? <Field label={lt("Password")} error={(form.formState.errors as { password?: { message?: string } }).password?.message}><Input type="password" {...(form.register as (name: "password") => Record<string, unknown>)("password")} /></Field> : null}
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isActive")} />
        {lt("Active User")}
      </label>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>{isSubmitting || form.formState.isSubmitting ? lt("Saving...") : lt("Save User")}</Button>
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
