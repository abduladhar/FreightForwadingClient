import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deletePackageType, searchPackageTypes, type PackageTypeDto } from "@/api/packageTypeApi";
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

export function PackageTypeListPage() {
  const m = useMasterDataI18n("PackageType");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [packageCode, setPackageCode] = useState("");
  const [packageName, setPackageName] = useState("");
  const [active, setActive] = useState<"" | "true" | "false">("");

  const query = useQuery({
    queryKey: ["package-types", pageNumber, pageSize, search, packageCode, packageName, active],
    queryFn: () =>
      searchPackageTypes({
        pageNumber,
        pageSize,
        search,
        packageCode,
        packageName,
        isActive: active === "" ? undefined : active === "true"
      })
  });

  const remove = useMutation({
    mutationFn: deletePackageType,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["package-types"] })
  });

  const columns = useMemo<ColumnDef<PackageTypeDto>[]>(
    () => [
      { accessorKey: "packageCode", header: m("Package Code") },
      { accessorKey: "packageName", header: m("Package Name") },
      { accessorKey: "description", header: m("Description") },
      { id: "active", header: m("Active"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
    ],
    [m]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={m("Package Types")}
        description={m("Manage package type master records.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton className={masterDataButtonClass} asChild permission="PackageType.Create">
              <Link to="/package-types/new">
                <Plus className="h-4 w-4" /> {m("New Package Type")}
              </Link>
            </PermissionButton>
          </>
        }
      />
      <Card className={masterDataPanelClass}>
        <CardContent className={`${masterDataPanelContentClass} space-y-4`}>
          <div className="grid gap-2 md:grid-cols-3">
            <Input placeholder={m("Filter by package code")} value={packageCode} onChange={(event) => setPackageCode(event.target.value)} />
            <Input placeholder={m("Filter by package name")} value={packageName} onChange={(event) => setPackageName(event.target.value)} />
            <select className="h-10 rounded-md border px-3 text-sm" value={active} onChange={(event) => setActive(event.target.value as "" | "true" | "false")}>
              <option value="">{m("All Status")}</option>
              <option value="true">{m("Active")}</option>
              <option value="false">{m("Inactive")}</option>
            </select>
          </div>
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search={search}
            onSearchChange={setSearch}
            onPaginationChange={(nextPageNumber, nextPageSize) => {
              setPageNumber(nextPageNumber);
              setPageSize(nextPageSize);
            }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => (
              <div className="flex gap-1">
                <PermissionButton className={masterDataButtonClass} asChild permission="PackageType.Update" size="sm" variant="ghost">
                  <Link to={`/package-types/${row.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </PermissionButton>
                {hasPermission("PackageType.Delete") ? (
                  <ConfirmDialog
                    title={m("Delete package type?")}
                    description={`${row.packageCode} - ${row.packageName}`}
                    confirmText={m("Delete")}
                    variant="danger"
                    onConfirm={async () => remove.mutateAsync(row.id)}
                  >
                    <Button className={masterDataButtonClass} size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </ConfirmDialog>
                ) : null}
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
