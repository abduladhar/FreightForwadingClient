import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { getCurrencies } from "@/api/currencyApi";
import { getReceipt, getReceiptVoucher } from "@/api/receiptApi";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { EmailReportAction } from "@/components/common/EmailReportAction";
import { EmailPdfReportButton } from "@/components/common/EmailPdfReportButton";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PrintPreview } from "@/components/common/PrintPreview";
import { PageHeader } from "@/components/PageHeader";
import { PermissionButton } from "@/auth/PermissionButton";
import { PermissionGuard } from "@/auth/PermissionGuard";
import { createCustomerReceiptPdfBlob, exportCustomerReceiptPdf } from "@/utils/customerReceiptPdf";
import { useWorkspace } from "@/hooks/useWorkspace";
import { lt } from "@/modules/operationsLocalization";

export function CustomerReceiptPrintPage() {
  const { receiptId } = useParams();
  const workspace = useWorkspace();
  const reportRef = useRef<HTMLDivElement>(null);
  const receipt = useQuery({ queryKey: ["receipt-print", receiptId], queryFn: () => getReceipt(receiptId!), enabled: Boolean(receiptId) });
  const voucher = useQuery({ queryKey: ["receipt-print-voucher", receiptId], queryFn: () => getReceiptVoucher(receiptId!), enabled: Boolean(receiptId) });
  const currencies = useQuery({ queryKey: ["receipt-currencies"], queryFn: getCurrencies });

  if (!receiptId) return <Navigate to="/receipts" replace />;
  if (receipt.isLoading || voucher.isLoading) return <LoadingScreen />;
  if (receipt.isError || voucher.isError || !receipt.data || !voucher.data) {
    return <ErrorState onRetry={() => { void receipt.refetch(); void voucher.refetch(); }} />;
  }

  const data = receipt.data;
  const receiptCurrencyCode = currencies.data?.find((currency) => currency.id === data.receiptCurrencyId)?.currencyCode ?? workspace.baseCurrency;
  const baseCurrencyCode = currencies.data?.find((currency) => currency.id === data.baseCurrencyId)?.currencyCode ?? workspace.baseCurrency;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${lt("Print Receipt")} ${data.receiptNumber}`}
        description={lt("Receipt voucher print preview.")}
        actions={
          <>
            <PermissionGuard permission="Receipt.Export" fallback="hidden">
              <EmailReportAction
                subject={`Receipt Voucher - ${data.receiptNumber}`}
                reportName={`Receipt Voucher ${data.receiptNumber}`}
                module="Receipt"
                getHtml={() => reportRef.current?.outerHTML ?? ""}
              />
            </PermissionGuard>
            <PermissionGuard permission="Receipt.Export" fallback="hidden">
              <EmailPdfReportButton
                fileName={`${data.receiptNumber}.pdf`}
                subject={`Receipt Voucher - ${data.receiptNumber}`}
                reportName={`Receipt Voucher ${data.receiptNumber}`}
                module="Receipt"
                createPdfBlob={() => createCustomerReceiptPdfBlob({
                  fileName: `${data.receiptNumber}.pdf`,
                  tenantName: workspace.tenantCode,
                  branchName: workspace.branchName ?? lt("Branch"),
                  receipt: data,
                  voucherContent: voucher.data.content,
                  receiptCurrencyCode,
                  baseCurrencyCode
                })}
              />
            </PermissionGuard>
            <PermissionButton
              permission="Receipt.Print"
              variant="outline"
              onClick={() => void exportCustomerReceiptPdf({
                fileName: `${data.receiptNumber}.pdf`,
                tenantName: workspace.tenantCode,
                branchName: workspace.branchName ?? lt("Branch"),
                receipt: data,
                voucherContent: voucher.data.content,
                receiptCurrencyCode,
                baseCurrencyCode
              })}
            >
              <Download className="h-4 w-4" />{lt("PDF Export")}</PermissionButton>
          </>
        }
      />
      <PrintPreview title={`${lt("Receipt Voucher")} ${data.receiptNumber}`}>
        <div ref={reportRef} className="space-y-4 text-sm">
          <div className="border-b pb-3 text-center">
            <h3 className="text-xl font-bold tracking-wide">{lt("RECEIPT VOUCHER")}</h3>
            <p className="text-muted-foreground">{workspace.branchName ?? lt("Branch")}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 rounded-md border p-3">
              <p className="flex gap-1">
                <span className="shrink-0 font-medium">{lt("Receipt No:")}</span>
                <span className="min-w-0 break-all">{data.receiptNumber}</span>
              </p>
              <p><span className="font-medium">{lt("Receipt Date:")}</span> {data.receiptDate}</p>
              <p><span className="font-medium">{lt("Status:")}</span> {lt(data.status)}</p>
              <p><span className="font-medium">{lt("Advance:")}</span> {data.isAdvanceReceipt ? lt("Yes") : lt("No")}</p>
            </div>
            <div className="space-y-1 rounded-md border p-3">
              <p><span className="font-medium">{lt("Received From Type:")}</span> {lt(data.receivedFromPartyType || "Customer")}</p>
              <p><span className="font-medium">{lt("Received From:")}</span> {data.receivedFromPartyName || data.customerId}</p>
              <p><span className="font-medium">{lt("Currency:")}</span> {receiptCurrencyCode}</p>
              <p><span className="font-medium">{lt("Exchange Rate:")}</span> 1 {receiptCurrencyCode} = {data.exchangeRate} {baseCurrencyCode}</p>
              <p><span className="font-medium">{lt("Remarks:")}</span> {data.remarks || "-"}</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Amount label={`${lt("Receipt Amount")} (${receiptCurrencyCode})`} value={data.receiptAmount} currency={receiptCurrencyCode} />
            <Amount label={`${lt("Base Amount")} (${baseCurrencyCode})`} value={data.baseCurrencyAmount} currency={baseCurrencyCode} />
            <Amount label={`${lt("Bank Charges")} (${receiptCurrencyCode})`} value={data.bankCharges} currency={receiptCurrencyCode} />
            <Amount label={`${lt("Exchange Gain/Loss")} (${baseCurrencyCode})`} value={data.exchangeGainAmount - data.exchangeLossAmount} currency={baseCurrencyCode} />
          </div>
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="px-2 py-2 text-left">{lt("Invoice No")}</th>
                  <th className="px-2 py-2 text-right">{lt("Allocated")}</th>
                  <th className="px-2 py-2 text-right">{lt("Exchange Gain")}</th>
                  <th className="px-2 py-2 text-right">{lt("Exchange Loss")}</th>
                </tr>
              </thead>
              <tbody>
                {data.allocations.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-2 py-1.5">{item.invoiceNumber || item.invoiceId}</td>
                    <td className="px-2 py-1.5 text-right">{item.allocatedAmount.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{item.exchangeGainAmount.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{item.exchangeLossAmount.toFixed(2)}</td>
                  </tr>
                ))}
                {data.allocations.length === 0 ? (
                  <tr>
                    <td className="px-2 py-3 text-center text-muted-foreground" colSpan={4}>{lt("Advance receipt without invoice allocation.")}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="rounded-md border p-3 whitespace-pre-wrap">{voucher.data.content}</div>
        </div>
      </PrintPreview>
    </div>
  );
}

function Amount({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="font-semibold"><CurrencyAmount value={value} currency={currency} /></div>
    </div>
  );
}
