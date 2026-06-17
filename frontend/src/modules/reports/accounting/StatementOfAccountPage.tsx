import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getCurrencies } from "@/api/currencyApi";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";

type Row = {
  date: string;
  documentNumber: string;
  documentType: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
  currencyId: string;
  baseDebit: number;
  baseCredit: number;
  baseBalance: number;
};

export function StatementOfAccountPage() {
  const workspace = useWorkspace();
  const currencies = useQuery({ queryKey: ["statement-of-account", "currencies"], queryFn: getCurrencies });
  const currencyById = useMemo(() => new Map((currencies.data ?? []).map((currency) => [currency.id, currency.currencyCode])), [currencies.data]);

  const currencyCode = (currencyId: string) => currencyById.get(currencyId) ?? workspace.baseCurrency;
  const baseCurrencyCode = workspace.baseCurrency;
  const formatCurrency = (amount: number, code: string) => new Intl.NumberFormat(workspace.cultureCode, { style: "currency", currency: code }).format(amount);

  const columns = useMemo<ColumnDef<Row>[]>(() => [
    { accessorKey: "date", header: lt("Date") },
    { accessorKey: "documentNumber", header: lt("Document") },
    { accessorKey: "documentType", header: lt("Type"), cell: ({ row }) => lt(row.original.documentType) },
    { accessorKey: "narration", header: lt("Narration") },
    { id: "currencyCode", header: lt("Currency"), cell: ({ row }) => currencyCode(row.original.currencyId) },
    { accessorKey: "debit", header: lt("Debit"), cell: ({ row }) => <CurrencyAmount value={row.original.debit} currency={currencyCode(row.original.currencyId)} /> },
    { accessorKey: "credit", header: lt("Credit"), cell: ({ row }) => <CurrencyAmount value={row.original.credit} currency={currencyCode(row.original.currencyId)} /> },
    { accessorKey: "balance", header: lt("Balance"), cell: ({ row }) => <CurrencyAmount value={row.original.balance} currency={currencyCode(row.original.currencyId)} /> },
    { accessorKey: "baseDebit", header: `${lt("Base Debit")} (${baseCurrencyCode})`, cell: ({ row }) => <CurrencyAmount value={row.original.baseDebit} currency={baseCurrencyCode} /> },
    { accessorKey: "baseCredit", header: `${lt("Base Credit")} (${baseCurrencyCode})`, cell: ({ row }) => <CurrencyAmount value={row.original.baseCredit} currency={baseCurrencyCode} /> },
    { accessorKey: "baseBalance", header: `${lt("Base Balance")} (${baseCurrencyCode})`, cell: ({ row }) => <CurrencyAmount value={row.original.baseBalance} currency={baseCurrencyCode} /> }
  ], [baseCurrencyCode, currencyById]);

  return (
    <AccountingReportPage<Row>
      title={lt("Statement of Account")}
      reportType="statement-of-account"
      needsCustomer
      needsVendor
      mapRows={(data) => Array.isArray(data) ? data as Row[] : []}
      columns={columns}
      summaryBuilder={(rows) => {
        const closingByCurrency = closingBalancesByCurrency(rows, currencyCode);
        return [
          { label: lt("Transactions"), value: rows.length },
          ...Array.from(closingByCurrency.entries()).map(([code, amount]) => ({
            label: `${lt("Closing Balance")} (${code})`,
            value: formatCurrency(amount, code)
          })),
          {
            label: `${lt("Closing Base Balance")} (${baseCurrencyCode})`,
            value: formatCurrency(closingBaseBalance(rows), baseCurrencyCode)
          }
        ];
      }}
      totalsBuilder={(rows) => {
        const totalsByCurrency = debitCreditTotalsByCurrency(rows, currencyCode);
        return [
          ...Array.from(totalsByCurrency.entries()).flatMap(([code, totals]) => [
            { label: `${lt("Debit Total")} (${code})`, value: formatCurrency(totals.debit, code) },
            { label: `${lt("Credit Total")} (${code})`, value: formatCurrency(totals.credit, code) }
          ]),
          {
            label: `${lt("Base Debit Total")} (${baseCurrencyCode})`,
            value: formatCurrency(rows.reduce((sum, row) => sum + row.baseDebit, 0), baseCurrencyCode)
          },
          {
            label: `${lt("Base Credit Total")} (${baseCurrencyCode})`,
            value: formatCurrency(rows.reduce((sum, row) => sum + row.baseCredit, 0), baseCurrencyCode)
          }
        ];
      }}
      prepareClientExport={(rows) => {
        const includeBaseCurrency = window.confirm(lt("Include base currency columns in this export?"));
        const exportColumns = [
          { key: "date", label: lt("Date") },
          { key: "documentNumber", label: lt("Document") },
          { key: "documentType", label: lt("Type") },
          { key: "narration", label: lt("Narration") },
          { key: "currencyCode", label: lt("Currency") },
          { key: "debit", label: lt("Debit") },
          { key: "credit", label: lt("Credit") },
          { key: "balance", label: lt("Balance") },
          ...(includeBaseCurrency ? [
            { key: "baseDebit", label: `${lt("Base Debit")} (${baseCurrencyCode})` },
            { key: "baseCredit", label: `${lt("Base Credit")} (${baseCurrencyCode})` },
            { key: "baseBalance", label: `${lt("Base Balance")} (${baseCurrencyCode})` }
          ] : [])
        ];
        const exportRows: Record<string, unknown>[] = rows.map((row) => ({
          date: row.date,
          documentNumber: row.documentNumber,
          documentType: lt(row.documentType),
          narration: row.narration,
          currencyCode: currencyCode(row.currencyId),
          debit: row.debit,
          credit: row.credit,
          balance: row.balance,
          ...(includeBaseCurrency ? { baseDebit: row.baseDebit, baseCredit: row.baseCredit, baseBalance: row.baseBalance } : {})
        }));
        debitCreditTotalsByCurrency(rows, currencyCode).forEach((totals, code) => {
          exportRows.push({
            date: `${lt("Debit Total")} (${code})`,
            documentNumber: "",
            documentType: "",
            narration: "",
            currencyCode: code,
            debit: totals.debit,
            credit: "",
            balance: "",
            ...(includeBaseCurrency ? { baseDebit: "", baseCredit: "", baseBalance: "" } : {})
          });
          exportRows.push({
            date: `${lt("Credit Total")} (${code})`,
            documentNumber: "",
            documentType: "",
            narration: "",
            currencyCode: code,
            debit: "",
            credit: totals.credit,
            balance: "",
            ...(includeBaseCurrency ? { baseDebit: "", baseCredit: "", baseBalance: "" } : {})
          });
        });
        if (includeBaseCurrency) {
          exportRows.push({
            date: lt("Base Total"),
            documentNumber: "",
            documentType: "",
            narration: "",
            currencyCode: baseCurrencyCode,
            debit: "",
            credit: "",
            balance: "",
            baseDebit: rows.reduce((sum, row) => sum + row.baseDebit, 0),
            baseCredit: rows.reduce((sum, row) => sum + row.baseCredit, 0),
            baseBalance: closingBaseBalance(rows)
          });
        }
        return { columns: exportColumns, rows: exportRows };
      }}
    />
  );
}

function debitCreditTotalsByCurrency(rows: Row[], currencyCode: (currencyId: string) => string) {
  const totals = new Map<string, { debit: number; credit: number }>();
  rows.forEach((row) => {
    const code = currencyCode(row.currencyId);
    const current = totals.get(code) ?? { debit: 0, credit: 0 };
    current.debit += row.debit;
    current.credit += row.credit;
    totals.set(code, current);
  });
  return totals;
}

function closingBalancesByCurrency(rows: Row[], currencyCode: (currencyId: string) => string) {
  const balances = new Map<string, number>();
  chronologicalRows(rows).forEach((row) => balances.set(currencyCode(row.currencyId), row.balance));
  return balances;
}

function closingBaseBalance(rows: Row[]) {
  return chronologicalRows(rows).at(-1)?.baseBalance ?? 0;
}

function chronologicalRows(rows: Row[]) {
  return [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.documentNumber.localeCompare(b.documentNumber));
}
