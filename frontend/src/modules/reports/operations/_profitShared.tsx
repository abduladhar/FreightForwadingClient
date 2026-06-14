import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { searchAgents } from "@/api/agentApi";
import { getBranchOptions } from "@/api/branchApi";
import { getCurrencies } from "@/api/currencyApi";
import { searchCustomers } from "@/api/customerApi";
import { getEmployees } from "@/api/employeeApi";
import {
  getAgentWiseProfitReport,
  getBranchWiseProfitReport,
  getCustomerWiseProfitReport,
  getDestinationWiseProfitReport,
  getRouteWiseProfitReport,
  getSalesmanWiseProfitReport,
  getShipmentProfitReport,
  type ProfitGroupRow,
  type ProfitReportRequest,
  type ShipmentProfitDto
} from "@/api/reportApi";
import { useAuth } from "@/auth/useAuth";
import { DataTable } from "@/components/common/DataTable";
import { ExportButtons } from "@/components/common/ExportButtons";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/hooks/useWorkspace";
import { exportFullCsv } from "@/utils/csvExport";
import { exportExcelReport } from "@/utils/excelExport";
import { exportPdfReport } from "@/utils/pdfExport";
import { lt } from "@/modules/operationsLocalization";

const shipmentTypeOptions = ["GoodsReceipt", "HouseShipment", "MasterShipment", "DirectShipment", "Pickup"];
const modeOptions = ["Air", "Sea", "Road", "Courier"];

export const shipmentProfitColumns: ColumnDef<ShipmentProfitDto>[] = [
  { accessorKey: "shipmentType", header: lt("Shipment Type") },
  { accessorKey: "shipmentNumber", header: lt("Shipment No") },
  { accessorKey: "customerName", header: lt("Customer") },
  { accessorKey: "agentName", header: lt("Agent") },
  { accessorKey: "modeOfTransport", header: lt("Mode") },
  { accessorKey: "origin", header: lt("Origin") },
  { accessorKey: "destination", header: lt("Destination") },
  { accessorKey: "customerInvoiceAmount", header: lt("Invoice") },
  { accessorKey: "vendorBillAmount", header: lt("Vendor Bill") },
  { accessorKey: "agentCommissionAmount", header: lt("Commission") },
  { accessorKey: "otherExpenseAmount", header: lt("Other Expense") },
  { accessorKey: "shipmentProfitAmount", header: lt("Profit") },
  { accessorKey: "baseShipmentProfitAmount", header: lt("Base Profit") },
  { accessorKey: "reportShipmentProfitAmount", header: lt("Report Profit") }
];

export const groupedProfitColumns: ColumnDef<ProfitGroupRow>[] = [
  { accessorKey: "groupName", header: lt("Group") },
  { accessorKey: "shipmentCount", header: lt("Shipments") },
  { accessorKey: "baseCustomerInvoiceAmount", header: lt("Base Invoice") },
  { accessorKey: "baseVendorBillAmount", header: lt("Base Bill") },
  { accessorKey: "baseAgentCommissionAmount", header: lt("Base Commission") },
  { accessorKey: "baseOtherExpenseAmount", header: lt("Base Other Expense") },
  { accessorKey: "baseShipmentProfitAmount", header: lt("Base Profit") },
  { accessorKey: "reportShipmentProfitAmount", header: lt("Report Profit") }
];

type Mode = "shipment-profit" | "customer-wise-profit" | "salesman-wise-profit" | "agent-wise-profit" | "branch-wise-profit" | "route-wise-profit" | "destination-wise-profit";

