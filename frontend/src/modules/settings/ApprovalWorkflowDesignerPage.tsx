import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getRoles } from "@/api/roleApi";
import { getErpUiSettings, saveApprovalWorkflows, type ApprovalWorkflowLevel, type ApprovalWorkflowSetting } from "@/api/settingsApi";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

const defaultWorkflow: ApprovalWorkflowSetting = {
  id: "",
  name: "",
  moduleName: "",
  currencyCode: "USD",
  approvalMode: "MultiLevel",
  remarksRequired: true,
  rejectionReasonRequired: true,
  isActive: true,
  levels: [
    {
      id: "",
      sequence: 1,
      roleId: "",
      roleName: "",
      minAmount: 0,
      maxAmount: null,
      requiresAllApprovers: false
    }
  ]
};

export function ApprovalWorkflowDesignerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get("id");
  const { session } = useAuth();
  const tenantId = session?.tenantId;
  const settingsQuery = useQuery({
    queryKey: ["approval-workflow-designer", tenantId],
    queryFn: () => getErpUiSettings(tenantId!),
    enabled: Boolean(tenantId)
  });
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const [draft, setDraft] = useState<ApprovalWorkflowSetting>(defaultWorkflow);
  const save = useMutation({
    mutationFn: (nextRows: ApprovalWorkflowSetting[]) => saveApprovalWorkflows(tenantId!, nextRows),
    onSuccess: () => navigate("/settings/approval-workflows")
  });

  const existing = useMemo(
    () => settingsQuery.data?.bundle.approvalWorkflows.find((item) => item.id === workflowId) ?? null,
    [settingsQuery.data?.bundle.approvalWorkflows, workflowId]
  );

  useEffect(() => {
    if (existing) {
      setDraft(existing);
      return;
    }
    setDraft((current) => (workflowId ? current : { ...defaultWorkflow, id: generateId(), levels: [{ ...defaultWorkflow.levels[0], id: generateId() }] }));
  }, [existing, workflowId]);

  if (!tenantId) return <div className="rounded-md border bg-yellow-50 p-4 text-sm text-yellow-800">{lt("Tenant context is required to design approval workflows.")}</div>;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Approval Workflow Designer")} description={lt("Build role-based and amount-based approval pipelines with optional remarks/rejection rules.")} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={lt("Workflow Name")}><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
            <Field label={lt("Module Name")}><Input value={draft.moduleName} onChange={(event) => setDraft({ ...draft, moduleName: event.target.value })} placeholder={lt("Invoice, VendorBill, Payment...")} /></Field>
            <Field label={lt("Approval Mode")}>
              <select className="h-10 w-full rounded-md border px-3 text-sm" value={draft.approvalMode} onChange={(event) => setDraft({ ...draft, approvalMode: event.target.value as ApprovalWorkflowSetting["approvalMode"] })}>
                <option value="SingleLevel">{lt("Single-Level Approval")}</option>
                <option value="MultiLevel">{lt("Multi-Level Approval")}</option>
              </select>
            </Field>
            <Field label={lt("Currency")}><Input value={draft.currencyCode ?? ""} onChange={(event) => setDraft({ ...draft, currencyCode: event.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.remarksRequired} onChange={(event) => setDraft({ ...draft, remarksRequired: event.target.checked })} /> {lt("Remarks required")}</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.rejectionReasonRequired} onChange={(event) => setDraft({ ...draft, rejectionReasonRequired: event.target.checked })} /> {lt("Rejection reason required")}</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> {lt("Active workflow")}</label>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{lt("Approval Levels")}</p>
              <Button size="sm" variant="outline" onClick={addLevel}>
                <Plus className="h-4 w-4" /> {lt("Add Level")}
              </Button>
            </div>

            {draft.levels.map((level, index) => (
              <div key={level.id} className="grid gap-3 rounded-md border bg-slate-50 p-3 md:grid-cols-6">
                <Field label={lt("Level")}>
                  <Input type="number" min={1} value={level.sequence} onChange={(event) => updateLevel(index, { sequence: Math.max(1, Number(event.target.value) || 1) })} />
                </Field>
                <Field label={lt("Role")}>
                  <select className="h-10 w-full rounded-md border px-3 text-sm" value={level.roleId} onChange={(event) => {
                    const roleId = event.target.value;
                    const role = (rolesQuery.data ?? []).find((item) => item.id === roleId);
                    updateLevel(index, { roleId, roleName: role?.name ?? "" });
                  }}>
                    <option value="">{lt("Select role")}</option>
                    {(rolesQuery.data ?? []).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={lt("Min Amount")}><Input type="number" min={0} value={level.minAmount ?? 0} onChange={(event) => updateLevel(index, { minAmount: Math.max(0, Number(event.target.value) || 0) })} /></Field>
                <Field label={lt("Max Amount")}><Input type="number" min={0} value={level.maxAmount ?? ""} onChange={(event) => updateLevel(index, { maxAmount: event.target.value ? Math.max(0, Number(event.target.value) || 0) : null })} /></Field>
                <label className="mt-7 flex items-center gap-2 text-sm md:col-span-1"><input type="checkbox" checked={level.requiresAllApprovers} onChange={(event) => updateLevel(index, { requiresAllApprovers: event.target.checked })} /> {lt("All approvers")}</label>
                <div className="mt-7 flex justify-end md:col-span-1">
                  <Button size="sm" variant="ghost" onClick={() => removeLevel(level.id)} disabled={draft.levels.length <= 1}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <PermissionButton permission="Tenant.Update" onClick={() => void saveWorkflow()}>
              {lt("Save Workflow")}
            </PermissionButton>
            <Button variant="outline" onClick={() => setDraft({ ...draft, id: generateId(), name: `${draft.name} Copy`, isActive: false })}>
              {lt("Clone")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function addLevel() {
    const last = draft.levels[draft.levels.length - 1];
    const nextSequence = (last?.sequence ?? 0) + 1;
    setDraft((previous) => ({
      ...previous,
      levels: [...previous.levels, { id: generateId(), sequence: nextSequence, roleId: "", roleName: "", minAmount: 0, maxAmount: null, requiresAllApprovers: false }]
    }));
  }

  function updateLevel(index: number, patch: Partial<ApprovalWorkflowLevel>) {
    setDraft((previous) => ({
      ...previous,
      levels: previous.levels.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    }));
  }

  function removeLevel(levelId: string) {
    setDraft((previous) => {
      const next = previous.levels.filter((item) => item.id !== levelId);
      return { ...previous, levels: next.map((item, index) => ({ ...item, sequence: index + 1 })) };
    });
  }

  async function saveWorkflow() {
    const name = draft.name.trim();
    const moduleName = draft.moduleName.trim();
    if (!name || !moduleName || draft.levels.some((level) => !level.roleId)) return;

    const next = {
      ...draft,
      id: draft.id || generateId(),
      name,
      moduleName,
      levels: draft.levels.map((level, index) => ({ ...level, sequence: index + 1 }))
    };

    const current = settingsQuery.data?.bundle.approvalWorkflows ?? [];
    const withoutCurrent = current.filter((item) => item.id !== next.id);
    await save.mutateAsync([...withoutCurrent, next]);
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}`;
}
