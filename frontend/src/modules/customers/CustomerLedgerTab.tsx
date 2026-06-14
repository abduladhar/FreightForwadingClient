import { useI18n } from "@/app/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { customerButtonClass, customerPanelClass, customerPanelContentClass } from "@/modules/customers/customerUi";

export function CustomerLedgerTab({ customerId }: { customerId?: string }) {
  const { t } = useI18n();
  return (
    <Card className={customerPanelClass}>
      <CardContent className={`${customerPanelContentClass} space-y-3 text-sm`}>
        <p>{t("Customer.LedgerHelp", "Customer ledger is available from accounting reports using customer filter.")}</p>
        <Button asChild variant="outline" className={customerButtonClass}>
          <Link to={`/reports?report=customer-ledger${customerId ? `&customerId=${customerId}` : ""}`}>{t("Customer.OpenCustomerLedgerReport", "Open Customer Ledger Report")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
