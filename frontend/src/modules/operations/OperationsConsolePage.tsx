import type { ColumnDef } from "@tanstack/react-table";
import { Download, Plus, Upload } from "lucide-react";
import { PermissionButton } from "@/auth/PermissionButton";
import { DataTable } from "@/components/common/DataTable";
import { FileUploader } from "@/components/common/FileUploader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { ShipmentCodePanel } from "@/components/ShipmentCodePanel";
import { useLanguage } from "@/hooks/useLanguage";
import { useActiveShipmentsQuery, type ShipmentRow } from "@/modules/operations/operationsApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMoney } from "@/hooks/useMoney";
import { useToast } from "@/components/ui/toast";

export function OperationsConsolePage() {
  useDocumentTitle("Operations");
  const money = useMoney();
  const language = useLanguage();
  const shipmentsQuery = useActiveShipmentsQuery();
  const toast = useToast();
  const columns: ColumnDef<ShipmentRow>[] = [
    { accessorKey: "number", header: "Shipment" },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "mode", header: "Mode" },
    { accessorKey: "origin", header: "Origin" },
    { accessorKey: "destination", header: "Destination" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "eta", header: "ETA", cell: ({ row }) => language.formatLocalizedDate(row.original.eta) },
    {
      accessorKey: "profit",
      header: "Profit",
      cell: ({ row }) => {
        const numericProfit = Number(row.original.profit);
        return money(Number.isFinite(numericProfit) ? numericProfit : 0);
      }
    }
  ];

  return (
    <div className="erp-page">
      <PageHeader
        title="Operations console"
        description="Shipment execution workspace for house, master, direct, freight-specific, and document activity."
        actions={
          <>
            <Button variant="outline"><Upload className="h-4 w-4" /> Import manifest</Button>
            <PermissionButton permission={["HouseShipment.Create", "DirectShipment.Create", "MasterShipment.Create"]}>
              <Plus className="h-4 w-4" /> New shipment
            </PermissionButton>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Active shipment board</CardTitle>
          <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={shipmentsQuery.data ?? []}
            columns={columns}
            totalCount={shipmentsQuery.data?.length ?? 0}
            pageNumber={1}
            pageSize={Math.max(10, shipmentsQuery.data?.length ?? 10)}
            isLoading={shipmentsQuery.isLoading}
            isError={shipmentsQuery.isError}
            onRetry={() => void shipmentsQuery.refetch()}
            onPaginationChange={() => undefined}
            searchPlaceholder="Search shipment board"
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <FileUploader
          accept={{
            "application/pdf": [".pdf"],
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "application/vnd.ms-excel": [".xls", ".xlsx"]
          }}
          onChange={(files) => {
            if (!files.length) return;
            toast.success("Files staged", `${files.length} file(s) ready for upload.`);
          }}
        />
        <ShipmentCodePanel shipmentNumber="HS-HQ-2026-00428" />
      </section>
    </div>
  );
}
