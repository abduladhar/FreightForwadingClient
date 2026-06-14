import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getBranchOptions } from "@/api/branchApi";
import { getErpUiSettings, saveNumberingSettings, type NumberingSetting } from "@/api/settingsApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { useAuth } from "@/auth/useAuth";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

const resetPolicies: NumberingSetting["resetPolicy"][] = ["Never", "Yearly", "Monthly", "Daily"];
const shipmentModules = [
  { value: "HouseShipment", label: "House Shipment", prefix: "HS" },
  { value: "DirectShipment", label: "Direct Shipment", prefix: "DS" },
  { value: "MasterShipment", label: "Master Shipment", prefix: "MS" }
] as const;
const standardModules = [
  { value: "Invoice", label: "Invoice", prefix: "INV" },
  { value: "VendorBill", label: "Vendor Bill", prefix: "VB" },
  { value: "CustomerReceipt", label: "Customer Receipt", prefix: "RCPT" },
  { value: "VendorPayment", label: "Vendor Payment", prefix: "PAY" },
  { value: "Reconciliation", label: "Reconciliation", prefix: "REC" },
  { value: "Quotation", label: "Quotation", prefix: "QT" },
  { value: "GoodsReceipt", label: "Goods Receipt", prefix: "GRN" },
  { value: "Pickup", label: "Pickup", prefix: "PU" },
  { value: "CustomsClearance", label: "Customs Clearance", prefix: "CC" },
  { value: "CustomsJob", label: "Customs Job", prefix: "CJ" },
  { value: "CreditNote", label: "Credit Note", prefix: "CN" },
  { value: "DebitNote", label: "Debit Note", prefix: "DN" },
  { value: "LedgerEntry", label: "Ledger Entry", prefix: "LED" },
  { value: "LedgerReversal", label: "Ledger Reversal", prefix: "LEDREV" }
] as const;
const numberingModules = [...shipmentModules, ...standardModules] as const;
const transportModes = ["Air", "Sea", "Land", "Courier"] as const;

const emptyForm: NumberingSetting = {
  id: "",
  moduleName: "",
  documentType: "",
  prefix: "",
  suffix: "",
  separator: "-",
  digitLength: 4,
  startingNumber: 1,
  resetPolicy: "Daily",
  nextNumber: 1,
  branchId: null,
  transportMode: "Air",
  originPortGuid: null,
  destinationPortGuid: null,
  isActive: true
};

