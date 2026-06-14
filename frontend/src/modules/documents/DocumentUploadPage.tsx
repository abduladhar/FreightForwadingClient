import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { completeDocumentUpload, createSignedDocumentUpload, uploadDocumentToSignedUrl, type DocumentModule } from "@/api/documentApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { FileUploader } from "@/components/common/FileUploader";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function DocumentUploadPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const module = (params.get("module") as DocumentModule) ?? "CustomsClearance";
  const ownerId = params.get("ownerId") ?? "";
  const [documentName, setDocumentName] = useState("Document");
  const [documentCategory, setDocumentCategory] = useState("General");
  const [uploadedCount, setUploadedCount] = useState(0);

  async function upload(file: File, onProgress: (progress: number) => void) {
    const signed = await createSignedDocumentUpload({
      moduleName: module,
      entityId: ownerId,
      documentCategory,
      documentName: documentName || file.name,
      originalFileName: file.name,
      contentType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
      remarks: null
    });
    await uploadDocumentToSignedUrl(signed.uploadUrl, file, onProgress);
    await completeDocumentUpload(signed.document.id, file.size);
    setUploadedCount((current) => current + 1);
    toast.success("Document uploaded", file.name);
  }

  return <div className="space-y-4">
    <PageHeader title="Upload Document" description="Upload files to S3 using a short-lived signed URL. Original file name is preserved in ERP metadata." />
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Document Name</Label>
          <Input value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="Document Name" />
        </div>
        <div className="space-y-1">
          <Label>Document Category</Label>
          <Input value={documentCategory} onChange={(e) => setDocumentCategory(e.target.value)} placeholder="General" />
        </div>
      </div>
      <FileUploader multiple onUpload={upload} />
      {uploadedCount ? <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" /> {uploadedCount} document(s) uploaded.</div> : null}
      <div className="flex justify-end">
        <PermissionButton permission="DocumentManagement.Read" disabled={!ownerId} onClick={() => navigate(`/documents?module=${module}&ownerId=${ownerId}`)}>Back to Documents</PermissionButton>
      </div>
    </div>
  </div>;
}
