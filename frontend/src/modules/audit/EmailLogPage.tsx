import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getEmailLogs, type AccessLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function EmailLogPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({ queryKey: ["audit-email-logs", filters], queryFn: () => getEmailLogs(stripSearch(filters)) });
  const columns: ColumnDef<AccessLogDto>[] = [
    createdDateColumn<AccessLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "userName", header: lt("User") },
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "actionName", header: lt("Action") },
    { accessorKey: "detail1", header: lt("Recipient/Detail") },
    { accessorKey: "requestUrl", header: lt("Request URL") },
    statusColumn<AccessLogDto>()
  ];
  return <AuditTablePage title={lt("Email Logs")} description={lt("Audit trail for email delivery and failures.")} exportPrefix="email-logs" filters={filters} setFilters={setFilters} queryResult={query} columns={columns} mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, userName: x.userName, moduleName: x.moduleName, actionName: x.actionName, detail1: x.detail1, requestUrl: x.requestUrl, status: x.status }))} />;
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
