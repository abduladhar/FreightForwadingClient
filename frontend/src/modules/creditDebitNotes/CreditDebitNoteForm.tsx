import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActiveChargeHeadsForDropdown } from "@/api/chargeHeadApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import type { CreditDebitNoteItemRequest, CreditDebitNoteRequest } from "@/api/creditDebitNoteApi";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { FinancePartyAutocomplete, type FinancePartyLookup } from "@/components/common/FinancePartyAutocomplete";
import { LedgerPostingPreview } from "@/components/common/LedgerPostingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/modules/operationsLocalization";

const noteTypes = ["Credit Note", "Debit Note"] as const;
const partyTypes = ["Customer", "Vendor"] as const;
const sourceTypes = ["Standalone", "Invoice", "VendorBill", "Pickup", "GoodsReceipt", "HouseShipment", "MasterShipment", "DirectShipment", "CustomsClearance", "Job", "Shipment"];
type ComboboxOption = { value: string; label: string };

export function CreditDebitNoteForm({
  initialValue,
  noteStatus,
  lockNoteType,
  lockSourceType,
  isSubmitting,
  onSubmit
}: {
  initialValue?: CreditDebitNoteRequest | null;
  noteStatus?: string;
  lockNoteType?: boolean;
  lockSourceType?: boolean;
  isSubmitting?: boolean;
  onSubmit: (value: CreditDebitNoteRequest) => Promise<void>;
}) {
  const [value, setValue] = useState<CreditDebitNoteRequest>(
    initialValue ?? {
      noteType: "Credit Note",
      partyType: "Customer",
      partyId: "",
      partyName: null,
      sourceType: "Standalone",
      sourceId: null,
      sourceReferenceNo: "",
      noteDate: new Date().toISOString().slice(0, 10),
      partyCurrencyId: "",
      noteCurrencyId: "",
      exchangeRate: 1,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null,
      roundOffAmount: 0,
      remarks: null,
      items: [emptyItem()]
    }
  );

  useEffect(() => {
    if (initialValue) setValue(initialValue);
  }, [initialValue]);

  const currencies = useQuery({ queryKey: ["tenant-currencies", "credit-debit-note"], queryFn: getTenantCurrencies });
  const mappingModule = value.partyType === "Customer" ? "Invoice" : "VendorBill";
  const chargeHeads = useQuery({ queryKey: ["credit-debit-note-charge-heads", mappingModule], queryFn: () => getActiveChargeHeadsForDropdown("", mappingModule) });

  const currencyOptions = (currencies.data ?? []).filter((x) => x.isEnabled);
  const baseCurrency = currencyOptions.find((x) => x.isBaseCurrency) ?? currencyOptions[0];
  const noteCurrencyCode = currencyOptions.find((x) => x.currencyId === value.noteCurrencyId)?.currencyCode ?? baseCurrency?.currencyCode ?? "USD";
  const baseCurrencyCode = baseCurrency?.currencyCode ?? noteCurrencyCode;
  const chargeHeadOptions = withCurrentChargeOptions(
    chargeHeads.data ?? [],
    value.items.map((item) => ({ mappingKey: item.chargeCode, mappingName: item.chargeName || item.chargeHead }))
  );
  const isDraftEditable = !noteStatus || noteStatus === "Draft";
  const activeItems = value.items;
  const subTotal = activeItems.reduce((sum, item) => sum + item.quantity * item.unitRate, 0);
  const discount = activeItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const tax = activeItems.reduce((sum, item) => sum + lineTax(item), 0);
  const total = subTotal - discount + tax + value.roundOffAmount;
  const baseAmount = total * value.exchangeRate;
  const previewLines = useMemo(
    () => buildLedgerPreview(value, total, noteCurrencyCode),
    [value, total, noteCurrencyCode]
  );

  useEffect(() => {
    if (!currencyOptions.length) return;
    const preferred = baseCurrency ?? currencyOptions[0];
    setValue((prev) => {
      if (prev.partyCurrencyId && prev.noteCurrencyId) return prev;
      return { ...prev, partyCurrencyId: prev.partyCurrencyId || preferred.currencyId, noteCurrencyId: prev.noteCurrencyId || preferred.currencyId };
    });
  }, [currencies.data]);

  function selectParty(party: FinancePartyLookup | null) {
    const partyId = party?.id ?? "";
    setValue((prev) => ({
      ...prev,
      partyId,
      partyName: party?.name ?? "",
      partyCurrencyId: party?.defaultCurrencyId || prev.partyCurrencyId,
      noteCurrencyId: party?.defaultCurrencyId || prev.noteCurrencyId
    }));
  }

  function updateItem(index: number, patch: Partial<CreditDebitNoteItemRequest>) {
    setValue((prev) => {
      const next = [...prev.items];
      next[index] = { ...next[index], ...patch };
      return { ...prev, items: next };
    });
  }

  function chooseCharge(index: number, mappingKey: string) {
    if (!mappingKey) {
      updateItem(index, { chargeCode: "", chargeName: "", chargeHead: "" });
      return;
    }
    const charge = chargeHeadOptions.find((x) => x.mappingKey === mappingKey);
    updateItem(index, {
      chargeCode: mappingKey,
      chargeName: charge?.mappingName ?? mappingKey,
      chargeHead: charge?.mappingName ?? mappingKey
    });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(value);
      }}
    >
      <section className="rounded-lg border bg-white p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label={lt("Note Type")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" disabled={!isDraftEditable || lockNoteType} value={value.noteType} onChange={(event) => setValue((prev) => ({ ...prev, noteType: event.target.value as CreditDebitNoteRequest["noteType"] }))}>
              {noteTypes.map((x) => <option key={x} value={x}>{lt(x)}</option>)}
            </select>
            {lockNoteType ? <p className="mt-1 text-xs text-muted-foreground">{lt("Note type is fixed from the source document action.")}</p> : null}
          </Field>
          <Field label={lt("Party Type")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" disabled={!isDraftEditable} value={value.partyType} onChange={(event) => setValue((prev) => ({ ...prev, partyType: event.target.value as CreditDebitNoteRequest["partyType"], partyId: "", partyName: "", items: prev.items.map((item) => ({ ...item, chargeCode: "", chargeName: "", chargeHead: "" })) }))}>
              {partyTypes.map((x) => <option key={x} value={x}>{lt(x)}</option>)}
            </select>
          </Field>
          <Field label={lt(value.partyType)}>
            <FinancePartyAutocomplete
              partyType={value.partyType}
              value={value.partyId}
              onChange={selectParty}
              disabled={!isDraftEditable}
              placeholder={value.partyType === "Customer" ? lt("Search customer by name, code, or phone") : lt("Search vendor by name, code, or phone")}
            />
          </Field>
          <Field label={lt("Note Date")}>
            <Input type="date" disabled={!isDraftEditable} value={value.noteDate} onChange={(event) => setValue((prev) => ({ ...prev, noteDate: event.target.value }))} required />
          </Field>
          <Field label={lt("Source Type")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" disabled={!isDraftEditable || lockSourceType} value={value.sourceType} onChange={(event) => setValue((prev) => ({ ...prev, sourceType: event.target.value, sourceId: event.target.value === "Standalone" ? null : prev.sourceId }))}>
              {sourceTypes.map((x) => <option key={x} value={x}>{lt(displaySourceType(x))}</option>)}
            </select>
            {lockSourceType && value.sourceType === "Standalone" ? <p className="mt-1 text-xs text-muted-foreground">{lt("Standalone notes are created from this screen. Use invoice or bill actions to create linked notes.")}</p> : null}
          </Field>
          <Field label={lt("Source Reference No")}>
            <Input disabled={!isDraftEditable} value={value.sourceReferenceNo ?? ""} onChange={(event) => setValue((prev) => ({ ...prev, sourceReferenceNo: event.target.value }))} placeholder={lt("Invoice, bill, shipment, or job no")} />
          </Field>
          <Field label={lt("Currency")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" disabled={!isDraftEditable} value={value.noteCurrencyId} onChange={(event) => setValue((prev) => ({ ...prev, noteCurrencyId: event.target.value, partyCurrencyId: prev.partyCurrencyId || event.target.value, exchangeRate: event.target.value === baseCurrency?.currencyId ? 1 : prev.exchangeRate }))} required>
              <option value="">{lt("Select currency")}</option>
              {currencyOptions.map((x) => <option key={x.currencyId} value={x.currencyId}>{x.currencyCode} - {x.currencyName}</option>)}
            </select>
          </Field>
          <Field label={`${lt("Exchange Rate to")} ${baseCurrencyCode}`}>
            <Input type="number" step="0.00000001" min="0.00000001" disabled={!isDraftEditable} value={value.exchangeRate} onChange={(event) => setValue((prev) => ({ ...prev, exchangeRate: Number(event.target.value) }))} />
          </Field>
          <Field label={lt("Round Off")}>
            <Input type="number" step="0.01" disabled={!isDraftEditable} value={value.roundOffAmount} onChange={(event) => setValue((prev) => ({ ...prev, roundOffAmount: Number(event.target.value) }))} />
          </Field>
          <label className="flex items-center gap-2 pt-7 text-sm">
            <input type="checkbox" disabled={!isDraftEditable} checked={value.isExchangeRateOverride} onChange={(event) => setValue((prev) => ({ ...prev, isExchangeRateOverride: event.target.checked }))} />
            {lt("Manual exchange rate override")}
          </label>
          <Field label={lt("Override Reason")}>
            <Input disabled={!isDraftEditable || !value.isExchangeRateOverride} value={value.exchangeRateOverrideReason ?? ""} onChange={(event) => setValue((prev) => ({ ...prev, exchangeRateOverrideReason: event.target.value }))} />
          </Field>
          <div className="md:col-span-4">
            <Label>{lt("Remarks")}</Label>
            <textarea className="mt-1 min-h-20 w-full rounded-md border px-3 py-2 text-sm" disabled={!isDraftEditable} value={value.remarks ?? ""} onChange={(event) => setValue((prev) => ({ ...prev, remarks: event.target.value }))} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">{lt("Note Items")}</h3>
            <p className="text-sm text-muted-foreground">{lt("Choose charge heads mapped for")} {lt(displaySourceType(mappingModule))} {lt("posting")}.</p>
          </div>
          <Button type="button" variant="outline" disabled={!isDraftEditable} onClick={() => setValue((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))}>
            <Plus className="h-4 w-4" /> {lt("Add Item")}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-2">{lt("Charge Head")}</th>
                <th className="p-2">{lt("Description")}</th>
                <th className="p-2 text-right">{lt("Qty")}</th>
                <th className="p-2 text-right">{lt("Rate")}</th>
                <th className="p-2 text-right">{lt("Discount")}</th>
                <th className="p-2 text-right">{lt("Tax %")}</th>
                <th className="p-2 text-right">{lt("Line")}</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {value.items.map((item, index) => (
                <tr key={index} className="border-t align-top">
                  <td className="p-2">
                    <FilterableSelect
                      disabled={!isDraftEditable}
                      value={item.chargeCode}
                      placeholder={lt("Search charge head")}
                      options={chargeHeadOptions.map((x) => ({ value: x.mappingKey, label: `${x.mappingKey} - ${x.mappingName}` }))}
                      onChange={(next) => chooseCharge(index, next)}
                    />
                  </td>
                  <td className="p-2"><Input disabled={!isDraftEditable} value={item.chargeName} onChange={(event) => updateItem(index, { chargeName: event.target.value, chargeHead: event.target.value })} required /></td>
                  <td className="p-2"><Input className="text-right" type="number" step="0.0001" min="0.0001" disabled={!isDraftEditable} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} /></td>
                  <td className="p-2"><Input className="text-right" type="number" step="0.01" min="0" disabled={!isDraftEditable} value={item.unitRate} onChange={(event) => updateItem(index, { unitRate: Number(event.target.value) })} /></td>
                  <td className="p-2"><Input className="text-right" type="number" step="0.01" min="0" disabled={!isDraftEditable} value={item.discountAmount} onChange={(event) => updateItem(index, { discountAmount: Number(event.target.value) })} /></td>
                  <td className="p-2"><Input className="text-right" type="number" step="0.01" min="0" disabled={!isDraftEditable} value={item.taxRate} onChange={(event) => updateItem(index, { taxRate: Number(event.target.value), isTaxApplicable: Number(event.target.value) > 0 })} /></td>
                  <td className="p-2 text-right font-semibold">{lineAmount(item).toFixed(2)}</td>
                  <td className="p-2 text-right">
                    <Button type="button" size="icon" variant="ghost" disabled={!isDraftEditable || value.items.length <= 1} onClick={() => setValue((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span className="sr-only">{lt("Remove Item")}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <LedgerPostingPreview lines={previewLines} />
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 font-semibold text-slate-950">{lt("Totals")}</h3>
          <TotalRow label={lt("Subtotal")} value={<CurrencyAmount value={subTotal} currency={noteCurrencyCode} />} />
          <TotalRow label={lt("Discount")} value={<CurrencyAmount value={discount} currency={noteCurrencyCode} />} />
          <TotalRow label={lt("Tax")} value={<CurrencyAmount value={tax} currency={noteCurrencyCode} />} />
          <TotalRow label={lt("Round Off")} value={<CurrencyAmount value={value.roundOffAmount} currency={noteCurrencyCode} />} />
          <div className="my-3 border-t" />
          <TotalRow label={lt("Total")} value={<CurrencyAmount value={total} currency={noteCurrencyCode} />} strong />
          <TotalRow label={`${lt("Base Amount")} (${baseCurrencyCode})`} value={<CurrencyAmount value={baseAmount} currency={baseCurrencyCode} />} strong />
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!isDraftEditable || isSubmitting}>{isSubmitting ? lt("Saving...") : lt("Save Note")}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><Label>{label}</Label><div className="mt-1">{children}</div></div>;
}

function TotalRow({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return <div className={strong ? "flex justify-between py-1 font-semibold" : "flex justify-between py-1 text-sm"}><span>{label}</span><span>{value}</span></div>;
}

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
  const selected = options.find((option) => option.value === value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(selected?.label ?? "");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  useEffect(() => {
    setText(selected?.label ?? "");
  }, [selected?.label]);

  function openMenu(resetSearch = false) {
    if (disabled) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
        zIndex: 9999
      });
    }
    if (resetSearch && selected?.label) setText("");
    setOpen(true);
  }

  const searchText = text.toLowerCase();
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchText) || option.value.toLowerCase().includes(searchText));

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          disabled={disabled}
          aria-label={lt("Toggle options")}
          value={text}
          placeholder={placeholder}
          onFocus={() => openMenu(true)}
          onChange={(event) => {
            setText(event.target.value);
            openMenu();
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              setText(selected?.label ?? "");
            }, 150);
          }}
          className="pr-9"
        />
        <button
          type="button"
          disabled={disabled}
          className="absolute inset-y-0 right-2 flex items-center text-muted-foreground disabled:opacity-40"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => open ? setOpen(false) : openMenu(true)}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      {open && !disabled && typeof document !== "undefined" ? createPortal(
        <div style={menuStyle} className="max-h-64 overflow-auto rounded-md border bg-white py-1 text-sm shadow-lg">
          {filteredOptions.length ? filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="block w-full px-3 py-2 text-left hover:bg-slate-100"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setText(option.label);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          )) : <div className="px-3 py-2 text-muted-foreground">{lt("No charge head found")}</div>}
        </div>,
        document.body
      ) : null}
    </div>
  );
}

