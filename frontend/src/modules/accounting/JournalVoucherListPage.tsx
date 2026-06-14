import { useState } from "react";
import { listVoucherDrafts } from "@/api/accountingApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { PermissionButton } from "@/auth/PermissionButton";
import { lt } from "@/modules/operationsLocalization";

export function JournalVoucherListPage() {
  const [search, setSearch] = useState("");
  const rows = listVoucherDrafts("Journal");
  const filtered = rows.filter((x) => !search || x.referenceNumber?.toLowerCase().includes(search.toLowerCase()));
  const columns: ColumnDef<(typeof rows)[number]>[] = [{ accessorKey: "voucherDate", header: lt("Date") }, { accessorKey: "referenceNumber", header: lt("Reference") }, { accessorKey: "approvalStatus", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.approvalStatus} /> }, { accessorKey: "createdDate", header: lt("Created") }];
  return <div className="space-y-4"><PageHeader title={lt("Journal Vouchers")} description={lt("Draft journal vouchers with balance validation.")} actions={<AuditTrailButton />} /><Card><CardContent className="pt-6"><DataTable data={filtered} columns={columns} totalCount={filtered.length} pageNumber={1} pageSize={filtered.length || 10} search={search} onSearchChange={setSearch} onPaginationChange={() => { }} rowActions={(row) => <PermissionButton asChild permission="Accounting.Update" size="sm" variant="ghost"><Link to={`/accounting/journal-vouchers/${row.id}/edit`}>{lt("Edit")}</Link></PermissionButton>} /></CardContent></Card></div>;
}

