import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/app/i18n";
import { getCustomer, getCustomerSalesmanHistory, transferCustomerSalesman, updateCustomer, type CustomerRequest } from "@/api/customerApi";
import { CustomerForm } from "@/modules/customers/CustomerForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { SalesmanSelect } from "@/components/common/SalesmanSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { customerButtonClass, customerPanelClass, customerPanelContentClass } from "@/modules/customers/customerUi";

export function CustomerEditPage() {
  const { t } = useI18n();
  const { customerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["customer", customerId], queryFn: () => getCustomer(customerId!), enabled: Boolean(customerId) });
  const history = useQuery({ queryKey: ["customer-salesman-history", customerId], queryFn: () => getCustomerSalesmanHistory(customerId!), enabled: Boolean(customerId) });
  const [newSalesmanId, setNewSalesmanId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const mutation = useMutation({
    mutationFn: (v: CustomerRequest) => updateCustomer(customerId!, v),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate(`/customers/${customerId}`);
    }
  });
  const transfer = useMutation({
    mutationFn: () => transferCustomerSalesman(customerId!, newSalesmanId!, reason),
    onSuccess: async () => {
      setReason("");
      setNewSalesmanId(null);
      await Promise.all([query.refetch(), history.refetch(), queryClient.invalidateQueries({ queryKey: ["customers"] })]);
    }
  });

  if (!customerId) return <Navigate to="/customers" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={t("Page.Title.EditCustomer", "Edit Customer")} description={t("Page.Description.UpdateCustomerMasterData", "Update customer master data.")} />
      <Card className={customerPanelClass}>
        <CardContent className={customerPanelContentClass}>
          {query.data ? (
            <CustomerForm
              initialValue={query.data}
              onSubmit={async (v: CustomerRequest) => { await mutation.mutateAsync(v); }}
              isSubmitting={mutation.isPending}
            />
          ) : <p className="text-sm text-muted-foreground">{t("Customer.Loading", "Loading...")}</p>}
        </CardContent>
      </Card>

      {query.data?.salesmanId ? (
        <Card className={customerPanelClass}>
          <CardContent className={`${customerPanelContentClass} space-y-4`}>
            <div>
              <h3 className="font-semibold">{t("Customer.AuthorizedSalesmanTransfer", "Authorized Salesman Transfer")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Customer.SalesmanTransferHelp", "Reassignment requires a new Salesman and a reason. Every transfer is retained in the audit history.")}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <SalesmanSelect value={newSalesmanId} onChange={setNewSalesmanId} />
              <Input placeholder={t("Customer.ReasonForReassignment", "Reason for reassignment")} value={reason} onChange={(event) => setReason(event.target.value)} />
              <Button className={customerButtonClass} disabled={!newSalesmanId || !reason.trim() || transfer.isPending} onClick={() => transfer.mutate()}>
                {t("Customer.Transfer", "Transfer")}
              </Button>
            </div>
            <div className="space-y-2">
              {(history.data ?? []).map((row) => (
                <div key={row.id} className="rounded-md border p-3 text-sm">
                  <span className="font-medium">{row.oldSalesmanName || t("Customer.Unassigned", "Unassigned")} - {row.newSalesmanName}</span>
                  <span className="ml-2 text-muted-foreground">{new Date(row.changedDate).toLocaleString()} {t("Customer.By", "by")} {row.changedByUserName}</span>
                  <p className="text-muted-foreground">{row.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
