import { useEffect, useId, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocateFixed, Plus, Search, Trash2 } from "lucide-react";
import { getQuotation } from "@/api/quotationApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { getActivePackageTypesForDropdown } from "@/api/packageTypeApi";
import { getActiveCountriesForDropdown } from "@/api/countryApi";
import { getCustomer } from "@/api/customerApi";
import { searchDirectShipmentParties, type DirectShipmentItemRequest, type DirectShipmentPartyLookupDto, type DirectShipmentRequest, type DirectShipmentUpdateRequest } from "@/api/directShipmentApi";
import { DirectGoodsSelectionTable } from "@/modules/shipments/direct/DirectGoodsSelectionTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { QuotationAutocomplete } from "@/components/common/QuotationAutocomplete";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export type DirectShipmentFormValue = {
  shipment: DirectShipmentRequest | DirectShipmentUpdateRequest;
  items: Array<DirectShipmentItemRequest & { id?: string | null; operationMode?: "New" | "Update" | "Delete"; length?: number; width?: number; height?: number }>;
  documentReference?: string;
};

export function DirectShipmentForm({
  initialValue,
  onSubmit,
  onSaveItem,
  isSubmitting
}: {
  initialValue?: DirectShipmentFormValue | null;
  onSubmit: (value: DirectShipmentFormValue) => Promise<void>;
  onSaveItem?: (item: DirectShipmentItemRequest) => Promise<Array<DirectShipmentItemRequest & { id?: string | null; operationMode?: "New" | "Update" | "Delete"; length?: number; width?: number; height?: number }>>;
  isSubmitting?: boolean;
}) {
  const toast = useToast();
  const shippingPorts = useQuery({ queryKey: ["direct-shipment-shipping-ports"], queryFn: () => getActiveShippingPortsForDropdown() });
  const packageTypes = useQuery({ queryKey: ["direct-shipment-package-types"], queryFn: () => getActivePackageTypesForDropdown() });
  const countries = useQuery({ queryKey: ["direct-shipment-countries"], queryFn: () => getActiveCountriesForDropdown() });
  const [value, setValue] = useState<DirectShipmentFormValue>(initialValue ?? {
      shipment: {
        customerId: "",
        salesmanId: null,
        quotationId: null,
        originPortGuid: null,
        destinationPortGuid: null,
        origin: "",
        destination: "",
        shipperName: "",
        shipperPhoneNumber: "",
        shipperAddress: "",
        consigneeName: "",
        consigneePhoneNumber: "",
        consigneeAddress: "",
        modeOfTransport: "Air",
        carrierId: null,
        carrierName: null,
        flightNumber: null,
        mawbNumber: null,
        vesselName: null,
        truckNumber: null,
        containerNumber: null,
      etd: todayDateTimeLocalValue(),
      eta: todayDateTimeLocalValue(),
      revenueAmount: 0,
      costAmount: 0,
      remarks: null
    },
    items: [{ id: null, operationMode: "New", goodsReceiptItemId: null, packageTypeGuid: null, packageTypeName: null, description: "", pieces: 0, weight: 0, volume: 0, length: 0, width: 0, height: 0, marksAndNumbers: null }],
    documentReference: ""
  });
  const mode = value.shipment.modeOfTransport;
  const [showGrnLoader, setShowGrnLoader] = useState(false);
  const [isLoadingQuotation, setIsLoadingQuotation] = useState(false);

  async function applyQuotation(quotationId: string) {
    if (!quotationId) {
      setValue((prev) => ({ ...prev, shipment: { ...prev.shipment, quotationId: null } }));
      return;
    }

    setIsLoadingQuotation(true);
    try {
      const quotation = await getQuotation(quotationId);
      const customer = await getCustomer(quotation.customerId);
      setValue((prev) => {
        const hasSavedItems = prev.items.some((item) => Boolean(item.id));
        const quotationItems: DirectShipmentFormValue["items"] = quotation.items.map((item) => ({
          id: null,
          operationMode: "New",
          goodsReceiptItemId: null,
          packageTypeGuid: item.packageTypeGuid ?? null,
          packageTypeName: item.packageTypeName,
          description: item.description?.trim() || item.packageTypeName || "Quotation item",
          receivedPieces: item.pieces,
          receivedWeight: item.actualWeight,
          length: item.length,
          width: item.width,
          height: item.height,
          volumeCbm: item.volumeCbm,
          loadedPieces: item.pieces,
          loadedWeight: item.actualWeight,
          loadedVolume: item.volumeCbm,
          pieces: item.pieces,
          weight: item.actualWeight,
          volume: item.volumeCbm,
          marksAndNumbers: null
        }));

        return {
          ...prev,
          shipment: {
            ...prev.shipment,
            quotationId: quotation.id,
            customerId: quotation.customerId,
            salesmanId: customer.salesmanId ?? null,
            originPortGuid: quotation.originPortGuid ?? null,
            destinationPortGuid: quotation.destinationPortGuid ?? null,
            origin: quotation.originPortName || quotation.origin,
            destination: quotation.destinationPortName || quotation.destination,
            modeOfTransport: quotation.modeOfTransport || prev.shipment.modeOfTransport
          },
          items: hasSavedItems ? prev.items : quotationItems
        };
      });
      toast.success(lt("Quotation loaded"), lt("Customer, route, transport mode, and quotation items were populated."));
    } catch {
      setValue((prev) => ({ ...prev, shipment: { ...prev.shipment, quotationId: null } }));
      toast.error(lt("Quotation unavailable"), lt("Unable to load the selected quotation."));
    } finally {
      setIsLoadingQuotation(false);
    }
  }

  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label={lt("Customer")}>
        <CustomerAutocomplete
          value={value.shipment.customerId}
          onChange={(customer) => setValue((prev) => ({
            ...prev,
            shipment: {
              ...prev.shipment,
              customerId: customer?.id ?? "",
              salesmanId: customer?.salesmanId ?? null,
              quotationId: null
            }
          }))}
        />
      </Field>
      <Field label={lt("Salesman (optional)")}><SalesmanSelect value={value.shipment.salesmanId} onChange={(salesmanId) => setValue({ ...value, shipment: { ...value.shipment, salesmanId } })} /></Field>
      <Field label={lt("Quotation")}>
        <QuotationAutocomplete
          value={value.shipment.quotationId}
          customerId={value.shipment.customerId}
          placeholder={isLoadingQuotation ? lt("Loading quotation...") : lt("Search approved quotation number")}
          onChange={(quotation) => void applyQuotation(quotation?.id ?? "")}
        />
      </Field>
      <Field label={lt("Transport Mode")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.shipment.modeOfTransport} onChange={(e) => {
        const nextMode = e.target.value;
        setValue({
          ...value,
          shipment: {
            ...value.shipment,
            modeOfTransport: nextMode,
            flightNumber: nextMode === "Air" ? value.shipment.flightNumber : null,
            vesselName: nextMode === "Sea" ? value.shipment.vesselName : null,
            truckNumber: nextMode === "Road" ? value.shipment.truckNumber : null,
            containerNumber: nextMode === "Sea" ? value.shipment.containerNumber : null
          }
        });
      }}><option value="Air">{lt("Air")}</option><option value="Sea">{lt("Sea")}</option><option value="Road">{lt("Road")}</option><option value="Courier">{lt("Courier")}</option></select></Field>
      <div className="md:col-span-3 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-3 space-y-3">
          <h3 className="text-sm font-semibold">{lt("Shipper Information")}</h3>
          <PartyLookup
            partyType="Shipper"
            currentName={value.shipment.shipperName}
            currentPhone={value.shipment.shipperPhoneNumber}
            onApply={(party) => setValue({ ...value, shipment: { ...value.shipment, shipperName: party.name, shipperPhoneNumber: party.phoneNo, shipperAddress: party.address } })}
          />
          <Field label={lt("Shipper Name")}><Input value={(value.shipment.shipperName ?? "")} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, shipperName: e.target.value } })} /></Field>
          <Field label={lt("Shipper Phone Number")}><Input value={(value.shipment.shipperPhoneNumber ?? "")} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, shipperPhoneNumber: e.target.value } })} /></Field>
          <Field label={lt("Shipper Address")}><Textarea rows={3} value={(value.shipment.shipperAddress ?? "")} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, shipperAddress: e.target.value } })} /></Field>
        </div>
        <div className="rounded-lg border p-3 space-y-3">
          <h3 className="text-sm font-semibold">{lt("Consignee Information")}</h3>
          <PartyLookup
            partyType="Consignee"
            currentName={value.shipment.consigneeName}
            currentPhone={value.shipment.consigneePhoneNumber}
            onApply={(party) => setValue({ ...value, shipment: { ...value.shipment, consigneeName: party.name, consigneePhoneNumber: party.phoneNo, consigneeAddress: party.address } })}
          />
          <Field label={lt("Consignee Name")}><Input value={(value.shipment.consigneeName ?? "")} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, consigneeName: e.target.value } })} /></Field>
          <Field label={lt("Consignee Phone Number")}><Input value={(value.shipment.consigneePhoneNumber ?? "")} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, consigneePhoneNumber: e.target.value } })} /></Field>
          <Field label={lt("Consignee Address")}><Textarea rows={3} value={(value.shipment.consigneeAddress ?? "")} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, consigneeAddress: e.target.value } })} /></Field>
        </div>
      </div>
      <Field label={lt("Origin Port")}>
        <FilterableSelect
          value={value.shipment.originPortGuid ?? ""}
          onChange={(next) => {
            const selected = (shippingPorts.data ?? []).find((x) => x.id === next);
            setValue({ ...value, shipment: { ...value.shipment, originPortGuid: next || null, origin: selected?.portName ?? "" } });
          }}
          placeholder={lt("Select origin port")}
          options={(shippingPorts.data ?? []).map((x) => ({ value: x.id, label: `${x.portCode} - ${x.portName} - ${x.countryName}` }))}
        />
      </Field>
      <Field label={lt("Destination Port")}>
        <FilterableSelect
          value={value.shipment.destinationPortGuid ?? ""}
          onChange={(next) => {
            const selected = (shippingPorts.data ?? []).find((x) => x.id === next);
            setValue({ ...value, shipment: { ...value.shipment, destinationPortGuid: next || null, destination: selected?.portName ?? "" } });
          }}
          placeholder={lt("Select destination port")}
          options={(shippingPorts.data ?? []).map((x) => ({ value: x.id, label: `${x.portCode} - ${x.portName} - ${x.countryName}` }))}
        />
      </Field>
      <Field label={lt("Carrier")}><Input value={value.shipment.carrierName ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, carrierName: e.target.value || null } })} /></Field>
      <Field label={lt("Master Waybill No")}><Input value={("mawbNumber" in value.shipment ? value.shipment.mawbNumber : null) ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, mawbNumber: e.target.value || null } })} /></Field>
      {mode === "Air" ? <Field label={lt("Flight")}><Input value={value.shipment.flightNumber ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, flightNumber: e.target.value || null } })} /></Field> : null}
      {mode === "Sea" ? <Field label={lt("Vessel")}><Input value={value.shipment.vesselName ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, vesselName: e.target.value || null } })} /></Field> : null}
      {mode === "Road" ? <Field label={lt("Truck")}><Input value={value.shipment.truckNumber ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, truckNumber: e.target.value || null } })} /></Field> : null}
      {mode === "Sea" ? <Field label={lt("Container")}><Input value={value.shipment.containerNumber ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, containerNumber: e.target.value || null } })} /></Field> : null}
      <Field label={lt("ETD")}><Input type="datetime-local" value={toInput(value.shipment.etd)} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, etd: e.target.value || null } })} /></Field>
      <Field label={lt("ETA")}><Input type="datetime-local" value={toInput(value.shipment.eta)} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, eta: e.target.value || null } })} /></Field>
      <Field label={lt("Invoice Reference")}><Input value={("customerInvoiceId" in value.shipment ? value.shipment.customerInvoiceId : null) ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, customerInvoiceId: e.target.value || null } })} /></Field>
      <Field label={lt("Vendor Bill Reference")}><Input value={("vendorBillId" in value.shipment ? value.shipment.vendorBillId : null) ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, vendorBillId: e.target.value || null } })} /></Field>
      <Field label={lt("Revenue")}><Input type="number" min="0" value={value.shipment.revenueAmount} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, revenueAmount: Math.max(0, Number(e.target.value)) } })} /></Field>
      <Field label={lt("Cost")}><Input type="number" min="0" value={value.shipment.costAmount} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, costAmount: Math.max(0, Number(e.target.value)) } })} /></Field>
      <div className="md:col-span-3"><Field label={lt("Remarks")}><Input value={value.shipment.remarks ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, remarks: e.target.value || null } })} /></Field></div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{lt("Direct Shipment Items")}</h3>
        <div className="flex gap-2">
          <Button type="button" variant={showGrnLoader ? "default" : "outline"} onClick={() => setShowGrnLoader((prev) => !prev)}>
            {showGrnLoader ? lt("Hide Goods Receipt Note Loader") : lt("Load From Goods Receipt Note")}
          </Button>
          <Button type="button" variant="outline" onClick={() => setValue({ ...value, items: [...value.items, { id: null, operationMode: "New", goodsReceiptItemId: null, packageTypeGuid: null, packageTypeName: null, hsCode: "", countryOfOrigin: "", description: "", pieces: 0, weight: 0, volume: 0, length: 0, width: 0, height: 0, marksAndNumbers: null }] })}>
            <Plus className="h-4 w-4" />{lt("Add Item")}</Button>
        </div>
      </div>
      {showGrnLoader ? (
        <DirectGoodsSelectionTable
          initialCustomerId={value.shipment.customerId}
          onClose={() => setShowGrnLoader(false)}
          onApply={async (items) => {
            if (!items.length) return;
            setValue((prev) => {
              const mapped = new Map(prev.items.map((row) => [row.goodsReceiptItemId ?? `manual-${row.description}-${row.length}-${row.width}-${row.height}`, row]));
              for (const row of items) {
                mapped.set(row.goodsReceiptItemId ?? `manual-${row.description}-${row.length}-${row.width}-${row.height}`, {
                  ...row,
                  operationMode: row.id && row.id !== EMPTY_GUID ? "Update" : "New"
                });
              }
              return {
                ...prev,
                items: Array.from(mapped.values())
              };
            });
          }}
        />
      ) : null}
      <div className="overflow-hidden rounded-md border bg-white">
        <div className="max-h-[520px] overflow-auto">
          <div className="min-w-[980px] divide-y">
          {value.items.map((item, index) => {
            const perItemVolume = Number((((item.length ?? 0) * (item.width ?? 0) * (item.height ?? 0)) / 1_000_000).toFixed(4));
            const totalVolume = Number((perItemVolume * (item.pieces ?? 0)).toFixed(4));
            const operationMode = item.operationMode ?? (item.id && item.id !== EMPTY_GUID ? "Update" : "New");
            return <div key={index} className={operationMode === "Delete" ? "bg-red-50/60" : "bg-white"}>
              <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[260px_minmax(260px,1.25fr)_minmax(240px,1fr)_240px_140px] xl:items-end">
                <ItemField label={lt("Package Type")}><FilterableSelect
                  value={item.packageTypeGuid ?? ""}
                  onChange={(next) => {
                    const selected = (packageTypes.data ?? []).find((x) => x.id === next);
                    const items = [...value.items];
                    items[index] = { ...items[index], packageTypeGuid: next || null, packageTypeName: selected?.packageName ?? null, operationMode: operationMode === "Delete" ? "Update" : operationMode };
                    setValue({ ...value, items });
                  }}
                  placeholder={lt("Select package type")}
                  options={(packageTypes.data ?? []).map((x) => ({ value: x.id, label: `${x.packageCode} - ${x.packageName}` }))}
                /></ItemField>
                <ItemField label={lt("Description")}><Input value={item.description} onChange={(e) => setItem(value, index, "description", e.target.value, setValue)} /></ItemField>
                <ItemField label={lt("Country of Origin")}><FilterableSelect value={item.countryOfOrigin ?? ""} onChange={(next) => setItem(value, index, "countryOfOrigin", next, setValue)} placeholder={lt("Select country")} options={(countries.data ?? []).map((x) => ({ value: x.name, label: `${x.countryCode} - ${x.name}` }))} /></ItemField>
                <ItemField label={lt("HS Code")}><Input value={item.hsCode ?? ""} onChange={(e) => setItem(value, index, "hsCode", e.target.value, setValue)} /></ItemField>
              </div>
              <div className="grid gap-3 border-t bg-slate-50/70 p-3 md:grid-cols-3 xl:grid-cols-[120px_120px_110px_110px_110px_140px_140px_260px] xl:items-end">
                <ItemField label={lt("No. of Packages")}><Input type="number" min="0" value={item.pieces} onChange={(e) => updateDimensionItem(value, index, { pieces: Math.max(0, Number(e.target.value)) }, setValue)} /></ItemField>
                <ItemField label={lt("Gross Weight")}><Input type="number" min="0" value={item.weight} onChange={(e) => updateDimensionItem(value, index, { weight: Math.max(0, Number(e.target.value)) }, setValue)} /></ItemField>
                <ItemField label={lt("Length (Per Item)")}><Input type="number" min="0" value={item.length ?? 0} onChange={(e) => updateDimensionItem(value, index, { length: Math.max(0, Number(e.target.value)) }, setValue)} /></ItemField>
                <ItemField label={lt("Width (Per Item)")}><Input type="number" min="0" value={item.width ?? 0} onChange={(e) => updateDimensionItem(value, index, { width: Math.max(0, Number(e.target.value)) }, setValue)} /></ItemField>
                <ItemField label={lt("Height (Per Item)")}><Input type="number" min="0" value={item.height ?? 0} onChange={(e) => updateDimensionItem(value, index, { height: Math.max(0, Number(e.target.value)) }, setValue)} /></ItemField>
                <ItemField label={lt("Per Item Volume")}><Input type="number" value={perItemVolume} disabled /></ItemField>
                <ItemField label={lt("Total Volume")}><Input type="number" value={totalVolume} disabled /></ItemField>
                <ItemField label={lt("Operation / Action")}><div className="flex h-10 items-center gap-2">
                  <span className="inline-flex h-10 items-center rounded-md border bg-slate-50 px-3 text-xs font-medium text-slate-700">{operationMode}</span>
                  {onSaveItem ? <Button type="button" size="sm" variant="outline" onClick={() => void saveDirectItem(value, index, onSaveItem, setValue)}>{operationMode === "Delete" ? lt("Delete") : lt("Save")}</Button> : null}
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    const current = value.items[index];
                    if (!current.id || current.id === EMPTY_GUID) {
                      setValue({ ...value, items: value.items.filter((_, i) => i !== index) });
                      return;
                    }
                    const items = [...value.items];
                    items[index] = { ...current, operationMode: "Delete" };
                    setValue({ ...value, items });
                  }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div></ItemField>
              </div>
            </div>;
          })}
          </div>
        </div>
      </div>
    </div>

    <Button onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? lt("Saving...") : lt("Save Direct Shipment")}</Button>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function ItemField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</Label>{children}</div>;
}

