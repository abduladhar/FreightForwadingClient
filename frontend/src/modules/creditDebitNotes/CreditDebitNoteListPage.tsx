import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Eye, FilePlus2, Pencil, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { approveCreditDebitNote, cancelCreditDebitNote, deleteCreditDebitNote, searchCreditDebitNotes, type CreditDebitNoteDto } from "@/api/creditDebitNoteApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import { useAuth } from "@/auth/useAuth";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function CreditDebitNoteListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [noteType, setNoteType] = useState("");
  const [partyType, setPartyType] = useState("");
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();
  const { hasPermission } = useAuth();
  const currencies = useQuery({ queryKey: ["tenant-currencies", "credit-debit-note-list"], queryFn: getTenantCurrencies });
  const query = useQuery({
    queryKey: ["credit-debit-notes", pageNumber, pageSize, search, noteType, partyType, status],
    queryFn: () => searchCreditDebitNotes({ pageNumber, pageSize, search, noteType: noteType || undefined, partyType: partyType || undefined, status: status || undefined })
  });
  const approve = useMutation({ mutationFn: approveCreditDebitNote, onSuccess: async (note) => { toast.success(lt("Note approved and posted"), note.noteNumber); await queryClient.invalidateQueries({ queryKey: ["credit-debit-notes"] }); } });
  const cancel = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelCreditDebitNote(id, reason), onSuccess: async (note) => { toast.success(lt("Note cancelled"), note.noteNumber); await queryClient.invalidateQueries({ queryKey: ["credit-debit-notes"] }); } });
  const remove = useMutation({ mutationFn: deleteCreditDebitNote, onSuccess: async () => { toast.success(lt("Note deleted")); await queryClient.invalidateQueries({ queryKey: ["credit-debit-notes"] }); } });
  const columns: ColumnDef<CreditDebitNoteDto>[] = [
    { accessorKey: "noteNumber", header: lt("Note No") },
    { accessorKey: "noteType", header: lt("Type"), cell: ({ row }) => lt(row.original.noteType) },
    { accessorKey: "partyName", header: lt("Party") },
    { accessorKey: "partyType", header: lt("Party Type"), cell: ({ row }) => lt(row.original.partyType) },
    { accessorKey: "sourceReferenceNo", header: lt("Reference No"), cell: ({ row }) => row.original.sourceReferenceNo || "-" },
    { accessorKey: "noteDate", header: lt("Date") },
    { accessorKey: "totalAmount", header: lt("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCode(currencies.data, row.original.noteCurrencyId)} /> },
    { accessorKey: "baseCurrencyAmount", header: lt("Base"), cell: ({ row }) => <CurrencyAmount value={row.original.baseCurrencyAmount} currency={baseCurrencyCode(currencies.data)} /> },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "isAccountingPosted", header: lt("Accounting"), cell: ({ row }) => row.original.isAccountingPosted ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{lt("Posted")}</span> : <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">{lt("Pending")}</span> }
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Credit / Debit Notes")} description={lt("Customer and vendor credit/debit notes with combined approval and accounting posting.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="CreditDebitNote.Create"><Link to="/credit-debit-notes/new"><FilePlus2 className="h-4 w-4" /> {lt("New Note")}</Link></PermissionButton></>} />
      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={query.data?.items ?? []}
            columns={columns}
            totalCount={query.data?.totalCount ?? 0}
            pageNumber={query.data?.pageNumber ?? pageNumber}
            pageSize={query.data?.pageSize ?? pageSize}
            search={search}
            searchPlaceholder={lt("Search note no, party, reference...")}
            onSearchChange={(value) => { setPageNumber(1); setSearch(value); }}
            filters={<div className="flex flex-wrap gap-2">
              <select className="h-9 rounded-md border px-2 text-sm" value={noteType} onChange={(event) => { setPageNumber(1); setNoteType(event.target.value); }}><option value="">{lt("All Types")}</option><option value="Credit Note">{lt("Credit Note")}</option><option value="Debit Note">{lt("Debit Note")}</option></select>
              <select className="h-9 rounded-md border px-2 text-sm" value={partyType} onChange={(event) => { setPageNumber(1); setPartyType(event.target.value); }}><option value="">{lt("All Parties")}</option><option value="Customer">{lt("Customer")}</option><option value="Vendor">{lt("Vendor")}</option></select>
              <select className="h-9 rounded-md border px-2 text-sm" value={status} onChange={(event) => { setPageNumber(1); setStatus(event.target.value); }}><option value="">{lt("All Status")}</option><option value="Draft">{lt("Draft")}</option><option value="Approved">{lt("Approved")}</option><option value="Cancelled">{lt("Cancelled")}</option></select>
            </div>}
            onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            rowActions={(row) => <div className="flex items-center gap-1">
              <PermissionButton asChild permission="CreditDebitNote.Read" size="sm" variant="ghost"><Link to={`/credit-debit-notes/${row.id}`}><Eye className="h-4 w-4" /></Link></PermissionButton>
              {row.status === "Draft" ? <PermissionButton asChild permission="CreditDebitNote.Update" size="sm" variant="ghost"><Link to={`/credit-debit-notes/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton> : null}
              {hasPermission("CreditDebitNote.Approve") && row.status === "Draft" ? <Button size="sm" variant="ghost" onClick={() => void approve.mutateAsync(row.id)}><CheckCircle2 className="h-4 w-4 text-emerald-600" /></Button> : null}
              {hasPermission("CreditDebitNote.Cancel") && row.status !== "Cancelled" ? <ConfirmDialog title={lt("Cancel note?")} description={row.noteNumber} confirmText={lt("Cancel Note")} variant="danger" onConfirm={async () => cancel.mutateAsync({ id: row.id, reason: "Cancelled from list action" }).then(() => undefined)}><Button size="sm" variant="ghost"><XCircle className="h-4 w-4 text-red-600" /></Button></ConfirmDialog> : null}
              {hasPermission("CreditDebitNote.Delete") && row.status === "Draft" ? <ConfirmDialog title={lt("Delete draft note?")} description={row.noteNumber} confirmText={lt("Delete")} variant="danger" onConfirm={async () => remove.mutateAsync(row.id).then(() => undefined)}><Button size="sm" variant="ghost"><XCircle className="h-4 w-4 text-red-600" /></Button></ConfirmDialog> : null}
            </div>}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function currencyCode(currencies: Awaited<ReturnType<typeof getTenantCurrencies>> | undefined, currencyId: string) {
  return currencies?.find((currency) => currency.currencyId === currencyId)?.currencyCode ?? baseCurrencyCode(currencies);
}

function baseCurrencyCode(currencies: Awaited<ReturnType<typeof getTenantCurrencies>> | undefined) {
  return currencies?.find((currency) => currency.isBaseCurrency)?.currencyCode ?? currencies?.[0]?.currencyCode ?? "USD";
}
