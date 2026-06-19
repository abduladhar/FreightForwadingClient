import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, Save } from "lucide-react";
import {
  getEmailConfiguration,
  saveEmailConfiguration,
  sendEmailConfigurationTest,
  type EmailConfigurationRequest,
  type EmailTestRequest
} from "@/api/emailConfigurationApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PermissionButton } from "@/auth/PermissionButton";
import { toast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

const emptyConfig: EmailConfigurationRequest = {
  smtpHost: "",
  smtpPort: 587,
  useSsl: true,
  userName: "",
  password: "",
  fromEmail: "",
  fromName: "",
  replyToEmail: "",
  isEnabled: true
};

const emptyTest: EmailTestRequest = {
  toEmail: "",
  subject: "Freight Forwarding ERP email test",
  htmlBody: "<p>This is a test email from Freight Forwarding ERP.</p>"
};

export function EmailConfigurationPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["email-configuration"], queryFn: getEmailConfiguration });
  const [form, setForm] = useState<EmailConfigurationRequest>(emptyConfig);
  const [test, setTest] = useState<EmailTestRequest>(emptyTest);
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (!query.data) return;
    setForm({
      smtpHost: query.data.smtpHost,
      smtpPort: query.data.smtpPort || 587,
      useSsl: query.data.useSsl,
      userName: query.data.userName,
      password: "",
      fromEmail: query.data.fromEmail,
      fromName: query.data.fromName,
      replyToEmail: query.data.replyToEmail,
      isEnabled: query.data.isEnabled
    });
    setHasPassword(query.data.hasPassword);
  }, [query.data]);

  const save = useMutation({
    mutationFn: saveEmailConfiguration,
    onSuccess: async (saved) => {
      toast.success(lt("Email configuration saved"));
      setHasPassword(saved.hasPassword);
      setForm((current) => ({ ...current, password: "" }));
      await queryClient.invalidateQueries({ queryKey: ["email-configuration"] });
    }
  });

  const sendTest = useMutation({
    mutationFn: sendEmailConfigurationTest,
    onSuccess: async () => {
      toast.success(lt("Test email sent"));
      await queryClient.invalidateQueries({ queryKey: ["email-configuration"] });
    }
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Email Configuration")}
        description={lt("Store SMTP settings used to send HTML and PDF reports to customers.")}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" /> {lt("SMTP Settings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Field label={lt("SMTP Host")}>
              <Input value={form.smtpHost} placeholder={lt("smtp.example.com")} onChange={(event) => update("smtpHost", event.target.value)} />
            </Field>
            <Field label={lt("SMTP Port")}>
              <Input type="number" min={1} max={65535} value={form.smtpPort} onChange={(event) => update("smtpPort", Number(event.target.value) || 587)} />
            </Field>
            <Field label={lt("User Name")}>
              <Input value={form.userName ?? ""} placeholder={lt("SMTP user name")} onChange={(event) => update("userName", event.target.value)} />
            </Field>
            <Field label={lt("Password")}>
              <Input
                type="password"
                value={form.password ?? ""}
                placeholder={hasPassword ? lt("Leave blank to keep saved password") : lt("SMTP password")}
                onChange={(event) => update("password", event.target.value)}
              />
            </Field>
            <Field label={lt("From Email")}>
              <Input value={form.fromEmail} placeholder={lt("accounts@example.com")} onChange={(event) => update("fromEmail", event.target.value)} />
            </Field>
            <Field label={lt("From Name")}>
              <Input value={form.fromName ?? ""} placeholder={lt("Company name")} onChange={(event) => update("fromName", event.target.value)} />
            </Field>
            <Field label={lt("Reply-To Email")}>
              <Input value={form.replyToEmail ?? ""} placeholder={lt("Optional reply-to email")} onChange={(event) => update("replyToEmail", event.target.value)} />
            </Field>
            <div className="flex items-end gap-4">
              <label className="flex h-10 items-center gap-2 text-sm">
                <input type="checkbox" checked={form.useSsl} onChange={(event) => update("useSsl", event.target.checked)} />
                {lt("Use SSL/TLS")}
              </label>
              <label className="flex h-10 items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isEnabled} onChange={(event) => update("isEnabled", event.target.checked)} />
                {lt("Enabled")}
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PermissionButton permission="Tenant.Update" disabled={save.isPending} onClick={() => save.mutate(form)}>
              <Save className="h-4 w-4" /> {save.isPending ? lt("Saving...") : lt("Save Configuration")}
            </PermissionButton>
            {query.data?.lastTestedAt ? <span className="text-sm text-muted-foreground">{lt("Last tested")}: {new Date(query.data.lastTestedAt).toLocaleString()}</span> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4" /> {lt("Send Test Email")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={lt("Recipient Email")}>
              <Input value={test.toEmail} placeholder={lt("customer@example.com")} onChange={(event) => updateTest("toEmail", event.target.value)} />
            </Field>
            <Field label={lt("Subject")}>
              <Input value={test.subject ?? ""} onChange={(event) => updateTest("subject", event.target.value)} />
            </Field>
          </div>
          <Field label={lt("HTML Body")}>
            <Textarea rows={5} value={test.htmlBody ?? ""} onChange={(event) => updateTest("htmlBody", event.target.value)} />
          </Field>
          <Button variant="outline" disabled={sendTest.isPending || !test.toEmail} onClick={() => sendTest.mutate(test)}>
            <Send className="h-4 w-4" /> {sendTest.isPending ? lt("Sending...") : lt("Send Test Email")}
          </Button>
        </CardContent>
      </Card>

      {query.isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {lt("Unable to load email configuration.")}
        </div>
      ) : null}
    </div>
  );

  function update<TKey extends keyof EmailConfigurationRequest>(key: TKey, value: EmailConfigurationRequest[TKey]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTest<TKey extends keyof EmailTestRequest>(key: TKey, value: EmailTestRequest[TKey]) {
    setTest((current) => ({ ...current, [key]: value }));
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}
