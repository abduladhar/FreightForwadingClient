import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, RefreshCw, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getBankAccounts, getCashAccounts } from "@/api/accountingApi";
import { getCurrencies } from "@/api/currencyApi";
import { createBulkPayment, type BulkVendorPaymentRequest } from "@/api/paymentApi";
import type { PendingBillDto } from "@/api/reconciliationApi";
import { getPendingBills } from "@/api/reconciliationApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { useAuth } from "@/auth/useAuth";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

type SelectedVoucher = {
  vendorBillId: string;
  paymentAmount: number;
};

export function PayMultipleVouchersPage() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentCurrencyId, setPaymentCurrencyId] = useState("");
  const [baseCurrencyId, setBaseCurrencyId] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [bankCharges, setBankCharges] = useState(0);
  const [bankAccountId, setBankAccountId] = useState("");
  const [cashAccountId, setCashAccountId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [autoApprove, setAutoApprove] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, SelectedVoucher>>({});

  const pendingBills = useQuery({ queryKey: ["bulk-payment-pending-bills"], queryFn: () => getPendingBills() });
  const currencies = useQuery({ queryKey: ["bulk-payment-currencies"], queryFn: getCurrencies });
  const bankAccounts = useQuery({ queryKey: ["bulk-payment-bank-accounts"], queryFn: () => getBankAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const cashAccounts = useQuery({ queryKey: ["bulk-payment-cash-accounts"], queryFn: () => getCashAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });

  const selectedRows = useMemo(() => Object.values(selected), [selected]);
  const billById = useMemo(() => new Map((pendingBills.data ?? []).map((x) => [x.vendorBillId, x])), [pendingBills.data]);
  const selectedBills = useMemo(() => selectedRows.map((x) => billById.get(x.vendorBillId)).filter(Boolean) as PendingBillDto[], [billById, selectedRows]);
  const totalPaymentAmount = useMemo(() => selectedRows.reduce((sum, x) => sum + x.paymentAmount, 0), [selectedRows]);
  const payeeCount = useMemo(() => new Set(selectedBills.map((x) => `${x.payToPartyType}:${x.payToPartyId}`)).size, [selectedBills]);
  const filteredBills = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = (pendingBills.data ?? []).filter((x) => x.outstandingAmount > 0);
    if (!term) return rows;
    return rows.filter((x) => [
      x.vendorBillNumber,
      x.payToPartyName,
      x.payToPartyType,
      x.totalAmount.toString(),
      x.outstandingAmount.toString()
    ].some((value) => value.toLowerCase().includes(term)));
  }, [pendingBills.data, search]);

  useEffect(() => {
    if (!baseCurrencyId && currencies.data?.[0]?.id) setBaseCurrencyId(currencies.data[0].id);
  }, [baseCurrencyId, currencies.data]);

  useEffect(() => {
    if (!hasPermission("Payment.Approve")) setAutoApprove(false);
  }, [hasPermission]);

  const mutation = useMutation({
    mutationFn: createBulkPayment,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      await queryClient.invalidateQueries({ queryKey: ["bulk-payment-pending-bills"] });
      toast.success(lt("Bulk payment created"), `${result.paymentCount} ${lt("payment voucher(s) created for")} ${result.totalPaymentAmount.toFixed(2)}.`);
      navigate("/payments");
    }
  });

  const errors = validateBulkRequest(selectedRows, billById, paymentDate, paymentCurrencyId, baseCurrencyId, exchangeRate, bankCharges, bankAccountId, cashAccountId);
  const canSubmit = errors.length === 0 && selectedRows.length > 0 && !mutation.isPending;

  function toggleBill(bill: PendingBillDto) {
    setSelected((current) => {
      const next = { ...current };
      if (next[bill.vendorBillId]) {
        delete next[bill.vendorBillId];
        return next;
      }
      const nextCurrencyId = paymentCurrencyId || bill.billCurrencyId;
      if (!paymentCurrencyId) setPaymentCurrencyId(nextCurrencyId);
      next[bill.vendorBillId] = { vendorBillId: bill.vendorBillId, paymentAmount: roundMoney(bill.outstandingAmount) };
      return next;
    });
  }

  function setVoucherAmount(vendorBillId: string, paymentAmount: number) {
    setSelected((current) => ({ ...current, [vendorBillId]: { ...current[vendorBillId], paymentAmount: roundMoney(Math.max(0, paymentAmount)) } }));
  }

  function submit() {
    const request: BulkVendorPaymentRequest = {
      paymentDate,
      paymentCurrencyId,
      baseCurrencyId,
      exchangeRate,
      bankCharges,
      bankAccountId: bankAccountId || null,
      cashAccountId: cashAccountId || null,
      remarks: remarks || null,
      autoApprove,
      vouchers: selectedRows.map((x) => ({ vendorBillId: x.vendorBillId, paymentAmount: x.paymentAmount }))
    };
    void mutation.mutateAsync(request);
  }

  return <div className="space-y-4">
    <PageHeader
      title={lt("Pay Multiple Vouchers")}
      description={lt("Select unpaid or partially paid vendor bills, enter payable amounts, and create grouped payment vouchers in one operation.")}
      actions={<><Button asChild variant="outline"><Link to="/payments"><ArrowLeft className="h-4 w-4" />{lt("Payments")}</Link></Button><AuditTrailButton /></>}
    />

    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label={lt("Payment Date")}><Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} /></Field>
          <Field label={lt("Payment Currency")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={paymentCurrencyId} onChange={(e) => setPaymentCurrencyId(e.target.value)}>
              <option value="">{lt("Select currency")}</option>
              {(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}
            </select>
          </Field>
          <Field label={lt("Base Currency")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={baseCurrencyId} onChange={(e) => setBaseCurrencyId(e.target.value)}>
              <option value="">{lt("Select currency")}</option>
              {(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}
            </select>
          </Field>
          <Field label={lt("Exchange Rate")}><Input type="number" min="0" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} /></Field>
          <Field label={lt("Bank Charges")}><Input type="number" min="0" value={bankCharges} onChange={(e) => setBankCharges(Number(e.target.value))} /></Field>
          <Field label={lt("Bank Account")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={bankAccountId} onChange={(e) => { setBankAccountId(e.target.value); if (e.target.value) setCashAccountId(""); }}>
              <option value="">{lt("Select bank account")}</option>
              {(bankAccounts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.bankName} - {x.accountNumber}</option>)}
            </select>
          </Field>
          <Field label={lt("Cash Account")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={cashAccountId} onChange={(e) => { setCashAccountId(e.target.value); if (e.target.value) setBankAccountId(""); }}>
              <option value="">{lt("Select cash account")}</option>
              {(cashAccounts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.cashAccountName}</option>)}
            </select>
          </Field>
          <Field label={lt("Remarks")}><Input value={remarks} onChange={(e) => setRemarks(e.target.value)} /></Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoApprove} disabled={!hasPermission("Payment.Approve")} onChange={(e) => setAutoApprove(e.target.checked)} />
          {lt("Approve and post accounting entries after creating payment vouchers")}
        </label>
        {!hasPermission("Payment.Approve") ? <p className="text-xs text-amber-700">{lt("You can create draft bulk payments. Approval and posting require Payment.Approve permission.")}</p> : null}
      </CardContent>
    </Card>

    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold">{lt("Pending Vouchers")}</h3>
              <p className="text-xs text-muted-foreground">{lt("Only vouchers with outstanding balance can be selected.")}</p>
            </div>
            <div className="flex gap-2">
              <Input className="w-full md:w-72" value={search} placeholder={lt("Search voucher, party, amount...")} onChange={(e) => setSearch(e.target.value)} />
              <Button type="button" variant="outline" onClick={() => void pendingBills.refetch()}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button>
            </div>
          </div>
          <div className="max-h-[560px] overflow-auto rounded-lg border">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="p-2 text-center">{lt("Pay")}</th>
                  <th className="p-2 text-left">{lt("Voucher No")}</th>
                  <th className="p-2 text-left">{lt("Payee")}</th>
                  <th className="p-2 text-right">{lt("Total")}</th>
                  <th className="p-2 text-right">{lt("Paid")}</th>
                  <th className="p-2 text-right">{lt("Outstanding")}</th>
                  <th className="p-2 text-left">{lt("Payment Amount")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const selectedRow = selected[bill.vendorBillId];
                  const disabledByCurrency = Boolean(paymentCurrencyId && bill.billCurrencyId !== paymentCurrencyId && !selectedRow);
                  return <tr key={bill.vendorBillId} className="border-t">
                    <td className="p-2 text-center"><input type="checkbox" checked={Boolean(selectedRow)} disabled={disabledByCurrency} onChange={() => toggleBill(bill)} /></td>
                    <td className="p-2 font-medium">{bill.vendorBillNumber}</td>
                    <td className="p-2"><span className="font-medium">{bill.payToPartyName || lt(bill.payToPartyType)}</span><span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{lt(bill.payToPartyType)}</span></td>
                    <td className="p-2 text-right">{bill.totalAmount.toFixed(2)}</td>
                    <td className="p-2 text-right">{bill.paidAmount.toFixed(2)}</td>
                    <td className="p-2 text-right">{bill.outstandingAmount.toFixed(2)}</td>
                    <td className="p-2">
                      <Input className="w-36" type="number" min="0" max={bill.outstandingAmount} disabled={!selectedRow} value={selectedRow?.paymentAmount ?? ""} onChange={(e) => setVoucherAmount(bill.vendorBillId, Number(e.target.value))} />
                      {disabledByCurrency ? <p className="mt-1 text-xs text-amber-700">{lt("Different currency")}</p> : null}
                    </td>
                  </tr>;
                })}
                {!pendingBills.isLoading && filteredBills.length === 0 ? <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">{lt("No pending vouchers found.")}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm text-slate-300"><Wallet className="h-4 w-4" />{lt("Bulk Payment Total")}</div>
            <div className="mt-2 text-3xl font-semibold"><CurrencyAmount value={totalPaymentAmount} /></div>
          </div>
          <div className="grid gap-2 text-sm">
            <SummaryRow label={lt("Selected vouchers")} value={selectedRows.length.toString()} />
            <SummaryRow label={lt("Payee groups")} value={payeeCount.toString()} />
            <SummaryRow label={lt("Bank charges")} value={bankCharges.toFixed(2)} />
            <SummaryRow label={lt("Mode")} value={autoApprove ? lt("Create and approve") : lt("Create draft")} />
          </div>
          {errors.length > 0 ? <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{errors.map((x) => <p key={x}>{x}</p>)}</div> : null}
          <PermissionButton permission="Payment.Create" className="w-full" disabled={!canSubmit} onClick={submit}>
            <CheckCircle2 className="h-4 w-4" /> {mutation.isPending ? lt("Creating...") : lt("Create Bulk Payment")}
          </PermissionButton>
        </CardContent>
      </Card>
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-md border px-3 py-2"><span className="text-muted-foreground">{label}</span><strong>{value}</strong></div>;
}

