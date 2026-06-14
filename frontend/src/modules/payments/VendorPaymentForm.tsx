import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { getBankAccounts, getCashAccounts } from "@/api/accountingApi";
import { getCurrencies, getExchangeRates, getTenantCurrencies } from "@/api/currencyApi";
import type { PendingBillDto } from "@/api/reconciliationApi";
import { getPendingBills } from "@/api/reconciliationApi";
import type { VendorPaymentAllocationRequest, VendorPaymentRequest } from "@/api/paymentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { LedgerPostingPreview } from "@/components/common/LedgerPostingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/hooks/useWorkspace";
import { FinancePartyAutocomplete, type FinancePartyLookup } from "@/components/common/FinancePartyAutocomplete";
import { lt } from "@/modules/operationsLocalization";

type ComboboxOption = { value: string; label: string };
type PartyType = "Customer" | "Vendor" | "Agent" | "Carrier";

const partyTypeOptions: ComboboxOption[] = [
  { value: "Customer", label: lt("Customer") },
  { value: "Vendor", label: lt("Vendor") },
  { value: "Agent", label: lt("Agent") },
  { value: "Carrier", label: lt("Carrier") }
];

const emptyPayment = (): VendorPaymentRequest => ({
  vendorId: "",
  paidToPartyType: "Vendor",
  paidToPartyId: null,
  paidToPartyName: null,
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentCurrencyId: "",
  baseCurrencyId: "",
  exchangeRate: 1,
  paymentAmount: 0,
  bankCharges: 0,
  isAdvancePayment: false,
  bankAccountId: null,
  cashAccountId: null,
  remarks: null,
  allocations: []
});

