import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPayment } from "@/api/paymentApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { VendorPaymentForm } from "@/modules/payments/VendorPaymentForm";
import { lt } from "@/modules/operationsLocalization";

export function VendorPaymentCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: createPayment, onSuccess: (payment) => { toast.success(lt("Vendor payment created"), payment.paymentNumber); navigate(`/payments/${payment.id}`); } });
  return <div className="space-y-4"><PageHeader title={lt("Create Vendor Payment")} description={lt("Record money paid to a vendor and allocate it to one or more vendor bills.")} actions={<AuditTrailButton />} /><div className="rounded-lg border bg-white p-4"><VendorPaymentForm onSubmit={async (value) => mutation.mutateAsync(value).then(() => undefined)} isSubmitting={mutation.isPending} /></div></div>;
}
