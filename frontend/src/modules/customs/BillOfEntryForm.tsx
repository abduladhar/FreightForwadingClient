import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { BillOfEntryAiExtractionResultDto, BillOfEntryDto, BillOfEntryItemRequest, BillOfEntryRequest, BoeInventoryDto } from "@/api/billOfEntryApi";
import { searchBoeInventories, saveBoeInventory } from "@/api/billOfEntryApi";
import { getBranchOptions } from "@/api/branchApi";
import { searchCarriers } from "@/api/carrierApi";
import { getActiveCountriesForDropdown, type CountryDto } from "@/api/countryApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import type { ShippingPortDto } from "@/api/shippingPortApi";
import { createShippingPort, getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { searchWarehouseLocations, searchWarehouses } from "@/api/warehouseApi";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { BillOfEntryAiExtractionPanel } from "@/modules/customs/BillOfEntryAiExtractionPanel";
import { lt } from "@/modules/operationsLocalization";

interface BillOfEntryFormProps {
  title: string;
  description: string;
  initialValue?: BillOfEntryDto | null;
  onSubmit: (request: BillOfEntryRequest) => Promise<BillOfEntryDto | undefined>;
}

const today = new Date().toISOString().slice(0, 10);
const transportModes = ["Air", "Sea", "Road", "Courier"];
const declarationTypes = ["Import", "Export"];
const measurementOptions = ["KG", "CBM", "PCS", "PKG", "TON", "PALLET"];
type RecalculateBasis = "ItemCount" | "Weight";
interface AiMasterMessage { type: "created" | "warning"; text: string }

export function BillOfEntryForm({ title, description, initialValue, onSubmit }: BillOfEntryFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const warehousesQuery = useQuery({ queryKey: ["boe-form-warehouses"], queryFn: () => searchWarehouses({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const [warehouseId, setWarehouseId] = useState(initialValue?.warehouseId ?? "");
  const locationsQuery = useQuery({ queryKey: ["boe-form-locations", warehouseId], queryFn: () => searchWarehouseLocations({ pageNumber: 1, pageSize: 200, isActive: true, warehouseId: warehouseId || undefined }) });
  const currenciesQuery = useQuery({ queryKey: ["boe-form-currencies"], queryFn: getTenantCurrencies });
  const branchesQuery = useQuery({ queryKey: ["boe-form-branches"], queryFn: getBranchOptions });
  const inventoriesQuery = useQuery({ queryKey: ["boe-form-inventories"], queryFn: () => searchBoeInventories({ pageNumber: 1, pageSize: 200 }) });
  const countriesQuery = useQuery({ queryKey: ["boe-form-countries"], queryFn: () => getActiveCountriesForDropdown() });
  const portsQuery = useQuery({ queryKey: ["boe-form-shipping-ports"], queryFn: () => getActiveShippingPortsForDropdown() });
  const carriersQuery = useQuery({ queryKey: ["boe-form-carriers"], queryFn: () => searchCarriers({ pageNumber: 1, pageSize: 200, isActive: true }) });

  const warehouses = warehousesQuery.data?.items ?? [];
  const locations = locationsQuery.data?.items ?? [];
  const currencies = currenciesQuery.data?.filter((item) => item.isEnabled) ?? [];
  const inventories = inventoriesQuery.data?.items ?? [];
  const countries = countriesQuery.data ?? [];
  const ports = portsQuery.data ?? [];
  const carriers = carriersQuery.data?.items ?? [];

  const defaultCurrency = currencies.find((item) => item.isBaseCurrency) ?? currencies[0];
  const [header, setHeader] = useState(() => toHeaderState(initialValue));
  const [items, setItems] = useState<BillOfEntryItemRequest[]>(() => initialValue?.items?.length ? initialValue.items.map(toItemRequest) : [newItem()]);
  const [recalculateBasis, setRecalculateBasis] = useState<RecalculateBasis>("ItemCount");
  const [aiMasterMessages, setAiMasterMessages] = useState<AiMasterMessage[]>([]);

  useEffect(() => {
    if (!warehouseId && warehouses[0]) {
      setWarehouseId(warehouses[0].id);
      setHeader((value) => ({ ...value, warehouseId: warehouses[0].id, warehouseName: warehouses[0].warehouseName }));
    }
  }, [warehouseId, warehouses]);

  useEffect(() => {
    if (!header.warehouseLocationId && locations[0]) {
      setHeader((value) => ({ ...value, warehouseLocationId: locations[0].id, warehouseLocationName: locations[0].locationCode }));
    }
  }, [header.warehouseLocationId, locations]);

  useEffect(() => {
    if (!header.currencyId && defaultCurrency) {
      setHeader((value) => ({ ...value, currencyId: defaultCurrency.currencyId, currencyCode: defaultCurrency.currencyCode }));
    }
  }, [defaultCurrency, header.currencyId]);

  useEffect(() => {
    const firstBranch = branchesQuery.data?.[0];
    if (!header.consigneeExporterBranchId && firstBranch) {
      setHeader((value) => ({ ...value, consigneeExporterBranchId: firstBranch.id, consigneeExporterName: firstBranch.name }));
    }
  }, [branchesQuery.data, header.consigneeExporterBranchId]);

  const totals = useMemo(() => {
    const quantity = items.reduce((sum, item) => sum + numeric(item.quantity), 0);
    const netWeight = items.reduce((sum, item) => sum + numeric(item.netWeight), 0);
    const grossWeight = items.reduce((sum, item) => sum + numeric(item.grossWeight), 0);
    const duty = items.reduce((sum, item) => sum + numeric(item.cifForeignValue) * numeric(item.exchangeRate ?? header.exchangeRate) * numeric(item.dutyRate) / 100, 0);
    return { quantity, netWeight, grossWeight, duty };
  }, [header.exchangeRate, items]);

  const activeItems = items.filter((item) => item.operationMode !== "Delete");
  const canRecalculateWeights = Boolean(initialValue?.id) && activeItems.length > 0 && activeItems.every((item) => Boolean(item.id));

  function setHeaderValue<K extends keyof BillOfEntryRequest>(key: K, value: BillOfEntryRequest[K]) {
    setHeader((current) => ({ ...current, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<BillOfEntryItemRequest>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function ensureInventory(item: BillOfEntryItemRequest) {
    if (item.inventoryId) return item;
    if (!item.inventoryCode || !item.inventoryName) return item;
    const created = await saveBoeInventory({ inventoryCode: item.inventoryCode, inventoryName: item.inventoryName, description: item.goodsDescription, isActive: true });
    return { ...item, inventoryId: created?.id ?? "" };
  }

  async function buildRequest(nextHeader = header, nextItems = items) {
    const hydratedItems = await Promise.all(nextItems.filter((item) => item.operationMode !== "Delete").map(ensureInventory));
    const request: BillOfEntryRequest = {
        ...header,
        ...nextHeader,
        warehouseId,
        warehouseName: warehouses.find((item) => item.id === warehouseId)?.warehouseName ?? header.warehouseName,
        warehouseLocationName: locations.find((item) => item.id === nextHeader.warehouseLocationId)?.locationCode ?? nextHeader.warehouseLocationName,
        currencyCode: currencies.find((item) => item.currencyId === nextHeader.currencyId)?.currencyCode ?? nextHeader.currencyCode,
        boeNumber: nextHeader.boeNumber,
        items: hydratedItems.map((item) => ({
          ...item,
          operationMode: item.id ? "Update" : "New",
          unit: "Main Unit",
          currencyId: item.currencyId || nextHeader.currencyId,
          currencyCode: item.currencyCode || nextHeader.currencyCode,
          exchangeRate: numeric(item.exchangeRate ?? nextHeader.exchangeRate)
        }))
      };
    return request;
  }

  async function handleSubmit() {
    setIsSaving(true);
    try {
      const request = await buildRequest();
      const saved = await onSubmit(request);
      toast.success(lt("Bill of Entry saved"));
      navigate(saved?.id ? `/bill-of-entry/${saved.id}` : "/bill-of-entry");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRecalculateWeights() {
    if (!canRecalculateWeights) return;
    setIsSaving(true);
    try {
      const currentItems = items.filter((item) => item.operationMode !== "Delete");
      const itemNet = currentItems.reduce((sum, item) => sum + numeric(item.netWeight), 0);
      const itemGross = currentItems.reduce((sum, item) => sum + numeric(item.grossWeight), 0);
      const netDiff = numeric(header.netWeight) - itemNet;
      const grossDiff = numeric(header.grossWeight) - itemGross;
      let nextHeader = header;
      let nextItems = items;

      if (netDiff < 0 || grossDiff < 0) {
        nextHeader = { ...header, netWeight: itemNet, grossWeight: itemGross };
        setHeader(nextHeader);
      } else {
        nextItems = redistributeWeights(items, netDiff, grossDiff, recalculateBasis);
        setItems(nextItems);
      }

      const saved = await onSubmit(await buildRequest(nextHeader, nextItems));
      if (saved) {
        setHeader(toHeaderState(saved));
        setItems(saved.items.map(toItemRequest));
      }
      toast.success(lt("Weights recalculated"));
    } finally {
      setIsSaving(false);
    }
  }

  async function applyAiExtraction(result: BillOfEntryAiExtractionResultDto) {
    const extracted = result.header;
    const currency = currencies.find((item) => equalsCode(item.currencyCode, extracted.currencyCode));
    const branch = branchesQuery.data?.find((item) => equalsText(item.name, extracted.consigneeExporterName) || equalsText(item.code, extracted.consigneeExporterName));
    const messages: AiMasterMessage[] = [];
    const workingPorts = [...ports];
    const workingInventories = [...inventories];
    const portOfLoading = await ensurePortMaster(extracted.portOfLoading, extracted.portOfLoadingCountry, normalizeOption(extracted.portType, transportModes) ?? header.portType, workingPorts, countries, messages);
    const portOfDischarge = await ensurePortMaster(extracted.portOfDischarge, extracted.portOfDischargeCountry, normalizeOption(extracted.portType, transportModes) ?? header.portType, workingPorts, countries, messages);
    const destination = await ensurePortMaster(extracted.destination, extracted.destinationCountry, normalizeOption(extracted.portType, transportModes) ?? header.portType, workingPorts, countries, messages);
    let createdInventoryCount = 0;

    setHeader((current) => ({
      ...current,
      portType: normalizeOption(extracted.portType, transportModes) ?? current.portType,
      declarationType: normalizeOption(extracted.declarationType, declarationTypes) ?? current.declarationType,
      declarationDate: dateOnly(extracted.declarationDate) ?? current.declarationDate,
      declarationNumber: textOr(current.declarationNumber, extracted.declarationNumber),
      boeNumber: textOr(current.boeNumber, extracted.boeNumber),
      consigneeExporterBranchId: branch?.id ?? current.consigneeExporterBranchId,
      consigneeExporterName: branch?.name ?? textOr(current.consigneeExporterName, extracted.consigneeExporterName),
      intercessorCompanyName: textOr(current.intercessorCompanyName, extracted.intercessorCompanyName),
      commercialRegistrationNumber: textOr(current.commercialRegistrationNumber, extracted.commercialRegistrationNumber),
      exportTo: textOr(current.exportTo, extracted.exportTo),
      tinNumber: textOr(current.tinNumber, extracted.tinNumber),
      deliveryOrderNumber: textOr(current.deliveryOrderNumber, extracted.deliveryOrderNumber),
      measurement: normalizeOption(extracted.measurement, measurementOptions) ?? textOr(current.measurement, extracted.measurement),
      netWeight: numberOr(current.netWeight, extracted.netWeight),
      grossWeight: numberOr(current.grossWeight, extracted.grossWeight),
      numberOfPackages: numberOr(current.numberOfPackages, extracted.numberOfPackages),
      carCaptain: textOr(current.carCaptain, extracted.carCaptain),
      carrierName: textOr(current.carrierName, extracted.carrierName),
      voyageFlightNumber: textOr(current.voyageFlightNumber, extracted.voyageFlightNumber),
      portOfLoading: textOr(current.portOfLoading, portOfLoading),
      portOfDischarge: textOr(current.portOfDischarge, portOfDischarge),
      destination: textOr(current.destination, destination),
      marksAndNumbers: textOr(current.marksAndNumbers, extracted.marksAndNumbers),
      transportDocumentNumber: textOr(current.transportDocumentNumber, extracted.transportDocumentNumber),
      currencyId: currency?.currencyId ?? current.currencyId,
      currencyCode: currency?.currencyCode ?? textOr(current.currencyCode, extracted.currencyCode),
      exchangeRate: numberOr(current.exchangeRate, extracted.exchangeRate),
      remarks: textOr(current.remarks, extracted.remarks)
    }));

    if (result.items.length) {
      const extractedItems = await Promise.all(result.items.map(async (item) => {
        const inventory = workingInventories.find((entry) => equalsText(entry.inventoryCode, item.inventoryCode) || equalsText(entry.inventoryName, item.inventoryName));
        const itemCurrency = currencies.find((entry) => equalsCode(entry.currencyCode, item.currencyCode)) ?? currency;
        const inventoryCode = clean(item.inventoryCode) || createCode(clean(item.inventoryName) || clean(item.goodsDescription), "INV");
        const inventoryName = clean(item.inventoryName) || clean(item.goodsDescription) || inventoryCode;
        const goodsDescription = clean(item.goodsDescription) || inventoryName || inventoryCode;
        const resolvedInventory = inventory ?? await createMissingInventory(inventoryCode, inventoryName, goodsDescription, workingInventories, messages).then((created) => {
          if (created) createdInventoryCount += 1;
          return created;
        });
        return {
          operationMode: "New",
          inventoryId: resolvedInventory?.id ?? "",
          inventoryCode: resolvedInventory?.inventoryCode ?? inventoryCode,
          inventoryName: resolvedInventory?.inventoryName ?? inventoryName,
          hsCode: clean(item.hsCode),
          goodsDescription,
          countryOfOrigin: clean(item.countryOfOrigin),
          quantity: numberOr(1, item.quantity),
          netWeight: numberOr(0, item.netWeight),
          grossWeight: numberOr(0, item.grossWeight),
          unit: clean(item.unit) || "Main Unit",
          cifForeignValue: numberOr(0, item.cifForeignValue),
          currencyId: itemCurrency?.currencyId ?? header.currencyId,
          currencyCode: itemCurrency?.currencyCode ?? (clean(item.currencyCode) || header.currencyCode),
          exchangeRate: numberOr(header.exchangeRate, item.exchangeRate),
          dutyRate: numberOr(0, item.dutyRate),
          incomeType: clean(item.incomeType)
        } satisfies BillOfEntryItemRequest;
      }));
      setItems(extractedItems);
    }
    if (workingPorts.length !== ports.length) void portsQuery.refetch();
    if (createdInventoryCount > 0) void inventoriesQuery.refetch();
    setAiMasterMessages(messages);
    toast.success(lt("Extracted values applied"), lt("Master data checked and the BOE form was populated."));
  }

  return (
    <div className="space-y-4">
      <PageHeader title={lt(title)} description={lt(description)} />
      <BillOfEntryAiExtractionPanel onApply={applyAiExtraction} />
      <div className="flex justify-end">
        <Button onClick={() => void handleSubmit()} disabled={isSaving}><Save className="h-4 w-4" />{lt("Save")}</Button>
      </div>
      {aiMasterMessages.length ? (
        <div className="rounded-md border bg-white p-3 text-sm">
          <div className="font-semibold">{lt("AI master data results")}</div>
          <div className="mt-2 space-y-1">
            {aiMasterMessages.map((message, index) => (
              <div key={`${message.type}-${index}`} className={message.type === "created" ? "text-emerald-700" : "text-amber-700"}>{lt(message.text)}</div>
            ))}
          </div>
        </div>
      ) : null}
      <Card>
        <CardHeader><CardTitle>{lt("Bill of Entry Details")}</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <Field label={lt("Port Type")} required>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.portType} onChange={(event) => setHeaderValue("portType", event.target.value)}>
              {transportModes.map((value) => <option key={value} value={value}>{lt(value)}</option>)}
            </select>
          </Field>
          <Field label={lt("Declaration Type")} required>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.declarationType} onChange={(event) => setHeaderValue("declarationType", event.target.value)}>
              {declarationTypes.map((value) => <option key={value} value={value}>{lt(value)}</option>)}
            </select>
          </Field>
          <Field label={lt("Declaration Date")} required><Input type="date" value={header.declarationDate} onChange={(event) => setHeaderValue("declarationDate", event.target.value)} /></Field>
          <Field label={lt("Declaration Number")} required><Input value={header.declarationNumber} onChange={(event) => setHeaderValue("declarationNumber", event.target.value)} /></Field>
          <Field label={lt("BOE Number")} required><Input value={header.boeNumber} onChange={(event) => setHeaderValue("boeNumber", event.target.value)} /></Field>
          <Field label={lt("Consignee / Exporter Branch")} required>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.consigneeExporterBranchId ?? ""} onChange={(event) => {
              const branch = branchesQuery.data?.find((item) => item.id === event.target.value);
              setHeader((value) => ({ ...value, consigneeExporterBranchId: branch?.id ?? "", consigneeExporterName: branch?.name ?? "" }));
            }}>
              <option value="">{lt("Select branch")}</option>
              {branchesQuery.data?.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
            </select>
          </Field>
          <Field label={lt("Intercessor Company")}>
            <CustomerAutocomplete
              value={header.intercessorCompanyId ?? ""}
              onChange={(customer) => setHeader((value) => ({ ...value, intercessorCompanyId: customer?.id ?? "", intercessorCompanyName: customer?.customerName ?? "" }))}
            />
          </Field>
          <Field label={lt("Commercial Registration No")}><Input value={header.commercialRegistrationNumber ?? ""} onChange={(event) => setHeaderValue("commercialRegistrationNumber", event.target.value)} /></Field>
          <Field label={lt("Export To")}><Input value={header.exportTo ?? ""} onChange={(event) => setHeaderValue("exportTo", event.target.value)} /></Field>
          <Field label={lt("TIN Number")}><Input value={header.tinNumber ?? ""} onChange={(event) => setHeaderValue("tinNumber", event.target.value)} /></Field>
          <Field label={lt("Delivery Order No")}><Input value={header.deliveryOrderNumber ?? ""} onChange={(event) => setHeaderValue("deliveryOrderNumber", event.target.value)} /></Field>
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
          <Field label={lt("Measurement")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.measurement ?? ""} onChange={(event) => setHeaderValue("measurement", event.target.value)}>
              <option value="">{lt("Select measurement")}</option>
              {measurementOptions.map((value) => <option key={value} value={value}>{lt(value)}</option>)}
            </select>
          </Field>
          <Field label={lt("Net Weight")}><Input type="number" min={0} value={header.netWeight} onChange={(event) => setHeaderValue("netWeight", Number(event.target.value))} /></Field>
          <Field label={lt("Gross Weight")}><Input type="number" min={0} value={header.grossWeight} onChange={(event) => setHeaderValue("grossWeight", Number(event.target.value))} /></Field>
          <Field label={lt("Packages")}><Input type="number" min={0} value={header.numberOfPackages} onChange={(event) => setHeaderValue("numberOfPackages", Number(event.target.value))} /></Field>
          <Field label={lt("Carrier")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={header.carrierName ?? ""} onChange={(event) => setHeaderValue("carrierName", event.target.value)}>
              <option value="">{lt("Select carrier")}</option>
              {currentValueOption(header.carrierName, carriers.map((item) => item.carrierName))}
              {carriers.map((item) => <option key={item.id} value={item.carrierName}>{item.carrierCode} - {item.carrierName}</option>)}
            </select>
          </Field>
          <Field label={lt("Voyage / Flight No")}><Input value={header.voyageFlightNumber ?? ""} onChange={(event) => setHeaderValue("voyageFlightNumber", event.target.value)} /></Field>
          <Field label={lt("Port of Loading")}><PortSelect value={header.portOfLoading ?? ""} ports={ports} onChange={(value) => setHeaderValue("portOfLoading", value)} /></Field>
          <Field label={lt("Port of Discharge")}><PortSelect value={header.portOfDischarge ?? ""} ports={ports} onChange={(value) => setHeaderValue("portOfDischarge", value)} /></Field>
          <Field label={lt("Destination")}><PortSelect value={header.destination ?? ""} ports={ports} onChange={(value) => setHeaderValue("destination", value)} /></Field>
          <Field label={lt("Transport Document No")}><Input value={header.transportDocumentNumber ?? ""} onChange={(event) => setHeaderValue("transportDocumentNumber", event.target.value)} /></Field>
          <Field label={lt("Marks and Numbers")}><Input value={header.marksAndNumbers ?? ""} onChange={(event) => setHeaderValue("marksAndNumbers", event.target.value)} /></Field>
          <Field label={lt("Remarks")}><Input value={header.remarks ?? ""} onChange={(event) => setHeaderValue("remarks", event.target.value)} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{lt("Items")}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-9 rounded-md border px-2 text-sm" value={recalculateBasis} onChange={(event) => setRecalculateBasis(event.target.value as RecalculateBasis)} disabled={!canRecalculateWeights || isSaving}>
              <option value="ItemCount">{lt("By Item Count")}</option>
              <option value="Weight">{lt("By Weight")}</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => void handleRecalculateWeights()} disabled={!canRecalculateWeights || isSaving}>
              <RotateCcw className="h-4 w-4" />{lt("Recalculate Weight")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setItems((value) => [...value, newItem(header.currencyId, header.currencyCode ?? "", header.exchangeRate)])}><Plus className="h-4 w-4" />{lt("Add Line")}</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-md border p-3">
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                <Field label={lt("Inventory")} required>
                  <FilterableInput
                    listId={`boe-inventory-${index}`}
                    value={inventoryInputValue(item)}
                    placeholder={lt("Type or select inventory")}
                    options={inventories.map((entry) => ({ value: entry.id, label: `${entry.inventoryCode} - ${entry.inventoryName}` }))}
                    onChange={(input, selectedValue) => {
                      const inventory = inventories.find((entry) => entry.id === selectedValue);
                      updateItem(index, inventory ? { inventoryId: inventory.id, inventoryCode: inventory.inventoryCode, inventoryName: inventory.inventoryName, goodsDescription: inventory.description || inventory.inventoryName } : { inventoryId: "", inventoryCode: input, inventoryName: item.inventoryName ?? "" });
                    }}
                  />
                </Field>
                <Field label={lt("Inventory Code")} required><Input value={item.inventoryCode ?? ""} onChange={(event) => updateItem(index, { inventoryCode: event.target.value })} /></Field>
                <Field label={lt("Inventory Name")} required><Input value={item.inventoryName ?? ""} onChange={(event) => updateItem(index, { inventoryName: event.target.value })} /></Field>
                <Field label={lt("HS Code")}><Input value={item.hsCode ?? ""} onChange={(event) => updateItem(index, { hsCode: event.target.value })} /></Field>
                <Field label={lt("Goods Description")} required><Input value={item.goodsDescription} onChange={(event) => updateItem(index, { goodsDescription: event.target.value })} /></Field>
                <Field label={lt("Country of Origin")} required>
                  <FilterableInput
                    listId={`boe-country-${index}`}
                    value={item.countryOfOrigin}
                    placeholder={lt("Type or select country")}
                    options={countries.map((entry) => ({ value: `${entry.countryCode} - ${entry.name}`, label: `${entry.countryCode} - ${entry.name}` }))}
                    onChange={(input, selectedValue) => updateItem(index, { countryOfOrigin: selectedValue || input })}
                  />
                </Field>
                <Field label={lt("Income Type")}><Input value={item.incomeType ?? ""} onChange={(event) => updateItem(index, { incomeType: event.target.value })} /></Field>
                <Field label={lt("Quantity")} required><Input type="number" min={0} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} /></Field>
                <Field label={lt("Net Weight")}><Input type="number" min={0} step="0.0001" value={item.netWeight} onChange={(event) => updateItem(index, { netWeight: Number(event.target.value) })} /></Field>
                <Field label={lt("Gross Weight")}><Input type="number" min={0} step="0.0001" value={item.grossWeight} onChange={(event) => updateItem(index, { grossWeight: Number(event.target.value) })} /></Field>
                <Field label={lt("Unit")}><Input value={item.unit ?? "Main Unit"} disabled /></Field>
                <Field label={lt("CIF Foreign Value")} required><Input type="number" min={0} value={item.cifForeignValue} onChange={(event) => updateItem(index, { cifForeignValue: Number(event.target.value) })} /></Field>
                <Field label={lt("Exchange Rate")} required><Input type="number" min={0} step="0.0001" value={item.exchangeRate ?? header.exchangeRate} onChange={(event) => updateItem(index, { exchangeRate: Number(event.target.value) })} /></Field>
                <Field label={lt("Duty Rate %")}><Input type="number" min={0} value={item.dutyRate} onChange={(event) => updateItem(index, { dutyRate: Number(event.target.value) })} /></Field>
                <div className="space-y-1">
                  <Label>{lt("Line Total")}</Label>
                  <div className="h-10 rounded-md border bg-slate-50 px-3 py-2 text-sm">{formatMoney(numeric(item.cifForeignValue) * numeric(item.exchangeRate ?? header.exchangeRate) * numeric(item.dutyRate) / 100)}</div>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={() => setItems((value) => value.length === 1 ? [newItem(header.currencyId, header.currencyCode ?? "", header.exchangeRate)] : value.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" />{lt("Remove")}</Button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap justify-end gap-3 text-sm font-medium">
            <span>{lt("Total Quantity")}: {formatNumber(totals.quantity)}</span>
            <span>{lt("Item Net Weight")}: {formatNumber(totals.netWeight)}</span>
            <span>{lt("Item Gross Weight")}: {formatNumber(totals.grossWeight)}</span>
            <span>{lt("Duty Total")}: {formatMoney(totals.duty)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label>{label}{required ? <span className="ml-1 text-red-600">*</span> : null}</Label>
      {children}
    </div>
  );
}

function FilterableInput({ listId, value, options, placeholder, onChange }: { listId: string; value: string; options: Array<{ value: string; label: string }>; placeholder?: string; onChange: (input: string, selectedValue?: string) => void }) {
  return (
    <>
      <Input
        list={listId}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          const input = event.target.value;
          const selected = options.find((option) => option.label === input || option.value === input);
          onChange(input, selected?.value);
        }}
      />
      <datalist id={listId}>
        {options.map((option) => <option key={option.value} value={option.label} />)}
      </datalist>
    </>
  );
}

function inventoryInputValue(item: BillOfEntryItemRequest) {
  if (item.inventoryId && item.inventoryCode && item.inventoryName) return `${item.inventoryCode} - ${item.inventoryName}`;
  return item.inventoryCode || item.inventoryName || "";
}

function toHeaderState(value?: BillOfEntryDto | null): BillOfEntryRequest {
  return {
    portType: value?.portType ?? "Sea",
    declarationType: value?.declarationType ?? "Import",
    declarationDate: value?.declarationDate?.slice(0, 10) ?? today,
    declarationNumber: value?.declarationNumber ?? "",
    boeNumber: value?.boeNumber ?? "",
    consigneeExporterBranchId: value?.consigneeExporterBranchId ?? "",
    consigneeExporterName: value?.consigneeExporterName ?? "",
    intercessorCompanyId: value?.intercessorCompanyId ?? "",
    intercessorCompanyName: value?.intercessorCompanyName ?? "",
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

function toItemRequest(item: BillOfEntryDto["items"][number]): BillOfEntryItemRequest {
  return {
    id: item.id,
    operationMode: "Update",
    inventoryId: item.inventoryId,
    inventoryCode: item.inventoryCode,
    inventoryName: item.inventoryName,
    hsCode: item.hsCode ?? "",
    goodsDescription: item.goodsDescription,
    countryOfOrigin: item.countryOfOrigin,
    quantity: item.quantity,
    netWeight: item.netWeight,
    grossWeight: item.grossWeight,
    unit: item.unit || "Main Unit",
    cifForeignValue: item.cifForeignValue,
    currencyId: item.currencyId,
    currencyCode: item.currencyCode,
    exchangeRate: item.exchangeRate,
    dutyRate: item.dutyRate,
    incomeType: item.incomeType
  };
}

function newItem(currencyId = "", currencyCode = "", exchangeRate = 1): BillOfEntryItemRequest {
  return {
    operationMode: "New",
    inventoryId: "",
    inventoryCode: "",
    inventoryName: "",
    hsCode: "",
    goodsDescription: "",
    countryOfOrigin: "",
    quantity: 1,
    netWeight: 0,
    grossWeight: 0,
    unit: "Main Unit",
    cifForeignValue: 0,
    currencyId,
    currencyCode,
    exchangeRate,
    dutyRate: 0,
    incomeType: ""
  };
}

async function createMissingInventory(code: string, name: string, description: string, workingInventories: BoeInventoryDto[], messages: AiMasterMessage[]) {
  const existing = workingInventories.find((item) => equalsCode(item.inventoryCode, code) || equalsText(item.inventoryName, name));
  if (existing) return existing;
  try {
    const created = await saveBoeInventory({ inventoryCode: code, inventoryName: name, description, isActive: true });
    if (created) {
      workingInventories.push(created);
      messages.push({ type: "created", text: `Created inventory master: ${created.inventoryCode} - ${created.inventoryName}` });
    }
    return created;
  } catch {
    messages.push({ type: "warning", text: `Could not create inventory master: ${code} - ${name}` });
    return undefined;
  }
}

async function ensurePortMaster(
  extractedPort: string | null | undefined,
  extractedCountry: string | null | undefined,
  portType: string,
  workingPorts: ShippingPortDto[],
  countries: CountryDto[],
  messages: AiMasterMessage[]
) {
  const rawPort = clean(extractedPort);
  if (!rawPort) return "";
  const existing = findPort(rawPort, workingPorts);
  if (existing) return existing.portName;

  const country = findCountry(extractedCountry, countries) ?? findCountry(rawPort, countries);
  if (!country) {
    messages.push({ type: "warning", text: `Port master not created because country was not found: ${rawPort}` });
    return rawPort;
  }

  const parsed = parsePort(rawPort, country);
  const portCode = parsed.code || createCode(parsed.name, "PRT");
  const duplicateCode = workingPorts.find((port) => equalsCode(port.portCode, portCode));
  if (duplicateCode) return duplicateCode.portName;

  try {
    const created = await createShippingPort({
      portCode,
      portName: parsed.name,
      countryGuid: country.id,
      countryName: country.name,
      portType: normalizeOption(portType, transportModes) ?? "Sea",
      isActive: true
    });
    if (created) {
      workingPorts.push(created);
      messages.push({ type: "created", text: `Created port master: ${created.portCode} - ${created.portName}` });
      return created.portName;
    }
  } catch {
    messages.push({ type: "warning", text: `Could not create port master: ${rawPort}` });
  }
  return rawPort;
}

function findPort(value: string, ports: ShippingPortDto[]) {
  const input = clean(value);
  return ports.find((port) =>
    equalsCode(port.portCode, input)
    || equalsText(port.portName, input)
    || input.toLowerCase().includes(port.portName.toLowerCase())
    || input.toUpperCase().includes(port.portCode.toUpperCase())
  );
}

function findCountry(value: string | null | undefined, countries: CountryDto[]) {
  const input = clean(value);
  if (!input) return undefined;
  const normalized = normalize(input);
  return countries.find((country) =>
    normalize(country.name) === normalized
    || normalize(country.countryCode) === normalized
    || normalize(country.isoCode) === normalized
    || normalized.includes(normalize(country.name))
    || normalized.includes(normalize(country.countryCode))
    || normalized.includes(normalize(country.isoCode))
  );
}

function parsePort(value: string, country: CountryDto) {
  const parts = value.split(/\s*[-,|/]\s*/).map(clean).filter(Boolean);
  const withoutCountry = parts.filter((part) => !equalsText(part, country.name) && !equalsCode(part, country.countryCode) && !equalsCode(part, country.isoCode));
  const first = withoutCountry[0] ?? value;
  const codeCandidate = /^[A-Z0-9]{3,6}$/.test(first.replace(/\s+/g, "").toUpperCase()) ? first.replace(/\s+/g, "").toUpperCase() : "";
  const nameParts = codeCandidate ? withoutCountry.slice(1) : withoutCountry;
  return {
    code: codeCandidate,
    name: clean(nameParts.join(" - ")) || clean(value.replace(country.name, "")) || codeCandidate || value
  };
}

function createCode(value: string, fallback: string) {
  const compact = clean(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!compact) return `${fallback}${Date.now().toString().slice(-4)}`;
  return compact.slice(0, Math.min(12, Math.max(3, compact.length)));
}

function normalize(value: string | null | undefined) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function redistributeWeights(items: BillOfEntryItemRequest[], netDiff: number, grossDiff: number, basis: RecalculateBasis) {
  const active = items.filter((item) => item.operationMode !== "Delete");
  const count = active.length || 1;
  const netWeightTotal = active.reduce((sum, item) => sum + numeric(item.netWeight), 0);
  const grossWeightTotal = active.reduce((sum, item) => sum + numeric(item.grossWeight), 0);
  let activeIndex = 0;

  return items.map((item) => {
    if (item.operationMode === "Delete") return item;
    activeIndex += 1;
    const isLast = activeIndex === count;
    const netAdded = isLast
      ? netDiff - active.slice(0, activeIndex - 1).reduce((sum, previous) => sum + allocatedShare(previous, netDiff, netWeightTotal, count, basis, "net"), 0)
      : allocatedShare(item, netDiff, netWeightTotal, count, basis, "net");
    const grossAdded = isLast
      ? grossDiff - active.slice(0, activeIndex - 1).reduce((sum, previous) => sum + allocatedShare(previous, grossDiff, grossWeightTotal, count, basis, "gross"), 0)
      : allocatedShare(item, grossDiff, grossWeightTotal, count, basis, "gross");

    const nextNetWeight = roundWeight(numeric(item.netWeight) + netAdded);
    const nextGrossWeight = roundWeight(numeric(item.grossWeight) + grossAdded);
    return {
      ...item,
      netWeight: nextNetWeight,
      grossWeight: Math.max(nextGrossWeight, nextNetWeight),
      unit: "Main Unit"
    };
  });
}

function allocatedShare(item: BillOfEntryItemRequest, diff: number, total: number, count: number, basis: RecalculateBasis, weightType: "net" | "gross") {
  if (basis === "Weight" && total > 0) {
    return diff * numeric(weightType === "net" ? item.netWeight : item.grossWeight) / total;
  }
  return diff / count;
}

function roundWeight(value: number) {
  return Math.round(value * 10000) / 10000;
}

function numeric(value: number | null | undefined) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function clean(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function textOr(current: string | null | undefined, extracted: string | null | undefined) {
  const value = clean(extracted);
  return value || current || "";
}

function numberOr(current: number, extracted: number | null | undefined) {
  const value = Number(extracted);
  return Number.isFinite(value) ? value : current;
}

function equalsText(left: string | null | undefined, right: string | null | undefined) {
  return Boolean(clean(left) && clean(right) && clean(left).toLowerCase() === clean(right).toLowerCase());
}

function equalsCode(left: string | null | undefined, right: string | null | undefined) {
  return Boolean(clean(left) && clean(right) && clean(left).toUpperCase() === clean(right).toUpperCase());
}

function normalizeOption(value: string | null | undefined, options: string[]) {
  const input = clean(value);
  if (!input) return undefined;
  return options.find((option) => option.toLowerCase() === input.toLowerCase());
}

function dateOnly(value: string | null | undefined) {
  const input = clean(value);
  if (!input) return undefined;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return /^\d{4}-\d{2}-\d{2}$/.test(input) ? input : undefined;
  return date.toISOString().slice(0, 10);
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
