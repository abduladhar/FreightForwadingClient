import { useQuery } from "@tanstack/react-query";
import { getLedgerEntries } from "@/api/accountingApi";
import { searchInvoices } from "@/api/invoiceApi";
import { searchPayments } from "@/api/paymentApi";
import { searchReceipts } from "@/api/receiptApi";
import { searchVendorBills } from "@/api/vendorBillApi";

export interface FinanceSummaryItem {
  label: string;
  value: number | string;
  tone: "blue" | "green" | "amber" | "red" | "slate";
}

export interface LedgerReviewRow {
  voucher: string;
  account: string;
  debit: number;
  credit: number;
  status: "Posted" | "Pending Approval" | "Review";
}

export interface FinanceWorkbenchPayload {
  summary: FinanceSummaryItem[];
  ledgerRows: LedgerReviewRow[];
}

export function useFinanceWorkbenchQuery() {
  return useQuery({
    queryKey: ["finance", "workbench"],
    queryFn: async () => {
      const [invoices, bills, receipts, payments, ledger] = await Promise.allSettled([
        searchInvoices({ pageNumber: 1, pageSize: 50 }),
        searchVendorBills({ pageNumber: 1, pageSize: 50 }),
        searchReceipts({ pageNumber: 1, pageSize: 50 }),
        searchPayments({ pageNumber: 1, pageSize: 50 }),
        getLedgerEntries({ pageNumber: 1, pageSize: 20 })
      ]);

      const invoiceRows = invoices.status === "fulfilled" ? invoices.value?.items ?? [] : [];
      const billRows = bills.status === "fulfilled" ? bills.value?.items ?? [] : [];
      const receiptRows = receipts.status === "fulfilled" ? receipts.value?.items ?? [] : [];
      const paymentRows = payments.status === "fulfilled" ? payments.value?.items ?? [] : [];
      const ledgerReportRows = ledger.status === "fulfilled" ? ledger.value ?? [] : [];

      return {
        summary: [
          {
            label: "Customer Outstanding",
            value: sum(invoiceRows.filter((x) => x.status !== "Cancelled"), (x) => x.outstandingAmount),
            tone: "blue"
          },
          {
            label: "Vendor Outstanding",
            value: sum(billRows.filter((x) => x.status !== "Cancelled"), (x) => x.outstandingAmount),
            tone: "amber"
          },
          {
            label: "Draft Invoices",
            value: invoiceRows.filter((x) => x.status === "Draft").length,
            tone: "slate"
          },
          {
            label: "Draft Vendor Bills",
            value: billRows.filter((x) => x.status === "Draft").length,
            tone: "slate"
          },
          {
            label: "Approved Receipts",
            value: sum(receiptRows.filter((x) => x.status === "Approved"), (x) => x.receiptAmount),
            tone: "green"
          },
          {
            label: "Approved Payments",
            value: sum(paymentRows.filter((x) => x.status === "Approved"), (x) => x.paymentAmount),
            tone: "red"
          }
        ],
        ledgerRows: [
          ...invoiceRows.filter((x) => x.status === "Draft").slice(0, 4).map((x) => ({
            voucher: x.invoiceNumber,
            account: x.sourceReferenceNo || x.sourceType || "Customer invoice",
            debit: x.totalAmount,
            credit: 0,
            status: "Pending Approval" as const
          })),
          ...billRows.filter((x) => x.status === "Draft").slice(0, 4).map((x) => ({
            voucher: x.vendorBillNumber,
            account: x.sourceType || "Vendor bill",
            debit: 0,
            credit: x.totalAmount,
            status: "Pending Approval" as const
          })),
          ...ledgerReportRows.slice(0, 8).map((x) => ({
            voucher: x.voucherNumber,
            account: x.particulars,
            debit: x.debit,
            credit: x.credit,
            status: "Posted" as const
          }))
        ].slice(0, 12)
      } satisfies FinanceWorkbenchPayload;
    }
  });
}

function sum<T>(items: T[], selector: (item: T) => number | null | undefined) {
  return items.reduce((total, item) => total + Number(selector(item) ?? 0), 0);
}
