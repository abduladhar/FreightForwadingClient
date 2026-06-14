import { lt } from "@/modules/operationsLocalization";

export const financeSummary = [
  { label: lt("Customer Outstanding"), value: 428400, tone: "amber" as const },
  { label: lt("Vendor Outstanding"), value: 311900, tone: "blue" as const },
  { label: lt("Cash and Bank"), value: 690250, tone: "green" as const },
  { label: lt("Unposted Documents"), value: 17, tone: "red" as const }
];

export const ledgerRows = [
  { voucher: "INV-HQ-2026-0722", account: lt("Customer Receivables"), debit: 15200, credit: 0, status: "Posted" },
  { voucher: "VB-HQ-2026-0441", account: lt("Freight Expense"), debit: 8400, credit: 0, status: "Pending Approval" },
  { voucher: "RCPT-HQ-2026-0308", account: lt("Default Bank USD"), debit: 12700, credit: 0, status: "Posted" },
  { voucher: "PAY-HQ-2026-0220", account: lt("Vendor Payables"), debit: 0, credit: 6200, status: "Review" }
];
