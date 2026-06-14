import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { createAccountGroup, getAccountGroups, type AccountGroupDto } from "@/api/accountingApi";
import { DataTable } from "@/components/common/DataTable";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

export function AccountGroupListPage() {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [groupCode, setGroupCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [normalBalance, setNormalBalance] = useState("Debit");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["account-groups", search, pageNumber, pageSize], queryFn: () => getAccountGroups({ pageNumber, pageSize, search }) });
  const create = useMutation({ mutationFn: createAccountGroup, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["account-groups"] }) });
  const columns: ColumnDef<AccountGroupDto>[] = [{ accessorKey: "groupCode", header: lt("Code") }, { accessorKey: "groupName", header: lt("Group Name") }, { accessorKey: "normalBalance", header: lt("Normal Balance") }, { accessorKey: "isSystem", header: lt("System") }, { accessorKey: "isActive", header: lt("Active") }];
  return <div className="space-y-4"><PageHeader title={lt("Account Groups")} description={lt("Create and manage accounting groups.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-2 md:grid-cols-4"><Input placeholder={lt("Group code")} value={groupCode} onChange={(e) => setGroupCode(e.target.value)} /><Input placeholder={lt("Group name")} value={groupName} onChange={(e) => setGroupName(e.target.value)} /><select className="h-10 rounded-md border px-3 text-sm" value={normalBalance} onChange={(e) => setNormalBalance(e.target.value)}><option value="Debit">{lt("Debit")}</option><option value="Credit">{lt("Credit")}</option></select><PermissionButton permission="Accounting.Create" onClick={() => void create.mutateAsync({ groupCode, groupName, normalBalance, isActive: true })}>{lt("Add Group")}</PermissionButton></div><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} /></CardContent></Card></div>;
}
