import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Pencil, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  createCustomsJobChild,
  deleteCustomsJobChild,
  updateCustomsJobChild,
  type CustomsChildRequest,
  type CustomsChildType
} from "@/api/customsApi";
import { lt } from "@/modules/operationsLocalization";
import { PermissionButton } from "@/auth/PermissionButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export type CustomsCrudField = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime-local" | "checkbox" | "textarea" | "select";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  step?: number;
  span?: 1 | 2 | 4;
};

type Props = {
  jobId: string;
  childType: CustomsChildType;
  title: string;
  rows: Array<Record<string, unknown>>;
  fields: CustomsCrudField[];
  columns: string[];
  emptyValue: Record<string, unknown>;
  locked: boolean;
  onRefresh: () => void;
  rowExpansion?: (row: Record<string, unknown>) => ReactNode;
  rowExpansionLabel?: string;
};

export function CustomsChildCrudTab({
  jobId,
  childType,
  title,
  rows,
  fields,
  columns,
  emptyValue,
  locked,
  onRefresh,
  rowExpansion,
  rowExpansionLabel = "Details"
}: Props) {
  const toast = useToast();
  const [value, setValue] = useState<Record<string, unknown>>(() => ({ ...emptyValue }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const saveMutation = useMutation({
    mutationFn: () => editingId
      ? updateCustomsJobChild(jobId, childType, editingId, value as unknown as CustomsChildRequest)
      : createCustomsJobChild(jobId, childType, value as unknown as CustomsChildRequest)
  });
  const deleteMutation = useMutation({
    mutationFn: (childId: string) => deleteCustomsJobChild(jobId, childType, childId)
  });
  const isValid = useMemo(
    () => fields.filter((field) => field.required).every((field) => hasValue(value[field.key])),
    [fields, value]
  );

  useEffect(() => {
    setValue({ ...emptyValue });
    setEditingId(null);
  }, [childType]);

  function reset() {
    setValue({ ...emptyValue });
    setEditingId(null);
  }

  function edit(row: Record<string, unknown>) {
    const next = { ...emptyValue };
    for (const field of fields) next[field.key] = toEditorValue(row[field.key], field.type);
    setValue(next);
    setEditingId(String(row.id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    await saveMutation.mutateAsync();
    toast.success(editingId ? `${title} ${lt("updated")}` : `${title} ${lt("added")}`, lt("The customs record was saved."));
    reset();
    onRefresh();
  }

  async function remove(childId: string) {
    await deleteMutation.mutateAsync(childId);
    toast.success(`${title} ${lt("deleted")}`, lt("The customs record was removed."));
    if (editingId === childId) reset();
    onRefresh();
  }

  return <div className="space-y-4">
    {!locked ? <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{editingId ? `${lt("Update")} ${title}` : `${lt("Add")} ${title}`}</h3>
            <p className="text-xs text-muted-foreground">{lt("Operation")}: {editingId ? lt("Update") : lt("New")}</p>
          </div>
          {editingId ? <Button type="button" variant="outline" size="sm" onClick={reset}><RotateCcw className="h-4 w-4" />{lt("Cancel edit")}</Button> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {fields.map((field) => <div key={field.key} className={spanClass(field.span)}>
            <CustomsEditorField
              field={field}
              value={value[field.key]}
              onChange={(next) => setValue((current) => ({ ...current, [field.key]: next }))}
            />
          </div>)}
          <div className="flex items-end md:col-span-4">
            <PermissionButton
              permission="CustomsClearance.Update"
              disabled={!isValid || saveMutation.isPending}
              onClick={() => void save()}
            >
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saveMutation.isPending ? lt("Saving...") : editingId ? `${lt("Update")} ${title}` : `${lt("Add")} ${title}`}
            </PermissionButton>
          </div>
        </div>
      </CardContent>
    </Card> : null}

    <Card>
      <CardContent className="overflow-auto pt-6">
        <table className="min-w-full text-sm">
          <thead><tr>
            {rowExpansion ? <th className="w-10 border-b bg-slate-50 px-3 py-2" /> : null}
            {columns.map((column) => <th key={column} className="whitespace-nowrap border-b bg-slate-50 px-3 py-2 text-left font-semibold">{labelFor(column, fields)}</th>)}
            <th className="border-b bg-slate-50 px-3 py-2 text-center font-semibold">{lt("Action")}</th>
          </tr></thead>
          <tbody>
            {rows.length ? rows.map((row, index) => {
              const id = String(row.id ?? index);
              const isExpanded = expandedId === id;
              return <FragmentRow key={id}>
                <tr>
                  {rowExpansion ? <td className="border-b px-3 py-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : id)} title={rowExpansionLabel}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </td> : null}
                  {columns.map((column) => <td key={column} className="max-w-xs whitespace-pre-wrap border-b px-3 py-2 align-top">{displayValue(row[column])}</td>)}
                  <td className="border-b px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {rowExpansion ? <Button type="button" variant="outline" size="sm" onClick={() => setExpandedId(isExpanded ? null : id)}>{rowExpansionLabel}</Button> : null}
                      {!locked ? <>
                        <PermissionButton permission="CustomsClearance.Update" variant="ghost" size="sm" onClick={() => edit(row)}><Pencil className="h-4 w-4" />{lt("Edit")}</PermissionButton>
                        <ConfirmDialog
                          title={`${lt("Delete")} ${title}?`}
                          description={lt("This record will be soft deleted and removed from the customs job.")}
                          confirmText={lt("Delete")}
                          variant="danger"
                          onConfirm={() => remove(id)}
                        >
                          <PermissionButton permission="CustomsClearance.Delete" variant="ghost" size="sm" disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" />{lt("Delete")}</PermissionButton>
                        </ConfirmDialog>
                      </> : null}
                    </div>
                  </td>
                </tr>
                {rowExpansion && isExpanded ? <tr>
                  <td colSpan={columns.length + 2} className="border-b bg-slate-50 px-3 py-4">{rowExpansion(row)}</td>
                </tr> : null}
              </FragmentRow>;
            }) : <tr><td colSpan={columns.length + (rowExpansion ? 2 : 1)} className="px-3 py-8 text-center text-muted-foreground">{lt("No records yet.")}</td></tr>}
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>;
}

function FragmentRow({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function CustomsEditorField({ field, value, onChange }: { field: CustomsCrudField; value: unknown; onChange: (value: unknown) => void }) {
  if (field.type === "checkbox") {
    return <div className="space-y-1">
      <Label className="invisible text-xs uppercase text-slate-600">{lt(field.label)}</Label>
      <label className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        <span>{lt(field.label)}</span>
      </label>
    </div>;
  }

  return <div className="space-y-1">
    <Label className="text-xs uppercase text-slate-600">{lt(field.label)}{field.required ? " *" : ""}</Label>
    {field.type === "textarea"
      ? <Textarea rows={3} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
      : field.type === "select"
        ? <select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
          <option value="">{lt("Select")} {lt(field.label)}</option>
          {(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{lt(option.label)}</option>)}
        </select>
        : <Input
          type={field.type ?? "text"}
          min={field.min}
          step={field.step}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.type === "number" ? numberValue(event.target.value) : event.target.value)}
        />}
  </div>;
}

function numberValue(value: string) {
  return value === "" ? 0 : Number(value);
}

function toEditorValue(value: unknown, type: CustomsCrudField["type"]) {
  if (value == null) return type === "number" ? 0 : type === "checkbox" ? false : "";
  if ((type === "date" || type === "datetime-local") && typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString();
      return type === "date" ? local.slice(0, 10) : local.slice(0, 16);
    }
  }
  return value;
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function displayValue(value: unknown) {
  if (typeof value === "boolean") return value ? lt("Yes") : lt("No");
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function labelFor(key: string, fields: CustomsCrudField[]) {
  return lt(fields.find((field) => field.key === key)?.label ?? key.replace(/([A-Z])/g, " $1").trim());
}

function spanClass(span: CustomsCrudField["span"]) {
  if (span === 4) return "md:col-span-4";
  if (span === 2) return "md:col-span-2";
  return "";
}
