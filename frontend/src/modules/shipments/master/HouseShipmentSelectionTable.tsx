import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchHouseShipments } from "@/api/houseShipmentApi";
import { getAvailableGoods, searchGoodsReceipts } from "@/api/goodsReceiptApi";
import { searchCustomers } from "@/api/customerApi";
import { getActiveShippingPortsForDropdown } from "@/api/shippingPortApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lt } from "@/modules/operationsLocalization";

export type AssignmentRow = {
  loadMode: "house" | "grn";
  goodsReceiptId?: string;
  goodsReceiptItemId?: string;
  houseShipmentId: string;
  houseShipmentItemId: string;
  houseShipmentNumber?: string;
  hawbNumber?: string;
  shipperName?: string;
  shipperAddress?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  houseShipmentItemDescription?: string;
  packageTypeId?: string | null;
  packageTypeName?: string;
  hsCode?: string | null;
  countryOfOrigin?: string | null;
  length?: number;
  width?: number;
  height?: number;
  volumeCbm?: number;
  consolidatedPieces: number;
  consolidatedWeight: number;
  consolidatedVolume: number;
  chargeableWeight: number;
  manualAllocatedCostAmount?: number | null;
};

export function HouseShipmentSelectionTable({
  onApply,
  transportMode,
  defaultLoadMode = "house",
  hideOtherModeSwitch = false,
  existingAssignments = [],
  isOpen: _isOpen = false,
}: {
  onApply: (rows: AssignmentRow[], mode: "house" | "grn") => void;
  transportMode?: string;
  defaultLoadMode?: "house" | "grn";
  hideOtherModeSwitch?: boolean;
  existingAssignments?: AssignmentRow[];
  isOpen?: boolean;
}) {
  const [loadMode, setLoadMode] = useState<"house" | "grn">(defaultLoadMode);
  const [customerId, setCustomerId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [originPortGuid, setOriginPortGuid] = useState("");
  const [destinationPortGuid, setDestinationPortGuid] = useState("");
  const [hawbSearch, setHawbSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, AssignmentRow>>({});

  const customers = useQuery({ queryKey: ["master-customers"], queryFn: () => searchCustomers({ pageNumber: 1, pageSize: 200, isActive: true }) });
  const shippingPorts = useQuery({
    queryKey: ["master-shipping-ports-filter", transportMode],
    queryFn: () => getActiveShippingPortsForDropdown(undefined, transportMode)
  });
  const houses = useQuery({
    queryKey: ["master-house-selector", customerId, fromDate, toDate, hawbSearch],
    queryFn: () => searchHouseShipments({ pageNumber: 1, pageSize: 500, customerId: customerId || undefined, search: hawbSearch || undefined }),
    enabled: loadMode === "house",
    staleTime: 0,
    refetchOnMount: "always",
  });
  const grnReceipts = useQuery({
    queryKey: ["master-grn-receipts", customerId, fromDate, toDate],
    queryFn: () => searchGoodsReceipts({ pageNumber: 1, pageSize: 500, customerId: customerId || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined }),
    enabled: loadMode === "grn",
    staleTime: 0,
    refetchOnMount: "always",
  });
  const grnGoods = useQuery({
    queryKey: ["master-grn-goods", customerId, fromDate, toDate],
    queryFn: () => getAvailableGoods(customerId || undefined),
    enabled: loadMode === "grn",
    staleTime: 0,
    refetchOnMount: "always",
  });
  const usedByKey = useMemo(() => {
    const map = new Map<string, { pieces: number; weight: number; volume: number }>();
    for (const x of existingAssignments) {
      if (x.loadMode !== "house") continue;
      const key = `${x.houseShipmentId}:${x.houseShipmentItemId}`;
      const prev = map.get(key) ?? { pieces: 0, weight: 0, volume: 0 };
      map.set(key, {
        pieces: prev.pieces + (x.consolidatedPieces ?? 0),
        weight: prev.weight + (x.consolidatedWeight ?? 0),
        volume: prev.volume + (x.consolidatedVolume ?? 0)
      });
    }
    return map;
  }, [existingAssignments]);

  const houseRows = useMemo(
    () =>
      (houses.data?.items ?? [])
        .filter((h) => {
          if (originPortGuid && h.originPortGuid !== originPortGuid) return false;
          if (destinationPortGuid && h.destinationPortGuid !== destinationPortGuid) return false;
          if (hawbSearch.trim()) {
            const needle = hawbSearch.trim().toLowerCase();
            const matched =
              (h.hawbNumber ?? "").toLowerCase().includes(needle) ||
              (h.houseShipmentNumber ?? "").toLowerCase().includes(needle);
            if (!matched) return false;
          }
          if (fromDate || toDate) {
            const base = h.etd ? new Date(h.etd) : null;
            if (!base || Number.isNaN(base.getTime())) return false;
            if (fromDate && base < new Date(fromDate)) return false;
            if (toDate) {
              const end = new Date(toDate);
              end.setHours(23, 59, 59, 999);
              if (base > end) return false;
            }
          }
          return true;
        })
        .flatMap((h) =>
        (h.items ?? []).flatMap((i) => {
          const availablePieces = Math.max(0, (i.loadedPieces ?? 0) - (usedByKey.get(`${h.id}:${i.id}`)?.pieces ?? 0));
          const availableWeight = Math.max(0, (i.loadedWeight ?? 0) - (usedByKey.get(`${h.id}:${i.id}`)?.weight ?? 0));
          const availableVolume = Math.max(0, (i.loadedVolume ?? 0) - (usedByKey.get(`${h.id}:${i.id}`)?.volume ?? 0));
          if (availablePieces <= 0) return [];
          return [{
            key: `${h.id}:${i.id}`,
            row: {
              loadMode: "house" as const,
              houseShipmentId: h.id,
              houseShipmentItemId: i.id,
              houseShipmentNumber: h.houseShipmentNumber,
              hawbNumber: h.hawbNumber ?? h.houseShipmentNumber,
              shipperName: h.shipperName ?? "",
              shipperAddress: h.shipperAddress ?? "",
              consigneeName: h.consigneeName ?? "",
              consigneeAddress: h.consigneeAddress ?? "",
              houseShipmentItemDescription: i.description ?? "",
              packageTypeId: (i as { packageTypeGuid?: string | null }).packageTypeGuid ?? null,
              packageTypeName: i.packageTypeName ?? "",
              hsCode: i.hsCode ?? "",
              countryOfOrigin: i.countryOfOrigin ?? "",
              length: i.length ?? 0,
              width: i.width ?? 0,
              height: i.height ?? 0,
              volumeCbm: i.volumeCbm ?? 0,
              consolidatedPieces: availablePieces,
              consolidatedWeight: availableWeight,
              consolidatedVolume: availableVolume,
              chargeableWeight: Math.max(availableWeight, availableVolume * 167),
              manualAllocatedCostAmount: 0,
            } satisfies AssignmentRow,
          }];
        }),
      ),
    [houses.data?.items, originPortGuid, destinationPortGuid, hawbSearch, fromDate, toDate, usedByKey],
  );

  const grnRows = useMemo(() => {
    const receipts = new Map((grnReceipts.data?.items ?? []).map((x) => [x.id, x] as const));
    return (grnGoods.data ?? []).flatMap((g) => {
      const receipt = receipts.get(g.goodsReceiptId);
      if (!receipt) return [];
      const key = `${g.goodsReceiptId}:${g.goodsReceiptItemId}`;
      return [{
        key,
        row: {
          loadMode: "grn" as const,
          goodsReceiptId: g.goodsReceiptId,
          goodsReceiptItemId: g.goodsReceiptItemId,
          houseShipmentId: g.goodsReceiptId,
          houseShipmentItemId: g.goodsReceiptItemId,
          houseShipmentNumber: g.goodsReceiptNumber,
          hawbNumber: g.goodsReceiptNumber,
          shipperName: "",
          shipperAddress: "",
          consigneeName: "",
          consigneeAddress: "",
          houseShipmentItemDescription: g.description ?? "",
          packageTypeId: g.packageTypeGuid ?? null,
          packageTypeName: g.packageTypeName ?? "",
          hsCode: g.hsCode ?? "",
          countryOfOrigin: g.countryOfOrigin ?? "",
          length: 0,
          width: 0,
          height: 0,
          volumeCbm: g.volumeCbm ?? 0,
          consolidatedPieces: Math.max(0, g.availablePieces ?? 0),
          consolidatedWeight: Math.max(0, g.receivedWeight ?? 0),
          consolidatedVolume: Math.max(0, g.volumeCbm ?? 0),
          chargeableWeight: Math.max(Math.max(0, g.receivedWeight ?? 0), Math.max(0, g.volumeCbm ?? 0) * 167),
          manualAllocatedCostAmount: 0,
        } satisfies AssignmentRow,
        receivedDateTime: receipt.receivedDateTime ?? "",
      }];
    });
  }, [grnGoods.data, grnReceipts.data?.items]);

  const rows = Object.values(selected);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!hideOtherModeSwitch ? (
            <>
              <Button type="button" size="sm" variant={loadMode === "house" ? "default" : "outline"} onClick={() => setLoadMode("house")}>{lt("Load From House")}</Button>
              <Button type="button" size="sm" variant={loadMode === "grn" ? "default" : "outline"} onClick={() => setLoadMode("grn")}>{lt("Load From GRN")}</Button>
            </>
          ) : (
            <Button type="button" size="sm" variant="default">
              {loadMode === "grn" ? lt("Load From GRN") : lt("Load From House")}
            </Button>
          )}
        </div>
        <Button type="button" variant="outline" onClick={() => onApply(rows, loadMode)}>{lt("Apply Selected")}</Button>
      </div>

      <select className="h-10 w-full rounded-md border px-3 text-sm" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        <option value="">{lt("All customers")}</option>
        {(customers.data?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.customerCode} - {x.customerName}</option>)}
      </select>
      {loadMode === "house" ? (
        <>
          <div className="grid gap-2 md:grid-cols-3">
            <select className="h-10 rounded-md border px-3 text-sm" value={originPortGuid} onChange={(e) => setOriginPortGuid(e.target.value)}>
              <option value="">{lt("All Origin Ports")}</option>
              {(shippingPorts.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.portCode} - {p.portName}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3 text-sm" value={destinationPortGuid} onChange={(e) => setDestinationPortGuid(e.target.value)}>
              <option value="">{lt("All Destination Ports")}</option>
              {(shippingPorts.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.portCode} - {p.portName}</option>)}
            </select>
            <Input value={hawbSearch} onChange={(e) => setHawbSearch(e.target.value)} placeholder={lt("Filter House Waybill No")} />
          </div>
        </>
      ) : null}
      <div className="grid gap-2 md:grid-cols-2">
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <div className="max-h-[65vh] overflow-x-auto overflow-y-auto rounded-md border">
        {loadMode === "house" ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="p-2">{lt("Select")}</th><th className="p-2 text-left">{lt("House Waybill No")}</th><th className="p-2 text-left">{lt("Shipper")}</th><th className="p-2 text-left">{lt("Consignee")}</th><th className="p-2 text-left">{lt("Package")}</th><th className="p-2 text-left">{lt("Country of Origin")}</th><th className="p-2 text-left">{lt("HS Code")}</th><th className="p-2 text-left">{lt("Available Pieces")}</th><th className="p-2 text-left">{lt("Loaded Weight")}</th><th className="p-2 text-left">{lt("Loaded Volume")}</th><th className="p-2 text-left">{lt("Select Pieces")}</th><th className="p-2 text-left">{lt("Calc Weight")}</th><th className="p-2 text-left">{lt("Calc Volume")}</th></tr></thead>
            <tbody>
              {houseRows.map(({ key, row }) => (
                <tr key={key} className="border-t">
                  <td className="p-2"><input type="checkbox" checked={Boolean(selected[key])} onChange={(e) => setSelected((p) => { const n = { ...p }; if (e.target.checked) n[key] = row; else delete n[key]; return n; })} /></td>
                  <td className="p-2">{row.hawbNumber}</td>
                  <td className="p-2">{row.shipperName}</td>
                  <td className="p-2">{row.consigneeName}</td>
                  <td className="p-2">{row.packageTypeName}</td>
                  <td className="p-2">{row.countryOfOrigin || "-"}</td>
                  <td className="p-2">{row.hsCode || "-"}</td>
                  <td className="p-2">{row.consolidatedPieces.toFixed(2)}</td>
                  <td className="p-2">{row.consolidatedWeight.toFixed(4)}</td>
                  <td className="p-2">{row.consolidatedVolume.toFixed(4)}</td>
                  <td className="p-2"><Input type="number" min={0} max={row.consolidatedPieces} value={selected[key]?.consolidatedPieces ?? row.consolidatedPieces} onChange={(e) => {
                    const nextPieces = Math.min(row.consolidatedPieces, Math.max(0, Number(e.target.value)));
                    const perPieceWeight = row.consolidatedPieces > 0 ? row.consolidatedWeight / row.consolidatedPieces : 0;
                    const perPieceVolume = row.consolidatedPieces > 0 ? row.consolidatedVolume / row.consolidatedPieces : 0;
                    const nextWeight = Number((nextPieces * perPieceWeight).toFixed(4));
                    const nextVolume = Number((nextPieces * perPieceVolume).toFixed(4));
                    const nextChargeable = Math.max(nextWeight, nextVolume * 167);
                    setSelected((p) => ({
                      ...p,
                      [key]: {
                        ...(p[key] ?? row),
                        consolidatedPieces: nextPieces,
                        consolidatedWeight: nextWeight,
                        consolidatedVolume: nextVolume,
                        chargeableWeight: Number(nextChargeable.toFixed(4))
                      }
                    }));
                  }} /></td>
                  <td className="p-2">{(selected[key]?.consolidatedWeight ?? row.consolidatedWeight).toFixed(4)}</td>
                  <td className="p-2">{(selected[key]?.consolidatedVolume ?? row.consolidatedVolume).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="p-2">{lt("Select")}</th><th className="p-2 text-left">{lt("GRN - Goods Received Note")}</th><th className="p-2 text-left">{lt("Date")}</th><th className="p-2 text-left">{lt("Package")}</th><th className="p-2 text-left">{lt("Country of Origin")}</th><th className="p-2 text-left">{lt("HS Code")}</th><th className="p-2 text-left">{lt("Available")}</th><th className="p-2 text-left">{lt("Load")}</th><th className="p-2 text-left">{lt("Weight")}</th><th className="p-2 text-left">{lt("Volume")}</th><th className="p-2 text-left">{lt("HAWB")}</th><th className="p-2 text-left">{lt("Shipper")}</th><th className="p-2 text-left">{lt("Shipper Address")}</th><th className="p-2 text-left">{lt("Consignee")}</th><th className="p-2 text-left">{lt("Consignee Address")}</th></tr></thead>
            <tbody>
              {grnRows.map(({ key, row, receivedDateTime }) => (
                <tr key={key} className="border-t">
                  <td className="p-2"><input type="checkbox" checked={Boolean(selected[key])} onChange={(e) => setSelected((p) => { const n = { ...p }; if (e.target.checked) n[key] = row; else delete n[key]; return n; })} /></td>
                  <td className="p-2">{row.houseShipmentNumber}</td>
                  <td className="p-2">{receivedDateTime ? new Date(receivedDateTime).toLocaleDateString() : "-"}</td>
                  <td className="p-2">{row.packageTypeName}</td>
                  <td className="p-2">{row.countryOfOrigin || "-"}</td>
                  <td className="p-2">{row.hsCode || "-"}</td>
                  <td className="p-2">{row.consolidatedPieces}</td>
                  <td className="p-2"><Input type="number" min={0} value={selected[key]?.consolidatedPieces ?? row.consolidatedPieces} onChange={(e) => {
                    const nextPieces = Math.max(0, Number(e.target.value));
                    const base = pOrRow(selected[key], row);
                    const perPieceWeight = row.consolidatedPieces > 0 ? row.consolidatedWeight / row.consolidatedPieces : 0;
                    const perPieceVolume = row.consolidatedPieces > 0 ? row.consolidatedVolume / row.consolidatedPieces : 0;
                    const nextWeight = Number((nextPieces * perPieceWeight).toFixed(4));
                    const nextVolume = Number((nextPieces * perPieceVolume).toFixed(4));
                    const nextChargeable = Math.max(nextWeight, nextVolume * 167);
                    setSelected((p) => ({
                      ...p,
                      [key]: {
                        ...base,
                        consolidatedPieces: nextPieces,
                        consolidatedWeight: nextWeight,
                        consolidatedVolume: nextVolume,
                        chargeableWeight: Number(nextChargeable.toFixed(4))
                      }
                    }));
                  }} /></td>
                  <td className="p-2">{(selected[key]?.consolidatedWeight ?? row.consolidatedWeight).toFixed(4)}</td>
                  <td className="p-2">{(selected[key]?.consolidatedVolume ?? row.consolidatedVolume).toFixed(4)}</td>
                  <td className="p-2"><Input value={selected[key]?.hawbNumber ?? row.hawbNumber ?? ""} onChange={(e) => setSelected((p) => ({ ...p, [key]: { ...(p[key] ?? row), hawbNumber: e.target.value } }))} /></td>
                  <td className="p-2"><Input value={selected[key]?.shipperName ?? row.shipperName ?? ""} onChange={(e) => setSelected((p) => ({ ...p, [key]: { ...(p[key] ?? row), shipperName: e.target.value } }))} /></td>
                  <td className="p-2">
                    <textarea
                      className="min-h-[72px] w-full rounded-md border px-3 py-2 text-sm"
                      value={selected[key]?.shipperAddress ?? row.shipperAddress ?? ""}
                      onChange={(e) => setSelected((p) => ({ ...p, [key]: { ...(p[key] ?? row), shipperAddress: e.target.value } }))}
                    />
                  </td>
                  <td className="p-2"><Input value={selected[key]?.consigneeName ?? row.consigneeName ?? ""} onChange={(e) => setSelected((p) => ({ ...p, [key]: { ...(p[key] ?? row), consigneeName: e.target.value } }))} /></td>
                  <td className="p-2">
                    <textarea
                      className="min-h-[72px] w-full rounded-md border px-3 py-2 text-sm"
                      value={selected[key]?.consigneeAddress ?? row.consigneeAddress ?? ""}
                      onChange={(e) => setSelected((p) => ({ ...p, [key]: { ...(p[key] ?? row), consigneeAddress: e.target.value } }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function pOrRow(current: AssignmentRow | undefined, fallback: AssignmentRow): AssignmentRow {
  return current ?? fallback;
}
