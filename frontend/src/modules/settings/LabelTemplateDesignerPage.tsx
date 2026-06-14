import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLanguages } from "@/api/languageApi";
import { getErpUiSettings, saveLabelTemplates, type LabelTemplateSetting } from "@/api/settingsApi";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Barcode } from "@/components/common/Barcode";
import { QRCode } from "@/components/common/QRCode";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

const defaultTemplate: LabelTemplateSetting = {
  id: "",
  code: "",
  name: "",
  moduleName: "HouseShipment",
  languageCode: "en",
  destinationCode: "",
  labelWidthMm: 100,
  labelHeightMm: 70,
  includeLogo: true,
  includeBarcode: true,
  includeQrCode: true,
  bodyTemplate: "Shipment: {{shipmentNumber}}\nDestination: {{destination}}\nPieces: {{pieces}}\nWeight: {{weight}}",
  isDefault: false,
  isActive: true
};

export function LabelTemplateDesignerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");
  const { session } = useAuth();
  const tenantId = session?.tenantId;
  const settingsQuery = useQuery({
    queryKey: ["label-template-designer", tenantId],
    queryFn: () => getErpUiSettings(tenantId!),
    enabled: Boolean(tenantId)
  });
  const languages = useQuery({ queryKey: ["languages"], queryFn: getLanguages });
  const [draft, setDraft] = useState<LabelTemplateSetting>(defaultTemplate);
  const save = useMutation({
    mutationFn: (nextRows: LabelTemplateSetting[]) => saveLabelTemplates(tenantId!, nextRows),
    onSuccess: () => navigate("/settings/label-templates")
  });

  const existing = useMemo(
    () => settingsQuery.data?.bundle.labelTemplates.find((item) => item.id === templateId) ?? null,
    [settingsQuery.data?.bundle.labelTemplates, templateId]
  );

  useEffect(() => {
    if (existing) {
      setDraft(existing);
      return;
    }
    setDraft((current) => (templateId ? current : { ...defaultTemplate, id: generateId() }));
  }, [existing, templateId]);

  if (!tenantId) return <div className="rounded-md border bg-yellow-50 p-4 text-sm text-yellow-800">{lt("Tenant context is required to design label templates.")}</div>;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Label Template Designer")} description={lt("Design barcode/QR-ready label templates with destination and language variants.")} actions={<AuditTrailButton />} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="grid gap-4 pt-6">
            <Field label={lt("Template Code")}><Input value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} /></Field>
            <Field label={lt("Template Name")}><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
            <Field label={lt("Module Name")}><Input value={draft.moduleName} onChange={(event) => setDraft({ ...draft, moduleName: event.target.value })} /></Field>
            <Field label={lt("Destination Code")}><Input value={draft.destinationCode ?? ""} onChange={(event) => setDraft({ ...draft, destinationCode: event.target.value })} placeholder={lt("e.g. DXB, LHR, SIN")} /></Field>
            <Field label={lt("Language")}>
              <select className="h-10 w-full rounded-md border px-3 text-sm" value={draft.languageCode} onChange={(event) => setDraft({ ...draft, languageCode: event.target.value })}>
                {(languages.data ?? []).map((language) => (
                  <option key={language.id} value={language.languageCode}>
                    {language.languageCode} - {language.displayName}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={lt("Label Width (mm)")}><Input type="number" min={30} value={draft.labelWidthMm} onChange={(event) => setDraft({ ...draft, labelWidthMm: Math.max(30, Number(event.target.value) || 30) })} /></Field>
              <Field label={lt("Label Height (mm)")}><Input type="number" min={20} value={draft.labelHeightMm} onChange={(event) => setDraft({ ...draft, labelHeightMm: Math.max(20, Number(event.target.value) || 20) })} /></Field>
            </div>
            <Field label={lt("Body Template")}>
              <textarea className="min-h-[150px] w-full rounded-md border px-3 py-2 text-sm" value={draft.bodyTemplate} onChange={(event) => setDraft({ ...draft, bodyTemplate: event.target.value })} />
            </Field>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeLogo} onChange={(event) => setDraft({ ...draft, includeLogo: event.target.checked })} /> {lt("Tenant Logo")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeBarcode} onChange={(event) => setDraft({ ...draft, includeBarcode: event.target.checked })} /> {lt("Barcode")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeQrCode} onChange={(event) => setDraft({ ...draft, includeQrCode: event.target.checked })} /> {lt("QR Code")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isDefault} onChange={(event) => setDraft({ ...draft, isDefault: event.target.checked })} /> {lt("Default Template")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> {lt("Active")}</label>
            </div>
            <div className="flex items-center gap-2">
              <PermissionButton permission="Tenant.Update" onClick={() => void saveTemplate()}>
                {lt("Save Template")}
              </PermissionButton>
              <Button variant="outline" onClick={() => setDraft({ ...draft, id: generateId(), code: `${draft.code}-COPY`, name: `${draft.name} Copy`, isDefault: false })}>
                {lt("Clone")}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm font-medium">{lt("Label Preview")}</p>
            <div className="rounded-md border bg-slate-50 p-3">
              <div className="mx-auto rounded-md border bg-white p-3" style={{ width: `${Math.min(420, draft.labelWidthMm * 3)}px`, minHeight: `${Math.min(320, draft.labelHeightMm * 3)}px` }}>
                {draft.includeLogo ? <div className="mb-2 inline-flex h-7 w-24 items-center justify-center rounded border bg-slate-50 text-xs text-slate-600">{lt("TENANT LOGO")}</div> : null}
                <pre className="whitespace-pre-wrap text-sm">{renderTemplate(draft.bodyTemplate, draft.destinationCode ?? "")}</pre>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {draft.includeBarcode ? <Barcode value="HAWB-000341" height={38} /> : null}
                  {draft.includeQrCode ? <QRCode value="https://freighterp.local/track/HAWB-000341" size={86} /> : null}
                </div>
              </div>
            </div>
            <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
              {lt("Placeholders")}:
              {" "}
              <code>{"{{shipmentNumber}}"}</code>, <code>{"{{destination}}"}</code>, <code>{"{{pieces}}"}</code>, <code>{"{{weight}}"}</code>, <code>{"{{customerName}}"}</code>, <code>{"{{origin}}"}</code>.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  async function saveTemplate() {
    const code = draft.code.trim();
    const name = draft.name.trim();
    const moduleName = draft.moduleName.trim();
    if (!code || !name || !moduleName) return;

    const next = {
      ...draft,
      id: draft.id || generateId(),
      code,
      name,
      moduleName
    };

    const current = settingsQuery.data?.bundle.labelTemplates ?? [];
    const withoutCurrent = current.filter((item) => item.id !== next.id);
    const rows = next.isDefault
      ? withoutCurrent.map((item) => (item.moduleName === next.moduleName && item.destinationCode === next.destinationCode ? { ...item, isDefault: false } : item)).concat(next)
      : withoutCurrent.concat(next);
    await save.mutateAsync(rows);
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

function renderTemplate(template: string, destinationCode: string) {
  const placeholders: Record<string, string> = {
    shipmentNumber: "HAWB-000341",
    destination: destinationCode || "DXB",
    pieces: "12",
    weight: "154.30 kg",
    customerName: "Blue Ocean Exports",
    origin: "BOM"
  };
  return template.replace(/\{\{([A-Za-z0-9_.-]+)\}\}/g, (_, name: string) => placeholders[name] ?? `{{${name}}}`);
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}`;
}
