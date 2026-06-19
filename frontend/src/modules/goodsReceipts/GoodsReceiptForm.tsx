import { useEffect, useId, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { searchPickups } from "@/api/pickupApi";
import { searchWarehouseLocations, searchWarehouses } from "@/api/warehouseApi";
import { getActivePackageTypesForDropdown } from "@/api/packageTypeApi";
import { getActiveCountriesForDropdown } from "@/api/countryApi";
import type { GoodsReceiptItemRequest, GoodsReceiptRequest } from "@/api/goodsReceiptApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/modules/operationsLocalization";

export function GoodsReceiptForm({ initialValue, onSubmit, onSaveItem, isSubmitting }: { initialValue?: GoodsReceiptRequest | null; onSubmit: (value: GoodsReceiptRequest) => Promise<void>; onSaveItem?: (item: GoodsReceiptItemRequest) => Promise<GoodsReceiptItemRequest[]>; isSubmitting?: boolean }) {
  const pickups = useQuery({ queryKey: ["gr-pickups"], queryFn: () => searchPickups({ pageNumber: 1, pageSize: 200 }) });
  const warehouses = useQuery({ queryKey: ["gr-warehouses"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const packageTypes = useQuery({ queryKey: ["gr-package-types"], queryFn: () => getActivePackageTypesForDropdown() });
  const countries = useQuery({ queryKey: ["gr-countries"], queryFn: () => getActiveCountriesForDropdown() });
  const [value, setValue] = useState<GoodsReceiptRequest>(initialValue ? { ...initialValue, receivedDateTime: toDateTimeLocalValue(initialValue.receivedDateTime) } : { customerId: "", salesmanId: null, pickupId: null, receivedFrom: "", receivedDateTime: "", warehouseId: null, warehouseLocation: "", remarks: "", items: [createEmptyItem()] });
  const locations = useQuery({
    queryKey: ["gr-warehouse-locations", value.warehouseId],
    queryFn: () => searchWarehouseLocations({ pageNumber: 1, pageSize: 500, isActive: true, warehouseId: value.warehouseId || undefined }),
    enabled: Boolean(value.warehouseId)
  });
  const locationOptions = (locations.data?.items ?? []).map((x) => ({ value: warehouseLocationValue(x), label: warehouseLocationLabel(x) }));
  const selectedLocation = value.warehouseLocation ?? "";
  const locationOptionsWithCurrent = selectedLocation && !locationOptions.some((x) => x.value === selectedLocation)
    ? [{ value: selectedLocation, label: selectedLocation }, ...locationOptions]
    : locationOptions;
  async function saveItem(item: GoodsReceiptItemRequest) {
    if (!onSaveItem) return;
    if (item.operationMode === "Delete" && (!item.id || item.id === EMPTY_GUID)) {
      setValue((prev) => ({ ...prev, items: prev.items.filter((x) => x !== item) }));
      return;
    }
    const refreshed = await onSaveItem(item);
    setValue((prev) => ({ ...prev, items: refreshed }));
  }
  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label={lt("Customer")}>
        <CustomerAutocomplete
          value={value.customerId}
          placeholder={lt("Search by name, code, or phone")}
          onChange={(customer) => setValue((prev) => ({
            ...prev,
            customerId: customer?.id ?? "",
            salesmanId: customer?.salesmanId ?? null
          }))}
        />
      </Field>
      <Field label={lt("Salesman (optional)")}><SalesmanSelect value={value.salesmanId} onChange={(salesmanId) => setValue({ ...value, salesmanId })} /></Field>
      <Field label={lt("Link")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.pickupId ?? ""} onChange={(e) => setValue({ ...value, pickupId: e.target.value || null })}><option value="">{lt("Direct receipt")}</option>{(pickups.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.pickupNumber}</option>)}</select></Field>
      <Field label={lt("Received From")}><Input value={value.receivedFrom} onChange={(e) => setValue({ ...value, receivedFrom: e.target.value })} /></Field>
      <Field label={lt("Received DateTime")}><Input type="datetime-local" value={value.receivedDateTime} onChange={(e) => setValue({ ...value, receivedDateTime: e.target.value })} /></Field>
      <Field label={lt("Warehouse")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.warehouseId ?? ""} onChange={(e) => setValue({ ...value, warehouseId: e.target.value || null, warehouseLocation: "" })}><option value="">{lt("Optional")}</option>{(warehouses.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.warehouseCode} - {x.warehouseName}</option>)}</select></Field>
      <Field label={lt("Bin / Location")}>
        {value.warehouseId ? (
          <select className="h-10 w-full rounded-md border px-3 text-sm" value={value.warehouseLocation ?? ""} onChange={(e) => setValue({ ...value, warehouseLocation: e.target.value })} disabled={locations.isLoading}>
            <option value="">{locations.isLoading ? lt("Loading bins...") : lt("Select bin")}</option>
            {locationOptionsWithCurrent.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
        ) : (
          <Input value={value.warehouseLocation ?? ""} onChange={(e) => setValue({ ...value, warehouseLocation: e.target.value })} placeholder={lt("Select warehouse to choose bin")} />
        )}
      </Field>
      <Field label={lt("Remarks")}><Input value={value.remarks ?? ""} onChange={(e) => setValue({ ...value, remarks: e.target.value })} /></Field>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between"><h3 className="font-medium">{lt("Received Goods")}</h3><Button type="button" variant="outline" onClick={() => setValue({ ...value, items: [...value.items, createEmptyItem()] })}><Plus className="h-4 w-4" />{lt("Add Item")}</Button></div>
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="max-h-[520px] overflow-auto">
          <div className="min-w-[980px] divide-y">
          {value.items.map((item, index) => {
            const mode = normalizeMode(item.operationMode, item.id);
            const disabled = mode === "Delete";
            const volume = (((item.length || 0) * (item.width || 0) * (item.height || 0) * (item.receivedPieces || 0)) / 1_000_000);
            const chargeableWeight = Math.max(item.receivedWeight || 0, volume * 167);
            return <div key={item.id ?? `new-${index}`} className={disabled ? "bg-red-50/60 line-through" : "bg-white"}>
              <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[260px_minmax(260px,1.25fr)_minmax(240px,1fr)_240px_140px] xl:items-end">
                <ItemField label={lt("Package Type")}><FilterableSelect className="w-full" value={item.packageTypeGuid ?? ""} disabled={disabled} onChange={(next) => { const selected = (packageTypes.data ?? []).find((x) => x.id === next); const nextItems = [...value.items]; nextItems[index] = withOperation({ ...nextItems[index], packageTypeGuid: next || null, packageTypeName: selected?.packageName ?? null }); setValue({ ...value, items: nextItems }); }} placeholder={lt("Select package type")} options={(packageTypes.data ?? []).map((x) => ({ value: x.id, label: `${x.packageCode} - ${x.packageName}` }))} /></ItemField>
                <ItemField label={lt("Description")}><Input disabled={disabled} value={item.description} onChange={(e) => updateItem(value.items, index, "description", e.target.value, (items) => setValue({ ...value, items }))} /></ItemField>
                <ItemField label={lt("Country of Origin")}><FilterableSelect className="w-full" value={item.countryOfOrigin ?? ""} disabled={disabled} onChange={(next) => updateItem(value.items, index, "countryOfOrigin", next, (items) => setValue({ ...value, items }))} placeholder={lt("Select country")} options={(countries.data ?? []).map((x) => ({ value: x.name, label: `${x.countryCode} - ${x.name}` }))} /></ItemField>
                <ItemField label={lt("HS Code")}><Input disabled={disabled} value={item.hsCode ?? ""} onChange={(e) => updateItem(value.items, index, "hsCode", e.target.value, (items) => setValue({ ...value, items }))} /></ItemField>
              </div>
              <div className="grid gap-3 border-t bg-slate-50/70 p-3 md:grid-cols-3 xl:grid-cols-[120px_120px_110px_110px_110px_120px_150px_260px] xl:items-end">
                <ItemField label={lt("No. of Packages")}><Input disabled={disabled} type="number" min="0" value={item.receivedPieces} onChange={(e) => updateItem(value.items, index, "receivedPieces", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                <ItemField label={lt("Gross Weight")}><Input disabled={disabled} type="number" min="0" value={item.receivedWeight} onChange={(e) => updateItem(value.items, index, "receivedWeight", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                <ItemField label={lt("Length")}><Input disabled={disabled} type="number" min="0" value={item.length} onChange={(e) => updateItem(value.items, index, "length", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                <ItemField label={lt("Width")}><Input disabled={disabled} type="number" min="0" value={item.width} onChange={(e) => updateItem(value.items, index, "width", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                <ItemField label={lt("Height")}><Input disabled={disabled} type="number" min="0" value={item.height} onChange={(e) => updateItem(value.items, index, "height", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                <ItemField label={lt("Volume")}><div className="h-10 rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">{volume.toFixed(4)}</div></ItemField>
                <ItemField label={lt("Chargeable Weight")}><div className="h-10 rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">{chargeableWeight.toFixed(4)}</div></ItemField>
                <ItemField label={lt("Operation / Action")}><div className="flex h-10 items-center gap-2"><span className="inline-flex h-10 items-center rounded-md border bg-slate-50 px-3 text-xs font-medium text-slate-700">{lt(mode)}</span>{onSaveItem ? <Button type="button" size="sm" variant="outline" onClick={() => void saveItem(value.items[index])}>{lt("Save")}</Button> : null}<Button type="button" variant="ghost" size="sm" onClick={() => { if (!item.id || item.id === EMPTY_GUID) { setValue({ ...value, items: value.items.filter((_, i) => i !== index) }); return; } updateItem(value.items, index, "operationMode", "Delete", (items) => setValue({ ...value, items })); }}><Trash2 className="h-4 w-4 text-red-600" /></Button></div></ItemField>
              </div>
            </div>;
          })}
          </div>
        </div>
      </div>
    </div>
    <Button onClick={() => void onSubmit({ ...value, receivedDateTime: toApiDateTimeOffset(value.receivedDateTime) })} disabled={isSubmitting}>{isSubmitting ? lt("Saving...") : lt("Save Goods Receipt")}</Button>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function ItemField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</Label>{children}</div>;
}

function FilterableSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
  disabled
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  disabled?: boolean;
}) {
  const listId = useId();
  const [text, setText] = useState("");

  useEffect(() => {
    const selected = options.find((x) => x.value === value);
    setText(selected?.label ?? "");
  }, [value, options]);

  return (
    <div className={className ? `space-y-1 ${className}` : "space-y-1"}>
      <Input
        list={listId}
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          const nextText = e.target.value;
          setText(nextText);
          if (!nextText.trim()) {
            onChange("");
            return;
          }
          const selected = options.find((x) => x.label.toLowerCase() === nextText.trim().toLowerCase());
          if (selected) onChange(selected.value);
        }}
      />
      <datalist id={listId}>
        {options.map((x) => <option key={x.value} value={x.label} />)}
      </datalist>
    </div>
  );
}

function updateItem(items: GoodsReceiptRequest["items"], index: number, key: keyof GoodsReceiptRequest["items"][number], nextValue: string | number, onChange: (items: GoodsReceiptRequest["items"]) => void) {
  const next = [...items];
  next[index] = withOperation({ ...next[index], [key]: nextValue });
  onChange(next);
}

function createEmptyItem(): GoodsReceiptItemRequest {
  return { id: null, operationMode: "New", packageTypeGuid: null, packageTypeName: null, hsCode: "", countryOfOrigin: "", description: "", receivedPieces: 0, receivedWeight: 0, length: 0, width: 0, height: 0 };
}

function warehouseLocationValue(location: { locationCode: string; rack?: string | null; bin?: string | null }) {
  return [location.locationCode, location.rack, location.bin].filter(Boolean).join(" / ");
}

function warehouseLocationLabel(location: { locationCode: string; rack?: string | null; bin?: string | null }) {
  const parts = [location.locationCode];
  if (location.rack) parts.push(`${lt("Rack")}: ${location.rack}`);
  if (location.bin) parts.push(`${lt("Bin")}: ${location.bin}`);
  return parts.join(" - ");
}

function normalizeMode(mode: GoodsReceiptItemRequest["operationMode"], id?: string | null): "New" | "Update" | "Delete" {
  if (mode === "New" || mode === "Update" || mode === "Delete") return mode;
  return id && id !== EMPTY_GUID ? "Update" : "New";
}

function withOperation(item: GoodsReceiptItemRequest): GoodsReceiptItemRequest {
  if (item.operationMode === "Delete") return item;
  return { ...item, operationMode: item.id && item.id !== EMPTY_GUID ? "Update" : "New" };
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toApiDateTimeOffset(localValue: string) {
  if (!localValue) return localValue;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return localValue;
  return date.toISOString();
}
