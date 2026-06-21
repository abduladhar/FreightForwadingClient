import { useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { blobToBase64Content, saveEmailPdfDraft } from "@/utils/emailPdfDraft";
import { lt } from "@/modules/operationsLocalization";

export function EmailPdfReportButton({
  fileName,
  subject,
  reportName,
  module,
  body,
  defaultEmail,
  createPdfBlob
}: {
  fileName: string;
  subject: string;
  reportName: string;
  module: string;
  body?: string;
  defaultEmail?: string | null;
  createPdfBlob: () => Promise<Blob>;
}) {
  const [isPreparing, setIsPreparing] = useState(false);
  const navigate = useNavigate();

  async function openForm() {
    setIsPreparing(true);
    try {
      const blob = await createPdfBlob();
      saveEmailPdfDraft({
        emailTo: defaultEmail ?? "",
        subject,
        reportName,
        module,
        body: body ?? `Dear Sir/Madam,\n\nPlease find attached ${reportName}.\n\nRegards,`,
        attachments: [{
          fileName: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
          contentType: "application/pdf",
          base64Content: await blobToBase64Content(blob)
        }]
      });
      navigate("/reports/email-pdf");
    } finally {
      setIsPreparing(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void openForm()} disabled={isPreparing}>
      <Mail className="h-4 w-4" />{isPreparing ? lt("Preparing...") : lt("Email PDF")}
    </Button>
  );
}
