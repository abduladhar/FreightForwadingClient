import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getDesignations, getEmployees, type EmployeeDto } from "@/api/employeeApi";
import { getBranchOptions } from "@/api/branchApi";
import { employeeSchema, type EmployeeFormValues } from "./employeeValidation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { lt } from "@/modules/operationsLocalization";

export function EmployeeForm({ initialValue, onSubmit, isSubmitting }: { initialValue?: EmployeeDto | null; onSubmit: (value: EmployeeFormValues) => Promise<unknown>; isSubmitting?: boolean }) {
  const branches = useQuery({ queryKey: ["branch-options"], queryFn: getBranchOptions });
  const designations = useQuery({ queryKey: ["designations", "active"], queryFn: () => getDesignations(true) });
  const employees = useQuery({ queryKey: ["employees", "active", "parent-options"], queryFn: () => getEmployees(true, false) });
  const parentOptions = (employees.data ?? []).filter((x) => x.id !== initialValue?.id);
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      branchId: initialValue?.branchId ?? "", designationId: initialValue?.designationId ?? "", parentEmployeeGuid: initialValue?.parentEmployeeGuid ?? "", employeeCode: initialValue?.employeeCode ?? "",
      firstName: initialValue?.firstName ?? "", lastName: initialValue?.lastName ?? "", email: initialValue?.email ?? "", phone: initialValue?.phone ?? "",
      address: initialValue?.address ?? "", joiningDate: initialValue?.joiningDate ?? "", isSalesman: initialValue?.isSalesman ?? false, isActive: initialValue?.isActive ?? true
    }
  });
  return <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
    <Field label={lt("Employee Code")} error={form.formState.errors.employeeCode?.message}><Input {...form.register("employeeCode")} /></Field>
    <Field label={lt("Designation")} error={form.formState.errors.designationId?.message}><select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("designationId")}><option value="">{lt("Select designation")}</option>{(designations.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.designationCode} - {x.designationName}</option>)}</select></Field>
    <Field label={lt("Reports To")}><select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("parentEmployeeGuid")}><option value="">{lt("No parent employee")}</option>{parentOptions.map((x) => <option key={x.id} value={x.id}>{x.employeeCode} - {x.fullName}</option>)}</select></Field>
    <Field label={lt("First Name")} error={form.formState.errors.firstName?.message}><Input {...form.register("firstName")} /></Field>
    <Field label={lt("Last Name")} error={form.formState.errors.lastName?.message}><Input {...form.register("lastName")} /></Field>
    <Field label={lt("Email")} error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} /></Field>
    <Field label={lt("Phone")} error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
    <Field label={lt("Branch")}><select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("branchId")}><option value="">{lt("Tenant scope")}</option>{(branches.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}</select></Field>
    <Field label={lt("Joining Date")}><Input type="date" {...form.register("joiningDate")} /></Field>
    <div className="md:col-span-2 space-y-1"><Label>{lt("Address")}</Label><textarea className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" {...form.register("address")} /></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isSalesman")} /> {lt("Eligible as Salesman")}</label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isActive")} /> {lt("Active Employee")}</label>
    <div className="md:col-span-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? lt("Saving...") : lt("Save Employee")}</Button></div>
  </form>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}{error ? <p className="text-xs text-red-600">{error}</p> : null}</div>; }
