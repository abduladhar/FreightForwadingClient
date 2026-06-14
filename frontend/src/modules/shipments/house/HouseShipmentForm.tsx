import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocateFixed, Trash2 } from "lucide-react";
import { getQuotation } from "@/api/quotationApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { getActivePackageTypesForDropdown } from "@/api/packageTypeApi";
import { getActiveCountriesForDropdown } from "@/api/countryApi";
import { getCustomer } from "@/api/customerApi";
import type { HouseShipmentRequest, HouseShipmentUpdateRequest, HouseShipmentItemRequest } from "@/api/houseShipmentApi";
import { GoodsSelectionTable } from "@/modules/shipments/house/GoodsSelectionTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { QuotationAutocomplete } from "@/components/common/QuotationAutocomplete";
import { lt } from "@/modules/operationsLocalization";

type FormValue = {
  shipment: HouseShipmentRequest | HouseShipmentUpdateRequest;
  transportMode: string;
  labelTemplateCode: string;
  documents: string[];
  selectedGoods: HouseShipmentItemRequest[];
};

export function HouseShipmentForm({
  initialValue,
  onSubmit,
  onApplyGrnItems,
  onSaveItem,
  isSubmitting,
  enableGoodsSelection = false
}: {
  initialValue?: FormValue | null;
  onSubmit: (value: FormValue) => Promise<void>;
  onApplyGrnItems?: (items: HouseShipmentItemRequest[]) => Promise<void>;
  onSaveItem?: (item: HouseShipmentItemRequest) => Promise<HouseShipmentItemRequest[]>;
  isSubmitting?: boolean;
  enableGoodsSelection?: boolean;
}) {
  const toast = useToast();
  const shippingPorts = useQuery({ queryKey: ["house-shipment-shipping-ports"], queryFn: () => getActiveShippingPortsForDropdown() });
  const packageTypes = useQuery({ queryKey: ["house-shipment-package-types"], queryFn: () => getActivePackageTypesForDropdown() });
  const countries = useQuery({ queryKey: ["house-shipment-countries"], queryFn: () => getActiveCountriesForDropdown() });

  const [value, setValue] = useState<FormValue>(initialValue ?? {
    shipment: {
      customerId: "",
      salesmanId: null,
      quotationId: null,
      originPortGuid: null,
      destinationPortGuid: null,
      origin: "",
      destination: "",
      dropLocation: "",
      consigneeName: "",
      consigneeContactNo: "",
      consigneeAddress: "",
      shipperName: "",
      shipperContactNo: "",
      shipperAddress: "",
      etd: todayDateTimeLocalValue(),
      eta: todayDateTimeLocalValue(),
      revenueAmount: 0,
      costAmount: 0,
      remarks: null
    } satisfies HouseShipmentRequest,
    transportMode: "Air",
    labelTemplateCode: "DEFAULT",
    documents: [],
    selectedGoods: []
  });

  useEffect(() => {
    if (!initialValue) return;
    setValue(initialValue);
  }, [initialValue]);
  const [showGrnLoader, setShowGrnLoader] = useState(false);
  const [isLoadingQuotation, setIsLoadingQuotation] = useState(false);
  const [dropLocationOptions, setDropLocationOptions] = useState<string[]>([]);
  const [isSearchingDropLocation, setIsSearchingDropLocation] = useState(false);
  const [isResolvingDropLocation, setIsResolvingDropLocation] = useState(false);
  const dropLocationListId = useId();

  const profit = useMemo(() => (value.shipment.revenueAmount ?? 0) - (value.shipment.costAmount ?? 0), [value.shipment.revenueAmount, value.shipment.costAmount]);

  useEffect(() => {
    const q = (value.shipment.dropLocation ?? "").trim();
    if (q.length < 3) {
      setDropLocationOptions([]);
      setIsSearchingDropLocation(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearchingDropLocation(true);
      try {
        const results = await searchOpenStreetMapLocations(q, controller.signal);
        const options = Array.from(
          new Set(results.map((x) => x.display_name).filter((x): x is string => Boolean(x?.trim())))
        ).slice(0, 8);
        if (!controller.signal.aborted) {
          setDropLocationOptions(options);
        }
      } catch {
        if (!controller.signal.aborted) {
          setDropLocationOptions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingDropLocation(false);
        }
      }
    }, 700);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value.shipment.dropLocation]);

  async function useCurrentDropLocation() {
    if (!navigator.geolocation) {
      toast.error(lt("Location not supported"), lt("Your browser does not support geolocation."));
      return;
    }

    setIsResolvingDropLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const displayName = await reverseGeocodeOpenStreetMap(latitude, longitude);
          const fallback = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const resolved = displayName || fallback;
          setValue((prev) => ({
            ...prev,
            shipment: {
              ...prev.shipment,
              dropLocation: resolved
            }
          }));
          if (displayName) {
            setDropLocationOptions((prev) => Array.from(new Set([displayName, ...prev])).slice(0, 8));
          }
        } catch {
          toast.warning(lt("Could not resolve exact address"), lt("Using GPS coordinates as drop location."));
          setValue((prev) => ({
            ...prev,
            shipment: {
              ...prev.shipment,
              dropLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }
          }));
        } finally {
          setIsResolvingDropLocation(false);
        }
      },
      (error) => {
        setIsResolvingDropLocation(false);
        toast.error("Location access failed", error.message || "Unable to get your current location.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }

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
        const hasSavedItems = prev.selectedGoods.some((item) => Boolean(item.id));
        const quotationItems: HouseShipmentItemRequest[] = quotation.items.map((item) => ({
          id: null,
          operationMode: "New",
          goodsReceiptItemId: null,
          packageTypeId: item.packageTypeGuid ?? null,
          packageTypeGuid: item.packageTypeGuid ?? null,
          packageTypeName: item.packageTypeName,
          description: item.description ?? "",
          receivedPieces: item.pieces,
          receivedWeight: item.actualWeight,
          length: item.length,
          width: item.width,
          height: item.height,
          volumeCbm: item.volumeCbm,
          loadedPieces: item.pieces,
          loadedWeight: item.actualWeight,
          loadedVolume: item.volumeCbm
        }));

        return {
          ...prev,
          transportMode: quotation.modeOfTransport || prev.transportMode,
          shipment: {
            ...prev.shipment,
            quotationId: quotation.id,
            customerId: quotation.customerId,
            salesmanId: customer.salesmanId ?? null,
            originPortGuid: quotation.originPortGuid ?? null,
            destinationPortGuid: quotation.destinationPortGuid ?? null,
            origin: quotation.originPortName || quotation.origin,
            destination: quotation.destinationPortName || quotation.destination
          },
          selectedGoods: hasSavedItems ? prev.selectedGoods : quotationItems
        };
      });
      toast.success(lt("Quotation loaded"), lt("Customer, route, transport mode, and quotation items were populated."));
    } catch {
      setValue((prev) => ({ ...prev, shipment: { ...prev.shipment, quotationId: null } }));
      throw new Error("Unable to load quotation.");
    } finally {
      setIsLoadingQuotation(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {"customerId" in value.shipment ? (
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
        ) : null}
        <Field label={lt("Salesman (optional)")}><SalesmanSelect value={value.shipment.salesmanId} onChange={(salesmanId) => setValue({ ...value, shipment: { ...value.shipment, salesmanId } })} /></Field>
        <Field label={lt("Quotation Reference")}>
          <QuotationAutocomplete
            value={"quotationId" in value.shipment ? value.shipment.quotationId : null}
            customerId={value.shipment.customerId}
            placeholder={isLoadingQuotation ? lt("Loading quotation...") : lt("Search approved quotation number")}
            onChange={(quotation) => {
              if (!quotation) {
                void applyQuotation("");
                return;
              }
              void applyQuotation(quotation.id).catch(() => toast.error(lt("Quotation unavailable"), lt("Unable to load the selected quotation.")));
            }}
          />
        </Field>
        <Field label={lt("Transport Mode")}>
          <select className="h-10 w-full rounded-md border px-3 text-sm" value={value.transportMode} onChange={(e) => setValue({ ...value, transportMode: e.target.value })}>
            <option value="Air">{lt("Air")}</option><option value="Sea">{lt("Sea")}</option><option value="Road">{lt("Road")}</option><option value="Courier">{lt("Courier")}</option>
          </select>
        </Field>
        <div className="md:col-span-3 grid gap-4 md:grid-cols-3">
          <Field label={lt("Origin Port")}>
            <FilterableSelect
              value={value.shipment.originPortGuid ?? ""}
              onChange={(next) => {
                const selected = (shippingPorts.data ?? []).find((x) => x.id === next);
                setValue({
                  ...value,
                  shipment: {
                    ...value.shipment,
                    originPortGuid: next || null,
                    origin: selected?.portName ?? ""
                  }
                });
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
                setValue({
                  ...value,
                  shipment: {
                    ...value.shipment,
                    destinationPortGuid: next || null,
                    destination: selected?.portName ?? ""
                  }
                });
              }}
              placeholder={lt("Select destination port")}
              options={(shippingPorts.data ?? []).map((x) => ({ value: x.id, label: `${x.portCode} - ${x.portName} - ${x.countryName}` }))}
            />
          </Field>
          <Field label={lt("Drop Location")}>
            <div className="space-y-2">
              <Input
                list={dropLocationListId}
                value={value.shipment.dropLocation ?? ""}
                placeholder={lt("Search address/place (OpenStreetMap)")}
                onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, dropLocation: e.target.value } })}
              />
              <datalist id={dropLocationListId}>
                {dropLocationOptions.map((x) => <option key={x} value={x} />)}
              </datalist>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {isSearchingDropLocation ? lt("Searching real locations...") : lt("Location search powered by OpenStreetMap (Nominatim).")}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void useCurrentDropLocation()} disabled={isResolvingDropLocation}>
                  <LocateFixed className="h-4 w-4" />
                  {isResolvingDropLocation ? lt("Detecting...") : lt("Use Current")}
                </Button>
              </div>
            </div>
          </Field>
        </div>
        <div className="md:col-span-3 grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-md border p-3">
            <h3 className="text-sm font-medium">{lt("Shipper Information")}</h3>
            <Field label={lt("Shipper Name")}><Input value={(value.shipment as HouseShipmentRequest).shipperName ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, shipperName: e.target.value } })} /></Field>
            <Field label={lt("Shipper Contact No")}><Input value={(value.shipment as HouseShipmentRequest).shipperContactNo ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, shipperContactNo: e.target.value } })} /></Field>
            <Field label={lt("Shipper Address")}>
              <textarea
                className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                value={(value.shipment as HouseShipmentRequest).shipperAddress ?? ""}
                onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, shipperAddress: e.target.value } })}
              />
            </Field>
          </div>
          <div className="space-y-3 rounded-md border p-3">
            <h3 className="text-sm font-medium">{lt("Consignee Information")}</h3>
            <Field label={lt("Consignee Name")}><Input value={(value.shipment as HouseShipmentRequest).consigneeName ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, consigneeName: e.target.value } })} /></Field>
            <Field label={lt("Consignee Contact No")}><Input value={(value.shipment as HouseShipmentRequest).consigneeContactNo ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, consigneeContactNo: e.target.value } })} /></Field>
            <Field label={lt("Consignee Address")}>
              <textarea
                className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                value={(value.shipment as HouseShipmentRequest).consigneeAddress ?? ""}
                onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, consigneeAddress: e.target.value } })}
              />
            </Field>
          </div>
        </div>
        <Field label={lt("Label Template")}><Input value={value.labelTemplateCode} onChange={(e) => setValue({ ...value, labelTemplateCode: e.target.value })} /></Field>
        <Field label={lt("ETD")}><Input type="datetime-local" value={toInputDateTime(value.shipment.etd)} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, etd: e.target.value || null } })} /></Field>
        <Field label={lt("ETA")}><Input type="datetime-local" value={toInputDateTime(value.shipment.eta)} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, eta: e.target.value || null } })} /></Field>
        <Field label={lt("Status")}><Input value={"status" in value.shipment ? String(value.shipment.status ?? "Draft") : "Draft"} disabled /></Field>
        <Field label={lt("Revenue Amount")}><Input type="number" min="0" value={value.shipment.revenueAmount} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, revenueAmount: Number(e.target.value) } })} /></Field>
        <Field label={lt("Cost Amount")}><Input type="number" min="0" value={value.shipment.costAmount} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, costAmount: Number(e.target.value) } })} /></Field>
        <Field label={lt("Profit Preview")}><Input value={profit.toFixed(2)} disabled /></Field>
        <div className="md:col-span-3">
          <Field label={lt("Remarks")}><Input value={value.shipment.remarks ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, remarks: e.target.value || null } })} /></Field>
        </div>
      </div>

      {enableGoodsSelection ? (
        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{lt("House Shipment Items")}</h3>
            <div className="flex gap-2">
              <Button type="button" variant={showGrnLoader ? "default" : "outline"} onClick={() => setShowGrnLoader((prev) => !prev)}>
                {showGrnLoader ? lt("Hide Goods Receipt Note Loader") : lt("Load From Goods Receipt Note")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setValue({
                ...value,
                selectedGoods: [
                  ...value.selectedGoods,
                  {
                    goodsReceiptItemId: null,
                    packageTypeGuid: null,
                    packageTypeName: null,
                    hsCode: "",
                    countryOfOrigin: "",
                    description: "",
                    receivedPieces: 0,
                    receivedWeight: 0,
                    length: 0,
                    width: 0,
                    height: 0,
                    volumeCbm: 0,
                    loadedPieces: 0,
                    loadedWeight: 0,
                    loadedVolume: 0
                  }
                ]
              })}>{lt("Add Manual Item")}</Button>
            </div>
          </div>
          {showGrnLoader ? (
            <GoodsSelectionTable
              initialCustomerId={value.shipment.customerId}
              onClose={() => setShowGrnLoader(false)}
              onApply={async (items) => {
                if (!items.length) return;
                if (onApplyGrnItems) {
                  await onApplyGrnItems(items);
                }
                setValue((prev) => {
                  const existing = prev.selectedGoods;
                  const mapped = new Map(existing.map((x) => [x.goodsReceiptItemId ?? `manual-${x.description}`, x]));
                  for (const row of items) {
                    mapped.set(row.goodsReceiptItemId ?? `manual-${row.description}`, row);
                  }
                  return {
                    ...prev,
                    selectedGoods: Array.from(mapped.values())
                  };
                });
              }}
            />
          ) : null}
          <ManualHouseShipmentItems
            value={value.selectedGoods}
            packageTypeOptions={(packageTypes.data ?? []).map((x) => ({ value: x.id, label: `${x.packageCode} - ${x.packageName}` }))}
            countryOptions={(countries.data ?? []).map((x) => ({ value: x.name, label: `${x.countryCode} - ${x.name}` }))}
            onChange={(items) => setValue({ ...value, selectedGoods: items })}
            onSaveItem={onSaveItem ? async (item) => {
              if ((item.operationMode === "Delete") && (!item.id || item.id === EMPTY_GUID)) {
                setValue((prev) => ({
                  ...prev,
                  selectedGoods: prev.selectedGoods.filter((x) => x !== item)
                }));
                return;
              }
              const refreshed = await onSaveItem(item);
              setValue((prev) => ({ ...prev, selectedGoods: refreshed }));
            } : undefined}
          />
        </div>
      ) : null}

      <Button onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? lt("Saving...") : lt("Save House Shipment")}</Button>
    </div>
  );
}

