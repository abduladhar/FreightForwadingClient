import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getEntityChangeLogs, type EntityChangeLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function EntityChangeLogPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({
    queryKey: ["audit-entity-changes", filters],
    queryFn: () => getEntityChangeLogs(stripSearch(filters))
  });
  const columns: ColumnDef<EntityChangeLogDto>[] = [
    createdDateColumn<EntityChangeLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "entityName", header: lt("Entity") },
    { accessorKey: "recordNumber", header: lt("Record #") },
    { accessorKey: "actionType", header: lt("Action Type") },
    { accessorKey: "correlationId", header: lt("Correlation ID") }
  ];
  return (
    <AuditTablePage
      title={lt("Entity Change History")}
      description={lt("Track old/new values and field-level modifications by entity.")}
      exportPrefix="entity-change-logs"
      filters={filters}
      setFilters={setFilters}
      queryResult={query}
      columns={columns}
      mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, entityName: x.entityName, recordNumber: x.recordNumber, actionType: x.actionType, oldValuesJson: x.oldValuesJson, newValuesJson: x.newValuesJson, changedFieldsJson: x.changedFieldsJson, correlationId: x.correlationId }))}
    />
  );
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
