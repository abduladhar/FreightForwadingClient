import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Pencil, Plus, XCircle } from "lucide-react";
import { saveBoeInventory, searchBoeInventories, type BoeInventoryDto } from "@/api/billOfEntryApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function BoeInventoryMasterPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BoeInventoryDto | null>(null);
  const [inventoryCode, setInventoryCode] = useState("");
  const [inventoryName, setInventoryName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const query = useQuery({
    queryKey: ["boe-inventory-masters", pageNumber, pageSize, search],
    queryFn: () => searchBoeInventories({ pageNumber, pageSize, search })
  });

  const save = useMutation({
    mutationFn: saveBoeInventory,
    onSuccess: async () => {
      toast.success(lt("Inventory master saved"));
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["boe-inventory-masters"] });
      await queryClient.invalidateQueries({ queryKey: ["boe-form-inventories"] });
    }
  });

  const columns = useMemo<ColumnDef<BoeInventoryDto>[]>(
    () => [
      { accessorKey: "serialNo", header: lt("Serial No") },
      { accessorKey: "inventoryCode", header: lt("Inventory Code") },
      { accessorKey: "inventoryName", header: lt("Inventory Name") },
      { accessorKey: "description", header: lt("Description") },
      { accessorKey: "isActive", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
    ],
    []
  );

  function edit(row: BoeInventoryDto) {
    setEditing(row);
    setInventoryCode(row.inventoryCode);
    setInventoryName(row.inventoryName);
    setDescription(row.description ?? "");
    setIsActive(row.isActive);
  }

  function resetForm() {
    setEditing(null);
    setInventoryCode("");
    setInventoryName("");
    setDescription("");
    setIsActive(true);
  }

  function submit() {
    save.mutate({
      inventoryCode,
      inventoryName,
      description,
      isActive
    });
  }

  function toggle(row: BoeInventoryDto) {
    save.mutate({
      inventoryCode: row.inventoryCode,
      inventoryName: row.inventoryName,
      description: row.description,
      isActive: !row.isActive
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Inventory Masters")}
        description={lt("Maintain Bill of Entry inventory codes used for customs stock buckets and BOE item entry.")}
        actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} permission="BillOfEntry.Update" onClick={resetForm}><Plus className="h-4 w-4" />{lt("New Inventory")}</PermissionButton></>}
      />
      <Card className={masterDataPanelClass}>
        <CardHeader><CardTitle>{editing ? lt("Edit Inventory") : lt("Add Inventory")}</CardTitle></CardHeader>
        <CardContent className={`${masterDataPanelContentClass} space-y-4`}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label>{lt("Inventory Code")}</Label>
              <Input value={inventoryCode} onChange={(event) => setInventoryCode(event.target.value)} disabled={Boolean(editing)} />
            </div>
            <div className="space-y-1">
              <Label>{lt("Inventory Name")}</Label>
              <Input value={inventoryName} onChange={(event) => setInventoryName(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{lt("Description")}</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{lt("Status")}</Label>
              <select className="h-10 w-full rounded-md border px-3 text-sm" value={isActive ? "true" : "false"} onChange={(event) => setIsActive(event.target.value === "true")}>
                <option value="true">{lt("Active")}</option>
                <option value="false">{lt("Inactive")}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>{lt("Clear")}</Button>
            <PermissionButton permission="BillOfEntry.Update" onClick={submit} disabled={!inventoryCode || !inventoryName || save.isPending}>{lt("Save")}</PermissionButton>
          </div>
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search={search}
            onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
            onPaginationChange={(nextPageNumber, nextPageSize) => {
              setPageNumber(nextPageNumber);
              setPageSize(nextPageSize);
            }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => (
              <div className="flex items-center gap-1">
                <PermissionButton className={masterDataButtonClass} permission="BillOfEntry.Update" size="sm" variant="ghost" onClick={() => edit(row)}>
                  <Pencil className="h-4 w-4" />
                </PermissionButton>
                <PermissionButton className={masterDataButtonClass} permission="BillOfEntry.Update" size="sm" variant="ghost" onClick={() => toggle(row)}>
                  {row.isActive ? <XCircle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </PermissionButton>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