function PartyLookup({
  partyType,
  currentName,
  currentPhone,
  onApply
}: {
  partyType: "Shipper" | "Consignee";
  currentName?: string | null;
  currentPhone?: string | null;
  onApply: (party: DirectShipmentPartyLookupDto) => void;
}) {
  const [queryText, setQueryText] = useState("");
  const lookup = useQuery({
    queryKey: ["direct-shipment-party-lookup", partyType, queryText],
    queryFn: () => searchDirectShipmentParties({ partyType, search: queryText, pageSize: 8 }),
    enabled: queryText.trim().length >= 2
  });
  const quickSearches = [currentName, currentPhone].map((x) => x?.trim()).filter((x): x is string => Boolean(x && x.length >= 2));

  return (
    <div className="space-y-2 rounded-md border bg-slate-50/70 p-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder={lt(`Search ${partyType.toLowerCase()} name or phone`)}
          className="pl-8"
        />
      </div>
      {quickSearches.length ? (
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((item) => (
            <Button key={item} type="button" size="sm" variant="outline" onClick={() => setQueryText(item)}>
              <LocateFixed className="h-3.5 w-3.5" />
              {item}
            </Button>
          ))}
        </div>
      ) : null}
      {lookup.data?.length ? (
        <div className="max-h-48 overflow-auto rounded-md border bg-white">
          {lookup.data.map((party) => (
            <button
              key={`${party.partyType}-${party.name}-${party.phoneNo}-${party.lastDirectShipmentNumber}`}
              type="button"
              className="block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
              onClick={() => onApply(party)}
            >
              <span className="block font-medium text-slate-900">{party.name || party.phoneNo || "-"}</span>
              <span className="block text-xs text-slate-600">{party.phoneNo || "-"} · {party.lastDirectShipmentNumber}</span>
              {party.address ? <span className="line-clamp-2 block text-xs text-slate-500">{party.address}</span> : null}
            </button>
          ))}
        </div>
      ) : queryText.trim().length >= 2 && !lookup.isLoading ? (
        <p className="text-xs text-muted-foreground">{lt("No previous party found.")}</p>
      ) : null}
    </div>
  );
}

