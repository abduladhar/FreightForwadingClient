import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { getBankAccounts, getCashAccounts } from "@/api/accountingApi";
import { getCurrencies, getExchangeRates, getTenantCurrencies } from "@/api/currencyApi";
import type { PendingInvoiceDto } from "@/api/reconciliationApi";
import { getPendingInvoices } from "@/api/reconciliationApi";
import type { CustomerReceiptAllocationRequest, CustomerReceiptRequest } from "@/api/receiptApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { LedgerPostingPreview } from "@/components/common/LedgerPostingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/hooks/useWorkspace";
import { FinancePartyAutocomplete, type FinancePartyLookup, type FinancePartyType } from "@/components/common/FinancePartyAutocomplete";
import { lt } from "@/modules/operationsLocalization";

function todayDateLocalValue() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const emptyReceipt = (): CustomerReceiptRequest => ({
  customerId: "",
  receivedFromPartyType: "Customer",
  receivedFromPartyId: null,
  receivedFromPartyName: null,
  receiptDate: todayDateLocalValue(),
  receiptCurrencyId: "",
  baseCurrencyId: "",
  exchangeRate: 1,
  receiptAmount: 0,
  bankCharges: 0,
  isAdvanceReceipt: false,
  bankAccountId: null,
  cashAccountId: null,
  remarks: null,
  allocations: [],
});

type ComboboxOption = { value: string; label: string };
const partyTypeOptions: ComboboxOption[] = [
  { value: "Customer", label: lt("Customer") },
  { value: "Vendor", label: lt("Vendor") },
  { value: "Agent", label: lt("Agent") },
  { value: "Carrier", label: lt("Carrier") }
];

