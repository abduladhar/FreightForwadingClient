import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { getShipmentDocuments } from "@/api/documentApi";
import { getInvoice } from "@/api/invoiceApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function InvoiceViewPage() {
  const { invoiceId } = useParams();
  const query = useQuery({ queryKey: ["invoice", invoiceId], queryFn: () => getInvoice(invoiceId!), enabled: Boolean(invoiceId) });
  const currencies = useQuery({ queryKey: ["tenant-currencies", "invoice-view"], queryFn: getTenantCurrencies });
  const documents = useQuery({ queryKey: ["documents", "Invoice", invoiceId], queryFn: () => getShipmentDocuments("Invoice", invoiceId!), enabled: Boolean(invoiceId) });
  if (!invoiceId) return <Navigate to="/invoices" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const invoice = query.data;
  const invoiceCurrencyCode = currencies.data?.find((currency) => currency.currencyId === invoice.invoiceCurrencyId)?.currencyCode ?? "USD";
  const baseCurrencyCode = currencies.data?.find((currency) => currency.isBaseCurrency)?.currencyCode ?? invoiceCurrencyCode;
  const noteBaseUrl = `/credit-debit-notes/new?partyType=${encodeURIComponent(invoice.billToPartyType || "Customer")}&partyId=${encodeURIComponent(invoice.billToPartyId || invoice.customerId)}&partyName=${encodeURIComponent(invoice.billToPartyName || "")}&sourceType=Invoice&sourceId=${encodeURIComponent(invoice.id)}&sourceReferenceNo=${encodeURIComponent(invoice.invoiceNumber)}&partyCurrencyId=${encodeURIComponent(invoice.customerCurrencyId)}&noteCurrencyId=${encodeURIComponent(invoice.invoiceCurrencyId)}&exchangeRate=${encodeURIComponent(String(invoice.exchangeRate))}`;
  return <div className="space-y-4"><PageHeader title={`${lt("Invoice")} ${invoice.invoiceNumber}`} description={lt("Invoice details, amounts, and line items.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="CreditDebitNote.Create"><Link to={`${noteBaseUrl}&noteType=${encodeURIComponent("Credit Note")}`}>{lt("Credit Note")}</Link></PermissionButton><PermissionButton asChild permission="CreditDebitNote.Create"><Link to={`${noteBaseUrl}&noteType=${encodeURIComponent("Debit Note")}`}>{lt("Debit Note")}</Link></PermissionButton><PermissionButton asChild permission="Invoice.Update"><Link to={`/invoices/${invoice.id}/edit`}>{lt("Edit")}</Link></PermissionButton><PermissionButton asChild permission="Invoice.Approve"><Link to={`/invoices/${invoice.id}/approval`}>{lt("Approval")}</Link></PermissionButton><PermissionButton asChild permission="Invoice.Print"><Link to={`/invoices/${invoice.id}/print`}>{invoice.status === "Draft" ? lt("Print Draft") : lt("Print Actual")}</Link></PermissionButton><PermissionButton asChild permission="Invoice.Export"><Link to={`/invoices/${invoice.id}/email`}>{lt("Email")}</Link></PermissionButton></>} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-3 md:grid-cols-4"><KV k={lt("Status")} v={<StatusBadge status={invoice.status} />} /><KV k={lt("Bill To Type")} v={lt(invoice.billToPartyType || "Customer")} /><KV k={lt("Bill To")} v={invoice.billToPartyName || invoice.customerId} /><KV k={lt("Invoice Date")} v={invoice.invoiceDate} /><KV k={lt("Due Date")} v={invoice.dueDate} /><KV k={lt("Source Reference No")} v={<SourceLink sourceType={invoice.sourceType} sourceId={invoice.sourceReferenceId ?? invoice.sourceId} sourceReferenceNo={invoice.sourceReferenceNo} />} /><KV k={`${lt("Total")} (${invoiceCurrencyCode})`} v={<CurrencyAmount value={invoice.totalAmount} currency={invoiceCurrencyCode} />} /><KV k={`${lt("Base Amount")} (${baseCurrencyCode})`} v={<CurrencyAmount value={invoice.baseCurrencyAmount} currency={baseCurrencyCode} />} /><KV k={`${lt("Paid")} (${invoiceCurrencyCode})`} v={<CurrencyAmount value={invoice.paidAmount} currency={invoiceCurrencyCode} />} /><KV k={`${lt("Outstanding")} (${invoiceCurrencyCode})`} v={<CurrencyAmount value={invoice.outstandingAmount} currency={invoiceCurrencyCode} />} /></div><div className="overflow-hidden rounded-lg border"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("Charge Code")}</th><th className="p-2 text-left">{lt("Charge Name")}</th><th className="p-2 text-left">{lt("Head")}</th><th className="p-2 text-right">{lt("Qty")}</th><th className="p-2 text-right">{lt("Rate")} ({invoiceCurrencyCode})</th><th className="p-2 text-right">{lt("Tax")} ({invoiceCurrencyCode})</th><th className="p-2 text-right">{lt("Line")} ({invoiceCurrencyCode})</th></tr></thead><tbody>{invoice.items.map((x) => <tr key={x.id} className="border-t"><td className="p-2">{x.chargeCode}</td><td className="p-2">{x.chargeName}</td><td className="p-2">{x.chargeHead}</td><td className="p-2 text-right">{x.quantity}</td><td className="p-2 text-right">{x.unitRate.toFixed(2)}</td><td className="p-2 text-right">{x.taxAmount.toFixed(2)}</td><td className="p-2 text-right">{x.lineAmount.toFixed(2)}</td></tr>)}</tbody></table></div></CardContent></Card><DocumentUploadPanel moduleName="Invoice" entityId={invoiceId} defaultDocumentName={lt("Invoice Document")} defaultDocumentCategory={lt("Customer Invoice")} emptyText={lt("No documents uploaded for this invoice.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} /></div>;
}

function KV({ k, v }: { k: string; v: ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{k}</p><div className="font-medium">{v}</div></div>;
}

function SourceLink({ sourceType, sourceId, sourceReferenceNo }: { sourceType: string; sourceId?: string | null; sourceReferenceNo?: string | null }) {
  if (!sourceId) return <span>{sourceReferenceNo || "-"}</span>;
  const path = sourcePath(sourceType, sourceId);
  return path ? <Link className="text-primary underline" to={path}>{sourceReferenceNo || displaySourceType(sourceType)}</Link> : <span>{sourceReferenceNo || displaySourceType(sourceType)}</span>;
}

function displaySourceType(sourceType: string) {
  switch (sourceType) {
    case "HouseShipment":
      return lt("House Shipment");
    case "MasterShipment":
      return lt("Master Shipment");
    case "DirectShipment":
      return lt("Direct Shipment");
    case "Pickup":
      return lt("Pickup");
    case "GoodsReceipt":
      return lt("Goods Receipt Note");
    case "Quotation":
      return lt("Quotation");
    case "CustomsClearance":
      return lt("Customs Clearance");
    case "BillOfEntry":
      return lt("Bill of Entry");
    case "BillOfExit":
      return lt("Bill of Exit");
    default:
      return sourceType;
  }
}

function sourcePath(sourceType: string, sourceId: string) {
  switch (sourceType) {
    case "HouseShipment":
      return `/house-shipments/${sourceId}`;
    case "MasterShipment":
      return `/master-shipments/${sourceId}`;
    case "DirectShipment":
      return `/direct-shipments/${sourceId}`;
    case "Pickup":
      return `/pickups/${sourceId}`;
    case "GoodsReceipt":
      return `/goods-receipts/${sourceId}`;
    case "Quotation":
      return `/quotations/${sourceId}`;
    case "CustomsClearance":
      return `/customs/${sourceId}`;
    case "BillOfEntry":
      return `/bill-of-entry/${sourceId}`;
    case "BillOfExit":
      return `/bill-of-exits/${sourceId}`;
    default:
      return "";
  }
}
