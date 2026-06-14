import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { searchLedgerAccounts, type ChargeHeadRequest } from "@/api/chargeHeadApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function ChargeHeadForm({
  initialValue,
  onSubmit,
  isSubmitting
}: {
  initialValue?: ChargeHeadRequest | null;
  onSubmit: (value: ChargeHeadRequest) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const m = useMasterDataI18n("ChargeHead");
  const [value, setValue] = useState<ChargeHeadRequest>(initialValue ?? { mappingKey: "", mappingName: "", ledgerAccountId: "", sourceModule: "Invoice", isActive: true });
  const ledgers = useQuery({ queryKey: ["charge-head-ledgers"], queryFn: () => searchLedgerAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label={m("Charge Key")}><Input value={value.mappingKey} onChange={(e) => setValue({ ...value, mappingKey: e.target.value })} /></Field>
    <Field label={m("Charge Name")}><Input value={value.mappingName} onChange={(e) => setValue({ ...value, mappingName: e.target.value })} /></Field>
    <Field label={m("Source Module")}><Input value={value.sourceModule} onChange={(e) => setValue({ ...value, sourceModule: e.target.value })} /></Field>
    <Field label={m("Ledger Account")}>
      <select className="h-10 w-full rounded-md border px-3 text-sm" value={value.ledgerAccountId} onChange={(e) => setValue({ ...value, ledgerAccountId: e.target.value })}>
        <option value="">{m("Select Ledger")}</option>
        {(ledgers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.ledgerCode} - {x.ledgerName}</option>)}
      </select>
    </Field>
    <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({ ...value, isActive: e.target.checked })} /> {m("Active")}</label>
    <div className="md:col-span-2"><Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? m("Saving") : m("Save Charge Head")}</Button></div>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
