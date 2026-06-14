import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { getBranchOptions } from "@/api/branchApi";
import { getRoles } from "@/api/roleApi";
import { getTenantOptions } from "@/api/tenantApi";
import { getUsers } from "@/api/userApi";
import type { AuditSearchRequest } from "@/api/auditApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { DataTable } from "@/components/common/DataTable";
import { ExportButtons } from "@/components/common/ExportButtons";
import { PrintPreview } from "@/components/common/PrintPreview";
import { ReportFilterPanel } from "@/components/common/ReportFilterPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exportFullCsv } from "@/utils/csvExport";
import { exportExcelReport } from "@/utils/excelExport";
import { exportPdfReport } from "@/utils/pdfExport";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export interface AuditFilterState extends AuditSearchRequest {
  search?: string;
}

export const defaultAuditFilters: AuditFilterState = {
  pageNumber: 1,
  pageSize: 20,
  failedOnly: false,
  search: ""
};

export function AuditFiltersPanel({
  value,
  onChange,
  onApply,
  onReset
}: {
  value: AuditFilterState;
  onChange: (patch: Partial<AuditFilterState>) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const tenants = useQuery({ queryKey: ["tenant-options"], queryFn: getTenantOptions });
  const branches = useQuery({ queryKey: ["branch-options"], queryFn: getBranchOptions });
  const users = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const roles = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  return (
    <ReportFilterPanel onApply={onApply} onReset={onReset}>
      <select className="h-10 rounded-md border px-3 text-sm" value={value.tenantId ?? ""} onChange={(e) => onChange({ tenantId: e.target.value || undefined })}>
        <option value="">{lt("All tenants")}</option>
        {(tenants.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}
      </select>
      <select className="h-10 rounded-md border px-3 text-sm" value={value.branchId ?? ""} onChange={(e) => onChange({ branchId: e.target.value || undefined })}>
        <option value="">{lt("All branches")}</option>
        {(branches.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}
      </select>
      <select className="h-10 rounded-md border px-3 text-sm" value={value.userId ?? ""} onChange={(e) => onChange({ userId: e.target.value || undefined })}>
        <option value="">{lt("All users")}</option>
        {(users.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.firstName} {x.lastName} ({x.userName})</option>)}
      </select>
      <select className="h-10 rounded-md border px-3 text-sm" value={value.role ?? ""} onChange={(e) => onChange({ role: e.target.value || undefined })}>
        <option value="">{lt("All roles")}</option>
        {(roles.data ?? []).map((x) => <option key={x.id} value={x.name}>{x.name}</option>)}
      </select>
      <input className="h-10 rounded-md border px-3 text-sm" placeholder={lt("Module")} value={value.module ?? ""} onChange={(e) => onChange({ module: e.target.value || undefined })} />
      <input className="h-10 rounded-md border px-3 text-sm" placeholder={lt("Action type")} value={value.actionType ?? ""} onChange={(e) => onChange({ actionType: e.target.value || undefined })} />
      <input className="h-10 rounded-md border px-3 text-sm" placeholder={lt("Entity name")} value={value.entityName ?? ""} onChange={(e) => onChange({ entityName: e.target.value || undefined })} />
      <input className="h-10 rounded-md border px-3 text-sm" placeholder={lt("Record number")} value={value.recordNumber ?? ""} onChange={(e) => onChange({ recordNumber: e.target.value || undefined })} />
      <input className="h-10 rounded-md border px-3 text-sm" type="datetime-local" value={toInputDate(value.dateFrom)} onChange={(e) => onChange({ dateFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
      <input className="h-10 rounded-md border px-3 text-sm" type="datetime-local" value={toInputDate(value.dateTo)} onChange={(e) => onChange({ dateTo: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
      <input className="h-10 rounded-md border px-3 text-sm" placeholder={lt("IP address")} value={value.ipAddress ?? ""} onChange={(e) => onChange({ ipAddress: e.target.value || undefined })} />
      <select className="h-10 rounded-md border px-3 text-sm" value={value.status ?? ""} onChange={(e) => onChange({ status: e.target.value || undefined })}>
        <option value="">{lt("All statuses")}</option>
        <option value="Success">{lt("Success")}</option>
        <option value="Failed">{lt("Failed")}</option>
        <option value="Queued">{lt("Queued")}</option>
        <option value="Sent">{lt("Sent")}</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={Boolean(value.failedOnly)} onChange={(e) => onChange({ failedOnly: e.target.checked })} />
        {lt("Failed actions only")}
      </label>
      <input className="h-10 rounded-md border px-3 text-sm" placeholder={lt("Quick search")} value={value.search ?? ""} onChange={(e) => onChange({ search: e.target.value })} />
    </ReportFilterPanel>
  );
}

export function statusColumn<T extends { status: string }>(): ColumnDef<T> {
  return {
    id: "status",
    header: lt("Status"),
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  };
}

export function createdDateColumn<T extends { createdDate: string }>(format: (value: string | Date | null | undefined) => string): ColumnDef<T> {
  return {
    accessorKey: "createdDate",
    header: lt("Created"),
    cell: ({ row }) => format(row.original.createdDate)
  };
}

export function AuditTablePage<T extends { id: string; createdDate?: string; status?: string }>({
  title,
  description,
  exportPrefix,
  filters,
  setFilters,
  queryResult,
  columns,
  mapExportRows
}: {
  title: string;
  description: string;
  exportPrefix: string;
  filters: AuditFilterState;
  setFilters: (next: AuditFilterState) => void;
  queryResult: { data?: { items: T[]; totalCount: number; pageNumber: number; pageSize: number }; isLoading: boolean; isError: boolean; refetch: () => unknown };
  columns: ColumnDef<T>[];
  mapExportRows: (rows: T[]) => Record<string, unknown>[];
}) {
  const workspace = useWorkspace();
  const { session } = useAuth();
  const language = useLanguage();
  const [printOpen, setPrintOpen] = useState(false);
  const rows = queryResult.data?.items ?? [];
  const exportRows = mapExportRows(rows);

  useEffect(() => {
    if (!workspace.tenantCode) return;
    if (filters.tenantId || filters.branchId) return;
    setFilters({
      ...filters,
      tenantId: session?.tenantId,
      branchId: workspace.branchId ?? undefined,
      pageNumber: 1
    });
  }, [session?.tenantId, workspace.tenantCode, workspace.branchId, filters.tenantId, filters.branchId]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <ExportButtons
              onExportCsv={() => exportFullCsv(exportRows, `${exportPrefix}.csv`)}
              onExportExcel={() =>
                void exportExcelReport({
                  fileName: `${exportPrefix}.xlsx`,
                  reportTitle: title,
                  tenantName: workspace.tenantCode,
                  branchName: workspace.branchName,
                  sheets: [
                    {
                      sheetName: lt("Audit"),
                      columns: Object.keys(exportRows[0] ?? { no_data: lt("No Data") }).map((key) => ({ key, header: lt(key) })),
                      rows: (exportRows.length ? exportRows : [{ no_data: lt("No Data") }]) as Record<string, unknown>[]
                    }
                  ]
                })
              }
              onExportPdf={() =>
                void exportPdfReport({
                  fileName: `${exportPrefix}.pdf`,
                  title,
                  tenantName: workspace.tenantCode,
                  branchName: workspace.branchName,
                  currencyCode: workspace.baseCurrency,
                  cultureCode: workspace.cultureCode,
                  columns: Object.keys(exportRows[0] ?? { no_data: lt("No Data") }).map((key) => ({ key, label: lt(key) })),
                  rows: (exportRows.length ? exportRows : [{ no_data: lt("No Data") }]) as Record<string, unknown>[]
                })
              }
            />
            <Button variant="outline" size="sm" onClick={() => setPrintOpen((x) => !x)}>{lt("Print Preview")}</Button>
          </>
        }
      />

      <AuditFiltersPanel
        value={filters}
        onChange={(patch) => setFilters({ ...filters, ...patch })}
        onApply={() => setFilters({ ...filters, pageNumber: 1 })}
        onReset={() => setFilters({ ...defaultAuditFilters, pageNumber: 1, pageSize: filters.pageSize })}
      />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={rows}
            columns={columns}
            totalCount={queryResult.data?.totalCount ?? 0}
            pageNumber={queryResult.data?.pageNumber ?? filters.pageNumber ?? 1}
            pageSize={queryResult.data?.pageSize ?? filters.pageSize ?? 20}
            search={filters.search}
            onSearchChange={(value) => setFilters({ ...filters, search: value })}
            onPaginationChange={(pageNumber, pageSize) => setFilters({ ...filters, pageNumber, pageSize })}
            isLoading={queryResult.isLoading}
            isError={queryResult.isError}
            onRetry={() => void queryResult.refetch()}
            rowActions={(row) => (
              <PermissionButton asChild permission="AuditLog.Read" size="sm" variant="ghost">
                <Link to={`/audit/${row.id}`} state={{ audit: row }}>
                  <Eye className="h-4 w-4" />
                </Link>
              </PermissionButton>
            )}
          />
        </CardContent>
      </Card>

      {printOpen ? (
        <PrintPreview title={`${title} ${lt("Print Preview")}`}>
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={String(row.id)} className="rounded border p-2 text-xs">
                {Object.entries(row as Record<string, unknown>).map(([key, value]) => (
                  <p key={key}><span className="font-medium">{lt(key)}:</span> {renderValue(value, language.formatLocalizedDateTime)}</p>
                ))}
              </div>
            ))}
          </div>
        </PrintPreview>
      ) : null}
    </div>
  );
}

function renderValue(value: unknown, formatDateTime: (value: string | Date | null | undefined) => string) {
  if (value == null) return "-";
  if (typeof value === "string" && value.includes("T") && !Number.isNaN(new Date(value).getTime())) return formatDateTime(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function toInputDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
