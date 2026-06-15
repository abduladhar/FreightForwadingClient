import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getFinancialYears, getLedgerAccounts } from "@/api/accountingApi";
import { getBranchOptions } from "@/api/branchApi";
import { getCurrencies } from "@/api/currencyApi";
import { searchCustomers } from "@/api/customerApi";
import { getAccountingReport, exportAccountingReport, printPreviewAccountingReport, type AccountingReportRequest, type AccountingReportType } from "@/api/reportApi";
import { searchVendors } from "@/api/vendorApi";
import { DataTable } from "@/components/common/DataTable";
import { ExportButtons } from "@/components/common/ExportButtons";
import { PrintPreview } from "@/components/common/PrintPreview";
import { ReportFilterPanel } from "@/components/common/ReportFilterPanel";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/auth/useAuth";
import { exportFullCsv } from "@/utils/csvExport";
import { exportExcelReport } from "@/utils/excelExport";
import { exportPdfReport } from "@/utils/pdfExport";
import { lt } from "@/modules/operationsLocalization";

type CurrencyMode = "original" | "base" | "selected";

export function AccountingReportPage<T extends Record<string, unknown>>({
  title,
  reportType,
  columns,
  mapRows,
  summaryBuilder,
  totalsBuilder,
  needsAccount,
  needsCustomer,
  needsVendor
}: {
  title: string;
  reportType: AccountingReportType;
  columns: ColumnDef<T>[];
  mapRows: (data: unknown) => T[];
  summaryBuilder?: (rows: T[], data: unknown) => Array<{ label: string; value: string | number }>;
  totalsBuilder?: (rows: T[]) => Array<{ label: string; value: string | number }>;
  needsAccount?: boolean;
  needsCustomer?: boolean;
  needsVendor?: boolean;
}) {
  const workspace = useWorkspace();
  const { hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    financialYearId: "",
    branchId: workspace.branchId ?? "",
    accountId: "",
    customerId: "",
    vendorId: "",
    currencyId: "",
    reportCurrencyId: "",
    currencyMode: "original" as CurrencyMode
  });
  const [applied, setApplied] = useState(filters);
  const [printContent, setPrintContent] = useState("");

  const financialYears = useQuery({ queryKey: ["report-years"], queryFn: () => getFinancialYears({ pageNumber: 1, pageSize: 200 }) });
  const branches = useQuery({ queryKey: ["report-branches"], queryFn: getBranchOptions });
  const accounts = useQuery({ queryKey: ["report-ledgers"], queryFn: () => getLedgerAccounts({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const customers = useQuery({ queryKey: ["report-customers"], queryFn: () => searchCustomers({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const vendors = useQuery({ queryKey: ["report-vendors"], queryFn: () => searchVendors({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const currencies = useQuery({ queryKey: ["report-currencies"], queryFn: getCurrencies });

  const request = useMemo(() => buildRequest(applied, pageNumber, pageSize), [applied, pageNumber, pageSize]);
  const report = useQuery({
    queryKey: ["accounting-report", reportType, request],
    queryFn: () => getAccountingReport<unknown>(reportType, request)
  });
  const rows = useMemo(() => mapRows(report.data?.data), [report.data?.data, mapRows]);
  const summary = summaryBuilder?.(rows, report.data?.data) ?? [];
  const totals = totalsBuilder?.(rows) ?? [];
  const canExport = hasPermission("Reports.Export");
  const canPrint = hasPermission("Reports.Print");

  async function handleExportPdf() {
    await exportPdfReport({
      fileName: `${reportType}.pdf`,
      title,
      tenantName: workspace.tenantCode,
      branchName: workspace.branchName ?? lt("Branch"),
      documentDate: new Date(),
      currencyCode: workspace.baseCurrency,
      cultureCode: workspace.cultureCode,
      columns: columns.map((x) => {
        const accessor = "accessorKey" in x ? x.accessorKey : undefined;
        return { key: String(x.id ?? accessor ?? "value"), label: String(x.header ?? x.id ?? accessor ?? lt("Value")) };
      }) as Array<{ key: string; label: string }>,
      rows: rows.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : v])) as Record<string, unknown>)
    });
  }
  async function handleExportExcel() {
    const rowsFlat = rows.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : v])) as Record<string, unknown>);
    const keys = rowsFlat[0] ? Object.keys(rowsFlat[0]) : ["value"];
    await exportExcelReport({
      fileName: `${reportType}.xlsx`,
      reportTitle: title,
      tenantName: workspace.tenantCode,
      branchName: workspace.branchName ?? lt("Branch"),
      dateFrom: applied.fromDate || undefined,
      dateTo: applied.toDate || undefined,
      sheets: [{ sheetName: lt("Report"), columns: keys.map((k) => ({ key: k as never, header: lt(k) })), rows: rowsFlat }]
    });
  }
  async function handleExportCsv() {
    const rowsFlat = rows.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : v])) as Record<string, unknown>);
    exportFullCsv(rowsFlat, `${reportType}.csv`);
  }
  async function handlePrintPreview() {
    const x = await printPreviewAccountingReport(reportType, request);
    setPrintContent(safeDecodeBase64(x.content));
  }
  async function handleBackendExport(format: "pdf" | "excel" | "csv") {
    const x = await exportAccountingReport(reportType, { ...request, exportFormat: format });
    const bytes = base64ToBytes(x.content);
    const blob = new Blob([bytes], { type: x.contentType || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = x.fileName || `${reportType}.${format === "excel" ? "xlsx" : format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return <div className="space-y-4">
    <PageHeader title={title} description={lt("Accounting report with filters, export, and print preview.")} />
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{lt("Filters")}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setCollapsed((x) => !x)}>{collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</Button>
      </CardHeader>
      {!collapsed ? <CardContent className="space-y-3">
        <ReportFilterPanel
          onReset={() => setFilters({ fromDate: "", toDate: "", financialYearId: "", branchId: workspace.branchId ?? "", accountId: "", customerId: "", vendorId: "", currencyId: "", reportCurrencyId: "", currencyMode: "original" })}
          onApply={() => {
            setPageNumber(1);
            setApplied(filters);
            if (filters.branchId) {
              const selectedBranch = (branches.data ?? []).find((x) => x.id === filters.branchId);
              if (selectedBranch) workspace.setBranch(selectedBranch.id, selectedBranch.name);
            }
          }}
        >
          <Field label={lt("From Date")}><Input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} /></Field>
          <Field label={lt("To Date")}><Input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} /></Field>
          <Field label={lt("Financial Year")}><select className="h-10 rounded-md border px-3 text-sm" value={filters.financialYearId} onChange={(e) => setFilters({ ...filters, financialYearId: e.target.value })}><option value="">{lt("All")}</option>{(financialYears.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.yearCode}</option>)}</select></Field>
          <Field label={lt("Branch")}><select className="h-10 rounded-md border px-3 text-sm" value={filters.branchId} onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}><option value="">{lt("Current")}</option>{(branches.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}</select></Field>
          {needsAccount ? <Field label={lt("Account")}><select className="h-10 rounded-md border px-3 text-sm" value={filters.accountId} onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}><option value="">{lt("All")}</option>{(accounts.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.ledgerCode} - {x.ledgerName}</option>)}</select></Field> : null}
          {needsCustomer ? <Field label={lt("Customer")}><select className="h-10 rounded-md border px-3 text-sm" value={filters.customerId} onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}><option value="">{lt("All")}</option>{(customers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.customerCode} - {x.customerName}</option>)}</select></Field> : null}
          {needsVendor ? <Field label={lt("Vendor")}><select className="h-10 rounded-md border px-3 text-sm" value={filters.vendorId} onChange={(e) => setFilters({ ...filters, vendorId: e.target.value })}><option value="">{lt("All")}</option>{(vendors.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.vendorCode} - {x.vendorName}</option>)}</select></Field> : null}
          <Field label={lt("Currency")}><select className="h-10 rounded-md border px-3 text-sm" value={filters.currencyId} onChange={(e) => setFilters({ ...filters, currencyId: e.target.value })}><option value="">{lt("All")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select></Field>
          <Field label={lt("Currency Mode")}><select className="h-10 rounded-md border px-3 text-sm" value={filters.currencyMode} onChange={(e) => setFilters({ ...filters, currencyMode: e.target.value as CurrencyMode })}><option value="original">{lt("Original transaction currency")}</option><option value="base">{lt("Tenant base currency")}</option><option value="selected">{lt("Selected report currency")}</option></select></Field>
          {filters.currencyMode === "selected" ? <Field label={lt("Report Currency")}><select className="h-10 rounded-md border px-3 text-sm" value={filters.reportCurrencyId} onChange={(e) => setFilters({ ...filters, reportCurrencyId: e.target.value })}><option value="">{lt("Select")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select></Field> : null}
        </ReportFilterPanel>
      </CardContent> : null}
    </Card>
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{lt("Report Output")}</CardTitle>
        <div className="flex items-center gap-2">
          {canExport ? <ExportButtons
            onExportPdf={() => void handleExportPdf()}
            onExportExcel={() => void handleExportExcel()}
            onExportCsv={() => void handleBackendExport("csv")}
          /> : null}
          <Button variant="outline" size="sm" onClick={() => void handleExportPdf()}>{lt("PDF")} ({lt("Client")})</Button>
          <Button variant="outline" size="sm" onClick={() => void handleExportExcel()}>{lt("Excel")} ({lt("Client")})</Button>
          <Button variant="outline" size="sm" onClick={() => void handleExportCsv()}>{lt("CSV")} ({lt("Client")})</Button>
          {canPrint ? <Button variant="outline" size="sm" onClick={() => void handlePrintPreview()}>{lt("Print Preview")}</Button> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary.length ? <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{summary.map((x) => <div key={x.label} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{x.label}</p><p className="text-lg font-semibold">{x.value}</p></div>)}</div> : null}
        <DataTable
          data={rows}
          columns={columns}
          totalCount={rows.length}
          pageNumber={pageNumber}
          pageSize={pageSize}
          search=""
          onSearchChange={() => { }}
          onPaginationChange={(nextPage, nextSize) => {
            setPageNumber(nextPage);
            setPageSize(nextSize);
          }}
          isLoading={report.isLoading}
          isError={report.isError}
          onRetry={() => void report.refetch()}
        />
        {totals.length ? <div className="rounded-lg border bg-slate-50 p-3 text-sm">{totals.map((x) => <p key={x.label}><span className="font-medium">{x.label}:</span> {x.value}</p>)}</div> : null}
      </CardContent>
    </Card>
    {printContent ? <PrintPreview title={`${title} - ${lt("Print Preview")}`}><div className="whitespace-pre-wrap text-sm">{printContent}</div></PrintPreview> : null}
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><p className="text-xs text-muted-foreground">{label}</p>{children}</div>;
}

function buildRequest(filters: {
  fromDate: string; toDate: string; financialYearId: string; accountId: string; customerId: string; vendorId: string; currencyId: string; reportCurrencyId: string; currencyMode: CurrencyMode;
}, pageNumber: number, pageSize: number): AccountingReportRequest {
  return {
    pageNumber,
    pageSize,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    financialYearId: filters.financialYearId || undefined,
    accountId: filters.accountId || undefined,
    customerId: filters.customerId || undefined,
    vendorId: filters.vendorId || undefined,
    currencyId: filters.currencyId || undefined,
    reportCurrencyId: filters.currencyMode === "selected" ? (filters.reportCurrencyId || undefined) : undefined
  };
}

function safeDecodeBase64(input: string) {
  try {
    return decodeURIComponent(escape(window.atob(input)));
  } catch {
    try { return window.atob(input); } catch { return input; }
  }
}

function base64ToBytes(base64: string) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
