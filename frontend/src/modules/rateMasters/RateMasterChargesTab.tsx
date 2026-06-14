import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getActiveChargeHeadsForDropdown } from "@/api/chargeHeadApi";
import type { RateMasterChargeRangeRequest, RateMasterChargeRequest } from "@/api/rateMasterApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRateMasterI18n } from "@/modules/rateMasters/rateMasterI18n";
import { masterDataButtonClass } from "@/modules/masterDataUi";

const rangeBases = ["Weight", "Volume", "Pieces", "ChargeableWeight", "Distance"];

export function RateMasterChargesTab({
  value,
  onChange,
  readOnly = false
}: {
  value: RateMasterChargeRequest[];
  onChange: (value: RateMasterChargeRequest[]) => void;
  readOnly?: boolean;
}) {
  const r = useRateMasterI18n();
  const chargeHeads = useQuery({
    queryKey: ["rate-master-charge-heads"],
    queryFn: () => getActiveChargeHeadsForDropdown("", "Invoice")
  });

  function addCharge() {
    onChange([...value, {
      chargeHeadGuid: null,
      chargeCode: "",
      chargeName: "",
      chargeType: "Range",
      rangeBasis: "ChargeableWeight",
      amount: 0,
      percentage: 0,
      isTaxApplicable: false,
      isActive: true,
      ranges: []
    }]);
  }

  function updateCharge(index: number, patch: Partial<RateMasterChargeRequest>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {readOnly ? null : (
        <div className="flex justify-end">
          <Button className={masterDataButtonClass} type="button" variant="outline" onClick={addCharge}><Plus className="h-4 w-4" /> {r("Add Charge Head")}</Button>
        </div>
      )}
      {value.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{r("No charge heads configured.")}</div> : null}
      {value.map((charge, index) => (
        <section key={`${charge.chargeHeadGuid ?? charge.chargeCode}-${index}`} className="rounded-lg border bg-white">
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[minmax(300px,1.5fr)_180px_110px_110px_48px] xl:items-end">
            <Field label={r("Charge Head")}>
              <select
                disabled={readOnly}
                className="h-10 w-full rounded-md border px-3 text-sm"
                value={charge.chargeHeadGuid ?? ""}
                onChange={(event) => {
                  const selected = (chargeHeads.data ?? []).find((x) => x.id === event.target.value);
                  updateCharge(index, {
                    chargeHeadGuid: selected?.id ?? null,
                    chargeCode: selected?.mappingKey ?? "",
                    chargeName: selected?.mappingName ?? ""
                  });
                }}
              >
                <option value="">{r("Select charge head")}</option>
                {charge.chargeHeadGuid && !(chargeHeads.data ?? []).some((x) => x.id === charge.chargeHeadGuid) ? <option value={charge.chargeHeadGuid}>{charge.chargeCode} - {charge.chargeName} ({r("Inactive")})</option> : null}
                {(chargeHeads.data ?? []).map((head) => <option key={head.id} value={head.id}>{head.mappingKey} - {head.mappingName}</option>)}
              </select>
            </Field>
            <Field label={r("Slab Basis")}>
              <select disabled={readOnly} className="h-10 w-full rounded-md border px-3 text-sm" value={charge.rangeBasis} onChange={(event) => updateCharge(index, { rangeBasis: event.target.value, chargeType: "Range" })}>
                {rangeBases.map((basis) => <option key={basis} value={basis}>{r(basis)}</option>)}
              </select>
            </Field>
            <Field label={r("Tax")}><label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm"><input disabled={readOnly} type="checkbox" checked={charge.isTaxApplicable} onChange={(event) => updateCharge(index, { isTaxApplicable: event.target.checked })} /> {r("Applicable")}</label></Field>
            <Field label={r("Active")}><label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm"><input disabled={readOnly} type="checkbox" checked={charge.isActive} onChange={(event) => updateCharge(index, { isActive: event.target.checked })} /> {r("Active")}</label></Field>
            {readOnly ? null : <Button className={masterDataButtonClass} title={r("Delete")} type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="h-4 w-4 text-red-600" /></Button>}
          </div>
          <ChargeSlabs
            value={charge.ranges ?? []}
            readOnly={readOnly}
            r={r}
            onChange={(ranges) => updateCharge(index, { ranges, chargeType: "Range" })}
          />
        </section>
      ))}
    </div>
  );
}

function ChargeSlabs({ value, onChange, readOnly, r }: { value: RateMasterChargeRangeRequest[]; onChange: (value: RateMasterChargeRangeRequest[]) => void; readOnly: boolean; r: (value: string) => string }) {
  function updateRange(index: number, patch: Partial<RateMasterChargeRangeRequest>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <div className="border-t bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">{r("Slab Rates")}</h4>
          <p className="text-xs text-muted-foreground">{r("Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.")}</p>
        </div>
        {readOnly ? null : <Button className={masterDataButtonClass} type="button" size="sm" variant="outline" onClick={() => onChange([...value, { fromValue: 0, toValue: null, rate: 0, minimumCharge: null, maximumCharge: null }])}><Plus className="h-4 w-4" /> {r("Add Slab")}</Button>}
      </div>
      <div className="overflow-auto rounded-md border bg-white">
        <table className="min-w-[760px] w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="p-2 text-start">{r("From")}</th><th className="p-2 text-start">{r("To / Above")}</th><th className="p-2 text-start">{r("Rate Per Unit")}</th><th className="p-2 text-start">{r("Minimum")}</th><th className="p-2 text-start">{r("Maximum")}</th><th className="p-2 text-end">{r("Action")}</th></tr>
          </thead>
          <tbody>
            {value.map((range, index) => (
              <tr key={index} className="border-t">
                <td className="p-2"><Input disabled={readOnly} type="number" min="0" value={range.fromValue} onChange={(e) => updateRange(index, { fromValue: Number(e.target.value) })} /></td>
                <td className="p-2"><Input disabled={readOnly} type="number" min="0" placeholder={r("Above")} value={range.toValue ?? ""} onChange={(e) => updateRange(index, { toValue: e.target.value === "" ? null : Number(e.target.value) })} /></td>
                <td className="p-2"><Input disabled={readOnly} type="number" min="0" value={range.rate} onChange={(e) => updateRange(index, { rate: Number(e.target.value) })} /></td>
                <td className="p-2"><Input disabled={readOnly} type="number" min="0" value={range.minimumCharge ?? ""} onChange={(e) => updateRange(index, { minimumCharge: e.target.value === "" ? null : Number(e.target.value) })} /></td>
                <td className="p-2"><Input disabled={readOnly} type="number" min="0" value={range.maximumCharge ?? ""} onChange={(e) => updateRange(index, { maximumCharge: e.target.value === "" ? null : Number(e.target.value) })} /></td>
                <td className="p-2 text-end">{readOnly ? null : <Button className={masterDataButtonClass} title={r("Delete")} type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="h-4 w-4 text-red-600" /></Button>}</td>
              </tr>
            ))}
            {value.length === 0 ? <tr><td colSpan={6} className="p-5 text-center text-muted-foreground">{r("Add at least one non-overlapping slab for this charge head.")}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs font-semibold uppercase text-slate-600">{label}</Label>{children}</div>;
}
