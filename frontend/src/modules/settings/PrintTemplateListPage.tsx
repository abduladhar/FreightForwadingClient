import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getErpUiSettings, savePrintTemplates, type PrintTemplateSetting } from "@/api/settingsApi";
import { useAuth } from "@/auth/useAuth";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

export function PrintTemplateListPage() {
  const { session, hasPermission } = useAuth();
  const tenantId = session?.tenantId;
  const query = useQuery({
    queryKey: ["print-templates", tenantId],
    queryFn: () => getErpUiSettings(tenantId!),
    enabled: Boolean(tenantId)
  });
  const [rows, setRows] = useState<PrintTemplateSetting[]>([]);
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const save = useMutation({
    mutationFn: (items: PrintTemplateSetting[]) => savePrintTemplates(tenantId!, items),
    onSuccess: (result) => setRows(result.bundle.printTemplates)
  });

  useEffect(() => {
    if (!query.data) return;
    setRows(query.data.bundle.printTemplates);
  }, [query.data]);

  const filtered = rows.filter((item) => [item.code, item.name, item.moduleName, item.languageCode].join(" ").toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnDef<PrintTemplateSetting>[] = [
    { accessorKey: "code", header: lt("Code") },
    { accessorKey: "name", header: lt("Name") },
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "languageCode", header: lt("Language") },
    { accessorKey: "pageSize", header: lt("Page Size"), cell: ({ row }) => lt(row.original.pageSize) },
    { accessorKey: "orientation", header: lt("Orientation"), cell: ({ row }) => lt(row.original.orientation) },
    { id: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];

  if (!tenantId) return <div className="rounded-md border bg-yellow-50 p-4 text-sm text-yellow-800">{lt("Tenant context is required to manage print templates.")}</div>;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Print Templates")}
        description={lt("Maintain branded print layouts with dynamic placeholders and multilingual support.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Tenant.Update">
              <Link to="/settings/print-templates/designer">
                <Plus className="h-4 w-4" /> {lt("New Print Template")}
              </Link>
            </PermissionButton>
            <Button variant="outline" disabled={!hasPermission("Tenant.Update") || save.isPending} onClick={() => void save.mutateAsync(rows)}>
              {lt("Save Changes")}
            </Button>
          </>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={filtered}
            columns={columns}
            totalCount={filtered.length}
            pageNumber={pageNumber}
            pageSize={pageSize}
            search={search}
            onSearchChange={setSearch}
            onPaginationChange={(pn, ps) => {
              setPageNumber(pn);
              setPageSize(ps);
            }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => (
              <div className="flex items-center gap-1">
                <PermissionButton asChild permission="Tenant.Update" size="sm" variant="ghost">
                  <Link to={`/settings/print-templates/designer?id=${encodeURIComponent(row.id)}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </PermissionButton>
                <PermissionButton
                  permission="Tenant.Update"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setRows((previous) => [
                      ...previous,
                      {
                        ...row,
                        id: generateId(),
                        code: `${row.code}-COPY`,
                        name: `${row.name} Copy`,
                        isDefault: false
                      }
                    ])
                  }
                >
                  <Copy className="h-4 w-4" />
                </PermissionButton>
                <ConfirmDialog
                  title={lt("Delete print template?")}
                  description={row.name}
                  confirmText={lt("Delete")}
                  variant="danger"
                  onConfirm={async () => {
                    setRows((previous) => previous.filter((item) => item.id !== row.id));
                  }}
                >
                  <Button size="sm" variant="ghost" disabled={!hasPermission("Tenant.Update")}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </ConfirmDialog>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}`;
}
