import { useEffect, useRef, useState } from "react";
import { Download, Trash2, UploadCloud } from "lucide-react";
import { completeDocumentUpload, createSignedDocumentUpload, deleteDocument, getDocumentDownloadUrl, uploadDocumentToSignedUrl, type DocumentModule, type DocumentRecord } from "@/api/documentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

type DocumentUploadPanelProps = {
  moduleName: DocumentModule;
  entityId: string;
  title?: string;
  description?: string;
  defaultDocumentName?: string;
  defaultDocumentCategory?: string;
  emptyText?: string;
  createPermission?: string;
  deletePermission?: string;
  documents: DocumentRecord[];
  onRefresh: () => void;
};

export function DocumentUploadPanel({
  moduleName,
  entityId,
  title = "Documents",
  description = "Upload one document at a time. Files are stored in S3 with signed upload and download URLs.",
  defaultDocumentName = "Document",
  defaultDocumentCategory = "General",
  emptyText = "No documents uploaded.",
  createPermission = "DocumentManagement.Create",
  deletePermission = "DocumentManagement.Delete",
  documents,
  onRefresh
}: DocumentUploadPanelProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documentName, setDocumentName] = useState(defaultDocumentName);
  const [documentCategory, setDocumentCategory] = useState(defaultDocumentCategory);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const previousDefaultsRef = useRef({ documentName: defaultDocumentName, documentCategory: defaultDocumentCategory });

  useEffect(() => {
    setDocumentName((current) => current === previousDefaultsRef.current.documentName ? defaultDocumentName : current);
    setDocumentCategory((current) => current === previousDefaultsRef.current.documentCategory ? defaultDocumentCategory : current);
    previousDefaultsRef.current = { documentName: defaultDocumentName, documentCategory: defaultDocumentCategory };
  }, [defaultDocumentName, defaultDocumentCategory]);

  async function uploadSelectedFile() {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(0);
    try {
      const signed = await createSignedDocumentUpload({
        moduleName,
        entityId,
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

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700"><UploadCloud className="h-4 w-4" /></span>
            <div>
              <h3 className="font-semibold">{lt(title)}</h3>
              <p className="text-xs text-muted-foreground">{lt(description)}</p>
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
              <Input ref={fileInputRef} className="sr-only" type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
              <div className="flex min-h-10 items-center gap-2 rounded-md border border-[var(--app-border-color)] bg-white px-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>{lt("Choose File")}</Button>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{selectedFile ? selectedFile.name : lt("No file chosen")}</span>
              </div>
              {selectedFile ? <p className="truncate text-xs text-muted-foreground">{selectedFile.name} - {(selectedFile.size / 1024).toFixed(0)} KB</p> : null}
            </div>
            <div className="flex items-end">
              <PermissionButton permission={createPermission} disabled={!selectedFile || isUploading} onClick={() => void uploadSelectedFile()}>
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
                <th className="border-b bg-slate-50 px-3 py-2 text-start font-semibold">{lt("Document")}</th>
                <th className="border-b bg-slate-50 px-3 py-2 text-start font-semibold">{lt("Category")}</th>
                <th className="border-b bg-slate-50 px-3 py-2 text-start font-semibold">{lt("Uploaded")}</th>
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
                    <Button variant="outline" size="sm" onClick={() => void downloadDocument(document)}><Download className="h-4 w-4" /> {lt("Download")}</Button>
                    <ConfirmDialog title={lt("Delete document?")} description={`${lt("Remove")} ${document.originalFileName}?`} confirmText={lt("Delete")} variant="danger" onConfirm={() => removeDocument(document)}>
                      <PermissionButton permission={deletePermission} variant="destructive" size="sm"><Trash2 className="h-4 w-4" /> {lt("Delete")}</PermissionButton>
                    </ConfirmDialog>
                  </div>
                </td>
              </tr>) : <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">{lt(emptyText)}</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