function validateBulkRequest(selected: SelectedVoucher[], bills: Map<string, PendingBillDto>, paymentDate: string, paymentCurrencyId: string, baseCurrencyId: string, exchangeRate: number, bankCharges: number, bankAccountId: string, cashAccountId: string) {
  const errors: string[] = [];
  if (!paymentDate) errors.push(lt("Payment date is required."));
  if (!paymentCurrencyId) errors.push(lt("Payment currency is required."));
  if (!baseCurrencyId) errors.push(lt("Base currency is required."));
  if (exchangeRate <= 0) errors.push(lt("Exchange rate must be greater than zero."));
  if (bankCharges < 0) errors.push(lt("Bank charges cannot be negative."));
  if (Boolean(bankAccountId) === Boolean(cashAccountId)) errors.push(lt("Select either bank account or cash account."));
  if (selected.length === 0) errors.push(lt("Select at least one voucher."));
  for (const row of selected) {
    const bill = bills.get(row.vendorBillId);
    if (!bill) errors.push(lt("Selected voucher is no longer available."));
    if (bill && bill.billCurrencyId !== paymentCurrencyId) errors.push(`${bill.vendorBillNumber}: ${lt("voucher currency must match payment currency.")}`);
    if (row.paymentAmount <= 0) errors.push(`${bill?.vendorBillNumber ?? lt("Voucher")}: ${lt("payment amount must be greater than zero.")}`);
    if (bill && row.paymentAmount > bill.outstandingAmount) errors.push(`${bill.vendorBillNumber}: ${lt("payment amount exceeds outstanding.")}`);
  }
  const total = selected.reduce((sum, x) => sum + x.paymentAmount, 0);
  if (total <= 0) errors.push(lt("Total payment amount must be greater than zero."));
  if (bankCharges > total) errors.push(lt("Bank charges cannot exceed total payment amount."));
  return Array.from(new Set(errors));
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