export function ProfitReportPage<T extends ShipmentProfitDto | ProfitGroupRow>({
  title,
  mode,
  columns
}: {
  title: string;
  mode: Mode;
  columns: ColumnDef<T>[];
}) {
  const { hasPermission } = useAuth();
  const workspace = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [printContent, setPrintContent] = useState("");
  const [state, setState] = useState({
    branchId: workspace.branchId ?? "",
    fromDate: "",
    toDate: "",
    customerId: "",
    agentId: "",
    salesmanId: "",
    reportCurrencyId: "",
    shipmentType: "",
    modeOfTransport: "",
    origin: "",
    destination: ""
  });
  const [applied, setApplied] = useState(state);

  const branches = useQuery({ queryKey: ["profit-branches"], queryFn: getBranchOptions });
  const customers = useQuery({ queryKey: ["profit-customers"], queryFn: () => searchCustomers({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const agents = useQuery({ queryKey: ["profit-agents"], queryFn: () => searchAgents({ pageNumber: 1, pageSize: 500, isActive: true }) });
  const salesmen = useQuery({ queryKey: ["profit-salesmen"], queryFn: () => getEmployees(true, true) });
  const currencies = useQuery({ queryKey: ["profit-currencies"], queryFn: getCurrencies });

  const request = useMemo<ProfitReportRequest>(() => ({
    pageNumber,
    pageSize,
    fromDate: applied.fromDate || undefined,
    toDate: applied.toDate || undefined,
    customerId: applied.customerId || undefined,
    agentId: applied.agentId || undefined,
    salesmanId: applied.salesmanId || undefined,
    reportCurrencyId: applied.reportCurrencyId || undefined,
    shipmentType: applied.shipmentType || undefined,
    modeOfTransport: applied.modeOfTransport || undefined,
    origin: applied.origin || undefined,
    destination: applied.destination || undefined
  }), [applied, pageNumber, pageSize]);

  const query = useQuery({
    queryKey: ["profit-report", mode, request],
    queryFn: async () => {
      switch (mode) {
        case "shipment-profit": return getShipmentProfitReport(request);
        case "customer-wise-profit": return getCustomerWiseProfitReport(request);
        case "salesman-wise-profit": return getSalesmanWiseProfitReport(request);
        case "agent-wise-profit": return getAgentWiseProfitReport(request);
        case "branch-wise-profit": return getBranchWiseProfitReport(request);
        case "route-wise-profit": return getRouteWiseProfitReport(request);
        case "destination-wise-profit": return getDestinationWiseProfitReport(request);
        default: return getShipmentProfitReport(request);
      }
    }
  });

  const rows = (query.data?.data ?? []) as T[];
  const summary = buildSummary(rows);
  const canExport = hasPermission("Reports.Export");

  async function exportPdf() {
    await exportPdfReport({
      fileName: `${mode}.pdf`,
      title,
      tenantName: workspace.tenantCode,
      branchName: workspace.branchName ?? lt("Branch"),
      documentDate: new Date(),
      currencyCode: workspace.baseCurrency,
      cultureCode: workspace.cultureCode,
      columns: columns.map((x) => ({ key: String(x.id ?? ("accessorKey" in x ? x.accessorKey : "value") ?? "value"), label: String(x.header ?? x.id ?? lt("Value")) })),
      rows: rows as unknown as Record<string, unknown>[]
    });
  }
  async function exportExcel() {
    const mapped = rows as unknown as Record<string, unknown>[];
    const keys = mapped[0] ? Object.keys(mapped[0]) : ["groupName"];
    await exportExcelReport({
      fileName: `${mode}.xlsx`,
      reportTitle: title,
      tenantName: workspace.tenantCode,
      branchName: workspace.branchName ?? lt("Branch"),
      dateFrom: request.fromDate,
      dateTo: request.toDate,
      sheets: [{ sheetName: lt("Report"), columns: keys.map((k) => ({ key: k as never, header: lt(k) })), rows: mapped }]
    });
  }
  function exportCsv() {
    exportFullCsv(rows as unknown as Record<string, unknown>[], `${mode}.csv`);
  }
  function printPreview() {
    setPrintContent(JSON.stringify(rows, null, 2));
  }

  return <div className="space-y-4">
    <PageHeader title={title} description={lt("Profit report with shipment and party dimensions.")} />
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{lt("Filters")}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setCollapsed((x) => !x)}>{collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</Button>
      </CardHeader>
      {!collapsed ? <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <Field label={lt("Branch")}><select className="h-10 rounded-md border px-3 text-sm" value={state.branchId} onChange={(e) => setState({ ...state, branchId: e.target.value })}><option value="">{lt("Current")}</option>{(branches.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}</select></Field>
          <Field label={lt("From Date")}><Input type="date" value={state.fromDate} onChange={(e) => setState({ ...state, fromDate: e.target.value })} /></Field>
          <Field label={lt("To Date")}><Input type="date" value={state.toDate} onChange={(e) => setState({ ...state, toDate: e.target.value })} /></Field>
          <Field label={lt("Customer")}><select className="h-10 rounded-md border px-3 text-sm" value={state.customerId} onChange={(e) => setState({ ...state, customerId: e.target.value })}><option value="">{lt("All")}</option>{(customers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.customerCode} - {x.customerName}</option>)}</select></Field>
          <Field label={lt("Agent")}><select className="h-10 rounded-md border px-3 text-sm" value={state.agentId} onChange={(e) => setState({ ...state, agentId: e.target.value })}><option value="">{lt("All")}</option>{(agents.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.agentCode} - {x.agentName}</option>)}</select></Field>
          <Field label={lt("Salesman")}><select className="h-10 rounded-md border px-3 text-sm" value={state.salesmanId} onChange={(e) => setState({ ...state, salesmanId: e.target.value })}><option value="">{lt("All")}</option>{(salesmen.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.employeeCode} - {x.fullName}</option>)}</select></Field>
          <Field label={lt("Shipment Type")}><select className="h-10 rounded-md border px-3 text-sm" value={state.shipmentType} onChange={(e) => setState({ ...state, shipmentType: e.target.value })}><option value="">{lt("All")}</option>{shipmentTypeOptions.map((x) => <option key={x} value={x}>{lt(x)}</option>)}</select></Field>
          <Field label={lt("Mode")}><select className="h-10 rounded-md border px-3 text-sm" value={state.modeOfTransport} onChange={(e) => setState({ ...state, modeOfTransport: e.target.value })}><option value="">{lt("All")}</option>{modeOptions.map((x) => <option key={x} value={x}>{lt(x)}</option>)}</select></Field>
          <Field label={lt("Report Currency")}><select className="h-10 rounded-md border px-3 text-sm" value={state.reportCurrencyId} onChange={(e) => setState({ ...state, reportCurrencyId: e.target.value })}><option value="">{lt("Base")}</option>{(currencies.data ?? []).map((x) => <option key={x.id} value={x.id}>{x.currencyCode}</option>)}</select></Field>
          <Field label={lt("Origin")}><Input value={state.origin} onChange={(e) => setState({ ...state, origin: e.target.value })} /></Field>
          <Field label={lt("Destination")}><Input value={state.destination} onChange={(e) => setState({ ...state, destination: e.target.value })} /></Field>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setState({
            branchId: workspace.branchId ?? "",
            fromDate: "",
            toDate: "",
            customerId: "",
            agentId: "",
            salesmanId: "",
            reportCurrencyId: "",
            shipmentType: "",
            modeOfTransport: "",
            origin: "",
            destination: ""
          })}>{lt("Reset Filters")}</Button>
          <Button onClick={() => {
            if (state.branchId) {
              const b = (branches.data ?? []).find((x) => x.id === state.branchId);
              if (b) workspace.setBranch(b.id, b.name);
            }
            setPageNumber(1);
            setApplied(state);
          }}>{lt("View Report")}</Button>
        </div>
      </CardContent> : null}
    </Card>
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{lt("Report Output")}</CardTitle>
        <div className="flex items-center gap-2">
          {canExport ? <ExportButtons onExportPdf={() => void exportPdf()} onExportExcel={() => void exportExcel()} onExportCsv={() => exportCsv()} /> : null}
          {hasPermission("Reports.Print") ? <Button variant="outline" size="sm" onClick={printPreview}>{lt("Print Preview")}</Button> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary.length ? <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">{summary.map((x) => <div key={x.label} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{x.label}</p><p className="text-lg font-semibold">{x.value}</p></div>)}</div> : null}
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
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => void query.refetch()}
        />
      </CardContent>
    </Card>
    {printContent ? <PrintPreview title={`${title} - ${lt("Print Preview")}`}><pre className="max-h-[420px] overflow-auto whitespace-pre-wrap text-xs">{printContent}</pre></PrintPreview> : null}
  </div>;
}

function buildSummary(rows: Array<ShipmentProfitDto | ProfitGroupRow>) {
  if (!rows.length) return [{ label: lt("Records"), value: 0 }];
  const asGroup = rows as ProfitGroupRow[];
  if ("groupName" in asGroup[0]) {
    return [
      { label: lt("Groups"), value: asGroup.length },
      { label: lt("Shipments"), value: asGroup.reduce((s, x) => s + x.shipmentCount, 0) },
      { label: lt("Base Profit"), value: asGroup.reduce((s, x) => s + x.baseShipmentProfitAmount, 0).toFixed(2) },
      { label: lt("Report Profit"), value: asGroup.reduce((s, x) => s + x.reportShipmentProfitAmount, 0).toFixed(2) }
    ];
  }
  const asShipment = rows as ShipmentProfitDto[];
  return [
    { label: lt("Shipments"), value: asShipment.length },
    { label: lt("Invoice"), value: asShipment.reduce((s, x) => s + x.customerInvoiceAmount, 0).toFixed(2) },
    { label: lt("Cost"), value: asShipment.reduce((s, x) => s + x.vendorBillAmount + x.agentCommissionAmount + x.otherExpenseAmount, 0).toFixed(2) },
    { label: lt("Profit"), value: asShipment.reduce((s, x) => s + x.shipmentProfitAmount, 0).toFixed(2) }
  ];
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><p className="text-xs text-muted-foreground">{label}</p>{children}</div>;
}
