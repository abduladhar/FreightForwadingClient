import { Download, Eye, FileText, Trash2 } from "lucide-react";
import { PermissionButton } from "@/auth/PermissionButton";
import { Button } from "@/components/ui/button";

export interface DocumentListItem {
  id: string;
  name: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export function DocumentList({
  items,
  onPreview,
  onDownload,
  onDelete
}: {
  items: DocumentListItem[];
  onPreview?: (item: DocumentListItem) => void;
  onDownload?: (item: DocumentListItem) => void;
  onDelete?: (item: DocumentListItem) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
          <FileText className="h-4 w-4 text-slate-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.uploadedBy ?? "-"} {item.uploadedAt ? `• ${item.uploadedAt}` : ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onPreview?.(item)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDownload?.(item)}><Download className="h-4 w-4" /></Button>
          <PermissionButton permission="DocumentManagement.Delete" variant="ghost" size="icon" onClick={() => onDelete?.(item)}>
            <Trash2 className="h-4 w-4" />
          </PermissionButton>
        </div>
      ))}
      {!items.length ? <p className="p-6 text-sm text-muted-foreground">No documents available.</p> : null}
    </div>
  );
}
