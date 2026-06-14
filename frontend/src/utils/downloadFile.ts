import { saveAs } from "file-saver";

export function downloadBlob(blob: Blob, fileName: string) {
  saveAs(blob, fileName);
}

export function downloadText(content: string, fileName: string, mimeType = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, fileName);
}

export async function downloadFromUrl(url: string, fileName?: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`File download failed with status ${response.status}.`);
  }
  const blob = await response.blob();
  const resolvedName = fileName ?? resolveFileNameFromDisposition(response.headers.get("content-disposition")) ?? "download.bin";
  saveAs(blob, resolvedName);
}

function resolveFileNameFromDisposition(disposition: string | null) {
  if (!disposition) return null;
  const fileNameMatch = /filename="?([^"]+)"?/i.exec(disposition);
  return fileNameMatch?.[1] ?? null;
}
