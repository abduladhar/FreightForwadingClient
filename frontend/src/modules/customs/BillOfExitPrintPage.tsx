import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet } from "lucide-react";
import { useParams } from "react-router-dom";
import { getBranchById } from "@/api/branchApi";
import { getBillOfExit, type BillOfExitDto, type BillOfExitItemDto } from "@/api/billOfExitApi";
import { getTenantById } from "@/api/tenantApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { PermissionGuard } from "@/auth/PermissionGuard";
import { useAuth } from "@/auth/useAuth";
import { EmailReportAction } from "@/components/common/EmailReportAction";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { useWorkspace } from "@/hooks/useWorkspace";
import { lt } from "@/modules/operationsLocalization";
import { exportCustomsItemsExcel, type CustomsExcelColumn } from "@/utils/customsExcelExport";

type PrintMode = "document" | "items";
type BoxItemExcelRow = Record<string, unknown> & {
  no: number;
  billOfEntryNumber: string;
  inventoryCode: string;
  inventoryName: string;
  goodsDescription: string;
  countryOfOrigin: string;
  quantity: number;
  unit: string;
  netWeight: number;
  grossWeight: number;
  cifForeignValue: number;
  cifLocalValue: number;
  total: number;
};

export function BillOfExitPrintPage({ mode = "document" }: { mode?: PrintMode }) {
  const { billOfExitId } = useParams();
  const workspace = useWorkspace();
  const { session } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  const query = useQuery({ queryKey: ["bill-of-exit-print", billOfExitId], queryFn: () => getBillOfExit(billOfExitId ?? ""), enabled: Boolean(billOfExitId) });
  const tenant = useQuery({ queryKey: ["box-print-tenant", session?.tenantId], queryFn: () => getTenantById(session!.tenantId!), enabled: Boolean(session?.tenantId) });
  const branch = useQuery({ queryKey: ["box-print-branch", session?.branchId], queryFn: () => getBranchById(session!.branchId!), enabled: Boolean(session?.branchId) });

  if (query.isLoading || tenant.isLoading || branch.isLoading) return <LoadingScreen />;
  if (query.isError || tenant.isError || branch.isError || !query.data) return <ErrorState onRetry={() => { void query.refetch(); void tenant.refetch(); void branch.refetch(); }} />;

  const box = query.data;
  const reference = printReference(box.billOfExitNumber, box.declarationNumber);
  const title = mode === "items" ? `${lt("Bill of Exit Items")} ${reference}` : `${lt("Bill of Exit")} ${reference}`;
  const printTitle = mode === "items" ? lt("BILL OF EXIT ITEMS") : lt("BILL OF EXIT");
  const fallbackLogoPath = `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const logoUrl = tenant.data?.logoUrl?.trim() || fallbackLogoPath;
  const branchName = workspace.branchName ?? lt("Branch");
  const branchAddress = branch.data?.address?.trim() || lt("Sample Address Line 1, City, Country");
  const totals = totalItems(box.items ?? []);

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description={lt("Print preview.")}
        actions={
          <>
            <PermissionGuard permission="BillOfExit.Read" fallback="hidden">
              <EmailReportAction
                subject={`${mode === "items" ? "Bill of Exit Items" : "Bill of Exit"} - ${reference}`}
                reportName={title}
                module="BillOfExit"
                getHtml={() => reportRef.current?.outerHTML ?? ""}
              />
            </PermissionGuard>
            <PermissionButton permission="BillOfExit.Read" variant="outline" onClick={() => void exportBoxItemsExcel({ box, reference, logoUrl, branchName, branchAddress, tenantName: workspace.tenantCode })}>
              <FileSpreadsheet className="h-4 w-4" />{lt("Excel Export")}
            </PermissionButton>
          </>
        }
      />
      <PrintPreview title={title}>
        <div ref={reportRef} className="mx-auto w-full max-w-[190mm] space-y-4 bg-white text-[11px] leading-tight print:max-w-none print:text-[9px]">
          <PrintHeader logoUrl={logoUrl} title={printTitle} branchName={branchName} branchAddress={branchAddress} />
          {mode === "document" ? <BillOfExitDetails box={box} /> : <ItemsSummary box={box} totals={totals} />}
          <ItemsTable items={box.items ?? []} totals={totals} />
        </div>
      </PrintPreview>
    </div>
  );
}

function PrintHeader({ logoUrl, title, branchName, branchAddress }: { logoUrl: string; title: string; branchName: string; branchAddress: string }) {
  return (
    <div className="border-b pb-3">
      <div className="grid grid-cols-[140px_1fr_190px] items-center">
        <div className="flex justify-start">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-28 w-28 object-contain" /> : <div className="h-28 w-28" />}</div>
        <div className="text-center"><h3 className="text-xl font-bold tracking-wide">{title}</h3></div>
        <div className="text-right"><p className="font-semibold">{branchName}</p><p className="text-muted-foreground">{branchAddress}</p></div>
      </div>
    </div>
  );
}

function BillOfExitDetails({ box }: { box: BillOfExitDto }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1 rounded-md border p-2">
        <Line label={lt("Bill of Exit Number:")} value={box.billOfExitNumber} />
        <Line label={lt("Declaration Number:")} value={box.declarationNumber} />
        <Line label={lt("Declaration Date:")} value={formatDate(box.declarationDate)} />
        <Line label={lt("Status:")} value={box.state} />
        <Line label={lt("Declaration Type:")} value={box.declarationType} />
        <Line label={lt("Port Type:")} value={box.portType} />
      </div>
      <div className="space-y-1 rounded-md border p-2">
        <Line label={lt("Consignee / Exporter:")} value={box.consigneeExporterName} />
        <Line label={lt("Intercessor Company:")} value={box.intercessorCustomerName} />
        <Line label={lt("Warehouse Location:")} value={[box.warehouseName, box.warehouseLocationName].filter(Boolean).join(" / ")} />
        <Line label={lt("Currency:")} value={box.currencyCode} />
        <Line label={lt("Net / Gross Weight:")} value={`${formatNumber(box.netWeight)} / ${formatNumber(box.grossWeight)}`} />
        <Line label={lt("Items Count:")} value={(box.items ?? []).length} />
      </div>
    </div>
  );
}

function ItemsSummary({ box, totals }: { box: BillOfExitDto; totals: ReturnType<typeof totalItems> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1 rounded-md border p-2">
        <Line label={lt("Bill of Exit Number:")} value={box.billOfExitNumber} />
        <Line label={lt("Declaration Number:")} value={box.declarationNumber} />
        <Line label={lt("Declaration Date:")} value={formatDate(box.declarationDate)} />
        <Line label={lt("Status:")} value={box.state} />
      </div>
      <div className="space-y-1 rounded-md border p-2">
        <Line label={lt("Items Count:")} value={(box.items ?? []).length} />
        <Line label={lt("Total Quantity:")} value={formatNumber(totals.quantity)} />
        <Line label={lt("Total Net Weight:")} value={formatNumber(totals.netWeight)} />
        <Line label={lt("Total Gross Weight:")} value={formatNumber(totals.grossWeight)} />
      </div>
    </div>
  );
}

function ItemsTable({ items, totals }: { items: BillOfExitItemDto[]; totals: ReturnType<typeof totalItems> }) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-[10px] print:text-[8px]">
        <thead className="bg-muted">
          <tr>
            <Th>{lt("No")}</Th>
            <Th>{lt("BOE Number")}</Th>
            <Th>{lt("Inventory Code")}</Th>
            <Th>{lt("Inventory Name")}</Th>
            <Th>{lt("HS Code")}</Th>
            <Th>{lt("Goods Description")}</Th>
            <Th>{lt("Country")}</Th>
            <Th align="right">{lt("Quantity")}</Th>
            <Th>{lt("Unit")}</Th>
            <Th align="right">{lt("Net Weight")}</Th>
            <Th align="right">{lt("Gross Weight")}</Th>
            <Th align="right">{lt("CIF Foreign")}</Th>
            <Th align="right">{lt("CIF Local")}</Th>
            <Th align="right">{lt("Total")}</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="border-t">
              <Td>{index + 1}</Td>
              <Td>{item.billOfEntryNumber}</Td>
              <Td>{item.inventoryCode}</Td>
              <Td>{item.inventoryName}</Td>
              <Td>{item.hsCode || "-"}</Td>
              <Td>{item.goodsDescription}</Td>
              <Td>{item.countryOfOrigin}</Td>
              <Td align="right">{formatNumber(item.quantity)}</Td>
              <Td>{item.unit}</Td>
              <Td align="right">{formatNumber(item.netWeight)}</Td>
              <Td align="right">{formatNumber(item.grossWeight)}</Td>
              <Td align="right">{formatNumber(item.cifForeignValue)}</Td>
              <Td align="right">{formatNumber(item.cifLocalValue)}</Td>
              <Td align="right">{formatNumber(item.total)}</Td>
            </tr>
          ))}
          <tr className="border-t bg-muted/60 font-semibold">
            <Td colSpan={7}>{lt("Total")}</Td>
            <Td align="right">{formatNumber(totals.quantity)}</Td>
            <Td />
            <Td align="right">{formatNumber(totals.netWeight)}</Td>
            <Td align="right">{formatNumber(totals.grossWeight)}</Td>
            <Td align="right">{formatNumber(totals.cifForeignValue)}</Td>
            <Td align="right">{formatNumber(totals.cifLocalValue)}</Td>
            <Td align="right">{formatNumber(totals.total)}</Td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Line({ label, value }: { label: string; value: unknown }) {
  return <p><span className="font-medium">{label}</span> {display(value)}</p>;
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th className={`px-2 py-2 ${align === "right" ? "text-right" : "text-left"}`}>{children}</th>;
}

function Td({ children, align = "left", colSpan }: { children?: React.ReactNode; align?: "left" | "right"; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-2 py-1.5 ${align === "right" ? "text-right" : "text-left"}`}>{children}</td>;
}

