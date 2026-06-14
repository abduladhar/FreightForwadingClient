import { FileSpreadsheet, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useFinanceWorkbenchQuery } from "@/modules/finance/financeApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMoney } from "@/hooks/useMoney";
import { lt } from "@/modules/operationsLocalization";

export function FinanceWorkbenchPage() {
  useDocumentTitle(lt("Finance"));
  const money = useMoney();
  const workbenchQuery = useFinanceWorkbenchQuery();
  const summary = workbenchQuery.data?.summary ?? [];
  const ledgerRows = workbenchQuery.data?.ledgerRows ?? [];

  return (
    <div className="erp-page">
      <PageHeader
        title={lt("Finance Workbench")}
        description={lt("Accounting control surface for customer receipts, vendor payments, billing, ledger posting, and reconciliation.")}
        actions={
          <>
            <Button variant="outline"><Printer className="h-4 w-4" /> {lt("Print Preview")}</Button>
            <Button><FileSpreadsheet className="h-4 w-4" /> {lt("Export Ledger")}</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.length ? (
          summary.map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">{lt(item.label)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{typeof item.value === "number" && item.value > 1000 ? money(item.value) : item.value}</div>
                <Badge className="mt-3" tone={item.tone}>{lt("Current Branch")}</Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 xl:col-span-4">
            <CardContent className="py-8 text-sm text-muted-foreground">
              {workbenchQuery.isLoading ? lt("Loading finance summary...") : lt("No finance summary is available for the selected context.")}
            </CardContent>
          </Card>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{lt("Posting Review Queue")}</CardTitle>
        </CardHeader>
        <CardContent>
          {workbenchQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{lt("Loading posting queue...")}</p>
          ) : ledgerRows.length ? (
            <div className="overflow-hidden rounded-lg border">
              <div className="hidden gap-3 border-b bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[1fr_1fr_120px_120px_150px]">
                <span>{lt("Voucher")}</span>
                <span>{lt("Account / Reference")}</span>
                <span>{lt("Debit")}</span>
                <span>{lt("Credit")}</span>
                <span>{lt("Status")}</span>
              </div>
              {ledgerRows.map((row) => (
                <div key={row.voucher} className="grid gap-3 border-b bg-white p-4 last:border-b-0 md:grid-cols-[1fr_1fr_120px_120px_150px]">
                  <span className="font-medium">{row.voucher}</span>
                  <span className="text-muted-foreground">{localizeAccount(row.account)}</span>
                  <span>{money(row.debit)}</span>
                  <span>{money(row.credit)}</span>
                  <StatusBadge status={row.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{lt("No posting items for the current tenant and branch.")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function localizeAccount(value: string) {
  switch (value) {
    case "Customer invoice": return lt("Customer Invoice");
    case "Vendor bill": return lt("Vendor Bill");
    case "HouseShipment": return lt("House Shipment");
    case "MasterShipment": return lt("Master Shipment");
    case "DirectShipment": return lt("Direct Shipment");
    case "GoodsReceipt": return lt("Goods Receipt Note");
    case "CustomsClearance": return lt("Customs Clearance");
    case "Pickup": return lt("Pickup");
    case "Job": return lt("Job");
    default: return value;
  }
}
