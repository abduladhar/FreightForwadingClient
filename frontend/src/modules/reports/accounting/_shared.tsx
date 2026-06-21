import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getFinancialYears, getLedgerAccounts } from "@/api/accountingApi";
import { getBranchOptions } from "@/api/branchApi";
import { getCurrencies } from "@/api/currencyApi";
import { searchCustomers } from "@/api/customerApi";
import { getAccountingReport, exportAccountingReport, printPreviewAccountingReport, type AccountingReportRequest, type AccountingReportType } from "@/api/reportApi";
import { searchVendors } from "@/api/vendorApi";
import { DataTable } from "@/components/common/DataTable";
import { EmailReportAction } from "@/components/common/EmailReportAction";
import { EmailPdfReportButton } from "@/components/common/EmailPdfReportButton";
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
import { createPdfReportBlob, exportPdfReport } from "@/utils/pdfExport";
import { lt } from "@/modules/operationsLocalization";

type CurrencyMode = "original" | "base" | "selected";
type ClientExportFormat = "pdf" | "excel" | "csv";
type ClientExportPayload = {
  columns: Array<{ key: string; label: string }>;
  rows: Record<string, unknown>[];
};

export function AccountingReportPage<T extends Record<string, unknown>>({
  title,
  reportType,
  columns,
  mapRows,
  summaryBuilder,
  totalsBuilder,
  prepareClientExport,
  showCurrency,
  currencyField = "currencyId",
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
  prepareClientExport?: (rows: T[], format: ClientExportFormat) => ClientExportPayload | Promise<ClientExportPayload | null> | null;
  showCurrency?: boolean;
  currencyField?: keyof T & string;
  needsAccount?: boolean;
  needsCustomer?: boolean;
  needsVendor?: boolean;
}) {
  const workspace = useWorkspace();
  const reportRef = useRef<HTMLDivElement>(null);
  const { hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const initialFilters = () => ({
    fromDate: "",
    toDate: "",
    financialYearId: "",
    branchId: workspace.branchId ?? "",
    accountId: "",
    customerId: searchParams.get("customerId") ?? "",
    vendorId: searchParams.get("vendorId") ?? "",
    currencyId: searchParams.get("currencyId") ?? "",
    reportCurrencyId: searchParams.get("reportCurrencyId") ?? "",
    currencyMode: "original" as CurrencyMode
  });
  const [filters, setFilters] = useState(initialFilters);
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
  const currencyById = useMemo(() => new Map((currencies.data ?? []).map((currency) => [currency.id, currency.currencyCode])), [currencies.data]);
  const displayColumns = useMemo<ColumnDef<T>[]>(() => {
    if (!showCurrency) return columns;
    const hasCurrencyColumn = columns.some((column) => String(column.id ?? ("accessorKey" in column ? column.accessorKey : "")) === "currencyCode");
    if (hasCurrencyColumn) return columns;
    return insertAfter(columns, {
      id: "currencyCode",
      header: lt("Currency"),
      cell: ({ row }) => currencyById.get(String(row.original[currencyField] ?? "")) ?? workspace.baseCurrency
    }, ["voucherType", "particulars", "chequeOrReferenceNumber", "narration", "accountName"]);
  }, [columns, currencyById, currencyField, showCurrency, workspace.baseCurrency]);
  const summary = summaryBuilder?.(rows, report.data?.data) ?? [];
  const totals = totalsBuilder?.(rows) ?? [];
  const canExport = hasPermission("Reports.Export");
  const canPrint = hasPermission("Reports.Print");
  const rangeWarning = reportRangeWarning(applied.fromDate, applied.toDate, applied.financialYearId);
  const canSafeExport = canExport && !rangeWarning;

  async function exportPayload(format: ClientExportFormat): Promise<ClientExportPayload | null> {
    if (prepareClientExport) {
      return await prepareClientExport(rows, format);
    }

    const flatRows = rows.map(flattenRow);
    const exportRows = showCurrency ? flatRows.map((row, index) => ({
      ...row,
      currencyCode: currencyById.get(String(rows[index]?.[currencyField] ?? "")) ?? workspace.baseCurrency
    })) : flatRows;
    const exportColumns = displayColumns.map((x) => {
      const accessor = "accessorKey" in x ? x.accessorKey : undefined;
      return { key: String(x.id ?? accessor ?? "value"), label: String(x.header ?? x.id ?? accessor ?? lt("Value")) };
    });
    return { columns: exportColumns, rows: exportRows };
  }

  async function handleExportPdf() {
    const payload = await exportPayload("pdf");
    if (!payload) return;
    await exportPdfReport(pdfOptions(payload));
  }

  function pdfOptions(payload: ClientExportPayload) {
    return {
      fileName: `${reportType}.pdf`,
      title,
      tenantName: workspace.tenantCode,
      branchName: workspace.branchName ?? lt("Branch"),
      documentDate: new Date(),
      currencyCode: workspace.baseCurrency,
      cultureCode: workspace.cultureCode,
      columns: payload.columns,
      rows: payload.rows
    };
  }
  async function handleExportExcel() {
    const payload = await exportPayload("excel");
    if (!payload) return;
    await exportExcelReport({
      fileName: `${reportType}.xlsx`,
      reportTitle: title,
      tenantName: workspace.tenantCode,
      branchName: workspace.branchName ?? lt("Branch"),
      dateFrom: applied.fromDate || undefined,
      dateTo: applied.toDate || undefined,
      sheets: [{
        sheetName: lt("Report"),
        columns: payload.columns.map((column) => ({ key: column.key as never, header: column.label })),
        rows: payload.rows
      }]
    });
  }
  async function handleExportCsv() {
    const payload = await exportPayload("csv");
    if (!payload) return;
    const rowsFlat = payload.rows.map((row) => Object.fromEntries(payload.columns.map((column) => [column.label, row[column.key]])));
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
          {canExport ? <EmailReportAction subject={title} reportName={title} module="Reports" getHtml={() => reportRef.current?.outerHTML ?? ""} /> : null}
          {canExport ? <EmailPdfReportButton
            fileName={`${reportType}.pdf`}
            subject={title}
            reportName={title}
            module="Reports"
            createPdfBlob={async () => {
              const payload = await exportPayload("pdf");
              return createPdfReportBlob(pdfOptions(payload ?? { columns: [], rows: [] }));
            }}
          /> : null}
          {canExport ? <ExportButtons
            onExportPdf={!rangeWarning ? () => void handleExportPdf() : undefined}
            onExportExcel={!rangeWarning ? () => void handleExportExcel() : undefined}
            onExportCsv={!rangeWarning ? () => void (prepareClientExport ? handleExportCsv() : handleBackendExport("csv")) : undefined}
          /> : null}
          <Button variant="outline" size="sm" onClick={() => void handleExportPdf()} disabled={!canSafeExport}>{lt("PDF")} ({lt("Client")})</Button>
          <Button variant="outline" size="sm" onClick={() => void handleExportExcel()} disabled={!canSafeExport}>{lt("Excel")} ({lt("Client")})</Button>
          <Button variant="outline" size="sm" onClick={() => void handleExportCsv()} disabled={!canSafeExport}>{lt("CSV")} ({lt("Client")})</Button>
          {canPrint ? <Button variant="outline" size="sm" onClick={() => void handlePrintPreview()}>{lt("Print Preview")}</Button> : null}
        </div>
      </CardHeader>
      <CardContent ref={reportRef} className="space-y-3">
        {rangeWarning ? <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{rangeWarning}</div> : null}
        {summary.length ? <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{summary.map((x) => <div key={x.label} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{x.label}</p><p className="text-lg font-semibold">{x.value}</p></div>)}</div> : null}
        <DataTable
          data={rows}
          columns={displayColumns}
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

function reportRangeWarning(fromDate: string, toDate: string, financialYearId: string) {
  if (financialYearId) return "";
  if (!fromDate || !toDate) return lt("Exports require a bounded from/to date range at production scale.");
  const days = Math.floor((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000);
  if (days > 366) return lt("Exports over 366 days should run from reporting summary tables.");
  return "";
}

function flattenRow(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === "object" ? JSON.stringify(value) : value])) as Record<string, unknown>;
}

function insertAfter<T extends Record<string, unknown>>(columns: ColumnDef<T>[], column: ColumnDef<T>, preferredKeys: string[]) {
  const index = columns.findIndex((candidate) => preferredKeys.includes(String(candidate.id ?? ("accessorKey" in candidate ? candidate.accessorKey : ""))));
  if (index < 0) return [...columns, column];
  return [...columns.slice(0, index + 1), column, ...columns.slice(index + 1)];
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
