import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { FileJson, FileUp, Loader2, Wand2, X } from "lucide-react";
import { getAiModuleJsonFormat, type AiModuleJsonFormatDto } from "@/api/aiModuleJsonFormatApi";
import {
  extractHouseShipmentPdf,
  getHouseShipmentPdfApplyPreview,
  type HouseShipmentApplyPreviewDto,
  type HouseShipmentDocumentDto,
  uploadHouseShipmentPdf
} from "@/api/houseShipmentApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

interface Props {
  shipmentId?: string | null;
  currentFields: Record<string, unknown>;
  onApply: (fields: Record<string, unknown>) => void;
  onDocumentUploaded?: (documentId: string) => void;
}

const fieldLabels: Record<string, string> = {
  shipperName: "Shipper Name",
  shipperAddress: "Shipper Address",
  shipperContactNo: "Shipper Contact No",
  consigneeName: "Consignee Name",
  consigneeAddress: "Consignee Address",
  consigneeContactNo: "Consignee Contact No",
  origin: "Origin",
  destination: "Destination",
  etd: "ETD",
  eta: "ETA",
  remarks: "Remarks",
  selectedGoods: "Cargo Items"
};

export function HouseShipmentAiExtractionPanel({ shipmentId, currentFields, onApply, onDocumentUploaded }: Props) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("House Waybill");
  const [document, setDocument] = useState<HouseShipmentDocumentDto | null>(null);
  const [preview, setPreview] = useState<HouseShipmentApplyPreviewDto | null>(null);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [format, setFormat] = useState<AiModuleJsonFormatDto | null>(null);
  const [formatOpen, setFormatOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  async function uploadAndExtract() {
    if (!file) {
      toast.warning(lt("Select a PDF"), lt("Choose a PDF document before extraction."));
      return;
    }

    setIsWorking(true);
    setPreview(null);
    try {
      const uploaded = await uploadHouseShipmentPdf(shipmentId ?? null, file, documentType);
      setDocument(uploaded);
      onDocumentUploaded?.(uploaded.id);
      const extracted = await extractHouseShipmentPdf(uploaded.id);
      setDocument(extracted.document);
      const nextPreview = await getHouseShipmentPdfApplyPreview(uploaded.id);
      setPreview(nextPreview);
      setSelectedFields(Object.fromEntries(Object.keys(nextPreview.fields).map((key) => [key, true])));
      toast.success(lt("AI extraction completed"));
    } catch (error) {
      toast.error(lt("Extraction failed"), getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function viewFormat() {
    try {
      setFormat(await getAiModuleJsonFormat("HOUSE_SHIPMENT"));
      setFormatOpen(true);
    } catch (error) {
      toast.error(lt("AI JSON format unavailable"), getErrorMessage(error));
    }
  }

  function applySelected() {
    if (!preview) return;
    const fields = Object.fromEntries(Object.entries(preview.fields).filter(([key]) => selectedFields[key]));
    onApply(fields);
    toast.success(lt("Extracted values applied"), lt("Review the form and save the shipment when ready."));
  }

  const previewFields = Object.entries(preview?.fields ?? {});

  return (
    <section className="rounded-lg border bg-slate-50/70 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{lt("Upload PDF / Extract Data")}</h3>
          <p className="text-xs text-muted-foreground">{lt("Review extracted values before applying them to the shipment form.")}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void viewFormat()}>
          <FileJson className="h-4 w-4" />
          {lt("View AI JSON Format")}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
        <div className="space-y-1">
          <Label>{lt("PDF Document")}</Label>
          <Input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </div>
        <div className="space-y-1">
          <Label>{lt("Document Type")}</Label>
          <Input value={documentType} onChange={(event) => setDocumentType(event.target.value)} />
        </div>
        <Button type="button" onClick={() => void uploadAndExtract()} disabled={isWorking || !file}>
          {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {isWorking ? lt("Extracting...") : lt("Upload & Extract")}
        </Button>
      </div>

      {document ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <FileUp className="h-4 w-4" />
          <span>{document.originalFileName}</span>
          <span className="rounded-full border bg-white px-2 py-0.5 font-medium text-slate-700">{document.extractionStatus}</span>
          {document.openAIModel ? <span>{document.openAIModel}</span> : null}
        </div>
      ) : null}

      {preview?.warnings?.length ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {preview.warnings.map((warning) => <div key={warning}>{warning}</div>)}
        </div>
      ) : null}

      {previewFields.length ? (
        <div className="mt-4 overflow-hidden rounded-md border bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="w-12 p-2 text-left">{lt("Use")}</th>
                <th className="p-2 text-left">{lt("Field")}</th>
                <th className="p-2 text-left">{lt("Current Value")}</th>
                <th className="p-2 text-left">{lt("Extracted Value")}</th>
              </tr>
            </thead>
            <tbody>
              {previewFields.map(([key, extracted]) => (
                <tr key={key} className="border-t align-top">
                  <td className="p-2">
                    <input type="checkbox" checked={selectedFields[key] ?? false} onChange={(event) => setSelectedFields((prev) => ({ ...prev, [key]: event.target.checked }))} />
                  </td>
                  <td className="p-2 font-medium">{lt(fieldLabels[key] ?? key)}</td>
                  <td className="max-w-[260px] p-2 text-muted-foreground">{formatValue(currentFields[key])}</td>
                  <td className="max-w-[320px] p-2">{formatValue(extracted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end border-t p-3">
            <Button type="button" onClick={applySelected}>{lt("Apply Selected Fields")}</Button>
          </div>
        </div>
      ) : null}

      <Dialog.Root open={formatOpen} onOpenChange={setFormatOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div>
                <Dialog.Title className="text-lg font-semibold">{format?.moduleName ?? lt("AI JSON Format")}</Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">{format?.documentType ?? "HOUSE_SHIPMENT"}</Dialog.Description>
              </div>
              <Dialog.Close asChild><Button type="button" size="icon" variant="ghost"><X className="h-4 w-4" /></Button></Dialog.Close>
            </div>
            <div className="grid max-h-[72vh] gap-4 overflow-auto p-4 md:grid-cols-2">
              <ReadOnlyJson title={lt("System Prompt")} value={format?.systemPrompt ?? ""} />
              <ReadOnlyJson title={lt("Mapping JSON")} value={pretty(format?.mappingJson)} />
              <div className="md:col-span-2">
                <ReadOnlyJson title={lt("JSON Format")} value={pretty(format?.jsonFormat)} />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}

function ReadOnlyJson({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label>{title}</Label>
      <textarea className="min-h-52 w-full rounded-md border bg-slate-50 p-3 font-mono text-xs" readOnly value={value} />
    </div>
  );
}

function pretty(value?: string | null) {
  if (!value) return "";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? lt("Unable to extract data from this document. Please enter details manually.");
  }
  return error instanceof Error ? error.message : lt("Unable to extract data from this document. Please enter details manually.");
}
