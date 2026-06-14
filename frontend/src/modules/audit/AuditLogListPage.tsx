import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { searchAuditLogs, type AuditLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function AuditLogListPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => searchAuditLogs(stripSearch(filters))
  });

  const columns: ColumnDef<AuditLogDto>[] = [
    createdDateColumn<AuditLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "userName", header: lt("User") },
    { accessorKey: "userRole", header: lt("Role") },
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "entityName", header: lt("Entity") },
    { accessorKey: "recordNumber", header: lt("Record #") },
    { accessorKey: "actionType", header: lt("Action Type") },
    { accessorKey: "actionName", header: lt("Action") },
    { accessorKey: "ipAddress", header: lt("IP") },
    statusColumn<AuditLogDto>()
  ];

  return (
    <AuditTablePage
      title={lt("Audit Logs")}
      description={lt("Comprehensive user and system activity logs with full traceability.")}
      exportPrefix="audit-logs"
      filters={filters}
      setFilters={setFilters}
      queryResult={query}
      columns={columns}
      mapExportRows={(rows) =>
        rows.map((x) => ({
          createdDate: x.createdDate,
          user: x.userName ?? x.userId,
          role: x.userRole,
          module: x.moduleName,
          entity: x.entityName,
          recordNumber: x.recordNumber,
          actionType: x.actionType,
          actionName: x.actionName,
          status: x.status,
          ipAddress: x.ipAddress,
          correlationId: x.correlationId
        }))
      }
    />
  );
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
