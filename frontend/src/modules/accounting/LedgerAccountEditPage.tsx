import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getChartOfAccounts, getLedgerAccounts, updateLedgerAccount } from "@/api/accountingApi";
import { getCurrencies } from "@/api/currencyApi";
import { PageHeader } from "@/components/PageHeader";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionButton } from "@/auth/PermissionButton";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function LedgerAccountEditPage() {
  const { ledgerId } = useParams();
  const charts = useQuery({ queryKey: ["ledger-edit-charts"], queryFn: () => getChartOfAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const ledgers = useQuery({ queryKey: ["ledger-edit-list"], queryFn: () => getLedgerAccounts({ pageNumber: 1, pageSize: 1000 }) });
  const currencies = useQuery({ queryKey: ["ledger-edit-currencies"], queryFn: getCurrencies });
  const row = (ledgers.data?.items ?? []).find((x) => x.id === ledgerId);
  const [v, setV] = useState(() => row ? { ...row, currencyId: row.currencyId ?? "" } : null);
  const update = useMutation({ mutationFn: (request: any) => updateLedgerAccount(ledgerId!, request) });
  if (!ledgerId) return <Navigate to="/accounting/ledger-accounts" replace />;
  if (!row && !ledgers.isLoading) return <Navigate to="/accounting/ledger-accounts" replace />;
  const value = v ?? (row ? { ...row, currencyId: row.currencyId ?? "" } : null);
  if (!value) return null;
  return <div className="space-y-4"><PageHeader title={`${lt("Edit Ledger")} ${row?.ledgerCode ?? ""}`} description={lt("Update ledger account properties.")} actions={<AuditTrailButton />} /><Card><CardContent className="grid gap-3 pt-6 md:grid-cols-2"><Field label={lt("Chart Account")}><select className="h-10 rounded-md border px-3 text-sm" value={value.chartOfAccountId} onChange={(e) => setV({ ...value, chartOfAccountId: e.target.value })}><option value="">{lt("Select chart account")}</option>{(charts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.accountCode} - {x.accountName}</option>)}</select></Field><Field label={lt("Ledger Code")}><Input placeholder={lt("Enter ledger code")} value={value.ledgerCode} onChange={(e) => setV({ ...value, ledgerCode: e.target.value })} /></Field><Field label={lt("Ledger Name")}><Input placeholder={lt("Enter ledger name")} value={value.ledgerName} onChange={(e) => setV({ ...value, ledgerName: e.target.value })} /></Field><Field label={lt("Currency")}><select className="h-10 rounded-md border px-3 text-sm" value={value.currencyId ?? ""} onChange={(e) => setV({ ...value, currencyId: e.target.value })}><option value="">{lt("Select currency or none")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isControlLedger} onChange={(e) => setV({ ...value, isControlLedger: e.target.checked })} /> {lt("Control Ledger")}</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.allowManualPosting} onChange={(e) => setV({ ...value, allowManualPosting: e.target.checked })} /> {lt("Manual Posting")}</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setV({ ...value, isActive: e.target.checked })} /> {lt("Active")}</label><PermissionButton permission="Accounting.Update" onClick={() => void update.mutateAsync({ ...value, currencyId: value.currencyId || null, customerId: value.customerId ?? null, vendorId: value.vendorId ?? null, agentId: value.agentId ?? null, carrierId: value.carrierId ?? null })}>{lt("Save")}</PermissionButton></CardContent></Card></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
