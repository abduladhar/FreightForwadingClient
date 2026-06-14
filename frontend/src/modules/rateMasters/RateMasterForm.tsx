import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCustomers } from "@/api/customerApi";
import { searchVendors } from "@/api/vendorApi";
import { searchAgents } from "@/api/agentApi";
import { getCurrencies } from "@/api/currencyApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { getActiveCountriesForDropdown } from "@/api/countryApi";
import type { RateMasterRequest } from "@/api/rateMasterApi";
import { createRateMasterSchema } from "@/modules/rateMasters/rateMasterValidation";
import { RateMasterChargesTab } from "@/modules/rateMasters/RateMasterChargesTab";
import { useRateMasterI18n } from "@/modules/rateMasters/rateMasterI18n";
import { masterDataButtonClass } from "@/modules/masterDataUi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

const rateScopes = ["General", "Customer", "Vendor", "Agent"];
const modes = ["Air", "Sea", "Road", "Courier"];
const shipmentTypes = ["House", "Master", "Direct"];
const rateBasis = ["Weight", "Volume", "Pieces", "ChargeableWeight", "Distance", "Zone", "Flat"];

export function RateMasterForm({
  initialValue,
  onSubmit,
  isSubmitting
}: {
  initialValue?: RateMasterRequest | null;
  onSubmit: (value: RateMasterRequest) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const r = useRateMasterI18n();
  const toast = useToast();
  const customers = useQuery({ queryKey: ["rate-master-customers"], queryFn: () => searchCustomers({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const vendors = useQuery({ queryKey: ["rate-master-vendors"], queryFn: () => searchVendors({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const agents = useQuery({ queryKey: ["rate-master-agents"], queryFn: () => searchAgents({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const currencies = useQuery({ queryKey: ["rate-master-currencies"], queryFn: getCurrencies });
  const shippingPorts = useQuery({ queryKey: ["rate-master-shipping-ports"], queryFn: () => getActiveShippingPortsForDropdown() });
  const countries = useQuery({ queryKey: ["rate-master-countries"], queryFn: () => getActiveCountriesForDropdown() });
  const [tab, setTab] = useState<"core" | "charges">("core");
  const [value, setValue] = useState<RateMasterRequest>(initialValue ?? {
    rateCode: "",
    rateName: "",
    rateScope: "General",
    customerId: null,
    vendorId: null,
    agentId: null,
    origin: "",
    destination: "",
    country: "",
    city: "",
    zone: "",
    serviceType: "General",
    modeOfTransport: "Air",
    shipmentType: "House",
    cargoType: "",
    incoterms: "",
    rateBasis: "Weight",
    baseRate: 0,
    minimumCharge: 0,
    maximumCharge: null,
    fuelSurchargeRate: 0,
    handlingCharge: 0,
    pickupCharge: 0,
    deliveryCharge: 0,
    customsCharge: 0,
    documentationCharge: 0,
    warehouseCharge: 0,
    destinationCharge: 0,
    agentCommissionRate: 0,
    validFromDate: "",
    validToDate: "",
    currencyId: "",
    isTaxApplicable: false,
    taxRate: 0,
    isActive: true,
    slabs: [],
    charges: []
  });
  const selectedCurrency = useMemo(() => (currencies.data ?? []).find((x) => x.id === value.currencyId), [currencies.data, value.currencyId]);

  const submit = async () => {
    const parsed = createRateMasterSchema(r).safeParse(value);
    if (!parsed.success) {
      toast.error(r("Validation failed"), parsed.error.issues[0]?.message ?? r("Please fix invalid values."));
      return;
    }
    await onSubmit(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button className={masterDataButtonClass} type="button" variant={tab === "core" ? "default" : "outline"} onClick={() => setTab("core")}>{r("Core")}</Button>
        <Button className={masterDataButtonClass} type="button" variant={tab === "charges" ? "default" : "outline"} onClick={() => setTab("charges")}>{r("Charges")}</Button>
      </div>
      {tab === "core" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={r("Rate Code")}><Input value={value.rateCode} onChange={(e) => setValue({ ...value, rateCode: e.target.value })} /></Field>
          <Field label={r("Rate Name")}><Input value={value.rateName} onChange={(e) => setValue({ ...value, rateName: e.target.value })} /></Field>
          <Field label={r("Rate Scope")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.rateScope} onChange={(e) => setValue({ ...value, rateScope: e.target.value, customerId: null, vendorId: null, agentId: null })}>{rateScopes.map((x) => <option key={x} value={x}>{r(x)}</option>)}</select></Field>
          {value.rateScope === "Customer" ? <Field label={r("Customer")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.customerId ?? ""} onChange={(e) => setValue({ ...value, customerId: e.target.value || null })}><option value="">{r("Select customer")}</option>{(customers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.customerCode} - {x.customerName}</option>)}</select></Field> : null}
          {value.rateScope === "Vendor" ? <Field label={r("Vendor")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.vendorId ?? ""} onChange={(e) => setValue({ ...value, vendorId: e.target.value || null })}><option value="">{r("Select vendor")}</option>{(vendors.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.vendorCode} - {x.vendorName}</option>)}</select></Field> : null}
          {value.rateScope === "Agent" ? <Field label={r("Agent")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.agentId ?? ""} onChange={(e) => setValue({ ...value, agentId: e.target.value || null })}><option value="">{r("Select agent")}</option>{(agents.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.agentCode} - {x.agentName}</option>)}</select></Field> : null}
          <Field label={r("Origin Port")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={value.origin ?? ""} onChange={(e) => setValue({ ...value, origin: e.target.value })}>
              <option value="">{r("Select origin port")}</option>
              {currentValueOption(value.origin, (shippingPorts.data ?? []).map((x) => x.portName))}
              {(shippingPorts.data ?? []).map((x) => <option key={x.id} value={x.portName}>{x.portCode} - {x.portName} - {x.countryName}</option>)}
            </select>
          </Field>
          <Field label={r("Destination Port")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={value.destination ?? ""} onChange={(e) => setValue({ ...value, destination: e.target.value })}>
              <option value="">{r("Select destination port")}</option>
              {currentValueOption(value.destination, (shippingPorts.data ?? []).map((x) => x.portName))}
              {(shippingPorts.data ?? []).map((x) => <option key={x.id} value={x.portName}>{x.portCode} - {x.portName} - {x.countryName}</option>)}
            </select>
          </Field>
          <Field label={r("Country")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={value.country ?? ""} onChange={(e) => setValue({ ...value, country: e.target.value })}>
              <option value="">{r("Select country")}</option>
              {currentValueOption(value.country, (countries.data ?? []).map((x) => x.name))}
              {(countries.data ?? []).map((x) => <option key={x.id} value={x.name}>{x.countryCode} - {x.name}</option>)}
            </select>
          </Field>
          <Field label={r("City")}><Input value={value.city ?? ""} onChange={(e) => setValue({ ...value, city: e.target.value })} /></Field>
          <Field label={r("Zone")}><Input value={value.zone ?? ""} onChange={(e) => setValue({ ...value, zone: e.target.value })} /></Field>
          <Field label={r("Mode of Transport")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.modeOfTransport} onChange={(e) => setValue({ ...value, modeOfTransport: e.target.value })}>{modes.map((x) => <option key={x} value={x}>{r(x)}</option>)}</select></Field>
          <Field label={r("Shipment Type")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.shipmentType} onChange={(e) => setValue({ ...value, shipmentType: e.target.value })}>{shipmentTypes.map((x) => <option key={x} value={x}>{r(x)}</option>)}</select></Field>
          <Field label={r("Rate Basis")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.rateBasis} onChange={(e) => setValue({ ...value, rateBasis: e.target.value })}>{value.rateBasis === "Slab" ? <option value="Slab" disabled>{r("Slab (legacy)")}</option> : null}{rateBasis.map((x) => <option key={x} value={x}>{r(x)}</option>)}</select></Field>
          <Field label={r("Minimum Charge")}><Input type="number" min="0" value={value.minimumCharge} onChange={(e) => setValue({ ...value, minimumCharge: Number(e.target.value) })} /></Field>
          <Field label={r("Maximum Charge")}><Input type="number" min="0" value={value.maximumCharge ?? ""} onChange={(e) => setValue({ ...value, maximumCharge: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
          <Field label={r("Valid From")}><Input type="date" value={value.validFromDate} onChange={(e) => setValue({ ...value, validFromDate: e.target.value })} /></Field>
          <Field label={r("Valid To")}><Input type="date" value={value.validToDate} onChange={(e) => setValue({ ...value, validToDate: e.target.value })} /></Field>
          <Field label={r("Currency")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.currencyId} onChange={(e) => setValue({ ...value, currencyId: e.target.value })}><option value="">{r("Select currency")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode} - {x.currencyName}</option>)}</select></Field>
          <Field label={r("Tax Applicable")}><div className="flex h-10 items-center gap-3"><Switch checked={value.isTaxApplicable} onCheckedChange={(checked) => setValue({ ...value, isTaxApplicable: checked })} /><span className="text-sm text-muted-foreground">{r(value.isTaxApplicable ? "Applicable" : "Not applicable")}</span></div></Field>
          <Field label={r("Tax Rate")}><Input type="number" min="0" value={value.taxRate} onChange={(e) => setValue({ ...value, taxRate: Number(e.target.value) })} /></Field>
          <Field label={r("Status")}><div className="flex h-10 items-center gap-3"><Switch checked={value.isActive} onCheckedChange={(checked) => setValue({ ...value, isActive: checked })} /><span className="text-sm text-muted-foreground">{r(value.isActive ? "Active" : "Inactive")}</span></div></Field>
        </div>
      ) : null}
      {tab === "charges" ? <RateMasterChargesTab value={value.charges} onChange={(charges) => setValue({ ...value, charges })} /> : null}
      {selectedCurrency ? <p className="text-xs text-muted-foreground">{r("Currency Conversion Display")}: {r("Rates and charges are stored in")} {selectedCurrency.currencyCode}.</p> : null}
      <Button className={masterDataButtonClass} onClick={() => void submit()} disabled={isSubmitting}>{r(isSubmitting ? "Saving..." : "Save Rate Master")}</Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function currentValueOption(value: string | null | undefined, activeValues: string[]) {
  if (!value || activeValues.includes(value)) return null;
  return <option value={value}>{value}</option>;
}
