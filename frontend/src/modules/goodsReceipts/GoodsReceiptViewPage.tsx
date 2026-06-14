import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Download, FilePlus2, FileText, Pencil, Printer, QrCode, Receipt, Trash2, UploadCloud } from "lucide-react";
import { completeDocumentUpload, createSignedDocumentUpload, deleteDocument, getDocumentDownloadUrl, getShipmentDocuments, uploadDocumentToSignedUrl, type DocumentRecord } from "@/api/documentApi";
import { getAvailableGoods, getGoodsReceipt } from "@/api/goodsReceiptApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useRef, useState } from "react";
import { lt } from "@/modules/operationsLocalization";

export function GoodsReceiptViewPage() {
  const { goodsReceiptId } = useParams();
  const query = useQuery({ queryKey: ["goods-receipt", goodsReceiptId], queryFn: () => getGoodsReceipt(goodsReceiptId!), enabled: Boolean(goodsReceiptId) });
  const available = useQuery({ queryKey: ["goods-available", query.data?.customerId], queryFn: () => getAvailableGoods(query.data?.customerId), enabled: Boolean(query.data?.customerId) });
  const documents = useQuery({ queryKey: ["documents", "GoodsReceipt", goodsReceiptId], queryFn: () => getShipmentDocuments("GoodsReceipt", goodsReceiptId!), enabled: Boolean(goodsReceiptId) });
  if (!goodsReceiptId) return <Navigate to="/goods-receipts" replace />;
  const receipt = query.data;
  return <div className="space-y-4"><PageHeader title={receipt?.goodsReceiptNumber ?? lt("Goods Receipt Note")} description={receipt?.receivedFrom ?? ""} actions={<><AuditTrailButton />{receipt ? <PermissionButton asChild permission="Invoice.Read"><Link to={`/goods-receipts/${goodsReceiptId}/invoices`}><Receipt className="h-4 w-4" />{lt("Show Invoices")}</Link></PermissionButton> : null}{receipt ? <PermissionButton asChild permission="Invoice.Create"><Link to={`/invoices/new?sourceType=GoodsReceipt&sourceId=${goodsReceiptId}&customerId=${receipt.customerId}`}><Receipt className="h-4 w-4" />{lt("Create Invoice")}</Link></PermissionButton> : null}{receipt ? <PermissionButton asChild permission="VendorBill.Read"><Link to={`/goods-receipts/${goodsReceiptId}/bills`}><FileText className="h-4 w-4" />{lt("Show Bills")}</Link></PermissionButton> : null}{receipt ? <PermissionButton asChild permission="VendorBill.Create"><Link to={`/vendor-bills/new?sourceType=GoodsReceipt&sourceId=${goodsReceiptId}&expectedCostAmount=0`}><FilePlus2 className="h-4 w-4" />{lt("Create Bill")}</Link></PermissionButton> : null}<PermissionButton asChild permission="GoodsReceipt.Update"><Link to={`/goods-receipts/${goodsReceiptId}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton><PermissionButton asChild permission="GoodsReceipt.Print"><Link to={`/goods-receipts/${goodsReceiptId}/note`}><Printer className="h-4 w-4" />{lt("Print Goods Receipt Note")}</Link></PermissionButton><PermissionButton asChild permission="GoodsReceipt.Print"><Link to={`/goods-receipts/${goodsReceiptId}/labels`}><QrCode className="h-4 w-4" />{lt("Labels")}</Link></PermissionButton></>} />{receipt ? <><Card><CardContent className="grid gap-3 pt-6 md:grid-cols-3"><Field label={lt("Status")}><StatusBadge status={receipt.status} /></Field><Field label={lt("Received Date")}>{receipt.receivedDateTime}</Field><Field label={lt("Warehouse Location")}>{receipt.warehouseLocation ?? "-"}</Field><Field label={lt("Remarks")}>{receipt.remarks ?? "-"}</Field></CardContent></Card><Card><CardContent className="pt-6"><h3 className="mb-2 font-medium">{lt("Goods Items")}</h3><div className="space-y-2">{receipt.items.map((x) => <div key={x.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{x.packageTypeCode ? `${x.packageTypeCode} - ${x.packageTypeName}` : x.packageTypeName}</p><p>{x.description}</p><p className="text-muted-foreground">{lt("Packages")} {x.receivedPieces} | {lt("Gross Weight")} {x.receivedWeight} | {lt("Volume")} {x.volumeCbm.toFixed(3)}</p><p className="text-muted-foreground">{lt("Available")} {x.availablePieces} | {lt("Shipped")} {x.shippedPieces} | {lt("Damaged")} {x.damagedPieces} | {lt("Returned")} {x.returnedPieces}</p>{x.availablePieces <= 0 ? <p className="text-red-600">{lt("Over-shipment prevention: no available quantity remaining.")}</p> : null}</div>)}</div></CardContent></Card><GoodsReceiptDocumentsPanel goodsReceiptId={goodsReceiptId} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} /><Card><CardContent className="pt-6"><h3 className="mb-2 font-medium">{lt("Available Quantity Lookup")}</h3><div className="space-y-1 text-sm">{(available.data ?? []).map((x) => <p key={x.goodsReceiptItemId}>{x.goodsReceiptNumber}: {x.packageTypeCode ? `${x.packageTypeCode} - ${x.packageTypeName} - ` : ""}{x.description} - {lt("Available")} {x.availablePieces}</p>)}</div></CardContent></Card></> : <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading goods receipt...")}</CardContent></Card>}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><div className="font-medium">{children}</div></div>;
}

function GoodsReceiptDocumentsPanel({ goodsReceiptId, documents, onRefresh }: { goodsReceiptId: string; documents: DocumentRecord[]; onRefresh: () => void }) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documentName, setDocumentName] = useState("Goods Receipt Document");
  const [documentCategory, setDocumentCategory] = useState("Goods Receipt");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadSelectedFile() {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(0);
    try {
      const signed = await createSignedDocumentUpload({
        moduleName: "GoodsReceipt",
        entityId: goodsReceiptId,
        documentCategory,
        documentName: documentName || selectedFile.name,
        originalFileName: selectedFile.name,
        contentType: selectedFile.type || "application/octet-stream",
        fileSizeBytes: selectedFile.size,
        remarks: null
      });
      await uploadDocumentToSignedUrl(signed.uploadUrl, selectedFile, setProgress);
      await completeDocumentUpload(signed.document.id, selectedFile.size);
      toast.success(lt("Document uploaded"), selectedFile.name);
      setSelectedFile(null);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : lt("Document upload failed.");
      toast.error(lt("Upload failed"), message);
    } finally {
      setIsUploading(false);
    }
  }

  async function downloadDocument(document: DocumentRecord) {
    const signed = await getDocumentDownloadUrl(document.id);
    window.location.assign(signed.downloadUrl);
  }

  async function removeDocument(document: DocumentRecord) {
    await deleteDocument(document.id);
    toast.success(lt("Document deleted"), document.originalFileName);
    onRefresh();
  }

  return <Card>
    <CardContent className="space-y-5 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700"><UploadCloud className="h-4 w-4" /></span>
          <div>
            <h3 className="font-semibold">{lt("Documents")}</h3>
            <p className="text-xs text-muted-foreground">{lt("Upload one document at a time. Files are stored in S3 with signed upload and download URLs.")}</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{documents.length} {lt("file(s)")}</span>
      </div>

      <div className="rounded-lg border bg-slate-50 p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr_auto]">
          <div className="space-y-1">
            <Label>{lt("Document Name")}</Label>
            <Input value={documentName} onChange={(event) => setDocumentName(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{lt("Document Category")}</Label>
            <Input value={documentCategory} onChange={(event) => setDocumentCategory(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{lt("Select File")}</Label>
            <Input ref={fileInputRef} type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
            {selectedFile ? <p className="truncate text-xs text-muted-foreground">{selectedFile.name} - {(selectedFile.size / 1024).toFixed(0)} KB</p> : null}
          </div>
          <div className="flex items-end">
            <PermissionButton permission="DocumentManagement.Create" disabled={!selectedFile || isUploading} onClick={() => void uploadSelectedFile()}>
              <UploadCloud className="h-4 w-4" /> {isUploading ? lt("Uploading...") : lt("Upload")}
            </PermissionButton>
          </div>
        </div>
        {isUploading ? <div className="mt-3 h-2 overflow-hidden rounded bg-white"><div className="h-full rounded bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div> : null}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="border-b bg-slate-50 px-3 py-2 text-left font-semibold">{lt("Document")}</th>
              <th className="border-b bg-slate-50 px-3 py-2 text-left font-semibold">{lt("Category")}</th>
              <th className="border-b bg-slate-50 px-3 py-2 text-left font-semibold">{lt("Uploaded")}</th>
              <th className="border-b bg-slate-50 px-3 py-2 text-center font-semibold">{lt("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {documents.length ? documents.map((document) => <tr key={document.id}>
              <td className="border-b px-3 py-2">
                <p className="font-medium">{document.documentName}</p>
                <p className="max-w-md truncate text-xs text-muted-foreground">{document.originalFileName}</p>
              </td>
              <td className="border-b px-3 py-2">{document.documentCategory}</td>
              <td className="border-b px-3 py-2">{document.uploadedDate ? new Date(document.uploadedDate).toLocaleString() : document.status}</td>
              <td className="border-b px-3 py-2">
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => void downloadDocument(document)}><Download className="h-4 w-4" />{lt("Download")}</Button>
                  <ConfirmDialog title={lt("Delete document?")} description={`${lt("Remove")} ${document.originalFileName} ${lt("from this goods receipt note?")}`} confirmText={lt("Delete")} variant="danger" onConfirm={() => removeDocument(document)}>
                    <PermissionButton permission="DocumentManagement.Delete" variant="destructive" size="sm"><Trash2 className="h-4 w-4" />{lt("Delete")}</PermissionButton>
                  </ConfirmDialog>
                </div>
              </td>
            </tr>) : <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">{lt("No documents uploaded for this goods receipt note.")}</td></tr>}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>;
}
