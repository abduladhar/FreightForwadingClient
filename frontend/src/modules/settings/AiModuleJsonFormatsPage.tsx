import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  deleteAiModuleJsonFormat,
  saveAiModuleJsonFormat,
  searchAiModuleJsonFormats,
  type AiModuleJsonFormatDto,
  type AiModuleJsonFormatRequest
} from "@/api/aiModuleJsonFormatApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

const emptyFormat: AiModuleJsonFormatRequest = {
  moduleCode: "HOUSE_SHIPMENT",
  moduleName: "House Shipment",
  documentType: "House Waybill",
  jsonFormat: "{}",
  systemPrompt: "",
  mappingJson: "{}",
  isDefault: true,
  isActive: true
};

export function AiModuleJsonFormatsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [moduleCode, setModuleCode] = useState("");
  const [selected, setSelected] = useState<AiModuleJsonFormatRequest>(emptyFormat);
  const formats = useQuery({ queryKey: ["ai-module-json-formats", moduleCode], queryFn: () => searchAiModuleJsonFormats({ moduleCode: moduleCode || undefined }) });
  const saveMutation = useMutation({
    mutationFn: saveAiModuleJsonFormat,
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ["ai-module-json-formats"] });
      setSelected(toRequest(saved));
      toast.success(lt("AI JSON format saved"));
    }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAiModuleJsonFormat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ai-module-json-formats"] });
      setSelected(emptyFormat);
      toast.success(lt("AI JSON format deactivated"));
    }
  });

  useEffect(() => {
    if (!selected.id && formats.data?.[0]) {
      setSelected(toRequest(formats.data[0]));
    }
  }, [formats.data, selected.id]);

  function save() {
    const jsonError = validateJson(selected.jsonFormat) || validateJson(selected.mappingJson || "{}", true);
    if (jsonError) {
      toast.error(lt("Invalid JSON"), jsonError);
      return;
    }

    saveMutation.mutate(selected);
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt("AI Module JSON Formats")} description={lt("Configure module-wise JSON extraction formats for AI document extraction.")} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>{lt("Filter Module Code")}</Label>
              <Input value={moduleCode} placeholder="HOUSE_SHIPMENT" onChange={(event) => setModuleCode(event.target.value.toUpperCase())} />
            </div>
            <Button type="button" size="icon" variant="outline" onClick={() => setSelected(emptyFormat)} title={lt("Add new format")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="divide-y rounded-md border">
            {(formats.data ?? []).map((format) => (
              <button
                key={format.id}
                type="button"
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${selected.id === format.id ? "bg-slate-100" : "bg-white"}`}
                onClick={() => setSelected(toRequest(format))}
              >
                <span className="block font-medium">{format.moduleCode}</span>
                <span className="block text-xs text-muted-foreground">{format.documentType || format.moduleName} {format.isDefault ? "Default" : ""}</span>
              </button>
            ))}
            {!formats.isLoading && !(formats.data ?? []).length ? <div className="p-3 text-sm text-muted-foreground">{lt("No AI JSON formats found.")}</div> : null}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border bg-white p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label={lt("Module Code")}><Input value={selected.moduleCode} onChange={(event) => setSelected({ ...selected, moduleCode: event.target.value.toUpperCase() })} /></Field>
            <Field label={lt("Module Name")}><Input value={selected.moduleName} onChange={(event) => setSelected({ ...selected, moduleName: event.target.value })} /></Field>
            <Field label={lt("Document Type")}><Input value={selected.documentType ?? ""} onChange={(event) => setSelected({ ...selected, documentType: event.target.value || null })} /></Field>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={selected.isDefault} onChange={(event) => setSelected({ ...selected, isDefault: event.target.checked })} />{lt("Default")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={selected.isActive} onChange={(event) => setSelected({ ...selected, isActive: event.target.checked })} />{lt("Active")}</label>
          </div>
          <TextAreaEditor title={lt("System Prompt")} value={selected.systemPrompt ?? ""} onChange={(value) => setSelected({ ...selected, systemPrompt: value })} />
          <TextAreaEditor title={lt("JSON Format")} value={selected.jsonFormat} onChange={(value) => setSelected({ ...selected, jsonFormat: value })} json />
          <TextAreaEditor title={lt("Mapping JSON")} value={selected.mappingJson ?? ""} onChange={(value) => setSelected({ ...selected, mappingJson: value })} json />
          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" disabled={!selected.id || deleteMutation.isPending} onClick={() => selected.id && deleteMutation.mutate(selected.id)}>
              <Trash2 className="h-4 w-4" />
              {lt("Deactivate")}
            </Button>
            <Button type="button" disabled={saveMutation.isPending} onClick={save}>{saveMutation.isPending ? lt("Saving...") : lt("Save Format")}</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function TextAreaEditor({ title, value, onChange, json = false }: { title: string; value: string; onChange: (value: string) => void; json?: boolean }) {
  const toast = useToast();
  function prettyFormat() {
    try {
      onChange(JSON.stringify(JSON.parse(value || "{}"), null, 2));
    } catch {
      toast.error(lt("Invalid JSON"), lt("Please fix the JSON before formatting."));
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label>{title}</Label>
        <div className="flex gap-1">
          {json ? <Button type="button" size="icon" variant="ghost" title={lt("Pretty-format JSON")} onClick={prettyFormat}><Wand2 className="h-4 w-4" /></Button> : null}
          <Button type="button" size="icon" variant="ghost" title={lt("Copy JSON")} onClick={() => void navigator.clipboard.writeText(value)}><Copy className="h-4 w-4" /></Button>
        </div>
      </div>
      <textarea className="min-h-44 w-full rounded-md border bg-slate-50 p-3 font-mono text-xs" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function toRequest(format: AiModuleJsonFormatDto): AiModuleJsonFormatRequest {
  return {
    id: format.id,
    branchId: format.branchId ?? null,
    moduleCode: format.moduleCode,
    moduleName: format.moduleName,
    documentType: format.documentType ?? null,
    jsonFormat: format.jsonFormat,
    systemPrompt: format.systemPrompt ?? "",
    mappingJson: format.mappingJson ?? "",
    isDefault: format.isDefault,
    isActive: format.isActive
  };
}

function validateJson(value: string, optional = false) {
  if (!value.trim()) return optional ? null : lt("JSON is required.");
  try {
    JSON.parse(value);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : lt("Invalid JSON");
  }
}
