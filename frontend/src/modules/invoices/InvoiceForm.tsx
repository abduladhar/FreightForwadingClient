import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { getExchangeRates, getTenantCurrencies } from "@/api/currencyApi";
import { getActiveChargeHeadsForDropdown } from "@/api/chargeHeadApi";
import { getCustomsJob } from "@/api/customsApi";
import { getDirectShipment } from "@/api/directShipmentApi";
import { getGoodsReceipt } from "@/api/goodsReceiptApi";
import { getHouseShipment } from "@/api/houseShipmentApi";
import type { InvoiceItemRequest, InvoiceRequest } from "@/api/invoiceApi";
import { getJobByGuid } from "@/api/jobApi";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { getMasterShipment } from "@/api/masterShipmentApi";
import { getPickup } from "@/api/pickupApi";
import { getQuotation } from "@/api/quotationApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { LedgerPostingPreview } from "@/components/common/LedgerPostingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { FinancePartyAutocomplete, type FinancePartyLookup, type FinancePartyType } from "@/components/common/FinancePartyAutocomplete";
import { lt } from "@/modules/operationsLocalization";

type FormValue = InvoiceRequest & { salesmanName?: string | null };
type ComboboxOption = { value: string; label: string };

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const invoiceSourceTypeOptions: ComboboxOption[] = [
  { value: "Custom", label: lt("Custom Invoice") },
  { value: "HouseShipment", label: lt("House Shipment") },
  { value: "GoodsReceipt", label: lt("Goods Receipt") },
  { value: "MasterShipment", label: lt("Master Shipment") },
  { value: "DirectShipment", label: lt("Direct Shipment") },
  { value: "Pickup", label: lt("Pickup") },
  { value: "Quotation", label: lt("Quotation") },
  { value: "CustomsClearance", label: lt("Customs Clearance") },
  { value: "Job", label: lt("Job") },
  { value: "Miscellaneous", label: lt("Miscellaneous") }
];
const billToPartyTypeOptions: ComboboxOption[] = [
  { value: "Customer", label: lt("Customer") },
  { value: "Vendor", label: lt("Vendor") },
  { value: "Agent", label: lt("Agent") },
  { value: "Carrier", label: lt("Carrier") }
];

