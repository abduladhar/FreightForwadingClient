import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getLanguages } from "@/api/languageApi";
import { getNotificationTemplate, updateNotificationTemplate, type NotificationTemplateRequest } from "@/api/notificationApi";
import { NotificationTemplateForm } from "@/modules/notifications/NotificationTemplateForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { lt } from "@/modules/operationsLocalization";

export function NotificationTemplateEditPage() {
  const { templateId } = useParams();
  const languages = useQuery({ queryKey: ["languages"], queryFn: getLanguages });
  const template = useQuery({
    queryKey: ["notification-template", templateId],
    queryFn: () => getNotificationTemplate(templateId!),
    enabled: Boolean(templateId)
  });
  const update = useMutation({
    mutationFn: (request: NotificationTemplateRequest) => updateNotificationTemplate(templateId!, request)
  });

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Edit Notification Template")} description={lt("Update placeholder-driven message templates and channel rules.")} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="pt-6">
          {template.data ? (
            <NotificationTemplateForm
              initialValue={template.data}
              disableCode
              languages={languages.data ?? []}
              isSubmitting={update.isPending}
              onSubmit={async (request) => {
                await update.mutateAsync(request);
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{lt("Loading template...")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
