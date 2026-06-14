import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Globe2, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteCountry, searchCountries, type CountryDto } from "@/api/countryApi";
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

export function CountryListPage() {
  const m = useMasterDataI18n("Country");
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [active, setActive] = useState<"" | "true" | "false">("");

  const query = useQuery({
    queryKey: ["countries", pageNumber, pageSize, search, name, countryCode, isoCode, active],
    queryFn: () =>
      searchCountries({
        pageNumber,
        pageSize,
        search,
        name,
        countryCode,
        isoCode,
        isActive: active === "" ? undefined : active === "true"
      })
  });

  const remove = useMutation({
    mutationFn: deleteCountry,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["countries"] })
  });

  const columns = useMemo<ColumnDef<CountryDto>[]>(
    () => [
      { accessorKey: "serialNo", header: m("Serial No") },
      { accessorKey: "name", header: m("Name") },
      { accessorKey: "countryCode", header: m("Country Code") },
      { accessorKey: "isoCode", header: m("ISO Code") },
      { accessorKey: "mobileCode", header: m("Mobile Code") },
      { id: "active", header: m("Active"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
    ],
    [m]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={m("Countries")}
        description={m("Manage country codes, ISO codes, and mobile dialing codes for freight forwarding masters.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton className={masterDataButtonClass} asChild permission="Country.Create">
              <Link to="/countries/new">
                <Plus className="h-4 w-4" /> {m("New Country")}
              </Link>
            </PermissionButton>
          </>
        }
      />
      <Card className={masterDataPanelClass}>
        <CardContent className={`${masterDataPanelContentClass} space-y-4`}>
          <div className="grid gap-2 md:grid-cols-4">
            <Input placeholder={m("Filter by name")} value={name} onChange={(event) => setName(event.target.value)} />
            <Input placeholder={m("Filter by country code")} value={countryCode} onChange={(event) => setCountryCode(event.target.value)} />
            <Input placeholder={m("Filter by ISO code")} value={isoCode} onChange={(event) => setIsoCode(event.target.value)} />
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
                <PermissionButton className={masterDataButtonClass} asChild permission="Country.Update" size="sm" variant="ghost">
                  <Link to={`/countries/${row.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </PermissionButton>
                {hasPermission("Country.Delete") ? (
                  <ConfirmDialog
                    title={m("Delete country?")}
                    description={`${row.countryCode} - ${row.name}`}
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

export const CountryIcon = Globe2;
