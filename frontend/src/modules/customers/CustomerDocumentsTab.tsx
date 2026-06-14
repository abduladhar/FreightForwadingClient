import { useState } from "react";
import { useI18n } from "@/app/i18n";
import type { DocumentDto } from "@/api/customerApi";
import { FileUploader } from "@/components/common/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerButtonClass } from "@/modules/customers/customerUi";

export function CustomerDocumentsTab({ value, onChange }: { value: DocumentDto[]; onChange: (next: DocumentDto[]) => void }) {
  const { t } = useI18n();
  const [pendingName, setPendingName] = useState("");
  return (
    <div className="space-y-3">
      <FileUploader onChange={(files) => {
        if (!files.length) return;
        const next = [...value];
        files.forEach((file) => next.push({ documentType: "Attachment", documentName: pendingName || file.name, documentReference: file.name, expiryDate: null }));
        onChange(next);
      }} />
      <Input placeholder={t("Customer.DocumentDisplayNameOptional", "Document display name (optional)")} value={pendingName} onChange={(e) => setPendingName(e.target.value)} />
      <div className="space-y-2">
        {value.map((doc, index) => (
          <div key={index} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span>{doc.documentName} ({doc.documentType})</span>
            <Button className={customerButtonClass} type="button" variant="ghost" onClick={() => onChange(value.filter((_, i) => i !== index))}>{t("Common.Remove", "Remove")}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
