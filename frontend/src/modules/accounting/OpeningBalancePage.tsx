import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getFinancialYears, getLedgerAccounts, getOpeningBalances, upsertOpeningBalance, type OpeningBalanceDto } from "@/api/accountingApi";
import { getCurrencies } from "@/api/currencyApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

export function OpeningBalancePage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [financialYearId, setFinancialYearId] = useState("");
  const [ledgerAccountId, setLedgerAccountId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [debitAmount, setDebitAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);
  const queryClient = useQueryClient();
  const years = useQuery({ queryKey: ["opening-years"], queryFn: () => getFinancialYears({ pageNumber: 1, pageSize: 100 }) });
  const ledgers = useQuery({ queryKey: ["opening-ledgers"], queryFn: () => getLedgerAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const currencies = useQuery({ queryKey: ["opening-currencies"], queryFn: getCurrencies });
  const query = useQuery({ queryKey: ["opening-balances", pageNumber, pageSize], queryFn: () => getOpeningBalances({ pageNumber, pageSize }) });
  const save = useMutation({ mutationFn: upsertOpeningBalance, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["opening-balances"] }) });
  const columns: ColumnDef<OpeningBalanceDto>[] = [{ accessorKey: "financialYearId", header: lt("Financial Year") }, { accessorKey: "ledgerAccountId", header: lt("Ledger") }, { accessorKey: "debitAmount", header: lt("Debit") }, { accessorKey: "creditAmount", header: lt("Credit") }, { accessorKey: "isApproved", header: lt("Approved") }];
  return <div className="space-y-4"><PageHeader title={lt("Opening Balances")} description={lt("Enter opening balances for ledgers.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-2 md:grid-cols-3"><select aria-label={lt("Financial Year")} className="h-10 rounded-md border px-3 text-sm" value={financialYearId} onChange={(e) => setFinancialYearId(e.target.value)}><option value="">{lt("Select financial year")}</option>{(years.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.yearCode}</option>)}</select><select aria-label={lt("Ledger")} className="h-10 rounded-md border px-3 text-sm" value={ledgerAccountId} onChange={(e) => setLedgerAccountId(e.target.value)}><option value="">{lt("Select ledger")}</option>{(ledgers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.ledgerCode} - {x.ledgerName}</option>)}</select><select aria-label={lt("Currency")} className="h-10 rounded-md border px-3 text-sm" value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}><option value="">{lt("Select currency")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select><Input aria-label={lt("Debit Amount")} placeholder={lt("Debit amount")} type="number" min="0" value={debitAmount} onChange={(e) => setDebitAmount(Number(e.target.value))} /><Input aria-label={lt("Credit Amount")} placeholder={lt("Credit amount")} type="number" min="0" value={creditAmount} onChange={(e) => setCreditAmount(Number(e.target.value))} /><PermissionButton permission="Accounting.Approve" onClick={() => void save.mutateAsync({ financialYearId, ledgerAccountId, currencyId: currencyId || null, debitAmount, creditAmount, remarks: null, isApproved: true })}>{lt("Save")}</PermissionButton></div><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search="" onSearchChange={() => { }} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} /></CardContent></Card></div>;
}
