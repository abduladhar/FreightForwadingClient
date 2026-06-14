import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { getBranchById } from "@/api/branchApi";
import { getCustomer } from "@/api/customerApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getDirectShipment } from "@/api/directShipmentApi";
import { getHouseShipment } from "@/api/houseShipmentApi";
import { getInvoice } from "@/api/invoiceApi";
import { getMasterShipment } from "@/api/masterShipmentApi";
import { getPickup } from "@/api/pickupApi";
import { getTenantById } from "@/api/tenantApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspace } from "@/hooks/useWorkspace";
import { exportInvoicePdf, type InvoicePrintMode } from "@/utils/invoicePdf";
import { lt } from "@/modules/operationsLocalization";

type SourceItemTotals = {
  pieces?: number;
  weight?: number;
  volume?: number;
  volumeCbm?: number;
  receivedPieces?: number;
  receivedWeight?: number;
  loadedPieces?: number;
  loadedWeight?: number;
  loadedVolume?: number;
};
type SourceTotals = { pieces: number; weight: number; volume: number };

export function InvoicePrintPreviewPage() {
  const { invoiceId } = useParams();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const workspace = useWorkspace();
  const requestedMode: InvoicePrintMode = searchParams.get("mode") === "original" ? "original" : "proforma";
  const [mode, setMode] = useState<InvoicePrintMode>(requestedMode);
  const invoice = useQuery({ queryKey: ["invoice-print", invoiceId], queryFn: () => getInvoice(invoiceId!), enabled: Boolean(invoiceId) });
  const currencies = useQuery({ queryKey: ["tenant-currencies", "invoice-print"], queryFn: getTenantCurrencies });
  const customer = useQuery({
    queryKey: ["invoice-print-customer", invoice.data?.customerId],
    queryFn: () => getCustomer(invoice.data!.customerId),
    enabled: invoice.data?.billToPartyType === "Customer" && Boolean(invoice.data?.customerId)
  });
  const houseShipment = useQuery({
    queryKey: ["invoice-print-house-shipment", invoice.data?.sourceId],
    queryFn: () => getHouseShipment(invoice.data!.sourceId!),
    enabled: invoice.data?.sourceType === "HouseShipment" && Boolean(invoice.data?.sourceId)
  });
  const directShipment = useQuery({
    queryKey: ["invoice-print-direct-shipment", invoice.data?.sourceId],
    queryFn: () => getDirectShipment(invoice.data!.sourceId!),
    enabled: invoice.data?.sourceType === "DirectShipment" && Boolean(invoice.data?.sourceId)
  });
  const masterShipment = useQuery({
    queryKey: ["invoice-print-master-shipment", invoice.data?.sourceId],
    queryFn: () => getMasterShipment(invoice.data!.sourceId!),
    enabled: invoice.data?.sourceType === "MasterShipment" && Boolean(invoice.data?.sourceId)
  });
  const pickup = useQuery({
    queryKey: ["invoice-print-pickup", invoice.data?.sourceId],
    queryFn: () => getPickup(invoice.data!.sourceId!),
    enabled: invoice.data?.sourceType === "Pickup" && Boolean(invoice.data?.sourceId)
  });
  const tenant = useQuery({ queryKey: ["invoice-print-tenant", session?.tenantId], queryFn: () => getTenantById(session!.tenantId!), enabled: Boolean(session?.tenantId) });
  const branch = useQuery({ queryKey: ["invoice-print-branch", session?.branchId], queryFn: () => getBranchById(session!.branchId!), enabled: Boolean(session?.branchId) });

  useEffect(() => {
    setMode(requestedMode);
  }, [requestedMode]);

  if (!invoiceId) return <Navigate to="/invoices" replace />;
  if (invoice.isLoading || customer.isLoading || houseShipment.isLoading || directShipment.isLoading || masterShipment.isLoading || pickup.isLoading) return <LoadingScreen />;
  if (invoice.isError || !invoice.data || customer.isError || houseShipment.isError || directShipment.isError || masterShipment.isError || pickup.isError) {
    return <ErrorState onRetry={() => {
      void invoice.refetch();
      void customer.refetch();
      void houseShipment.refetch();
      void directShipment.refetch();
      void masterShipment.refetch();
      void pickup.refetch();
    }} />;
  }

  const data = invoice.data;
  const currencyCode = currencies.data?.find((currency) => currency.currencyId === data.invoiceCurrencyId)?.currencyCode ?? "USD";
  const baseCurrencyCode = currencies.data?.find((currency) => currency.isBaseCurrency)?.currencyCode ?? currencyCode;
  const fallbackLogoPath = `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const logoUrl = tenant.data?.logoUrl?.trim() || fallbackLogoPath;
  const branchAddress = branch.data?.address?.trim() || "Sample Address Line 1, City, Country";
  const title = mode === "proforma" ? lt("PERFORMA INVOICE") : lt("TAX INVOICE");
  const watermark = mode === "proforma" ? lt("PERFORMA") : lt("ORIGINAL");

  const exportOptions = {
    tenantName: workspace.tenantCode,
    branchName: workspace.branchName ?? "Branch",
    branchAddress,
    logoUrl,
    customer: customer.data ?? null,
    houseShipment: houseShipment.data ?? null,
    directShipment: directShipment.data ?? null,
    masterShipment: masterShipment.data ?? null,
    pickup: pickup.data ?? null,
    invoice: data,
    currencyCode,
    baseCurrencyCode,
    mode
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${lt("Print")}: ${data.invoiceNumber}`}
        description={lt("Print Proforma or Original invoice with watermark.")}
        actions={
          <>
            <AuditTrailButton />
            <PermissionButton
              permission="Invoice.Export"
              variant="outline"
              onClick={() => void exportInvoicePdf({ ...exportOptions, fileName: `${data.invoiceNumber}-${mode === "proforma" ? lt("Proforma") : lt("Original")}.pdf` })}
            >
              <Download className="h-4 w-4" />{lt("PDF Export")}</PermissionButton>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => setMode("proforma")}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${mode === "proforma" ? "border-sky-600 bg-sky-50 text-sky-700" : "bg-white"}`}
          >
            {lt("Print Proforma")}
          </button>
          <button
            type="button"
            onClick={() => setMode("original")}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${mode === "original" ? "border-sky-600 bg-sky-50 text-sky-700" : "bg-white"}`}
          >
            {lt("Print Invoice")}
          </button>
          <span className="text-sm text-muted-foreground">{lt("Current watermark")}: {watermark}</span>
        </CardContent>
      </Card>

      <PrintPreview title={`${title} ${data.invoiceNumber}`}>
        <InvoicePreview
          title={title}
          watermark={watermark}
          tenantName={workspace.tenantCode}
          branchName={workspace.branchName ?? "Branch"}
          branchAddress={branchAddress}
          logoUrl={logoUrl}
          invoice={data}
          currencyCode={currencyCode}
          baseCurrencyCode={baseCurrencyCode}
          customer={customer.data ?? null}
          houseShipment={houseShipment.data ?? null}
          directShipment={directShipment.data ?? null}
          masterShipment={masterShipment.data ?? null}
          pickup={pickup.data ?? null}
        />
      </PrintPreview>
    </div>
  );
}

