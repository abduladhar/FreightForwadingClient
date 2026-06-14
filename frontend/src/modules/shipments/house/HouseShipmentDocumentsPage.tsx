import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getShipmentDocuments } from "@/api/documentApi";
import { getHouseShipment } from "@/api/houseShipmentApi";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function HouseShipmentDocumentsPage() {
  const { shipmentId } = useParams();
  const shipment = useQuery({ queryKey: ["house-shipment", shipmentId], queryFn: () => getHouseShipment(shipmentId!), enabled: Boolean(shipmentId) });
  const documents = useQuery({ queryKey: ["documents", "HouseShipment", shipmentId], queryFn: () => getShipmentDocuments("HouseShipment", shipmentId!), enabled: Boolean(shipmentId) });
  if (!shipmentId) return <Navigate to="/house-shipments" replace />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("House Shipment Documents")} description={shipment.data?.houseShipmentNumber ?? lt("Upload and manage house shipment documents.")} />
      {shipment.data ? (
        <DocumentUploadPanel moduleName="HouseShipment" entityId={shipmentId} defaultDocumentName={lt("House Shipment Document")} defaultDocumentCategory={lt("House Shipment")} emptyText={lt("No documents uploaded for this house shipment.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} />
      ) : (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading house shipment...")}</CardContent></Card>
      )}
    </div>
  );
}
