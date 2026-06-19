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
import { lt } from "@/modules/operationsLocalization";

export function OperationsConsolePage() {
  useDocumentTitle(lt("Operations"));
  const money = useMoney();
  const language = useLanguage();
  const shipmentsQuery = useActiveShipmentsQuery();
  const toast = useToast();
  const columns: ColumnDef<ShipmentRow>[] = [
    { accessorKey: "number", header: lt("Shipment") },
    { accessorKey: "customer", header: lt("Customer") },
    { accessorKey: "mode", header: lt("Mode"), cell: ({ row }) => lt(row.original.mode) },
    { accessorKey: "origin", header: lt("Origin") },
    { accessorKey: "destination", header: lt("Destination") },
    { accessorKey: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "eta", header: "ETA", cell: ({ row }) => language.formatLocalizedDate(row.original.eta) },
    {
      accessorKey: "profit",
      header: lt("Profit"),
      cell: ({ row }) => {
        const numericProfit = Number(row.original.profit);
        return money(Number.isFinite(numericProfit) ? numericProfit : 0);
      }
    }
  ];

  return (
    <div className="erp-page">
      <PageHeader
        title={lt("Operations console")}
        description={lt("Shipment execution workspace for house, master, direct, freight-specific, and document activity.")}
        actions={
          <>
            <Button variant="outline"><Upload className="h-4 w-4" /> {lt("Import manifest")}</Button>
            <PermissionButton permission={["HouseShipment.Create", "DirectShipment.Create", "MasterShipment.Create"]}>
              <Plus className="h-4 w-4" /> {lt("New shipment")}
            </PermissionButton>
          </>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{lt("Active shipment board")}</CardTitle>
          <Button variant="outline" size="sm"><Download className="h-4 w-4" /> {lt("Export")}</Button>
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
            searchPlaceholder={lt("Search shipment board")}
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
            toast.success(lt("Files staged"), `${files.length} ${lt("file(s) ready for upload.")}`);
          }}
        />
        <ShipmentCodePanel shipmentNumber="HS-HQ-2026-00428" />
      </section>
    </div>
  );
}
