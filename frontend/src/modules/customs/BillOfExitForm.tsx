import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Save, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchBillOfEntryItemsForExit, type BillOfEntryItemFifoDto, type BillOfExitDto, type BillOfExitItemRequest, type BillOfExitRequest } from "@/api/billOfExitApi";
import { getBranchOptions } from "@/api/branchApi";
import { searchCarriers } from "@/api/carrierApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import { searchBoeInventories } from "@/api/billOfEntryApi";
import type { ShippingPortDto } from "@/api/shippingPortApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { searchWarehouseLocations, searchWarehouses } from "@/api/warehouseApi";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

interface BillOfExitFormProps {
  title: string;
  description: string;
  initialValue?: BillOfExitDto | null;
  onSubmit: (request: BillOfExitRequest) => Promise<BillOfExitDto | undefined>;
}

const today = new Date().toISOString().slice(0, 10);
const transportModes = ["Air", "Sea", "Road", "Courier"];
const declarationTypes = ["Import", "Export"];
const measurementOptions = ["KG", "CBM", "PCS", "PKG", "TON", "PALLET"];

export function BillOfExitForm({ title, description, initialValue, onSubmit }: BillOfExitFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState(initialValue?.warehouseId ?? "");
  const warehousesQuery = useQuery({ queryKey: ["box-form-warehouses"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const locationsQuery = useQuery({ queryKey: ["box-form-locations", warehouseId], queryFn: () => searchWarehouseLocations({ pageNumber: 1, pageSize: 200, isActive: true, warehouseId: warehouseId || undefined }) });
  const currenciesQuery = useQuery({ queryKey: ["box-form-currencies"], queryFn: getTenantCurrencies });
  const branchesQuery = useQuery({ queryKey: ["box-form-branches"], queryFn: getBranchOptions });
  const portsQuery = useQuery({ queryKey: ["box-form-shipping-ports"], queryFn: () => getActiveShippingPortsForDropdown() });
  const carriersQuery = useQuery({ queryKey: ["box-form-carriers"], queryFn: () => searchCarriers({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const warehouses = warehousesQuery.data?.items ?? [];
  const locations = locationsQuery.data?.items ?? [];
  const currencies = currenciesQuery.data?.filter((item) => item.isEnabled) ?? [];
  const ports = portsQuery.data ?? [];
  const carriers = carriersQuery.data?.items ?? [];
  const defaultCurrency = currencies.find((item) => item.isBaseCurrency) ?? currencies[0];
  const [header, setHeader] = useState(() => toHeaderState(initialValue));
  const [items, setItems] = useState<BillOfExitItemRequest[]>(() => initialValue?.items?.length ? initialValue.items.map(toItemRequest) : []);
  const isEdit = Boolean(initialValue?.id);
  const locked = initialValue?.isApproved || initialValue?.state === "Approved";

  useEffect(() => {
    if (!warehouseId && warehouses[0]) {
      setWarehouseId(warehouses[0].id);
      setHeader((value) => ({ ...value, warehouseId: warehouses[0].id, warehouseName: warehouses[0].warehouseName }));
    }
  }, [warehouseId, warehouses]);

  useEffect(() => {
    if (!header.warehouseLocationId && locations[0]) setHeader((value) => ({ ...value, warehouseLocationId: locations[0].id, warehouseLocationName: locations[0].locationCode }));
  }, [header.warehouseLocationId, locations]);

  useEffect(() => {
    if (!header.currencyId && defaultCurrency) setHeader((value) => ({ ...value, currencyId: defaultCurrency.currencyId, currencyCode: defaultCurrency.currencyCode }));
  }, [defaultCurrency, header.currencyId]);

  useEffect(() => {
    const firstBranch = branchesQuery.data?.[0];
    if (!header.consigneeExporterBranchId && firstBranch) setHeader((value) => ({ ...value, consigneeExporterBranchId: firstBranch.id, consigneeExporterName: firstBranch.name }));
  }, [branchesQuery.data, header.consigneeExporterBranchId]);

  function setHeaderValue<K extends keyof BillOfExitRequest>(key: K, value: BillOfExitRequest[K]) {
    setHeader((current) => ({ ...current, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<BillOfExitItemRequest>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function handleSubmit() {
    setIsSaving(true);
    try {
      const request: BillOfExitRequest = {
        ...header,
        warehouseId,
        warehouseName: warehouses.find((item) => item.id === warehouseId)?.warehouseName ?? header.warehouseName,
        warehouseLocationName: locations.find((item) => item.id === header.warehouseLocationId)?.locationCode ?? header.warehouseLocationName,
        currencyCode: currencies.find((item) => item.currencyId === header.currencyId)?.currencyCode ?? header.currencyCode,
        items: items.map((item) => ({
          ...item,
          operationMode: item.id ? "Update" : "New",
          currencyId: item.currencyId || header.currencyId,
          currencyCode: item.currencyCode || header.currencyCode,
          exchangeRate: Number(item.exchangeRate ?? header.exchangeRate),
          unit: item.unit || "Main Unit"
        }))
      };
      const saved = await onSubmit(request);
      toast.success(lt("Bill of Exit saved"));
      navigate(saved?.id ? `/bill-of-exits/${saved.id}` : "/bill-of-exits");
    } finally {
      setIsSaving(false);
    }
  }

  function addFifoItems(selections: Array<{ row: BillOfEntryItemFifoDto; quantity: number }>) {
    const existingItemIds = new Set(items.map((item) => item.billOfEntryItemId).filter(Boolean));
    const newSelections = selections.filter(({ row }) => !existingItemIds.has(row.billOfEntryItemId));
    if (!newSelections.length) {
      toast.error(lt("Items already selected"));
      return;
    }
    setItems((current) => [...current, ...newSelections.map<BillOfExitItemRequest>(({ row, quantity }) => ({
      operationMode: "New",
      billOfEntryId: row.billOfEntryId,
      billOfEntryItemId: row.billOfEntryItemId,
      billOfEntryNumber: row.billOfEntryNumber,
      inventoryId: row.inventoryId,
      inventoryCode: row.inventoryCode,
      inventoryName: row.inventoryName,
      hsCode: row.hsCode ?? "",
      goodsDescription: row.goodsDescription,
      countryOfOrigin: row.countryOfOrigin,
      quantity,
      netWeight: row.netWeight,
      grossWeight: row.grossWeight,
      unit: row.unit || "Main Unit",
      cifForeignValue: row.cifForeignValue,
      currencyId: row.currencyId || header.currencyId,
      currencyCode: row.currencyCode || header.currencyCode,
      exchangeRate: row.exchangeRate || header.exchangeRate,
      dutyRate: row.dutyRate,
      incomeType: row.incomeType
    }))]);
    setSelectorOpen(false);
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt(title)} description={lt(description)} actions={<Button onClick={() => void handleSubmit()} disabled={isSaving || locked}><Save className="h-4 w-4" />{lt("Save")}</Button>} />
      <Card>
        <CardHeader><CardTitle>{lt("Bill of Exit Header")}</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <Field label={lt("Port Type")} required><Select value={header.portType} onChange={(value) => setHeaderValue("portType", value)} options={transportModes} /></Field>
          <Field label={lt("Declaration Type")} required><Select value={header.declarationType} onChange={(value) => setHeaderValue("declarationType", value)} options={declarationTypes} /></Field>
          <Field label={lt("Declaration Date")} required><Input type="date" value={header.declarationDate} onChange={(event) => setHeaderValue("declarationDate", event.target.value)} /></Field>
          <Field label={lt("Declaration Number")} required><Input value={header.declarationNumber} onChange={(event) => setHeaderValue("declarationNumber", event.target.value)} /></Field>
          <Field label={lt("Bill of Exit Number")} required><Input value={header.billOfExitNumber} onChange={(event) => setHeaderValue("billOfExitNumber", event.target.value)} /></Field>
          <Field label={lt("Consignee / Exporter Branch")} required>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.consigneeExporterBranchId ?? ""} onChange={(event) => {
              const branch = branchesQuery.data?.find((item) => item.id === event.target.value);
              setHeader((value) => ({ ...value, consigneeExporterBranchId: branch?.id ?? "", consigneeExporterName: branch?.name ?? "" }));
            }}>
              <option value="">{lt("Select branch")}</option>
              {branchesQuery.data?.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
            </select>
          </Field>
          <Field label={lt("Intercessor Co.")}><CustomerAutocomplete value={header.intercessorCustomerId ?? ""} onChange={(customer) => setHeader((value) => ({ ...value, intercessorCustomerId: customer?.id ?? "", intercessorCustomerName: customer?.customerName ?? "" }))} /></Field>
          <Field label={lt("Commercial Reg No.")}><Input value={header.commercialRegistrationNumber ?? ""} onChange={(event) => setHeaderValue("commercialRegistrationNumber", event.target.value)} /></Field>
          <Field label={lt("Export To")}><Input value={header.exportTo ?? ""} onChange={(event) => setHeaderValue("exportTo", event.target.value)} /></Field>
          <Field label={lt("TIN No.")}><Input value={header.tinNumber ?? ""} onChange={(event) => setHeaderValue("tinNumber", event.target.value)} /></Field>
          <Field label={lt("Delivery Order No.")}><Input value={header.deliveryOrderNumber ?? ""} onChange={(event) => setHeaderValue("deliveryOrderNumber", event.target.value)} /></Field>
          <Field label={lt("Measurement")}><Select value={header.measurement ?? ""} onChange={(value) => setHeaderValue("measurement", value)} options={measurementOptions} emptyLabel="Select measurement" /></Field>
          <Field label={lt("Net Weight")}><Input type="number" min={0} value={header.netWeight} onChange={(event) => setHeaderValue("netWeight", Number(event.target.value))} /></Field>
          <Field label={lt("Gross Weight")}><Input type="number" min={0} value={header.grossWeight} onChange={(event) => setHeaderValue("grossWeight", Number(event.target.value))} /></Field>
          <Field label={lt("No. of Packages")}><Input type="number" min={0} value={header.numberOfPackages} onChange={(event) => setHeaderValue("numberOfPackages", Number(event.target.value))} /></Field>
          <Field label={lt("CAR/CAPT")}><Input value={header.carCaptain ?? ""} onChange={(event) => setHeaderValue("carCaptain", event.target.value)} /></Field>
          <Field label={lt("Carrier Name")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.carrierName ?? ""} onChange={(event) => setHeaderValue("carrierName", event.target.value)}>
              <option value="">{lt("Select carrier")}</option>
              {currentValueOption(header.carrierName, carriers.map((item) => item.carrierName))}
              {carriers.map((item) => <option key={item.id} value={item.carrierName}>{item.carrierCode} - {item.carrierName}</option>)}
            </select>
          </Field>
          <Field label={lt("Voyage / Flight No.")}><Input value={header.voyageFlightNumber ?? ""} onChange={(event) => setHeaderValue("voyageFlightNumber", event.target.value)} /></Field>
          <Field label={lt("Port of Loading")}><PortSelect value={header.portOfLoading ?? ""} ports={ports} onChange={(value) => setHeaderValue("portOfLoading", value)} /></Field>
          <Field label={lt("Port of Discharge")}><PortSelect value={header.portOfDischarge ?? ""} ports={ports} onChange={(value) => setHeaderValue("portOfDischarge", value)} /></Field>
          <Field label={lt("Destination")}><PortSelect value={header.destination ?? ""} ports={ports} onChange={(value) => setHeaderValue("destination", value)} /></Field>
          <Field label={lt("Marks & Numbers")}><Input value={header.marksAndNumbers ?? ""} onChange={(event) => setHeaderValue("marksAndNumbers", event.target.value)} /></Field>
          <Field label={lt("B/L - AWB No / Manifest")}><Input value={header.transportDocumentNumber ?? ""} onChange={(event) => setHeaderValue("transportDocumentNumber", event.target.value)} /></Field>
          <Field label={lt("Currency")} required>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.currencyId} onChange={(event) => {
              const currency = currencies.find((item) => item.currencyId === event.target.value);
              setHeader((value) => ({ ...value, currencyId: event.target.value, currencyCode: currency?.currencyCode ?? "" }));
            }}>
              <option value="">{lt("Select currency")}</option>
              {currencies.map((item) => <option key={item.currencyId} value={item.currencyId}>{item.currencyCode} - {item.currencyName}</option>)}
            </select>
          </Field>
          <Field label={lt("Exchange Rate")} required><Input type="number" min={0} step="0.0001" value={header.exchangeRate} onChange={(event) => setHeaderValue("exchangeRate", Number(event.target.value))} /></Field>
          <Field label={lt("Warehouse")} required>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={warehouseId} onChange={(event) => {
              const warehouse = warehouses.find((item) => item.id === event.target.value);
              setWarehouseId(event.target.value);
              setHeader((value) => ({ ...value, warehouseId: event.target.value, warehouseName: warehouse?.warehouseName ?? "", warehouseLocationId: "", warehouseLocationName: "" }));
            }}>
              <option value="">{lt("Select warehouse")}</option>
              {warehouses.map((item) => <option key={item.id} value={item.id}>{item.warehouseCode} - {item.warehouseName}</option>)}
            </select>
          </Field>
          <Field label={lt("Warehouse Location")} required>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.warehouseLocationId} onChange={(event) => {
              const location = locations.find((item) => item.id === event.target.value);
              setHeader((value) => ({ ...value, warehouseLocationId: event.target.value, warehouseLocationName: location?.locationCode ?? "" }));
            }}>
              <option value="">{lt("Select location")}</option>
              {locations.map((item) => <option key={item.id} value={item.id}>{item.locationCode}</option>)}
            </select>
          </Field>
          <Field label={lt("Remarks")}><Input value={header.remarks ?? ""} onChange={(event) => setHeaderValue("remarks", event.target.value)} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{lt("Items")}</CardTitle>
          {!isEdit ? <Button variant="outline" size="sm" onClick={() => setSelectorOpen(true)}><Plus className="h-4 w-4" />{lt("Add from Bill of Entry")}</Button> : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {!items.length ? <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{lt("No items selected.")}</div> : null}
          {items.map((item, index) => (
            <div key={item.id ?? item.billOfEntryItemId} className="rounded-md border p-3">
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                <Field label={lt("Bill of Entry No.")}><Input value={item.billOfEntryNumber ?? ""} disabled /></Field>
                <Field label={lt("Inventory")}><Input value={`${item.inventoryCode ?? ""} - ${item.inventoryName ?? ""}`} disabled /></Field>
                <Field label={lt("HS Code")}><Input value={item.hsCode ?? ""} onChange={(event) => updateItem(index, { hsCode: event.target.value })} /></Field>
                <Field label={lt("Quantity")}><Input type="number" value={item.quantity} disabled /></Field>
                <Field label={lt("Goods Description")}><Input value={item.goodsDescription} onChange={(event) => updateItem(index, { goodsDescription: event.target.value })} /></Field>
                <Field label={lt("Country of Origin")}><Input value={item.countryOfOrigin} onChange={(event) => updateItem(index, { countryOfOrigin: event.target.value })} /></Field>
                <Field label={lt("CIF Foreign Value")}><Input type="number" min={0} value={item.cifForeignValue} onChange={(event) => updateItem(index, { cifForeignValue: Number(event.target.value) })} /></Field>
                <Field label={lt("Exchange Rate")}><Input type="number" min={0} value={item.exchangeRate ?? header.exchangeRate} onChange={(event) => updateItem(index, { exchangeRate: Number(event.target.value) })} /></Field>
                <Field label={lt("Duty Rate %")}><Input type="number" min={0} value={item.dutyRate} onChange={(event) => updateItem(index, { dutyRate: Number(event.target.value) })} /></Field>
                <Field label={lt("Income Type")}><Input value={item.incomeType ?? ""} onChange={(event) => updateItem(index, { incomeType: event.target.value })} /></Field>
                <Field label={lt("Net Weight")}><Input type="number" min={0} value={item.netWeight} onChange={(event) => updateItem(index, { netWeight: Number(event.target.value) })} /></Field>
                <Field label={lt("Gross Weight")}><Input type="number" min={0} value={item.grossWeight} onChange={(event) => updateItem(index, { grossWeight: Number(event.target.value) })} /></Field>
                <Field label={lt("Unit")}><Input value={item.unit ?? "Main Unit"} disabled /></Field>
                {!isEdit ? <div className="flex items-end"><Button variant="outline" size="sm" onClick={() => setItems((value) => value.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" />{lt("Remove")}</Button></div> : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {selectorOpen ? <BillOfEntryItemSelector warehouseId={warehouseId} warehouseLocationId={header.warehouseLocationId} onClose={() => setSelectorOpen(false)} onAdd={addFifoItems} /> : null}
    </div>
  );
}

function BillOfEntryItemSelector({ warehouseId, warehouseLocationId, onClose, onAdd }: { warehouseId: string; warehouseLocationId: string; onClose: () => void; onAdd: (items: Array<{ row: BillOfEntryItemFifoDto; quantity: number }>) => void }) {
  const [filters, setFilters] = useState({ declarationNumber: "", billOfEntryNumber: "", inventoryId: "", declarationDateFrom: "", declarationDateTo: "" });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const inventoriesQuery = useQuery({ queryKey: ["box-selector-inventories"], queryFn: () => searchBoeInventories({ pageNumber: 1, pageSize: 200 }) });
  const query = useQuery({
    queryKey: ["box-fifo-items", filters, warehouseId, warehouseLocationId],
    queryFn: () => searchBillOfEntryItemsForExit({ pageNumber: 1, pageSize: 50, ...filters, inventoryId: filters.inventoryId || undefined, warehouseId: warehouseId || undefined, warehouseLocationId: warehouseLocationId || undefined }),
    enabled: Boolean(warehouseId && warehouseLocationId)
  });
  const rows = query.data?.items ?? [];
  const selectableIds = rows.filter((row) => row.availableCount > 0).map((row) => row.billOfEntryItemId);
  const selectedItems = rows
    .filter((row) => selectedIds.includes(row.billOfEntryItemId))
    .map((row) => ({ row, quantity: quantities[row.billOfEntryItemId] ?? row.availableCount }));
  const canAddSelected = selectedItems.length > 0 && selectedItems.every(({ row, quantity }) => quantity > 0 && quantity <= row.availableCount);
  const allVisibleSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  function toggleSelection(id: string, checked: boolean) {
    setSelectedIds((current) => checked ? [...new Set([...current, id])] : current.filter((value) => value !== id));
  }

  function toggleAllVisible(checked: boolean) {
    setSelectedIds((current) => {
      const visibleIds = new Set(selectableIds);
      if (!checked) return current.filter((id) => !visibleIds.has(id));
      return [...new Set([...current, ...selectableIds])];
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">{lt("Select Bill of Entry Items")}</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={!canAddSelected} onClick={() => onAdd(selectedItems)}>{lt("Add Selected")} ({selectedItems.length})</Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-5">
          <FilterField label={lt("Declaration Number")}><Input value={filters.declarationNumber} onChange={(event) => setFilters((v) => ({ ...v, declarationNumber: event.target.value }))} /></FilterField>
          <FilterField label={lt("Bill of Entry Number")}><Input value={filters.billOfEntryNumber} onChange={(event) => setFilters((v) => ({ ...v, billOfEntryNumber: event.target.value }))} /></FilterField>
          <FilterField label={lt("Inventory")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={filters.inventoryId} onChange={(event) => setFilters((v) => ({ ...v, inventoryId: event.target.value }))}><option value="">{lt("All")}</option>{inventoriesQuery.data?.items.map((x) => <option key={x.id} value={x.id}>{x.inventoryCode} - {x.inventoryName}</option>)}</select></FilterField>
          <FilterField label={lt("Date From")}><Input type="date" value={filters.declarationDateFrom} onChange={(event) => setFilters((v) => ({ ...v, declarationDateFrom: event.target.value }))} /></FilterField>
          <FilterField label={lt("Date To")}><Input type="date" value={filters.declarationDateTo} onChange={(event) => setFilters((v) => ({ ...v, declarationDateTo: event.target.value }))} /></FilterField>
        </div>
        <div className="overflow-auto px-4 pb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="w-10 p-2 text-left"><input type="checkbox" checked={allVisibleSelected} disabled={!selectableIds.length} onChange={(event) => toggleAllVisible(event.target.checked)} /></th><th className="p-2 text-left">{lt("BOE")}</th><th className="p-2 text-left">{lt("Date")}</th><th className="p-2 text-left">{lt("Inventory")}</th><th className="p-2 text-left">{lt("HS Code")}</th><th className="p-2 text-right">{lt("Available")}</th><th className="p-2 text-right">{lt("Quantity")}</th></tr></thead>
            <tbody>
              {rows.map((row) => {
                const quantity = quantities[row.billOfEntryItemId] ?? row.availableCount;
                const selected = selectedIds.includes(row.billOfEntryItemId);
                return <tr key={row.billOfEntryItemId} className="border-t"><td className="p-2"><input type="checkbox" checked={selected} disabled={row.availableCount <= 0} onChange={(event) => toggleSelection(row.billOfEntryItemId, event.target.checked)} /></td><td className="p-2">{row.billOfEntryNumber}<div className="text-xs text-muted-foreground">{row.declarationNumber}</div></td><td className="p-2">{row.declarationDate?.slice(0, 10)}</td><td className="p-2">{row.inventoryCode} - {row.inventoryName}<div className="text-xs text-muted-foreground">{row.goodsDescription}</div></td><td className="p-2">{row.hsCode || "-"}</td><td className="p-2 text-right">{row.availableCount}</td><td className="p-2 text-right"><Input className="ml-auto w-28" type="number" min={0} max={row.availableCount} value={quantity} onChange={(event) => setQuantities((v) => ({ ...v, [row.billOfEntryItemId]: Number(event.target.value) }))} /></td></tr>;
              })}
              {!rows.length ? <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">{query.isLoading ? lt("Loading...") : lt("No available FIFO items found.")}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return <div className="space-y-1"><Label>{label}{required ? <span className="ml-1 text-red-600">*</span> : null}</Label>{children}</div>;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function Select({ value, onChange, options, emptyLabel }: { value: string; onChange: (value: string) => void; options: string[]; emptyLabel?: string }) {
  return <select className="h-10 w-full rounded-md border px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>{emptyLabel ? <option value="">{lt(emptyLabel)}</option> : null}{options.map((option) => <option key={option} value={option}>{lt(option)}</option>)}</select>;
}

function toHeaderState(value?: BillOfExitDto | null): BillOfExitRequest {
  return {
    portType: value?.portType ?? "Sea",
    declarationType: value?.declarationType ?? "Export",
    declarationDate: value?.declarationDate?.slice(0, 10) ?? today,
    declarationNumber: value?.declarationNumber ?? "",
    billOfExitNumber: value?.billOfExitNumber ?? "",
    consigneeExporterBranchId: value?.consigneeExporterBranchId ?? "",
    consigneeExporterName: value?.consigneeExporterName ?? "",
    intercessorCustomerId: value?.intercessorCustomerId ?? "",
    intercessorCustomerName: value?.intercessorCustomerName ?? "",
    commercialRegistrationNumber: value?.commercialRegistrationNumber ?? "",
    exportTo: value?.exportTo ?? "",
    tinNumber: value?.tinNumber ?? "",
    deliveryOrderNumber: value?.deliveryOrderNumber ?? "",
    measurement: value?.measurement ?? "",
    netWeight: value?.netWeight ?? 0,
    grossWeight: value?.grossWeight ?? 0,
    numberOfPackages: value?.numberOfPackages ?? 0,
    carCaptain: value?.carCaptain ?? "",
    carrierName: value?.carrierName ?? "",
    voyageFlightNumber: value?.voyageFlightNumber ?? "",
    portOfLoading: value?.portOfLoading ?? "",
    portOfDischarge: value?.portOfDischarge ?? "",
    destination: value?.destination ?? "",
    marksAndNumbers: value?.marksAndNumbers ?? "",
    transportDocumentNumber: value?.transportDocumentNumber ?? "",
    currencyId: value?.currencyId ?? "",
    currencyCode: value?.currencyCode ?? "",
    exchangeRate: value?.exchangeRate ?? 1,
    warehouseId: value?.warehouseId ?? "",
    warehouseName: value?.warehouseName ?? "",
    warehouseLocationId: value?.warehouseLocationId ?? "",
    warehouseLocationName: value?.warehouseLocationName ?? "",
    remarks: value?.remarks ?? "",
    items: []
  };
}

function toItemRequest(item: BillOfExitDto["items"][number]): BillOfExitItemRequest {
  return {
    id: item.id,
    operationMode: "Update",
    billOfEntryId: item.billOfEntryId,
    billOfEntryItemId: item.billOfEntryItemId,
    billOfEntryNumber: item.billOfEntryNumber,
    inventoryId: item.inventoryId,
    inventoryCode: item.inventoryCode,
    inventoryName: item.inventoryName,
    hsCode: item.hsCode ?? "",
    goodsDescription: item.goodsDescription,
    countryOfOrigin: item.countryOfOrigin,
    quantity: item.quantity,
    netWeight: item.netWeight,
    grossWeight: item.grossWeight,
    unit: item.unit,
    cifForeignValue: item.cifForeignValue,
    currencyId: item.currencyId,
    currencyCode: item.currencyCode,
    exchangeRate: item.exchangeRate,
    dutyRate: item.dutyRate,
    incomeType: item.incomeType
  };
}

function PortSelect({ value, ports, onChange }: { value: string; ports: ShippingPortDto[]; onChange: (value: string) => void }) {
  return (
    <select className="h-10 w-full rounded-md border px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{lt("Select port")}</option>
      {currentValueOption(value, ports.map((item) => item.portName))}
      {ports.map((item) => <option key={item.id} value={item.portName}>{item.portCode} - {item.portName} - {item.countryName}</option>)}
    </select>
  );
}

function currentValueOption(value: string | null | undefined, options: string[]) {
  if (!value || options.some((option) => option === value)) return null;
  return <option value={value}>{value}</option>;
}
