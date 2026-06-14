import { useQuery } from "@tanstack/react-query";
import { getPendingBills } from "@/api/reconciliationApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ResponsiveCardList, ResponsiveRecordCard } from "@/components/common/ResponsiveCardList";
import { PageHeader } from "@/components/PageHeader";

export function BillPaymentReconciliationPage() {
  const query = useQuery({ queryKey: ["bill-payment-reconciliation"], queryFn: () => getPendingBills() });
  const rows = query.data ?? [];
  return <div className="space-y-4"><PageHeader title="Bill vs Payment Reconciliation" description="Identify pending vendor bills and payable balances." actions={<AuditTrailButton />} /><ResponsiveCardList isLoading={query.isLoading} isError={query.isError} isEmpty={!rows.length} onRetry={() => void query.refetch()}>{rows.map((x) => <ResponsiveRecordCard key={x.vendorBillId} eyebrow="Vendor Bill" title={x.vendorBillNumber} fields={[{ label: "Total", value: <CurrencyAmount value={x.totalAmount} /> }, { label: "Paid", value: <CurrencyAmount value={x.paidAmount} /> }, { label: "Outstanding", value: <CurrencyAmount value={x.outstandingAmount} /> }, { label: "Exchange Rate", value: x.exchangeRate.toFixed(4) }]} />)}</ResponsiveCardList></div>;
}