export function CustomerReceiptForm({ initialValue, onSubmit, isSubmitting }: { initialValue?: CustomerReceiptRequest | null; onSubmit: (value: CustomerReceiptRequest) => Promise<void>; isSubmitting?: boolean }) {
  const { hasPermission } = useAuth();
  const workspace = useWorkspace();
  const toast = useToast();
  const [value, setValue] = useState<CustomerReceiptRequest>(initialValue ?? emptyReceipt());
  const shouldApplyDefaultRateRef = useRef(!initialValue);

  useEffect(() => {
    if (!initialValue) return;
    setValue(initialValue);
  }, [initialValue]);

  const bankAccounts = useQuery({ queryKey: ["receipt-bank-accounts"], queryFn: () => getBankAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const cashAccounts = useQuery({ queryKey: ["receipt-cash-accounts"], queryFn: () => getCashAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const currencies = useQuery({ queryKey: ["receipt-currencies"], queryFn: getCurrencies });
  const tenantCurrencies = useQuery({ queryKey: ["receipt-currencies", "tenant-enabled"], queryFn: getTenantCurrencies });
  const partyType = value.receivedFromPartyType || "Customer";
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
  const selectedPartyId = value.receivedFromPartyId || value.customerId;
  const pendingInvoices = useQuery({
    queryKey: ["receipt-pending-invoices", partyType, selectedPartyId],
    queryFn: () => getPendingInvoices(partyType === "Customer" ? selectedPartyId : undefined, partyType, selectedPartyId),
    enabled: Boolean(selectedPartyId) && !value.isAdvanceReceipt,
  });

  const invoiceById = useMemo(() => new Map((pendingInvoices.data ?? []).map((x) => [x.invoiceId, x])), [pendingInvoices.data]);
  const matchingPendingInvoices = useMemo(
    () => (pendingInvoices.data ?? []).filter((invoice) => invoice.invoiceCurrencyId === value.receiptCurrencyId),
    [pendingInvoices.data, value.receiptCurrencyId]
  );
  const allocatedTotal = useMemo(() => value.allocations.reduce((sum, x) => sum + x.allocatedAmount, 0), [value.allocations]);
  const remainingReceiptAmount = Math.max(0, value.receiptAmount - allocatedTotal);
  const selectedInvoiceIds = useMemo(() => new Set(value.allocations.map((x) => x.invoiceId).filter(Boolean)), [value.allocations]);
  const allocationErrors = useMemo(() => validateAllocations(value.allocations, invoiceById, value.receiptCurrencyId), [value.allocations, invoiceById, value.receiptCurrencyId]);
  const localizedPartyTypeOptions = partyTypeOptions.map((option) => ({ ...option, label: lt(option.label) }));
  const receiptCurrency = currencyById.get(value.receiptCurrencyId);
  const selectedBaseCurrency = currencyById.get(value.baseCurrencyId);
  const receiptCurrencyLabel = currencyDisplay(receiptCurrency?.currencyCode ?? workspace.baseCurrency, receiptCurrency?.symbol);
  const baseCurrencyLabel = currencyDisplay(selectedBaseCurrency?.currencyCode ?? workspace.baseCurrency, selectedBaseCurrency?.symbol);
  const receiptCurrencyCode = receiptCurrency?.currencyCode ?? workspace.baseCurrency ?? "USD";
  const baseCurrencyCode = selectedBaseCurrency?.currencyCode ?? workspace.baseCurrency ?? receiptCurrencyCode;
  const baseAmount = roundMoney(value.receiptAmount * value.exchangeRate);
  const defaultRates = useQuery({
    queryKey: ["receipt-default-exchange-rate", value.receiptCurrencyId, baseCurrency?.currencyId],
    queryFn: () => getExchangeRates(value.receiptCurrencyId, baseCurrency!.currencyId),
    enabled: Boolean(value.receiptCurrencyId && baseCurrency?.currencyId && value.receiptCurrencyId !== baseCurrency.currencyId)
  });
  const defaultRate = (defaultRates.data ?? []).find((rate) => rate.effectiveDate <= value.receiptDate);
  const canSubmit = Boolean(
    selectedPartyId &&
    value.receiptCurrencyId &&
    value.baseCurrencyId &&
    value.exchangeRate > 0 &&
    value.receiptAmount > 0 &&
    Boolean(value.bankAccountId) !== Boolean(value.cashAccountId) &&
    (value.isAdvanceReceipt ? value.allocations.length === 0 : value.allocations.length > 0 && allocatedTotal === value.receiptAmount && allocationErrors.length === 0)
  );

  const updateValue = (next: CustomerReceiptRequest) => setValue(next);
  const setPartyType = (nextType: string) => {
    updateValue({ ...value, receivedFromPartyType: nextType, receivedFromPartyId: null, receivedFromPartyName: null, customerId: "", allocations: [] });
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
      customerId: partyId,
      receivedFromPartyId: partyId || null,
      receivedFromPartyName: party ? `${party.code} - ${party.name}` : null,
      receiptCurrencyId: partyCurrencyId,
      baseCurrencyId: baseCurrency?.currencyId ?? value.baseCurrencyId,
      exchangeRate: isBaseCurrency ? 1 : 0,
      allocations: []
    });
  };
  const addPendingInvoice = (invoice: PendingInvoiceDto) => {
    if (selectedInvoiceIds.has(invoice.invoiceId)) return;
    if (invoice.invoiceCurrencyId !== value.receiptCurrencyId) {
      toast.error(lt("Currency mismatch"), lt("Invoice currency must be the same as receipt currency."));
      return;
    }
    const amount = Math.min(invoice.outstandingAmount, remainingReceiptAmount || invoice.outstandingAmount);
    updateValue({ ...value, allocations: [...value.allocations, { invoiceId: invoice.invoiceId, allocatedAmount: roundMoney(amount) }] });
  };

  useEffect(() => {
    if (!enabledCurrencies.length || !baseCurrency?.currencyId) return;
    setValue((previous) => {
      const receiptCurrencyId = previous.receiptCurrencyId || baseCurrency.currencyId;
      const baseCurrencyId = previous.baseCurrencyId || baseCurrency.currencyId;
      if (receiptCurrencyId === previous.receiptCurrencyId && baseCurrencyId === previous.baseCurrencyId) return previous;
      return {
        ...previous,
        receiptCurrencyId,
        baseCurrencyId,
        exchangeRate: receiptCurrencyId === baseCurrency.currencyId ? 1 : previous.exchangeRate
      };
    });
  }, [baseCurrency?.currencyId, enabledCurrencies.length]);

  useEffect(() => {
    if (!defaultRate || !shouldApplyDefaultRateRef.current) return;
    shouldApplyDefaultRateRef.current = false;
    setValue((previous) => ({ ...previous, exchangeRate: defaultRate.rate }));
  }, [defaultRate, value.receiptCurrencyId]);

  function changeReceiptCurrency(receiptCurrencyId: string) {
    const isBaseCurrency = receiptCurrencyId === baseCurrency?.currencyId;
    shouldApplyDefaultRateRef.current = Boolean(receiptCurrencyId && !isBaseCurrency);
    updateValue({
      ...value,
      receiptCurrencyId,
      baseCurrencyId: baseCurrency?.currencyId ?? value.baseCurrencyId,
      exchangeRate: isBaseCurrency ? 1 : 0
    });
  }

  return <div className="space-y-5">
    <div className="grid gap-4 md:grid-cols-3">
      <Field label={lt("Received From Type")} required><FilterableSelect value={partyType} onChange={setPartyType} options={localizedPartyTypeOptions} placeholder={lt("Select party type")} /></Field>
      <Field label={lt("Received From")} required>
        <FinancePartyAutocomplete
          partyType={partyType as FinancePartyType}
          value={selectedPartyId}
          onChange={setParty}
          placeholder={`${lt("Search")} ${lt(partyType).toLowerCase()} ${lt("by name, code, or phone")}`}
        />
      </Field>
      <Field label={lt("Receipt Date")} required><Input type="date" value={value.receiptDate} onChange={(e) => {
        if (!initialValue && value.receiptCurrencyId !== baseCurrency?.currencyId) shouldApplyDefaultRateRef.current = true;
        updateValue({ ...value, receiptDate: e.target.value });
      }} /></Field>
      <Field label={`${lt("Receipt Amount")} (${receiptCurrencyLabel})`} required><Input type="number" min="0" value={value.receiptAmount} onChange={(e) => updateValue({ ...value, receiptAmount: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label={`${lt("Receipt Currency")} (${receiptCurrencyLabel})`} required><FilterableSelect value={value.receiptCurrencyId} onChange={changeReceiptCurrency} options={currencyOptions} placeholder={lt("Select receipt currency")} disabled /><div className="text-xs text-muted-foreground">{lt("Locked to the selected Received From party currency.")}</div></Field>
      <Field label={`${lt("Base Currency")} (${baseCurrencyLabel})`} required><FilterableSelect value={value.baseCurrencyId} onChange={() => undefined} options={currencyOptions} placeholder={lt("Tenant base currency")} disabled /></Field>
      <Field label={`${lt("Exchange Rate")} (${baseCurrencyCode} ${lt("per")} ${receiptCurrencyCode})`} required>
        <Input type="number" min="0" value={value.exchangeRate} onChange={(e) => {
          shouldApplyDefaultRateRef.current = false;
          updateValue({ ...value, exchangeRate: Math.max(0, Number(e.target.value)) });
        }} />
        {value.receiptCurrencyId && value.receiptCurrencyId !== baseCurrency?.currencyId ? (
          <p className="text-xs text-muted-foreground">
            {defaultRates.isLoading
              ? lt("Loading saved default exchange rate...")
              : defaultRate
                ? `${lt("Default rate effective")} ${defaultRate.effectiveDate}: 1 ${receiptCurrencyCode} = ${defaultRate.rate} ${baseCurrencyCode}`
                : `${lt("No saved exchange rate exists on or before the receipt date. Enter the receipt rate manually.")} (${receiptCurrencyCode}/${baseCurrencyCode}, ${value.receiptDate})`}
          </p>
        ) : <p className="text-xs text-muted-foreground">{lt("Base currency receipts use exchange rate 1.")}</p>}
      </Field>
      <Field label={`${lt("Base Amount")} (${baseCurrencyLabel})`}><Input value={baseAmount.toFixed(2)} readOnly className="bg-slate-50 font-medium" /></Field>
      <Field label={`${lt("Bank Charges")} (${receiptCurrencyLabel})`}><Input type="number" min="0" value={value.bankCharges} onChange={(e) => updateValue({ ...value, bankCharges: Math.max(0, Number(e.target.value)) })} /></Field>
      <Field label={lt("Bank Account")} required={!value.cashAccountId}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.bankAccountId ?? ""} onChange={(e) => updateValue({ ...value, bankAccountId: e.target.value || null, cashAccountId: e.target.value ? null : value.cashAccountId })}><option value="">{lt("Select bank account")}</option>{(bankAccounts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.bankName} - {x.accountNumber}</option>)}</select></Field>
      <Field label={lt("Cash Account")} required={!value.bankAccountId}><select className="h-10 w-full rounded-md border px-3 text-sm" value={value.cashAccountId ?? ""} onChange={(e) => updateValue({ ...value, cashAccountId: e.target.value || null, bankAccountId: e.target.value ? null : value.bankAccountId })}><option value="">{lt("Select cash account")}</option>{(cashAccounts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.cashAccountName}</option>)}</select></Field>
      <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={value.isAdvanceReceipt} onChange={(e) => updateValue({ ...value, isAdvanceReceipt: e.target.checked, allocations: e.target.checked ? [] : value.allocations })} /> {lt("Advance Receipt")}</label>
      <Field label={lt("Remarks")}><Input value={value.remarks ?? ""} onChange={(e) => updateValue({ ...value, remarks: e.target.value || null })} /></Field>
    </div>

    {!value.isAdvanceReceipt ? <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{lt("Pending Customer Invoices")}</h3>
          <span className="text-xs text-muted-foreground">{selectedPartyId ? `${matchingPendingInvoices.length} ${lt("matching invoice(s)")}` : `${lt("Select")} ${lt(partyType).toLowerCase()}`}</span>
        </div>
        <div className="max-h-80 overflow-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-50"><tr><th className="p-2 text-left">{lt("Invoice")}</th><th className="p-2 text-left">{lt("Invoice Currency")}</th><th className="p-2 text-right">{lt("Outstanding")}</th><th className="p-2 text-right">{lt("Rate")}</th><th className="p-2 text-right">{lt("Action")}</th></tr></thead>
            <tbody>
              {(pendingInvoices.data ?? []).map((invoice) => {
                const invoiceCurrency = currencyById.get(invoice.invoiceCurrencyId);
                const invoiceCurrencyLabel = currencyDisplay(invoiceCurrency?.currencyCode, invoiceCurrency?.symbol);
                const currencyMatches = invoice.invoiceCurrencyId === value.receiptCurrencyId;
                return <tr key={invoice.invoiceId} className="border-t">
                <td className="p-2 font-medium">{invoice.invoiceNumber}</td>
                <td className="p-2"><div>{invoiceCurrencyLabel}</div>{!currencyMatches ? <div className="text-xs text-red-600">{lt("Receipt currency mismatch")}</div> : null}</td>
                <td className="p-2 text-right">{moneyWithCurrency(invoice.outstandingAmount, invoiceCurrency?.currencyCode, invoiceCurrency?.symbol)}</td>
                <td className="p-2 text-right">{invoice.exchangeRate.toFixed(4)}</td>
                <td className="p-2 text-right"><Button type="button" size="sm" variant="outline" disabled={selectedInvoiceIds.has(invoice.invoiceId) || !currencyMatches} onClick={() => addPendingInvoice(invoice)}>{selectedInvoiceIds.has(invoice.invoiceId) ? lt("Added") : currencyMatches ? lt("Allocate") : lt("Blocked")}</Button></td>
              </tr>;
              })}
              {selectedPartyId && !pendingInvoices.isLoading && (pendingInvoices.data ?? []).length === 0 ? <tr><td className="p-4 text-center text-muted-foreground" colSpan={5}>{lt("No pending invoices for this party.")}</td></tr> : null}
              {!selectedPartyId ? <tr><td className="p-4 text-center text-muted-foreground" colSpan={5}>{lt("Select a party to load pending invoices.")}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{lt("Payment Allocation")}</h3>
          <Button type="button" variant="outline" onClick={() => updateValue({ ...value, allocations: [...value.allocations, { invoiceId: "", allocatedAmount: 0 }] })}><Plus className="h-4 w-4" />{lt("Add Row")}</Button>
        </div>
        <div className="overflow-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="p-2 text-left"><RequiredHeader>{lt("Invoice")}</RequiredHeader></th><th className="p-2 text-right">{lt("Outstanding")}</th><th className="p-2 text-left"><RequiredHeader>{lt("Allocated Amount")}</RequiredHeader></th><th className="p-2 text-right">{lt("Action")}</th></tr></thead>
            <tbody>
              {value.allocations.map((row, i) => {
                const invoice = invoiceById.get(row.invoiceId);
                return <tr key={`${row.invoiceId || "new"}-${i}`} className="border-t">
                  <td className="p-2"><select className="h-10 w-full min-w-52 rounded-md border px-3 text-sm" value={row.invoiceId} onChange={(e) => setAllocation(value.allocations, i, "invoiceId", e.target.value, (allocations) => updateValue({ ...value, allocations }))}><option value="">{lt("Select invoice")}</option>{matchingPendingInvoices.map((x) => <option key={x.invoiceId} value={x.invoiceId}>{x.invoiceNumber}</option>)}</select></td>
                  <td className="p-2 text-right">{invoice ? moneyWithCurrency(invoice.outstandingAmount, currencyById.get(invoice.invoiceCurrencyId)?.currencyCode, currencyById.get(invoice.invoiceCurrencyId)?.symbol) : "-"}</td>
                  <td className="p-2"><Input type="number" min="0" value={row.allocatedAmount} onChange={(e) => setAllocation(value.allocations, i, "allocatedAmount", Math.max(0, Number(e.target.value)), (allocations) => updateValue({ ...value, allocations }))} /></td>
                  <td className="p-2 text-right"><Button type="button" variant="ghost" size="sm" onClick={() => updateValue({ ...value, allocations: value.allocations.filter((_, idx) => idx !== i) })}><Trash2 className="h-4 w-4 text-red-600" /></Button></td>
                </tr>;
              })}
              {value.allocations.length === 0 ? <tr><td className="p-4 text-center text-muted-foreground" colSpan={4}>{lt("Add one or more invoices to allocate this receipt.")}</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div className="grid gap-2 rounded-md bg-slate-50 p-3 text-sm md:grid-cols-3">
          <span>{lt("Receipt")} ({receiptCurrencyLabel}): <strong>{value.receiptAmount.toFixed(2)}</strong></span>
          <span>{lt("Allocated")} ({receiptCurrencyLabel}): <strong>{allocatedTotal.toFixed(2)}</strong></span>
          <span className={remainingReceiptAmount === 0 ? "text-emerald-700" : "text-amber-700"}>{lt("Remaining")} ({receiptCurrencyLabel}): <strong>{remainingReceiptAmount.toFixed(2)}</strong></span>
        </div>
        {allocationErrors.map((error) => <p key={error} className="text-xs text-red-600">{error}</p>)}
        {value.allocations.length > 0 && allocatedTotal !== value.receiptAmount ? <p className="text-xs text-amber-700">{lt("Non-advance receipts must be fully allocated to invoices before save.")}</p> : null}
      </section>
    </div> : null}

    <LedgerPostingPreview lines={[{ id: "1", account: lt("Bank/Cash"), debit: Math.max(0, value.receiptAmount - value.bankCharges), credit: 0, currency: receiptCurrencyCode }, { id: "2", account: lt("Bank Charges"), debit: value.bankCharges, credit: 0, currency: receiptCurrencyCode }, { id: "3", account: value.isAdvanceReceipt ? lt("Customer Advance") : `${lt(partyType)} ${lt("Receivable")}`, debit: 0, credit: value.receiptAmount, currency: receiptCurrencyCode }]} />
    <PermissionButton permission={initialValue ? "Receipt.Update" : "Receipt.Create"} onClick={() => {
      if (!canSubmit) {
        toast.error(lt("Allocation is incomplete"), value.isAdvanceReceipt ? lt("Advance receipts cannot have invoice allocations.") : lt("Allocate the full receipt amount without exceeding invoice outstanding."));
        return;
      }
      if (!hasPermission(initialValue ? "Receipt.Update" : "Receipt.Create")) return;
      void onSubmit(value);
    }} disabled={isSubmitting}>{isSubmitting ? lt("Saving...") : lt("Save Receipt")}</PermissionButton>
  </div>;
}

function Field({ label, children, required }: { label: ReactNode; children: ReactNode; required?: boolean }) { return <div className="space-y-1"><Label>{label}{required ? <RequiredMark /> : null}</Label>{children}</div>; }

function RequiredHeader({ children }: { children: ReactNode }) { return <>{children}<RequiredMark /></>; }

function RequiredMark() { return <span className="ml-1 text-red-600">*</span>; }

function FilterableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled
}: {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  disabled?: boolean;
}) {
  const selected = options.find((x) => x.value === value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(selected?.label ?? "");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  useEffect(() => {
    setText(selected?.label ?? "");
  }, [selected?.label]);

  function openMenu(resetSearch = false) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
        zIndex: 1000
      });
    }
    if (resetSearch) setText("");
    setOpen(true);
  }

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(text.trim().toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        className="pr-9"
        onFocus={() => openMenu(true)}
        onChange={(event) => {
          setText(event.target.value);
          openMenu();
          if (!event.target.value.trim()) onChange("");
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            setText(options.find((x) => x.value === value)?.label ?? "");
          }, 120);
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        onMouseDown={(event) => {
          event.preventDefault();
          if (disabled) return;
          if (open) setOpen(false);
          else openMenu(true);
        }}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && !disabled && typeof document !== "undefined" ? createPortal(
        <div className="max-h-64 overflow-auto rounded-md border bg-white shadow-lg" style={menuStyle}>
          {filteredOptions.length ? filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-sky-50 ${option.value === value ? "bg-sky-100 text-sky-800" : ""}`}
              onMouseDown={(event) => {
                event.preventDefault();
                onChange(option.value);
                setText(option.label);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          )) : <div className="px-3 py-2 text-sm text-muted-foreground">{lt("No matching options")}</div>}
        </div>,
        document.body
      ) : null}
    </div>
  );
}

function setAllocation(items: CustomerReceiptAllocationRequest[], index: number, key: keyof CustomerReceiptAllocationRequest, value: string | number, onChange: (next: CustomerReceiptAllocationRequest[]) => void) {
  const next = [...items];
  next[index] = { ...next[index], [key]: value } as CustomerReceiptAllocationRequest;
  onChange(next);
}

function validateAllocations(items: CustomerReceiptAllocationRequest[], invoices: Map<string, PendingInvoiceDto>, receiptCurrencyId: string) {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.invoiceId) errors.push("Every allocation row must select an invoice.");
    if (item.invoiceId && seen.has(item.invoiceId)) errors.push("The same invoice cannot be selected more than once.");
    if (item.invoiceId) seen.add(item.invoiceId);
    if (item.allocatedAmount <= 0) errors.push("Allocated amount must be greater than zero.");
    const invoice = invoices.get(item.invoiceId);
    if (invoice && invoice.invoiceCurrencyId !== receiptCurrencyId) errors.push(`${invoice.invoiceNumber} currency must match the receipt currency.`);
    if (invoice && item.allocatedAmount > invoice.outstandingAmount) errors.push(`${invoice.invoiceNumber} allocation exceeds outstanding amount.`);
  }
  return [...new Set(errors)];
}

function roundMoney(value: number) {
  return Math.round(value * 10000) / 10000;
}

function currencyDisplay(code?: string | null, symbol?: string | null, name?: string | null) {
  const codeAndSymbol = [code, symbol].filter(Boolean).join(" - ");
  return name ? `${codeAndSymbol}${codeAndSymbol ? " - " : ""}${name}` : codeAndSymbol || "Currency";
}

function moneyWithCurrency(value: number, code?: string | null, symbol?: string | null) {
  return `${currencyDisplay(code, symbol)} ${value.toFixed(2)}`;
}
