import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getApiRequestLogs, type ApiRequestLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function ApiRequestLogPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({ queryKey: ["audit-api-request-logs", filters], queryFn: () => getApiRequestLogs(stripSearch(filters)) });
  const columns: ColumnDef<ApiRequestLogDto>[] = [
    createdDateColumn<ApiRequestLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "userName", header: lt("User") },
    { accessorKey: "httpMethod", header: lt("Method") },
    { accessorKey: "requestUrl", header: lt("Request URL") },
    { accessorKey: "responseStatusCode", header: lt("Response") },
    { accessorKey: "durationMs", header: lt("Duration (ms)") },
    { accessorKey: "ipAddress", header: lt("IP") },
    statusColumn<ApiRequestLogDto>()
  ];
  return <AuditTablePage title={lt("API Request Logs")} description={lt("Request/response audit trail with status, duration, and payload metadata.")} exportPrefix="api-request-logs" filters={filters} setFilters={setFilters} queryResult={query} columns={columns} mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, userName: x.userName, httpMethod: x.httpMethod, requestUrl: x.requestUrl, responseStatusCode: x.responseStatusCode, durationMs: x.durationMs, status: x.status, errorMessage: x.errorMessage, ipAddress: x.ipAddress, correlationId: x.correlationId }))} />;
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