export function NumberingSettingsPage() {
  const { session, hasPermission } = useAuth();
  const tenantId = session?.tenantId;
  const query = useQuery({
    queryKey: ["erp-ui-settings", tenantId],
    queryFn: () => getErpUiSettings(tenantId!),
    enabled: Boolean(tenantId)
  });
  const branchOptionsQuery = useQuery({ queryKey: ["branch-options"], queryFn: getBranchOptions });
  const shippingPortsQuery = useQuery({ queryKey: ["numbering-shipping-ports"], queryFn: () => getActiveShippingPortsForDropdown() });
  const [rows, setRows] = useState<NumberingSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<NumberingSetting>(emptyForm);
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const save = useMutation({
    mutationFn: (items: NumberingSetting[]) => saveNumberingSettings(tenantId!, items),
    onSuccess: (result) => {
      setRows(result.bundle.numberingSettings);
      resetForm();
    }
  });

  useEffect(() => {
    if (!query.data) return;
    setRows(query.data.bundle.numberingSettings);
  }, [query.data]);

  const branchNameById = useMemo(
    () => new Map((branchOptionsQuery.data ?? []).map((item) => [item.id, `${item.code} - ${item.name}`])),
    [branchOptionsQuery.data]
  );

  const filtered = rows.filter((item) =>
    [item.moduleName, item.documentType, item.prefix, item.suffix ?? "", item.transportMode ?? ""].join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const draftIsShipmentModule = isShipmentModule(draft.moduleName);

  const columns: ColumnDef<NumberingSetting>[] = [
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "transportMode", header: lt("Transport Mode"), cell: ({ row }) => lt(row.original.transportMode || "Any") },
    {
      id: "route",
      header: lt("Route"),
      cell: ({ row }) => routePreview(row.original)
    },
    {
      id: "format",
      header: lt("Format Preview"),
      cell: ({ row }) => previewNumber(row.original)
    },
    { accessorKey: "resetPolicy", header: lt("Reset"), cell: ({ row }) => lt(row.original.resetPolicy) },
    { accessorKey: "nextNumber", header: lt("Next No.") },
    {
      id: "branch",
      header: lt("Branch"),
      cell: ({ row }) => (row.original.branchId ? branchNameById.get(row.original.branchId) ?? row.original.branchId : lt("All Branches"))
    },
    {
      id: "status",
      header: lt("Status"),
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} />
    }
  ];

  if (!tenantId) {
    return <div className="rounded-md border bg-yellow-50 p-4 text-sm text-yellow-800">{lt("Tenant context is required to manage numbering settings.")}</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Numbering Settings")} description={lt("Configure tenant and branch document numbering formats and reset rules.")} actions={<AuditTrailButton />} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <select className="h-10 rounded-md border px-3 text-sm" value={draft.moduleName} onChange={(event) => setModule(event.target.value)}>
              <option value="">{lt("Select Module")}</option>
              {numberingModules.map((item) => <option key={item.value} value={item.value}>{lt(item.label)}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3 text-sm" value={draft.transportMode ?? ""} onChange={(event) => setDraft({ ...draft, transportMode: event.target.value as NumberingSetting["transportMode"] || null })} disabled={!draftIsShipmentModule}>
              <option value="">{lt("Any Transport Mode")}</option>
              {transportModes.map((item) => <option key={item} value={item}>{lt(item)}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3 text-sm" value={draft.originPortGuid ?? ""} onChange={(event) => setDraft({ ...draft, originPortGuid: event.target.value || null })} disabled={!draftIsShipmentModule}>
              <option value="">{lt("Any Origin Port")}</option>
              {(shippingPortsQuery.data ?? []).map((option) => <option key={option.id} value={option.id}>{option.portCode} - {option.portName}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3 text-sm" value={draft.destinationPortGuid ?? ""} onChange={(event) => setDraft({ ...draft, destinationPortGuid: event.target.value || null })} disabled={!draftIsShipmentModule}>
              <option value="">{lt("Any Destination Port")}</option>
              {(shippingPortsQuery.data ?? []).map((option) => <option key={option.id} value={option.id}>{option.portCode} - {option.portName}</option>)}
            </select>
            <Input placeholder={lt("Prefix")} value={draft.prefix} onChange={(event) => setDraft({ ...draft, prefix: event.target.value })} />
            <Input placeholder={lt("Suffix")} value={draft.suffix ?? ""} onChange={(event) => setDraft({ ...draft, suffix: event.target.value })} />
            <Input placeholder={lt("Separator")} value={draft.separator} onChange={(event) => setDraft({ ...draft, separator: event.target.value })} />
            <Input type="number" min={1} max={12} placeholder={lt("Digit Length")} value={draft.digitLength} onChange={(event) => setDraft({ ...draft, digitLength: Math.max(1, Number(event.target.value) || 1) })} />
            <Input type="number" min={1} placeholder={lt("Starting Number")} value={draft.startingNumber ?? 1} onChange={(event) => setStartingNumber(Math.max(1, Number(event.target.value) || 1))} />
            <Input type="number" min={1} placeholder={lt("Next Number")} value={draft.nextNumber} onChange={(event) => setDraft({ ...draft, nextNumber: Math.max(1, Number(event.target.value) || 1) })} />
            <select className="h-10 rounded-md border px-3 text-sm" value={draft.resetPolicy} onChange={(event) => setDraft({ ...draft, resetPolicy: event.target.value as NumberingSetting["resetPolicy"] })}>
              {resetPolicies.map((item) => (
                <option key={item} value={item}>
                  {lt(item)}
                </option>
              ))}
            </select>
            <select className="h-10 rounded-md border px-3 text-sm md:col-span-2" value={draft.branchId ?? ""} onChange={(event) => setDraft({ ...draft, branchId: event.target.value || null })}>
              <option value="">{lt("All Branches")}</option>
              {(branchOptionsQuery.data ?? []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.code} - {option.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> {lt("Active")}
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PermissionButton permission="Tenant.Update" onClick={() => void upsert()}>
              <Plus className="h-4 w-4" /> {editingId ? lt("Update Format") : lt("Add Format")}
            </PermissionButton>
            {editingId ? (
              <Button variant="outline" onClick={resetForm}>
                {lt("Cancel Edit")}
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => void saveAll()} disabled={!hasPermission("Tenant.Update") || save.isPending}>
              {lt("Save All Changes")}
            </Button>
          </div>

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
                <PermissionButton
                  permission="Tenant.Update"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(row.id);
                    setDraft(normalizeSetting(row));
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </PermissionButton>
                <ConfirmDialog
                  title={lt("Remove numbering format?")}
                  description={`${row.moduleName} - ${row.documentType}`}
                  confirmText={lt("Remove")}
                  variant="danger"
                  onConfirm={async () => {
                    setRows((previous) => previous.filter((item) => item.id !== row.id));
                    if (editingId === row.id) resetForm();
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

  async function upsert() {
    const moduleName = draft.moduleName.trim();
    if (!moduleName) return;

    const nextItem: NumberingSetting = {
      ...normalizeSetting(draft),
      moduleName,
      documentType: moduleName,
      id: editingId ?? generateId()
    };

    setRows((previous) => {
      if (!editingId) return [...previous, nextItem];
      return previous.map((item) => (item.id === editingId ? nextItem : item));
    });
    resetForm();
  }

  async function saveAll() {
    await save.mutateAsync(rows);
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyForm);
  }

  function setModule(moduleName: string) {
    const module = numberingModules.find((item) => item.value === moduleName);
    const shipmentModule = isShipmentModule(moduleName);
    setDraft({
      ...draft,
      moduleName,
      documentType: moduleName,
      prefix: module?.prefix ?? draft.prefix,
      transportMode: shipmentModule ? draft.transportMode || "Air" : null,
      originPortGuid: shipmentModule ? draft.originPortGuid : null,
      destinationPortGuid: shipmentModule ? draft.destinationPortGuid : null
    });
  }

  function setStartingNumber(startingNumber: number) {
    setDraft({ ...draft, startingNumber, nextNumber: editingId ? draft.nextNumber : startingNumber });
  }

  function routePreview(item: NumberingSetting) {
    if (!isShipmentModule(item.moduleName)) return lt("Not Applicable");
    const origin = item.originPortGuid ? shippingPortsQuery.data?.find((port) => port.id === item.originPortGuid) : null;
    const destination = item.destinationPortGuid ? shippingPortsQuery.data?.find((port) => port.id === item.destinationPortGuid) : null;
    return `${origin ? origin.portCode : lt("Any")} -> ${destination ? destination.portCode : lt("Any")}`;
  }
}

function previewNumber(item: NumberingSetting) {
  const normalized = normalizeSetting(item);
  const padded = String(normalized.nextNumber).padStart(normalized.digitLength, "0");
  const date = new Date().toISOString().slice(0, 10);
  if (isShipmentModule(normalized.moduleName)) {
    const modeCode = transportModeCode(normalized.transportMode || "Air");
    return `${normalized.prefix || "HS"}${normalized.separator}${modeCode}${normalized.separator}${date}${normalized.separator}${padded}`;
  }
  return `${normalized.prefix || "DOC"}${normalized.separator}${date}${normalized.separator}${padded}`;
}

function normalizeSetting(item: NumberingSetting): NumberingSetting {
  const module = numberingModules.find((entry) => entry.value === item.moduleName);
  const shipmentModule = isShipmentModule(item.moduleName);
  const startingNumber = Math.max(1, Number(item.startingNumber ?? item.nextNumber ?? 1) || 1);
  return {
    ...item,
    documentType: item.documentType || item.moduleName,
    prefix: item.prefix || module?.prefix || "HS",
    separator: item.separator || "-",
    digitLength: Math.max(1, Number(item.digitLength) || 4),
    startingNumber,
    nextNumber: Math.max(1, Number(item.nextNumber ?? startingNumber) || startingNumber),
    resetPolicy: item.resetPolicy || "Daily",
    transportMode: shipmentModule ? item.transportMode ?? "Air" : null,
    originPortGuid: shipmentModule ? item.originPortGuid ?? null : null,
    destinationPortGuid: shipmentModule ? item.destinationPortGuid ?? null : null
  };
}

function isShipmentModule(moduleName?: string | null) {
  return shipmentModules.some((entry) => entry.value === moduleName);
}

function transportModeCode(mode: string) {
  if (mode === "Air") return "A";
  if (mode === "Sea") return "S";
  if (mode === "Land" || mode === "Road") return "L";
  if (mode === "Courier") return "C";
  return mode.slice(0, 1).toUpperCase() || "A";
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}`;
}
