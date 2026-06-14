import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getFinancialYears } from "@/api/accountingApi";
import { searchAgents } from "@/api/agentApi";
import { getBranchOptions } from "@/api/branchApi";
import { searchCarriers } from "@/api/carrierApi";
import { getCurrencies } from "@/api/currencyApi";
import { searchCustomers } from "@/api/customerApi";
import { getEmployees } from "@/api/employeeApi";
import {
  exportOperationalReport,
  getOperationalReport,
  printPreviewOperationalReport,
  type OperationalReportRequest,
  type OperationalReportRow,
  type OperationalReportType
} from "@/api/reportApi";
import { getTenantOptions } from "@/api/tenantApi";
import { searchVendors } from "@/api/vendorApi";
import { useAuth } from "@/auth/useAuth";
import { DataTable } from "@/components/common/DataTable";
import { ExportButtons } from "@/components/common/ExportButtons";
import { PrintPreview } from "@/components/common/PrintPreview";
import { ReportFilterPanel } from "@/components/common/ReportFilterPanel";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/hooks/useWorkspace";
import { formatByCulture } from "@/utils/dateFormat";
import { exportFullCsv } from "@/utils/csvExport";
import { exportExcelReport } from "@/utils/excelExport";
import { exportPdfReport } from "@/utils/pdfExport";
import { lt } from "@/modules/operationsLocalization";

export const operationReportColumns: ColumnDef<OperationalReportRow>[] = [
  { accessorKey: "referenceNumber", header: lt("Reference") },
  { accessorKey: "reportType", header: lt("Type"), cell: ({ row }) => lt(row.original.reportType) },
  {
    accessorKey: "eventDate",
    header: lt("Date"),
    cell: ({ row }) => row.original.eventDate ? formatByCulture(row.original.eventDate) : "-"
  },
  { accessorKey: "status", header: lt("Status"), cell: ({ row }) => row.original.status ? lt(row.original.status) : "-" },
  { accessorKey: "shipmentType", header: lt("Shipment Type"), cell: ({ row }) => row.original.shipmentType ? lt(row.original.shipmentType) : "-" },
  { accessorKey: "modeOfTransport", header: lt("Mode"), cell: ({ row }) => row.original.modeOfTransport ? lt(row.original.modeOfTransport) : "-" },
  { accessorKey: "origin", header: lt("Origin") },
  { accessorKey: "destination", header: lt("Destination") },
  { accessorKey: "carrierName", header: lt("Carrier") },
  { accessorKey: "containerNumber", header: lt("Container") },
  { accessorKey: "pieces", header: lt("Pieces"), cell: ({ row }) => row.original.pieces.toLocaleString() },
  { accessorKey: "weight", header: lt("Weight"), cell: ({ row }) => row.original.weight.toLocaleString() },
  { accessorKey: "volume", header: lt("Volume"), cell: ({ row }) => row.original.volume.toLocaleString() },
  { accessorKey: "amount", header: lt("Amount"), cell: ({ row }) => row.original.amount.toLocaleString() },
  { accessorKey: "baseAmount", header: lt("Base Amount"), cell: ({ row }) => row.original.baseAmount.toLocaleString() },
  { accessorKey: "ageDays", header: lt("Age (Days)") },
  { accessorKey: "remarks", header: lt("Remarks") }
];

type FilterFlags = {
  customer?: boolean;
  vendor?: boolean;
  agent?: boolean;
  salesman?: boolean;
  shipmentType?: boolean;
  shipmentStatus?: boolean;
  modeOfTransport?: boolean;
  currency?: boolean;
  originDestination?: boolean;
  route?: boolean;
  carrier?: boolean;
  container?: boolean;
};

const shipmentTypeOptions = ["GoodsReceipt", "HouseShipment", "MasterShipment", "DirectShipment", "Pickup"];
const modeOptions = ["Air", "Sea", "Road", "Courier"];
const statusOptions = ["Draft", "Submitted", "Approved", "Rejected", "Booked", "In Transit", "Delivered", "Closed", "Cancelled", "Pending"];

