import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { getCustomsJob } from "@/api/customsApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CustomsChildCrudTab, type CustomsCrudField } from "@/modules/customs/CustomsChildCrudTab";
import { CustomsDocumentRowAttachmentPanel } from "@/modules/customs/CustomsDocumentChecklistAttachments";
import { lt } from "@/modules/operationsLocalization";

const documentCategoryOptions = [
  { value: "COMMERCIAL_INVOICE", label: lt("COMMERCIAL_INVOICE - Commercial Invoice") },
  { value: "PACKING_LIST", label: lt("PACKING_LIST - Packing List") },
  { value: "BILL_OF_LADING", label: lt("BILL_OF_LADING - Bill of Lading") },
  { value: "AIR_WAYBILL", label: lt("AIR_WAYBILL - Air Waybill") },
  { value: "CERTIFICATE_OF_ORIGIN", label: lt("CERTIFICATE_OF_ORIGIN - Certificate of Origin") },
  { value: "CUSTOMS_DECLARATION", label: lt("CUSTOMS_DECLARATION - Customs Declaration") },
  { value: "DUTY_RECEIPT", label: lt("DUTY_RECEIPT - Duty Receipt") },
  { value: "OTHER", label: lt("OTHER - Other") }
];

export function CustomsDocumentPage() {
  const { customsId } = useParams();
  const location = useLocation();
  const query = useQuery({ queryKey: ["customs-job", customsId], queryFn: () => getCustomsJob(customsId!), enabled: Boolean(customsId) });
  const basePath = location.pathname.startsWith("/bill-of-entry") ? "/bill-of-entry" : "/customs";
  if (!customsId) return <Navigate to={basePath} replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Customs Documents")} description={query.data?.jobNumber ?? lt("Attach and track required customs documents.")} />
      {query.data ? (
        <CustomsChildCrudTab
          jobId={query.data.id}
          childType="documents"
          title={lt("Document")}
          rows={query.data.documents as unknown as Array<Record<string, unknown>>}
          locked={["Cleared", "Rejected", "Cancelled"].includes(query.data.status)}
          onRefresh={() => void query.refetch()}
          fields={[
            { key: "documentCategory", label: lt("Document Category"), type: "select", required: true, options: documentCategoryOptions },
            { key: "documentName", label: lt("Document Name"), required: true },
            { key: "isRequired", label: lt("Required"), type: "checkbox" },
            { key: "isReceived", label: lt("Received"), type: "checkbox" },
            { key: "remarks", label: lt("Remarks"), type: "textarea", span: 2 }
          ] satisfies CustomsCrudField[]}
          columns={["documentCategory", "documentName", "isRequired", "isReceived", "uploadedDate", "remarks"]}
          emptyValue={{ documentCategory: documentCategoryOptions[0]?.value ?? "", documentName: "", fileName: "", filePath: "", isRequired: false, isReceived: false, remarks: "" }}
          rowExpansionLabel={lt("Attachments")}
          rowExpansion={(row) => <CustomsDocumentRowAttachmentPanel row={row as unknown as (typeof query.data.documents)[number]} />}
        />
      ) : (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading customs clearance...")}</CardContent></Card>
      )}
    </div>
  );
}
