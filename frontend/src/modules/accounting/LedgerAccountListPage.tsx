import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { getLedgerAccounts, type LedgerAccountDto } from "@/api/accountingApi";
import { DataTable } from "@/components/common/DataTable";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { Plus } from "lucide-react";
import { lt } from "@/modules/operationsLocalization";

export function LedgerAccountListPage() {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const query = useQuery({ queryKey: ["ledger-accounts-list", search, pageNumber, pageSize], queryFn: () => getLedgerAccounts({ pageNumber, pageSize, search }) });
  const columns: ColumnDef<LedgerAccountDto>[] = [{ accessorKey: "ledgerCode", header: lt("Code") }, { accessorKey: "ledgerName", header: lt("Ledger Name") }, { accessorKey: "currencyId", header: lt("Currency") }, { accessorKey: "isControlLedger", header: lt("Control") }, { accessorKey: "isActive", header: lt("Active") }];
  return <div className="space-y-4"><PageHeader title={lt("Ledger Accounts")} description={lt("Ledger account setup and maintenance.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Accounting.Create"><Link to="/accounting/ledger-accounts/new"><Plus className="h-4 w-4" />{lt("New Ledger")}</Link></PermissionButton></>} /><Card><CardContent className="pt-6"><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <PermissionButton asChild permission="Accounting.Update" size="sm" variant="ghost"><Link to={`/accounting/ledger-accounts/${row.id}/edit`}>{lt("Edit")}</Link></PermissionButton>} /></CardContent></Card></div>;
}
