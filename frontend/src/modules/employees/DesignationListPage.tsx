import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, X } from "lucide-react";
import { createDesignation, deleteDesignation, getDesignations, updateDesignation, type DesignationDto } from "@/api/employeeApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/auth/PermissionButton";
import { PermissionGuard } from "@/auth/PermissionGuard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/common/EmptyState";
import { lt } from "@/modules/operationsLocalization";

export function DesignationListPage() {
  const client = useQueryClient();
  const toast = useToast();
  const [designationCode, setCode] = useState("");
  const [designationName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<DesignationDto | null>(null);
  const query = useQuery({ queryKey: ["designations"], queryFn: () => getDesignations(false) });

  const reset = () => {
    setCode("");
    setName("");
    setDescription("");
    setEditing(null);
  };

  const save = useMutation({
    mutationFn: () => editing
      ? updateDesignation(editing.id, { designationCode, designationName, description, isActive: editing.isActive })
      : createDesignation({ designationCode, designationName, description, isActive: true }),
    onSuccess: async () => {
      const wasEditing = Boolean(editing);
      reset();
      await client.invalidateQueries({ queryKey: ["designations"] });
      toast.success(wasEditing ? lt("Designation updated") : lt("Designation created"));
    }
  });
  const remove = useMutation({
    mutationFn: deleteDesignation,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["designations"] });
      toast.success(lt("Designation deleted"));
    }
  });

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Designations")} description={lt("Reusable employee designation master.")} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-[180px_1fr_1fr_auto]">
          <Field label={lt("Code")}><Input value={designationCode} onChange={(event) => setCode(event.target.value)} /></Field>
          <Field label={lt("Designation")}><Input value={designationName} onChange={(event) => setName(event.target.value)} /></Field>
          <Field label={lt("Description")}><Input value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
          <div className="flex items-end gap-2">
            <PermissionButton permission={editing ? "Designation.Update" : "Designation.Create"} disabled={!designationCode.trim() || !designationName.trim() || save.isPending} onClick={() => save.mutate()}>
              {editing ? lt("Update Designation") : lt("Add Designation")}
            </PermissionButton>
            {editing ? <Button variant="outline" onClick={reset}><X className="h-4 w-4" />{lt("Cancel")}</Button> : null}
          </div>
        </CardContent>
      </Card>
      {(query.data ?? []).length ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:hidden">
            {(query.data ?? []).map((designation) => (
              <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900" key={designation.id}>
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{designation.designationCode}</p>
                    <h2 className="mt-1 break-words text-base font-semibold text-gray-900 dark:text-gray-100">{designation.designationName}</h2>
                  </div>
                  <StatusBadge status={designation.isActive ? "Active" : "Inactive"} />
                </div>
                <div className="flex flex-1 flex-col gap-1 border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{lt("Description")}</p>
                  <p className="break-words text-sm font-semibold text-gray-900 dark:text-gray-100">{designation.description || lt("No description")}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 [&_button]:min-h-10 [&_button]:rounded-lg [&_button]:border [&_button]:border-gray-300 [&_button]:px-3 [&_button]:py-2 dark:[&_button]:border-gray-700">
                  <DesignationActions designation={designation} onEdit={() => {
                    setEditing(designation);
                    setCode(designation.designationCode);
                    setName(designation.designationName);
                    setDescription(designation.description);
                  }} onDelete={(id) => remove.mutateAsync(id)} />
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr className="border-b text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="px-3 py-3 text-left">{lt("Code")}</th>
                  <th className="px-3 py-3 text-left">{lt("Designation")}</th>
                  <th className="px-3 py-3 text-left">{lt("Description")}</th>
                  <th className="px-3 py-3 text-center">{lt("Active")}</th>
                  <th className="px-3 py-3 text-right">{lt("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {(query.data ?? []).map((designation) => (
                  <tr key={designation.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60">
                    <td className="px-3 py-3 font-semibold text-gray-900 dark:text-gray-100">{designation.designationCode}</td>
                    <td className="px-3 py-3">{designation.designationName}</td>
                    <td className="px-3 py-3">{designation.description || lt("No description")}</td>
                    <td className="px-3 py-3 text-center"><StatusBadge status={designation.isActive ? "Active" : "Inactive"} /></td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <DesignationActions designation={designation} onEdit={() => {
                          setEditing(designation);
                          setCode(designation.designationCode);
                          setName(designation.designationName);
                          setDescription(designation.description);
                        }} onDelete={(id) => remove.mutateAsync(id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"><EmptyState /></div>}
    </div>
  );
}

function DesignationActions({ designation, onEdit, onDelete }: { designation: DesignationDto; onEdit: () => void; onDelete: (id: string) => Promise<void> }) {
  return (
    <>
      <PermissionButton permission="Designation.Update" size="sm" variant="outline" onClick={onEdit}><Pencil className="h-4 w-4" />{lt("Edit")}</PermissionButton>
      <PermissionGuard permission="Designation.Delete" fallback="hidden">
        <ConfirmDialog title={lt("Delete designation?")} description={`${lt("Delete")} ${designation.designationName}?`} confirmText={lt("Delete")} variant="danger" onConfirm={async () => onDelete(designation.id)}>
          <Button size="sm" variant="outline"><Trash2 className="h-4 w-4 text-red-600" />{lt("Delete")}</Button>
        </ConfirmDialog>
      </PermissionGuard>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
