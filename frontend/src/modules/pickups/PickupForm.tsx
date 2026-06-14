import { useEffect, useId, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { searchQuotations } from "@/api/quotationApi";
import { getCurrencies } from "@/api/currencyApi";
import { getActivePackageTypesForDropdown } from "@/api/packageTypeApi";
import { getActiveCountriesForDropdown } from "@/api/countryApi";
import type { PickupItemRequest, PickupRequest } from "@/api/pickupApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePickupI18n } from "@/modules/pickups/pickupI18n";
import { masterDataButtonClass } from "@/modules/masterDataUi";

export function PickupForm({ initialValue, onSubmit, isSubmitting, onSaveItem }: { initialValue?: PickupRequest | null; onSubmit: (value: PickupRequest) => Promise<void>; isSubmitting?: boolean; onSaveItem?: (item: PickupItemRequest) => Promise<PickupItemRequest[]> }) {
  const p = usePickupI18n();
  const quotations = useQuery({ queryKey: ["pickup-quotations"], queryFn: () => searchQuotations({ pageNumber: 1, pageSize: 200 }) });
  const currencies = useQuery({ queryKey: ["pickup-currencies"], queryFn: getCurrencies });
  const packageTypes = useQuery({ queryKey: ["pickup-package-types"], queryFn: () => getActivePackageTypesForDropdown() });
  const countries = useQuery({ queryKey: ["pickup-countries"], queryFn: () => getActiveCountriesForDropdown() });
  const [value, setValue] = useState<PickupRequest>(initialValue ? { ...initialValue, dropLocation: initialValue.dropLocation ?? "", consigneeName: initialValue.consigneeName ?? "", consigneeContactNo: initialValue.consigneeContactNo ?? "", consigneeAddress: initialValue.consigneeAddress ?? "", pickupDateTime: toDateTimeLocalValue(initialValue.pickupDateTime), items: initialValue.items.map((x) => withOperation(x)) } : { customerId: "", salesmanId: null, quotationId: null, customerLocation: "", contactPerson: "", contactPhone: "", dropLocation: "", consigneeName: "", consigneeContactNo: "", consigneeAddress: "", pickupDateTime: todayDateTimeLocalValue(), pickupCharges: 0, currencyId: null, items: [createEmptyItem()] });
  const itemMetricsGridClass = onSaveItem
    ? "grid gap-3 border-t bg-slate-50/70 p-3 md:grid-cols-3 xl:grid-cols-[120px_120px_110px_110px_110px_120px_150px_260px] xl:items-end"
    : "grid gap-3 border-t bg-slate-50/70 p-3 md:grid-cols-3 xl:grid-cols-[120px_120px_110px_110px_110px_120px_150px_150px] xl:items-end";
  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label={p("Customer")}>
        <CustomerAutocomplete
          value={value.customerId}
          onChange={(customer) => setValue((prev) => ({
            ...prev,
            customerId: customer?.id ?? "",
            salesmanId: customer?.salesmanId ?? null
          }))}
          placeholder={p("Search by name, code, or phone")}
          minimumCharactersText={p("Enter at least 3 characters.")}
          searchingText={p("Searching customers...")}
          emptyText={p("No customers found.")}
          noPhoneText={p("No phone")}
        />
      </Field>
      <Field label={p("Salesman (optional)")}><SalesmanSelect value={value.salesmanId} onChange={(salesmanId) => setValue({ ...value, salesmanId })} emptyLabel={p("No salesman")} /></Field>
      <Field label={p("Quotation")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.quotationId ?? ""} onChange={(e) => setValue({ ...value, quotationId: e.target.value || null })}><option value="">{p("Optional")}</option>{(quotations.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.quotationNumber}</option>)}</select></Field>
      <Field label={p("Assignment")}><Input value={p("Driver/Vehicle/Vendor assignment is done in Assign screen")} disabled /></Field>
      <Field label={p("Pickup DateTime")}><Input type="datetime-local" value={value.pickupDateTime} onChange={(e) => setValue({ ...value, pickupDateTime: e.target.value })} /></Field>
      <Field label={p("Customer Location")}><Input value={value.customerLocation} onChange={(e) => setValue({ ...value, customerLocation: e.target.value })} /></Field>
      <Field label={p("Contact Person")}><Input value={value.contactPerson} onChange={(e) => setValue({ ...value, contactPerson: e.target.value })} /></Field>
      <Field label={p("Contact Phone")}><Input value={value.contactPhone} onChange={(e) => setValue({ ...value, contactPhone: e.target.value })} /></Field>
      <Field label={p("Drop Location")}><Input value={value.dropLocation ?? ""} onChange={(e) => setValue({ ...value, dropLocation: e.target.value })} /></Field>
      <Field label={p("Consignee Name")}><Input value={value.consigneeName ?? ""} onChange={(e) => setValue({ ...value, consigneeName: e.target.value })} /></Field>
      <Field label={p("Consignee Contact No")}><Input value={value.consigneeContactNo ?? ""} onChange={(e) => setValue({ ...value, consigneeContactNo: e.target.value })} /></Field>
      <Field label={p("Consignee Contact Address")}><Input value={value.consigneeAddress ?? ""} onChange={(e) => setValue({ ...value, consigneeAddress: e.target.value })} /></Field>
      <Field label={p("Pickup Charges")}><Input type="number" min="0" value={value.pickupCharges} onChange={(e) => setValue({ ...value, pickupCharges: Number(e.target.value) })} /></Field>
      <Field label={p("Currency")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.currencyId ?? ""} onChange={(e) => setValue({ ...value, currencyId: e.target.value || null })}><option value="">{p("Default")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select></Field>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{p("Pickup Goods")}</h3>
        <Button className={masterDataButtonClass} type="button" variant="outline" onClick={() => setValue({ ...value, items: [...value.items, createEmptyItem()] })}><Plus className="h-4 w-4" /> {p("Add Item")}</Button>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="max-h-[520px] overflow-auto">
          <div className="min-w-[980px] divide-y">
            {value.items.map((item, index) => {
              const volume = ((item.length || 0) * (item.width || 0) * (item.height || 0) * (item.pieces || 0)) / 1_000_000;
              const chargeableWeight = Math.max(item.weight || 0, volume * 167);
              const rowKey = item.id ?? `new-${index}`;
              return (
                <div key={rowKey} className={item.operationMode === "Delete" ? "bg-red-50/60" : "bg-white"}>
                  <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[260px_minmax(260px,1.25fr)_minmax(240px,1fr)_240px_140px] xl:items-end">
                    <ItemField label={p("Package Type")}>
                      <FilterableSelect
                        className="w-full"
                        value={item.packageTypeGuid ?? ""}
                        onChange={(next) => {
                          const selected = (packageTypes.data ?? []).find((x) => x.id === next);
                          updateItemPatch(value.items, index, { packageTypeGuid: next || null, packageTypeName: selected?.packageName ?? null, packageType: selected?.packageName ?? "" }, (items) => setValue({ ...value, items }));
                        }}
                        placeholder={p("Select package type")}
                        options={(packageTypes.data ?? []).map((x) => ({ value: x.id, label: `${x.packageCode} - ${x.packageName}` }))}
                      />
                    </ItemField>
                    <ItemField label={p("Description")}><Input value={item.description ?? ""} onChange={(e) => updateItem(value.items, index, "description", e.target.value, (items) => setValue({ ...value, items }))} /></ItemField>
                    <ItemField label={p("Marks")}><Input value={item.marksAndNumbers ?? ""} onChange={(e) => updateItem(value.items, index, "marksAndNumbers", e.target.value, (items) => setValue({ ...value, items }))} /></ItemField>
                    <ItemField label={p("Country of Origin")}>
                      <FilterableSelect className="w-full" value={item.countryOfOrigin ?? ""} onChange={(next) => updateItem(value.items, index, "countryOfOrigin", next, (items) => setValue({ ...value, items }))} placeholder={p("Select country")} options={(countries.data ?? []).map((x) => ({ value: x.name, label: `${x.countryCode} - ${x.name}` }))} />
                    </ItemField>
                    <ItemField label={p("HS Code")}><Input value={item.hsCode ?? ""} onChange={(e) => updateItem(value.items, index, "hsCode", e.target.value, (items) => setValue({ ...value, items }))} /></ItemField>
                  </div>
                  <div className={itemMetricsGridClass}>
                    <ItemField label={p("No. of Packages")}><Input type="number" min="0" value={item.pieces} onChange={(e) => updateItem(value.items, index, "pieces", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                    <ItemField label={p("Gross Weight")}><Input type="number" min="0" value={item.weight} onChange={(e) => updateItem(value.items, index, "weight", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                    <ItemField label={p("Length")}><Input type="number" min="0" value={item.length} onChange={(e) => updateItem(value.items, index, "length", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                    <ItemField label={p("Width")}><Input type="number" min="0" value={item.width} onChange={(e) => updateItem(value.items, index, "width", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                    <ItemField label={p("Height")}><Input type="number" min="0" value={item.height} onChange={(e) => updateItem(value.items, index, "height", Number(e.target.value), (items) => setValue({ ...value, items }))} /></ItemField>
                    <ItemField label={p("Volume")}><div className="h-10 rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">{volume.toFixed(4)}</div></ItemField>
                    <ItemField label={p("Chargeable Weight")}><div className="h-10 rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">{chargeableWeight.toFixed(4)}</div></ItemField>
                    <ItemField label={p(onSaveItem ? "Operation / Action" : "Action")}>
                      <div className="flex h-10 items-center gap-2">
                        {onSaveItem ? <span className="inline-flex h-10 items-center rounded-md border bg-slate-50 px-3 text-xs font-medium text-slate-700">{p(item.operationMode ?? operationFor(item))}</span> : null}
                        {onSaveItem ? <Button className={masterDataButtonClass} type="button" variant="outline" size="sm" onClick={async () => setValue({ ...value, items: await onSaveItem(item) })}><Save className="h-4 w-4" /> {p("Save")}</Button> : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (onSaveItem && item.id && item.id !== EMPTY_GUID) {
                              setValue({ ...value, items: await onSaveItem({ ...item, operationMode: "Delete" }) });
                              return;
                            }
                            setValue({ ...value, items: value.items.filter((_, i) => i !== index) });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" /><span className="sr-only">{p("Delete")}</span>
                        </Button>
                      </div>
                    </ItemField>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    <Button className={masterDataButtonClass} onClick={() => void onSubmit({ ...value, pickupDateTime: toApiDateTimeOffset(value.pickupDateTime) })} disabled={isSubmitting}>{p(isSubmitting ? "Saving..." : "Save Pickup")}</Button>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function ItemField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</Label>{children}</div>;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function createEmptyItem(): PickupItemRequest {
  return { id: null, operationMode: "New", packageTypeGuid: null, packageTypeName: null, hsCode: "", countryOfOrigin: "", description: "", pieces: 0, weight: 0, length: 0, width: 0, height: 0, packageType: "", marksAndNumbers: "" };
}

function operationFor(item: PickupItemRequest): "New" | "Update" {
  return item.id && item.id !== EMPTY_GUID ? "Update" : "New";
}

function withOperation(item: PickupItemRequest): PickupItemRequest {
  return { ...item, operationMode: item.operationMode ?? operationFor(item) };
}

function updateItem(items: PickupRequest["items"], index: number, key: keyof PickupRequest["items"][number], nextValue: string | number, onChange: (items: PickupRequest["items"]) => void) {
  const next = [...items];
  next[index] = withOperation({ ...next[index], [key]: nextValue });
  onChange(next);
}

function updateItemPatch(items: PickupRequest["items"], index: number, patch: Partial<PickupItemRequest>, onChange: (items: PickupRequest["items"]) => void) {
  const next = [...items];
  next[index] = withOperation({ ...next[index], ...patch });
  onChange(next);
}

function FilterableSelect({
  value,
  onChange,
  placeholder,
  options,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
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

function todayDateTimeLocalValue() {
  return toDateTimeLocalValue(new Date().toISOString());
}

function toApiDateTimeOffset(localValue: string) {
  if (!localValue) return localValue;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return localValue;
  return date.toISOString();
}
