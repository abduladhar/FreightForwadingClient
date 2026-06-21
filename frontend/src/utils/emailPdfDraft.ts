import type { ReportEmailAttachmentRequest } from "@/api/reportEmailApi";

export interface EmailPdfDraft {
  emailTo?: string;
  subject: string;
  reportName: string;
  module: string;
  body: string;
  attachments: ReportEmailAttachmentRequest[];
}

const storageKey = "freight-forwarding.email-pdf-draft";

export function saveEmailPdfDraft(draft: EmailPdfDraft) {
  sessionStorage.setItem(storageKey, JSON.stringify(draft));
}

export function loadEmailPdfDraft() {
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EmailPdfDraft;
  } catch {
    return null;
  }
}

export function clearEmailPdfDraft() {
  sessionStorage.removeItem(storageKey);
}

export async function blobToBase64Content(blob: Blob) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return dataUrl.split(",", 2)[1] ?? "";
}
