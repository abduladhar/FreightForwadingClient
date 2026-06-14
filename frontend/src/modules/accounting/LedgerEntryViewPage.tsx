import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getLedgerEntries, type LedgerReportRow } from "@/api/accountingApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { lt } from "@/modules/operationsLocalization";

export function LedgerEntryViewPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const query = useQuery({ queryKey: ["ledger-entry-view", fromDate, toDate], queryFn: () => getLedgerEntries({ pageNumber: 1, pageSize: 500, fromDate: fromDate || undefined, toDate: toDate || undefined, sortDirection: "desc" }) });
  const columns: ColumnDef<LedgerReportRow>[] = [
    { accessorKey: "date", header: lt("Date") },
    { accessorKey: "voucherNumber", header: lt("Voucher Number") },
    { accessorKey: "voucherType", header: lt("Type") },
    { accessorKey: "particulars", header: lt("Particulars") },
    { accessorKey: "debit", header: lt("Debit") },
    { accessorKey: "credit", header: lt("Credit") },
    { accessorKey: "balance", header: lt("Balance") }
  ];
  return <div className="space-y-4"><PageHeader title={lt("Ledger Entry View")} description={lt("Ledger report view for posted entries.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-2 md:grid-cols-2"><label className="space-y-1 text-sm"><span>{lt("From Date")}</span><Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label><label className="space-y-1 text-sm"><span>{lt("To Date")}</span><Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label></div><DataTable data={query.data ?? []} columns={columns} totalCount={(query.data ?? []).length} pageNumber={1} pageSize={(query.data ?? []).length || 10} search="" onSearchChange={() => { }} onPaginationChange={() => { }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} /></CardContent></Card></div>;
}
