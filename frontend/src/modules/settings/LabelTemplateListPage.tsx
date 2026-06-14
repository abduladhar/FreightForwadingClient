import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getErpUiSettings, saveLabelTemplates, type LabelTemplateSetting } from "@/api/settingsApi";
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

export function LabelTemplateListPage() {
  const { session, hasPermission } = useAuth();
  const tenantId = session?.tenantId;
  const query = useQuery({
    queryKey: ["label-templates", tenantId],
    queryFn: () => getErpUiSettings(tenantId!),
    enabled: Boolean(tenantId)
  });
  const [rows, setRows] = useState<LabelTemplateSetting[]>([]);
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const save = useMutation({
    mutationFn: (items: LabelTemplateSetting[]) => saveLabelTemplates(tenantId!, items),
    onSuccess: (result) => setRows(result.bundle.labelTemplates)
  });

  useEffect(() => {
    if (!query.data) return;
    setRows(query.data.bundle.labelTemplates);
  }, [query.data]);

  const filtered = rows.filter((item) =>
    [item.code, item.name, item.moduleName, item.languageCode, item.destinationCode ?? ""].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<LabelTemplateSetting>[] = [
    { accessorKey: "code", header: lt("Code") },
    { accessorKey: "name", header: lt("Name") },
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "destinationCode", header: lt("Destination") },
    { accessorKey: "languageCode", header: lt("Language") },
    { id: "size", header: lt("Size"), cell: ({ row }) => `${row.original.labelWidthMm}mm x ${row.original.labelHeightMm}mm` },
    { id: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];

  if (!tenantId) return <div className="rounded-md border bg-yellow-50 p-4 text-sm text-yellow-800">{lt("Tenant context is required to manage label templates.")}</div>;

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Label Templates")}
        description={lt("Destination-specific shipment labels with barcode/QR and language-specific content.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton asChild permission="Tenant.Update">
              <Link to="/settings/label-templates/designer">
                <Plus className="h-4 w-4" /> {lt("New Label Template")}
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
                  <Link to={`/settings/label-templates/designer?id=${encodeURIComponent(row.id)}`}>
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
                  title={lt("Delete label template?")}
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
