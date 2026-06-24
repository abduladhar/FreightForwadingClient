import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, Wand2 } from "lucide-react";
import { searchAiModuleJsonFormats } from "@/api/aiModuleJsonFormatApi";
import { extractBillOfEntryPdf, type BillOfEntryAiExtractionResultDto } from "@/api/billOfEntryApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

interface Props {
  onApply: (result: BillOfEntryAiExtractionResultDto) => void | Promise<void>;
}

const moduleCode = "BILL_OF_ENTRY";
const moduleName = "Bill of Entry";

export function BillOfEntryAiExtractionPanel({ onApply }: Props) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState(moduleName);
  const [result, setResult] = useState<BillOfEntryAiExtractionResultDto | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const formatsQuery = useQuery({ queryKey: ["ai-module-json-formats", moduleCode], queryFn: () => searchAiModuleJsonFormats({ moduleCode, isActive: true }) });
  const formats = formatsQuery.data ?? [];
  const selectedFormat = formats.find((format) => same(format.documentType, documentType));

  useEffect(() => {
    if (!selectedFormat && formats[0]) {
      setDocumentType(formats[0].documentType || moduleName);
    }
  }, [formats, selectedFormat]);

  function selectDocumentType(next: string) {
    const nextType = next || moduleName;
    setDocumentType(nextType);
  }

  async function uploadAndExtract() {
    if (!file) {
      toast.warning(lt("Select a PDF"), lt("Choose a PDF document before extraction."));
      return;
    }
    setIsWorking(true);
    setResult(null);
    try {
      const extracted = await extractBillOfEntryPdf(file, { documentType });
      setResult(extracted);
      toast.success(lt("AI extraction completed"));
    } catch (error) {
      toast.error(lt("Extraction failed"), getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  const documentTypes = [...new Set([moduleName, ...formats.map((format) => format.documentType || "").filter(Boolean)])];

  return (
    <section className="rounded-lg border bg-slate-50/70 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{lt("Upload BOE PDF / Extract Data")}</h3>
          <p className="text-xs text-muted-foreground">{lt("Select document type, then extract and populate the BOE form.")}</p>
        </div>
        {result ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <FileUp className="h-4 w-4" />
            <span>{file?.name}</span>
            <span className="rounded-full border bg-white px-2 py-0.5 font-medium text-slate-700">{result.model}</span>
            {result.documentLanguage ? <span className="rounded-full border bg-white px-2 py-0.5 font-medium text-slate-700">{lt("Language")}: {result.documentLanguage}</span> : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_240px_auto] md:items-end">
        <div className="space-y-1">
          <Label>{lt("PDF Document")}</Label>
          <input ref={fileInputRef} className="hidden" type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <div className="flex h-10 items-center gap-2 rounded-md border bg-white px-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>{lt("Choose File")}</Button>
            <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{file ? file.name : lt("No file chosen")}</span>
          </div>
        </div>
        <div className="space-y-1">
          <Label>{lt("Document Type")}</Label>
          <select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={documentType} onChange={(event) => selectDocumentType(event.target.value)}>
            {documentTypes.map((type) => <option key={type} value={type}>{lt(type)}</option>)}
          </select>
        </div>
        <Button type="button" onClick={() => void uploadAndExtract()} disabled={isWorking || !file}>
          {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {isWorking ? lt("Extracting...") : lt("Upload & Extract")}
        </Button>
      </div>

      {result?.warnings?.length ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {result.warnings.map((warning) => <div key={warning}>{warning}</div>)}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-md border bg-white p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-700">
              <span className="font-medium">{lt("Extracted BOE")}</span>
              <span className="mx-2 text-slate-400">/</span>
              <span>{lt("Document Type")}: {result.documentType || documentType}</span>
              <span className="mx-2 text-slate-400">/</span>
              <span>{lt("Items")}: {result.items.length}</span>
              {result.header.boeNumber ? <span className="ml-3">{lt("BOE Number")}: {result.header.boeNumber}</span> : null}
              {result.documentLanguage ? <span className="ml-3">{lt("Suggested Language")}: {result.documentLanguage}</span> : null}
            </div>
            <Button type="button" onClick={() => void onApply(result)}>{lt("Apply Extracted Values")}</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function same(left: string | null | undefined, right: string | null | undefined) {
  return (left ?? "").trim().toLowerCase() === (right ?? "").trim().toLowerCase();
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? lt("Unable to extract data from this document. Please enter details manually.");
  }
  return error instanceof Error ? error.message : lt("Unable to extract data from this document. Please enter details manually.");
}
