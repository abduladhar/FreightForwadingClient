import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchAuditLogs, type AuditLogDto } from "@/api/auditApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { OldNewValueCompare } from "@/modules/audit/OldNewValueCompare";
import { useLanguage } from "@/hooks/useLanguage";
import type { ReactNode } from "react";
import { lt } from "@/modules/operationsLocalization";

export function AuditLogDetailPage() {
  const { auditId } = useParams();
  const location = useLocation();
  const language = useLanguage();
  const stateAudit = (location.state as { audit?: AuditLogDto } | null)?.audit ?? null;
  const query = useQuery({
    queryKey: ["audit-log-detail", auditId],
    queryFn: async () => {
      const result = await searchAuditLogs({ pageNumber: 1, pageSize: 200, failedOnly: false });
      return (result.items ?? []).find((x) => x.id === auditId) ?? null;
    },
    enabled: Boolean(auditId) && !stateAudit
  });
  const data = stateAudit ?? query.data;

  if (!data) {
    return <div className="rounded border p-4 text-sm text-muted-foreground">{lt("Audit detail is unavailable. Open this page from an audit list row to view full context.")}</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Audit Log Detail")} description={`${lt("Correlation ID")}: ${data.correlationId ?? "-"}`} />
      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
          <Detail label={lt("User")} value={data.userName ?? data.userId ?? "-"} />
          <Detail label={lt("Role")} value={data.userRole ?? "-"} />
          <Detail label={lt("Module")} value={data.moduleName} />
          <Detail label={lt("Entity")} value={data.entityName} />
          <Detail label={lt("Record Number")} value={data.recordNumber ?? "-"} />
          <Detail label={lt("Action")} value={`${data.actionType} / ${data.actionName}`} />
          <Detail label={lt("Status")} value={<StatusBadge status={data.status} />} />
          <Detail label={lt("IP Address")} value={data.ipAddress ?? "-"} />
          <Detail label={lt("Request URL")} value={data.requestUrl ?? "-"} />
          <Detail label={lt("Request Method")} value={data.httpMethod ?? "-"} />
          <Detail label={lt("Response Code")} value={data.responseStatusCode != null ? String(data.responseStatusCode) : "-"} />
          <Detail label={lt("Created Date")} value={language.formatLocalizedDateTime(data.createdDate)} />
          <Detail label={lt("Reason")} value={data.reason ?? "-"} />
          <Detail label={lt("Remarks")} value={data.remarks ?? "-"} />
          <Detail label={lt("Error Message")} value={data.errorMessage ?? "-"} />
          <Detail label={lt("Correlation ID")} value={data.correlationId ?? "-"} />
        </CardContent>
      </Card>

      <OldNewValueCompare oldValuesJson={data.oldValuesJson} newValuesJson={data.newValuesJson} changedFieldsJson={data.changedFieldsJson} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
