import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/app/i18n";
import { getTenantCurrencies } from "@/api/currencyApi";
import type { CustomerRequest } from "@/api/customerApi";
import { CustomerContactsTab } from "@/modules/customers/CustomerContactsTab";
import { CustomerAddressesTab } from "@/modules/customers/CustomerAddressesTab";
import { CustomerDocumentsTab } from "@/modules/customers/CustomerDocumentsTab";
import { CustomerCreditControlTab } from "@/modules/customers/CustomerCreditControlTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { customerButtonClass } from "@/modules/customers/customerUi";

export function CustomerForm({
  initialValue,
  onSubmit,
  isSubmitting
}: {
  initialValue?: CustomerRequest | null;
  onSubmit: (value: CustomerRequest) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const { t } = useI18n();
  const currencyQuery = useQuery({ queryKey: ["tenant-currencies", "customer-form"], queryFn: getTenantCurrencies });
  const [tab, setTab] = useState<"main" | "contacts" | "addresses" | "documents" | "credit">("main");
  const defaultValue: CustomerRequest = {
    customerCode: "", customerName: "", customerType: "", contactPerson: "", email: "", phone: "", billingAddress: "", shippingAddress: "", country: "", city: "", taxNumber: "", defaultCurrencyId: null, creditLimit: 0, paymentTerms: "", salesmanId: null, portalAccessEnabled: false, isActive: true, contacts: [], addresses: [], documents: []
  };
  const [value, setValue] = useState<CustomerRequest>(initialValue ? { ...defaultValue, ...initialValue } : defaultValue);
  const currencyOptions = useMemo(() => (currencyQuery.data ?? []).filter((currency) => currency.isEnabled), [currencyQuery.data]);

  useEffect(() => {
    if (currencyOptions.length === 0) return;
    if (value.defaultCurrencyId && currencyOptions.some((currency) => currency.currencyId === value.defaultCurrencyId)) return;
    const preferredCurrency = currencyOptions.find((currency) => currency.isBaseCurrency) ?? currencyOptions[0];
    setValue((current) => ({ ...current, defaultCurrencyId: preferredCurrency.currencyId }));
  }, [currencyOptions, value.defaultCurrencyId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{["main", "contacts", "addresses", "documents", "credit"].map((x) => <Button key={x} className={customerButtonClass} type="button" variant={tab === x ? "default" : "outline"} onClick={() => setTab(x as typeof tab)}>{t(`Customer.Tab.${x}`, x[0].toUpperCase() + x.slice(1))}</Button>)}</div>
      {tab === "main" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("Customer.CustomerCode", "Customer Code")}><Input value={value.customerCode} onChange={(e) => setValue({ ...value, customerCode: e.target.value })} /></Field>
          <Field label={t("Customer.CustomerName", "Customer Name")}><Input value={value.customerName} onChange={(e) => setValue({ ...value, customerName: e.target.value })} /></Field>
          <Field label={t("Customer.CustomerType", "Customer Type")}><Input value={value.customerType} onChange={(e) => setValue({ ...value, customerType: e.target.value })} /></Field>
          <Field label={t("Customer.ContactPerson", "Contact Person")}><Input value={value.contactPerson ?? ""} onChange={(e) => setValue({ ...value, contactPerson: e.target.value })} /></Field>
          <Field label={t("Customer.Email", "Email")}><Input value={value.email} onChange={(e) => setValue({ ...value, email: e.target.value })} /></Field>
          <Field label={t("Customer.Phone", "Phone")}><Input value={value.phone ?? ""} onChange={(e) => setValue({ ...value, phone: e.target.value })} /></Field>
          <Field label={t("Customer.Country", "Country")}><Input value={value.country} onChange={(e) => setValue({ ...value, country: e.target.value })} /></Field>
          <Field label={t("Customer.City", "City")}><Input value={value.city} onChange={(e) => setValue({ ...value, city: e.target.value })} /></Field>
          <Field label={t("Customer.DefaultCurrency", "Default Currency")}>
            <select className="h-10 w-full rounded-md border px-3 text-sm disabled:bg-slate-50 disabled:text-slate-600" value={value.defaultCurrencyId ?? ""} onChange={(e) => setValue({ ...value, defaultCurrencyId: e.target.value || null })} disabled={Boolean(initialValue)}>
              <option value="">{currencyOptions.length ? t("Common.Select", "Select") : t("Customer.NoTenantCurrencyEnabled", "No tenant currency enabled")}</option>
              {currencyOptions.map((currency) => <option key={currency.currencyId} value={currency.currencyId}>{currency.currencyCode} - {currency.currencyName}</option>)}
            </select>
            {initialValue ? <p className="mt-1 text-xs text-muted-foreground">{t("Customer.CurrencyLockedAfterCreation", "Customer currency is locked after creation.")}</p> : null}
            {!currencyQuery.isLoading && currencyOptions.length === 0 ? <p className="mt-1 text-xs text-amber-700">{t("Customer.EnableTenantCurrencyBeforeSaving", "Enable a currency in Tenant Currency Setup before saving the customer.")}</p> : null}
          </Field>
          <Field label={t("Customer.PaymentTerms", "Payment Terms")}><Input value={value.paymentTerms ?? ""} onChange={(e) => setValue({ ...value, paymentTerms: e.target.value })} /></Field>
          <Field label={t("Customer.SalesmanOptional", "Salesman (optional)")}>
            <SalesmanSelect value={value.salesmanId} disabled={Boolean(initialValue?.salesmanId)} onChange={(salesmanId) => setValue({ ...value, salesmanId })} />
            {initialValue?.salesmanId ? <p className="mt-1 text-xs text-muted-foreground">{t("Customer.UseSalesmanTransfer", "Use the authorized Salesman Transfer action to change this assignment.")}</p> : null}
          </Field>
          <Field label={t("Customer.BillingAddress", "Billing Address")}><Input value={value.billingAddress ?? ""} onChange={(e) => setValue({ ...value, billingAddress: e.target.value })} /></Field>
          <Field label={t("Customer.ShippingAddress", "Shipping Address")}><Input value={value.shippingAddress ?? ""} onChange={(e) => setValue({ ...value, shippingAddress: e.target.value })} /></Field>
          <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.portalAccessEnabled} onChange={(e) => setValue({ ...value, portalAccessEnabled: e.target.checked })} /> {t("Customer.PortalAccessEnabled", "Portal Access Enabled")}</label>
          <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={value.isActive} onChange={(e) => setValue({ ...value, isActive: e.target.checked })} /> {t("Common.Active", "Active")}</label>
        </div>
      ) : null}
      {tab === "contacts" ? <CustomerContactsTab value={value.contacts} onChange={(contacts) => setValue({ ...value, contacts })} /> : null}
      {tab === "addresses" ? <CustomerAddressesTab value={value.addresses} onChange={(addresses) => setValue({ ...value, addresses })} /> : null}
      {tab === "documents" ? <CustomerDocumentsTab value={value.documents} onChange={(documents) => setValue({ ...value, documents })} /> : null}
      {tab === "credit" ? <CustomerCreditControlTab creditLimit={value.creditLimit} paymentTerms={value.paymentTerms ?? ""} onCreditLimitChange={(creditLimit) => setValue({ ...value, creditLimit })} onPaymentTermsChange={(paymentTerms) => setValue({ ...value, paymentTerms })} /> : null}
      {initialValue ? (
        <Button className={customerButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>{isSubmitting ? t("Common.Saving", "Saving...") : t("Customer.SaveCustomer", "Save Customer")}</Button>
      ) : (
        <ConfirmDialog
          title={t("Customer.ConfirmCustomerCurrency", "Confirm customer currency")}
          description={t("Customer.CurrencyCannotChangeConfirm", "Customer currency cannot be changed once the customer is created. Do you want to continue?")}
          confirmText={isSubmitting ? t("Common.Saving", "Saving...") : t("Common.Continue", "Continue")}
          cancelText={t("Common.Review", "Review")}
          onConfirm={() => void onSubmit(value)}
        >
          <Button className={customerButtonClass} disabled={isSubmitting}>{t("Customer.SaveCustomer", "Save Customer")}</Button>
        </ConfirmDialog>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
