import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { addCourierPiece, getCourier, updateCourierPieceScan } from "@/api/freightApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { PageHeader } from "@/components/PageHeader";
import { PermissionButton } from "@/auth/PermissionButton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function CourierPieceTrackingPage() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const toast = useToast();
  const query = useQuery({ queryKey: ["courier", id], queryFn: () => getCourier(id), enabled: Boolean(id) });
  const addMutation = useMutation({ mutationFn: (payload: { pieceNumber: string; barcode: string; remarks?: string }) => addCourierPiece(id, payload) });
  const scanMutation = useMutation({ mutationFn: (payload: { pieceId: string; scanStatus: string; lastScanLocation?: string; remarks?: string }) => updateCourierPieceScan(id, payload.pieceId, payload) });
  const [piece, setPiece] = useState({ pieceNumber: "", barcode: "", remarks: "" });
  const [scan, setScan] = useState({ pieceId: "", scanStatus: "Loading", lastScanLocation: "", remarks: "" });
  return <div className="space-y-4">
    <PageHeader title="Courier Piece Tracking" description="Piece-level barcode tracking and delivery scan updates." actions={<AuditTrailButton />} />
    <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-4">
      <Input placeholder="Piece Number" value={piece.pieceNumber} onChange={(e) => setPiece({ ...piece, pieceNumber: e.target.value })} />
      <Input placeholder="Barcode Scan Input" value={piece.barcode} onChange={(e) => setPiece({ ...piece, barcode: e.target.value })} />
      <Input placeholder="Remarks" value={piece.remarks} onChange={(e) => setPiece({ ...piece, remarks: e.target.value })} />
      <PermissionButton permission="Courier.Update" onClick={() => void addMutation.mutateAsync(piece).then(() => { setPiece({ pieceNumber: "", barcode: "", remarks: "" }); void query.refetch(); toast.success("Added", "Courier piece added."); })}>Add Piece</PermissionButton>
    </div>
    <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-5">
      <select className="h-10 rounded-md border px-3 text-sm" value={scan.pieceId} onChange={(e) => setScan({ ...scan, pieceId: e.target.value })}><option value="">Select piece</option>{(query.data?.pieces ?? []).map((x) => <option key={x.id} value={x.id}>{x.pieceNumber}</option>)}</select>
      <Input placeholder="Scan Status" value={scan.scanStatus} onChange={(e) => setScan({ ...scan, scanStatus: e.target.value })} />
      <Input placeholder="Last Scan Location" value={scan.lastScanLocation} onChange={(e) => setScan({ ...scan, lastScanLocation: e.target.value })} />
      <Input placeholder="Remarks" value={scan.remarks} onChange={(e) => setScan({ ...scan, remarks: e.target.value })} />
      <PermissionButton permission="Courier.Update" disabled={!scan.pieceId} onClick={() => void scanMutation.mutateAsync(scan).then(() => { void query.refetch(); toast.success("Updated", "Piece scan updated."); })}>Update Scan</PermissionButton>
    </div>
    <div className="space-y-2">{(query.data?.pieces ?? []).map((x) => <div key={x.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{x.pieceNumber} ({x.barcode})</p><p className="text-muted-foreground">Status {x.scanStatus} | Location {x.lastScanLocation ?? "-"} | Last Scan {x.lastScanTime ?? "-"}</p></div>)}</div>
  </div>;
}
