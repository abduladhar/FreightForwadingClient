import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";
import { authStorage } from "@/auth/authStorage";

export interface AccountingSearchRequest { pageNumber?: number; pageSize?: number; search?: string; isActive?: boolean }
export interface AccountGroupDto { id: string; groupCode: string; groupName: string; normalBalance: string; isSystem: boolean; isActive: boolean }
export interface AccountGroupRequest { groupCode: string; groupName: string; normalBalance: string; isActive: boolean }
export interface ChartOfAccountDto { id: string; accountCode: string; accountName: string; accountGroupId: string; accountSubGroupId: string; parentAccountId?: string | null; isControlAccount: boolean; allowManualPosting: boolean; isActive: boolean }
export interface ChartOfAccountRequest { accountCode: string; accountName: string; accountGroupId: string; accountSubGroupId: string; parentAccountId?: string | null; isControlAccount: boolean; allowManualPosting: boolean; isActive: boolean }
export interface LedgerAccountDto { id: string; chartOfAccountId: string; ledgerCode: string; ledgerName: string; currencyId?: string | null; customerId?: string | null; vendorId?: string | null; agentId?: string | null; carrierId?: string | null; isControlLedger: boolean; allowManualPosting: boolean; isActive: boolean }
export interface LedgerAccountRequest extends Omit<LedgerAccountDto, "id"> {}
export interface FinancialYearDto { id: string; yearCode: string; startDate: string; endDate: string; isActive: boolean; isClosed: boolean }
export interface FinancialYearRequest { yearCode: string; startDate: string; endDate: string; isActive: boolean }
export interface OpeningBalanceDto { id: string; financialYearId: string; ledgerAccountId: string; currencyId?: string | null; debitAmount: number; creditAmount: number; remarks?: string | null; isApproved: boolean }
export interface OpeningBalanceRequest extends Omit<OpeningBalanceDto, "id"> {}
export interface OpeningBalanceLineRequest extends Omit<OpeningBalanceRequest, "financialYearId" | "isApproved"> {}
export interface OpeningBalanceBatchRequest { financialYearId: string; lines: OpeningBalanceLineRequest[]; isApproved: boolean }
export interface AccountMappingDto { id: string; mappingKey: string; mappingName: string; ledgerAccountId: string; sourceModule: string; isActive: boolean }
export interface AccountMappingRequest extends Omit<AccountMappingDto, "id"> {}
export interface BankAccountDto { id: string; ledgerAccountId: string; bankName: string; accountNumber: string; iban?: string | null; swiftCode?: string | null; currencyId: string; isActive: boolean }
export interface CashAccountDto { id: string; ledgerAccountId: string; cashAccountName: string; currencyId: string; isActive: boolean }
export interface LedgerReportRow { date: string; voucherNumber: string; voucherType: string; particulars: string; narration: string; debit: number; credit: number; balance: number; currencyId: string; baseDebit: number; baseCredit: number; baseBalance: number }

export interface VoucherLine { id: string; accountId: string; currencyId: string; exchangeRate: number; debit: number; credit: number; baseDebit: number; baseCredit: number; narration?: string | null }
export interface VoucherDraft { id: string; voucherType: "Journal" | "Payment" | "Receipt" | "Contra"; voucherDate: string; referenceNumber?: string | null; approvalStatus: "Draft" | "Submitted" | "Approved"; attachmentName?: string | null; narration?: string | null; lines: VoucherLine[]; createdDate: string }

const base = "/api/accounting";
const VKEY = "accounting-voucher-drafts-v1";
function vScopedKey() {
  const s = authStorage.get();
  return `${VKEY}:${s?.tenantId ?? "global"}:${s?.branchId ?? "all"}`;
}

