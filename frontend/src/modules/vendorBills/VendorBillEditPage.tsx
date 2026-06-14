import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { addVendorBillItem, deleteVendorBillItem, getVendorBill, updateVendorBill, updateVendorBillItem, type VendorBillDto, type VendorBillItemRequest, type VendorBillRequest } from "@/api/vendorBillApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { VendorBillForm } from "@/modules/vendorBills/VendorBillForm";
import { vendorBillReturnPath } from "@/modules/vendorBills/vendorBillReturnPath";
import { lt } from "@/modules/operationsLocalization";

export function VendorBillEditPage() {
  const { vendorBillId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["vendor-bill-edit", vendorBillId], queryFn: () => getVendorBill(vendorBillId!), enabled: Boolean(vendorBillId) });
  const mutation = useMutation({ mutationFn: ({ id, request }: { id: string; request: VendorBillRequest }) => updateVendorBill(id, request), onSuccess: (bill) => { toast.success(lt("Vendor bill updated"), bill.vendorBillNumber); navigate(vendorBillReturnPath(bill)); } });
  if (!vendorBillId) return <Navigate to="/vendor-bills" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const bill = query.data;
  const initialValue: VendorBillRequest = { vendorId: bill.vendorId, payToPartyType: bill.payToPartyType ?? "Vendor", payToPartyId: bill.payToPartyId ?? bill.vendorId, payToPartyName: bill.payToPartyName ?? null, sourceType: bill.sourceType, sourceId: bill.sourceId ?? null, sourceReferenceId: bill.sourceReferenceId ?? bill.sourceId ?? null, sourceReferenceNo: bill.sourceReferenceNo ?? "", billDate: bill.billDate, dueDate: bill.dueDate, vendorCurrencyId: bill.vendorCurrencyId, billCurrencyId: bill.billCurrencyId, exchangeRate: bill.exchangeRate, isExchangeRateOverride: bill.isExchangeRateOverride, exchangeRateOverrideReason: bill.exchangeRateOverrideReason ?? null, expectedCostAmount: bill.expectedCostAmount, remarks: bill.remarks ?? null, items: toEditableItems(bill) };
  return <div className="space-y-4"><PageHeader title={`${lt("Edit Vendor Bill")} ${bill.vendorBillNumber}`} description={lt("Update vendor bill details before approval.")} /><div className="rounded-lg border bg-white p-4"><VendorBillForm
    initialValue={initialValue}
    billStatus={bill.status}
    onSaveItem={async (item) => {
      const mode = item.operationMode ?? (item.id && item.id !== EMPTY_GUID ? "Update" : "New");
      let updated: VendorBillDto;
      if (mode === "Delete") {
        if (!item.id || item.id === EMPTY_GUID) return toEditableItems(query.data!);
        updated = await deleteVendorBillItem(vendorBillId, item.id);
        toast.success(lt("Vendor bill item deleted"), updated.vendorBillNumber);
      } else if (mode === "Update" && item.id && item.id !== EMPTY_GUID) {
        updated = await updateVendorBillItem(vendorBillId, item.id, item);
        toast.success(lt("Vendor bill item updated"), updated.vendorBillNumber);
      } else {
        updated = await addVendorBillItem(vendorBillId, item);
        toast.success(lt("Vendor bill item created"), updated.vendorBillNumber);
      }
      await query.refetch();
      return toEditableItems(updated);
    }}
    onSubmit={async (value) => mutation.mutateAsync({ id: vendorBillId, request: value }).then(() => undefined)}
    isSubmitting={mutation.isPending}
  /></div></div>;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function toEditableItems(bill: VendorBillDto): VendorBillItemRequest[] {
  return bill.items.map((x) => ({
    id: x.id,
    operationMode: "Update",
    costCode: x.costCode,
    costName: x.costName,
    costHead: x.costHead,
    shipmentId: x.shipmentId ?? null,
    shipmentType: x.shipmentType ?? null,
    allocationAmount: x.allocationAmount,
    quantity: x.quantity,
    unitRate: x.unitRate,
    discountAmount: x.discountAmount,
    isTaxApplicable: x.isTaxApplicable,
    taxRate: x.taxRate
  }));
}
