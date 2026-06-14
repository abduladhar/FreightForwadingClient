import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { getBranchById } from "@/api/branchApi";
import { getCustomer } from "@/api/customerApi";
import { getGoodsReceipt, getGoodsReceiptNote } from "@/api/goodsReceiptApi";
import { getTenantById } from "@/api/tenantApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { PrintPreview } from "@/components/common/PrintPreview";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { useWorkspace } from "@/hooks/useWorkspace";
import { exportGoodsReceiptPdf } from "@/utils/goodsReceiptPdf";
import { lt } from "@/modules/operationsLocalization";

export function GoodsReceiptNotePrintPage() {
  const { goodsReceiptId = "" } = useParams();
  const workspace = useWorkspace();
  const { session } = useAuth();
  const query = useQuery({ queryKey: ["goods-receipt-note", goodsReceiptId], queryFn: () => getGoodsReceiptNote(goodsReceiptId), enabled: Boolean(goodsReceiptId) });
  const receipt = useQuery({ queryKey: ["goods-receipt-note-detail", goodsReceiptId], queryFn: () => getGoodsReceipt(goodsReceiptId), enabled: Boolean(goodsReceiptId) });
  const customer = useQuery({ queryKey: ["grn-print-customer", receipt.data?.customerId], queryFn: () => getCustomer(receipt.data!.customerId), enabled: Boolean(receipt.data?.customerId) });
  const tenant = useQuery({ queryKey: ["grn-print-tenant", session?.tenantId], queryFn: () => getTenantById(session!.tenantId!), enabled: Boolean(session?.tenantId) });
  const branch = useQuery({ queryKey: ["grn-print-branch", session?.branchId], queryFn: () => getBranchById(session!.branchId!), enabled: Boolean(session?.branchId) });
  if (query.isLoading || receipt.isLoading || customer.isLoading || tenant.isLoading || branch.isLoading) return <LoadingScreen />;
  if (query.isError || receipt.isError || customer.isError || tenant.isError || branch.isError || !query.data || !receipt.data) return <ErrorState onRetry={() => { void query.refetch(); void receipt.refetch(); void customer.refetch(); void tenant.refetch(); void branch.refetch(); }} />;
  const data = receipt.data;
  const customerName = customer.data?.customerName ?? data.customerId;
  const receivedDateTime = data.receivedDateTime ? new Date(data.receivedDateTime).toLocaleString() : "-";
  const fallbackLogoPath = `/tenant-agency/${workspace.tenantCode}/logo.png`;
  const logoUrl = tenant.data?.logoUrl?.trim() || fallbackLogoPath;
  const branchAddress = branch.data?.address?.trim() || "Sample Address Line 1, City, Country";
  return <div className="space-y-4"><PageHeader title={`${lt("Goods Receipt Note")} ${query.data.goodsReceiptNumber}`} description={lt("Goods Receipt Note print content.")} actions={<PermissionButton permission="GoodsReceipt.Print" variant="outline" onClick={() => void exportGoodsReceiptPdf({ fileName: `${data.goodsReceiptNumber}.pdf`, tenantName: workspace.tenantCode, branchName: workspace.branchName ?? "Branch", branchAddress, logoUrl, customerName, goodsReceipt: data })}><Download className="h-4 w-4" />{lt("PDF Export")}</PermissionButton>} /><PrintPreview title={`${lt("Goods Receipt Note")} ${query.data.goodsReceiptNumber}`}><div className="space-y-4 text-sm"><div className="border-b pb-3"><div className="grid grid-cols-[260px_1fr_260px] items-center"><div className="flex justify-start">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-28 w-28 object-contain" /> : <div className="h-28 w-28" />}</div><div className="text-center"><h3 className="text-xl font-bold tracking-wide">{lt("GOODS RECEIPT NOTE")}</h3></div><div className="text-right"><p className="font-semibold">{workspace.branchName ?? "Branch"}</p><p className="text-muted-foreground">{branchAddress}</p></div></div></div><div className="grid gap-3 md:grid-cols-2"><div className="space-y-1 rounded-md border p-2"><p><span className="font-medium">{lt("Goods Receipt Note No:")}</span> {data.goodsReceiptNumber}</p><p><span className="font-medium">{lt("Received DateTime:")}</span> {receivedDateTime}</p><p><span className="font-medium">{lt("Received From:")}</span> {data.receivedFrom}</p><p><span className="font-medium">{lt("Status:")}</span> {data.status}</p></div><div className="space-y-1 rounded-md border p-2"><p><span className="font-medium">{lt("Warehouse Location:")}</span> {data.warehouseLocation || "-"}</p><p><span className="font-medium">{lt("Remarks:")}</span> {data.remarks || "-"}</p><p><span className="font-medium">{lt("Items Count:")}</span> {data.items.length}</p><p><span className="font-medium">{lt("Customer Name:")}</span> {customerName}</p></div></div><div className="rounded-md border"><table className="w-full text-xs"><thead className="bg-muted"><tr><th className="px-2 py-2 text-left">{lt("Package Type")}</th><th className="px-2 py-2 text-left">{lt("Description")}</th><th className="px-2 py-2 text-right">{lt("Packages")}</th><th className="px-2 py-2 text-right">{lt("Gross Weight")}</th><th className="px-2 py-2 text-right">{lt("Volume")}</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id} className="border-t"><td className="px-2 py-1.5">{item.packageTypeCode ? `${item.packageTypeCode} - ${item.packageTypeName}` : item.packageTypeName}</td><td className="px-2 py-1.5">{item.description}</td><td className="px-2 py-1.5 text-right">{item.receivedPieces.toFixed(2)}</td><td className="px-2 py-1.5 text-right">{item.receivedWeight.toFixed(2)}</td><td className="px-2 py-1.5 text-right">{item.volumeCbm.toFixed(4)}</td></tr>)}</tbody></table></div></div></PrintPreview></div>;
}
