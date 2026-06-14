import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { getShipmentDocuments } from "@/api/documentApi";
import { getVendorBill } from "@/api/vendorBillApi";
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

export function VendorBillViewPage() {
  const { vendorBillId } = useParams();
  const query = useQuery({ queryKey: ["vendor-bill", vendorBillId], queryFn: () => getVendorBill(vendorBillId!), enabled: Boolean(vendorBillId) });
  const documents = useQuery({ queryKey: ["documents", "VendorBill", vendorBillId], queryFn: () => getShipmentDocuments("VendorBill", vendorBillId!), enabled: Boolean(vendorBillId) });
  if (!vendorBillId) return <Navigate to="/vendor-bills" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const bill = query.data;
  const noteBaseUrl = `/credit-debit-notes/new?partyType=${encodeURIComponent((bill.payToPartyType || "Vendor") as string)}&partyId=${encodeURIComponent(bill.payToPartyId || bill.vendorId)}&partyName=${encodeURIComponent(bill.payToPartyName || "")}&sourceType=VendorBill&sourceId=${encodeURIComponent(bill.id)}&sourceReferenceNo=${encodeURIComponent(bill.vendorBillNumber)}&partyCurrencyId=${encodeURIComponent(bill.vendorCurrencyId)}&noteCurrencyId=${encodeURIComponent(bill.billCurrencyId)}&exchangeRate=${encodeURIComponent(String(bill.exchangeRate))}`;
  return <div className="space-y-4"><PageHeader title={`${lt("Vendor Bill")} ${bill.vendorBillNumber}`} description={lt("Vendor bill details, expected vs actual cost, and cost lines.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="CreditDebitNote.Create"><Link to={`${noteBaseUrl}&noteType=${encodeURIComponent("Credit Note")}`}>{lt("Credit Note")}</Link></PermissionButton><PermissionButton asChild permission="CreditDebitNote.Create"><Link to={`${noteBaseUrl}&noteType=${encodeURIComponent("Debit Note")}`}>{lt("Debit Note")}</Link></PermissionButton><PermissionButton asChild permission="VendorBill.Approve"><Link to={`/vendor-bills/${bill.id}/approval`}>{lt("Approval")}</Link></PermissionButton><PermissionButton asChild permission="VendorBill.Read"><Link to={`/vendor-bills/${bill.id}/expected-cost`}>{lt("Expected Cost")}</Link></PermissionButton><PermissionButton asChild permission="VendorBill.Update"><Link to={`/vendor-bills/${bill.id}/cost-allocation`}>{lt("Cost Allocation")}</Link></PermissionButton></>} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-3 md:grid-cols-4"><KV k={lt("Status")} v={<StatusBadge status={bill.status} />} /><KV k={lt("Pay To Type")} v={lt(bill.payToPartyType || "Vendor")} /><KV k={lt("Pay To")} v={bill.payToPartyName || bill.vendorId} /><KV k={lt("Bill Date")} v={bill.billDate} /><KV k={lt("Due Date")} v={bill.dueDate} /><KV k={lt("Source")} v={displaySourceType(bill.sourceType)} /><KV k={lt("Source Reference No")} v={bill.sourceReferenceNo || "-"} /><KV k={lt("Expected Cost")} v={<CurrencyAmount value={bill.expectedCostAmount} />} /><KV k={lt("Total")} v={<CurrencyAmount value={bill.totalAmount} />} /><KV k={lt("Paid")} v={<CurrencyAmount value={bill.paidAmount} />} /><KV k={lt("Outstanding")} v={<CurrencyAmount value={bill.outstandingAmount} />} /></div><div className="overflow-hidden rounded-lg border"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("Cost Code")}</th><th className="p-2 text-left">{lt("Cost Name")}</th><th className="p-2 text-left">{lt("Head")}</th><th className="p-2 text-right">{lt("Qty")}</th><th className="p-2 text-right">{lt("Rate")}</th><th className="p-2 text-right">{lt("Tax")}</th><th className="p-2 text-right">{lt("Line")}</th></tr></thead><tbody>{bill.items.map((x) => <tr key={x.id} className="border-t"><td className="p-2">{x.costCode}</td><td className="p-2">{x.costName}</td><td className="p-2">{x.costHead}</td><td className="p-2 text-right">{x.quantity}</td><td className="p-2 text-right">{x.unitRate.toFixed(2)}</td><td className="p-2 text-right">{x.taxAmount.toFixed(2)}</td><td className="p-2 text-right">{x.lineAmount.toFixed(2)}</td></tr>)}</tbody></table></div></CardContent></Card><DocumentUploadPanel moduleName="VendorBill" entityId={vendorBillId} defaultDocumentName={lt("Vendor Bill Document")} defaultDocumentCategory={lt("Vendor Bill")} emptyText={lt("No documents uploaded for this vendor bill.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} /></div>;
}

function KV({ k, v }: { k: string; v: ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{k}</p><div className="font-medium">{v}</div></div>;
}

function displaySourceType(sourceType?: string | null) {
  if (!sourceType) return "-";
  switch (sourceType) {
    case "GoodsReceipt":
      return lt("Goods Receipt Note");
    case "HouseShipment":
      return lt("House Shipment");
    case "MasterShipment":
      return lt("Master Shipment");
    case "DirectShipment":
      return lt("Direct Shipment");
    case "CustomsClearance":
      return lt("Customs Clearance");
    case "WarehouseService":
      return lt("Warehouse Service");
    case "TransportationService":
      return lt("Transportation Service");
    default:
      return lt(sourceType);
  }
}
