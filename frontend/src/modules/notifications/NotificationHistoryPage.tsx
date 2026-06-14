import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { getNotificationHistory, retryNotification, type NotificationDto, notificationChannels, notificationEvents } from "@/api/notificationApi";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function NotificationHistoryPage() {
  const queryClient = useQueryClient();
  const language = useLanguage();
  const { hasPermission } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [eventName, setEventName] = useState("");
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");

  const query = useQuery({
    queryKey: ["notification-history", pageNumber, pageSize, eventName, channel, status],
    queryFn: () =>
      getNotificationHistory({
        pageNumber,
        pageSize,
        eventName: eventName || undefined,
        channel: channel || undefined,
        status: status || undefined
      })
  });

  const retry = useMutation({
    mutationFn: retryNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-history"] });
    }
  });

  const rows = (query.data?.items ?? []).filter((item) => {
    if (!search.trim()) return true;
    const haystack = [item.subject, item.eventName, item.channel, item.status, item.failureReason ?? ""].join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const columns: ColumnDef<NotificationDto>[] = [
    { accessorKey: "eventName", header: lt("Event") },
    { accessorKey: "channel", header: lt("Channel") },
    { accessorKey: "subject", header: lt("Subject") },
    { accessorKey: "queuedDate", header: lt("Queued"), cell: ({ row }) => language.formatLocalizedDateTime(row.original.queuedDate) },
    { accessorKey: "sentDate", header: lt("Sent"), cell: ({ row }) => language.formatLocalizedDateTime(row.original.sentDate) },
    { accessorKey: "retryCount", header: lt("Retries") },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Notification History")} description={lt("Monitor queued, sent, failed, and retried notifications across channels.")} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <select className="h-10 rounded-md border px-3 text-sm" value={eventName} onChange={(event) => setEventName(event.target.value)}>
              <option value="">{lt("All events")}</option>
              {notificationEvents.map((item) => (
                <option key={item} value={item}>
                  {lt(item)}
                </option>
              ))}
            </select>
            <select className="h-10 rounded-md border px-3 text-sm" value={channel} onChange={(event) => setChannel(event.target.value)}>
              <option value="">{lt("All channels")}</option>
              {notificationChannels.map((item) => (
                <option key={item} value={item}>
                  {lt(item)}
                </option>
              ))}
            </select>
            <InputStatus value={status} onChange={setStatus} />
            <Button variant="outline" onClick={() => { setEventName(""); setChannel(""); setStatus(""); setSearch(""); setPageNumber(1); }}>{lt("Reset")}</Button>
          </div>
          <DataTable
            data={rows}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search={search}
            onSearchChange={setSearch}
            onPaginationChange={(pn, ps) => {
              setPageNumber(pn);
              setPageSize(ps);
            }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) =>
              hasPermission("Notification.Update") && row.status === "Failed" ? (
                <Button size="sm" variant="outline" disabled={retry.isPending} onClick={() => void retry.mutateAsync(row.id)}>
                  <RotateCcw className="h-4 w-4" />{lt("Retry")}</Button>
              ) : null
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

function InputStatus({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select className="h-10 rounded-md border px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{lt("All statuses")}</option>
      <option value="Queued">{lt("Queued")}</option>
      <option value="Sending">{lt("Sending")}</option>
      <option value="Sent">{lt("Sent")}</option>
      <option value="Failed">{lt("Failed")}</option>
      <option value="Cancelled">{lt("Cancelled")}</option>
    </select>
  );
}