export function VendorPaymentForm({ initialValue, onSubmit, isSubmitting }: { initialValue?: VendorPaymentRequest | null; onSubmit: (value: VendorPaymentRequest) => Promise<void>; isSubmitting?: boolean }) {
  const toast = useToast();
  const workspace = useWorkspace();
  const [value, setValue] = useState<VendorPaymentRequest>(initialValue ?? emptyPayment());
  const shouldApplyDefaultRateRef = useRef(!initialValue);

  useEffect(() => {
    if (!initialValue) return;
    setValue(initialValue);
  }, [initialValue]);

  const bankAccounts = useQuery({ queryKey: ["payment-bank-accounts"], queryFn: () => getBankAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const cashAccounts = useQuery({ queryKey: ["payment-cash-accounts"], queryFn: () => getCashAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const currencies = useQuery({ queryKey: ["payment-currencies"], queryFn: getCurrencies });
  const tenantCurrencies = useQuery({ queryKey: ["payment-currencies", "tenant-enabled"], queryFn: getTenantCurrencies });

  const partyType = (value.paidToPartyType || "Vendor") as PartyType;
  const localizedPartyTypeOptions = partyTypeOptions.map((option) => ({ ...option, label: lt(option.label) }));
  const enabledCurrencies = (tenantCurrencies.data ?? []).filter((currency) => currency.isEnabled);
  const baseCurrency = enabledCurrencies.find((currency) => currency.isBaseCurrency);
  const currencyById = useMemo(() => new Map((currencies.data ?? []).map((currency) => [currency.id, currency])), [currencies.data]);
  const currencyOptions = enabledCurrencies.map((currency) => {
    const master = currencyById.get(currency.currencyId);
    return {
      value: currency.currencyId,
      label: currencyDisplay(currency.currencyCode, master?.symbol, currency.currencyName)
    };
  });
  const selectedPartyId = value.paidToPartyId || value.vendorId;

  const pendingBills = useQuery({
    queryKey: ["payment-pending-bills", partyType, selectedPartyId],
    queryFn: () => getPendingBills(partyType === "Vendor" ? selectedPartyId : undefined, partyType, selectedPartyId),
    enabled: Boolean(selectedPartyId) && !value.isAdvancePayment
  });

  const billById = useMemo(() => new Map((pendingBills.data ?? []).map((x) => [x.vendorBillId, x])), [pendingBills.data]);
  const matchingPendingBills = useMemo(
    () => (pendingBills.data ?? []).filter((bill) => bill.billCurrencyId === value.paymentCurrencyId),
    [pendingBills.data, value.paymentCurrencyId]
  );
  const selectedBillIds = useMemo(() => new Set(value.allocations.map((x) => x.vendorBillId).filter(Boolean)), [value.allocations]);
  const allocatedTotal = useMemo(() => value.allocations.reduce((sum, x) => sum + x.allocatedAmount, 0), [value.allocations]);
  const remainingPaymentAmount = Math.max(0, value.paymentAmount - allocatedTotal);
  const allocationErrors = useMemo(() => validateAllocations(value.allocations, billById, value.paymentCurrencyId), [value.allocations, billById, value.paymentCurrencyId]);
  const paymentCurrency = currencyById.get(value.paymentCurrencyId);
  const selectedBaseCurrency = currencyById.get(value.baseCurrencyId);
  const paymentCurrencyLabel = currencyDisplay(paymentCurrency?.currencyCode ?? workspace.baseCurrency, paymentCurrency?.symbol);
  const baseCurrencyLabel = currencyDisplay(selectedBaseCurrency?.currencyCode ?? workspace.baseCurrency, selectedBaseCurrency?.symbol);
  const paymentCurrencyCode = paymentCurrency?.currencyCode ?? workspace.baseCurrency ?? "USD";
  const baseCurrencyCode = selectedBaseCurrency?.currencyCode ?? workspace.baseCurrency ?? paymentCurrencyCode;
  const baseAmount = roundMoney(value.paymentAmount * value.exchangeRate);
  const defaultRates = useQuery({
    queryKey: ["payment-default-exchange-rate", value.paymentCurrencyId, baseCurrency?.currencyId],
    queryFn: () => getExchangeRates(value.paymentCurrencyId, baseCurrency!.currencyId),
    enabled: Boolean(value.paymentCurrencyId && baseCurrency?.currencyId && value.paymentCurrencyId !== baseCurrency.currencyId)
  });
  const defaultRate = (defaultRates.data ?? []).find((rate) => rate.effectiveDate <= value.paymentDate);
  const canSubmit = Boolean(
    selectedPartyId &&
    value.paymentCurrencyId &&
    value.baseCurrencyId &&
    value.exchangeRate > 0 &&
    (value.isAdvancePayment ? value.allocations.length === 0 : value.allocations.length > 0 && allocatedTotal === value.paymentAmount && allocationErrors.length === 0)
  );

  const updateValue = (next: VendorPaymentRequest) => setValue(next);
  const setPartyType = (nextType: string) => {
    updateValue({ ...value, paidToPartyType: nextType, paidToPartyId: null, paidToPartyName: null, vendorId: "", allocations: [] });
  };
  const setParty = (party: FinancePartyLookup | null) => {
    const partyId = party?.id ?? "";
    const partyCurrencyId = party?.defaultCurrencyId && enabledCurrencies.some((currency) => currency.currencyId === party.defaultCurrencyId)
      ? party.defaultCurrencyId
      : baseCurrency?.currencyId ?? "";
    const isBaseCurrency = partyCurrencyId === baseCurrency?.currencyId;
    shouldApplyDefaultRateRef.current = Boolean(partyCurrencyId && !isBaseCurrency);
    updateValue({
      ...value,
      vendorId: partyId,
      paidToPartyId: partyId || null,
      paidToPartyName: party ? `${party.code} - ${party.name}` : null,
      paymentCurrencyId: partyCurrencyId,
      baseCurrencyId: baseCurrency?.currencyId ?? value.baseCurrencyId,
      exchangeRate: isBaseCurrency ? 1 : 0,
      allocations: []
    });
  };
  const addPendingBill = (bill: PendingBillDto) => {
    if (selectedBillIds.has(bill.vendorBillId)) return;
    if (bill.billCurrencyId !== value.paymentCurrencyId) {
      toast.error(lt("Currency mismatch"), lt("Bill currency must be the same as payment currency."));
      return;
    }
    const amount = Math.min(bill.outstandingAmount, remainingPaymentAmount || bill.outstandingAmount);
    updateValue({ ...value, allocations: [...value.allocations, { vendorBillId: bill.vendorBillId, allocatedAmount: roundMoney(amount) }] });
  };

  useEffect(() => {
    if (!enabledCurrencies.length || !baseCurrency?.currencyId) return;
    setValue((previous) => {
      const paymentCurrencyId = previous.paymentCurrencyId || baseCurrency.currencyId;
      const baseCurrencyId = previous.baseCurrencyId || baseCurrency.currencyId;
      if (paymentCurrencyId === previous.paymentCurrencyId && baseCurrencyId === previous.baseCurrencyId) return previous;
      return {
        ...previous,
        paymentCurrencyId,
        baseCurrencyId,
        exchangeRate: paymentCurrencyId === baseCurrency.currencyId ? 1 : previous.exchangeRate
      };
    });
  }, [baseCurrency?.currencyId, enabledCurrencies.length]);

  useEffect(() => {
    if (!defaultRate || !shouldApplyDefaultRateRef.current) return;
    shouldApplyDefaultRateRef.current = false;
    setValue((previous) => ({ ...previous, exchangeRate: defaultRate.rate }));
  }, [defaultRate, value.paymentCurrencyId]);

  return <div className="space-y-5">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label={lt("Paid To Type")}><FilterableSelect value={partyType} onChange={setPartyType} options={localizedPartyTypeOptions} placeholder={lt("Select party type")} /></Field>
      <Field label={lt("Paid To")}>
        <FinancePartyAutocomplete
          partyType={partyType}
          value={selectedPartyId}
          onChange={setParty}
          placeholder={`${lt("Search")} ${lt(partyType).toLowerCase()} ${lt("by name, code, or phone")}`}
        />
      </Field>
      <Field label={lt("Payment Date")}><Input type="date" value={value.paymentDate} onChange={(e) => {
        if (!initialValue && value.paymentCurrencyId !== baseCurrency?.currencyId) shouldApplyDefaultRateRef.current = true;
        updateValue({ ...value, paymentDate: e.target.value });
      }} /></Field>
      <Field label={`${lt("Payment Amount")} (${paymentCurrencyLabel})`}><Input type="number" min="0" value={value.paymentAmount} onChange={(e) => updateValue({ ...value, paymentAmount: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label={`${lt("Payment Currency")} (${paymentCurrencyLabel})`}><FilterableSelect value={value.paymentCurrencyId} onChange={() => undefined} options={currencyOptions} placeholder={lt("Select payment currency")} disabled /><div className="text-xs text-muted-foreground">{lt("Locked to the selected Paid To party currency.")}</div></Field>
      <Field label={`${lt("Base Currency")} (${baseCurrencyLabel})`}><FilterableSelect value={value.baseCurrencyId} onChange={() => undefined} options={currencyOptions} placeholder={lt("Tenant base currency")} disabled /></Field>
      <Field label={`${lt("Exchange Rate")} (${baseCurrencyCode} ${lt("per")} ${paymentCurrencyCode})`}>
        <Input type="number" min="0" value={value.exchangeRate} onChange={(e) => {
          shouldApplyDefaultRateRef.current = false;
          updateValue({ ...value, exchangeRate: Math.max(0, Number(e.target.value)) });
        }} />
        {value.paymentCurrencyId && value.paymentCurrencyId !== baseCurrency?.currencyId ? (
          <p className="text-xs text-muted-foreground">
            {defaultRates.isLoading
              ? lt("Loading saved default exchange rate...")
              : defaultRate
                ? `${lt("Default rate effective")} ${defaultRate.effectiveDate}: 1 ${paymentCurrencyCode} = ${defaultRate.rate} ${baseCurrencyCode}`
                : `${lt("No saved exchange rate exists on or before the payment date. Enter the payment rate manually.")} (${paymentCurrencyCode}/${baseCurrencyCode}, ${value.paymentDate})`}
          </p>
        ) : <p className="text-xs text-muted-foreground">{lt("Base currency payments use exchange rate 1.")}</p>}
      </Field>
      <Field label={`${lt("Base Amount")} (${baseCurrencyLabel})`}><Input value={baseAmount.toFixed(2)} readOnly className="bg-slate-50 font-medium" /></Field>
      <Field label={`${lt("Bank Charges")} (${paymentCurrencyLabel})`}><Input type="number" min="0" value={value.bankCharges} onChange={(e) => updateValue({ ...value, bankCharges: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label={lt("Bank Account")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.bankAccountId ?? ""} onChange={(e) => updateValue({ ...value, bankAccountId: e.target.value || null, cashAccountId: e.target.value ? null : value.cashAccountId })}><option value="">{lt("Select bank account")}</option>{(bankAccounts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.bankName} - {x.accountNumber}</option>)}</select></Field>
      <Field label={lt("Cash Account")}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.cashAccountId ?? ""} onChange={(e) => updateValue({ ...value, cashAccountId: e.target.value || null, bankAccountId: e.target.value ? null : value.bankAccountId })}><option value="">{lt("Select cash account")}</option>{(cashAccounts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.cashAccountName}</option>)}</select></Field>
      <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={value.isAdvancePayment} onChange={(e) => updateValue({ ...value, isAdvancePayment: e.target.checked, allocations: e.target.checked ? [] : value.allocations })} /> {lt("Advance Payment")}</label>
      <Field label={lt("Remarks")}><Input value={value.remarks ?? ""} onChange={(e) => updateValue({ ...value, remarks: e.target.value || null })} /></Field>
    </div>

    {!value.isAdvancePayment ? <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{lt("Pending Vendor Bills")}</h3>
          <span className="text-xs text-muted-foreground">{selectedPartyId ? `${matchingPendingBills.length} ${lt("matching bill(s)")}` : `${lt("Select")} ${lt(partyType).toLowerCase()}`}</span>
        </div>
        <div className="max-h-80 overflow-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-50"><tr><th className="p-2 text-left">{lt("Bill")}</th><th className="p-2 text-left">{lt("Party")}</th><th className="p-2 text-left">{lt("Bill Currency")}</th><th className="p-2 text-right">{lt("Outstanding")}</th><th className="p-2 text-right">{lt("Action")}</th></tr></thead>
            <tbody>
              {(pendingBills.data ?? []).map((bill) => {
                const billCurrency = currencyById.get(bill.billCurrencyId);
                const billCurrencyLabel = currencyDisplay(billCurrency?.currencyCode, billCurrency?.symbol);
                const currencyMatches = bill.billCurrencyId === value.paymentCurrencyId;
                return <tr key={bill.vendorBillId} className="border-t">
                <td className="p-2 font-medium">{bill.vendorBillNumber}</td>
                <td className="p-2">{bill.payToPartyName || lt(bill.payToPartyType)}</td>
                <td className="p-2"><div>{billCurrencyLabel}</div>{!currencyMatches ? <div className="text-xs text-red-600">{lt("Payment currency mismatch")}</div> : null}</td>
                <td className="p-2 text-right">{moneyWithCurrency(bill.outstandingAmount, billCurrency?.currencyCode, billCurrency?.symbol)}</td>
                <td className="p-2 text-right"><Button type="button" size="sm" variant="outline" disabled={selectedBillIds.has(bill.vendorBillId) || !currencyMatches} onClick={() => addPendingBill(bill)}>{selectedBillIds.has(bill.vendorBillId) ? lt("Added") : currencyMatches ? lt("Allocate") : lt("Blocked")}</Button></td>
              </tr>;
              })}
              {selectedPartyId && !pendingBills.isLoading && (pendingBills.data ?? []).length === 0 ? <tr><td className="p-4 text-center text-muted-foreground" colSpan={5}>{lt("No pending bills for this party.")}</td></tr> : null}
              {!selectedPartyId ? <tr><td className="p-4 text-center text-muted-foreground" colSpan={5}>{lt("Select a party to load pending bills.")}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between"><h3 className="font-medium">{lt("Payment Allocation")}</h3><Button type="button" variant="outline" onClick={() => updateValue({ ...value, allocations: [...value.allocations, { vendorBillId: "", allocatedAmount: 0 }] })}><Plus className="h-4 w-4" />{lt("Add Row")}</Button></div>
        <div className="overflow-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("Vendor Bill")}</th><th className="p-2 text-right">{lt("Outstanding")}</th><th className="p-2 text-left">{lt("Allocated Amount")}</th><th className="p-2 text-right">{lt("Action")}</th></tr></thead>
            <tbody>{value.allocations.map((row, i) => {
              const bill = billById.get(row.vendorBillId);
              return <tr key={`${row.vendorBillId || "new"}-${i}`} className="border-t"><td className="p-2"><select className="h-10 w-full min-w-52 rounded-md border px-3 text-sm" value={row.vendorBillId} onChange={(e) => setAllocation(value.allocations, i, "vendorBillId", e.target.value, (allocations) => updateValue({ ...value, allocations }))}><option value="">{lt("Select vendor bill")}</option>{matchingPendingBills.map((x) => <option key={x.vendorBillId} value={x.vendorBillId}>{x.vendorBillNumber}</option>)}</select></td><td className="p-2 text-right">{bill ? moneyWithCurrency(bill.outstandingAmount, currencyById.get(bill.billCurrencyId)?.currencyCode, currencyById.get(bill.billCurrencyId)?.symbol) : "-"}</td><td className="p-2"><Input type="number" min="0" value={row.allocatedAmount} onChange={(e) => setAllocation(value.allocations, i, "allocatedAmount", Math.max(0, Number(e.target.value)), (allocations) => updateValue({ ...value, allocations }))} /></td><td className="p-2 text-right"><Button type="button" variant="ghost" size="sm" onClick={() => updateValue({ ...value, allocations: value.allocations.filter((_, idx) => idx !== i) })}><Trash2 className="h-4 w-4 text-red-600" /></Button></td></tr>;
            })}{value.allocations.length === 0 ? <tr><td className="p-4 text-center text-muted-foreground" colSpan={4}>{lt("Add one or more bills to allocate this payment.")}</td></tr> : null}</tbody>
          </table>
        </div>
        <div className="grid gap-2 rounded-md bg-slate-50 p-3 text-sm md:grid-cols-3">
          <span>{lt("Payment")} ({paymentCurrencyLabel}): <strong>{value.paymentAmount.toFixed(2)}</strong></span>
          <span>{lt("Allocated")} ({paymentCurrencyLabel}): <strong>{allocatedTotal.toFixed(2)}</strong></span>
          <span className={remainingPaymentAmount === 0 ? "text-emerald-700" : "text-amber-700"}>{lt("Remaining")} ({paymentCurrencyLabel}): <strong>{remainingPaymentAmount.toFixed(2)}</strong></span>
        </div>
        {allocationErrors.map((error) => <p key={error} className="text-xs text-red-600">{error}</p>)}
        {value.allocations.length > 0 && allocatedTotal !== value.paymentAmount ? <p className="text-xs text-amber-700">{lt("Non-advance payments must be fully allocated to bills before save.")}</p> : null}
      </section>
    </div> : null}

    <LedgerPostingPreview lines={[{ id: "1", account: value.isAdvancePayment ? `${lt(partyType)} ${lt("Advance")}` : `${lt(partyType)} ${lt("Payable")}`, debit: value.paymentAmount + value.bankCharges, credit: 0, currency: paymentCurrencyCode }, { id: "2", account: lt("Bank Charges"), debit: value.bankCharges, credit: 0, currency: paymentCurrencyCode }, { id: "3", account: lt("Bank/Cash"), debit: 0, credit: value.paymentAmount + value.bankCharges, currency: paymentCurrencyCode }]} />
    <PermissionButton permission={initialValue ? "Payment.Update" : "Payment.Create"} onClick={() => {
      if (!canSubmit) {
        toast.error(lt("Allocation is incomplete"), value.isAdvancePayment ? lt("Advance payments cannot have bill allocations.") : lt("Allocate the full payment amount without exceeding bill outstanding."));
        return;
      }
      void onSubmit(value);
    }} disabled={isSubmitting}>{isSubmitting ? lt("Saving...") : lt("Save Payment")}</PermissionButton>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }

function FilterableSelect({ value, onChange, options, placeholder, disabled }: { value: string; onChange: (value: string) => void; options: ComboboxOption[]; placeholder: string; disabled?: boolean }) {
  const selected = options.find((x) => x.value === value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(selected?.label ?? "");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  useEffect(() => { setText(selected?.label ?? ""); }, [selected?.label]);

  function openMenu(resetSearch = false) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) setMenuStyle({ position: "fixed", left: rect.left, top: rect.bottom + 4, width: rect.width, zIndex: 1000 });
    if (resetSearch) setText("");
    setOpen(true);
  }

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(text.trim().toLowerCase()));

  return <div ref={wrapperRef} className="relative">
    <Input value={text} disabled={disabled} placeholder={placeholder} className="pr-9" onFocus={() => openMenu(true)} onChange={(event) => { setText(event.target.value); openMenu(); if (!event.target.value.trim()) onChange(""); }} onBlur={() => { window.setTimeout(() => { setOpen(false); setText(options.find((x) => x.value === value)?.label ?? ""); }, 120); }} />
    <button type="button" tabIndex={-1} disabled={disabled} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40" onMouseDown={(event) => { event.preventDefault(); if (disabled) return; if (open) setOpen(false); else openMenu(true); }}><ChevronDown className="h-4 w-4" /></button>
    {open && !disabled && typeof document !== "undefined" ? createPortal(<div className="max-h-64 overflow-auto rounded-md border bg-white shadow-lg" style={menuStyle}>{filteredOptions.length ? filteredOptions.map((option) => <button key={option.value} type="button" className={`block w-full px-3 py-2 text-left text-sm hover:bg-sky-50 ${option.value === value ? "bg-sky-100 text-sky-800" : ""}`} onMouseDown={(event) => { event.preventDefault(); onChange(option.value); setText(option.label); setOpen(false); }}>{option.label}</button>) : <div className="px-3 py-2 text-sm text-slate-500">{lt("No results")}</div>}</div>, document.body) : null}
  </div>;
}

function setAllocation(items: VendorPaymentAllocationRequest[], index: number, key: keyof VendorPaymentAllocationRequest, value: string | number, onChange: (next: VendorPaymentAllocationRequest[]) => void) { const next = [...items]; next[index] = { ...next[index], [key]: value } as VendorPaymentAllocationRequest; onChange(next); }
function roundMoney(value: number) { return Math.round(value * 10000) / 10000; }
function validateAllocations(items: VendorPaymentAllocationRequest[], bills: Map<string, PendingBillDto>, paymentCurrencyId: string) {
  return items.flatMap((item, index) => {
    const errors: string[] = [];
    const bill = bills.get(item.vendorBillId);
    if (!item.vendorBillId) errors.push(`${lt("Row")} ${index + 1}: ${lt("select a bill.")}`);
    if (item.allocatedAmount <= 0) errors.push(`${lt("Row")} ${index + 1}: ${lt("allocated amount must be greater than zero.")}`);
    if (bill && bill.billCurrencyId !== paymentCurrencyId) errors.push(`${lt("Row")} ${index + 1}: ${lt("bill currency must match the payment currency.")}`);
    if (bill && item.allocatedAmount > bill.outstandingAmount) errors.push(`${lt("Row")} ${index + 1}: ${lt("allocation exceeds bill outstanding.")}`);
    return errors;
  });
}

function currencyDisplay(code?: string | null, symbol?: string | null, name?: string | null) {
  const codeAndSymbol = [code, symbol].filter(Boolean).join(" - ");
  return name ? `${codeAndSymbol}${codeAndSymbol ? " - " : ""}${name}` : codeAndSymbol || "Currency";
}

function moneyWithCurrency(value: number, code?: string | null, symbol?: string | null) {
  return `${currencyDisplay(code, symbol)} ${value.toFixed(2)}`;
}
