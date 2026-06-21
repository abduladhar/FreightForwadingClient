import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { sendHtmlReportEmail } from "@/api/reportEmailApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { clearEmailHtmlDraft, loadEmailHtmlDraft } from "@/utils/emailHtmlDraft";
import { lt } from "@/modules/operationsLocalization";

export function EmailHtmlReportPage() {
  const draft = useMemo(() => loadEmailHtmlDraft(), []);
  const navigate = useNavigate();
  const toast = useToast();
  const [emailTo, setEmailTo] = useState(draft?.emailTo ?? "");
  const [emailCc, setEmailCc] = useState("");
  const [emailBcc, setEmailBcc] = useState("");
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const previewHtml = useMemo(() => {
    if (!draft) return "";
    return draft.htmlBody;
  }, [draft]);
  const mutation = useMutation({
    mutationFn: () => sendHtmlReportEmail({
      emailTo,
      emailCc,
      emailBcc,
      subject,
      reportName: draft!.reportName,
      htmlBody: previewHtml,
      module: draft!.module
    }),
    onSuccess: () => {
      clearEmailHtmlDraft();
      toast.success(lt("HTML report emailed"), lt("Report email sent successfully."));
      navigate(-1);
    }
  });

  if (!draft) return <Navigate to="/" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Email HTML Report")} description={draft.reportName} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={lt("Email recipient")}>
              <Input value={emailTo} onChange={(event) => setEmailTo(event.target.value)} placeholder={lt("Use ; for multiple emails")} />
            </Field>
            <Field label={lt("Subject")}>
              <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
            </Field>
            <Field label={lt("Cc")}>
              <Input value={emailCc} onChange={(event) => setEmailCc(event.target.value)} placeholder={lt("Optional; separate emails with ;")} />
            </Field>
            <Field label={lt("Bcc")}>
              <Input value={emailBcc} onChange={(event) => setEmailBcc(event.target.value)} placeholder={lt("Optional; separate emails with ;")} />
            </Field>
          </div>
          <Field label={lt("Body")}>
            <div className="min-w-0 rounded-md border bg-card">
            <iframe
              title={lt("Body")}
              className="h-[680px] w-full bg-white"
              sandbox=""
              srcDoc={previewDocumentHtml(previewHtml)}
            />
            </div>
          </Field>
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

function previewDocumentHtml(html: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#ffffff;}</style></head><body>${html}</body></html>`;
}
