import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getUserActivityLogs, type UserActivityLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function UserActivityLogPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({
    queryKey: ["audit-user-activity", filters],
    queryFn: () => getUserActivityLogs(stripSearch(filters))
  });
  const columns: ColumnDef<UserActivityLogDto>[] = [
    createdDateColumn<UserActivityLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "userName", header: lt("User") },
    { accessorKey: "userRole", header: lt("Role") },
    { accessorKey: "activityType", header: lt("Activity Type") },
    { accessorKey: "activityName", header: lt("Activity") },
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "ipAddress", header: lt("IP") },
    statusColumn<UserActivityLogDto>()
  ];
  return (
    <AuditTablePage
      title={lt("User Activity Timeline")}
      description={lt("Timeline view of user activities, requests, and outcomes.")}
      exportPrefix="user-activity"
      filters={filters}
      setFilters={setFilters}
      queryResult={query}
      columns={columns}
      mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, user: x.userName, role: x.userRole, activityType: x.activityType, activityName: x.activityName, module: x.moduleName, status: x.status, ipAddress: x.ipAddress }))}
    />
  );
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
