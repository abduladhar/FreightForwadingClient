import type { ReactNode } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getVendorBill } from "@/api/vendorBillApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function VendorBillCostAllocationPage() {
  const { vendorBillId } = useParams();
  const query = useQuery({ queryKey: ["vendor-bill-allocation", vendorBillId], queryFn: () => getVendorBill(vendorBillId!), enabled: Boolean(vendorBillId) });
  const totals = useMemo(() => {
    if (!query.data) return { allocated: 0, total: 0 };
    const allocated = query.data.items.reduce((sum, x) => sum + x.allocationAmount, 0);
    return { allocated, total: query.data.totalAmount };
  }, [query.data]);
  if (!vendorBillId) return <Navigate to="/vendor-bills" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const bill = query.data;
  return <div className="space-y-4"><PageHeader title={`${lt("Cost Allocation")}: ${bill.vendorBillNumber}`} description={lt("Shipment-wise allocation snapshot for vendor bill costs.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-3 pt-6"><div className="grid gap-3 md:grid-cols-3"><Metric title={lt("Bill Total")} value={<CurrencyAmount value={totals.total} />} /><Metric title={lt("Allocated Total")} value={<CurrencyAmount value={totals.allocated} />} /><Metric title={lt("Unallocated")} value={<CurrencyAmount value={totals.total - totals.allocated} />} /></div><div className="overflow-hidden rounded-lg border"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-2 text-left">{lt("Cost Head")}</th><th className="p-2 text-left">{lt("Shipment Type")}</th><th className="p-2 text-left">{lt("Shipment Id")}</th><th className="p-2 text-right">{lt("Allocation")}</th></tr></thead><tbody>{bill.items.map((item) => <tr key={item.id} className="border-t"><td className="p-2">{item.costHead}</td><td className="p-2">{item.shipmentType ? lt(item.shipmentType) : "-"}</td><td className="p-2">{item.shipmentId ?? "-"}</td><td className="p-2 text-right">{item.allocationAmount.toFixed(2)}</td></tr>)}</tbody></table></div></CardContent></Card></div>;
}

function Metric({ title, value }: { title: string; value: ReactNode }) {
  return <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{title}</p><div className="text-lg font-semibold">{value}</div></div>;
}
