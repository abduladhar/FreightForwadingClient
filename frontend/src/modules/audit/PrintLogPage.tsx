import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getPrintLogs, type AccessLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function PrintLogPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({ queryKey: ["audit-print-logs", filters], queryFn: () => getPrintLogs(stripSearch(filters)) });
  const columns: ColumnDef<AccessLogDto>[] = [
    createdDateColumn<AccessLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "userName", header: lt("User") },
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "actionName", header: lt("Action") },
    { accessorKey: "requestUrl", header: lt("Request URL") },
    { accessorKey: "ipAddress", header: lt("IP") },
    statusColumn<AccessLogDto>()
  ];
  return <AuditTablePage title={lt("Print Logs")} description={lt("Audit trail for print preview and print actions.")} exportPrefix="print-logs" filters={filters} setFilters={setFilters} queryResult={query} columns={columns} mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, userName: x.userName, moduleName: x.moduleName, actionName: x.actionName, requestUrl: x.requestUrl, ipAddress: x.ipAddress, status: x.status }))} />;
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