function FilterableSelect({
  value,
  onChange,
  placeholder,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  const listId = useId();
  const [text, setText] = useState("");

  useEffect(() => {
    const selected = options.find((x) => x.value === value);
    setText(selected?.label ?? "");
  }, [value, options]);

  return (
    <div className="space-y-1">
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
function toInput(value: string | null | undefined) { return value ? value.slice(0, 16) : ""; }
function todayDateTimeLocalValue() { return toInput(new Date().toISOString()); }
function setItem(value: DirectShipmentFormValue, index: number, key: keyof DirectShipmentItemRequest, nextValue: string | number | null, setValue: (next: DirectShipmentFormValue) => void) {
  const items = [...value.items];
  const current = { ...items[index], [key]: nextValue } as DirectShipmentItemRequest;
  current.operationMode = current.id && current.id !== EMPTY_GUID ? "Update" : "New";
  items[index] = current;
  setValue({ ...value, items });
}

function updateDimensionItem(
  value: DirectShipmentFormValue,
  index: number,
  patch: Partial<DirectShipmentFormValue["items"][number]>,
  setValue: (next: DirectShipmentFormValue) => void
) {
  const items = [...value.items];
  const next = { ...items[index], ...patch };
  const perItemVolume = ((next.length ?? 0) * (next.width ?? 0) * (next.height ?? 0)) / 1_000_000;
  next.volume = Number(((next.pieces ?? 0) * perItemVolume).toFixed(4));
  next.operationMode = next.id && next.id !== EMPTY_GUID ? "Update" : "New";
  items[index] = next;
  setValue({ ...value, items });
}

async function saveDirectItem(
  value: DirectShipmentFormValue,
  index: number,
  onSaveItem: (item: DirectShipmentItemRequest) => Promise<Array<DirectShipmentItemRequest & { id?: string | null; operationMode?: "New" | "Update" | "Delete"; length?: number; width?: number; height?: number }>>,
  setValue: (next: DirectShipmentFormValue) => void
) {
  const item = value.items[index];
  const normalizedItem = normalizeDirectShipmentItem(item);
  if ((item.operationMode ?? "New") === "Delete") {
    if (!item.id || item.id === EMPTY_GUID) {
      setValue({ ...value, items: value.items.filter((_, i) => i !== index) });
      return;
    }
  }

  const refreshed = await onSaveItem({ ...normalizedItem, operationMode: item.operationMode ?? (item.id && item.id !== EMPTY_GUID ? "Update" : "New") });
  setValue({ ...value, items: refreshed.map((x) => ({ ...x, operationMode: "Update" as const })) });
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function normalizeDirectShipmentItem(item: DirectShipmentItemRequest & { id?: string | null; operationMode?: "New" | "Update" | "Delete"; length?: number; width?: number; height?: number }) {
  const pieces = item.pieces ?? 0;
  const weight = item.weight ?? 0;
  const volume = item.volume ?? 0;
  return {
    ...item,
    receivedPieces: item.receivedPieces && item.receivedPieces > 0 ? item.receivedPieces : pieces,
    receivedWeight: item.receivedWeight && item.receivedWeight > 0 ? item.receivedWeight : weight,
    volumeCbm: item.volumeCbm && item.volumeCbm > 0 ? item.volumeCbm : volume,
    loadedPieces: item.loadedPieces && item.loadedPieces > 0 ? item.loadedPieces : pieces,
    loadedWeight: item.loadedWeight && item.loadedWeight > 0 ? item.loadedWeight : weight,
    loadedVolume: item.loadedVolume && item.loadedVolume > 0 ? item.loadedVolume : volume,
    pieces,
    weight,
    volume
  };
}