function totalItems(items: BillOfExitItemDto[]) {
  return items.reduce((sum, item) => ({
    quantity: sum.quantity + numeric(item.quantity),
    netWeight: sum.netWeight + numeric(item.netWeight),
    grossWeight: sum.grossWeight + numeric(item.grossWeight),
    cifForeignValue: sum.cifForeignValue + numeric(item.cifForeignValue),
    cifLocalValue: sum.cifLocalValue + numeric(item.cifLocalValue),
    total: sum.total + numeric(item.total)
  }), { quantity: 0, netWeight: 0, grossWeight: 0, cifForeignValue: 0, cifLocalValue: 0, total: 0 });
}

function exportBoxItemsExcel({ box, reference, tenantName, branchName, branchAddress, logoUrl }: { box: BillOfExitDto; reference: string; tenantName: string; branchName: string; branchAddress: string; logoUrl: string }) {
  const rows = (box.items ?? []).map<BoxItemExcelRow>((item, index) => ({
    no: index + 1,
    billOfEntryNumber: item.billOfEntryNumber ?? "",
    inventoryCode: item.inventoryCode ?? "",
    inventoryName: item.inventoryName ?? "",
    goodsDescription: item.goodsDescription ?? "",
    countryOfOrigin: item.countryOfOrigin ?? "",
    quantity: item.quantity,
    unit: item.unit ?? "",
    netWeight: item.netWeight,
    grossWeight: item.grossWeight,
    cifForeignValue: item.cifForeignValue,
    cifLocalValue: item.cifLocalValue,
    total: item.total
  }));
  const totals = totalItems(box.items ?? []);
  return exportCustomsItemsExcel<BoxItemExcelRow>({
    fileName: `${reference}-box-items.xlsx`,
    title: "Bill of Exit Items",
    reference,
    tenantName,
    branchName,
    branchAddress,
    logoUrl,
    columns: boxColumns,
    rows,
    totals
  });
}

