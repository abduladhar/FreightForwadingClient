import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBranchCurrencyBankDetails, setBranchCurrencyBankDetails } from "@/api/branchApi";
import { getCurrencies } from "@/api/currencyApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/modules/operationsLocalization";
import type { BranchCurrencyBankDetail, BranchCurrencyBankDetailRequest, Currency } from "@/types/currency";

export function BranchBankDetailsPanel({ branchId, branchName }: { branchId: string; branchName: string }) {
  const queryClient = useQueryClient();
  const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);
  const currencies = useQuery({ queryKey: ["currencies", "branch-bank-details"], queryFn: getCurrencies });
  const details = useQuery({ queryKey: ["branch-currency-bank-details", branchId], queryFn: () => getBranchCurrencyBankDetails(branchId) });
  const save = useMutation({
    mutationFn: ({ currencyId, request }: { currencyId: string; request: BranchCurrencyBankDetailRequest }) =>
      setBranchCurrencyBankDetails(branchId, currencyId, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branch-currency-bank-details", branchId] });
      setEditingCurrencyId(null);
    }
  });
  const availableCurrencies = (currencies.data ?? []).filter((currency) => currency.isActive);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-semibold">{lt("Currency Bank Details")}</h2>
          <p className="text-sm text-muted-foreground">{lt("Configure separate bank details for any currency used by this branch.")} {branchName}</p>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b bg-slate-50"><th className="px-3 py-2 text-left">{lt("Currency")}</th><th className="px-3 py-2 text-left">{lt("Bank Name")}</th><th className="px-3 py-2 text-left">{lt("Account No")}</th><th className="px-3 py-2 text-right">{lt("Action")}</th></tr></thead>
            <tbody>
              {availableCurrencies.map((currency) => {
                const detail = (details.data ?? []).find((item) => item.currencyId === currency.id);
                return (
                  <BranchCurrencyRow
                    key={currency.id}
                    currency={currency}
                    detail={detail}
                    isEditing={editingCurrencyId === currency.id}
                    isSaving={save.isPending}
                    onToggle={() => setEditingCurrencyId((current) => current === currency.id ? null : currency.id)}
                    onSave={(request) => save.mutateAsync({ currencyId: currency.id, request }).then(() => undefined)}
                  />
                );
              })}
              {!availableCurrencies.length ? <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">{lt("No active currencies are available.")}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function BranchCurrencyRow({ currency, detail, isEditing, isSaving, onToggle, onSave }: {
  currency: Currency;
  detail?: BranchCurrencyBankDetail;
  isEditing: boolean;
  isSaving: boolean;
  onToggle: () => void;
  onSave: (request: BranchCurrencyBankDetailRequest) => Promise<void>;
}) {
  return (
    <>
      <tr className="border-b">
        <td className="px-3 py-2 font-medium">{currency.currencyCode} - {currency.currencyName}</td>
        <td className="px-3 py-2">{detail?.bankName || "-"}</td>
        <td className="px-3 py-2">{detail?.accountNumber || "-"}</td>
        <td className="px-3 py-2 text-right"><Button type="button" size="sm" variant="outline" onClick={onToggle}>{detail ? lt("Edit Bank Details") : lt("Add Bank Details")}</Button></td>
      </tr>
      {isEditing ? <tr className="border-b bg-slate-50/60"><td colSpan={4} className="p-4"><BankDetailForm currency={currency} initialValue={detail} isSaving={isSaving} onCancel={onToggle} onSave={onSave} /></td></tr> : null}
    </>
  );
}

function BankDetailForm({ currency, initialValue, isSaving, onCancel, onSave }: {
  currency: Currency;
  initialValue?: BranchCurrencyBankDetail;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (request: BranchCurrencyBankDetailRequest) => Promise<void>;
}) {
  const [value, setValue] = useState<BranchCurrencyBankDetailRequest>({
    currencyId: currency.id,
    beneficiaryName: initialValue?.beneficiaryName ?? "",
    bankName: initialValue?.bankName ?? "",
    branchName: initialValue?.branchName ?? "",
    swiftCode: initialValue?.swiftCode ?? "",
    accountNumber: initialValue?.accountNumber ?? "",
    iban: initialValue?.iban ?? ""
  });
  const set = (key: keyof BranchCurrencyBankDetailRequest, next: string) => setValue((current) => ({ ...current, [key]: next }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{currency.currencyCode} {lt("Bank Details")}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BankField label={lt("Beneficiary Name")} value={value.beneficiaryName} onChange={(next) => set("beneficiaryName", next)} />
        <BankField label={lt("Bank Name")} value={value.bankName} onChange={(next) => set("bankName", next)} />
        <BankField label={lt("Currency")} value={currency.currencyCode} readOnly />
        <BankField label={lt("Branch")} value={value.branchName} onChange={(next) => set("branchName", next)} />
        <BankField label={lt("Swift Code")} value={value.swiftCode} onChange={(next) => set("swiftCode", next)} />
        <BankField label={lt("Account No")} value={value.accountNumber} onChange={(next) => set("accountNumber", next)} />
        <BankField label={lt("IBAN")} value={value.iban} onChange={(next) => set("iban", next)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>{lt("Cancel")}</Button>
        <Button type="button" disabled={isSaving} onClick={() => void onSave(value)}>{isSaving ? lt("Saving...") : lt("Save Bank Details")}</Button>
      </div>
    </div>
  );
}

function BankField({ label, value, onChange, readOnly }: { label: string; value: string; onChange?: (value: string) => void; readOnly?: boolean }) {
  return <div className="space-y-1"><Label>{label}</Label><Input value={value} readOnly={readOnly} className={readOnly ? "bg-slate-100" : ""} onChange={(event) => onChange?.(event.target.value)} /></div>;
}
