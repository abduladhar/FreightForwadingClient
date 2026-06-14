import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteNotificationTemplate, searchNotificationTemplates, type NotificationTemplateDto, notificationChannels, notificationEvents } from "@/api/notificationApi";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/useAuth";
import { lt } from "@/modules/operationsLocalization";

export function NotificationTemplateListPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [eventName, setEventName] = useState("");
  const [channel, setChannel] = useState("");
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");

  const query = useQuery({
    queryKey: ["notification-templates", pageNumber, pageSize, search, eventName, channel, isActive],
    queryFn: () =>
      searchNotificationTemplates({
        pageNumber,
        pageSize,
        eventName: eventName || undefined,
        channel: channel || undefined,
        isActive: isActive === "" ? undefined : isActive === "true"
      })
  });

  const remove = useMutation({
    mutationFn: deleteNotificationTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    }
  });

  const rows = (query.data?.items ?? []).filter((item) => {
    if (!search.trim()) return true;
    const haystack = [item.templateCode, item.eventName, item.channel, item.cultureCode ?? ""].join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const columns: ColumnDef<NotificationTemplateDto>[] = [
    { accessorKey: "templateCode", header: lt("Code") },
    { accessorKey: "eventName", header: lt("Event") },
    { accessorKey: "channel", header: lt("Channel") },
    { accessorKey: "cultureCode", header: lt("Culture") },
    {
      id: "default",
      header: lt("Default"),
      cell: ({ row }) => <StatusBadge status={row.original.isDefault ? "Approved" : "Draft"} />
    },
    {
      id: "status",
      header: lt("Status"),
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} />
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Notification Templates")}
        description={lt("Manage channel-wise and language-aware templates for operational events.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Notification.Create">
              <Link to="/notifications/templates/new">
                <Plus className="h-4 w-4" />{lt("New Template")}</Link>
            </PermissionButton>
          </>
        }
      />
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
            <select className="h-10 rounded-md border px-3 text-sm" value={isActive} onChange={(event) => setIsActive(event.target.value as "" | "true" | "false")}>
              <option value="">{lt("All statuses")}</option>
              <option value="true">{lt("Active")}</option>
              <option value="false">{lt("Inactive")}</option>
            </select>
            <div className="flex items-center justify-end">
              <Button variant="outline" onClick={() => { setEventName(""); setChannel(""); setIsActive(""); setSearch(""); setPageNumber(1); }}>{lt("Reset")}</Button>
            </div>
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
            rowActions={(row) => (
              <div className="flex items-center gap-1">
                <PermissionButton asChild permission="Notification.Update" size="sm" variant="ghost">
                  <Link to={`/notifications/templates/${row.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </PermissionButton>
                {hasPermission("Notification.Delete") ? (
                  <ConfirmDialog
                    title={lt("Delete template?")}
                    description={row.templateCode}
                    confirmText={lt("Delete")}
                    variant="danger"
                    onConfirm={async () => remove.mutateAsync(row.id)}
                  >
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </ConfirmDialog>
                ) : null}
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
