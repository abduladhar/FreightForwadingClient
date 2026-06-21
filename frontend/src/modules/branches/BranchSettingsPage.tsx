import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { getBranchById, getBranchSettings, updateBranchSettings } from "@/api/branchApi";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { branchSettingsSchema, type BranchSettingsFormValues } from "@/modules/branches/branchValidation";
import { lt } from "@/modules/operationsLocalization";
import { BranchBankDetailsPanel } from "@/modules/branches/BranchBankDetailsPanel";

interface OpenAiModelOption {
  id: string;
  label: string;
}

interface BranchConfiguration {
  openAi?: {
    apiKey?: string;
    selectedModel?: string;
    models?: OpenAiModelOption[];
    isEnabled?: boolean;
    extractionTimeoutSeconds?: number | null;
    maxDocumentSizeBytes?: number | null;
    s3Prefix?: string | null;
  };
  [key: string]: unknown;
}

const defaultOpenAiModels: OpenAiModelOption[] = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini" }
];

export function BranchSettingsPage() {
  const { branchId } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["branch-settings", branchId], queryFn: () => getBranchSettings(branchId!), enabled: Boolean(branchId) });
  const branch = useQuery({ queryKey: ["branch", branchId], queryFn: () => getBranchById(branchId!), enabled: Boolean(branchId) });
  const parsedConfiguration = useMemo(() => parseConfiguration(query.data?.configurationJson), [query.data?.configurationJson]);
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [selectedOpenAiModel, setSelectedOpenAiModel] = useState(defaultOpenAiModels[0].id);
  const [openAiModels, setOpenAiModels] = useState<OpenAiModelOption[]>(defaultOpenAiModels);
  const [openAiIsEnabled, setOpenAiIsEnabled] = useState(false);
  const [openAiTimeoutSeconds, setOpenAiTimeoutSeconds] = useState<number | "">("");
  const [openAiMaxSizeMb, setOpenAiMaxSizeMb] = useState<number | "">("");
  const [openAiS3Prefix, setOpenAiS3Prefix] = useState("");
  const form = useForm<BranchSettingsFormValues>({
    resolver: zodResolver(branchSettingsSchema),
    values: query.data
      ? {
          localTimeZone: query.data.localTimeZone ?? "",
          workingDays: query.data.workingDays ?? "",
          openingTime: query.data.openingTime ?? "",
          closingTime: query.data.closingTime ?? "",
          configurationJson: query.data.configurationJson ?? ""
        }
      : undefined
  });
  useEffect(() => {
    const settings = parsedConfiguration.openAi;
    const configuredModels = parseOpenAiModelsJson(query.data?.openAiModelsJson) ?? settings?.models;
    const mergedModels = mergeOpenAiModels(configuredModels);
    const configuredSelectedModel = query.data?.openAiSelectedModel ?? settings?.selectedModel;
    setOpenAiModels(mergedModels);
    setOpenAiApiKey(query.data?.openAiApiKey ?? settings?.apiKey ?? "");
    setOpenAiIsEnabled(query.data?.openAiIsEnabled ?? settings?.isEnabled ?? false);
    setOpenAiTimeoutSeconds(query.data?.openAiExtractionTimeoutSeconds ?? settings?.extractionTimeoutSeconds ?? "");
    setOpenAiMaxSizeMb(bytesToMb(query.data?.openAiMaxDocumentSizeBytes ?? settings?.maxDocumentSizeBytes) ?? "");
    setOpenAiS3Prefix(query.data?.openAiS3Prefix ?? settings?.s3Prefix ?? "");
    setSelectedOpenAiModel(configuredSelectedModel && mergedModels.some((model) => model.id === configuredSelectedModel)
      ? configuredSelectedModel
      : mergedModels[0]?.id ?? "");
  }, [parsedConfiguration, query.data?.openAiApiKey, query.data?.openAiExtractionTimeoutSeconds, query.data?.openAiIsEnabled, query.data?.openAiMaxDocumentSizeBytes, query.data?.openAiModelsJson, query.data?.openAiS3Prefix, query.data?.openAiSelectedModel]);
  const mutation = useMutation({
    mutationFn: (values: BranchSettingsFormValues) => {
      const configuration = buildConfigurationJson(parsedConfiguration, {
        apiKey: openAiApiKey,
        selectedModel: selectedOpenAiModel,
        models: openAiModels,
        isEnabled: openAiIsEnabled,
        extractionTimeoutSeconds: openAiTimeoutSeconds === "" ? null : Number(openAiTimeoutSeconds),
        maxDocumentSizeBytes: openAiMaxSizeMb === "" ? null : Math.round(Number(openAiMaxSizeMb) * 1024 * 1024),
        s3Prefix: openAiS3Prefix.trim() || null
      });
      return updateBranchSettings(branchId!, {
        ...values,
        localTimeZone: values.localTimeZone || null,
        workingDays: values.workingDays || null,
        openingTime: values.openingTime || null,
        closingTime: values.closingTime || null,
        openAiApiKey: openAiApiKey.trim() || null,
        openAiSelectedModel: selectedOpenAiModel || null,
        openAiModelsJson: JSON.stringify(openAiModels),
        openAiIsEnabled,
        openAiExtractionTimeoutSeconds: openAiTimeoutSeconds === "" ? null : Number(openAiTimeoutSeconds),
        openAiMaxDocumentSizeBytes: openAiMaxSizeMb === "" ? null : Math.round(Number(openAiMaxSizeMb) * 1024 * 1024),
        openAiS3Prefix: openAiS3Prefix.trim() || null,
        configurationJson: configuration
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branch-settings", branchId] });
      toast.success(lt("Branch settings updated"));
    }
  });
  if (!branchId) return <Navigate to="/branches" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Branch Settings")} description={lt("Working schedule and branch-specific preferences.")} />
      <Card><CardContent className="pt-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
          <Field label={lt("Local Time Zone")} error={form.formState.errors.localTimeZone?.message}><Input {...form.register("localTimeZone")} /></Field>
          <Field label={lt("Working Days")} error={form.formState.errors.workingDays?.message}><Input {...form.register("workingDays")} /></Field>
          <Field label={lt("Opening Time")} error={form.formState.errors.openingTime?.message}><Input {...form.register("openingTime")} placeholder="08:30" /></Field>
          <Field label={lt("Closing Time")} error={form.formState.errors.closingTime?.message}><Input {...form.register("closingTime")} placeholder="18:30" /></Field>
          <input type="hidden" {...form.register("configurationJson")} />
          <OpenAiSettingsPanel
            apiKey={openAiApiKey}
            selectedModel={selectedOpenAiModel}
            models={openAiModels}
            isEnabled={openAiIsEnabled}
            timeoutSeconds={openAiTimeoutSeconds}
            maxSizeMb={openAiMaxSizeMb}
            s3Prefix={openAiS3Prefix}
            onApiKeyChange={setOpenAiApiKey}
            onSelectedModelChange={setSelectedOpenAiModel}
            onIsEnabledChange={setOpenAiIsEnabled}
            onTimeoutSecondsChange={setOpenAiTimeoutSeconds}
            onMaxSizeMbChange={setOpenAiMaxSizeMb}
            onS3PrefixChange={setOpenAiS3Prefix}
            onModelAdd={(model) => {
              setOpenAiModels((current) => mergeOpenAiModels([...current, model]));
              setSelectedOpenAiModel(model.id);
            }}
          />
          <div className="md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? lt("Saving...") : lt("Save Settings")}</Button>
          </div>
        </form>
      </CardContent></Card>
      <BranchBankDetailsPanel branchId={branchId} branchName={branch.data?.branchName ?? lt("Branch")} />
    </div>
  );
}

