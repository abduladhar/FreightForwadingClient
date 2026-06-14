import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import { searchChargeHeads, type ChargeHeadDto } from "@/api/chargeHeadApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function ChargeHeadListPage() {
  const m = useMasterDataI18n("ChargeHead");
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useQuery({ queryKey: ["charge-heads", pageNumber, pageSize, search], queryFn: () => searchChargeHeads({ pageNumber, pageSize, search }) });
  const columns: ColumnDef<ChargeHeadDto>[] = [
    { accessorKey: "mappingKey", header: m("Key") },
    { accessorKey: "mappingName", header: m("Charge Head") },
    { accessorKey: "sourceModule", header: m("Source Module") },
    { accessorKey: "isActive", header: m("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];
  return <div className="space-y-4"><PageHeader title={m("Charge Heads")} description={m("Charge heads and income/expense account mapping.")} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="Accounting.Update"><Link to="/charge-heads/new"><Plus className="h-4 w-4" /> {m("New Charge Head")}</Link></PermissionButton></>} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <PermissionButton className={masterDataButtonClass} asChild permission="Accounting.Update" size="sm" variant="ghost"><Link to={`/charge-heads/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton>} /></CardContent></Card></div>;
}
