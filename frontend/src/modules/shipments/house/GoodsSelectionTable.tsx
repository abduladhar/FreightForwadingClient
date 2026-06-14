import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAvailableGoods, searchGoodsReceipts } from "@/api/goodsReceiptApi";
import type { HouseShipmentItemRequest } from "@/api/houseShipmentApi";
import { CustomerAutocomplete } from "@/components/common/CustomerAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lt } from "@/modules/operationsLocalization";

type FilterState = {
  customerId: string;
  grnNumber: string;
  dateFrom: string;
  dateTo: string;
};

type EnrichedAvailableRow = {
  goodsReceiptId: string;
  goodsReceiptNumber: string;
  goodsReceiptDateTime: string;
  goodsReceiptCustomerId: string;
  goodsReceiptItemId: string;
  packageTypeGuid: string | null;
  packageTypeCode: string;
  packageTypeName: string;
  hsCode: string | null;
  countryOfOrigin: string | null;
  description: string;
  availablePieces: number;
  availableWeight: number;
  availableVolume: number;
  perItemLength: number;
  perItemBreadth: number;
  perItemHeight: number;
};

export function GoodsSelectionTable({
  initialCustomerId,
  onClose,
  onApply
}: {
  initialCustomerId?: string;
  onClose: () => void;
  onApply: (items: HouseShipmentItemRequest[]) => Promise<void> | void;
}) {
  const [filters, setFilters] = useState<FilterState>({
    customerId: initialCustomerId ?? "",
    grnNumber: "",
    dateFrom: "",
    dateTo: ""
  });
  const [selected, setSelected] = useState<Record<string, HouseShipmentItemRequest>>({});
  const [isApplying, setIsApplying] = useState(false);

  const hasAnyFilter = Boolean(
    filters.customerId.trim() || filters.grnNumber.trim() || filters.dateFrom.trim() || filters.dateTo.trim()
  );

  const availableQuery = useQuery({
    queryKey: ["house-shipment-grn-filter-available", filters.customerId],
    queryFn: () => getAvailableGoods(filters.customerId || undefined),
    enabled: hasAnyFilter
  });

  const receiptQuery = useQuery({
    queryKey: ["house-shipment-grn-filter-receipts", filters.customerId, filters.grnNumber],
    queryFn: () =>
      searchGoodsReceipts({
        pageNumber: 1,
        pageSize: 500,
        customerId: filters.customerId || undefined,
        search: filters.grnNumber || undefined
      }),
    enabled: hasAnyFilter
  });

  const rows = useMemo<EnrichedAvailableRow[]>(() => {
    if (!hasAnyFilter) return [];
    const available = availableQuery.data ?? [];
    const receiptItems = receiptQuery.data?.items ?? [];
    const receiptMap = new Map(receiptItems.map((x) => [x.id, x]));

    const list = available
      .map((item) => {
        const receipt = receiptMap.get(item.goodsReceiptId);
        if (!receipt) return null;
        const receiptItem = receipt.items.find((x) => x.id === item.goodsReceiptItemId);
        return {
          goodsReceiptId: item.goodsReceiptId,
          goodsReceiptNumber: item.goodsReceiptNumber,
          goodsReceiptDateTime: receipt.receivedDateTime,
          goodsReceiptCustomerId: receipt.customerId,
          goodsReceiptItemId: item.goodsReceiptItemId,
          packageTypeGuid: item.packageTypeGuid ?? null,
          packageTypeCode: item.packageTypeCode,
          packageTypeName: item.packageTypeName,
          hsCode: item.hsCode ?? receiptItem?.hsCode ?? null,
          countryOfOrigin: item.countryOfOrigin ?? receiptItem?.countryOfOrigin ?? null,
          description: item.description,
          availablePieces: item.availablePieces,
          availableWeight: item.receivedWeight,
          availableVolume: item.volumeCbm,
          perItemLength: receiptItem?.length ?? 0,
          perItemBreadth: receiptItem?.width ?? 0,
          perItemHeight: receiptItem?.height ?? 0
        } satisfies EnrichedAvailableRow;
      })
      .filter((x): x is EnrichedAvailableRow => x !== null);

    return list.filter((x) => {
      if (filters.grnNumber.trim()) {
        const q = filters.grnNumber.trim().toLowerCase();
        if (!x.goodsReceiptNumber.toLowerCase().includes(q)) return false;
      }
      if (filters.dateFrom) {
        const from = new Date(`${filters.dateFrom}T00:00:00`);
        const rowDate = new Date(x.goodsReceiptDateTime);
        if (rowDate < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(`${filters.dateTo}T23:59:59.999`);
        const rowDate = new Date(x.goodsReceiptDateTime);
        if (rowDate > to) return false;
      }
      return true;
    });
  }, [hasAnyFilter, availableQuery.data, receiptQuery.data?.items, filters.grnNumber, filters.dateFrom, filters.dateTo]);

  const selectedRows = useMemo(() => Object.values(selected).filter((x) => x.loadedPieces > 0), [selected]);

  async function handleApply() {
    setIsApplying(true);
    try {
      await onApply(selectedRows);
      onClose();
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-7xl overflow-hidden rounded-lg border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">{lt("Load Items From Goods Receipt Note")}</h3>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>{lt("Close")}</Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-5">
            <CustomerAutocomplete
              value={filters.customerId}
              placeholder={lt("Filter: Customer")}
              onChange={(customer) => setFilters((prev) => ({ ...prev, customerId: customer?.id ?? "" }))}
            />
            <Input
              placeholder={lt("Filter: Goods Receipt Note Number")}
              value={filters.grnNumber}
              onChange={(e) => setFilters((prev) => ({ ...prev, grnNumber: e.target.value }))}
            />
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFilters({
                  customerId: initialCustomerId ?? "",
                  grnNumber: "",
                  dateFrom: "",
                  dateTo: ""
                })
              }
            >{lt("Reset Filters")}</Button>
          </div>

          {!hasAnyFilter ? (
            <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              {lt("Apply at least one filter (Customer, Goods Receipt Note Number, Date From, or Date To) to load Goods Receipt Note items.")}
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 text-left">{lt("Select")}</th>
                    <th className="p-2 text-left">{lt("Goods Receipt Note Number")}</th>
                    <th className="p-2 text-left">{lt("Goods Receipt Note Date")}</th>
                    <th className="p-2 text-left">{lt("Package Type")}</th>
                    <th className="p-2 text-left">{lt("Description")}</th>
                    <th className="p-2 text-right">{lt("Avail Pieces")}</th>
                    <th className="p-2 text-right">{lt("Avail Weight")}</th>
                    <th className="p-2 text-right">{lt("Avail Volume")}</th>
                    <th className="p-2 text-right">{lt("Length (Per Item)")}</th>
                    <th className="p-2 text-right">{lt("Breadth (Per Item)")}</th>
                    <th className="p-2 text-right">{lt("Height (Per Item)")}</th>
                    <th className="p-2 text-right">{lt("Load Pieces")}</th>
                    <th className="p-2 text-right">{lt("Weight (Per Item)")}</th>
                    <th className="p-2 text-right">{lt("Volume (Per Item)")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    const perItemWeight = item.availablePieces > 0 ? item.availableWeight / item.availablePieces : 0;
                    const perItemVolume = item.availablePieces > 0 ? item.availableVolume / item.availablePieces : 0;
                    const row = selected[item.goodsReceiptItemId] ?? {
                      goodsReceiptItemId: item.goodsReceiptItemId,
                      packageTypeGuid: item.packageTypeGuid ?? null,
                      packageTypeName: item.packageTypeName,
                      hsCode: item.hsCode ?? null,
                      countryOfOrigin: item.countryOfOrigin ?? null,
                      description: item.description,
                      receivedPieces: 0,
                      receivedWeight: 0,
                      length: item.perItemLength,
                      width: item.perItemBreadth,
                      height: item.perItemHeight,
                      volumeCbm: 0,
                      loadedPieces: 0,
                      loadedWeight: 0,
                      loadedVolume: 0
                    };

                    return (
                      <tr key={item.goodsReceiptItemId} className="border-t">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={Boolean(selected[item.goodsReceiptItemId])}
                            onChange={(e) => {
                              const next = { ...selected };
                              if (e.target.checked) {
                                next[item.goodsReceiptItemId] = {
                                  ...row,
                                  loadedPieces: row.loadedPieces || item.availablePieces,
                                  receivedPieces: row.receivedPieces || item.availablePieces,
                                  packageTypeName: row.packageTypeName ?? item.packageTypeName,
                                  hsCode: row.hsCode ?? item.hsCode ?? null,
                                  countryOfOrigin: row.countryOfOrigin ?? item.countryOfOrigin ?? null,
                                  loadedWeight: row.loadedWeight || item.availableWeight,
                                  receivedWeight: row.receivedWeight || item.availableWeight,
                                  loadedVolume: row.loadedVolume || item.availableVolume,
                                  volumeCbm: row.volumeCbm || item.availableVolume,
                                  length: row.length || item.perItemLength,
                                  width: row.width || item.perItemBreadth,
                                  height: row.height || item.perItemHeight
                                };
                              } else {
                                delete next[item.goodsReceiptItemId];
                              }
                              setSelected(next);
                            }}
                          />
                        </td>
                        <td className="p-2">{item.goodsReceiptNumber}</td>
                        <td className="p-2">{item.goodsReceiptDateTime ? new Date(item.goodsReceiptDateTime).toLocaleDateString() : "-"}</td>
                        <td className="p-2">{item.packageTypeCode ? `${item.packageTypeCode} - ${item.packageTypeName}` : item.packageTypeName}</td>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-right">{item.availablePieces}</td>
                        <td className="p-2 text-right">{item.availableWeight.toFixed(3)}</td>
                        <td className="p-2 text-right">{item.availableVolume.toFixed(3)}</td>
                        <td className="p-2 text-right">{item.perItemLength.toFixed(3)}</td>
                        <td className="p-2 text-right">{item.perItemBreadth.toFixed(3)}</td>
                        <td className="p-2 text-right">{item.perItemHeight.toFixed(3)}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            max={item.availablePieces}
                            value={row.loadedPieces}
                            onChange={(e) => {
                              const nextPieces = Math.min(item.availablePieces, Math.max(0, Number(e.target.value)));
                              const nextWeight = Number((perItemWeight * nextPieces).toFixed(6));
                              const nextVolume = Number((perItemVolume * nextPieces).toFixed(6));
                              setSelected({
                                ...selected,
                                [item.goodsReceiptItemId]: {
                                  ...row,
                                  receivedPieces: nextPieces,
                                  packageTypeName: row.packageTypeName ?? item.packageTypeName,
                                  hsCode: row.hsCode ?? item.hsCode ?? null,
                                  countryOfOrigin: row.countryOfOrigin ?? item.countryOfOrigin ?? null,
                                  loadedPieces: nextPieces,
                                  receivedWeight: nextWeight,
                                  loadedWeight: nextWeight,
                                  volumeCbm: nextVolume,
                                  loadedVolume: nextVolume,
                                  length: item.perItemLength,
                                  width: item.perItemBreadth,
                                  height: item.perItemHeight
                                }
                              });
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            value={row.loadedWeight}
                            disabled
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            value={row.loadedVolume}
                            disabled
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length ? (
                    <tr>
                      <td className="p-4 text-muted-foreground" colSpan={14}>
                        {availableQuery.isLoading || receiptQuery.isLoading ? lt("Loading filtered Goods Receipt Note items...") : lt("No Goods Receipt Note items found for selected filters.")}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-sm text-muted-foreground">{selectedRows.length} {lt("item(s) selected.")}</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>{lt("Cancel")}</Button>
              <Button type="button" onClick={() => void handleApply()} disabled={isApplying || !selectedRows.length}>
                {isApplying ? lt("Saving...") : lt("OK")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
