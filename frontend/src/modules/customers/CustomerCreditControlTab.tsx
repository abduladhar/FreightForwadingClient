import { useI18n } from "@/app/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerCreditControlTab({
  creditLimit,
  paymentTerms,
  onCreditLimitChange,
  onPaymentTermsChange
}: {
  creditLimit: number;
  paymentTerms: string;
  onCreditLimitChange: (value: number) => void;
  onPaymentTermsChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <Label>{t("Customer.CreditLimit", "Credit Limit")}</Label>
        <Input type="number" step="0.01" value={creditLimit} onChange={(e) => onCreditLimitChange(Number(e.target.value))} />
      </div>
      <div className="space-y-1">
        <Label>{t("Customer.PaymentTerms", "Payment Terms")}</Label>
        <Input value={paymentTerms} onChange={(e) => onPaymentTermsChange(e.target.value)} placeholder={t("Customer.PaymentTermsExample", "e.g. 30 Days")} />
      </div>
    </div>
  );
}
