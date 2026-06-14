import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getUserActivityLogs, type UserActivityLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function LoginHistoryPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>({ ...defaultAuditFilters, module: "Authentication" });
  const query = useQuery({
    queryKey: ["audit-login-history", filters],
    queryFn: async () => {
      const data = await getUserActivityLogs(stripSearch(filters));
      const items = data.items.filter((x) => /login|logout/i.test(`${x.activityType} ${x.activityName}`));
      return { ...data, items, totalCount: items.length };
    }
  });
  const columns: ColumnDef<UserActivityLogDto>[] = [
    createdDateColumn<UserActivityLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "userName", header: lt("User") },
    { accessorKey: "userRole", header: lt("Role") },
    { accessorKey: "activityType", header: lt("Type") },
    { accessorKey: "activityName", header: lt("Action") },
    { accessorKey: "ipAddress", header: lt("IP Address") },
    { accessorKey: "requestUrl", header: lt("URL") },
    statusColumn<UserActivityLogDto>()
  ];
  return (
    <AuditTablePage
      title={lt("Login History")}
      description={lt("Authentication success/failure history for users.")}
      exportPrefix="login-history"
      filters={filters}
      setFilters={setFilters}
      queryResult={query}
      columns={columns}
      mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, user: x.userName, role: x.userRole, activityType: x.activityType, activityName: x.activityName, ipAddress: x.ipAddress, requestUrl: x.requestUrl, status: x.status }))}
    />
  );
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