function InvoicePreview({
  title,
  watermark,
  tenantName,
  branchName,
  branchAddress,
  logoUrl,
  invoice,
  currencyCode,
  baseCurrencyCode,
  customer,
  houseShipment,
  directShipment,
  masterShipment,
  pickup
}: {
  title: string;
  watermark: string;
  tenantName: string;
  branchName: string;
  branchAddress: string;
  logoUrl: string;
  invoice: NonNullable<Awaited<ReturnType<typeof getInvoice>>>;
  currencyCode: string;
  baseCurrencyCode: string;
  customer: Awaited<ReturnType<typeof getCustomer>> | null;
  houseShipment: Awaited<ReturnType<typeof getHouseShipment>> | null;
  directShipment: Awaited<ReturnType<typeof getDirectShipment>> | null;
  masterShipment: Awaited<ReturnType<typeof getMasterShipment>> | null;
  pickup: Awaited<ReturnType<typeof getPickup>> | null;
}) {
  const sourceRows = getSourceRows({ invoice, houseShipment, directShipment, masterShipment, pickup });
  return (
    <div className="relative mx-auto min-h-[1040px] max-w-[794px] overflow-hidden bg-white p-6 text-sm text-slate-900 print:min-h-0 print:max-w-none print:p-0">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-7xl font-black uppercase tracking-widest text-slate-200/70">
        {watermark}
      </div>
      <div className="relative space-y-4">
        <div className="border-b pb-3">
          <div className="grid grid-cols-[180px_1fr_220px] items-center gap-3">
            <div className="flex justify-start">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-28 w-28 object-contain" /> : <div className="h-28 w-28" />}</div>
            <div className="text-center"><h3 className="text-xl font-bold tracking-wide">{title}</h3></div>
            <div className="text-right text-xs">
              <p className="text-sm font-semibold">{tenantName}</p>
              <p>{branchName}</p>
              <p className="text-muted-foreground">{branchAddress}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="min-h-28 rounded-md border border-sky-200 p-3">
            <h4 className="mb-2 text-xs font-bold uppercase text-sky-700">{lt("Bill To")}</h4>
            <p className="font-semibold">{customer?.customerName ?? (invoice.billToPartyName || invoice.customerId)}</p>
            <p>{lt("Type")}: {invoice.billToPartyType || lt("Customer")}</p>
            {customer?.customerCode ? <p>{lt("Code")}: {customer.customerCode}</p> : null}
            {customer?.billingAddress ? <p className="whitespace-pre-wrap">{customer.billingAddress}</p> : null}
            <p>{[customer?.city, customer?.country].filter(Boolean).join(", ")}</p>
            {customer?.taxNumber ? <p>{lt("Tax No")}: {customer.taxNumber}</p> : null}
          </div>
          <div className="min-h-28 rounded-md border border-sky-200 p-3">
            <h4 className="mb-2 text-xs font-bold uppercase text-sky-700">{lt("Invoice Details")}</h4>
            <InfoRow label={lt("Invoice No")} value={invoice.invoiceNumber} />
            <InfoRow label={lt("Invoice Date")} value={invoice.invoiceDate} />
            <InfoRow label={lt("Due Date")} value={invoice.dueDate} />
            <InfoRow label={lt("Currency")} value={currencyCode} />
            <InfoRow label={lt("Base Currency")} value={baseCurrencyCode} />
            <InfoRow label={lt("Source Type")} value={formatSourceType(invoice.sourceType)} />
            <InfoRow label={lt("Reference No")} value={invoice.sourceReferenceNo || "-"} />
            <InfoRow label={lt("Status")} value={invoice.status} />
          </div>
        </div>

        {sourceRows ? (
          <div className="rounded-md border border-sky-200 p-3 text-xs">
            <h4 className="mb-2 font-semibold uppercase text-sky-700">{sourceRows.title}</h4>
            <div className="grid gap-x-4 gap-y-1 md:grid-cols-2">
              {sourceRows.rows.map((row) => <InfoRow key={row.label} label={row.label} value={row.value} />)}
            </div>
          </div>
        ) : null}

        <div className="rounded-md border border-sky-200">
          <table className="w-full text-xs">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-2 py-2 text-center">{lt("Sl No")}</th>
                <th className="px-2 py-2 text-left">{lt("Charge Head")}</th>
                <th className="px-2 py-2 text-left">{lt("Description")}</th>
                <th className="px-2 py-2 text-right">{lt("Qty")}</th>
                <th className="px-2 py-2 text-right">{lt("Rate")} ({currencyCode})</th>
                <th className="px-2 py-2 text-right">{lt("Tax")} ({currencyCode})</th>
                <th className="px-2 py-2 text-right">{lt("Amount")} ({currencyCode})</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="border-t border-sky-100">
                  <td className="px-2 py-2 text-center">{index + 1}</td>
                  <td className="px-2 py-2">{item.chargeHead || item.chargeName}</td>
                  <td className="px-2 py-2">{item.chargeCode} - {item.chargeName}</td>
                  <td className="px-2 py-2 text-right">{fmt(item.quantity)}</td>
                  <td className="px-2 py-2 text-right">{fmt(item.unitRate)}</td>
                  <td className="px-2 py-2 text-right">{fmt(item.taxAmount)}</td>
                  <td className="px-2 py-2 text-right">{fmt(item.lineAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <div className="rounded-md border p-3 text-xs">
            <h4 className="mb-2 font-semibold text-sky-700">{lt("Remarks")}</h4>
            <p className="whitespace-pre-wrap">{invoice.remarks || "-"}</p>
            <p className="mt-6 text-muted-foreground">{lt("This is a computer generated invoice.")}</p>
          </div>
          <div className="rounded-md border border-sky-200 p-3 text-xs">
            <TotalRow label={`${lt("Sub Total")} (${currencyCode})`} value={invoice.subTotalAmount} />
            <TotalRow label={`${lt("Discount")} (${currencyCode})`} value={invoice.discountAmount} />
            <TotalRow label={`${lt("Tax")} (${currencyCode})`} value={invoice.taxAmount} />
            <TotalRow label={`${lt("Round Off")} (${currencyCode})`} value={invoice.roundOffAmount} />
            <TotalRow label={`${lt("Grand Total")} (${currencyCode})`} value={invoice.totalAmount} strong />
            <TotalRow label={`${lt("Base Amount")} (${baseCurrencyCode})`} value={invoice.baseCurrencyAmount} />
            <TotalRow label={`${lt("Paid")} (${currencyCode})`} value={invoice.paidAmount} />
            <TotalRow label={`${lt("Outstanding")} (${currencyCode})`} value={invoice.outstandingAmount} strong />
          </div>
        </div>

        <div className="mt-10 flex justify-between text-xs">
          <div className="w-48 border-t pt-2">{lt("Prepared By")}</div>
          <div className="w-48 border-t pt-2 text-right">{lt("Authorized Signatory")}</div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <p className="grid grid-cols-[100px_1fr] gap-2 text-xs"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value || "-"}</span></p>;
}

function TotalRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return <div className={`flex justify-between py-1 ${strong ? "border-t font-semibold" : ""}`}><span>{label}</span><span>{fmt(value)}</span></div>;
}

function fmt(value: number) {
  return Number(value || 0).toFixed(2);
}

function getSourceRows({
  invoice,
  houseShipment,
  directShipment,
  masterShipment,
  pickup
}: {
  invoice: NonNullable<Awaited<ReturnType<typeof getInvoice>>>;
  houseShipment: Awaited<ReturnType<typeof getHouseShipment>> | null;
  directShipment: Awaited<ReturnType<typeof getDirectShipment>> | null;
  masterShipment: Awaited<ReturnType<typeof getMasterShipment>> | null;
  pickup: Awaited<ReturnType<typeof getPickup>> | null;
}) {
  if (invoice.sourceType === "HouseShipment" && houseShipment) {
    const totals = getTotals(houseShipment.items, "house");
    return {
      title: lt("House Shipment Information"),
      rows: [
        { label: lt("House No"), value: houseShipment.houseShipmentNumber },
        { label: lt("HAWB"), value: houseShipment.hawbNumber ?? "-" },
        { label: lt("Origin Port"), value: formatPort(houseShipment.originPortCode, houseShipment.originPortName, houseShipment.originPortCountryName, houseShipment.origin) },
        { label: lt("Destination Port"), value: formatPort(houseShipment.destinationPortCode, houseShipment.destinationPortName, houseShipment.destinationPortCountryName, houseShipment.destination) },
        { label: lt("Total Pieces"), value: totals.pieces.toFixed(0) },
        { label: lt("Total Weight"), value: `${fmt(totals.weight)} KG` },
        { label: lt("Total Volume"), value: `${totals.volume.toFixed(4)} CBM` },
        { label: lt("Drop Location"), value: houseShipment.dropLocation || "-" }
      ]
    };
  }

  if (invoice.sourceType === "DirectShipment" && directShipment) {
    const totals = getTotals(directShipment.items, "direct");
    return {
      title: lt("Direct Shipment Information"),
      rows: [
        { label: lt("Direct No"), value: directShipment.directShipmentNumber },
        { label: lt("Master Waybill"), value: directShipment.mawbNumber ?? "-" },
        { label: lt("Mode"), value: directShipment.modeOfTransport || "-" },
        { label: lt("Carrier"), value: directShipment.carrierName || "-" },
        { label: lt("Origin Port"), value: formatPort(directShipment.originPortCode, directShipment.originPortName, directShipment.originPortCountryName, directShipment.origin) },
        { label: lt("Destination Port"), value: formatPort(directShipment.destinationPortCode, directShipment.destinationPortName, directShipment.destinationPortCountryName, directShipment.destination) },
        { label: lt("Total Pieces"), value: totals.pieces.toFixed(0) },
        { label: lt("Total Weight"), value: `${fmt(totals.weight)} KG` },
        { label: lt("Total Volume"), value: `${totals.volume.toFixed(4)} CBM` },
        { label: lt("Transport Ref"), value: directShipment.flightNumber || directShipment.vesselName || directShipment.truckNumber || directShipment.containerNumber || "-" }
      ]
    };
  }

  if (invoice.sourceType === "MasterShipment" && masterShipment) {
    return {
      title: lt("Master Shipment Information"),
      rows: [
        { label: lt("Master No"), value: masterShipment.masterShipmentNumber },
        { label: lt("MAWB/MBL"), value: masterShipment.mawbNumber || masterShipment.mblNumber || "-" },
        { label: lt("Mode"), value: masterShipment.modeOfTransport || "-" },
        { label: lt("Carrier"), value: masterShipment.carrierName || "-" },
        { label: lt("Origin Port"), value: formatPort(masterShipment.originPortCode, masterShipment.originPortName, masterShipment.originPortCountryName) },
        { label: lt("Destination Port"), value: formatPort(masterShipment.destinationPortCode, masterShipment.destinationPortName, masterShipment.destinationPortCountryName) },
        { label: lt("Total Pieces"), value: fmt(masterShipment.totalPieces) },
        { label: lt("Total Weight"), value: `${fmt(masterShipment.totalWeight)} KG` },
        { label: lt("Total Volume"), value: `${Number(masterShipment.totalVolume || 0).toFixed(4)} CBM` },
        { label: lt("Transport Ref"), value: masterShipment.flightNumber || masterShipment.vesselName || masterShipment.voyageNumber || masterShipment.truckNumber || "-" }
      ]
    };
  }

  if (invoice.sourceType === "Pickup" && pickup) {
    const totals = getTotals(pickup.items, "pickup");
    return {
      title: lt("Pickup Information"),
      rows: [
        { label: lt("Pickup No"), value: pickup.pickupNumber },
        { label: lt("Pickup Date"), value: pickup.pickupDateTime || "-" },
        { label: lt("Pickup Location"), value: pickup.customerLocation || "-" },
        { label: lt("Drop Location"), value: pickup.dropLocation || "-" },
        { label: lt("Contact"), value: [pickup.contactPerson, pickup.contactPhone].filter(Boolean).join(" / ") || "-" },
        { label: lt("Driver/Vehicle"), value: [pickup.driverName, pickup.vehicleNumber].filter(Boolean).join(" / ") || "-" },
        { label: lt("Total Pieces"), value: totals.pieces.toFixed(0) },
        { label: lt("Total Weight"), value: `${fmt(totals.weight)} KG` },
        { label: lt("Total Volume"), value: `${totals.volume.toFixed(4)} CBM` },
        { label: lt("Consignee"), value: pickup.consigneeName || "-" }
      ]
    };
  }

  return null;
}

function getTotals(items: SourceItemTotals[], source: "house" | "direct" | "pickup"): SourceTotals {
  return items.reduce<SourceTotals>(
    (sum, item) => ({
      pieces: sum.pieces + Number((source === "pickup" ? item.pieces : source === "direct" ? item.pieces : item.loadedPieces) || item.receivedPieces || 0),
      weight: sum.weight + Number((source === "pickup" ? item.weight : source === "direct" ? item.weight : item.loadedWeight) || item.receivedWeight || 0),
      volume: sum.volume + Number((source === "pickup" ? item.volumeCbm : source === "direct" ? item.volume : item.loadedVolume) || item.volumeCbm || 0)
    }),
    { pieces: 0, weight: 0, volume: 0 }
  );
}

function formatPort(code?: string | null, name?: string | null, country?: string | null, fallback?: string | null) {
  const main = [code, name].filter(Boolean).join(" - ");
  return [main || fallback, country].filter(Boolean).join(" - ") || "-";
}

function formatSourceType(value?: string | null) {
  if (!value) return "-";
  return lt(value.replace(/([a-z])([A-Z])/g, "$1 $2"));
}
