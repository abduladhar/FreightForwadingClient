import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/utils/cn";

export function DocumentDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const dropzone = useDropzone({
    multiple: true,
    onDrop: onFiles
  });

  return (
    <div
      {...dropzone.getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-6 text-center transition hover:bg-slate-100",
        dropzone.isDragActive && "border-primary bg-blue-50"
      )}
    >
      <input {...dropzone.getInputProps()} />
      <UploadCloud className="mb-3 h-8 w-8 text-blue-600" />
      <p className="text-sm font-medium">Drop shipment documents or click to upload</p>
      <p className="mt-1 text-xs text-muted-foreground">Commercial invoice, packing list, POD, customs files</p>
    </div>
  );
}
