import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getDocumentDownloadUrl, getShipmentDocuments } from "@/api/documentApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DocumentPreviewPage() {
  const [params] = useSearchParams();
  const module = (params.get("module") as "HouseShipment" | "DirectShipment" | "MasterShipment" | "CustomsClearance") ?? "CustomsClearance";
  const ownerId = params.get("ownerId") ?? "";
  const documentId = params.get("documentId") ?? "";
  const query = useQuery({ queryKey: ["documents", module, ownerId], queryFn: () => getShipmentDocuments(module, ownerId), enabled: Boolean(ownerId) });
  const doc = (query.data ?? []).find((x) => x.id === documentId);
  return <div className="space-y-4"><PageHeader title="Document Preview" description="Preview attached document metadata and open a signed download URL." /><Card><CardContent className="space-y-2 pt-6 text-sm"><p>Module: {module}</p><p>Owner Id: {ownerId}</p><p>Document: {doc?.documentName ?? "-"}</p><p>Original File: {doc?.originalFileName ?? "-"}</p><p>S3 Object Key: {doc?.objectKey ?? "-"}</p><p>Status: {doc?.status ?? "-"}</p>{doc ? <Button onClick={() => void getDocumentDownloadUrl(doc.id).then((signed) => window.location.assign(signed.downloadUrl))}>Download</Button> : null}</CardContent></Card></div>;
}
