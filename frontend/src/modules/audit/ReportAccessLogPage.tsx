import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getReportAccessLogs, type AccessLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function ReportAccessLogPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({ queryKey: ["audit-report-access", filters], queryFn: () => getReportAccessLogs(stripSearch(filters)) });
  const columns: ColumnDef<AccessLogDto>[] = [
    createdDateColumn<AccessLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "userName", header: lt("User") },
    { accessorKey: "userRole", header: lt("Role") },
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "actionName", header: lt("Action") },
    { accessorKey: "requestUrl", header: lt("URL") },
    { accessorKey: "ipAddress", header: lt("IP") },
    statusColumn<AccessLogDto>()
  ];
  return <AuditTablePage title={lt("Report Access Logs")} description={lt("Track report views and access patterns.")} exportPrefix="report-access-logs" filters={filters} setFilters={setFilters} queryResult={query} columns={columns} mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, userName: x.userName, userRole: x.userRole, moduleName: x.moduleName, actionName: x.actionName, requestUrl: x.requestUrl, ipAddress: x.ipAddress, status: x.status }))} />;
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
