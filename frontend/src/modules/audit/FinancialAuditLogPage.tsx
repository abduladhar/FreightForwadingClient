import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getCurrencies } from "@/api/currencyApi";
import { getFinancialAuditLogs, type FinancialAuditLogDto } from "@/api/auditApi";
import { AuditTablePage, createdDateColumn, defaultAuditFilters, statusColumn, type AuditFilterState } from "@/modules/audit/_shared";
import { useLanguage } from "@/hooks/useLanguage";
import { lt } from "@/modules/operationsLocalization";

export function FinancialAuditLogPage() {
  const language = useLanguage();
  const [filters, setFilters] = useState<AuditFilterState>(defaultAuditFilters);
  const query = useQuery({
    queryKey: ["audit-financial", filters],
    queryFn: () => getFinancialAuditLogs(stripSearch(filters))
  });
  const currencies = useQuery({ queryKey: ["currencies"], queryFn: getCurrencies });
  const currencyById = useMemo(() => new Map((currencies.data ?? []).map((x) => [x.id, x.currencyCode])), [currencies.data]);
  const columns: ColumnDef<FinancialAuditLogDto>[] = [
    createdDateColumn<FinancialAuditLogDto>(language.formatLocalizedDateTime),
    { accessorKey: "moduleName", header: lt("Module") },
    { accessorKey: "documentType", header: lt("Document Type") },
    { accessorKey: "documentNumber", header: lt("Document #") },
    { accessorKey: "actionName", header: lt("Action") },
    { id: "amount", header: lt("Amount"), cell: ({ row }) => row.original.amount != null ? `${currencyById.get(row.original.currencyId ?? "") ?? ""} ${row.original.amount}` : "-" },
    { accessorKey: "errorMessage", header: lt("Error") },
    statusColumn<FinancialAuditLogDto>()
  ];
  return (
    <AuditTablePage
      title={lt("Financial Audit Logs")}
      description={lt("Audit events related to invoices, bills, receipts, payments, and posting.")}
      exportPrefix="financial-audit-logs"
      filters={filters}
      setFilters={setFilters}
      queryResult={query}
      columns={columns}
      mapExportRows={(rows) => rows.map((x) => ({ createdDate: x.createdDate, moduleName: x.moduleName, documentType: x.documentType, documentNumber: x.documentNumber, actionName: x.actionName, amount: x.amount, currencyId: x.currencyId, status: x.status, errorMessage: x.errorMessage, correlationId: x.correlationId }))}
    />
  );
}

function stripSearch(filters: AuditFilterState) {
  const { search: ignored, ...rest } = filters;
  return rest;
}
