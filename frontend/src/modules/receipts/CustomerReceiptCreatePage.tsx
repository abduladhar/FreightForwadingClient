import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createReceipt } from "@/api/receiptApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { CustomerReceiptForm } from "@/modules/receipts/CustomerReceiptForm";
import { lt } from "@/modules/operationsLocalization";

export function CustomerReceiptCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: createReceipt, onSuccess: (receipt) => { toast.success(lt("Receipt created"), receipt.receiptNumber); navigate(`/receipts/${receipt.id}`); } });
  return <div className="space-y-4"><PageHeader title={lt("Create Customer Receipt")} description={lt("Receive payment from a customer, vendor, agent, or carrier and allocate it to one or more invoices.")} actions={<AuditTrailButton />} /><div className="rounded-lg border bg-white p-4"><CustomerReceiptForm onSubmit={async (value) => mutation.mutateAsync(value).then(() => undefined)} isSubmitting={mutation.isPending} /></div></div>;
}