function ManualHouseShipmentItems({
  value,
  packageTypeOptions,
  countryOptions,
  onChange,
  onSaveItem
}: {
  value: HouseShipmentItemRequest[];
  packageTypeOptions: Array<{ value: string; label: string }>;
  countryOptions: Array<{ value: string; label: string }>;
  onChange: (items: HouseShipmentItemRequest[]) => void;
  onSaveItem?: (item: HouseShipmentItemRequest) => Promise<void>;
}) {
  const packageTypeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const x of packageTypeOptions) {
      const parts = x.label.split(" - ");
      map.set(x.value, parts.length > 1 ? parts.slice(1).join(" - ") : x.label);
    }
    return map;
  }, [packageTypeOptions]);
  const manualRows = value
    .map((item, index) => ({ item, index }))
    .filter((x) => !x.item.goodsReceiptItemId);
  const grnRows = value
    .map((item, index) => ({ item, index }))
    .filter((x) => !!x.item.goodsReceiptItemId);
  const manualTotalVolume = useMemo(
    () => manualRows.reduce((sum, row) => sum + (row.item.volumeCbm ?? 0), 0),
    [manualRows]
  );
  const overallLoadedVolume = useMemo(
    () => value.reduce((sum, row) => sum + (row.loadedVolume ?? row.volumeCbm ?? 0), 0),
    [value]
  );
  return (
    <div className="space-y-2">
      {grnRows.length ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{lt("Loaded From Goods Receipt Note")}</h4>
          <div className="overflow-auto rounded-md border">
            <table className="min-w-[1050px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">{lt("Package Type")}</th>
                  <th className="p-2 text-left">{lt("HS Code")}</th>
                  <th className="p-2 text-left">{lt("Country of Origin")}</th>
                  <th className="p-2 text-left">{lt("Description")}</th>
                  <th className="p-2 text-left">{lt("Loaded Pieces")}</th>
                  <th className="p-2 text-left">{lt("Loaded Weight")}</th>
                  <th className="p-2 text-left">{lt("Loaded Volume")}</th>
                  <th className="p-2 text-left">{lt("Operation")}</th>
                  <th className="p-2 text-right">{lt("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {grnRows.map(({ item, index }, idx) => (
                  <tr key={`grn-${item.goodsReceiptItemId ?? idx}`} className="border-t">
                    <td className="p-2">{(item.packageTypeGuid && packageTypeNameById.get(item.packageTypeGuid)) || "-"}</td>
                    <td className="p-2">{item.hsCode || "-"}</td>
                    <td className="p-2">{item.countryOfOrigin || "-"}</td>
                    <td className="p-2">{item.description ?? "-"}</td>
                    <td className="p-2">{item.loadedPieces}</td>
                    <td className="p-2">{item.loadedWeight}</td>
                    <td className="p-2">{item.loadedVolume}</td>
                    <td className="p-2 text-xs font-medium">{lt("Update")}</td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-1">
                        {onSaveItem ? <Button type="button" size="sm" variant="outline" onClick={() => void onSaveItem(value[index])}>{lt("Save")}</Button> : null}
                        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(value.filter((_, i) => i !== index))}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{lt("Manual Cargo Item Entry")}</h4>
        <span className="text-xs text-muted-foreground">
          {manualRows.length} {lt("manual row(s)")} | {lt("Manual Total Volume")}: {manualTotalVolume.toFixed(4)} CBM | {lt("Overall Loaded Volume")}: {overallLoadedVolume.toFixed(4)} CBM
        </span>
      </div>
      <div className="overflow-hidden rounded-md border bg-white">
        <div className="max-h-[520px] overflow-auto">
          <div className="min-w-[980px] divide-y">
            {manualRows.map(({ item, index }) => {
              const perItemVolume = Number((((item.length ?? 0) * (item.width ?? 0) * (item.height ?? 0)) / 1_000_000).toFixed(4));
              return (
              <div key={`${item.goodsReceiptItemId ?? "manual"}-${index}`} className={item.operationMode === "Delete" ? "bg-red-50/60" : "bg-white"}>
                <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[260px_minmax(260px,1.25fr)_minmax(240px,1fr)_240px_140px] xl:items-end">
                  <ItemField label={lt("Package Type")}><FilterableSelect
                    value={item.packageTypeGuid ?? ""}
                    onChange={(next) => updateManualRows(value, index, {
                      packageTypeGuid: next || null,
                      packageTypeName: next ? packageTypeNameById.get(next) ?? null : null
                    }, onChange)}
                    placeholder={lt("Select package type")}
                    options={packageTypeOptions}
                  /></ItemField>
                  <ItemField label={lt("Description")}><Input value={item.description ?? ""} onChange={(e) => updateManualRows(value, index, { description: e.target.value }, onChange)} /></ItemField>
                  <ItemField label={lt("Country of Origin")}><FilterableSelect value={item.countryOfOrigin ?? ""} onChange={(next) => updateManualRows(value, index, { countryOfOrigin: next }, onChange)} placeholder={lt("Select country")} options={countryOptions} /></ItemField>
                  <ItemField label={lt("HS Code")}><Input value={item.hsCode ?? ""} onChange={(e) => updateManualRows(value, index, { hsCode: e.target.value }, onChange)} /></ItemField>
                </div>
                <div className="grid gap-3 border-t bg-slate-50/70 p-3 md:grid-cols-3 xl:grid-cols-[120px_120px_110px_110px_110px_140px_140px_260px] xl:items-end">
                  <ItemField label={lt("No. of Packages")}><Input type="number" min="0" value={item.receivedPieces} onChange={(e) => updateManualRows(value, index, { receivedPieces: Math.max(0, Number(e.target.value)) }, onChange)} /></ItemField>
                  <ItemField label={lt("Gross Weight")}><Input type="number" min="0" value={item.receivedWeight} onChange={(e) => updateManualRows(value, index, { receivedWeight: Math.max(0, Number(e.target.value)) }, onChange)} /></ItemField>
                  <ItemField label={lt("Length (Per Item)")}><Input type="number" min="0" value={item.length} onChange={(e) => updateManualRows(value, index, { length: Math.max(0, Number(e.target.value)) }, onChange)} /></ItemField>
                  <ItemField label={lt("Width (Per Item)")}><Input type="number" min="0" value={item.width} onChange={(e) => updateManualRows(value, index, { width: Math.max(0, Number(e.target.value)) }, onChange)} /></ItemField>
                  <ItemField label={lt("Height (Per Item)")}><Input type="number" min="0" value={item.height} onChange={(e) => updateManualRows(value, index, { height: Math.max(0, Number(e.target.value)) }, onChange)} /></ItemField>
                  <ItemField label={lt("Per Item Volume")}><Input type="number" min="0" value={Number.isFinite(perItemVolume) ? perItemVolume : 0} disabled /></ItemField>
                  <ItemField label={lt("Total Volume")}><Input type="number" min="0" value={item.volumeCbm} disabled /></ItemField>
                  <ItemField label={lt("Operation / Action")}><div className="flex h-10 items-center gap-2">
                    <span className="inline-flex h-10 items-center rounded-md border bg-slate-50 px-3 text-xs font-medium text-slate-700">{item.id && item.id !== EMPTY_GUID ? lt("Update") : lt("New")}</span>
                    {onSaveItem ? <Button type="button" size="sm" variant="outline" onClick={() => void onSaveItem(value[index])}>{lt("Save")}</Button> : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!item.id || item.id === EMPTY_GUID) {
                          onChange(value.filter((_, i) => i !== index));
                          return;
                        }
                        updateManualRows(value, index, { operationMode: "Delete" }, onChange);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div></ItemField>
                </div>
              </div>
            );})}
            {!manualRows.length ? <div className="p-4 text-muted-foreground">{lt("No manual items added.")}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function updateManualRows(rows: HouseShipmentItemRequest[], index: number, patch: Partial<HouseShipmentItemRequest>, onChange: (items: HouseShipmentItemRequest[]) => void) {
  const next = [...rows];
  const current = { ...next[index], ...patch };
  const volume = ((current.length ?? 0) * (current.width ?? 0) * (current.height ?? 0) * (current.receivedPieces ?? 0)) / 1_000_000;
  current.volumeCbm = Number.isFinite(volume) ? Number(volume.toFixed(4)) : 0;
  current.loadedPieces = current.receivedPieces ?? 0;
  current.loadedWeight = current.receivedWeight ?? 0;
  current.loadedVolume = current.volumeCbm ?? 0;
  if (!patch.operationMode) {
    current.operationMode = current.id && current.id !== EMPTY_GUID ? "Update" : "New";
  }
  next[index] = current;
  onChange(next);
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

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

interface OpenStreetMapSearchItem {
  display_name: string;
}

interface OpenStreetMapReverseItem {
  display_name?: string;
}

async function searchOpenStreetMapLocations(query: string, signal: AbortSignal): Promise<OpenStreetMapSearchItem[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("q", query);

  const response = await fetch(url.toString(), {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Location search failed with status ${response.status}.`);
  }

  return (await response.json()) as OpenStreetMapSearchItem[];
}

async function reverseGeocodeOpenStreetMap(latitude: number, longitude: number): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as OpenStreetMapReverseItem;
  return payload.display_name?.trim() || null;
}

function toInputDateTime(value: string | null | undefined) {
  if (!value) return "";
  return value.length >= 16 ? value.slice(0, 16) : value;
}

function todayDateTimeLocalValue() {
  return toInputDateTime(new Date().toISOString());
}
