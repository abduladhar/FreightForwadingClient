import { useQuery } from "@tanstack/react-query";
import { getPendingInvoices } from "@/api/reconciliationApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ResponsiveCardList, ResponsiveRecordCard } from "@/components/common/ResponsiveCardList";
import { PageHeader } from "@/components/PageHeader";

export function InvoiceReceiptReconciliationPage() {
  const query = useQuery({ queryKey: ["invoice-receipt-reconciliation"], queryFn: () => getPendingInvoices() });
  const rows = query.data ?? [];
  return <div className="space-y-4"><PageHeader title="Invoice vs Receipt Reconciliation" description="Identify pending customer invoices and outstanding balances." actions={<AuditTrailButton />} /><ResponsiveCardList isLoading={query.isLoading} isError={query.isError} isEmpty={!rows.length} onRetry={() => void query.refetch()}>{rows.map((x) => <ResponsiveRecordCard key={x.invoiceId} eyebrow="Invoice" title={x.invoiceNumber} fields={[{ label: "Total", value: <CurrencyAmount value={x.totalAmount} /> }, { label: "Paid", value: <CurrencyAmount value={x.paidAmount} /> }, { label: "Outstanding", value: <CurrencyAmount value={x.outstandingAmount} /> }, { label: "Exchange Rate", value: x.exchangeRate.toFixed(4) }]} />)}</ResponsiveCardList></div>;
}
