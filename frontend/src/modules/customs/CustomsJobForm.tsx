import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCustomsConfigurations, type CustomsClearanceJobDto, type CustomsClearanceJobRequest } from "@/api/customsApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { CreateCustomerButton } from "@/components/common/CreateCustomerButton";
import { lt } from "@/modules/operationsLocalization";

const emptyGuid = "00000000-0000-0000-0000-000000000000";

export function buildCustomsJobInitialValue(job?: CustomsClearanceJobDto | null): CustomsClearanceJobRequest {
  const today = toLocalDateTimeInput(new Date());
  return {
    clearanceType: job?.clearanceType ?? "Import",
    shipmentType: job?.shipmentType ?? "CustomsClearance",
    shipmentId: job?.shipmentId ?? emptyGuid,
    shipmentReferenceNo: job?.shipmentReferenceNo ?? "",
    customerId: job?.customerId ?? null,
    customerName: job?.customerName ?? "",
    customsBrokerId: job?.customsBrokerId ?? null,
    customsBrokerName: job?.customsBrokerName ?? "",
    modeOfTransport: job?.modeOfTransport ?? "Sea",
    originPort: job?.originPort ?? "",
    destinationPort: job?.destinationPort ?? "",
    incoterms: job?.incoterms ?? "",
    expectedClearanceDate: job?.expectedClearanceDate?.slice(0, 16) ?? today,
    remarks: job?.remarks ?? "",
    declaration: {
      declarationNumber: job?.declaration?.declarationNumber ?? "",
      declarationType: job?.declaration?.declarationType ?? "Import",
      declarationMode: job?.declaration?.declarationMode ?? "Online",
      hsCode: job?.declaration?.hsCode ?? "",
      customsOffice: job?.declaration?.customsOffice ?? "",
      declarationDate: job?.declaration?.declarationDate?.slice(0, 16) ?? today,
      remarks: job?.declaration?.remarks ?? ""
    }
  };
}