function OpenAiSettingsPanel({
  apiKey,
  selectedModel,
  models,
  isEnabled,
  timeoutSeconds,
  maxSizeMb,
  s3Prefix,
  onApiKeyChange,
  onSelectedModelChange,
  onIsEnabledChange,
  onTimeoutSecondsChange,
  onMaxSizeMbChange,
  onS3PrefixChange,
  onModelAdd
}: {
  apiKey: string;
  selectedModel: string;
  models: OpenAiModelOption[];
  isEnabled: boolean;
  timeoutSeconds: number | "";
  maxSizeMb: number | "";
  s3Prefix: string;
  onApiKeyChange: (value: string) => void;
  onSelectedModelChange: (value: string) => void;
  onIsEnabledChange: (value: boolean) => void;
  onTimeoutSecondsChange: (value: number | "") => void;
  onMaxSizeMbChange: (value: number | "") => void;
  onS3PrefixChange: (value: string) => void;
  onModelAdd: (model: OpenAiModelOption) => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modelId, setModelId] = useState("");
  const [modelLabel, setModelLabel] = useState("");
  const canAdd = modelId.trim().length > 0;

  function addModel() {
    const id = modelId.trim();
    if (!id) return;
    onModelAdd({ id, label: modelLabel.trim() || id });
    setModelId("");
    setModelLabel("");
    setDialogOpen(false);
  }

  return (
    <div className="md:col-span-2 rounded-lg border bg-slate-50/70 p-4">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-900">{lt("OpenAI Settings")}</h2>
        <p className="text-sm text-muted-foreground">{lt("Branch-specific API key and model selection.")}</p>
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-800">
        <input type="checkbox" checked={isEnabled} onChange={(event) => onIsEnabledChange(event.target.checked)} />
        {lt("Enable AI document extraction for this branch")}
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={lt("OpenAI API Key")}>
          <div className="flex gap-2">
            <Input
              type={showKey ? "text" : "password"}
              value={apiKey}
              autoComplete="off"
              placeholder="sk-..."
              onChange={(event) => onApiKeyChange(event.target.value)}
            />
            <Button type="button" size="icon" variant="outline" title={showKey ? lt("Hide API Key") : lt("Show API Key")} onClick={() => setShowKey((current) => !current)}>
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </Field>
        <Field label={lt("OpenAI Model")}>
          <div className="flex gap-2">
            <select
              className="h-10 min-w-0 flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={selectedModel}
              onChange={(event) => onSelectedModelChange(event.target.value)}
            >
              {models.map((model) => <option key={model.id} value={model.id}>{model.label} ({model.id})</option>)}
            </select>
            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Trigger asChild>
                <Button type="button" size="icon" variant="outline" title={lt("Add Model")}><Plus className="h-4 w-4" /></Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-white shadow-xl">
                  <div className="flex items-start justify-between gap-4 border-b p-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-slate-900">{lt("Create OpenAI Model")}</Dialog.Title>
                      <Dialog.Description className="mt-1 text-sm text-muted-foreground">{lt("Add a model identifier for this branch.")}</Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <Button type="button" size="icon" variant="ghost" title={lt("Close")}><X className="h-4 w-4" /></Button>
                    </Dialog.Close>
                  </div>
                  <div className="space-y-4 p-4">
                    <Field label={lt("Model ID")}><Input value={modelId} placeholder="gpt-4o-mini" onChange={(event) => setModelId(event.target.value)} /></Field>
                    <Field label={lt("Display Name")}><Input value={modelLabel} placeholder={modelId || lt("Optional")} onChange={(event) => setModelLabel(event.target.value)} /></Field>
                  </div>
                  <div className="flex justify-end gap-2 border-t p-4">
                    <Dialog.Close asChild><Button type="button" variant="outline">{lt("Cancel")}</Button></Dialog.Close>
                    <Button type="button" disabled={!canAdd} onClick={addModel}>{lt("Create Model")}</Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </Field>
        <Field label={lt("Extraction Timeout (seconds)")}>
          <Input type="number" min="15" max="300" value={timeoutSeconds} onChange={(event) => onTimeoutSecondsChange(event.target.value === "" ? "" : Number(event.target.value))} />
        </Field>
        <Field label={lt("Max PDF Size (MB)")}>
          <Input type="number" min="1" max="100" value={maxSizeMb} onChange={(event) => onMaxSizeMbChange(event.target.value === "" ? "" : Number(event.target.value))} />
        </Field>
        <Field label={lt("S3 Folder Prefix")}>
          <Input value={s3Prefix} placeholder="ai-extraction" onChange={(event) => onS3PrefixChange(event.target.value)} />
        </Field>
      </div>
    </div>
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

function parseConfiguration(value?: string | null): BranchConfiguration {
  if (!value?.trim()) return {};
  try {
    const parsed = JSON.parse(value) as BranchConfiguration;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function parseOpenAiModelsJson(value?: string | null) {
  if (!value?.trim()) return undefined;
  try {
    const parsed = JSON.parse(value) as OpenAiModelOption[];
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function buildConfigurationJson(configuration: BranchConfiguration, openAi: NonNullable<BranchConfiguration["openAi"]>) {
  const next: BranchConfiguration = {
    ...configuration,
    openAi: {
      apiKey: openAi.apiKey?.trim() || undefined,
      selectedModel: openAi.selectedModel || undefined,
      models: mergeOpenAiModels(openAi.models),
      isEnabled: openAi.isEnabled ?? false,
      extractionTimeoutSeconds: openAi.extractionTimeoutSeconds ?? undefined,
      maxDocumentSizeBytes: openAi.maxDocumentSizeBytes ?? undefined,
      s3Prefix: openAi.s3Prefix?.trim() || undefined
    }
  };
  return JSON.stringify(next, null, 2);
}

function bytesToMb(value?: number | null) {
  if (!value) return null;
  return Number((value / 1024 / 1024).toFixed(2));
}

function mergeOpenAiModels(models?: OpenAiModelOption[]) {
  const unique = new Map<string, OpenAiModelOption>();
  [...defaultOpenAiModels, ...(models ?? [])].forEach((model) => {
    const id = model.id?.trim();
    if (id) unique.set(id, { id, label: model.label?.trim() || id });
  });
  return Array.from(unique.values());
}
