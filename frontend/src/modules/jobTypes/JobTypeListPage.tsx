import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteJobType, searchJobTypes, type JobTypeDto } from "@/api/jobApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function JobTypeListPage() {
  const m = useMasterDataI18n("JobType");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [jobTypeCode, setJobTypeCode] = useState("");
  const [jobTypeName, setJobTypeName] = useState("");
  const [active, setActive] = useState<"" | "true" | "false">("");

  const query = useQuery({ queryKey: ["job-types", pageNumber, pageSize, search, jobTypeCode, jobTypeName, active], queryFn: () => searchJobTypes({ pageNumber, pageSize, search, jobTypeCode, jobTypeName, isActive: active === "" ? undefined : active === "true" }) });
  const remove = useMutation({ mutationFn: deleteJobType, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["job-types"] }) });
  const columns = useMemo<ColumnDef<JobTypeDto>[]>(() => [
    { accessorKey: "jobTypeCode", header: m("Job Type Code") },
    { accessorKey: "jobTypeShortCode", header: m("Short Code") },
    { accessorKey: "jobTypeName", header: m("Job Type Name") },
    { accessorKey: "description", header: m("Description") },
    { id: "active", header: m("Active"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ], [m]);

  return (
    <div className="space-y-4">
      <PageHeader title={m("Job Types")} description={m("Manage job type master records and short codes for job numbering.")} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="JobType.Create"><Link to="/job-types/new"><Plus className="h-4 w-4" /> {m("New Job Type")}</Link></PermissionButton></>} />
      <Card className={masterDataPanelClass}>
        <CardContent className={`${masterDataPanelContentClass} space-y-4`}>
          <div className="grid gap-2 md:grid-cols-3">
            <Input placeholder={m("Filter by code")} value={jobTypeCode} onChange={(event) => setJobTypeCode(event.target.value)} />
            <Input placeholder={m("Filter by name")} value={jobTypeName} onChange={(event) => setJobTypeName(event.target.value)} />
            <select className="h-10 rounded-md border px-3 text-sm" value={active} onChange={(event) => setActive(event.target.value as "" | "true" | "false")}><option value="">{m("All Status")}</option><option value="true">{m("Active")}</option><option value="false">{m("Inactive")}</option></select>
          </div>
          <DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <div className="flex gap-1"><PermissionButton className={masterDataButtonClass} asChild permission="JobType.Update" size="sm" variant="ghost"><Link to={`/job-types/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton>{hasPermission("JobType.Delete") ? <ConfirmDialog title={m("Delete job type?")} description={`${row.jobTypeCode} - ${row.jobTypeName}`} confirmText={m("Delete")} variant="danger" onConfirm={async () => remove.mutateAsync(row.id)}><Button className={masterDataButtonClass} size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-600" /></Button></ConfirmDialog> : null}</div>} />
        </CardContent>
      </Card>
    </div>
  );
}
