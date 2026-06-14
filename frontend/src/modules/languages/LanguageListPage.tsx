import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteLanguage, getLanguages } from "@/api/languageApi";
import { useAuth } from "@/auth/useAuth";
import type { Language } from "@/types/language";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionButton } from "@/auth/PermissionButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";

export function LanguageListPage() {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { hasPermission } = useAuth();
  const query = useQuery({ queryKey: ["languages"], queryFn: getLanguages });
  const queryClient = useQueryClient();
  const remove = useMutation({ mutationFn: deleteLanguage, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["languages"] }) });
  const rows = useMemo(() => (query.data ?? []).filter((x) => [x.languageCode, x.displayName, x.nativeName, x.cultureCode].join(" ").toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  const paged = rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const columns: ColumnDef<Language>[] = [
    { accessorKey: "languageCode", header: "Code" },
    { accessorKey: "displayName", header: "Display Name" },
    { accessorKey: "nativeName", header: "Native Name" },
    { accessorKey: "cultureCode", header: "Culture" },
    { accessorKey: "textDirection", header: "Direction" },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];
  return <div className="space-y-4"><PageHeader title="Languages" description="Language master with formatting and direction rules." actions={<><AuditTrailButton /><PermissionButton asChild permission="Language.Create"><Link to="/languages/new"><Plus className="h-4 w-4" /> New Language</Link></PermissionButton></>} /><Card><CardContent className="pt-6"><DataTable data={paged} columns={columns} totalCount={rows.length} pageNumber={pageNumber} pageSize={pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <div className="flex items-center gap-1"><PermissionButton asChild permission="Language.Update" size="sm" variant="ghost"><Link to={`/languages/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton>{hasPermission("Language.Delete") ? <ConfirmDialog title="Delete language?" description={row.languageCode} confirmText="Delete" variant="danger" onConfirm={async () => remove.mutateAsync(row.id)}><Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-red-600" /></Button></ConfirmDialog> : null}</div>} /></CardContent></Card></div>;
}
