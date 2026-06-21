import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText, Send } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { sendHtmlReportEmail } from "@/api/reportEmailApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { clearEmailPdfDraft, loadEmailPdfDraft } from "@/utils/emailPdfDraft";
import { lt } from "@/modules/operationsLocalization";

export function EmailPdfReportPage() {
  const draft = useMemo(() => loadEmailPdfDraft(), []);
  const navigate = useNavigate();
  const toast = useToast();
  const [emailTo, setEmailTo] = useState(draft?.emailTo ?? "");
  const [emailCc, setEmailCc] = useState("");
  const [emailBcc, setEmailBcc] = useState("");
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const [body, setBody] = useState(draft?.body ?? "");
  const mutation = useMutation({
    mutationFn: () => sendHtmlReportEmail({
      emailTo,
      emailCc,
      emailBcc,
      subject,
      reportName: draft!.reportName,
      htmlBody: bodyToHtml(body),
      module: draft!.module,
      attachments: draft!.attachments
    }),
    onSuccess: () => {
      clearEmailPdfDraft();
      toast.success(lt("PDF report emailed"), lt("Report PDF sent successfully."));
      navigate(-1);
    }
  });

  if (!draft) return <Navigate to="/" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Email PDF Report")} description={draft.reportName} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={lt("Email recipient")}><Input value={emailTo} onChange={(event) => setEmailTo(event.target.value)} placeholder={lt("Use ; for multiple emails")} /></Field>
            <Field label={lt("Subject")}><Input value={subject} onChange={(event) => setSubject(event.target.value)} /></Field>
            <Field label={lt("Cc")}><Input value={emailCc} onChange={(event) => setEmailCc(event.target.value)} placeholder={lt("Optional; separate emails with ;")} /></Field>
            <Field label={lt("Bcc")}><Input value={emailBcc} onChange={(event) => setEmailBcc(event.target.value)} placeholder={lt("Optional; separate emails with ;")} /></Field>
          </div>
          <Field label={lt("Body")}>
            <textarea
              className="min-h-40 w-full rounded-md border px-3 py-2 text-sm"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </Field>
          <div className="rounded-md border bg-slate-50 p-3">
            <p className="mb-2 text-sm font-medium">{lt("Attachments")}</p>
            <div className="space-y-2">
              {draft.attachments.map((attachment) => (
                <div key={attachment.fileName} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{attachment.fileName}</span>
                  <span className="text-muted-foreground">PDF</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>{lt("Cancel")}</Button>
            <Button type="button" onClick={() => void mutation.mutateAsync()} disabled={!emailTo.trim() || !subject.trim() || mutation.isPending}>
              <Send className="h-4 w-4" />{mutation.isPending ? lt("Sending...") : lt("Send Email")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><p className="text-xs text-muted-foreground">{label}</p>{children}</div>;
}

function bodyToHtml(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return `<div style="white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;">${escaped}</div>`;
}
