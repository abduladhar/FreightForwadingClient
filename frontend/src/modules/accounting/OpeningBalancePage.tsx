import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, ListPlus, Plus, Save, Trash2 } from "lucide-react";
import { getFinancialYears, getLedgerAccounts, getOpeningBalances, upsertOpeningBalances, type OpeningBalanceDto } from "@/api/accountingApi";
import { getCurrencies } from "@/api/currencyApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";
import { formatCurrencyAmount } from "@/utils/currencyFormat";

interface OpeningBalanceFormRow {
  rowId: string;
  ledgerAccountId: string;
  currencyId: string;
  debitAmount: number;
  creditAmount: number;
  remarks: string;
}

const emptyRow = (): OpeningBalanceFormRow => ({
  rowId: crypto.randomUUID(),
  ledgerAccountId: "",
  currencyId: "",
  debitAmount: 0,
  creditAmount: 0,
  remarks: ""
});

export function OpeningBalancePage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [financialYearId, setFinancialYearId] = useState("");
  const [rows, setRows] = useState<OpeningBalanceFormRow[]>([emptyRow()]);

  const queryClient = useQueryClient();
  const toast = useToast();
  const years = useQuery({ queryKey: ["opening-years"], queryFn: () => getFinancialYears({ pageNumber: 1, pageSize: 100 }) });
  const ledgers = useQuery({ queryKey: ["opening-ledgers"], queryFn: () => getLedgerAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const currencies = useQuery({ queryKey: ["opening-currencies"], queryFn: getCurrencies });
  const query = useQuery({ queryKey: ["opening-balances", pageNumber, pageSize], queryFn: () => getOpeningBalances({ pageNumber, pageSize }) });

  const yearById = useMemo(() => new Map((years.data?.items ?? []).map((item) => [item.id, item])), [years.data?.items]);
  const ledgerById = useMemo(() => new Map((ledgers.data?.items ?? []).map((item) => [item.id, item])), [ledgers.data?.items]);
  const currencyById = useMemo(() => new Map((currencies.data ?? []).map((item) => [item.id, item])), [currencies.data]);

  const formTotals = useMemo(() => rows.reduce(
    (sum, row) => ({ debit: sum.debit + Number(row.debitAmount || 0), credit: sum.credit + Number(row.creditAmount || 0) }),
    { debit: 0, credit: 0 }
  ), [rows]);
  const difference = Number((formTotals.debit - formTotals.credit).toFixed(2));
  const isBalanced = Math.abs(difference) < 0.01;

  const validLines = useMemo(() => rows
    .filter((row) => row.ledgerAccountId && ((row.debitAmount > 0 && row.creditAmount === 0) || (row.creditAmount > 0 && row.debitAmount === 0)))
    .map((row) => ({
      ledgerAccountId: row.ledgerAccountId,
      currencyId: row.currencyId || null,
      debitAmount: Number(row.debitAmount || 0),
      creditAmount: Number(row.creditAmount || 0),
      remarks: row.remarks.trim() || "Opening balance migrated from current system"
    })), [rows]);

  const save = useMutation({
    mutationFn: upsertOpeningBalances,
    onSuccess: async (_, variables) => {
      toast.success(variables.isApproved ? lt("Opening balances approved") : lt("Opening balances saved"));
      setRows([emptyRow()]);
      await queryClient.invalidateQueries({ queryKey: ["opening-balances"] });
    }
  });

  const updateRow = (rowId: string, patch: Partial<OpeningBalanceFormRow>) => {
    setRows((current) => current.map((row) => row.rowId === rowId ? { ...row, ...patch } : row));
  };

  const setDebit = (rowId: string, value: number) => updateRow(rowId, { debitAmount: value, creditAmount: value > 0 ? 0 : rows.find((row) => row.rowId === rowId)?.creditAmount ?? 0 });
  const setCredit = (rowId: string, value: number) => updateRow(rowId, { creditAmount: value, debitAmount: value > 0 ? 0 : rows.find((row) => row.rowId === rowId)?.debitAmount ?? 0 });
  const canSaveDraft = Boolean(financialYearId && validLines.length > 0) && !save.isPending;
  const canApprove = canSaveDraft && isBalanced;

  const submit = (isApproved: boolean) => {
    if (!financialYearId) {
      toast.error(lt("Financial year required"), lt("Select a financial year before saving opening balances."));
      return;
    }
    if (validLines.length === 0) {
      toast.error(lt("No valid lines"), lt("Add at least one ledger line with either debit or credit amount."));
      return;
    }
    if (isApproved && !isBalanced) {
      toast.error(lt("Opening balance not balanced"), lt("Total debit and total credit should be same before approval."));
      return;
    }
    void save.mutateAsync({ financialYearId, lines: validLines, isApproved });
  };

  const loadAllLedgers = () => {
    const ledgerRows = (ledgers.data?.items ?? []).map((ledger) => ({
      ...emptyRow(),
      ledgerAccountId: ledger.id,
      currencyId: ledger.currencyId ?? "",
      remarks: "Opening balance migrated from current system"
    }));
    setRows(ledgerRows.length ? ledgerRows : [emptyRow()]);
  };

  const listTotals = useMemo(() => {
    return (query.data?.items ?? []).reduce(
      (sum, row) => ({
        debit: sum.debit + row.debitAmount,
        credit: sum.credit + row.creditAmount
      }),
      { debit: 0, credit: 0 }
    );
  }, [query.data?.items]);

  const formatAmount = (value: number, rowCurrencyId?: string | null) => {
    const currencyCode = currencyById.get(rowCurrencyId ?? "")?.currencyCode;
    if (!currencyCode) return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatCurrencyAmount(value, { currencyCode });
  };

  const columns = useMemo<ColumnDef<OpeningBalanceDto>[]>(() => [
    { id: "financialYear", header: lt("Financial Year"), cell: ({ row }) => yearById.get(row.original.financialYearId)?.yearCode ?? row.original.financialYearId },
    {
      id: "ledger",
      header: lt("Ledger"),
      cell: ({ row }) => {
        const ledger = ledgerById.get(row.original.ledgerAccountId);
        return ledger ? `${ledger.ledgerCode} - ${ledger.ledgerName}` : row.original.ledgerAccountId;
      }
    },
    { id: "currency", header: lt("Currency"), cell: ({ row }) => currencyById.get(row.original.currencyId ?? "")?.currencyCode ?? "-" },
    { accessorKey: "debitAmount", header: lt("Debit"), cell: ({ row }) => formatAmount(row.original.debitAmount, row.original.currencyId) },
    { accessorKey: "creditAmount", header: lt("Credit"), cell: ({ row }) => formatAmount(row.original.creditAmount, row.original.currencyId) },
    { accessorKey: "remarks", header: lt("Remarks"), cell: ({ row }) => row.original.remarks || "-" },
    { id: "status", header: lt("Status"), cell: ({ row }) => <Badge tone={row.original.isApproved ? "green" : "amber"}>{lt(row.original.isApproved ? "Approved" : "Draft")}</Badge> }
  ], [currencyById, ledgerById, yearById]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={lt("Opening Balances")}
        description={lt("Enter all ledger opening balances from the current system and approve only when debit and credit totals match.")}
        actions={<AuditTrailButton />}
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto_auto] md:items-end">
            <Field label={lt("Financial Year")}>
              <select aria-label={lt("Financial Year")} className="h-10 w-full rounded-md border px-3 text-sm" value={financialYearId} onChange={(event) => setFinancialYearId(event.target.value)}>
                <option value="">{lt("Select financial year")}</option>
                {(years.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.yearCode}</option>)}
              </select>
            </Field>
            <Button type="button" variant="outline" onClick={loadAllLedgers} disabled={ledgers.isLoading}>
              <ListPlus className="h-4 w-4" />
              {lt("Load All Ledgers")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setRows((current) => [...current, emptyRow()])}>
              <Plus className="h-4 w-4" />
              {lt("Add Line")}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="w-[34%] px-3 py-2 text-left font-medium">{lt("Ledger")}</th>
                  <th className="w-[15%] px-3 py-2 text-left font-medium">{lt("Currency")}</th>
                  <th className="w-[14%] px-3 py-2 text-right font-medium">{lt("Debit")}</th>
                  <th className="w-[14%] px-3 py-2 text-right font-medium">{lt("Credit")}</th>
                  <th className="px-3 py-2 text-left font-medium">{lt("Reference/Remark")}</th>
                  <th className="w-12 px-3 py-2 text-right font-medium">{lt("Remove")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowId} className="border-t">
                    <td className="px-3 py-2">
                      <select aria-label={lt("Ledger")} className="h-10 w-full rounded-md border px-3 text-sm" value={row.ledgerAccountId} onChange={(event) => {
                        const ledger = ledgerById.get(event.target.value);
                        updateRow(row.rowId, { ledgerAccountId: event.target.value, currencyId: ledger?.currencyId ?? row.currencyId });
                      }}>
                        <option value="">{lt("Select ledger")}</option>
                        {(ledgers.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.ledgerCode} - {item.ledgerName}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select aria-label={lt("Currency")} className="h-10 w-full rounded-md border px-3 text-sm" value={row.currencyId} onChange={(event) => updateRow(row.rowId, { currencyId: event.target.value })}>
                        <option value="">{lt("Default")}</option>
                        {(currencies.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.currencyCode}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <Input aria-label={lt("Debit")} className="text-right" type="number" min="0" step="0.01" value={row.debitAmount} onChange={(event) => setDebit(row.rowId, Number(event.target.value))} />
                    </td>
                    <td className="px-3 py-2">
                      <Input aria-label={lt("Credit")} className="text-right" type="number" min="0" step="0.01" value={row.creditAmount} onChange={(event) => setCredit(row.rowId, Number(event.target.value))} />
                    </td>
                    <td className="px-3 py-2">
                      <Input aria-label={lt("Reference/Remark")} value={row.remarks} onChange={(event) => updateRow(row.rowId, { remarks: event.target.value })} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button type="button" variant="ghost" size="icon" title={lt("Remove")} onClick={() => setRows((current) => current.filter((item) => item.rowId !== row.rowId))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Summary label={lt("Debit Total")} value={formTotals.debit} />
            <Summary label={lt("Credit Total")} value={formTotals.credit} />
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">{lt("Balance Status")}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge tone={isBalanced ? "green" : "red"}>{isBalanced ? lt("Balanced") : lt("Difference")}</Badge>
                <span className="text-lg font-semibold">{Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <PermissionButton permission="Accounting.Approve" variant="outline" onClick={() => submit(false)} disabled={!canSaveDraft}>
              <Save className="h-4 w-4" />
              {lt("Save Draft")}
            </PermissionButton>
            <PermissionButton permission="Accounting.Approve" onClick={() => submit(true)} disabled={!canApprove}>
              <CheckCircle2 className="h-4 w-4" />
              {lt("Approve Opening Balances")}
            </PermissionButton>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Summary label={lt("Saved Debit Total")} value={listTotals.debit} />
            <Summary label={lt("Saved Credit Total")} value={listTotals.credit} />
          </div>
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search=""
            onSearchChange={() => { }}
            onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  );
}