export async function getAccountGroups(params: AccountingSearchRequest) { const r = await httpClient.get<ApiResponse<PagedResponse<AccountGroupDto>>>(`${base}/account-groups`, { params }); return r.data.data; }
export async function createAccountGroup(request: AccountGroupRequest) { const r = await httpClient.post<ApiResponse<AccountGroupDto>>(`${base}/account-groups`, request); return r.data.data; }
export async function getChartOfAccounts(params: AccountingSearchRequest) { const r = await httpClient.get<ApiResponse<PagedResponse<ChartOfAccountDto>>>(`${base}/chart-of-accounts`, { params }); return r.data.data; }
export async function getLedgerAccounts(params: AccountingSearchRequest) { const r = await httpClient.get<ApiResponse<PagedResponse<LedgerAccountDto>>>(`${base}/ledger-accounts`, { params }); return r.data.data; }
export async function createLedgerAccount(request: LedgerAccountRequest) { const r = await httpClient.post<ApiResponse<LedgerAccountDto>>(`${base}/ledger-accounts`, request); return r.data.data; }
export async function updateLedgerAccount(id: string, request: LedgerAccountRequest) { const r = await httpClient.put<ApiResponse<LedgerAccountDto>>(`${base}/ledger-accounts/${id}`, request); return r.data.data; }
export async function getFinancialYears(params: AccountingSearchRequest) { const r = await httpClient.get<ApiResponse<PagedResponse<FinancialYearDto>>>(`${base}/financial-years`, { params }); return r.data.data; }
export async function createFinancialYear(request: FinancialYearRequest) { const r = await httpClient.post<ApiResponse<FinancialYearDto>>(`${base}/financial-years`, request); return r.data.data; }
export async function closeFinancialYear(id: string) { const r = await httpClient.post<ApiResponse<FinancialYearDto>>(`${base}/financial-years/${id}/close`); return r.data.data; }
export async function getOpeningBalances(params: AccountingSearchRequest) { const r = await httpClient.get<ApiResponse<PagedResponse<OpeningBalanceDto>>>(`${base}/opening-balances`, { params }); return r.data.data; }
export async function upsertOpeningBalance(request: OpeningBalanceRequest) { const r = await httpClient.post<ApiResponse<OpeningBalanceDto>>(`${base}/opening-balances`, request); return r.data.data; }
export async function upsertOpeningBalances(request: OpeningBalanceBatchRequest) { const r = await httpClient.post<ApiResponse<OpeningBalanceDto[]>>(`${base}/opening-balances/batch`, request); return r.data.data; }
export async function getAccountMappings(params: AccountingSearchRequest) { const r = await httpClient.get<ApiResponse<PagedResponse<AccountMappingDto>>>(`${base}/account-mappings`, { params }); return r.data.data; }
export async function upsertAccountMapping(request: AccountMappingRequest) { const r = await httpClient.post<ApiResponse<AccountMappingDto>>(`${base}/account-mappings`, request); return r.data.data; }
export async function getBankAccounts(params: AccountingSearchRequest) { const r = await httpClient.get<ApiResponse<PagedResponse<BankAccountDto>>>(`${base}/bank-accounts`, { params }); return r.data.data; }
export async function getCashAccounts(params: AccountingSearchRequest) { const r = await httpClient.get<ApiResponse<PagedResponse<CashAccountDto>>>(`${base}/cash-accounts`, { params }); return r.data.data; }
export async function getLedgerEntries(params: { pageNumber?: number; pageSize?: number; fromDate?: string; toDate?: string; accountId?: string; sortDirection?: "asc" | "desc" }) {
  const r = await httpClient.get<ApiResponse<{ data: LedgerReportRow[] }>>("/api/accounting/reports/ledger", { params });
  return r.data.data.data;
}

export function listVoucherDrafts(type?: VoucherDraft["voucherType"]) {
  try {
    const rows = JSON.parse(localStorage.getItem(vScopedKey()) ?? "[]") as VoucherDraft[];
    return type ? rows.filter((x) => x.voucherType === type) : rows;
  } catch { return []; }
}
export function saveVoucherDraft(draft: Omit<VoucherDraft, "id" | "createdDate">) {
  const rows = listVoucherDrafts();
  const row: VoucherDraft = { ...draft, id: crypto.randomUUID(), createdDate: new Date().toISOString() };
  localStorage.setItem(vScopedKey(), JSON.stringify([row, ...rows]));
  return row;
}
export function updateVoucherDraft(id: string, draft: Omit<VoucherDraft, "id" | "createdDate">) {
  const rows = listVoucherDrafts().map((x) => x.id === id ? { ...x, ...draft } : x);
  localStorage.setItem(vScopedKey(), JSON.stringify(rows));
}
export function getVoucherDraft(id: string) { return listVoucherDrafts().find((x) => x.id === id) ?? null; }
