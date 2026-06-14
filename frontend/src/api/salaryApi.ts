import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";
import { authStorage } from "@/auth/authStorage";

export interface AccountingSearchRequest {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface LedgerAccountDto {
  id: string;
  chartOfAccountId: string;
  ledgerCode: string;
  ledgerName: string;
  currencyId?: string | null;
  customerId?: string | null;
  vendorId?: string | null;
  agentId?: string | null;
  carrierId?: string | null;
  isControlLedger: boolean;
  allowManualPosting: boolean;
  isActive: boolean;
}

export interface AccountingReportRequest {
  pageNumber?: number;
  pageSize?: number;
  financialYearId?: string;
  fromDate?: string;
  toDate?: string;
  accountId?: string;
  customerId?: string;
  vendorId?: string;
  currencyId?: string;
  reportCurrencyId?: string;
  exportFormat?: string;
}

export interface ReportEnvelope<T> {
  reportName: string;
  tenantId?: string | null;
  branchId?: string | null;
  financialYearId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  originalCurrencyId?: string | null;
  baseCurrencyId?: string | null;
  reportCurrencyId?: string | null;
  currencyMode: string;
  data: T;
}

export interface LedgerReportRow {
  date: string;
  voucherNumber: string;
  voucherType: string;
  particulars: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
  currencyId: string;
  baseDebit: number;
  baseCredit: number;
  baseBalance: number;
}

export interface SalaryDraft {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basicAmount: number;
  allowanceAmount: number;
  deductionAmount: number;
  incentiveAmount: number;
  netAmount: number;
  currencyId: string;
  exchangeRate: number;
  remarks?: string | null;
  createdDate: string;
}

const DRAFT_KEY = "salary-drafts-v1";
function scopedKey() {
  const session = authStorage.get();
  const tenant = session?.tenantId ?? "global";
  const branch = session?.branchId ?? "all";
  return `${DRAFT_KEY}:${tenant}:${branch}`;
}

export async function searchLedgerAccounts(params: AccountingSearchRequest) {
  const response = await httpClient.get<ApiResponse<PagedResponse<LedgerAccountDto>>>("/api/accounting/ledger-accounts", { params });
  return response.data.data;
}

export async function getLedgerReport(params: AccountingReportRequest) {
  const response = await httpClient.get<ApiResponse<ReportEnvelope<LedgerReportRow[]>>>("/api/accounting/reports/ledger", { params });
  return response.data.data;
}

export async function getReportPrintPreview(reportName: string, params: AccountingReportRequest) {
  const response = await httpClient.get<ApiResponse<{ reportName: string; format: string; fileName: string; contentType: string; content: string }>>(`/api/accounting/reports/${reportName}/print-preview`, { params });
  return response.data.data;
}

export function listSalaryDrafts(): SalaryDraft[] {
  try {
    return JSON.parse(localStorage.getItem(scopedKey()) ?? "[]") as SalaryDraft[];
  } catch {
    return [];
  }
}

export function saveSalaryDraft(draft: Omit<SalaryDraft, "id" | "createdDate">) {
  const drafts = listSalaryDrafts();
  const row: SalaryDraft = { ...draft, id: crypto.randomUUID(), createdDate: new Date().toISOString() };
  localStorage.setItem(scopedKey(), JSON.stringify([row, ...drafts]));
  return row;
}
