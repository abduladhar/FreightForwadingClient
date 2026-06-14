import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLanguages } from "@/api/languageApi";
import { getErpUiSettings, savePrintTemplates, type PrintTemplateSetting } from "@/api/settingsApi";
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

const defaultTemplate: PrintTemplateSetting = {
  id: "",
  code: "",
  name: "",
  moduleName: "",
  languageCode: "en",
  pageSize: "A4",
  orientation: "Portrait",
  includeLogo: true,
  includeHeader: true,
  includeFooter: true,
  includeBarcode: true,
  includeQrCode: false,
  subjectPlaceholder: "{{documentNumber}}",
  headerTemplate: "Freight ERP - {{tenantName}}\n{{branchName}}",
  bodyTemplate: "Document: {{documentNumber}}\nCustomer: {{customerName}}\nDate: {{documentDate}}\nAmount: {{amount}}",
  footerTemplate: "Prepared by {{userName}}",
  isDefault: false,
  isActive: true
};

export function PrintTemplateDesignerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");
  const { session } = useAuth();
  const tenantId = session?.tenantId;

  const settingsQuery = useQuery({
    queryKey: ["print-template-designer", tenantId],
    queryFn: () => getErpUiSettings(tenantId!),
    enabled: Boolean(tenantId)
  });
  const languages = useQuery({ queryKey: ["languages"], queryFn: getLanguages });
  const [draft, setDraft] = useState<PrintTemplateSetting>(defaultTemplate);
  const save = useMutation({
    mutationFn: (nextRows: PrintTemplateSetting[]) => savePrintTemplates(tenantId!, nextRows),
    onSuccess: () => navigate("/settings/print-templates")
  });

  const existing = useMemo(
    () => settingsQuery.data?.bundle.printTemplates.find((item) => item.id === templateId) ?? null,
    [settingsQuery.data?.bundle.printTemplates, templateId]
  );

  useEffect(() => {
    if (existing) {
      setDraft(existing);
      return;
    }
    setDraft((current) => (templateId ? current : { ...defaultTemplate, id: generateId() }));
  }, [existing, templateId]);

  if (!tenantId) return <div className="rounded-md border bg-yellow-50 p-4 text-sm text-yellow-800">{lt("Tenant context is required to design print templates.")}</div>;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Print Template Designer")}
        description={lt("Design language-aware print templates with placeholders, branding, and barcode/QR support.")}
        actions={<AuditTrailButton />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="grid gap-4 pt-6">
            <Field label={lt("Template Code")}><Input value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} /></Field>
            <Field label={lt("Template Name")}><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
            <Field label={lt("Module Name")}><Input value={draft.moduleName} onChange={(event) => setDraft({ ...draft, moduleName: event.target.value })} /></Field>
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
              <Field label={lt("Page Size")}>
                <select className="h-10 w-full rounded-md border px-3 text-sm" value={draft.pageSize} onChange={(event) => setDraft({ ...draft, pageSize: event.target.value as PrintTemplateSetting["pageSize"] })}>
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="Letter">{lt("Letter")}</option>
                  <option value="Legal">{lt("Legal")}</option>
                  <option value="Custom">{lt("Custom")}</option>
                </select>
              </Field>
              <Field label={lt("Orientation")}>
                <select className="h-10 w-full rounded-md border px-3 text-sm" value={draft.orientation} onChange={(event) => setDraft({ ...draft, orientation: event.target.value as PrintTemplateSetting["orientation"] })}>
                  <option value="Portrait">{lt("Portrait")}</option>
                  <option value="Landscape">{lt("Landscape")}</option>
                </select>
              </Field>
            </div>
            <Field label={lt("Header Template")}>
              <textarea className="min-h-[96px] w-full rounded-md border px-3 py-2 text-sm" value={draft.headerTemplate} onChange={(event) => setDraft({ ...draft, headerTemplate: event.target.value })} />
            </Field>
            <Field label={lt("Body Template")}>
              <textarea className="min-h-[140px] w-full rounded-md border px-3 py-2 text-sm" value={draft.bodyTemplate} onChange={(event) => setDraft({ ...draft, bodyTemplate: event.target.value })} />
            </Field>
            <Field label={lt("Footer Template")}>
              <textarea className="min-h-[96px] w-full rounded-md border px-3 py-2 text-sm" value={draft.footerTemplate} onChange={(event) => setDraft({ ...draft, footerTemplate: event.target.value })} />
            </Field>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeLogo} onChange={(event) => setDraft({ ...draft, includeLogo: event.target.checked })} /> {lt("Tenant Logo")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeHeader} onChange={(event) => setDraft({ ...draft, includeHeader: event.target.checked })} /> {lt("Header")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeFooter} onChange={(event) => setDraft({ ...draft, includeFooter: event.target.checked })} /> {lt("Footer")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeBarcode} onChange={(event) => setDraft({ ...draft, includeBarcode: event.target.checked })} /> {lt("Barcode")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeQrCode} onChange={(event) => setDraft({ ...draft, includeQrCode: event.target.checked })} /> {lt("QR Code")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isDefault} onChange={(event) => setDraft({ ...draft, isDefault: event.target.checked })} /> {lt("Default")}</label>
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
            <p className="text-sm font-medium">{lt("Preview")}</p>
            <div className="rounded-md border bg-white p-4 shadow-sm">
              {draft.includeLogo ? <div className="mb-3 inline-flex h-8 w-24 items-center justify-center rounded border bg-slate-50 text-xs text-slate-600">{lt("TENANT LOGO")}</div> : null}
              {draft.includeHeader ? <pre className="mb-3 whitespace-pre-wrap text-sm">{renderTemplate(draft.headerTemplate)}</pre> : null}
              <pre className="whitespace-pre-wrap text-sm">{renderTemplate(draft.bodyTemplate)}</pre>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {draft.includeBarcode ? <Barcode value="INV-000123" /> : null}
                {draft.includeQrCode ? <QRCode value="https://freighterp.local/track/INV-000123" /> : null}
              </div>
              {draft.includeFooter ? <pre className="mt-4 whitespace-pre-wrap border-t pt-3 text-xs text-slate-600">{renderTemplate(draft.footerTemplate)}</pre> : null}
            </div>
            <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
              {lt("Placeholders")}:
              {" "}
              <code>{"{{tenantName}}"}</code>, <code>{"{{branchName}}"}</code>, <code>{"{{documentNumber}}"}</code>, <code>{"{{documentDate}}"}</code>, <code>{"{{customerName}}"}</code>, <code>{"{{amount}}"}</code>, <code>{"{{userName}}"}</code>.
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

    const current = settingsQuery.data?.bundle.printTemplates ?? [];
    const withoutCurrent = current.filter((item) => item.id !== next.id);
    const rows = next.isDefault
      ? withoutCurrent.map((item) => (item.moduleName === next.moduleName && item.languageCode === next.languageCode ? { ...item, isDefault: false } : item)).concat(next)
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

function renderTemplate(template: string) {
  const placeholders: Record<string, string> = {
    tenantName: "Acme Freight LLC",
    branchName: "Mumbai Branch",
    documentNumber: "INV-000123",
    documentDate: "2026-05-29",
    customerName: "Blue Ocean Exports",
    amount: "USD 4,250.00",
    userName: "Operations User"
  };
  return template.replace(/\{\{([A-Za-z0-9_.-]+)\}\}/g, (_, name: string) => placeholders[name] ?? `{{${name}}}`);
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}`;
}
