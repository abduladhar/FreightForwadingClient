import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createLedgerAccount, getChartOfAccounts } from "@/api/accountingApi";
import { getCurrencies } from "@/api/currencyApi";
import { PageHeader } from "@/components/PageHeader";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionButton } from "@/auth/PermissionButton";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function LedgerAccountCreatePage() {
  const navigate = useNavigate();
  const charts = useQuery({ queryKey: ["ledger-create-charts"], queryFn: () => getChartOfAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const currencies = useQuery({ queryKey: ["ledger-create-currencies"], queryFn: getCurrencies });
  const [v, setV] = useState({ chartOfAccountId: "", ledgerCode: "", ledgerName: "", currencyId: "", isControlLedger: false, allowManualPosting: true, isActive: true });
  const create = useMutation({ mutationFn: createLedgerAccount, onSuccess: (x) => navigate(`/accounting/ledger-accounts/${x.id}/edit`) });
  return <div className="space-y-4"><PageHeader title={lt("Create Ledger Account")} description={lt("Create a new ledger account.")} actions={<AuditTrailButton />} /><Card><CardContent className="grid gap-3 pt-6 md:grid-cols-2"><Field label={lt("Chart Account")}><select className="h-10 rounded-md border px-3 text-sm" value={v.chartOfAccountId} onChange={(e) => setV({ ...v, chartOfAccountId: e.target.value })}><option value="">{lt("Select chart account")}</option>{(charts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.accountCode} - {x.accountName}</option>)}</select></Field><Field label={lt("Ledger Code")}><Input placeholder={lt("Enter ledger code")} value={v.ledgerCode} onChange={(e) => setV({ ...v, ledgerCode: e.target.value })} /></Field><Field label={lt("Ledger Name")}><Input placeholder={lt("Enter ledger name")} value={v.ledgerName} onChange={(e) => setV({ ...v, ledgerName: e.target.value })} /></Field><Field label={lt("Currency")}><select className="h-10 rounded-md border px-3 text-sm" value={v.currencyId} onChange={(e) => setV({ ...v, currencyId: e.target.value })}><option value="">{lt("Select currency or none")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.isControlLedger} onChange={(e) => setV({ ...v, isControlLedger: e.target.checked })} /> {lt("Control Ledger")}</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.allowManualPosting} onChange={(e) => setV({ ...v, allowManualPosting: e.target.checked })} /> {lt("Manual Posting")}</label><PermissionButton permission="Accounting.Create" onClick={() => void create.mutateAsync({ ...v, currencyId: v.currencyId || null, customerId: null, vendorId: null, agentId: null, carrierId: null })}>{lt("Create")}</PermissionButton></CardContent></Card></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1"><Label>{label}</Label>{children}</div>; }
