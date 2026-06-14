import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChartOfAccounts } from "@/api/accountingApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { lt } from "@/modules/operationsLocalization";

export function ChartOfAccountsPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["chart-of-accounts", search], queryFn: () => getChartOfAccounts({ pageNumber: 1, pageSize: 500, search }) });
  const roots = useMemo(() => (query.data?.items ?? []).filter((x) => !x.parentAccountId), [query.data]);
  const children = useMemo(() => query.data?.items ?? [], [query.data]);
  return <div className="space-y-4"><PageHeader title={lt("Chart of Accounts")} description={lt("Tree view of chart accounts with hierarchy.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6"><Input placeholder={lt("Search account...")} value={search} onChange={(e) => setSearch(e.target.value)} /><div className="rounded-lg border p-3">{roots.map((r) => <div key={r.id} className="mb-2"><p className="font-medium">{r.accountCode} - {r.accountName}</p>{children.filter((c) => c.parentAccountId === r.id).map((c) => <p key={c.id} className="pl-6 text-sm text-muted-foreground">- {c.accountCode} - {c.accountName}</p>)}</div>)}</div></CardContent></Card></div>;
}

