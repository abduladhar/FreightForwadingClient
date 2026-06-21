import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getActiveChargeHeadsForDropdown } from "@/api/chargeHeadApi";
import { getCustomsJob } from "@/api/customsApi";
import { getExchangeRates, getTenantCurrencies } from "@/api/currencyApi";
import { getDirectShipment } from "@/api/directShipmentApi";
import { getGoodsReceipt } from "@/api/goodsReceiptApi";
import { getHouseShipment } from "@/api/houseShipmentApi";
import { getJobByGuid } from "@/api/jobApi";
import { getMasterShipment } from "@/api/masterShipmentApi";
import { getPickup } from "@/api/pickupApi";
import type { VendorBillItemRequest, VendorBillRequest } from "@/api/vendorBillApi";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
import { LedgerPostingPreview } from "@/components/common/LedgerPostingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { FinancePartyAutocomplete, type FinancePartyLookup, type FinancePartyType } from "@/components/common/FinancePartyAutocomplete";
import { lt } from "@/modules/operationsLocalization";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const billSourceTypes = ["Pickup", "GoodsReceipt", "HouseShipment", "MasterShipment", "DirectShipment", "CustomsClearance", "Job", "WarehouseService", "TransportationService", "Miscellaneous"];
const partyTypes = ["Customer", "Vendor", "Agent", "Carrier"];

