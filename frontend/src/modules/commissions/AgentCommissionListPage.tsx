import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCommissionDrafts, getAgentCommissionStatement } from "@/api/commissionApi";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { PermissionButton } from "@/auth/PermissionButton";
import { Plus } from "lucide-react";
import { lt } from "@/modules/operationsLocalization";

type Row = { id: string; date: string; sourceType: string; description: string; commissionAmount: number; status: string; channel: "Posted" | "Draft" };

export function AgentCommissionListPage() {
  const statement = useQuery({ queryKey: ["agent-commission-statement"], queryFn: getAgentCommissionStatement });
  const rows = useMemo<Row[]>(() => {
    const posted = (statement.data ?? []).map((x) => ({ id: x.sourceId, date: x.date, sourceType: x.sourceType, description: x.description, commissionAmount: x.commissionAmount, status: x.status, channel: "Posted" as const }));
    const drafts = listCommissionDrafts().map((x) => ({ id: x.id, date: x.createdDate.slice(0, 10), sourceType: x.sourceType, description: x.remarks ?? lt("Commission draft"), commissionAmount: x.commissionAmount, status: "Draft", channel: "Draft" as const }));
    return [...drafts, ...posted];
  }, [statement.data]);
  const columns: ColumnDef<Row>[] = [
    { accessorKey: "date", header: lt("Date") },
    { accessorKey: "sourceType", header: lt("Source Type"), cell: ({ row }) => lt(displaySourceType(row.original.sourceType)) },
    { accessorKey: "description", header: lt("Description") },
    { accessorKey: "commissionAmount", header: lt("Commission"), cell: ({ row }) => <CurrencyAmount value={row.original.commissionAmount} /> },
    { accessorKey: "channel", header: lt("Channel"), cell: ({ row }) => lt(row.original.channel) },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> }
  ];
  return <div className="space-y-4"><PageHeader title={lt("Agent Commissions")} description={lt("Posted commission statement from backend plus draft commission calculations.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Accounting.Create"><Link to="/commissions/new"><Plus className="h-4 w-4" /> {lt("New Commission")}</Link></PermissionButton></>} /><Card><CardContent className="pt-6"><DataTable data={rows} columns={columns} totalCount={rows.length} pageNumber={1} pageSize={rows.length || 10} search="" searchPlaceholder={lt("Search agent commissions...")} onSearchChange={() => { }} onPaginationChange={() => { }} isLoading={statement.isLoading} isError={statement.isError} onRetry={() => void statement.refetch()} /></CardContent></Card></div>;
}

function displaySourceType(value: string) {
  switch (value) {
    case "HouseShipment": return "House Shipment";
    case "MasterShipment": return "Master Shipment";
    case "DirectShipment": return "Direct Shipment";
    default: return value;
  }
}
