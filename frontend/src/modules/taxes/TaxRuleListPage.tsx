import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { searchTaxRules, upsertTaxRule, type TaxRuleDto, type TaxRuleRequest } from "@/api/taxApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TaxRuleForm } from "@/modules/taxes/TaxRuleForm";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function TaxRuleListPage() {
  const m = useMasterDataI18n("TaxRule");
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["tax-rules", pageNumber, pageSize, search], queryFn: () => searchTaxRules({ pageNumber, pageSize, search }) });
  const mutation = useMutation({ mutationFn: upsertTaxRule, onSuccess: async () => { setShowForm(false); await queryClient.invalidateQueries({ queryKey: ["tax-rules"] }); } });
  const columns: ColumnDef<TaxRuleDto>[] = [
    { accessorKey: "taxCode", header: m("Code") },
    { accessorKey: "taxName", header: m("Tax Name") },
    { accessorKey: "taxRate", header: m("Rate %") },
    { accessorKey: "isRecoverable", header: m("Recoverable"), cell: ({ row }) => row.original.isRecoverable ? m("Yes") : m("No") },
    { accessorKey: "isActive", header: m("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];
  return <div className="space-y-4"><PageHeader title={m("Tax Rules")} description={m("Tax setup for GST/VAT and recovery behavior.")} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} permission="Accounting.Update" variant="outline" onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> {showForm ? m("Hide Form") : m("New Tax Rule")}</PermissionButton></>} /><Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} space-y-4`}>{showForm ? <TaxRuleForm onSubmit={async (value: TaxRuleRequest) => { await mutation.mutateAsync(value); }} isSubmitting={mutation.isPending} /> : null}<DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => hasPermission("Accounting.Update") ? <Button className={masterDataButtonClass} size="sm" variant="outline" onClick={() => void mutation.mutateAsync({ ledgerAccountId: row.ledgerAccountId, taxCode: row.taxCode, taxName: row.taxName, taxRate: row.taxRate, isRecoverable: row.isRecoverable, isActive: !row.isActive })}>{row.isActive ? m("Deactivate") : m("Activate")}</Button> : null} /></CardContent></Card></div>;
}
