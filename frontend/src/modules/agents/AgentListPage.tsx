import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteAgent, searchAgents, type AgentDto } from "@/api/agentApi";
import { useAuth } from "@/auth/useAuth";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function AgentListPage() {
  const m = useMasterDataI18n("Agent");
  const { hasPermission } = useAuth();
  const [pageNumber, setPageNumber] = useState(1); const [pageSize, setPageSize] = useState(10); const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["agents", pageNumber, pageSize, search], queryFn: () => searchAgents({ pageNumber, pageSize, search }) });
  const queryClient = useQueryClient();
  const remove = useMutation({ mutationFn: deleteAgent, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agents"] }) });
  const columns: ColumnDef<AgentDto>[] = [{ accessorKey: "agentCode", header: m("Code") }, { accessorKey: "agentName", header: m("Name") }, { accessorKey: "agentType", header: m("Type") }, { accessorKey: "email", header: m("Email") }, { id: "status", header: m("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }];
  return <div className="space-y-4"><PageHeader title={m("Agents")} description={m("Agent master and commission setup.")} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="Agent.Create"><Link to="/agents/new"><Plus className="h-4 w-4" /> {m("New Agent")}</Link></PermissionButton></>} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <AgentActions row={row} hasPermission={hasPermission} onDelete={() => remove.mutateAsync(row.id)} />} /></CardContent></Card></div>;
}

function AgentActions({ row, hasPermission, onDelete }: { row: AgentDto; hasPermission: (permission?: string | string[]) => boolean; onDelete: () => Promise<void> }) {
  const m = useMasterDataI18n("Agent");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 min-h-10 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{m("Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("Agent.Read") ? <DropdownMenuItem asChild><Link to={`/agents/${row.id}`}><Eye className="mr-2 h-4 w-4" /> {m("View Agent")}</Link></DropdownMenuItem> : null}
        {hasPermission("Agent.Update") ? <DropdownMenuItem asChild><Link to={`/agents/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> {m("Edit Agent")}</Link></DropdownMenuItem> : null}
        {hasPermission("Agent.Delete") ? (
          <ConfirmDialog title={m("Delete agent?")} description={row.agentName} confirmText={m("Delete")} variant="danger" onConfirm={onDelete}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4 text-red-600" /> {m("Delete Agent")}
            </DropdownMenuItem>
          </ConfirmDialog>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
