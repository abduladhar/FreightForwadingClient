import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { activateRateMaster, deactivateRateMaster, deleteRateMaster, searchRateMasters, type RateMasterDto } from "@/api/rateMasterApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRateMasterI18n } from "@/modules/rateMasters/rateMasterI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function RateMasterListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const r = useRateMasterI18n();
  const query = useQuery({ queryKey: ["rate-masters", pageNumber, pageSize, search], queryFn: () => searchRateMasters({ pageNumber, pageSize, search }) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["rate-masters"] });
  const remove = useMutation({ mutationFn: deleteRateMaster, onSuccess: invalidate });
  const activate = useMutation({ mutationFn: activateRateMaster, onSuccess: invalidate });
  const deactivate = useMutation({ mutationFn: deactivateRateMaster, onSuccess: invalidate });
  const columns: ColumnDef<RateMasterDto>[] = [
    { accessorKey: "rateCode", header: r("Code") },
    { accessorKey: "rateName", header: r("Name") },
    { accessorKey: "rateScope", header: r("Scope"), cell: ({ row }) => r(row.original.rateScope) },
    { accessorKey: "modeOfTransport", header: r("Mode"), cell: ({ row }) => r(row.original.modeOfTransport) },
    { accessorKey: "shipmentType", header: r("Shipment"), cell: ({ row }) => r(row.original.shipmentType) },
    { accessorKey: "validFromDate", header: r("Valid From") },
    { accessorKey: "validToDate", header: r("Valid To") },
    { accessorKey: "isActive", header: r("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} label={r(row.original.isActive ? "Active" : "Inactive")} /> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={r("Rate Master")} description={r("Manage transport and charge-head rate definitions.")} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="RateMaster.Create"><Link to="/rate-masters/new"><Plus className="h-4 w-4" /> {r("New Rate")}</Link></PermissionButton></>} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => (
            <div className="flex items-center gap-1">
              <PermissionButton className={masterDataButtonClass} asChild permission="RateMaster.Read" size="sm" variant="ghost"><Link title={r("View")} to={`/rate-masters/${row.id}`}><Eye className="h-4 w-4" /></Link></PermissionButton>
              <PermissionButton className={masterDataButtonClass} asChild permission="RateMaster.Update" size="sm" variant="ghost"><Link title={r("Edit")} to={`/rate-masters/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton>
              {hasPermission("RateMaster.Override") ? <Button className={masterDataButtonClass} title={r(row.isActive ? "Deactivate" : "Activate")} size="sm" variant="ghost" onClick={() => void (row.isActive ? deactivate.mutateAsync(row.id) : activate.mutateAsync(row.id))}><Power className={`h-4 w-4 ${row.isActive ? "text-amber-600" : "text-emerald-600"}`} /></Button> : null}
              {hasPermission("RateMaster.Delete") ? <ConfirmDialog title={r("Delete rate master?")} description={row.rateName} confirmText={r("Delete")} variant="danger" onConfirm={async () => remove.mutateAsync(row.id)}><Button className={masterDataButtonClass} title={r("Delete")} size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-600" /></Button></ConfirmDialog> : null}
            </div>
          )} />
        </CardContent>
      </Card>
    </div>
  );
}
