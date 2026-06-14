import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteShippingPort, searchShippingPorts, type ShippingPortDto } from "@/api/shippingPortApi";
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

export function ShippingPortListPage() {
  const m = useMasterDataI18n("ShippingPort");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [portCode, setPortCode] = useState("");
  const [portName, setPortName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [portType, setPortType] = useState("");
  const [active, setActive] = useState<"" | "true" | "false">("");

  const query = useQuery({
    queryKey: ["shipping-ports", pageNumber, pageSize, search, portCode, portName, countryName, portType, active],
    queryFn: () =>
      searchShippingPorts({
        pageNumber,
        pageSize,
        search,
        portCode,
        portName,
        countryName,
        portType: portType || undefined,
        isActive: active === "" ? undefined : active === "true"
      })
  });

  const remove = useMutation({
    mutationFn: deleteShippingPort,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["shipping-ports"] })
  });

  const columns = useMemo<ColumnDef<ShippingPortDto>[]>(
    () => [
      { accessorKey: "portCode", header: m("Port Code") },
      { accessorKey: "portName", header: m("Port Name") },
      { accessorKey: "countryName", header: m("Country") },
      { accessorKey: "portType", header: m("Port Type") },
      {
        id: "active",
        header: m("Active"),
        cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} />
      }
    ],
    [m]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={m("Shipping Ports")}
        description={m("Manage shipping port master records.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton className={masterDataButtonClass} asChild permission="ShippingPort.Create">
              <Link to="/shipping-ports/new">
                <Plus className="h-4 w-4" /> {m("New Shipping Port")}
              </Link>
            </PermissionButton>
          </>
        }
      />
      <Card className={masterDataPanelClass}>
        <CardContent className={`${masterDataPanelContentClass} space-y-4`}>
          <div className="grid gap-2 md:grid-cols-5">
            <Input placeholder={m("Filter by port code")} value={portCode} onChange={(event) => setPortCode(event.target.value)} />
            <Input placeholder={m("Filter by port name")} value={portName} onChange={(event) => setPortName(event.target.value)} />
            <Input placeholder={m("Filter by country")} value={countryName} onChange={(event) => setCountryName(event.target.value)} />
            <select className="h-10 rounded-md border px-3 text-sm" value={portType} onChange={(event) => setPortType(event.target.value)}>
              <option value="">{m("All Port Types")}</option>
              <option value="Sea">{m("Sea")}</option>
              <option value="Air">{m("Air")}</option>
              <option value="Road">{m("Road")}</option>
              <option value="Inland">{m("Inland")}</option>
            </select>
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
                <PermissionButton className={masterDataButtonClass} asChild permission="ShippingPort.Update" size="sm" variant="ghost">
                  <Link to={`/shipping-ports/${row.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </PermissionButton>
                {hasPermission("ShippingPort.Delete") ? (
                  <ConfirmDialog
                    title={m("Delete shipping port?")}
                    description={`${row.portCode} - ${row.portName}`}
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
