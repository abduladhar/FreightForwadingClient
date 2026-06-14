import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useI18n } from "@/app/i18n";
import { getCustomer } from "@/api/customerApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CustomerLedgerTab } from "@/modules/customers/CustomerLedgerTab";
import { customerButtonClass, customerPanelClass, customerPanelContentClass } from "@/modules/customers/customerUi";

export function CustomerViewPage() {
  const { t } = useI18n();
  const { customerId } = useParams();
  const query = useQuery({ queryKey: ["customer", customerId], queryFn: () => getCustomer(customerId!), enabled: Boolean(customerId) });
  if (!customerId) return <Navigate to="/customers" replace />;
  const customer = query.data;
  return <div className="space-y-4"><PageHeader title={customer?.customerName ?? "Customer"} description={customer?.customerCode} actions={<><AuditTrailButton /><PermissionButton asChild permission="Customer.Update" className={customerButtonClass}><Link to={`/customers/${customerId}/edit`}><Pencil className="h-4 w-4" /> {t("Common.Edit", "Edit")}</Link></PermissionButton></>} />{customer ? <Card className={customerPanelClass}><CardContent className={`${customerPanelContentClass} grid gap-3 md:grid-cols-2`}><Field label={t("Customer.Email", "Email")} value={customer.email} /><Field label={t("Customer.Phone", "Phone")} value={customer.phone} /><Field label={t("Customer.Country", "Country")} value={customer.country} /><Field label={t("Customer.City", "City")} value={customer.city} /><Field label={t("Customer.CreditLimit", "Credit Limit")} value={String(customer.creditLimit)} /><Field label={t("Customer.PaymentTerms", "Payment Terms")} value={customer.paymentTerms} /></CardContent></Card> : <Card className={customerPanelClass}><CardContent className={`${customerPanelContentClass} text-sm text-muted-foreground`}>{t("Customer.LoadingCustomer", "Loading customer...")}</CardContent></Card>}<CustomerLedgerTab customerId={customerId} /></div>;
}

function Field({ label, value }: { label: string; value?: string | null }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value || "-"}</p></div>; }
