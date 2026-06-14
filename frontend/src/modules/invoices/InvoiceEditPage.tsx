import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { addInvoiceItem, deleteInvoiceItem, getInvoice, updateInvoice, updateInvoiceItem, type InvoiceDto, type InvoiceItemRequest, type InvoiceRequest } from "@/api/invoiceApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast";
import { InvoiceForm } from "@/modules/invoices/InvoiceForm";
import { invoiceReturnPath } from "@/modules/invoices/invoiceReturnPath";
import { lt } from "@/modules/operationsLocalization";

export function InvoiceEditPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const query = useQuery({ queryKey: ["invoice-edit", invoiceId], queryFn: () => getInvoice(invoiceId!), enabled: Boolean(invoiceId) });
  const mutation = useMutation({ mutationFn: ({ id, request }: { id: string; request: InvoiceRequest }) => updateInvoice(id, request), onSuccess: (invoice) => { toast.success(lt("Invoice updated"), invoice.invoiceNumber); navigate(invoiceReturnPath(invoice)); } });
  if (!invoiceId) return <Navigate to="/invoices" replace />;
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  const invoice = query.data;
  const initialValue: InvoiceRequest = {
    documentType: invoice.documentType,
    customerId: invoice.customerId,
    billToPartyType: invoice.billToPartyType ?? "Customer",
    billToPartyId: invoice.billToPartyId ?? invoice.customerId,
    billToPartyName: invoice.billToPartyName ?? null,
    sourceType: invoice.sourceType,
    sourceId: invoice.sourceId ?? null,
    sourceReferenceId: invoice.sourceReferenceId ?? invoice.sourceId ?? null,
    sourceReferenceNo: invoice.sourceReferenceNo ?? "",
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    customerCurrencyId: invoice.customerCurrencyId,
    invoiceCurrencyId: invoice.invoiceCurrencyId,
    exchangeRate: invoice.exchangeRate,
    isExchangeRateOverride: invoice.isExchangeRateOverride,
    exchangeRateOverrideReason: invoice.exchangeRateOverrideReason ?? null,
    roundOffAmount: invoice.roundOffAmount,
    remarks: invoice.remarks ?? null,
    items: invoice.items.map((x) => ({
      id: x.id,
      operationMode: "Update",
      chargeCode: x.chargeCode,
      chargeName: x.chargeName,
      chargeHead: x.chargeHead,
      quantity: x.quantity,
      unitRate: x.unitRate,
      discountAmount: x.discountAmount,
      isTaxApplicable: x.isTaxApplicable,
      taxRate: x.taxRate
    }))
  };
  const lockSourceFields = Boolean(invoice.sourceId && invoice.sourceType !== "Custom" && invoice.sourceType !== "Miscellaneous");
  return <div className="space-y-4"><PageHeader title={`${lt("Edit Invoice")} ${invoice.invoiceNumber}`} description={lt("Update invoice details before approval.")} /><div className="rounded-lg border bg-white p-4"><InvoiceForm
    initialValue={initialValue}
    invoiceStatus={invoice.status}
    lockSourceFields={lockSourceFields}
    onSaveItem={async (item) => {
      const mode = item.operationMode ?? (item.id && item.id !== EMPTY_GUID ? "Update" : "New");
      let updated: InvoiceDto;
      if (mode === "Delete") {
        if (!item.id || item.id === EMPTY_GUID) return toEditableItems(query.data!);
        updated = await deleteInvoiceItem(invoiceId, item.id);
        toast.success(lt("Invoice item deleted"), updated.invoiceNumber);
      } else if (mode === "Update" && item.id && item.id !== EMPTY_GUID) {
        updated = await updateInvoiceItem(invoiceId, item.id, item);
        toast.success(lt("Invoice item updated"), updated.invoiceNumber);
      } else {
        updated = await addInvoiceItem(invoiceId, item);
        toast.success(lt("Invoice item created"), updated.invoiceNumber);
      }
      await query.refetch();
      return toEditableItems(updated);
    }}
    onSubmit={async (value) => mutation.mutateAsync({ id: invoiceId, request: value }).then(() => undefined)}
    isSubmitting={mutation.isPending}
  /></div></div>;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function toEditableItems(invoice: InvoiceDto): InvoiceItemRequest[] {
  return invoice.items.map((x) => ({
    id: x.id,
    operationMode: "Update",
    chargeCode: x.chargeCode,
    chargeName: x.chargeName,
    chargeHead: x.chargeHead,
    quantity: x.quantity,
    unitRate: x.unitRate,
    discountAmount: x.discountAmount,
    isTaxApplicable: x.isTaxApplicable,
    taxRate: x.taxRate
  }));
}
