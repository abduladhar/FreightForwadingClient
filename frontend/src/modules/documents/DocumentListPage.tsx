import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { deleteDocument, getDocumentDownloadUrl, getShipmentDocuments } from "@/api/documentApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DocumentList } from "@/components/common/DocumentList";
import { PageHeader } from "@/components/PageHeader";

export function DocumentListPage() {
  const [params] = useSearchParams();
  const module = (params.get("module") as "HouseShipment" | "DirectShipment" | "MasterShipment" | "CustomsClearance") ?? "CustomsClearance";
  const ownerId = params.get("ownerId") ?? "";
  const query = useQuery({ queryKey: ["documents", module, ownerId], queryFn: () => getShipmentDocuments(module, ownerId), enabled: Boolean(ownerId) });
  return <div className="space-y-4"><PageHeader title="Documents" description="Upload, preview, and manage attached documents." actions={<><AuditTrailButton />{ownerId ? <Link className="rounded-md border px-3 py-2 text-sm" to={`/documents/upload?module=${module}&ownerId=${ownerId}`}>Upload</Link> : null}</>} /><DocumentList
    items={(query.data ?? []).map((x) => ({ id: x.id, name: `${x.documentName} (${x.originalFileName})`, uploadedAt: x.uploadedDate ? new Date(x.uploadedDate).toLocaleString() : x.status }))}
    onPreview={(x) => window.location.assign(`/documents/preview?module=${module}&ownerId=${ownerId}&documentId=${x.id}`)}
    onDownload={(x) => void getDocumentDownloadUrl(x.id).then((signed) => window.location.assign(signed.downloadUrl))}
    onDelete={(x) => void deleteDocument(x.id).then(() => query.refetch())}
  /></div>;
}
