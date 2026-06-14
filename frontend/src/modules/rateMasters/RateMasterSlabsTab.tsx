import { Plus, Trash2 } from "lucide-react";
import type { RateMasterSlabRequest } from "@/api/rateMasterApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRateMasterI18n } from "@/modules/rateMasters/rateMasterI18n";
import { masterDataButtonClass } from "@/modules/masterDataUi";

export function RateMasterSlabsTab({
  value,
  onChange,
  readOnly = false
}: {
  value: RateMasterSlabRequest[];
  onChange: (value: RateMasterSlabRequest[]) => void;
  readOnly?: boolean;
}) {
  const r = useRateMasterI18n();
  const rows = value;
  return (
    <div className="space-y-3">
      {readOnly ? null : <div className="flex justify-end">
        <Button className={masterDataButtonClass} type="button" variant="outline" onClick={() => onChange([...rows, { fromValue: 0, toValue: 0, rate: 0, minimumCharge: null, maximumCharge: null }])}>
          <Plus className="h-4 w-4" /> {r("Add Slab")}
        </Button>
      </div>}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-start">{r("From")}</th>
              <th className="p-2 text-start">{r("To")}</th>
              <th className="p-2 text-start">{r("Rate")}</th>
              <th className="p-2 text-start">{r("Min")}</th>
              <th className="p-2 text-start">{r("Max")}</th>
              <th className="p-2 text-end">{r("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t">
                <td className="p-2"><Input type="number" min="0" disabled={readOnly} value={row.fromValue} onChange={(e) => update(rows, index, "fromValue", Number(e.target.value), onChange)} /></td>
                <td className="p-2"><Input type="number" min="0" disabled={readOnly} value={row.toValue} onChange={(e) => update(rows, index, "toValue", Number(e.target.value), onChange)} /></td>
                <td className="p-2"><Input type="number" min="0" disabled={readOnly} value={row.rate} onChange={(e) => update(rows, index, "rate", Number(e.target.value), onChange)} /></td>
                <td className="p-2"><Input type="number" min="0" disabled={readOnly} value={row.minimumCharge ?? ""} onChange={(e) => update(rows, index, "minimumCharge", e.target.value === "" ? null : Number(e.target.value), onChange)} /></td>
                <td className="p-2"><Input type="number" min="0" disabled={readOnly} value={row.maximumCharge ?? ""} onChange={(e) => update(rows, index, "maximumCharge", e.target.value === "" ? null : Number(e.target.value), onChange)} /></td>
                <td className="p-2 text-end">{readOnly ? null : <Button className={masterDataButtonClass} title={r("Delete")} type="button" variant="ghost" size="sm" onClick={() => onChange(rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-red-600" /></Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function update(
  rows: RateMasterSlabRequest[],
  index: number,
  key: keyof RateMasterSlabRequest,
  value: number | null,
  onChange: (value: RateMasterSlabRequest[]) => void
) {
  const next = [...rows];
  next[index] = { ...next[index], [key]: value } as RateMasterSlabRequest;
  onChange(next);
}
