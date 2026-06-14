import { useEffect, useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCcw, Trash2 } from "lucide-react";
import { searchAgents } from "@/api/agentApi";
import { getCurrencies } from "@/api/currencyApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { getActivePackageTypesForDropdown } from "@/api/packageTypeApi";
import { getActiveChargeHeadsForDropdown } from "@/api/chargeHeadApi";
import { searchRateMasters } from "@/api/rateMasterApi";
import type { GenerateQuotationRequest, QuotationManualChargeRequest, QuotationRequest } from "@/api/quotationApi";
import { createQuotationSchema } from "@/modules/quotations/quotationValidation";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { CalculationBreakdown } from "@/components/common/CalculationBreakdown";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { masterDataButtonClass } from "@/modules/masterDataUi";
import { useQuotationI18n } from "@/modules/quotations/quotationI18n";

const modes = ["Air", "Sea", "Road", "Courier"];
const shipmentTypes = ["House", "Master", "Direct"];
const rateBasisOptions = ["Flat", "Weight", "Volume", "Pieces", "ChargeableWeight", "Distance", "Zone"];

export function QuotationForm({
  initialValue,
  initialExpectedShipmentDate,
  onSubmit,
  onGenerateFromRateMaster,
  isSubmitting
}: {
  initialValue?: QuotationRequest | null;
  initialExpectedShipmentDate?: string;
  onSubmit: (value: QuotationRequest) => Promise<void>;
  onGenerateFromRateMaster?: (value: GenerateQuotationRequest) => Promise<QuotationRequest | null>;
  isSubmitting?: boolean;
}) {
  const q = useQuotationI18n();
  const toast = useToast();
  const { hasPermission } = useAuth();
  const agents = useQuery({ queryKey: ["quotation-agents"], queryFn: () => searchAgents({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const currencies = useQuery({ queryKey: ["quotation-currencies"], queryFn: getCurrencies });
  const shippingPorts = useQuery({ queryKey: ["quotation-shipping-ports"], queryFn: () => getActiveShippingPortsForDropdown() });
  const packageTypes = useQuery({ queryKey: ["quotation-package-types"], queryFn: () => getActivePackageTypesForDropdown() });
  const chargeHeads = useQuery({ queryKey: ["quotation-charge-heads"], queryFn: () => getActiveChargeHeadsForDropdown() });
  const rateMasters = useQuery({
    queryKey: ["quotation-rate-masters"],
    queryFn: () => searchRateMasters({ pageNumber: 1, pageSize: 200, isActive: true })
  });
  const [value, setValue] = useState<QuotationRequest>(initialValue ?? {
    rateMasterId: null,
    customerId: "",
    agentId: null,
    originPortGuid: null,
    originPortName: null,
    destinationPortGuid: null,
    destinationPortName: null,
    origin: "",
    destination: "",
    serviceType: "",
    modeOfTransport: "Air",
    shipmentType: "House",
    cargoType: "",
    incoterms: "",
    currencyId: null,
    targetCurrencyId: null,
    exchangeRate: 1,
    discountAmount: 0,
    isManualOverride: false,
    overrideReason: "",
    items: [{ packageTypeGuid: null, packageTypeName: null, description: "", pieces: 0, actualWeight: 0, length: 0, width: 0, height: 0, distance: 0, zone: "" }],
    manualCharges: []
  });
  const [pickupRequired, setPickupRequired] = useState(false);
  const [deliveryRequired, setDeliveryRequired] = useState(false);
  const [expectedShipmentDate, setExpectedShipmentDate] = useState(initialExpectedShipmentDate ?? "");
  const canOverride = hasPermission("Quotation.Override");
  const quotationSchema = useMemo(() => createQuotationSchema(q), [q]);
  const selectedCurrency = useMemo(
    () => (currencies.data ?? []).find((currency) => currency.id === value.currencyId) ?? null,
    [currencies.data, value.currencyId]
  );
  const currencyCode = selectedCurrency?.currencyCode ?? "Currency";
  const currencySymbol = selectedCurrency?.symbol?.trim() || currencyCode;
  const eligibleRates = useMemo(
    () => (rateMasters.data?.items ?? []).filter((rate) => {
      if (rate.customerId && rate.customerId !== value.customerId) return false;
      if (rate.agentId && rate.agentId !== value.agentId) return false;
      return rate.rateScope === "General" || Boolean(rate.customerId) || Boolean(rate.agentId);
    }),
    [rateMasters.data?.items, value.customerId, value.agentId]
  );
  const rows = useMemo(() => {
    const chargeRows = value.manualCharges.map((c, index) => {
      const lineAmount = (c.quantity * c.unitRate) - c.discountAmount + (c.isTaxApplicable ? (((c.quantity * c.unitRate) - c.discountAmount) * c.taxRate) / 100 : 0);
      const label = c.chargeHeadName?.trim() || c.chargeName?.trim() || c.chargeCode?.trim() || `${q("Charge")} ${index + 1}`;
      return { key: `charge-${index}`, label, value: lineAmount };
    });
    return [
      ...chargeRows,
      { key: "discount", label: q("Quotation Discount"), value: -value.discountAmount },
      { key: "pickup", label: q("Pickup Required"), value: pickupRequired ? 1 : 0 },
      { key: "delivery", label: q("Delivery Required"), value: deliveryRequired ? 1 : 0 }
    ];
  }, [q, value.manualCharges, value.discountAmount, pickupRequired, deliveryRequired]);

  async function submit() {
    const parsed = quotationSchema.safeParse(value);
    if (!parsed.success) {
      toast.error(q("Validation failed"), parsed.error.issues[0]?.message ?? q("Invalid quotation data."));
      return;
    }
    if (value.isManualOverride && !canOverride) {
      toast.error(q("Permission required"), q("You do not have Quotation.Override permission."));
      return;
    }
    await onSubmit(value);
  }

  async function generate(showToast = true) {
    if (!onGenerateFromRateMaster) return;
    const manualCharges = value.manualCharges.filter((charge) => !charge.rateMasterChargeId);
    const generated = await onGenerateFromRateMaster({
      rateMasterId: value.rateMasterId || null,
      customerId: value.customerId || null,
      agentId: value.agentId || null,
      originPortGuid: value.originPortGuid || null,
      originPortName: value.originPortName || null,
      destinationPortGuid: value.destinationPortGuid || null,
      destinationPortName: value.destinationPortName || null,
      origin: value.origin,
      destination: value.destination,
      serviceType: value.serviceType,
      modeOfTransport: value.modeOfTransport,
      shipmentType: value.shipmentType,
      cargoType: value.cargoType || null,
      incoterms: value.incoterms || null,
      zone: value.items[0]?.zone || null,
      currencyId: value.currencyId || null,
      targetCurrencyId: null,
      exchangeRate: value.exchangeRate,
      discountAmount: value.discountAmount,
      isManualOverride: value.isManualOverride,
      overrideReason: value.overrideReason || null,
      items: value.items
    });
    if (generated) {
      setValue({ ...generated, manualCharges: [...generated.manualCharges, ...manualCharges] });
      if (showToast) toast.success(q("Charges calculated"), q("Rate Master charges were refreshed. Review or adjust them before saving."));
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={q("Customer")}>
          <CustomerAutocomplete
            value={value.customerId}
            onChange={(customer) => setValue((prev) => ({ ...prev, customerId: customer?.id ?? "" }))}
          />
        </Field>
        <Field label={q("Rate Master")}>
          <FilterableSelect
            value={value.rateMasterId ?? ""}
            onChange={(next) => {
              const selected = eligibleRates.find((rate) => rate.id === next);
              const originPort = selected ? (shippingPorts.data ?? []).find((port) => port.portName === selected.origin) : undefined;
              const destinationPort = selected ? (shippingPorts.data ?? []).find((port) => port.portName === selected.destination) : undefined;
              setValue((current) => ({
                ...current,
                rateMasterId: next || null,
                ...(selected ? {
                  originPortGuid: originPort?.id ?? current.originPortGuid,
                  originPortName: originPort?.portName ?? selected.origin ?? current.originPortName,
                  destinationPortGuid: destinationPort?.id ?? current.destinationPortGuid,
                  destinationPortName: destinationPort?.portName ?? selected.destination ?? current.destinationPortName,
                  origin: selected.origin ?? current.origin,
                  destination: selected.destination ?? current.destination,
                  serviceType: selected.serviceType,
                  modeOfTransport: selected.modeOfTransport,
                  shipmentType: selected.shipmentType,
                  cargoType: selected.cargoType ?? current.cargoType,
                  incoterms: selected.incoterms ?? current.incoterms,
                  currencyId: selected.currencyId,
                  targetCurrencyId: null
                } : {})
              }));
            }}
            placeholder={q(rateMasters.isLoading ? "Loading rate masters..." : "Select rate master")}
            options={eligibleRates.map((rate) => ({
              value: rate.id,
              label: `${rate.rateCode} - ${rate.rateName} - ${rate.origin || q("Any")} ${q("to")} ${rate.destination || q("Any")}`
            }))}
          />
        </Field>
        <Field label={q("Agent")}><FilterableSelect value={value.agentId ?? ""} onChange={(next) => setValue({ ...value, agentId: next || null })} placeholder={q("Select agent")} options={(agents.data?.items ?? []).map((x) => ({ value: x.id, label: `${x.agentCode} - ${x.agentName}` }))} /></Field>
        <Field label={q("Quotation Currency")}>
          <FilterableSelect
            value={value.currencyId ?? ""}
            onChange={(next) => setValue({
              ...value,
              currencyId: next || null,
              targetCurrencyId: null,
              manualCharges: value.manualCharges.map((charge) => ({ ...charge, currencyId: next || null }))
            })}
            placeholder={q("Select currency")}
            options={(currencies.data ?? []).map((x) => ({ value: x.id, label: `${x.currencyCode} - ${x.currencyName}${x.symbol ? ` (${x.symbol})` : ""}` }))}
          />
        </Field>
        <Field label={q("Origin Port")}>
          <FilterableSelect
            value={value.originPortGuid ?? ""}
            onChange={(next) => {
              const selected = (shippingPorts.data ?? []).find((x) => x.id === next);
              setValue({
                ...value,
                originPortGuid: next || null,
                originPortName: selected?.portName ?? null,
                origin: selected?.portName ?? ""
              });
            }}
            placeholder={q("Select origin port")}
            options={(shippingPorts.data ?? []).map((x) => ({ value: x.id, label: `${x.portCode} - ${x.portName} - ${x.countryName}` }))}
          />
        </Field>
        <Field label={q("Destination Port")}>
          <FilterableSelect
            value={value.destinationPortGuid ?? ""}
            onChange={(next) => {
              const selected = (shippingPorts.data ?? []).find((x) => x.id === next);
              setValue({
                ...value,
                destinationPortGuid: next || null,
                destinationPortName: selected?.portName ?? null,
                destination: selected?.portName ?? ""
              });
            }}
            placeholder={q("Select destination port")}
            options={(shippingPorts.data ?? []).map((x) => ({ value: x.id, label: `${x.portCode} - ${x.portName} - ${x.countryName}` }))}
          />
        </Field>
        <Field label={q("Origin (Auto from Origin Port)")}><Input value={value.origin} readOnly /></Field>
        <Field label={q("Destination (Auto from Destination Port)")}><Input value={value.destination} readOnly /></Field>
        <Field label={q("Service Type")}><Input value={value.serviceType} onChange={(e) => setValue({ ...value, serviceType: e.target.value })} /></Field>
        <Field label={q("Shipment Type")}><FilterableSelect value={value.shipmentType} onChange={(next) => setValue({ ...value, shipmentType: next })} placeholder={q("Select shipment type")} options={shipmentTypes.map((x) => ({ value: x, label: q(x) }))} /></Field>
        <Field label={q("Mode of Transport")}><FilterableSelect value={value.modeOfTransport} onChange={(next) => setValue({ ...value, modeOfTransport: next })} placeholder={q("Select mode")} options={modes.map((x) => ({ value: x, label: q(x) }))} /></Field>
        <Field label={q("Incoterms")}><Input value={value.incoterms ?? ""} onChange={(e) => setValue({ ...value, incoterms: e.target.value })} /></Field>
        <Field label={q("Cargo / Goods Description")}><Input value={value.cargoType ?? ""} onChange={(e) => setValue({ ...value, cargoType: e.target.value })} /></Field>
        <Field label={q("Expected Shipment Date")}><Input type="date" value={expectedShipmentDate} onChange={(e) => setExpectedShipmentDate(e.target.value)} /></Field>
        <Field label={`${q("Exchange Rate")} (${currencyCode})`}><Input type="number" min="0" value={value.exchangeRate} onChange={(e) => setValue({ ...value, exchangeRate: Number(e.target.value) })} /></Field>
        <Field label={`${q("Discount")} (${currencyCode})`}><Input type="number" min="0" value={value.discountAmount} onChange={(e) => setValue({ ...value, discountAmount: Number(e.target.value) })} /></Field>
        <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={pickupRequired} onChange={(e) => setPickupRequired(e.target.checked)} /> {q("Pickup Required")}</label>
        <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={deliveryRequired} onChange={(e) => setDeliveryRequired(e.target.checked)} /> {q("Delivery Required")}</label>
        <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={value.isManualOverride} onChange={(e) => setValue({ ...value, isManualOverride: e.target.checked })} disabled={!canOverride} /> {q("Manual Override")}</label>
        <Field label={q("Override Reason")}><Input value={value.overrideReason ?? ""} onChange={(e) => setValue({ ...value, overrideReason: e.target.value })} disabled={!value.isManualOverride || !canOverride} /></Field>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{q("Items")}</h3>
          <Button className={masterDataButtonClass} type="button" variant="outline" onClick={() => setValue({ ...value, items: [...value.items, { packageTypeGuid: null, packageTypeName: null, description: "", pieces: 0, actualWeight: 0, length: 0, width: 0, height: 0, distance: 0, zone: "" }] })}><Plus className="h-4 w-4" /> {q("Add Item")}</Button>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 text-left">{q("Package Type")}</th><th className="p-2 text-left">{q("Description")}</th><th className="p-2 text-left">{q("No. of Packages")}</th><th className="p-2 text-left">{q("Gross Weight")}</th><th className="p-2 text-left">{q("Volume (CBM)")}</th><th className="p-2 text-left">{q("Length")}</th><th className="p-2 text-left">{q("Width")}</th><th className="p-2 text-left">{q("Height")}</th><th className="p-2 text-left">{q("Chargeable Weight")}</th><th className="p-2 text-right">{q("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {value.items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">
                    <FilterableSelect
                      className="w-56"
                      value={item.packageTypeGuid ?? ""}
                      onChange={(next) => {
                        const selected = (packageTypes.data ?? []).find((x) => x.id === next);
                        const nextItems = [...value.items];
                        nextItems[index] = {
                          ...nextItems[index],
                          packageTypeGuid: next || null,
                          packageTypeName: selected?.packageName ?? null
                        };
                        setValue({ ...value, items: nextItems });
                      }}
                      placeholder={q("Select package type")}
                      options={(packageTypes.data ?? []).map((x) => ({ value: x.id, label: `${x.packageCode} - ${x.packageName}` }))}
                    />
                  </td>
                  <td className="p-2"><Input value={item.description} onChange={(e) => updateItem(value.items, index, "description", e.target.value, (items) => setValue({ ...value, items }))} /></td>
                  <td className="p-2"><Input type="number" min="0" value={item.pieces} onChange={(e) => updateItem(value.items, index, "pieces", Number(e.target.value), (items) => setValue({ ...value, items }))} /></td>
                  <td className="p-2"><Input type="number" min="0" value={item.actualWeight} onChange={(e) => updateItem(value.items, index, "actualWeight", Number(e.target.value), (items) => setValue({ ...value, items }))} /></td>
                  <td className="p-2 text-sm text-muted-foreground">{(((item.length || 0) * (item.width || 0) * (item.height || 0) * (item.pieces || 0)) / 1_000_000).toFixed(4)}</td>
                  <td className="p-2"><Input type="number" min="0" value={item.length} onChange={(e) => updateItem(value.items, index, "length", Number(e.target.value), (items) => setValue({ ...value, items }))} /></td>
                  <td className="p-2"><Input type="number" min="0" value={item.width} onChange={(e) => updateItem(value.items, index, "width", Number(e.target.value), (items) => setValue({ ...value, items }))} /></td>
                  <td className="p-2"><Input type="number" min="0" value={item.height} onChange={(e) => updateItem(value.items, index, "height", Number(e.target.value), (items) => setValue({ ...value, items }))} /></td>
                  <td className="p-2 text-sm text-muted-foreground">{Math.max(item.actualWeight || 0, ((((item.length || 0) * (item.width || 0) * (item.height || 0) * (item.pieces || 0)) / 1_000_000) * 167)).toFixed(4)}</td>
                  <td className="p-2 text-right"><Button type="button" variant="ghost" size="sm" onClick={() => setValue({ ...value, items: value.items.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4 text-red-600" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{q("Charges")}</h3>
            <p className="text-xs text-muted-foreground">{q("All charge values are in")} {selectedCurrency ? `${currencyCode} (${currencySymbol})` : q("the selected quotation currency")}.</p>
          </div>
          <Button className={masterDataButtonClass} type="button" variant="outline" onClick={() => setValue({ ...value, manualCharges: [...value.manualCharges, { rateMasterChargeId: null, chargeHeadGuid: null, chargeHeadName: null, chargeCode: "", chargeName: "", currencyId: value.currencyId ?? null, rateBasis: "Flat", unit: "Per Shipment", quantity: 1, unitRate: 0, minimumAllowedAmount: null, maximumAllowedAmount: null, discountAmount: 0, isTaxApplicable: false, taxRate: 0, isManualOverride: false, overrideReason: "" }] })}><Plus className="h-4 w-4" /> {q("Add Charge")}</Button>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 text-left">{q("Charge Head")}</th><th className="p-2 text-left">{q("Currency")}</th><th className="p-2 text-left">{q("Rate")} ({currencyCode})</th><th className="p-2 text-left">{q("Quantity")}</th><th className="p-2 text-left">{q("Min Rate")} ({currencyCode})</th><th className="p-2 text-left">{q("Unit")}</th><th className="p-2 text-left">{q("Tax")}</th><th className="p-2 text-left">{q("Amount")} ({currencyCode})</th><th className="p-2 text-right">{q("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {value.manualCharges.map((charge, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">
                    <FilterableSelect
                      className="w-72"
                      value={charge.chargeHeadGuid ?? ""}
                      disabled={Boolean(charge.rateMasterChargeId)}
                      onChange={(next) => {
                        const selected = (chargeHeads.data ?? []).find((x) => x.id === next);
                        const manualCharges = [...value.manualCharges];
                        manualCharges[index] = {
                          ...manualCharges[index],
                          chargeHeadGuid: next || null,
                          chargeHeadName: selected?.mappingName ?? null,
                          chargeCode: selected?.mappingKey ?? "",
                          chargeName: selected?.mappingName ?? ""
                        };
                        setValue({ ...value, manualCharges });
                      }}
                      placeholder={q("Select charge head")}
                      options={(chargeHeads.data ?? []).map((x) => ({ value: x.id, label: `${x.mappingKey} - ${x.mappingName}` }))}
                    />
                  </td>
                  <td className="p-2">
                    <FilterableSelect
                      className="w-48"
                      value={value.currencyId ?? ""}
                      disabled
                      onChange={() => undefined}
                      placeholder={q("Select currency")}
                      options={(currencies.data ?? []).map((x) => ({ value: x.id, label: `${x.currencyCode} - ${x.currencyName}` }))}
                    />
                  </td>
                  <td className="p-2"><Input type="number" min={minimumRateFor(charge) ?? 0} step="0.0001" title={rateLimitText(charge, q)} value={charge.unitRate} onChange={(e) => updateCharge(value.manualCharges, index, "unitRate", Number(e.target.value), (manualCharges) => setValue({ ...value, manualCharges }))} /></td>
                  <td className="p-2"><Input type="number" min="0" value={charge.quantity} disabled={Boolean(charge.rateMasterChargeId)} onChange={(e) => updateCharge(value.manualCharges, index, "quantity", Number(e.target.value), (manualCharges) => setValue({ ...value, manualCharges }))} /></td>
                  <td className="p-2 text-sm text-muted-foreground">{charge.minimumAllowedAmount == null ? "-" : `${currencySymbol} ${charge.minimumAllowedAmount.toFixed(2)}`}</td>
                  <td className="p-2">
                    <select disabled={Boolean(charge.rateMasterChargeId)} className="h-10 rounded-md border px-3 text-sm disabled:opacity-60" value={charge.unit ?? "Per Shipment"} onChange={(e) => updateCharge(value.manualCharges, index, "unit", e.target.value, (manualCharges) => setValue({ ...value, manualCharges }))}>
                      <option value="Per Shipment">{q("Per Shipment")}</option>
                      <option value="Per Kg">{q("Per Kg")}</option>
                      <option value="Per Piece">{q("Per Piece")}</option>
                      <option value="Per CBM">{q("Per CBM")}</option>
                    </select>
                  </td>
                  <td className="p-2"><div className="flex items-center gap-1"><input type="checkbox" disabled={Boolean(charge.rateMasterChargeId)} checked={charge.isTaxApplicable} onChange={(e) => updateCharge(value.manualCharges, index, "isTaxApplicable", e.target.checked, (manualCharges) => setValue({ ...value, manualCharges }))} /><Input disabled={Boolean(charge.rateMasterChargeId)} type="number" min="0" className="w-20" value={charge.taxRate} onChange={(e) => updateCharge(value.manualCharges, index, "taxRate", Number(e.target.value), (manualCharges) => setValue({ ...value, manualCharges }))} /></div></td>
                  <td className="p-2 whitespace-nowrap text-sm font-medium">{currencySymbol} {(((charge.quantity * charge.unitRate) - charge.discountAmount) + (charge.isTaxApplicable ? (((charge.quantity * charge.unitRate) - charge.discountAmount) * charge.taxRate / 100) : 0)).toFixed(2)}</td>
                  <td className="p-2 text-right"><Button type="button" variant="ghost" size="sm" title={q(charge.rateMasterChargeId ? "Remove loaded rate" : "Delete charge")} onClick={() => setValue({ ...value, manualCharges: value.manualCharges.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4 text-red-600" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CalculationBreakdown title={`${q("Calculation Breakdown")} (${currencyCode})`} rows={rows} totalCurrency={selectedCurrency?.currencyCode ?? "USD"} totalLabel={q("Total")} />

      <div className="flex flex-wrap gap-2">
        {onGenerateFromRateMaster ? <PermissionButton className={masterDataButtonClass} permission="Quotation.Create" variant="outline" onClick={() => void generate().catch(() => undefined)}><RefreshCcw className="h-4 w-4" /> {q(value.manualCharges.some((charge) => charge.rateMasterChargeId) ? "Reload Rates" : "Load Rates")}</PermissionButton> : null}
        <PermissionButton className={masterDataButtonClass} permission={initialValue ? "Quotation.Update" : "Quotation.Create"} onClick={() => void submit()} disabled={isSubmitting}>{q(isSubmitting ? "Saving..." : "Save Quotation")}</PermissionButton>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
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
        placeholder={placeholder}
        disabled={disabled}
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

function updateItem(
  items: QuotationRequest["items"],
  index: number,
  key: keyof QuotationRequest["items"][number],
  nextValue: string | number,
  onChange: (items: QuotationRequest["items"]) => void
) {
  const next = [...items];
  next[index] = { ...next[index], [key]: nextValue };
  onChange(next);
}

function updateCharge(
  charges: QuotationManualChargeRequest[],
  index: number,
  key: keyof QuotationManualChargeRequest,
  nextValue: string | number | boolean | null,
  onChange: (charges: QuotationManualChargeRequest[]) => void
) {
  const next = [...charges];
  next[index] = { ...next[index], [key]: nextValue } as QuotationManualChargeRequest;
  onChange(next);
}

function minimumRateFor(charge: QuotationManualChargeRequest) {
  return charge.minimumAllowedAmount ?? null;
}

function rateLimitText(charge: QuotationManualChargeRequest, t: (value: string) => string) {
  const minimum = minimumRateFor(charge);
  if (minimum == null) return t("No configured minimum rate");
  return `${t("Minimum rate")}: ${minimum.toFixed(4)}`;
}
