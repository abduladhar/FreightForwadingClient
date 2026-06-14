import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, UploadCloud } from "lucide-react";
import { getShipmentDocuments } from "@/api/documentApi";
import type { CustomsDocumentDto } from "@/api/customsApi";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

type CustomsDocumentChecklistAttachmentsProps = {
  rows: CustomsDocumentDto[];
};

export function CustomsDocumentChecklistAttachments({ rows }: CustomsDocumentChecklistAttachmentsProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="font-semibold">{lt("Checklist Document Attachments")}</h3>
          <p className="text-xs text-muted-foreground">{lt("Attach files against the exact customs checklist document row. Each row keeps its own uploaded documents.")}</p>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-10 border-b px-3 py-2" />
                <th className="border-b px-3 py-2 text-left font-semibold">{lt("Category")}</th>
                <th className="border-b px-3 py-2 text-left font-semibold">{lt("Document Name")}</th>
                <th className="border-b px-3 py-2 text-left font-semibold">{lt("Required")}</th>
                <th className="border-b px-3 py-2 text-left font-semibold">{lt("Received")}</th>
                <th className="border-b px-3 py-2 text-left font-semibold">{lt("Remarks")}</th>
                <th className="border-b px-3 py-2 text-center font-semibold">{lt("Attachments")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((row) => <ChecklistAttachmentRow key={row.id} row={row} />) : (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">{lt("Add customs document checklist rows first, then attach files to each document.")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ChecklistAttachmentRow({ row }: { row: CustomsDocumentDto }) {
  const [isOpen, setIsOpen] = useState(false);
  const documents = useQuery({
    queryKey: ["documents", "CustomsClearanceDocument", row.id],
    queryFn: () => getShipmentDocuments("CustomsClearanceDocument", row.id),
    enabled: Boolean(row.id)
  });

  return (
    <>
      <tr className="border-b">
        <td className="px-3 py-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen((current) => !current)}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </td>
        <td className="px-3 py-2">{row.documentCategory}</td>
        <td className="px-3 py-2">
          <p className="font-medium">{row.documentName}</p>
          {row.fileName ? <p className="text-xs text-muted-foreground">{row.fileName}</p> : null}
        </td>
        <td className="px-3 py-2">{row.isRequired ? lt("Yes") : lt("No")}</td>
        <td className="px-3 py-2">{row.isReceived || (documents.data?.length ?? 0) > 0 ? lt("Yes") : lt("No")}</td>
        <td className="px-3 py-2">{row.remarks || "-"}</td>
        <td className="px-3 py-2 text-center">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen((current) => !current)}>
            <UploadCloud className="h-4 w-4" />
            {(documents.data?.length ?? 0)} file(s)
          </Button>
        </td>
      </tr>
      {isOpen ? (
        <tr>
          <td colSpan={7} className="bg-slate-50 px-3 py-4">
            <DocumentUploadPanel
              moduleName="CustomsClearanceDocument"
              entityId={row.id}
              title={`Attach Files - ${row.documentName}`}
              defaultDocumentName={row.documentName || "Customs Document"}
              defaultDocumentCategory={row.documentCategory || "Customs Clearance"}
              description={lt("These files are attached to this checklist document row only.")}
              emptyText="No files uploaded for this checklist document."
              documents={documents.data ?? []}
              onRefresh={() => void documents.refetch()}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function CustomsDocumentRowAttachmentPanel({ row }: { row: CustomsDocumentDto }) {
  const documents = useQuery({
    queryKey: ["documents", "CustomsClearanceDocument", row.id],
    queryFn: () => getShipmentDocuments("CustomsClearanceDocument", row.id),
    enabled: Boolean(row.id)
  });

  return (
    <DocumentUploadPanel
      moduleName="CustomsClearanceDocument"
      entityId={row.id}
      title={`Attach Files - ${row.documentName}`}
      defaultDocumentName={row.documentName || "Customs Document"}
      defaultDocumentCategory={row.documentCategory || "Customs Clearance"}
      description={lt("These files are attached to this checklist document row only.")}
      emptyText="No files uploaded for this checklist document."
      documents={documents.data ?? []}
      onRefresh={() => void documents.refetch()}
    />
  );
}