function withCurrentChargeOptions<T extends { id: string; mappingKey: string; mappingName: string }>(
  options: T[],
  current: Array<{ mappingKey?: string | null; mappingName?: string | null }>
) {
  const result = [...options];
  for (const item of current) {
    const key = item.mappingKey?.trim();
    if (!key) continue;
    if (result.some((option) => option.mappingKey.toLowerCase() === key.toLowerCase())) continue;
    result.push({ id: `current-${key}`, mappingKey: key, mappingName: item.mappingName?.trim() || key } as T);
  }
  return result;
}

function emptyItem(): CreditDebitNoteItemRequest {
  return { chargeCode: "", chargeName: "", chargeHead: "", quantity: 1, unitRate: 0, discountAmount: 0, isTaxApplicable: false, taxRate: 0 };
}

function lineTax(item: CreditDebitNoteItemRequest) {
  return item.isTaxApplicable || item.taxRate > 0 ? ((item.quantity * item.unitRate - item.discountAmount) * item.taxRate) / 100 : 0;
}

function lineAmount(item: CreditDebitNoteItemRequest) {
  return item.quantity * item.unitRate - item.discountAmount + lineTax(item);
}

function buildLedgerPreview(value: CreditDebitNoteRequest, total: number, currency: string) {
  const isCustomer = value.partyType === "Customer";
  const isCredit = value.noteType === "Credit Note";
  const partyLine = isCustomer ? lt("Customer Receivable") : lt("Vendor Payable");
  const itemTotal = value.items.reduce((sum, item) => sum + item.quantity * item.unitRate - item.discountAmount, 0);
  const taxTotal = value.items.reduce((sum, item) => sum + lineTax(item), 0);
  if (isCustomer) {
    return [
      { id: "party", account: partyLine, debit: isCredit ? 0 : total, credit: isCredit ? total : 0, currency },
      { id: "charges", account: lt("Charge head accounts"), debit: isCredit ? itemTotal : 0, credit: isCredit ? 0 : itemTotal, currency },
      { id: "tax", account: lt("Tax payable"), debit: isCredit ? taxTotal : 0, credit: isCredit ? 0 : taxTotal, currency }
    ];
  }
  return [
    { id: "costs", account: lt("Cost head accounts"), debit: isCredit ? 0 : itemTotal, credit: isCredit ? itemTotal : 0, currency },
    { id: "tax", account: lt("Tax receivable"), debit: isCredit ? 0 : taxTotal, credit: isCredit ? taxTotal : 0, currency },
    { id: "party", account: partyLine, debit: isCredit ? total : 0, credit: isCredit ? 0 : total, currency }
  ];
}

function displaySourceType(value: string) {
  switch (value) {
    case "VendorBill": return "Vendor Bill";
    case "GoodsReceipt": return "Goods Receipt Note";
    case "HouseShipment": return "House Shipment";
    case "MasterShipment": return "Master Shipment";
    case "DirectShipment": return "Direct Shipment";
    case "CustomsClearance": return "Customs Clearance";
    default: return value;
  }
}
