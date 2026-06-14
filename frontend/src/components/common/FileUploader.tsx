import { File as FileIcon, FileX, UploadCloud, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PermissionButton } from "@/auth/PermissionButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface UploadFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  previewUrl?: string;
  file?: globalThis.File;
}

interface FileUploaderProps {
  accept?: Record<string, string[]>;
  maxSizeBytes?: number;
  multiple?: boolean;
  canDeletePermission?: string;
  onUpload?: (file: globalThis.File, onProgress: (progress: number) => void) => Promise<void>;
  onChange?: (files: UploadFileItem[]) => void;
}

export function FileUploader({
  accept,
  maxSizeBytes = 10 * 1024 * 1024,
  multiple = true,
  canDeletePermission = "DocumentManagement.Delete",
  onUpload,
  onChange
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [rejectionMessages, setRejectionMessages] = useState<string[]>([]);

  function updateFiles(next: UploadFileItem[]) {
    setFiles(next);
    onChange?.(next);
  }

  function updateByUpdater(updater: (current: UploadFileItem[]) => UploadFileItem[]) {
    setFiles((current) => {
      const next = updater(current);
      onChange?.(next);
      return next;
    });
  }

  const dropzone = useDropzone({
    accept,
    maxSize: maxSizeBytes,
    multiple,
    onDrop: async (acceptedFiles) => {
      setRejectionMessages([]);
      const nextItems = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        file
      }));

      updateByUpdater((current) => [...current, ...nextItems]);

      for (const item of nextItems) {
        if (!item.file) continue;
        if (onUpload) {
          await onUpload(item.file, (progress) => {
            updateByUpdater((current) => current.map((file) => (file.id === item.id ? { ...file, progress } : file)));
          });
        } else {
          for (let progress = 20; progress <= 100; progress += 20) {
            await new Promise((resolve) => setTimeout(resolve, 60));
            updateByUpdater((current) => current.map((file) => (file.id === item.id ? { ...file, progress } : file)));
          }
        }
      }
    },
    onDropRejected: (rejections) => {
      const messages = rejections.flatMap((rejection) =>
        rejection.errors.map((error) => `${rejection.file.name}: ${error.message}`)
      );
      setRejectionMessages(messages);
    }
  });

  const validationSummary = useMemo(() => {
    const types = accept ? Object.keys(accept).join(", ") : "all file types";
    return `Allowed: ${types} • Max size ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB`;
  }, [accept, maxSizeBytes]);

  function removeFile(fileId: string) {
    const item = files.find((file) => file.id === fileId);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    updateFiles(files.filter((file) => file.id !== fileId));
  }

  return (
    <div className="space-y-3">
      <div
        {...dropzone.getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-6 text-center transition hover:bg-slate-100",
          dropzone.isDragActive && "border-primary bg-blue-50"
        )}
      >
        <input {...dropzone.getInputProps()} />
        <UploadCloud className="mb-3 h-8 w-8 text-blue-600" />
        <p className="text-sm font-medium">Drag and drop documents or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">{validationSummary}</p>
      </div>

      <div className="space-y-2">
        {rejectionMessages.length ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {rejectionMessages.map((message, index) => (
              <p key={`${message}-${index}`}>{message}</p>
            ))}
          </div>
        ) : null}
        {files.map((item) => (
          <div key={item.id} className="rounded-lg border bg-white p-3">
            <div className="flex items-start gap-3">
              {item.previewUrl ? (
                <img src={item.previewUrl} alt={item.name} className="h-12 w-12 rounded object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100">
                  <FileIcon className="h-5 w-5 text-slate-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{(item.size / 1024).toFixed(0)} KB</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-100">
                  <div className="h-full rounded bg-blue-600 transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
              <PermissionButton permission={canDeletePermission} variant="ghost" size="icon" onClick={() => removeFile(item.id)}>
                <X className="h-4 w-4" />
              </PermissionButton>
            </div>
          </div>
        ))}
        {!files.length ? (
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <FileX className="h-4 w-4" /> No files uploaded yet.
          </div>
        ) : null}
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => dropzone.open()}>Add Files</Button>
      </div>
    </div>
  );
}
