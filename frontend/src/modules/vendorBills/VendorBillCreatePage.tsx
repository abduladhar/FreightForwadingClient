import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { createVendorBill, type VendorBillRequest } from "@/api/vendorBillApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { VendorBillForm } from "@/modules/vendorBills/VendorBillForm";
import { vendorBillReturnPath } from "@/modules/vendorBills/vendorBillReturnPath";
import { lt } from "@/modules/operationsLocalization";

export function VendorBillCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: createVendorBill, onSuccess: (bill) => { toast.success(lt("Vendor bill created"), bill.vendorBillNumber); navigate(vendorBillReturnPath(bill)); } });
  const today = new Date().toISOString().slice(0, 10);
  const expectedCostAmount = Number(params.get("expectedCostAmount") || 0);
  const sourceType = params.get("sourceType") || "DirectShipment";
  const initialValue: VendorBillRequest = {
    vendorId: params.get("vendorId") || "",
    payToPartyType: params.get("payToPartyType") || "Vendor",
    payToPartyId: params.get("payToPartyId") || params.get("vendorId") || null,
    payToPartyName: null,
    sourceType,
    sourceId: params.get("sourceId") || null,
    sourceReferenceId: params.get("sourceId") || null,
    sourceReferenceNo: params.get("sourceReferenceNo") || null,
    billDate: today,
    dueDate: today,
    vendorCurrencyId: "",
    billCurrencyId: "",
    exchangeRate: 1,
    isExchangeRateOverride: false,
    exchangeRateOverrideReason: null,
    expectedCostAmount,
    remarks: sourceType === "Pickup" ? "Pickup expense" : null,
    items: [{
      costCode: sourceType === "Pickup" ? "PICKUP" : "",
      costName: sourceType === "Pickup" ? "Pickup Expense" : "",
      costHead: sourceType === "Pickup" ? "Pickup Expense" : "",
      shipmentId: null,
      shipmentType: null,
      allocationAmount: 0,
      quantity: 1,
      unitRate: expectedCostAmount,
      discountAmount: 0,
      isTaxApplicable: false,
      taxRate: 0
    }]
  };
  return <div className="space-y-4"><PageHeader title={lt("Create Vendor Bill")} description={lt("Create vendor bill against shipment, pickup, customs, or miscellaneous reference.")} actions={<AuditTrailButton />} /><div className="rounded-lg border bg-white p-4"><VendorBillForm initialValue={initialValue} onSubmit={async (value: VendorBillRequest) => mutation.mutateAsync(value).then(() => undefined)} isSubmitting={mutation.isPending} /></div></div>;
}
