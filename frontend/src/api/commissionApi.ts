import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";
import { searchAgents } from "@/api/agentApi";
import { authStorage } from "@/auth/authStorage";

export interface AgentCommissionStatementRow {
  sourceId: string;
  sourceType: string;
  date: string;
  description: string;
  currencyId: string;
  commissionAmount: number;
  status: string;
}

export interface AgentCommissionDraft {
  id: string;
  agentId: string;
  sourceType: string;
  sourceId?: string | null;
  commissionCurrencyId: string;
  exchangeRate: number;
  baseAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  remarks?: string | null;
  createdDate: string;
}

const DRAFT_KEY = "agent-commission-drafts-v1";
function scopedKey() {
  const session = authStorage.get();
  const tenant = session?.tenantId ?? "global";
  const branch = session?.branchId ?? "all";
  return `${DRAFT_KEY}:${tenant}:${branch}`;
}

export async function getAgentCommissionStatement() {
  const response = await httpClient.get<ApiResponse<AgentCommissionStatementRow[]>>("/api/agent-portal/commission-statement");
  return response.data.data;
}

export async function getCommissionAgents() {
  return searchAgents({ pageNumber: 1, pageSize: 200, isActive: true });
}

export function listCommissionDrafts(): AgentCommissionDraft[] {
  try {
    return JSON.parse(localStorage.getItem(scopedKey()) ?? "[]") as AgentCommissionDraft[];
  } catch {
    return [];
  }
}

export function saveCommissionDraft(draft: Omit<AgentCommissionDraft, "id" | "createdDate">) {
  const drafts = listCommissionDrafts();
  const row: AgentCommissionDraft = { ...draft, id: crypto.randomUUID(), createdDate: new Date().toISOString() };
  localStorage.setItem(scopedKey(), JSON.stringify([row, ...drafts]));
  return row;
}
