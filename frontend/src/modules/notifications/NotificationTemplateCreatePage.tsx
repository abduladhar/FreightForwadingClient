import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createNotificationTemplate, type NotificationTemplateRequest } from "@/api/notificationApi";
import { getLanguages } from "@/api/languageApi";
import { NotificationTemplateForm } from "@/modules/notifications/NotificationTemplateForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { lt } from "@/modules/operationsLocalization";

export function NotificationTemplateCreatePage() {
  const navigate = useNavigate();
  const languages = useQuery({ queryKey: ["languages"], queryFn: getLanguages });
  const create = useMutation({
    mutationFn: (request: NotificationTemplateRequest) => createNotificationTemplate(request),
    onSuccess: (item) => navigate(`/notifications/templates/${item.id}/edit`)
  });

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Create Notification Template")} description={lt("Create reusable template content by event, channel, and language.")} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="pt-6">
          <NotificationTemplateForm
            languages={languages.data ?? []}
            isSubmitting={create.isPending}
            onSubmit={async (request) => {
              await create.mutateAsync(request);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
