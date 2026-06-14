import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getExportLogs, type AccessLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function ExportLogPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({ queryKey: ["audit-export-logs", filters], queryFn: () => getExportLogs(stripSearch(filters)) });
  const columns: ColumnDef<AccessLogDto>[] = [
    createdDateColumn<AccessLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "userName", header: lt("User") },
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "actionName", header: lt("Action") },
    { accessorKey: "detail1", header: lt("Detail 1") },
    { accessorKey: "detail2", header: lt("Detail 2") },
    { accessorKey: "ipAddress", header: lt("IP") },
    statusColumn<AccessLogDto>()
  ];
  return <AuditTablePage title={lt("Export Logs")} description={lt("Audit events for CSV/Excel/PDF export operations.")} exportPrefix="export-logs" filters={filters} setFilters={setFilters} queryResult={query} columns={columns} mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, userName: x.userName, moduleName: x.moduleName, actionName: x.actionName, detail1: x.detail1, detail2: x.detail2, ipAddress: x.ipAddress, status: x.status }))} />;
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
