import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { approveVendorBill, cancelVendorBill, getVendorBill } from "@/api/vendorBillApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { lt } from "@/modules/operationsLocalization";

export function VendorBillApprovalPage() {
  const { vendorBillId } = useParams();
  const [reason, setReason] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["vendor-bill-approval", vendorBillId], queryFn: () => getVendorBill(vendorBillId!), enabled: Boolean(vendorBillId) });
  const approve = useMutation({ mutationFn: approveVendorBill, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["vendor-bill-approval", vendorBillId] }); navigate(`/vendor-bills/${vendorBillId}`); } });
  const cancel = useMutation({ mutationFn: ({ id, cancelReason }: { id: string; cancelReason: string }) => cancelVendorBill(id, cancelReason), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["vendor-bill-approval", vendorBillId] }); navigate(`/vendor-bills/${vendorBillId}`); } });
  if (!vendorBillId) return <Navigate to="/vendor-bills" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  return <div className="space-y-4"><PageHeader title={`${lt("Approval")}: ${query.data.vendorBillNumber}`} description={lt("Approve or cancel vendor bill with reason capture.")} actions={<AuditTrailButton />} /><Card><CardContent className="space-y-4 pt-6"><div className="grid gap-2 md:grid-cols-2"><div><p className="text-xs text-muted-foreground">{lt("Status")}</p><StatusBadge status={query.data.status} /></div><div><p className="text-xs text-muted-foreground">{lt("Total Amount")}</p><CurrencyAmount value={query.data.totalAmount} /></div></div><Input placeholder={lt("Cancellation reason (required for cancel)")} value={reason} onChange={(e) => setReason(e.target.value)} /><div className="flex gap-2"><PermissionButton permission="VendorBill.Approve" onClick={() => void approve.mutateAsync(vendorBillId)} disabled={approve.isPending}>{lt("Approve")}</PermissionButton><PermissionButton permission="VendorBill.Cancel" variant="destructive" onClick={() => void cancel.mutateAsync({ id: vendorBillId, cancelReason: reason })} disabled={!reason.trim() || cancel.isPending}>{lt("Cancel Vendor Bill")}</PermissionButton></div></CardContent></Card></div>;
}
