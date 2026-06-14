import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getAccountMappings, getLedgerAccounts, upsertAccountMapping, type AccountMappingDto } from "@/api/accountingApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

export function AccountMappingPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [mappingKey, setMappingKey] = useState("");
  const [mappingName, setMappingName] = useState("");
  const [ledgerAccountId, setLedgerAccountId] = useState("");
  const [sourceModule, setSourceModule] = useState("Accounting");
  const queryClient = useQueryClient();
  const ledgers = useQuery({ queryKey: ["mapping-ledgers"], queryFn: () => getLedgerAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const query = useQuery({ queryKey: ["account-mappings", pageNumber, pageSize], queryFn: () => getAccountMappings({ pageNumber, pageSize }) });
  const save = useMutation({ mutationFn: upsertAccountMapping, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["account-mappings"] }) });
  const columns: ColumnDef<AccountMappingDto>[] = [{ accessorKey: "mappingKey", header: lt("Mapping Key") }, { accessorKey: "mappingName", header: lt("Mapping Name") }, { accessorKey: "sourceModule", header: lt("Source Module") }, { accessorKey: "ledgerAccountId", header: lt("Ledger") }, { accessorKey: "isActive", header: lt("Active") }];
  return <div className="space-y-4"><PageHeader title={lt("Account Mapping")} description={lt("Map business keys to ledger accounts.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-2 md:grid-cols-5"><Input placeholder={lt("Mapping key")} value={mappingKey} onChange={(e) => setMappingKey(e.target.value)} /><Input placeholder={lt("Mapping name")} value={mappingName} onChange={(e) => setMappingName(e.target.value)} /><Input placeholder={lt("Source module")} value={sourceModule} onChange={(e) => setSourceModule(e.target.value)} /><select className="h-10 rounded-md border px-3 text-sm" value={ledgerAccountId} onChange={(e) => setLedgerAccountId(e.target.value)}><option value="">{lt("Select ledger")}</option>{(ledgers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.ledgerCode} - {x.ledgerName}</option>)}</select><PermissionButton permission="Accounting.Update" onClick={() => void save.mutateAsync({ mappingKey, mappingName, ledgerAccountId, sourceModule, isActive: true })}>{lt("Save")}</PermissionButton></div><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search="" onSearchChange={() => { }} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} /></CardContent></Card></div>;
}
