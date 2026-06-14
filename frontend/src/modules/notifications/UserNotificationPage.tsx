import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCheck } from "lucide-react";
import { getUserNotifications, markNotificationAsRead, type NotificationDto } from "@/api/notificationApi";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/auth/useAuth";
import { lt } from "@/modules/operationsLocalization";

export function UserNotificationPage() {
  const queryClient = useQueryClient();
  const language = useLanguage();
  const { session } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["user-notifications", pageNumber, pageSize],
    queryFn: () => getUserNotifications({ pageNumber, pageSize })
  });

  const markRead = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    }
  });

  const rows = useMemo(
    () =>
      (query.data?.items ?? []).filter((item) => {
        if (!search.trim()) return true;
        return [item.subject, item.body, item.eventName, item.channel].join(" ").toLowerCase().includes(search.toLowerCase());
      }),
    [query.data?.items, search]
  );

  const columns: ColumnDef<NotificationDto>[] = [
    { accessorKey: "eventName", header: lt("Event") },
    { accessorKey: "subject", header: lt("Subject") },
    { accessorKey: "channel", header: lt("Channel") },
    { accessorKey: "queuedDate", header: lt("Queued"), cell: ({ row }) => language.formatLocalizedDateTime(row.original.queuedDate) },
    {
      id: "delivery",
      header: lt("Delivery"),
      cell: ({ row }) => {
        const mine = recipientForCurrentUser(row.original, session?.userId);
        return <StatusBadge status={mine?.deliveryStatus ?? row.original.status} />;
      }
    },
    {
      id: "read",
      header: lt("Read"),
      cell: ({ row }) => {
        const mine = recipientForCurrentUser(row.original, session?.userId);
        return <StatusBadge status={mine?.isRead ? "Approved" : "Pending"} />;
      }
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={lt("My Notifications")} description={lt("View in-app notifications, delivery state, and mark them as read.")} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="pt-6">
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
            rowActions={(row) => {
              const mine = recipientForCurrentUser(row, session?.userId);
              if (!mine || mine.isRead) return null;
              return (
                <Button size="sm" variant="outline" disabled={markRead.isPending} onClick={() => void markRead.mutateAsync(mine.id)}>
                  <CheckCheck className="h-4 w-4" />{lt("Mark Read")}</Button>
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function recipientForCurrentUser(notification: NotificationDto, userId?: string) {
  if (!userId) return null;
  return notification.recipients.find((recipient) => recipient.userId === userId) ?? null;
}
