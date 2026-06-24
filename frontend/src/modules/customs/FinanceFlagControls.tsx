import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { lt } from "@/modules/operationsLocalization";

export type FlagFilterValue = "" | "true" | "false";

export interface FinanceStatusFields {
  invoiceDefined: boolean;
  billDefined: boolean;
  invoiceFullyReceived: boolean;
  billFullyPaid: boolean;
  invoiceCancelled: boolean;
  billCancelled: boolean;
  pendingInvoicePostingCount: number;
  pendingBillPostingCount: number;
  unpaidInvoiceCount: number;
  unpaidBillCount: number;
}

export function toBooleanFilter(value: FlagFilterValue) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function FinanceFlagHeader({ label }: { label: string }) {
  return <span className="block min-w-24 whitespace-normal text-center leading-snug">{label}</span>;
}

export function FinanceFlagCell({ active, warning = false, compact = false }: { active: boolean; warning?: boolean; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={active ? (warning ? "red" : "green") : "slate"}>{active ? lt("Yes") : lt("No value")}</Badge></div>;
}

export function PostingCount({ value, compact = false }: { value: number; compact?: boolean }) {
  return <div className={compact ? "flex justify-end" : "flex justify-center"}><Badge tone={value > 0 ? "amber" : "slate"}>{value}</Badge></div>;
}

export function FinanceStatusDropdown({ row }: { row: FinanceStatusFields }) {
  const hasWarning = row.invoiceCancelled || row.billCancelled || row.pendingInvoicePostingCount > 0 || row.pendingBillPostingCount > 0 || row.unpaidInvoiceCount > 0 || row.unpaidBillCount > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 px-2"><Badge tone={hasWarning ? "amber" : "green"}>{hasWarning ? lt("Review") : lt("Clear")}</Badge></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-2">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{lt("Finance Status")}</div>
          <div className="space-y-1 rounded-md bg-slate-50 p-2">
            <FinanceStatusRow label={lt("Invoice Fully Received")} value={<FinanceFlagCell active={row.invoiceFullyReceived} compact />} />
            <FinanceStatusRow label={lt("Bill Fully Paid")} value={<FinanceFlagCell active={row.billFullyPaid} compact />} />
            <FinanceStatusRow label={lt("Invoice Cancelled")} value={<FinanceFlagCell active={row.invoiceCancelled} warning compact />} />
            <FinanceStatusRow label={lt("Bill Cancelled")} value={<FinanceFlagCell active={row.billCancelled} warning compact />} />
            <FinanceStatusRow label={lt("Pending Invoice To Post")} value={<PostingCount value={row.pendingInvoicePostingCount} compact />} />
            <FinanceStatusRow label={lt("Pending Bill To Post")} value={<PostingCount value={row.pendingBillPostingCount} compact />} />
            <FinanceStatusRow label={lt("Unpaid Invoice")} value={<PostingCount value={row.unpaidInvoiceCount} compact />} />
            <FinanceStatusRow label={lt("Unpaid Bill")} value={<PostingCount value={row.unpaidBillCount} compact />} />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FlagSelect({ label, value, onChange, resetPage }: { label: string; value: FlagFilterValue; onChange: (value: FlagFilterValue) => void; resetPage: () => void }) {
  return (
    <FilterField label={label}>
      <select className="h-10 w-full rounded-md border px-3 text-sm" value={value} onChange={(event) => { onChange(event.target.value as FlagFilterValue); resetPage(); }}>
        <option value="">{lt("All")}</option>
        <option value="true">{lt("Yes")}</option>
        <option value="false">{lt("No value")}</option>
      </select>
    </FilterField>
  );
}

export function StatusSelect({ label, value, onChange, resetPage }: { label: string; value: string; onChange: (value: string) => void; resetPage: () => void }) {
  return (
    <FilterField label={label}>
      <select className="h-10 w-full rounded-md border px-3 text-sm" value={value} onChange={(event) => { onChange(event.target.value); resetPage(); }}>
        <option value="">{lt("All")}</option>
        <option value="Draft">{lt("Draft")}</option>
        <option value="Approved">{lt("Approved")}</option>
        <option value="Sent">{lt("Sent")}</option>
        <option value="Partially Paid">{lt("Partially Paid")}</option>
        <option value="Paid">{lt("Paid")}</option>
        <option value="Cancelled">{lt("Cancelled")}</option>
      </select>
    </FilterField>
  );
}

function FinanceStatusRow({ label, value }: { label: string; value: ReactNode }) {
  return <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs"><span className="text-slate-600">{label}</span>{value}</div>;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}
