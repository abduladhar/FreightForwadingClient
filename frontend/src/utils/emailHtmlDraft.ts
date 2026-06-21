export interface EmailHtmlDraft {
  emailTo?: string;
  subject: string;
  reportName: string;
  module: string;
  body: string;
  htmlBody: string;
}

const storageKey = "freight-forwarding.email-html-draft";

export function saveEmailHtmlDraft(draft: EmailHtmlDraft) {
  sessionStorage.setItem(storageKey, JSON.stringify(draft));
}

export function loadEmailHtmlDraft() {
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EmailHtmlDraft;
  } catch {
    return null;
  }
}

export function clearEmailHtmlDraft() {
  sessionStorage.removeItem(storageKey);
}
