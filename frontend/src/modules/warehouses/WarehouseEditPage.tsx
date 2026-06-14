import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getWarehouse, updateWarehouse, type WarehouseRequest } from "@/api/warehouseApi";
import { WarehouseForm } from "@/modules/warehouses/WarehouseForm";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function WarehouseEditPage() {
  const m = useMasterDataI18n("Warehouse");
  const { warehouseId = "" } = useParams();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["warehouse", warehouseId], queryFn: () => getWarehouse(warehouseId), enabled: Boolean(warehouseId) });
  const mutation = useMutation({ mutationFn: (request: WarehouseRequest) => updateWarehouse(warehouseId, request), onSuccess: () => navigate("/warehouses") });
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  return <div className="space-y-4"><PageHeader title={m("Edit Warehouse")} description={m("Update warehouse details and status.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><WarehouseForm initialValue={query.data} onSubmit={async (value) => { await mutation.mutateAsync(value); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