export function OperationalReportPage({
  title,
  reportType,
  columns = operationReportColumns,
  filters = {},
  summaryBuilder
}: {
  title: string;
  reportType: OperationalReportType;
  columns?: ColumnDef<OperationalReportRow>[];
  filters?: FilterFlags;
  summaryBuilder?: (rows: OperationalReportRow[]) => Array<{ label: string; value: string | number }>;
}) {
  const { hasPermission } = useAuth();
  const workspace = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [printContent, setPrintContent] = useState("");
  const [state, setState] = useState({
    tenantId: "",
    branchId: workspace.branchId ?? "",
    financialYearId: "",
    fromDate: "",
    toDate: "",
    customerId: "",
    vendorId: "",
    agentId: "",
    salesmanId: "",
    shipmentType: "",
    shipmentStatus: "",
    modeOfTransport: "",
    currencyId: "",
    origin: "",
    destination: "",
    route: "",
    carrierId: "",
    containerNumber: ""
  });
  const [applied, setApplied] = useState(state);

  const tenants = useQuery({ queryKey: ["op-report-tenants"], queryFn: getTenantOptions });
  const branches = useQuery({ queryKey: ["op-report-branches"], queryFn: getBranchOptions });
  const years = useQuery({ queryKey: ["op-report-years"], queryFn: () => getFinancialYears({ pageNumber: 1, pageSize: 200 }) });
  const customers = useQuery({ queryKey: ["op-report-customers"], queryFn: () => searchCustomers({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const vendors = useQuery({ queryKey: ["op-report-vendors"], queryFn: () => searchVendors({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const agents = useQuery({ queryKey: ["op-report-agents"], queryFn: () => searchAgents({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const salesmen = useQuery({ queryKey: ["op-report-salesmen"], queryFn: () => getEmployees(true, true) });
  const carriers = useQuery({ queryKey: ["op-report-carriers"], queryFn: () => searchCarriers({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const currencies = useQuery({ queryKey: ["op-report-currencies"], queryFn: getCurrencies });

  const request = useMemo<OperationalReportRequest>(() => ({
    pageNumber,
    pageSize,
    financialYearId: applied.financialYearId || undefined,
    fromDate: applied.fromDate || undefined,
    toDate: applied.toDate || undefined,
    customerId: applied.customerId || undefined,
    vendorId: applied.vendorId || undefined,
    agentId: applied.agentId || undefined,
    salesmanId: applied.salesmanId || undefined,
    shipmentType: applied.shipmentType || undefined,
    shipmentStatus: applied.shipmentStatus || undefined,
    modeOfTransport: applied.modeOfTransport || undefined,
    currencyId: applied.currencyId || undefined,
    origin: applied.origin || undefined,
    destination: applied.destination || undefined,
    route: applied.route || undefined,
    carrierId: applied.carrierId || undefined,
    containerNumber: applied.containerNumber || undefined
  }), [applied, pageNumber, pageSize]);

  const report = useQuery({
    queryKey: ["op-report", reportType, request],
    queryFn: () => getOperationalReport(reportType, request)
  });

  const rows = report.data?.data ?? [];
  const summary = summaryBuilder?.(rows) ?? defaultSummary(rows);
  const canExport = hasPermission("Reports.Export");

  async function onBackendExport(format: "pdf" | "excel" | "csv") {
    const result = await exportOperationalReport(reportType, { ...request, exportFormat: format });
    const bytes = base64ToBytes(result.content);
    const blob = new Blob([bytes], { type: result.contentType || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.fileName || `${reportType}.${format === "excel" ? "xls" : format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function onPrintPreview() {
    const result = await printPreviewOperationalReport(reportType, request);
    setPrintContent(safeDecodeBase64(result.content));
  }

  async function onClientPdf() {
    const exportRows = rows.map((row) => Object.fromEntries(Object.entries(row)) as Record<string, unknown>);
    await exportPdfReport({
      fileName: `${reportType}.pdf`,
      title,
      tenantName: workspace.tenantCode,
      branchName: workspace.branchName ?? lt("Branch"),
      documentDate: new Date(),
      currencyCode: workspace.baseCurrency,
      cultureCode: workspace.cultureCode,
      columns: columns.map((x) => ({ key: String(x.id ?? ("accessorKey" in x ? x.accessorKey : "value") ?? "value"), label: String(x.header ?? x.id ?? lt("Value")) })),
      rows: exportRows
    });
  }
  async function onClientExcel() {
    const mapped = rows.map((x) => ({ ...x, eventDate: x.eventDate ?? "" }));
    const keys = mapped[0] ? Object.keys(mapped[0]) : ["referenceNumber"];
    await exportExcelReport({
      fileName: `${reportType}.xlsx`,
      reportTitle: title,
      tenantName: workspace.tenantCode,
      branchName: workspace.branchName ?? lt("Branch"),
      dateFrom: request.fromDate,
      dateTo: request.toDate,
      sheets: [{ sheetName: lt("Report"), columns: keys.map((k) => ({ key: k as never, header: lt(k) })), rows: mapped }]
    });
  }
  function onClientCsv() {
    const exportRows = rows.map((row) => Object.fromEntries(Object.entries(row)) as Record<string, unknown>);
    exportFullCsv(exportRows, `${reportType}.csv`);
  }

  return <div className="space-y-4">
    <PageHeader title={title} description={lt("Operational report with branch-aware filters and export options.")} />
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{lt("Filters")}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setCollapsed((x) => !x)}>{collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</Button>
      </CardHeader>
      {!collapsed ? <CardContent className="space-y-3">
        <ReportFilterPanel
          onReset={() => setState({
            tenantId: "",
            branchId: workspace.branchId ?? "",
            financialYearId: "",
            fromDate: "",
            toDate: "",
            customerId: "",
            vendorId: "",
            agentId: "",
            salesmanId: "",
            shipmentType: "",
            shipmentStatus: "",
            modeOfTransport: "",
            currencyId: "",
            origin: "",
            destination: "",
            route: "",
            carrierId: "",
            containerNumber: ""
          })}
          onApply={() => {
            setPageNumber(1);
            if (state.tenantId) {
              const t = (tenants.data ?? []).find((x) => x.id === state.tenantId);
              if (t) workspace.setTenant(t.code, t.id);
            }
            if (state.branchId) {
              const b = (branches.data ?? []).find((x) => x.id === state.branchId);
              if (b) workspace.setBranch(b.id, b.name);
            }
            setApplied(state);
          }}
        >
          <Field label={lt("Tenant")}><select className="h-10 rounded-md border px-3 text-sm" value={state.tenantId} onChange={(e) => setState({ ...state, tenantId: e.target.value })}><option value="">{lt("Current")}</option>{(tenants.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}</select></Field>
          <Field label={lt("Branch")}><select className="h-10 rounded-md border px-3 text-sm" value={state.branchId} onChange={(e) => setState({ ...state, branchId: e.target.value })}><option value="">{lt("Current")}</option>{(branches.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}</select></Field>
          <Field label={lt("Financial Year")}><select className="h-10 rounded-md border px-3 text-sm" value={state.financialYearId} onChange={(e) => setState({ ...state, financialYearId: e.target.value })}><option value="">{lt("All")}</option>{(years.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.yearCode}</option>)}</select></Field>
          <Field label={lt("From Date")}><Input type="date" value={state.fromDate} onChange={(e) => setState({ ...state, fromDate: e.target.value })} /></Field>
          <Field label={lt("To Date")}><Input type="date" value={state.toDate} onChange={(e) => setState({ ...state, toDate: e.target.value })} /></Field>
          {filters.customer ? <Field label={lt("Customer")}><select className="h-10 rounded-md border px-3 text-sm" value={state.customerId} onChange={(e) => setState({ ...state, customerId: e.target.value })}><option value="">{lt("All")}</option>{(customers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.customerCode} - {x.customerName}</option>)}</select></Field> : null}
          {filters.vendor ? <Field label={lt("Vendor")}><select className="h-10 rounded-md border px-3 text-sm" value={state.vendorId} onChange={(e) => setState({ ...state, vendorId: e.target.value })}><option value="">{lt("All")}</option>{(vendors.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.vendorCode} - {x.vendorName}</option>)}</select></Field> : null}
          {filters.agent ? <Field label={lt("Agent")}><select className="h-10 rounded-md border px-3 text-sm" value={state.agentId} onChange={(e) => setState({ ...state, agentId: e.target.value })}><option value="">{lt("All")}</option>{(agents.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.agentCode} - {x.agentName}</option>)}</select></Field> : null}
          {filters.salesman ? <Field label={lt("Salesman")}><select className="h-10 rounded-md border px-3 text-sm" value={state.salesmanId} onChange={(e) => setState({ ...state, salesmanId: e.target.value })}><option value="">{lt("All")}</option>{(salesmen.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.employeeCode} - {x.fullName}</option>)}</select></Field> : null}
          {filters.shipmentType ? <Field label={lt("Shipment Type")}><select className="h-10 rounded-md border px-3 text-sm" value={state.shipmentType} onChange={(e) => setState({ ...state, shipmentType: e.target.value })}><option value="">{lt("All")}</option>{shipmentTypeOptions.map((x) => <option key={x} value={x}>{lt(x)}</option>)}</select></Field> : null}
          {filters.shipmentStatus ? <Field label={lt("Shipment Status")}><select className="h-10 rounded-md border px-3 text-sm" value={state.shipmentStatus} onChange={(e) => setState({ ...state, shipmentStatus: e.target.value })}><option value="">{lt("All")}</option>{statusOptions.map((x) => <option key={x} value={x}>{lt(x)}</option>)}</select></Field> : null}
          {filters.modeOfTransport ? <Field label={lt("Mode")}><select className="h-10 rounded-md border px-3 text-sm" value={state.modeOfTransport} onChange={(e) => setState({ ...state, modeOfTransport: e.target.value })}><option value="">{lt("All")}</option>{modeOptions.map((x) => <option key={x} value={x}>{lt(x)}</option>)}</select></Field> : null}
          {filters.currency ? <Field label={lt("Currency")}><select className="h-10 rounded-md border px-3 text-sm" value={state.currencyId} onChange={(e) => setState({ ...state, currencyId: e.target.value })}><option value="">{lt("All")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select></Field> : null}
          {filters.originDestination ? <Field label={lt("Origin")}><Input value={state.origin} onChange={(e) => setState({ ...state, origin: e.target.value })} placeholder={lt("Origin")} /></Field> : null}
          {filters.originDestination ? <Field label={lt("Destination")}><Input value={state.destination} onChange={(e) => setState({ ...state, destination: e.target.value })} placeholder={lt("Destination")} /></Field> : null}
          {filters.route ? <Field label={lt("Route")}><Input value={state.route} onChange={(e) => setState({ ...state, route: e.target.value })} placeholder={lt("Route")} /></Field> : null}
          {filters.carrier ? <Field label={lt("Carrier")}><select className="h-10 rounded-md border px-3 text-sm" value={state.carrierId} onChange={(e) => setState({ ...state, carrierId: e.target.value })}><option value="">{lt("All")}</option>{(carriers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.carrierCode} - {x.carrierName}</option>)}</select></Field> : null}
          {filters.container ? <Field label={lt("Container")}><Input value={state.containerNumber} onChange={(e) => setState({ ...state, containerNumber: e.target.value })} placeholder={lt("Container number")} /></Field> : null}
        </ReportFilterPanel>
      </CardContent> : null}
    </Card>
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{lt("Report Output")}</CardTitle>
        <div className="flex items-center gap-2">
          {canExport ? <ExportButtons
            onExportPdf={() => void onBackendExport("pdf")}
            onExportExcel={() => void onBackendExport("excel")}
            onExportCsv={() => void onBackendExport("csv")}
          /> : null}
          {canExport ? <Button variant="outline" size="sm" onClick={() => void onClientPdf()}>{lt("PDF")} ({lt("Client")})</Button> : null}
          {canExport ? <Button variant="outline" size="sm" onClick={() => void onClientExcel()}>{lt("Excel")} ({lt("Client")})</Button> : null}
          {canExport ? <Button variant="outline" size="sm" onClick={() => void onClientCsv()}>{lt("CSV")} ({lt("Client")})</Button> : null}
          {hasPermission("Reports.Print") ? <Button variant="outline" size="sm" onClick={() => void onPrintPreview()}>{lt("Print Preview")}</Button> : null}
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
      </CardContent>
    </Card>
    {printContent ? <PrintPreview title={`${title} - ${lt("Print Preview")}`}><div className="whitespace-pre-wrap text-sm">{printContent}</div></PrintPreview> : null}
  </div>;
}

function defaultSummary(rows: OperationalReportRow[]) {
  return [
    { label: lt("Records"), value: rows.length },
    { label: lt("Pending"), value: rows.filter((x) => x.isPending).length },
    { label: lt("Total Amount"), value: rows.reduce((s, x) => s + x.amount, 0).toFixed(2) },
    { label: lt("Base Amount"), value: rows.reduce((s, x) => s + x.baseAmount, 0).toFixed(2) }
  ];
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><p className="text-xs text-muted-foreground">{label}</p>{children}</div>;
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
