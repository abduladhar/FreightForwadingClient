import { useEffect, useId, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCarriers } from "@/api/carrierApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import type { MasterShipmentRequest, MasterShipmentUpdateRequest } from "@/api/masterShipmentApi";
import { HouseShipmentSelectionTable, type AssignmentRow } from "@/modules/shipments/master/HouseShipmentSelectionTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { lt } from "@/modules/operationsLocalization";

export type MasterShipmentFormValue = {
  shipment: MasterShipmentRequest | MasterShipmentUpdateRequest;
  selectedHouseShipments: Array<AssignmentRow & { id?: string }>;
};

export function MasterShipmentForm({
  initialValue,
  onSubmit,
  onPersistAssignments,
  onRemoveAssignedItem,
  isSubmitting,
  enableConsolidation = false
}: {
  initialValue?: MasterShipmentFormValue | null;
  onSubmit: (value: MasterShipmentFormValue) => Promise<void>;
  onPersistAssignments?: (rows: MasterShipmentFormValue["selectedHouseShipments"], mode: "house" | "grn") => Promise<MasterShipmentFormValue["selectedHouseShipments"]>;
  onRemoveAssignedItem?: (itemId: string) => Promise<MasterShipmentFormValue["selectedHouseShipments"]>;
  isSubmitting?: boolean;
  enableConsolidation?: boolean;
}) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<"house" | "grn">("house");
  const [value, setValue] = useState<MasterShipmentFormValue>(initialValue ?? {
    shipment: {
      modeOfTransport: "Air",
      salesmanId: null,
      carrierId: null,
      carrierName: null,
      flightNumber: null,
      vesselName: null,
      voyageNumber: null,
      truckNumber: null,
      originPortGuid: null,
      destinationPortGuid: null,
      etd: todayDateTimeLocalValue(),
      eta: todayDateTimeLocalValue(),
      totalCostAmount: 0,
      costAllocationMethod: "Weight",
      remarks: null
    },
    selectedHouseShipments: []
  });
  const carriers = useQuery({
    queryKey: ["master-shipment-carriers"],
    queryFn: () => searchCarriers({ pageNumber: 1, pageSize: 500, isActive: true })
  });
  const mode = value.shipment.modeOfTransport;
  const shippingPorts = useQuery({
    queryKey: ["master-shipment-shipping-ports", mode],
    queryFn: () => getActiveShippingPortsForDropdown(undefined, mode)
  });
  const legacyCarrierValue = !value.shipment.carrierId && value.shipment.carrierName ? "__legacy_carrier__" : "";
  const carrierOptions = [
    ...(legacyCarrierValue ? [{ value: legacyCarrierValue, label: value.shipment.carrierName! }] : []),
    ...(carriers.data?.items ?? []).map((carrier) => ({
      value: carrier.id,
      label: `${carrier.carrierCode} - ${carrier.carrierName}${carrier.carrierType ? ` - ${carrier.carrierType}` : ""}`
    }))
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={lt("Salesman (optional)")}><SalesmanSelect value={value.shipment.salesmanId} onChange={(salesmanId) => setValue({ ...value, shipment: { ...value.shipment, salesmanId } })} /></Field>
        <Field label={lt("Mode of Transport")} required><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.shipment.modeOfTransport} onChange={(e) => {
          const nextMode = e.target.value;
          setValue({
            ...value,
            shipment: {
              ...value.shipment,
              modeOfTransport: nextMode,
              originPortGuid: null,
              destinationPortGuid: null,
              flightNumber: nextMode === "Air" ? value.shipment.flightNumber : null,
              vesselName: nextMode === "Sea" ? value.shipment.vesselName : null,
              voyageNumber: nextMode === "Sea" ? value.shipment.voyageNumber : null,
              truckNumber: nextMode === "Road" ? value.shipment.truckNumber : null
            }
          });
        }}><option value="Air">{lt("Air")}</option><option value="Sea">{lt("Sea")}</option><option value="Road">{lt("Road")}</option><option value="Courier">{lt("Courier")}</option></select></Field>
        <Field label={lt("Carrier")} required>
          <FilterableSelect
            value={value.shipment.carrierId ?? legacyCarrierValue}
            onChange={(carrierId) => {
              if (!carrierId) {
                setValue({ ...value, shipment: { ...value.shipment, carrierId: null, carrierName: null } });
                return;
              }
              if (carrierId === legacyCarrierValue) return;
              const selectedCarrier = (carriers.data?.items ?? []).find((carrier) => carrier.id === carrierId);
              setValue({
                ...value,
                shipment: {
                  ...value.shipment,
                  carrierId,
                  carrierName: selectedCarrier?.carrierName ?? null
                }
              });
            }}
            placeholder={carriers.isLoading ? lt("Loading carriers...") : lt("Select carrier")}
            options={carrierOptions}
          />
          {carriers.isError ? <p className="text-xs text-red-600">{lt("Unable to load active carriers.")}</p> : null}
        </Field>
        {mode === "Air" ? <Field label={lt("Flight")}><Input value={value.shipment.flightNumber ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, flightNumber: e.target.value || null } })} /></Field> : null}
        {mode === "Sea" ? <Field label={lt("Vessel Name")}><Input value={value.shipment.vesselName ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, vesselName: e.target.value || null } })} /></Field> : null}
        {mode === "Sea" ? <Field label={lt("Voyage Number")}><Input value={value.shipment.voyageNumber ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, voyageNumber: e.target.value || null } })} /></Field> : null}
        {mode === "Road" ? <Field label={lt("Truck Number")}><Input value={value.shipment.truckNumber ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, truckNumber: e.target.value || null } })} /></Field> : null}
        <Field label={lt("Origin Port")} required>
          <FilterableSelect
            value={value.shipment.originPortGuid ?? ""}
            onChange={(next) => {
              setValue({ ...value, shipment: { ...value.shipment, originPortGuid: next || null } });
            }}
            placeholder={lt("Select origin port")}
            options={(shippingPorts.data ?? []).map((x) => ({ value: x.id, label: `${x.portCode} - ${x.portName} - ${x.countryName}` }))}
          />
        </Field>
        <Field label={lt("Destination Port")} required>
          <FilterableSelect
            value={value.shipment.destinationPortGuid ?? ""}
            onChange={(next) => {
              setValue({ ...value, shipment: { ...value.shipment, destinationPortGuid: next || null } });
            }}
            placeholder={lt("Select destination port")}
            options={(shippingPorts.data ?? []).map((x) => ({ value: x.id, label: `${x.portCode} - ${x.portName} - ${x.countryName}` }))}
          />
        </Field>
        <Field label={lt("ETD - Expected Time of Departure")}><Input type="datetime-local" value={toInput(value.shipment.etd)} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, etd: e.target.value || null } })} /></Field>
        <Field label={lt("ETA - Expected Time of Arrival")}><Input type="datetime-local" value={toInput(value.shipment.eta)} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, eta: e.target.value || null } })} /></Field>
        <Field label={lt("Total Cost")}><Input type="number" min={0} value={value.shipment.totalCostAmount} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, totalCostAmount: Math.max(0, Number(e.target.value)) } })} /></Field>
        <Field label={lt("Allocation Method")} required><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.shipment.costAllocationMethod} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, costAllocationMethod: e.target.value } })}><option>{lt("Weight")}</option><option>{lt("Volume")}</option><option>{lt("Pieces")}</option><option>{lt("ChargeableWeight")}</option><option>{lt("Manual")}</option></select></Field>
        <div className="md:col-span-3"><Field label={lt("Remarks")}><Input value={value.shipment.remarks ?? ""} onChange={(e) => setValue({ ...value, shipment: { ...value.shipment, remarks: e.target.value || null } })} /></Field></div>
      </div>
      {enableConsolidation ? (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{lt("House Shipment Assignment")}</h3>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setAssignMode("house"); setIsAssignModalOpen(true); }}>{lt("Assign House Shipment")}</Button>
              <Button type="button" variant="outline" onClick={() => { setAssignMode("grn"); setIsAssignModalOpen(true); }}>{lt("Assign GRN")}</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{value.selectedHouseShipments.length} house shipment(s) selected.</p>
          {value.selectedHouseShipments.length ? (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 text-left">{lt("House Waybill No")}</th>
                    <th className="p-2 text-left">{lt("Shipper")}</th>
                    <th className="p-2 text-left">{lt("Consignee")}</th>
                    <th className="p-2 text-left">{lt("Item")}</th>
                    <th className="p-2 text-left">{lt("Package Type")}</th>
                    <th className="p-2 text-left">{lt("Country of Origin")}</th>
                    <th className="p-2 text-left">{lt("HS Code")}</th>
                    <th className="p-2 text-left">L</th>
                    <th className="p-2 text-left">W</th>
                    <th className="p-2 text-left">H</th>
                    <th className="p-2 text-left">{lt("CBM")}</th>
                    <th className="p-2 text-left">{lt("Pieces")}</th>
                    <th className="p-2 text-left">{lt("Weight")}</th>
                    <th className="p-2 text-right">{lt("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {value.selectedHouseShipments.map((x, idx) => (
                    <tr key={`${x.houseShipmentId}-${x.houseShipmentItemId}-${idx}`} className="border-t">
                      <td className="p-2">{x.hawbNumber || x.houseShipmentNumber || "-"}</td>
                      <td className="p-2">{x.shipperName || "-"}</td>
                      <td className="p-2">{x.consigneeName || "-"}</td>
                      <td className="p-2">{x.houseShipmentItemDescription || "-"}</td>
                      <td className="p-2">{x.packageTypeName || "-"}</td>
                      <td className="p-2">{x.countryOfOrigin || "-"}</td>
                      <td className="p-2">{x.hsCode || "-"}</td>
                      <td className="p-2">{(x.length ?? 0).toFixed(2)}</td>
                      <td className="p-2">{(x.width ?? 0).toFixed(2)}</td>
                      <td className="p-2">{(x.height ?? 0).toFixed(2)}</td>
                      <td className="p-2">{(x.volumeCbm ?? 0).toFixed(4)}</td>
                      <td className="p-2">{x.consolidatedPieces}</td>
                      <td className="p-2">{x.consolidatedWeight}</td>
                      <td className="p-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (x.id && onRemoveAssignedItem) {
                              const refreshed = await onRemoveAssignedItem(x.id);
                              setValue((prev) => ({ ...prev, selectedHouseShipments: refreshed }));
                              return;
                            }
                            setValue((prev) => ({
                              ...prev,
                              selectedHouseShipments: prev.selectedHouseShipments.filter((_, i) => i !== idx)
                            }));
                          }}
                        >{lt("Remove")}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
      <Button onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? lt("Saving...") : lt("Save Master Shipment")}</Button>

      {enableConsolidation && isAssignModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-[95vw] overflow-x-auto overflow-y-auto rounded-lg bg-white p-4 shadow-xl xl:w-[90vw]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">{lt("Assign House Shipments to Master")}</h3>
              <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>{lt("Close")}</Button>
            </div>
            <HouseShipmentSelectionTable
              transportMode={value.shipment.modeOfTransport}
              defaultLoadMode={assignMode}
              hideOtherModeSwitch
              isOpen={isAssignModalOpen}
              existingAssignments={value.selectedHouseShipments}
              onApply={async (rows, mode) => {
                if (onPersistAssignments) {
                  const refreshed = await onPersistAssignments(rows, mode);
                  setValue((prev) => ({ ...prev, selectedHouseShipments: refreshed }));
                  setIsAssignModalOpen(false);
                  return;
                }
                setValue((prev) => ({ ...prev, selectedHouseShipments: rows }));
                setIsAssignModalOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return <div className="space-y-1"><Label>{label}{required ? <RequiredMark /> : null}</Label>{children}</div>;
}

function RequiredMark() {
  return <span className="ml-1 text-red-600">*</span>;
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
function todayDateTimeLocalValue() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