function todayDateLocalValue() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function InvoiceForm({
  initialValue,
  onSubmit,
  onSaveItem,
  invoiceStatus,
  lockSourceFields,
  isSubmitting
}: {
  initialValue?: FormValue | null;
  onSubmit: (value: FormValue) => Promise<void>;
  onSaveItem?: (item: InvoiceItemRequest) => Promise<InvoiceItemRequest[]>;
  invoiceStatus?: string;
  lockSourceFields?: boolean;
  isSubmitting?: boolean;
}) {
  const { hasPermission } = useAuth();
  const workspace = useWorkspace();
  const toast = useToast();
  const currencies = useQuery({ queryKey: ["invoice-currencies", "tenant-enabled"], queryFn: getTenantCurrencies });
  const chargeHeads = useQuery({
    queryKey: ["invoice-charge-heads"],
    queryFn: () => getActiveChargeHeadsForDropdown("", "Invoice")
  });

  const canOverride = hasPermission("Invoice.Override");
  const [value, setValue] = useState<InvoiceRequest>(
    initialValue ?? {
      documentType: "Invoice",
      salesmanId: null,
      customerId: "",
      billToPartyType: "Customer",
      billToPartyId: null,
      billToPartyName: null,
      sourceType: "Custom",
      sourceId: null,
      sourceReferenceId: null,
      sourceReferenceNo: "",
      invoiceDate: todayDateLocalValue(),
      dueDate: todayDateLocalValue(),
      customerCurrencyId: "",
      invoiceCurrencyId: "",
      exchangeRate: 1,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null,
      roundOffAmount: 0,
      remarks: null,
      items: [createEmptyInvoiceItem()]
    }
  );

  useEffect(() => {
    if (!invoiceStatus || !initialValue) return;
    setValue(initialValue);
  }, [initialValue, invoiceStatus]);

  const sourceReference = useSourceReference(value.sourceType, value.sourceId);
  const sourceQuotation = useQuery({
    queryKey: ["invoice-source-quotation-charges", sourceReference.quotationId],
    queryFn: () => getQuotation(sourceReference.quotationId!),
    enabled: false,
    staleTime: 60 * 1000
  });
  const loadedQuotationRef = useRef<string | null>(null);

  const activeItems = useMemo(
    () => value.items.filter((item) => normalizeMode(item.operationMode, item.id) !== "Delete"),
    [value.items]
  );

  const subTotal = activeItems.reduce((sum, item) => sum + item.quantity * item.unitRate - item.discountAmount, 0);
  const tax = activeItems.reduce(
    (sum, item) =>
      sum + (item.isTaxApplicable ? ((item.quantity * item.unitRate - item.discountAmount) * item.taxRate) / 100 : 0),
    0
  );
  const total = subTotal + tax + value.roundOffAmount;
  const baseAmount = total * value.exchangeRate;
  const enabledCurrencies = (currencies.data ?? []).filter((currency) => currency.isEnabled);
  const baseCurrency = enabledCurrencies.find((currency) => currency.isBaseCurrency);
  const invoiceCurrencyCode = enabledCurrencies.find((x) => x.currencyId === value.invoiceCurrencyId)?.currencyCode ?? workspace.baseCurrency ?? "USD";
  const partyCurrencyCode = enabledCurrencies.find((x) => x.currencyId === value.customerCurrencyId)?.currencyCode ?? invoiceCurrencyCode;
  const baseCurrencyCode = baseCurrency?.currencyCode ?? workspace.baseCurrency ?? invoiceCurrencyCode;
  const shouldApplyDefaultRateRef = useRef(!invoiceStatus);
  const defaultRates = useQuery({
    queryKey: ["invoice-default-exchange-rate", value.invoiceCurrencyId, baseCurrency?.currencyId],
    queryFn: () => getExchangeRates(value.invoiceCurrencyId, baseCurrency!.currencyId),
    enabled: Boolean(value.invoiceCurrencyId && baseCurrency?.currencyId && value.invoiceCurrencyId !== baseCurrency.currencyId)
  });
  const defaultRate = (defaultRates.data ?? []).find((rate) => rate.effectiveDate <= value.invoiceDate);
  const billToPartyType = value.billToPartyType || "Customer";
  const currencyOptions = enabledCurrencies.map((x) => ({ value: x.currencyId, label: `${x.currencyCode} - ${x.currencyName ?? ""}`.trim() }));
  const chargeHeadOptions = (chargeHeads.data ?? []).map((x) => ({ value: x.id, label: `${x.mappingKey} - ${x.mappingName}` }));
  const isDraftEditable = !invoiceStatus || invoiceStatus === "Draft";
  const isCustomSource = value.sourceType === "Custom" || value.sourceType === "Miscellaneous";
  const isSourceLocked = Boolean(lockSourceFields);
  const isSalesmanLocked = isSourceLocked && Boolean(sourceReference.salesmanId || initialValue?.salesmanId);

  useEffect(() => {
    if (isCustomSource) return;
    if (!sourceReference.referenceNo && value.sourceReferenceNo) return;
    setValue((prev) => ({
      ...prev,
      sourceReferenceId: sourceReference.referenceId ?? prev.sourceId ?? null,
      sourceReferenceNo: sourceReference.referenceNo || prev.sourceReferenceNo || "",
      salesmanId: isSourceLocked && sourceReference.salesmanId ? sourceReference.salesmanId : prev.salesmanId || sourceReference.salesmanId || null
    }));
  }, [isCustomSource, isSourceLocked, sourceReference.referenceId, sourceReference.referenceNo, sourceReference.salesmanId, value.sourceReferenceNo]);

  async function loadQuotationCharges() {
    if (invoiceStatus || !sourceReference.quotationId) return;
    if (loadedQuotationRef.current === sourceReference.quotationId) {
      toast.info(lt("Charges already loaded"), lt("Quotation charges are already available for review."));
      return;
    }

    const result = await sourceQuotation.refetch();
    const quotation = result.data;
    if (!quotation?.id) {
      toast.error(lt("Quotation unavailable"), lt("Unable to load charges from the linked quotation."));
      return;
    }
    if (!quotation.charges.length) {
      toast.info(lt("No quotation charges"), `${quotation.quotationNumber} ${lt("does not contain charges to load.")}`);
      return;
    }

    const quotationItems: InvoiceItemRequest[] = quotation.charges.map((charge) => ({
      id: null,
      operationMode: "New",
      chargeCode: charge.chargeCode,
      chargeName: charge.chargeName,
      chargeHead: charge.chargeHeadName || charge.chargeName,
      quantity: charge.quantity,
      unitRate: charge.unitRate,
      discountAmount: charge.discountAmount,
      isTaxApplicable: charge.isTaxApplicable,
      taxRate: charge.taxRate
    }));

    setValue((prev) => ({
      ...prev,
      items: [
        ...prev.items.filter((item) => !isBlankInvoiceItem(item)),
        ...quotationItems
      ]
    }));
    loadedQuotationRef.current = quotation.id;
    toast.success(lt("Quotation charges loaded"), `${quotation.charges.length} ${lt("charge(s) from")} ${quotation.quotationNumber} ${lt("are ready for review.")}`);
  }

  useEffect(() => {
    if (!enabledCurrencies.length) return;
    const preferredCurrency =
      enabledCurrencies.find((x) => x.isBaseCurrency) ??
      enabledCurrencies.find((x) => x.currencyCode?.toUpperCase() === workspace.baseCurrency?.toUpperCase()) ??
      enabledCurrencies[0];
    if (!preferredCurrency?.currencyId) return;

    setValue((prev) => {
      if (prev.customerCurrencyId && prev.invoiceCurrencyId) return prev;
      return {
        ...prev,
        customerCurrencyId: prev.customerCurrencyId || preferredCurrency.currencyId,
        invoiceCurrencyId: prev.invoiceCurrencyId || preferredCurrency.currencyId
      };
    });
  }, [currencies.data, workspace.baseCurrency]);

  useEffect(() => {
    if (!defaultRate || !shouldApplyDefaultRateRef.current) return;
    shouldApplyDefaultRateRef.current = false;
    setValue((prev) => ({
      ...prev,
      exchangeRate: defaultRate.rate,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null
    }));
  }, [defaultRate, value.invoiceCurrencyId]);

  function changeInvoiceCurrency(invoiceCurrencyId: string) {
    shouldApplyDefaultRateRef.current = true;
    const isBaseCurrency = Boolean(invoiceCurrencyId && invoiceCurrencyId === baseCurrency?.currencyId);
    if (isBaseCurrency) shouldApplyDefaultRateRef.current = false;
    setValue((prev) => ({
      ...prev,
      invoiceCurrencyId,
      exchangeRate: isBaseCurrency ? 1 : 0,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null
    }));
  }

  function selectBillToParty(party: FinancePartyLookup | null) {
    const partyId = party?.id ?? "";
    const partyCurrencyId = party?.defaultCurrencyId && enabledCurrencies.some((currency) => currency.currencyId === party.defaultCurrencyId)
      ? party.defaultCurrencyId
      : baseCurrency?.currencyId ?? "";
    const isBaseCurrency = partyCurrencyId === baseCurrency?.currencyId;
    shouldApplyDefaultRateRef.current = Boolean(partyCurrencyId && !isBaseCurrency);
    setValue((prev) => ({
      ...prev,
      customerId: partyId,
      billToPartyId: partyId || null,
      billToPartyName: party ? `${party.code} - ${party.name}` : null,
      customerCurrencyId: partyCurrencyId,
      invoiceCurrencyId: partyCurrencyId,
      exchangeRate: isBaseCurrency ? 1 : 0,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null
    }));
  }

  function setItems(next: InvoiceItemRequest[]) {
    setValue((prev) => ({ ...prev, items: next }));
  }

  function addRow() {
    setItems([...value.items, createEmptyInvoiceItem()]);
  }

  async function handleSaveRow(item?: InvoiceItemRequest) {
    if (!value.customerCurrencyId || !value.invoiceCurrencyId) {
      toast.error(lt("Currency required"), lt("Please select customer currency and invoice currency."));
      return;
    }
    if (!isDraftEditable) {
      toast.error(lt("Invoice locked"), lt("Only draft invoices can be changed."));
      return;
    }
    if (value.isExchangeRateOverride && !canOverride) {
      toast.error(lt("Permission required"), lt("Invoice.Override permission is required."));
      return;
    }
    if (value.isExchangeRateOverride && !value.exchangeRateOverrideReason?.trim()) {
      toast.error(lt("Override reason required"), lt("Please provide reason for exchange rate override."));
      return;
    }
    if (item && onSaveItem) {
      const refreshedItems = await onSaveItem(item);
      setItems(refreshedItems);
      return;
    }
    await onSubmit(value);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={lt("Salesman (optional)")}>
          <SalesmanSelect value={value.salesmanId} onChange={(salesmanId) => setValue({ ...value, salesmanId })} disabled={isSalesmanLocked} />
          {isSalesmanLocked ? <div className="text-xs text-muted-foreground">{lt("Locked because this salesman is inherited from the operation.")}</div> : null}
          {initialValue?.salesmanName ? <div className="text-xs text-muted-foreground">{lt("Current")}: {initialValue.salesmanName}</div> : null}
        </Field>
        <Field label={lt("Bill To Type")} required>
          <FilterableSelect
            value={billToPartyType}
            onChange={(next) => setValue({ ...value, billToPartyType: next as InvoiceRequest["billToPartyType"], billToPartyId: null, billToPartyName: null, customerId: "" })}
            options={billToPartyTypeOptions}
            placeholder={lt("Select party type")}
          />
        </Field>
        <Field label={lt("Bill To")} required>
          <FinancePartyAutocomplete
            partyType={billToPartyType as FinancePartyType}
            value={value.billToPartyId || value.customerId}
            onChange={selectBillToParty}
            placeholder={lt("Search party by name, code, or phone")}
          />
        </Field>
        <Field label={lt("Invoice Source Type")} required>
          <FilterableSelect
            value={value.sourceType}
            onChange={(next) => setValue({ ...value, sourceType: next, sourceId: null, sourceReferenceId: null, sourceReferenceNo: "" })}
            options={invoiceSourceTypeOptions}
            placeholder={lt("Select source type")}
            disabled={isSourceLocked}
          />
          {isSourceLocked ? <div className="text-xs text-muted-foreground">{lt("Locked because this invoice was created from an operation module.")}</div> : null}
        </Field>
        <Field label={lt("Source Reference No")}>
          <Input
            value={sourceReference.referenceNo || value.sourceReferenceNo || ""}
            readOnly={isSourceLocked || !isCustomSource}
            placeholder={isCustomSource ? lt("Enter custom reference no, PO no, or manual note") : value.sourceId ? lt("Loading source reference...") : lt("Source is assigned in the background")}
            className={isSourceLocked || !isCustomSource ? "bg-slate-50" : ""}
            onChange={(event) => {
              if (isSourceLocked) return;
              setValue({ ...value, sourceReferenceNo: event.target.value, sourceReferenceId: null, sourceId: null });
            }}
          />
        </Field>
        <Field label={lt("Invoice Date")} required>
          <Input
            type="date"
            value={value.invoiceDate}
            onChange={(e) => {
              if (!invoiceStatus && value.invoiceCurrencyId !== baseCurrency?.currencyId) shouldApplyDefaultRateRef.current = true;
              setValue({ ...value, invoiceDate: e.target.value });
            }}
          />
        </Field>
        <Field label={lt("Due Date")} required>
          <Input type="date" value={value.dueDate} onChange={(e) => setValue({ ...value, dueDate: e.target.value })} />
        </Field>
        <Field label={`${lt("Invoice Currency")} (${invoiceCurrencyCode})`} required>
          <FilterableSelect
            value={value.invoiceCurrencyId}
            onChange={changeInvoiceCurrency}
            options={currencyOptions}
            placeholder={lt("Select currency")}
            disabled
          />
          <div className="text-xs text-muted-foreground">{lt("Locked to the selected Bill To party currency.")}</div>
        </Field>
        <Field label={`${lt("Party Currency")} (${partyCurrencyCode})`} required>
          <FilterableSelect
            value={value.customerCurrencyId}
            onChange={(next) => setValue({ ...value, customerCurrencyId: next })}
            options={currencyOptions}
            placeholder={lt("Select currency")}
            disabled
          />
        </Field>
        <Field label={`${lt("Exchange Rate")} (${baseCurrencyCode} ${lt("per")} ${invoiceCurrencyCode})`} required>
          <Input
            type="number"
            min="0"
            value={value.exchangeRate}
            onChange={(e) => setValue({ ...value, exchangeRate: Math.max(0, Number(e.target.value)) })}
          />
          {value.invoiceCurrencyId && value.invoiceCurrencyId !== baseCurrency?.currencyId ? (
            <p className="text-xs text-muted-foreground">
              {defaultRates.isLoading
                ? lt("Loading saved default exchange rate...")
                : defaultRate
                  ? `${lt("Default rate effective")} ${defaultRate.effectiveDate}: 1 ${invoiceCurrencyCode} = ${defaultRate.rate} ${baseCurrencyCode}`
                  : `${lt("No saved exchange rate exists on or before the invoice date. Enter a manual rate with permission and reason.")}`}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{lt("Base currency invoices use exchange rate 1.")}</p>
          )}
        </Field>
        <label className="flex items-center gap-2 pt-7 text-sm">
          <input
            type="checkbox"
            checked={value.isExchangeRateOverride}
            onChange={(e) => setValue({ ...value, isExchangeRateOverride: e.target.checked })}
            disabled={!canOverride}
          />
          {lt("Manual Rate Override")}
        </label>
        <Field label={lt("Override Reason")} required={value.isExchangeRateOverride}>
          <Input
            value={value.exchangeRateOverrideReason ?? ""}
            onChange={(e) => setValue({ ...value, exchangeRateOverrideReason: e.target.value || null })}
            disabled={!value.isExchangeRateOverride || !canOverride}
          />
        </Field>
        <Field label={`${lt("Round Off")} (${invoiceCurrencyCode})`}>
          <Input
            type="number"
            value={value.roundOffAmount}
            onChange={(e) => setValue({ ...value, roundOffAmount: Number(e.target.value) })}
          />
        </Field>
        <Field label={lt("Remarks")}>
          <Input value={value.remarks ?? ""} onChange={(e) => setValue({ ...value, remarks: e.target.value || null })} />
        </Field>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">{lt("Charge Heads")}</h3>
          <div className="flex flex-wrap gap-2">
            {!invoiceStatus && sourceReference.quotationId && (value.sourceType === "HouseShipment" || value.sourceType === "DirectShipment") ? (
              <Button type="button" variant="outline" onClick={() => void loadQuotationCharges()} disabled={sourceQuotation.isFetching}>
                <RefreshCcw className={`h-4 w-4 ${sourceQuotation.isFetching ? "animate-spin" : ""}`} />
                {sourceQuotation.isFetching ? lt("Loading...") : lt("Load Quotation Charges")}
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={addRow} disabled={!isDraftEditable}>
              <Plus className="h-4 w-4" />{lt("Add")}</Button>
          </div>
        </div>

        <div className="grid gap-3 lg:hidden">
          {value.items.map((item, index) => {
            const mode = normalizeMode(item.operationMode, item.id);
            const selectedHead = (chargeHeads.data ?? []).find((head) => head.mappingName === item.chargeHead || head.mappingKey === item.chargeCode);
            const disabled = mode === "Delete";

            return (
              <div key={item.id ?? `mobile-new-${index}`} className={`rounded-lg border p-3 shadow-sm ${disabled ? "bg-red-50/60 line-through" : "bg-white"}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{lt("Charge")} {index + 1}</p>
                    <p className="text-xs text-muted-foreground">{item.chargeName || item.chargeCode || lt("New invoice charge")}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{lt(mode)}</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={lt("Charge Head")} required>
                    <FilterableSelect
                      value={selectedHead?.id ?? ""}
                      onChange={(next) => {
                        const head = (chargeHeads.data ?? []).find((entry) => entry.id === next);
                        updateInvoiceRow(value.items, index, {
                          chargeHead: head?.mappingName ?? "",
                          chargeCode: head?.mappingKey ?? "",
                          chargeName: head?.mappingName ?? item.chargeName
                        }, setItems);
                      }}
                      disabled={disabled}
                      options={chargeHeadOptions}
                      placeholder={lt("Select charge head")}
                    />
                  </Field>
                  <Field label={lt("Code")} required><Input value={item.chargeCode} onChange={(e) => updateInvoiceRow(value.items, index, { chargeCode: e.target.value }, setItems)} disabled={disabled} /></Field>
                  <Field label={lt("Name")} required><Input value={item.chargeName} onChange={(e) => updateInvoiceRow(value.items, index, { chargeName: e.target.value }, setItems)} disabled={disabled} /></Field>
                  <Field label={lt("Quantity")} required><Input type="number" min="0" value={item.quantity} onChange={(e) => updateInvoiceRow(value.items, index, { quantity: Math.max(0, Number(e.target.value)) }, setItems)} disabled={disabled} /></Field>
                  <Field label={`Rate (${invoiceCurrencyCode})`} required><Input type="number" min="0" value={item.unitRate} onChange={(e) => updateInvoiceRow(value.items, index, { unitRate: Math.max(0, Number(e.target.value)) }, setItems)} disabled={disabled} /></Field>
                  <Field label={`Discount (${invoiceCurrencyCode})`}><Input type="number" min="0" value={item.discountAmount} onChange={(e) => updateInvoiceRow(value.items, index, { discountAmount: Math.max(0, Number(e.target.value)) }, setItems)} disabled={disabled} /></Field>
                  <Field label={lt("Tax")}>
                    <div className="flex h-10 items-center gap-2">
                      <input type="checkbox" checked={item.isTaxApplicable} onChange={(e) => updateInvoiceRow(value.items, index, { isTaxApplicable: e.target.checked }, setItems)} disabled={disabled} />
                      <Input className="min-w-0" type="number" min="0" value={item.taxRate} onChange={(e) => updateInvoiceRow(value.items, index, { taxRate: Math.max(0, Number(e.target.value)) }, setItems)} disabled={disabled} />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </Field>
                  <Field label={`Line Total (${invoiceCurrencyCode})`}>
                    <div className="flex h-10 items-center rounded-md border bg-slate-50 px-3 text-sm font-semibold">
                      {invoiceLineTotal(item).toFixed(2)}
                    </div>
                  </Field>
                </div>

                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t pt-3">
                  <Button type="button" size="sm" variant="outline" disabled={!isDraftEditable} onClick={() => void handleSaveRow(value.items[index])}>{lt("Save")}</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!isDraftEditable}
                    onClick={() => {
                      if (!item.id || item.id === EMPTY_GUID) {
                        setItems(value.items.filter((_, idx) => idx !== index));
                        return;
                      }
                      updateInvoiceRow(value.items, index, { operationMode: "Delete" }, setItems);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" /> {lt("Delete")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto rounded-lg border lg:block">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 text-left"><RequiredHeader>{lt("Charge Head")}</RequiredHeader></th>
                <th className="p-2 text-left"><RequiredHeader>{lt("Code")}</RequiredHeader></th>
                <th className="p-2 text-left"><RequiredHeader>{lt("Name")}</RequiredHeader></th>
                <th className="p-2 text-left"><RequiredHeader>{lt("Qty")}</RequiredHeader></th>
                <th className="p-2 text-left"><RequiredHeader>{lt("Rate")} ({invoiceCurrencyCode})</RequiredHeader></th>
                <th className="p-2 text-left">{lt("Discount")} ({invoiceCurrencyCode})</th>
                <th className="p-2 text-left">{lt("Tax %")}</th>
                <th className="p-2 text-left">{lt("Operation")}</th>
                <th className="p-2 text-right">{lt("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {value.items.map((item, index) => {
                const mode = normalizeMode(item.operationMode, item.id);
                const selectedHead = (chargeHeads.data ?? []).find((head) => head.mappingName === item.chargeHead || head.mappingKey === item.chargeCode);
                const disabled = mode === "Delete";

                return (
                  <tr key={item.id ?? `new-${index}`} className={disabled ? "border-t bg-red-50/60 line-through" : "border-t"}>
                    <td className="p-2">
                      <FilterableSelect
                        value={selectedHead?.id ?? ""}
                        onChange={(next) => {
                          const head = (chargeHeads.data ?? []).find((entry) => entry.id === next);
                          updateInvoiceRow(value.items, index, {
                            chargeHead: head?.mappingName ?? "",
                            chargeCode: head?.mappingKey ?? "",
                            chargeName: head?.mappingName ?? item.chargeName
                          }, setItems);
                        }}
                        disabled={disabled}
                        options={chargeHeadOptions}
                        placeholder={lt("Select charge head")}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={item.chargeCode}
                        onChange={(e) => updateInvoiceRow(value.items, index, { chargeCode: e.target.value }, setItems)}
                        disabled={disabled}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={item.chargeName}
                        onChange={(e) => updateInvoiceRow(value.items, index, { chargeName: e.target.value }, setItems)}
                        disabled={disabled}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceRow(value.items, index, { quantity: Math.max(0, Number(e.target.value)) }, setItems)}
                        disabled={disabled}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.unitRate}
                        onChange={(e) => updateInvoiceRow(value.items, index, { unitRate: Math.max(0, Number(e.target.value)) }, setItems)}
                        disabled={disabled}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.discountAmount}
                        onChange={(e) => updateInvoiceRow(value.items, index, { discountAmount: Math.max(0, Number(e.target.value)) }, setItems)}
                        disabled={disabled}
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isTaxApplicable}
                          onChange={(e) => updateInvoiceRow(value.items, index, { isTaxApplicable: e.target.checked }, setItems)}
                          disabled={disabled}
                        />
                        <Input
                          type="number"
                          min="0"
                          value={item.taxRate}
                          onChange={(e) => updateInvoiceRow(value.items, index, { taxRate: Math.max(0, Number(e.target.value)) }, setItems)}
                          disabled={disabled}
                        />
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {lt(mode)}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="sm" variant="outline" disabled={!isDraftEditable} onClick={() => void handleSaveRow(value.items[index])}>{lt("Save")}</Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={!isDraftEditable}
                          onClick={() => {
                            if (!item.id || item.id === EMPTY_GUID) {
                              setItems(value.items.filter((_, idx) => idx !== index));
                              return;
                            }
                            updateInvoiceRow(value.items, index, { operationMode: "Delete" }, setItems);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 text-sm">
        {lt("SubTotal")} ({invoiceCurrencyCode}): {subTotal.toFixed(2)} | {lt("Tax")} ({invoiceCurrencyCode}): {tax.toFixed(2)} | {lt("Total")} ({invoiceCurrencyCode}): {total.toFixed(2)} | {lt("Base Amount")} ({baseCurrencyCode}):{" "}
        {baseAmount.toFixed(2)}
      </div>

      <LedgerPostingPreview
        lines={[
          { id: "1", account: lt("Customer Receivable"), debit: total, credit: 0, currency: invoiceCurrencyCode },
          { id: "2", account: lt("Revenue"), debit: 0, credit: subTotal, currency: invoiceCurrencyCode },
          { id: "3", account: lt("Tax Payable"), debit: 0, credit: tax, currency: invoiceCurrencyCode }
        ]}
      />

      <PermissionButton
        permission={initialValue ? "Invoice.Update" : "Invoice.Create"}
        onClick={() => {
          if (!isDraftEditable) {
            toast.error(lt("Invoice locked"), lt("Only draft invoices can be changed."));
            return;
          }
          if (value.isExchangeRateOverride && !canOverride) {
            toast.error(lt("Permission required"), lt("Invoice.Override permission is required."));
            return;
          }
          if (value.isExchangeRateOverride && !value.exchangeRateOverrideReason?.trim()) {
            toast.error(lt("Override reason required"), lt("Please provide reason for exchange rate override."));
            return;
          }
          void handleSaveRow();
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? lt("Saving...") : lt("Save Invoice")}
      </PermissionButton>
    </div>
  );
}

function Field({ label, children, required }: { label: React.ReactNode; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label>{label}{required ? <RequiredMark /> : null}</Label>
      {children}
    </div>
  );
}

function RequiredHeader({ children }: { children: React.ReactNode }) {
  return <>{children}<RequiredMark /></>;
}

function RequiredMark() {
  return <span className="ml-1 text-red-600">*</span>;
}

function FilterableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) {
  const selected = options.find((x) => x.value === value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(selected?.label ?? "");
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

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
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <Input
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        className="pr-9"
        onFocus={() => {
          openMenu(true);
        }}
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
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
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
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">{lt("No matching options")}</div>
          )}
        </div>,
        document.body
      ) : null}
    </div>
  );
}

function createEmptyInvoiceItem(): InvoiceItemRequest {
  return {
    id: null,
    operationMode: "New",
    chargeCode: "",
    chargeName: "",
    chargeHead: "",
    quantity: 1,
    unitRate: 0,
    discountAmount: 0,
    isTaxApplicable: false,
    taxRate: 0
  };
}

function normalizeMode(mode: InvoiceItemRequest["operationMode"], id?: string | null): "New" | "Update" | "Delete" {
  if (mode === "New" || mode === "Update" || mode === "Delete") return mode;
  return id && id !== EMPTY_GUID ? "Update" : "New";
}

function updateInvoiceRow(
  items: InvoiceItemRequest[],
  index: number,
  patch: Partial<InvoiceItemRequest>,
  setItems: (items: InvoiceItemRequest[]) => void
) {
  const next = [...items];
  const current = { ...next[index], ...patch };
  if (!patch.operationMode) {
    current.operationMode = current.id && current.id !== EMPTY_GUID ? "Update" : "New";
  }
  next[index] = current;
  setItems(next);
}

function isBlankInvoiceItem(item: InvoiceItemRequest) {
  return !item.id
    && !item.chargeCode.trim()
    && !item.chargeName.trim()
    && !item.chargeHead.trim()
    && item.unitRate === 0;
}

function invoiceLineTotal(item: InvoiceItemRequest) {
  const net = (item.quantity * item.unitRate) - item.discountAmount;
  return net + (item.isTaxApplicable ? net * item.taxRate / 100 : 0);
}

function useSourceReference(sourceType: string, sourceId?: string | null) {
  const enabled = Boolean(sourceId);
  const houseShipment = useQuery({
    queryKey: ["invoice-source-reference-house", sourceId],
    queryFn: () => getHouseShipment(sourceId!),
    enabled: enabled && sourceType === "HouseShipment"
  });
  const goodsReceipt = useQuery({
    queryKey: ["invoice-source-reference-grn", sourceId],
    queryFn: () => getGoodsReceipt(sourceId!),
    enabled: enabled && sourceType === "GoodsReceipt"
  });
  const directShipment = useQuery({
    queryKey: ["invoice-source-reference-direct", sourceId],
    queryFn: () => getDirectShipment(sourceId!),
    enabled: enabled && sourceType === "DirectShipment"
  });
  const masterShipment = useQuery({
    queryKey: ["invoice-source-reference-master", sourceId],
    queryFn: () => getMasterShipment(sourceId!),
    enabled: enabled && sourceType === "MasterShipment"
  });
  const pickup = useQuery({
    queryKey: ["invoice-source-reference-pickup", sourceId],
    queryFn: () => getPickup(sourceId!),
    enabled: enabled && sourceType === "Pickup"
  });
  const quotation = useQuery({
    queryKey: ["invoice-source-reference-quotation", sourceId],
    queryFn: () => getQuotation(sourceId!),
    enabled: enabled && sourceType === "Quotation"
  });
  const customs = useQuery({
    queryKey: ["invoice-source-reference-customs", sourceId],
    queryFn: () => getCustomsJob(sourceId!),
    enabled: enabled && sourceType === "CustomsClearance"
  });
  const job = useQuery({
    queryKey: ["invoice-source-reference-job", sourceId],
    queryFn: () => getJobByGuid(sourceId!),
    enabled: enabled && sourceType === "Job"
  });

  if (!sourceId) return { referenceId: null, referenceNo: "", salesmanId: null, quotationId: null };
  if (sourceType === "HouseShipment" && houseShipment.data) return { referenceId: houseShipment.data.id, referenceNo: houseShipment.data.hawbNumber || houseShipment.data.houseShipmentNumber, salesmanId: houseShipment.data.salesmanId ?? null, quotationId: houseShipment.data.quotationId ?? null };
  if (sourceType === "GoodsReceipt" && goodsReceipt.data) return { referenceId: goodsReceipt.data.id, referenceNo: goodsReceipt.data.goodsReceiptNumber, salesmanId: goodsReceipt.data.salesmanId ?? null, quotationId: null };
  if (sourceType === "DirectShipment" && directShipment.data) return { referenceId: directShipment.data.id, referenceNo: directShipment.data.mawbNumber || directShipment.data.directShipmentNumber, salesmanId: directShipment.data.salesmanId ?? null, quotationId: directShipment.data.quotationId ?? null };
  if (sourceType === "MasterShipment" && masterShipment.data) return { referenceId: masterShipment.data.id, referenceNo: masterShipment.data.mawbNumber || masterShipment.data.mblNumber || masterShipment.data.masterShipmentNumber, salesmanId: masterShipment.data.salesmanId ?? null, quotationId: null };
  if (sourceType === "Pickup" && pickup.data) return { referenceId: pickup.data.id, referenceNo: pickup.data.pickupReceiptNumber || pickup.data.pickupNumber, salesmanId: pickup.data.salesmanId ?? null, quotationId: null };
  if (sourceType === "Quotation" && quotation.data) return { referenceId: quotation.data.id, referenceNo: quotation.data.quotationNumber, salesmanId: null, quotationId: quotation.data.id };
  if (sourceType === "CustomsClearance" && customs.data) return { referenceId: customs.data.id, referenceNo: customs.data.jobNumber, salesmanId: null, quotationId: null };
  if (sourceType === "Job" && job.data) return { referenceId: job.data.id, referenceNo: job.data.jobNumber, salesmanId: null, quotationId: null };
  return { referenceId: sourceId, referenceNo: "", salesmanId: null, quotationId: null };
}
