import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { closeFinancialYear, createFinancialYear, getFinancialYears, type FinancialYearDto } from "@/api/accountingApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PermissionButton } from "@/auth/PermissionButton";
import { Button } from "@/components/ui/button";
import { lt } from "@/modules/operationsLocalization";

export function FinancialYearPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [yearCode, setYearCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["financial-years", pageNumber, pageSize], queryFn: () => getFinancialYears({ pageNumber, pageSize }) });
  const create = useMutation({ mutationFn: createFinancialYear, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["financial-years"] }) });
  const close = useMutation({ mutationFn: closeFinancialYear, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["financial-years"] }) });
  const columns: ColumnDef<FinancialYearDto>[] = [{ accessorKey: "yearCode", header: lt("Year") }, { accessorKey: "startDate", header: lt("Start") }, { accessorKey: "endDate", header: lt("End") }, { accessorKey: "isActive", header: lt("Active") }, { accessorKey: "isClosed", header: lt("Closed") }];
  return <div className="space-y-4"><PageHeader title={lt("Financial Years")} description={lt("Set up financial years and close periods.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-2 md:grid-cols-4"><Input placeholder={lt("Year code")} value={yearCode} onChange={(e) => setYearCode(e.target.value)} /><label className="space-y-1 text-sm"><span>{lt("Start Date")}</span><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label><label className="space-y-1 text-sm"><span>{lt("End Date")}</span><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label><PermissionButton permission="Accounting.Create" onClick={() => void create.mutateAsync({ yearCode, startDate, endDate, isActive: true })}>{lt("Create")}</PermissionButton></div><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search="" onSearchChange={() => { }} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <Button size="sm" variant="outline" onClick={() => void close.mutateAsync(row.id)} disabled={row.isClosed}>{lt("Close")}</Button>} /></CardContent></Card></div>;
}
