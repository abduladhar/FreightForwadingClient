import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { createInvoice, type InvoiceRequest } from "@/api/invoiceApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { InvoiceForm } from "@/modules/invoices/InvoiceForm";
import { invoiceReturnPath } from "@/modules/invoices/invoiceReturnPath";
import { lt } from "@/modules/operationsLocalization";

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const sourceType = searchParams.get("sourceType") ?? "Custom";
  const sourceId = searchParams.get("sourceId");
  const lockSourceFields = Boolean(sourceId && sourceType !== "Custom" && sourceType !== "Miscellaneous");
  const mutation = useMutation({ mutationFn: createInvoice, onSuccess: (invoice) => { toast.success(lt("Invoice created"), invoice.invoiceNumber); navigate(invoiceReturnPath(invoice)); } });
  const initialValue: InvoiceRequest = {
    documentType: "Invoice",
    customerId: searchParams.get("customerId") ?? "",
    billToPartyType: (searchParams.get("billToPartyType") as InvoiceRequest["billToPartyType"]) ?? "Customer",
    billToPartyId: searchParams.get("billToPartyId") ?? searchParams.get("customerId"),
    billToPartyName: null,
    sourceType,
    sourceId,
    sourceReferenceId: sourceId,
    sourceReferenceNo: searchParams.get("sourceReferenceNo") ?? "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date().toISOString().slice(0, 10),
    customerCurrencyId: "",
    invoiceCurrencyId: "",
    exchangeRate: 1,
    isExchangeRateOverride: false,
    exchangeRateOverrideReason: null,
    roundOffAmount: 0,
    remarks: null,
    items: [{
      id: null,
      operationMode: "New",
      chargeCode: "",
      chargeName: "",
      chargeHead: "",
      quantity: 1,
      unitRate: 0,
      discountAmount: 0,
      isTaxApplicable: false,
      taxRate: 0
    }]
  };
  return <div className="space-y-4"><PageHeader title={lt("Create Invoice")} description={lt("Create a custom invoice or link it to shipment, pickup, customs, quotation, or miscellaneous reference.")} actions={<AuditTrailButton />} /><div className="rounded-lg border bg-white p-4"><InvoiceForm initialValue={initialValue} lockSourceFields={lockSourceFields} onSubmit={async (value: InvoiceRequest) => mutation.mutateAsync(value).then(() => undefined)} isSubmitting={mutation.isPending} /></div></div>;
}