function todayDateLocalValue() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function VendorBillForm({
  initialValue,
  billStatus = "Draft",
  onSubmit,
  onSaveItem,
  isSubmitting
}: {
  initialValue?: VendorBillRequest | null;
  billStatus?: string;
  onSubmit: (value: VendorBillRequest) => Promise<void>;
  onSaveItem?: (item: VendorBillItemRequest) => Promise<VendorBillItemRequest[]>;
  isSubmitting?: boolean;
}) {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const canOverride = hasPermission("VendorBill.Override");
  const isDraftEditable = billStatus === "Draft";
  const [value, setValue] = useState<VendorBillRequest>(
    initialValue ?? {
      vendorId: "",
      salesmanId: null,
      payToPartyType: "Vendor",
      payToPartyId: null,
      payToPartyName: null,
      sourceType: "DirectShipment",
      sourceId: null,
      sourceReferenceId: null,
      sourceReferenceNo: null,
      billDate: todayDateLocalValue(),
      dueDate: todayDateLocalValue(),
      vendorCurrencyId: "",
      billCurrencyId: "",
      exchangeRate: 1,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null,
      expectedCostAmount: 0,
      remarks: null,
      items: [createEmptyBillItem()]
    }
  );

  useEffect(() => {
    if (!initialValue) return;
    setValue(initialValue);
  }, [initialValue]);

  const currencies = useQuery({ queryKey: ["vendor-bill-currencies", "tenant-enabled"], queryFn: getTenantCurrencies });
  const chargeHeads = useQuery({ queryKey: ["vendor-bill-charge-heads"], queryFn: () => getActiveChargeHeadsForDropdown("", "VendorBill") });
  const pickupReference = useQuery({
    queryKey: ["vendor-bill-source-reference", "Pickup", value.sourceId],
    queryFn: () => getPickup(value.sourceId!),
    enabled: value.sourceType === "Pickup" && Boolean(value.sourceId)
  });
  const goodsReceiptReference = useQuery({
    queryKey: ["vendor-bill-source-reference", "GoodsReceipt", value.sourceId],
    queryFn: () => getGoodsReceipt(value.sourceId!),
    enabled: value.sourceType === "GoodsReceipt" && Boolean(value.sourceId)
  });
  const houseShipmentReference = useQuery({
    queryKey: ["vendor-bill-source-reference", "HouseShipment", value.sourceId],
    queryFn: () => getHouseShipment(value.sourceId!),
    enabled: value.sourceType === "HouseShipment" && Boolean(value.sourceId)
  });
  const directShipmentReference = useQuery({
    queryKey: ["vendor-bill-source-reference", "DirectShipment", value.sourceId],
    queryFn: () => getDirectShipment(value.sourceId!),
    enabled: value.sourceType === "DirectShipment" && Boolean(value.sourceId)
  });
  const masterShipmentReference = useQuery({
    queryKey: ["vendor-bill-source-reference", "MasterShipment", value.sourceId],
    queryFn: () => getMasterShipment(value.sourceId!),
    enabled: value.sourceType === "MasterShipment" && Boolean(value.sourceId)
  });
  const customsReference = useQuery({
    queryKey: ["vendor-bill-source-reference", "CustomsClearance", value.sourceId],
    queryFn: () => getCustomsJob(value.sourceId!),
    enabled: value.sourceType === "CustomsClearance" && Boolean(value.sourceId)
  });
  const jobReference = useQuery({
    queryKey: ["vendor-bill-source-reference", "Job", value.sourceId],
    queryFn: () => getJobByGuid(value.sourceId!),
    enabled: value.sourceType === "Job" && Boolean(value.sourceId)
  });

  useEffect(() => {
    const reference = value.sourceType === "Pickup"
      ? pickupReference.data ? { id: pickupReference.data.id, number: pickupReference.data.pickupNumber } : null
      : value.sourceType === "GoodsReceipt"
        ? goodsReceiptReference.data ? { id: goodsReceiptReference.data.id, number: goodsReceiptReference.data.goodsReceiptNumber } : null
        : value.sourceType === "HouseShipment"
          ? houseShipmentReference.data ? { id: houseShipmentReference.data.id, number: houseShipmentReference.data.hawbNumber || houseShipmentReference.data.houseShipmentNumber } : null
          : value.sourceType === "DirectShipment"
            ? directShipmentReference.data ? { id: directShipmentReference.data.id, number: directShipmentReference.data.mawbNumber || directShipmentReference.data.directShipmentNumber } : null
            : value.sourceType === "MasterShipment"
              ? masterShipmentReference.data ? { id: masterShipmentReference.data.id, number: masterShipmentReference.data.mawbNumber || masterShipmentReference.data.mblNumber || masterShipmentReference.data.masterShipmentNumber } : null
              : value.sourceType === "CustomsClearance"
                ? customsReference.data ? { id: customsReference.data.id, number: customsReference.data.jobNumber } : null
                : value.sourceType === "Job"
                  ? jobReference.data ? { id: jobReference.data.id, number: jobReference.data.jobNumber } : null
                  : null;
    if (!reference?.number || value.sourceReferenceNo === reference.number) return;
    setValue((current) => ({ ...current, sourceReferenceId: reference.id, sourceReferenceNo: reference.number }));
  }, [customsReference.data, directShipmentReference.data, goodsReceiptReference.data, houseShipmentReference.data, jobReference.data, masterShipmentReference.data, pickupReference.data, value.sourceReferenceNo, value.sourceType]);

  const partyType = value.payToPartyType || "Vendor";
  const enabledCurrencies = (currencies.data ?? []).filter((currency) => currency.isEnabled);
  const activeItems = value.items.filter((item) => normalizeMode(item.operationMode, item.id) !== "Delete");
  const subTotal = activeItems.reduce((s, x) => s + x.quantity * x.unitRate, 0);
  const discount = activeItems.reduce((s, x) => s + x.discountAmount, 0);
  const tax = activeItems.reduce((s, x) => s + (x.isTaxApplicable ? ((x.quantity * x.unitRate - x.discountAmount) * x.taxRate) / 100 : 0), 0);
  const total = subTotal - discount + tax;
  const baseCurrency = enabledCurrencies.find((currency) => currency.isBaseCurrency);
  const billCurrencyCode = enabledCurrencies.find((x) => x.currencyId === value.billCurrencyId)?.currencyCode ?? "USD";
  const vendorCurrencyCode = enabledCurrencies.find((x) => x.currencyId === value.vendorCurrencyId)?.currencyCode ?? billCurrencyCode;
  const baseCurrencyCode = baseCurrency?.currencyCode ?? billCurrencyCode;
  const baseAmount = total * value.exchangeRate;
  const shouldApplyDefaultRateRef = useRef(!initialValue);
  const defaultRates = useQuery({
    queryKey: ["vendor-bill-default-exchange-rate", value.billCurrencyId, baseCurrency?.currencyId],
    queryFn: () => getExchangeRates(value.billCurrencyId, baseCurrency!.currencyId),
    enabled: Boolean(value.billCurrencyId && baseCurrency?.currencyId && value.billCurrencyId !== baseCurrency.currencyId)
  });
  const defaultRate = (defaultRates.data ?? []).find((rate) => rate.effectiveDate <= value.billDate);

  useEffect(() => {
    if (!enabledCurrencies.length) return;
    const preferredCurrency = enabledCurrencies.find((currency) => currency.isBaseCurrency) ?? enabledCurrencies[0];
    if (!preferredCurrency?.currencyId) return;
    setValue((current) => {
      if (current.vendorCurrencyId && current.billCurrencyId) return current;
      return {
        ...current,
        vendorCurrencyId: current.vendorCurrencyId || preferredCurrency.currencyId,
        billCurrencyId: current.billCurrencyId || preferredCurrency.currencyId
      };
    });
  }, [currencies.data]);

  useEffect(() => {
    if (!defaultRate || !shouldApplyDefaultRateRef.current) return;
    shouldApplyDefaultRateRef.current = false;
    setValue((current) => ({
      ...current,
      exchangeRate: defaultRate.rate,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null
    }));
  }, [defaultRate, value.billCurrencyId]);

  function changeBillCurrency(billCurrencyId: string) {
    shouldApplyDefaultRateRef.current = true;
    const isBaseCurrency = Boolean(billCurrencyId && billCurrencyId === baseCurrency?.currencyId);
    if (isBaseCurrency) shouldApplyDefaultRateRef.current = false;
    setValue((current) => ({
      ...current,
      billCurrencyId,
      exchangeRate: isBaseCurrency ? 1 : 0,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null
    }));
  }

  function selectPayToParty(party: FinancePartyLookup | null) {
    const partyId = party?.id ?? "";
    const partyCurrencyId = party?.defaultCurrencyId && enabledCurrencies.some((currency) => currency.currencyId === party.defaultCurrencyId)
      ? party.defaultCurrencyId
      : baseCurrency?.currencyId ?? "";
    const isBaseCurrency = partyCurrencyId === baseCurrency?.currencyId;
    shouldApplyDefaultRateRef.current = Boolean(partyCurrencyId && !isBaseCurrency);
    setValue((current) => ({
      ...current,
      vendorId: partyId,
      payToPartyId: partyId || null,
      payToPartyName: party ? `${party.code} - ${party.name}` : null,
      vendorCurrencyId: partyCurrencyId,
      billCurrencyId: partyCurrencyId,
      exchangeRate: isBaseCurrency ? 1 : 0,
      isExchangeRateOverride: false,
      exchangeRateOverrideReason: null
    }));
  }

  function setItems(next: VendorBillItemRequest[]) {
    setValue((current) => ({ ...current, items: next }));
  }

  function addRow() {
    setItems([...value.items, createEmptyBillItem()]);
  }

  async function handleSaveRow(item?: VendorBillItemRequest) {
    if (!isDraftEditable) {
      toast.error(lt("Vendor bill locked"), lt("Only draft vendor bills can be changed."));
      return;
    }
    if (value.isExchangeRateOverride && !canOverride) {
      toast.error(lt("Permission required"), lt("VendorBill.Override permission is required."));
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
          <SalesmanSelect value={value.salesmanId} onChange={(salesmanId) => setValue({ ...value, salesmanId })} />
        </Field>
        <Field label={lt("Pay To Type")} required>
          <select className="h-10 w-full rounded-md border px-3 text-sm" value={partyType} onChange={(e) => setValue({ ...value, payToPartyType: e.target.value, payToPartyId: null, payToPartyName: null, vendorId: "" })}>
            {partyTypes.map((type) => <option key={type} value={type}>{lt(type)}</option>)}
          </select>
        </Field>
        <Field label={lt("Pay To")} required>
          <FinancePartyAutocomplete
            partyType={partyType as FinancePartyType}
            value={value.payToPartyId || value.vendorId}
            onChange={selectPayToParty}
            placeholder={lt("Search party by name, code, or phone")}
          />
        </Field>
        <Field label={lt("Bill Source Type")} required>
          <select className="h-10 w-full rounded-md border px-3 text-sm" value={value.sourceType} onChange={(e) => setValue({ ...value, sourceType: e.target.value, sourceReferenceId: null, sourceReferenceNo: null })}>
            {billSourceTypes.map((type) => <option key={type} value={type}>{displaySourceType(type)}</option>)}
          </select>
        </Field>
        <Field label={lt("Source Reference No")}>
          <Input value={value.sourceReferenceNo ?? ""} readOnly placeholder={value.sourceId ? (pickupReference.isLoading || goodsReceiptReference.isLoading || houseShipmentReference.isLoading || directShipmentReference.isLoading || masterShipmentReference.isLoading || customsReference.isLoading || jobReference.isLoading) ? lt("Loading source reference...") : lt("Assigned by server") : lt("No source selected")} className="bg-slate-50" />
        </Field>
        <Field label={lt("Bill Date")} required><Input type="date" value={value.billDate} onChange={(e) => { if (!initialValue && value.billCurrencyId !== baseCurrency?.currencyId) shouldApplyDefaultRateRef.current = true; setValue({ ...value, billDate: e.target.value }); }} /></Field>
        <Field label={lt("Due Date")} required><Input type="date" value={value.dueDate} onChange={(e) => setValue({ ...value, dueDate: e.target.value })} /></Field>
        <Field label={`${lt("Bill Currency")} (${billCurrencyCode})`} required>
          <select className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm" value={value.billCurrencyId} onChange={(e) => changeBillCurrency(e.target.value)} disabled>
            <option value="">{lt("Select currency")}</option>
            {enabledCurrencies.map((x) => <option key={x.currencyId} value={x.currencyId}>{x.currencyCode} - {x.currencyName}</option>)}
          </select>
          <div className="text-xs text-muted-foreground">{lt("Locked to the selected Pay To party currency.")}</div>
        </Field>
        <Field label={`${lt("Vendor Currency")} (${vendorCurrencyCode})`} required>
          <select className="h-10 w-full rounded-md border bg-slate-50 px-3 text-sm" value={value.vendorCurrencyId} onChange={(e) => setValue({ ...value, vendorCurrencyId: e.target.value })} disabled>
            <option value="">{lt("Select currency")}</option>
            {enabledCurrencies.map((x) => <option key={x.currencyId} value={x.currencyId}>{x.currencyCode} - {x.currencyName}</option>)}
          </select>
        </Field>
        <Field label={`${lt("Exchange Rate")} (${baseCurrencyCode} ${lt("per")} ${billCurrencyCode})`} required>
          <Input type="number" min="0" value={value.exchangeRate} onChange={(e) => setValue({ ...value, exchangeRate: Math.max(0, Number(e.target.value)) })} />
          {value.billCurrencyId && value.billCurrencyId !== baseCurrency?.currencyId ? (
            <p className="text-xs text-muted-foreground">
              {defaultRates.isLoading
                ? lt("Loading saved default exchange rate...")
                : defaultRate
                  ? `${lt("Default rate effective")} ${defaultRate.effectiveDate}: 1 ${billCurrencyCode} = ${defaultRate.rate} ${baseCurrencyCode}`
                  : lt("No saved exchange rate exists on or before the bill date. Enter a manual rate with permission and reason.")}
            </p>
          ) : <p className="text-xs text-muted-foreground">{lt("Base currency bills use exchange rate 1.")}</p>}
        </Field>
        <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={value.isExchangeRateOverride} onChange={(e) => setValue({ ...value, isExchangeRateOverride: e.target.checked })} disabled={!canOverride} /> {lt("Manual Rate Override")}</label>
        <Field label={lt("Override Reason")} required={value.isExchangeRateOverride}><Input value={value.exchangeRateOverrideReason ?? ""} onChange={(e) => setValue({ ...value, exchangeRateOverrideReason: e.target.value || null })} disabled={!value.isExchangeRateOverride || !canOverride} /></Field>
        <Field label={`${lt("Expected Cost")} (${billCurrencyCode})`}><Input type="number" value={value.expectedCostAmount} onChange={(e) => setValue({ ...value, expectedCostAmount: Number(e.target.value) })} /></Field>
        <Field label={lt("Remarks")}><Input value={value.remarks ?? ""} onChange={(e) => setValue({ ...value, remarks: e.target.value || null })} /></Field>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{lt("Cost Heads")}</h3>
          <Button type="button" variant="outline" onClick={addRow} disabled={!isDraftEditable}><Plus className="h-4 w-4" />{lt("Add")}</Button>
        </div>
        <div className="overflow-auto rounded-lg border">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 text-left"><RequiredHeader>{lt("Charge Head")}</RequiredHeader></th>
                <th className="p-2 text-left"><RequiredHeader>{lt("Code")}</RequiredHeader></th>
                <th className="p-2 text-left"><RequiredHeader>{lt("Name")}</RequiredHeader></th>
                <th className="p-2 text-left"><RequiredHeader>{lt("Qty")}</RequiredHeader></th>
                <th className="p-2 text-left"><RequiredHeader>{lt("Rate")} ({billCurrencyCode})</RequiredHeader></th>
                <th className="p-2 text-left">{lt("Discount")} ({billCurrencyCode})</th>
                <th className="p-2 text-left">{lt("Tax %")}</th>
                <th className="p-2 text-left">{lt("Operation")}</th>
                <th className="p-2 text-right">{lt("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {value.items.map((item, index) => {
                const mode = normalizeMode(item.operationMode, item.id);
                const selected = (chargeHeads.data ?? []).find((head) => head.mappingName === item.costHead || head.mappingKey === item.costCode);
                const disabled = mode === "Delete";
                return (
                  <tr key={item.id ?? `new-${index}`} className={disabled ? "border-t bg-red-50/60 line-through" : "border-t"}>
                    <td className="p-2">
                      <select className="h-10 min-w-56 rounded-md border px-3 text-sm" value={selected?.id ?? ""} disabled={disabled} onChange={(e) => { const head = (chargeHeads.data ?? []).find((entry) => entry.id === e.target.value); updateBillRow(value.items, index, { costCode: head?.mappingKey ?? "", costName: head?.mappingName ?? "", costHead: head?.mappingName ?? "" }, setItems); }}>
                        <option value="">{lt("Select charge head")}</option>
                        {(chargeHeads.data ?? []).map((head) => <option key={head.id} value={head.id}>{head.mappingKey} - {head.mappingName}</option>)}
                      </select>
                    </td>
                    <td className="p-2"><Input value={item.costCode} disabled={disabled} onChange={(e) => updateBillRow(value.items, index, { costCode: e.target.value }, setItems)} /></td>
                    <td className="p-2"><Input value={item.costName} disabled={disabled} onChange={(e) => updateBillRow(value.items, index, { costName: e.target.value }, setItems)} /></td>
                    <td className="p-2"><Input type="number" min="0" value={item.quantity} disabled={disabled} onChange={(e) => updateBillRow(value.items, index, { quantity: Math.max(0, Number(e.target.value)) }, setItems)} /></td>
                    <td className="p-2"><Input type="number" min="0" value={item.unitRate} disabled={disabled} onChange={(e) => updateBillRow(value.items, index, { unitRate: Math.max(0, Number(e.target.value)) }, setItems)} /></td>
                    <td className="p-2"><Input type="number" min="0" value={item.discountAmount} disabled={disabled} onChange={(e) => updateBillRow(value.items, index, { discountAmount: Math.max(0, Number(e.target.value)) }, setItems)} /></td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <input type="checkbox" checked={item.isTaxApplicable} disabled={disabled} onChange={(e) => updateBillRow(value.items, index, { isTaxApplicable: e.target.checked }, setItems)} />
                        <Input type="number" min="0" value={item.taxRate} disabled={disabled} onChange={(e) => updateBillRow(value.items, index, { taxRate: Math.max(0, Number(e.target.value)) }, setItems)} />
                      </div>
                    </td>
                    <td className="p-2"><span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{lt(mode)}</span></td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="sm" variant="outline" disabled={!isDraftEditable} onClick={() => void handleSaveRow(value.items[index])}>{lt("Save")}</Button>
                        <Button type="button" variant="ghost" size="sm" disabled={!isDraftEditable} onClick={() => {
                          if (!item.id || item.id === EMPTY_GUID) {
                            setItems(value.items.filter((_, idx) => idx !== index));
                            return;
                          }
                          updateBillRow(value.items, index, { operationMode: "Delete" }, setItems);
                        }}>
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
        {lt("Expected")} ({billCurrencyCode}): {value.expectedCostAmount.toFixed(2)} | {lt("Actual")} ({billCurrencyCode}): {total.toFixed(2)} | {lt("Variance")} ({billCurrencyCode}): {(total - value.expectedCostAmount).toFixed(2)} | {lt("Base Amount")} ({baseCurrencyCode}): {baseAmount.toFixed(2)}
      </div>
      <LedgerPostingPreview lines={[{ id: "1", account: lt("Expense Accounts"), debit: subTotal - discount, credit: 0, currency: billCurrencyCode }, { id: "2", account: lt("Tax Receivable"), debit: tax, credit: 0, currency: billCurrencyCode }, { id: "3", account: lt("Payable"), debit: 0, credit: total, currency: billCurrencyCode }]} />
      <PermissionButton permission={initialValue ? "VendorBill.Update" : "VendorBill.Create"} onClick={() => void handleSaveRow()} disabled={isSubmitting || !isDraftEditable}>{isSubmitting ? lt("Saving...") : lt("Save Vendor Bill")}</PermissionButton>
      {!isDraftEditable ? <p className="text-sm text-muted-foreground">{lt("Approved, paid, partially paid, and cancelled vendor bills cannot be changed.")}</p> : null}
    </div>
  );
}

function Field({ label, children, required }: { label: ReactNode; children: ReactNode; required?: boolean }) { return <div className="space-y-1"><Label>{label}{required ? <RequiredMark /> : null}</Label>{children}</div>; }

function RequiredHeader({ children }: { children: ReactNode }) { return <>{children}<RequiredMark /></>; }

function RequiredMark() { return <span className="ml-1 text-red-600">*</span>; }

function createEmptyBillItem(): VendorBillItemRequest {
  return {
    id: null,
    operationMode: "New",
    costCode: "",
    costName: "",
    costHead: "",
    shipmentId: null,
    shipmentType: null,
    allocationAmount: 0,
    quantity: 1,
    unitRate: 0,
    discountAmount: 0,
    isTaxApplicable: false,
    taxRate: 0
  };
}

function normalizeMode(mode: VendorBillItemRequest["operationMode"], id?: string | null): "New" | "Update" | "Delete" {
  if (mode === "New" || mode === "Update" || mode === "Delete") return mode;
  return id && id !== EMPTY_GUID ? "Update" : "New";
}

function displaySourceType(sourceType: string) {
  switch (sourceType) {
    case "GoodsReceipt":
      return lt("Goods Receipt Note");
    case "HouseShipment":
      return lt("House Shipment");
    case "MasterShipment":
      return lt("Master Shipment");
    case "DirectShipment":
      return lt("Direct Shipment");
    case "CustomsClearance":
      return lt("Customs Clearance");
    case "WarehouseService":
      return lt("Warehouse Service");
    case "TransportationService":
      return lt("Transportation Service");
    default:
      return lt(sourceType);
  }
}

function updateBillRow(
  items: VendorBillItemRequest[],
  index: number,
  patch: Partial<VendorBillItemRequest>,
  setItems: (items: VendorBillItemRequest[]) => void
) {
  const next = [...items];
  const current = { ...next[index], ...patch };
  if (!patch.operationMode) {
    current.operationMode = current.id && current.id !== EMPTY_GUID ? "Update" : "New";
  }
  next[index] = current;
  setItems(next);
}
