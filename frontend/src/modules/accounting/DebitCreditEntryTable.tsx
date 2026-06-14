import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VoucherLine } from "@/api/accountingApi";
import { lt } from "@/modules/operationsLocalization";

export function DebitCreditEntryTable({
  lines, accounts, currencies, onChange, onAdd, onRemove
}: {
  lines: VoucherLine[];
  accounts: Array<{ id: string; name: string }>;
  currencies: Array<{ id: string; code: string }>;
  onChange: (lines: VoucherLine[]) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return <div className="space-y-2">
    <div className="flex items-center justify-between"><h3 className="font-medium">{lt("Debit/Credit Entries")}</h3><Button variant="outline" onClick={onAdd}>{lt("Add Row")}</Button></div>
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("Account")}</th><th className="p-2 text-left">{lt("Currency")}</th><th className="p-2 text-left">{lt("Ex Rate")}</th><th className="p-2 text-left">{lt("Debit")}</th><th className="p-2 text-left">{lt("Credit")}</th><th className="p-2 text-left">{lt("Base Debit")}</th><th className="p-2 text-left">{lt("Base Credit")}</th><th className="p-2 text-left">{lt("Narration")}</th><th className="p-2 text-right">{lt("Action")}</th></tr></thead>
        <tbody>{lines.map((line, i) => <tr key={line.id} className="border-t"><td className="p-2"><select className="h-10 w-full rounded-md border px-2 text-sm" value={line.accountId} onChange={(e) => set(lines, i, "accountId", e.target.value, onChange)}><option value="">{lt("Select account")}</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></td><td className="p-2"><select className="h-10 w-full rounded-md border px-2 text-sm" value={line.currencyId} onChange={(e) => set(lines, i, "currencyId", e.target.value, onChange)}><option value="">{lt("Select currency")}</option>{currencies.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</select></td><td className="p-2"><Input aria-label={lt("Exchange Rate")} placeholder={lt("Exchange rate")} type="number" min="0" value={line.exchangeRate} onChange={(e) => set(lines, i, "exchangeRate", Number(e.target.value), onChange)} /></td><td className="p-2"><Input aria-label={lt("Debit Amount")} placeholder={lt("Debit amount")} type="number" min="0" value={line.debit} onChange={(e) => updateAmount(lines, i, "debit", Number(e.target.value), onChange)} /></td><td className="p-2"><Input aria-label={lt("Credit Amount")} placeholder={lt("Credit amount")} type="number" min="0" value={line.credit} onChange={(e) => updateAmount(lines, i, "credit", Number(e.target.value), onChange)} /></td><td className="p-2"><Input aria-label={lt("Base Debit")} value={line.baseDebit.toFixed(2)} disabled /></td><td className="p-2"><Input aria-label={lt("Base Credit")} value={line.baseCredit.toFixed(2)} disabled /></td><td className="p-2"><Input placeholder={lt("Enter line narration")} value={line.narration ?? ""} onChange={(e) => set(lines, i, "narration", e.target.value, onChange)} /></td><td className="p-2 text-right"><Button aria-label={lt("Delete Row")} title={lt("Delete Row")} variant="ghost" size="sm" onClick={() => onRemove(line.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button></td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}

function set(lines: VoucherLine[], i: number, key: keyof VoucherLine, value: string | number, onChange: (lines: VoucherLine[]) => void) {
  const next = [...lines];
  next[i] = { ...next[i], [key]: value } as VoucherLine;
  onChange(next);
}
function updateAmount(lines: VoucherLine[], i: number, key: "debit" | "credit", value: number, onChange: (lines: VoucherLine[]) => void) {
  const next = [...lines];
  const row = { ...next[i] };
  if (key === "debit") { row.debit = Math.max(0, value); if (value > 0) row.credit = 0; }
  else { row.credit = Math.max(0, value); if (value > 0) row.debit = 0; }
  row.baseDebit = row.debit * row.exchangeRate;
  row.baseCredit = row.credit * row.exchangeRate;
  next[i] = row;
  onChange(next);
}