const boxColumns: CustomsExcelColumn<BoxItemExcelRow>[] = [
  { key: "no", header: "No", width: 8, type: "number" },
  { key: "billOfEntryNumber", header: "BOE Number", width: 18 },
  { key: "inventoryCode", header: "Inventory Code", width: 18 },
  { key: "inventoryName", header: "Inventory Name", width: 24 },
  { key: "goodsDescription", header: "Goods Description", width: 32 },
  { key: "countryOfOrigin", header: "Country", width: 18 },
  { key: "quantity", header: "Quantity", width: 14, type: "number" },
  { key: "unit", header: "Unit", width: 10 },
  { key: "netWeight", header: "Net Weight", width: 14, type: "number" },
  { key: "grossWeight", header: "Gross Weight", width: 14, type: "number" },
  { key: "cifForeignValue", header: "CIF Foreign", width: 16, type: "currency" },
  { key: "cifLocalValue", header: "CIF Local", width: 16, type: "currency" },
  { key: "total", header: "Total", width: 16, type: "currency" }
];

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "-";
}

function numeric(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: unknown, maximumFractionDigits = 3) {
  return numeric(value).toLocaleString(undefined, { maximumFractionDigits });
}

function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function printReference(primary?: string | null, secondary?: string | null) {
  return display(primary || secondary);
}
