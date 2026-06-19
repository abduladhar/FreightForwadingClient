import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getCurrencies } from "@/api/currencyApi";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { useWorkspace } from "@/hooks/useWorkspace";
import { AccountingReportPage } from "@/modules/reports/accounting/_shared";
import { lt } from "@/modules/operationsLocalization";

type Row = {
  partyId: string;
  partyName: string;
  documentId: string;
  documentNumber: string;
  sourceType?: string | null;
  sourceReferenceNo?: string | null;
  documentDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  currencyId: string;
  baseOutstandingAmount: number;
};

export function VendorOutstandingPage() {
  const workspace = useWorkspace();
  const currencies = useQuery({ queryKey: ["vendor-outstanding", "currencies"], queryFn: getCurrencies });
  const currencyById = useMemo(() => new Map((currencies.data ?? []).map((currency) => [currency.id, currency.currencyCode])), [currencies.data]);
  const formatNumber = useMemo(() => new Intl.NumberFormat(workspace.cultureCode, { maximumFractionDigits: 0 }), [workspace.cultureCode]);

  const currencyCode = (currencyId: string) => currencyById.get(currencyId) ?? workspace.baseCurrency;
  const baseCurrencyCode = workspace.baseCurrency;
  const formatCurrency = (amount: number, code: string) => new Intl.NumberFormat(workspace.cultureCode, { style: "currency", currency: code }).format(amount);

  const columns = useMemo<ColumnDef<Row>[]>(() => [
    { accessorKey: "partyName", header: lt("Vendor") },
    { accessorKey: "documentNumber", header: lt("Document") },
    { id: "sourceType", header: lt("Operation Reference"), cell: ({ row }) => displaySourceType(row.original.sourceType) },
    { id: "sourceReferenceNo", header: lt("Operation No"), cell: ({ row }) => row.original.sourceReferenceNo || "-" },
    { accessorKey: "documentDate", header: lt("Date") },
    { accessorKey: "dueDate", header: lt("Due") },
    { id: "ageDays", header: lt("Age (Days)"), cell: ({ row }) => formatNumber.format(ageDays(row.original.dueDate)) },
    { id: "currencyCode", header: lt("Currency"), cell: ({ row }) => currencyCode(row.original.currencyId) },
    { accessorKey: "totalAmount", header: lt("Total"), cell: ({ row }) => <CurrencyAmount value={row.original.totalAmount} currency={currencyCode(row.original.currencyId)} /> },
    { accessorKey: "paidAmount", header: lt("Paid"), cell: ({ row }) => <CurrencyAmount value={row.original.paidAmount} currency={currencyCode(row.original.currencyId)} /> },
    { accessorKey: "outstandingAmount", header: lt("Outstanding"), cell: ({ row }) => <CurrencyAmount value={row.original.outstandingAmount} currency={currencyCode(row.original.currencyId)} /> },
    { accessorKey: "baseOutstandingAmount", header: `${lt("Base Outstanding")} (${baseCurrencyCode})`, cell: ({ row }) => <CurrencyAmount value={row.original.baseOutstandingAmount} currency={baseCurrencyCode} /> }
  ], [baseCurrencyCode, currencyById, formatNumber]);

  return (
    <AccountingReportPage<Row>
      title={lt("Vendor Outstanding")}
      reportType="vendor-outstanding"
      needsVendor
      mapRows={(data) => Array.isArray(data) ? data as Row[] : []}
      columns={columns}
      totalsBuilder={(rows) => {
        const outstandingByCurrency = buildOutstandingTotals(rows, currencyCode);
        return [
          ...Array.from(outstandingByCurrency.entries()).map(([code, amount]) => ({
            label: `${lt("Total Outstanding")} (${code})`,
            value: formatCurrency(amount, code)
          })),
          {
            label: `${lt("Total Base Outstanding")} (${baseCurrencyCode})`,
            value: formatCurrency(rows.reduce((sum, row) => sum + row.baseOutstandingAmount, 0), baseCurrencyCode)
          }
        ];
      }}
      prepareClientExport={(rows) => {
        const includeBaseCurrency = window.confirm(lt("Include base currency columns in this export?"));
        const exportColumns = [
          { key: "partyName", label: lt("Vendor") },
          { key: "documentNumber", label: lt("Document") },
          { key: "sourceType", label: lt("Operation Reference") },
          { key: "sourceReferenceNo", label: lt("Operation No") },
          { key: "documentDate", label: lt("Date") },
          { key: "dueDate", label: lt("Due") },
          { key: "ageDays", label: lt("Age (Days)") },
          { key: "currencyCode", label: lt("Currency") },
          { key: "totalAmount", label: lt("Total") },
          { key: "paidAmount", label: lt("Paid") },
          { key: "outstandingAmount", label: lt("Outstanding") },
          ...(includeBaseCurrency ? [{ key: "baseOutstandingAmount", label: `${lt("Base Outstanding")} (${baseCurrencyCode})` }] : [])
        ];
        const exportRows: Record<string, unknown>[] = rows.map((row) => ({
          partyName: row.partyName,
          documentNumber: row.documentNumber,
          sourceType: displaySourceType(row.sourceType),
          sourceReferenceNo: row.sourceReferenceNo || "",
          documentDate: row.documentDate,
          dueDate: row.dueDate,
          ageDays: ageDays(row.dueDate),
          currencyCode: currencyCode(row.currencyId),
          totalAmount: row.totalAmount,
          paidAmount: row.paidAmount,
          outstandingAmount: row.outstandingAmount,
          ...(includeBaseCurrency ? { baseOutstandingAmount: row.baseOutstandingAmount } : {})
        }));
        buildOutstandingTotals(rows, currencyCode).forEach((amount, code) => {
          exportRows.push({
            partyName: `${lt("Total Outstanding")} (${code})`,
            documentNumber: "",
            sourceType: "",
            sourceReferenceNo: "",
            documentDate: "",
            dueDate: "",
            ageDays: "",
            currencyCode: code,
            totalAmount: "",
            paidAmount: "",
            outstandingAmount: amount,
            ...(includeBaseCurrency ? { baseOutstandingAmount: "" } : {})
          });
        });
        if (includeBaseCurrency) {
          exportRows.push({
            partyName: lt("Total"),
            documentNumber: "",
            sourceType: "",
            sourceReferenceNo: "",
            documentDate: "",
            dueDate: "",
            ageDays: "",
            currencyCode: baseCurrencyCode,
            totalAmount: "",
            paidAmount: "",
            outstandingAmount: "",
            baseOutstandingAmount: rows.reduce((sum, row) => sum + row.baseOutstandingAmount, 0)
          });
        }
        return { columns: exportColumns, rows: exportRows };
      }}
    />
  );
}

function buildOutstandingTotals(rows: Row[], currencyCode: (currencyId: string) => string) {
  const totals = new Map<string, number>();
  rows.forEach((row) => {
    const code = currencyCode(row.currencyId);
    totals.set(code, (totals.get(code) ?? 0) + row.outstandingAmount);
  });
  return totals;
}

function ageDays(dueDate: string) {
  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86_400_000));
}

function displaySourceType(sourceType?: string | null) {
  switch (sourceType) {
    case "HouseShipment":
      return lt("House Shipment");
    case "MasterShipment":
      return lt("Master Shipment");
    case "DirectShipment":
      return lt("Direct Shipment");
    case "Pickup":
      return lt("Pickup");
    case "GoodsReceipt":
      return lt("Goods Receipt Note");
    case "Quotation":
      return lt("Quotation");
    case "CustomsClearance":
      return lt("Customs Clearance");
    case "Job":
      return lt("Job");
    case "Custom":
      return lt("Custom");
    case "Miscellaneous":
      return lt("Miscellaneous");
    default:
      return sourceType || "-";
  }
}