export function CustomsJobForm({ value, onChange, onSubmit, isSubmitting, submitPermission, submitLabel }: { value: CustomsClearanceJobRequest; onChange: (value: CustomsClearanceJobRequest) => void; onSubmit: () => void; isSubmitting?: boolean; submitPermission: string; submitLabel: string }) {
  const shippingPorts = useQuery({ queryKey: ["customs-job-shipping-ports"], queryFn: () => getActiveShippingPortsForDropdown() });
  const configurations = useQuery({ queryKey: ["customs-job-configurations"], queryFn: () => searchCustomsConfigurations({ pageNumber: 1, pageSize: 200 }) });
  const declaration = value.declaration ?? { declarationType: "Import" };
  const set = (patch: Partial<CustomsClearanceJobRequest>) => onChange({ ...value, ...patch });
  const setDeclaration = (patch: NonNullable<CustomsClearanceJobRequest["declaration"]>) => onChange({ ...value, declaration: { ...declaration, ...patch } });
  const portOptions = useMemo(() => (shippingPorts.data ?? []).map((x) => {
    const label = `${x.portCode} - ${x.portName} - ${x.countryName}`;
    return { value: label, label };
  }), [shippingPorts.data]);
  const incotermOptions = useMemo(() => (configurations.data?.items ?? [])
    .filter((x) => x.isActive && x.configurationType.toLowerCase() === "incoterms")
    .map((x) => ({ value: x.code, label: `${x.code} - ${x.name}` })), [configurations.data?.items]);

  return <div className="space-y-5">
    <section className="rounded-lg border bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">{lt("Job Information")}</h3>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label={lt("Clearance Type")} required><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.clearanceType} onChange={(e) => set({ clearanceType: e.target.value, declaration: { ...declaration, declarationType: e.target.value } })}><option value="Import">{lt("Import")}</option><option value="Export">{lt("Export")}</option><option value="Transit">{lt("Transit")}</option><option value="ReExport">{lt("ReExport")}</option></select></Field>
        <Field label={lt("Reference No")}><Input value={value.shipmentReferenceNo ?? ""} onChange={(e) => set({ shipmentReferenceNo: e.target.value })} /></Field>
        <Field label={lt("Customer")}>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <CustomerAutocomplete
                value={value.customerId ?? ""}
                onChange={(customer) => set({
                  customerId: customer?.id ?? null,
                  customerName: customer?.customerName ?? ""
                })}
              />
            </div>
            <CreateCustomerButton />
          </div>
        </Field>
        <Field label={lt("Customs Broker")}><Input value={value.customsBrokerName ?? ""} onChange={(e) => set({ customsBrokerName: e.target.value })} /></Field>
        <Field label={lt("Mode of Transport")} required><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.modeOfTransport} onChange={(e) => set({ modeOfTransport: e.target.value })}><option value="Air">{lt("Air")}</option><option value="Sea">{lt("Sea")}</option><option value="Road">{lt("Road")}</option><option value="Courier">{lt("Courier")}</option></select></Field>
        <Field label={lt("Incoterms")}>
          <FilterableSelect value={value.incoterms ?? ""} onChange={(next) => set({ incoterms: next })} placeholder={lt("Select incoterm")} options={incotermOptions} />
        </Field>
        <Field label={lt("Origin Port")}>
          <FilterableSelect value={value.originPort ?? ""} onChange={(next) => set({ originPort: next })} placeholder={lt("Select origin port")} options={portOptions} />
        </Field>
        <Field label={lt("Destination Port")}>
          <FilterableSelect value={value.destinationPort ?? ""} onChange={(next) => set({ destinationPort: next })} placeholder={lt("Select destination port")} options={portOptions} />
        </Field>
        <Field label={lt("Expected Clearance")}><Input type="datetime-local" value={value.expectedClearanceDate ?? ""} onChange={(e) => set({ expectedClearanceDate: e.target.value })} /></Field>
        <Field label={lt("Remarks")}><Input value={value.remarks ?? ""} onChange={(e) => set({ remarks: e.target.value })} /></Field>
      </div>
    </section>
    <section className="rounded-lg border bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">{lt("Declaration")}</h3>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label={lt("Declaration No")}><Input value={declaration.declarationNumber ?? ""} onChange={(e) => setDeclaration({ ...declaration, declarationNumber: e.target.value })} /></Field>
        <Field label={lt("Declaration Type")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={declaration.declarationType ?? "Import"} onChange={(e) => setDeclaration({ ...declaration, declarationType: e.target.value })}><option value="Import">{lt("Import")}</option><option value="Export">{lt("Export")}</option><option value="Transit">{lt("Transit")}</option><option value="ReExport">{lt("ReExport")}</option></select></Field>
        <Field label={lt("Declaration Mode")}><Input value={declaration.declarationMode ?? ""} onChange={(e) => setDeclaration({ ...declaration, declarationMode: e.target.value })} /></Field>
        <Field label={lt("HS Code")}><Input value={declaration.hsCode ?? ""} onChange={(e) => setDeclaration({ ...declaration, hsCode: e.target.value })} /></Field>
        <Field label={lt("Customs Office")}><Input value={declaration.customsOffice ?? ""} onChange={(e) => setDeclaration({ ...declaration, customsOffice: e.target.value })} /></Field>
        <Field label={lt("Declaration Date")}><Input type="datetime-local" value={declaration.declarationDate ?? ""} onChange={(e) => setDeclaration({ ...declaration, declarationDate: e.target.value })} /></Field>
        <Field label={lt("Declaration Remarks")}><Input value={declaration.remarks ?? ""} onChange={(e) => setDeclaration({ ...declaration, remarks: e.target.value })} /></Field>
      </div>
    </section>
    <PermissionButton permission={submitPermission} onClick={onSubmit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</PermissionButton>
  </div>;
}

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return <div className="space-y-1"><Label className="text-xs uppercase text-slate-600">{label}{required ? <RequiredMark /> : null}</Label>{children}</div>;
}

function RequiredMark() {
  return <span className="ml-1 text-red-600">*</span>;
}

function FilterableSelect({ value, onChange, placeholder, options }: { value: string; onChange: (value: string) => void; placeholder: string; options: Array<{ value: string; label: string }> }) {
  const listId = useId();
  const [text, setText] = useState("");

  useEffect(() => {
    const selected = options.find((x) => x.value === value);
    setText(selected?.label ?? value ?? "");
  }, [value, options]);

  return (
    <div className="space-y-1">
      <Input
        list={listId}
        value={text}
        placeholder={placeholder}
        onChange={(event) => {
          const nextText = event.target.value;
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

function toLocalDateTimeInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
