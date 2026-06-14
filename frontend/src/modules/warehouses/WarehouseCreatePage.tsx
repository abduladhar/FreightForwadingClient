import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createWarehouse, type WarehouseRequest } from "@/api/warehouseApi";
import { WarehouseForm } from "@/modules/warehouses/WarehouseForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function WarehouseCreatePage() {
  const m = useMasterDataI18n("Warehouse");
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: createWarehouse, onSuccess: () => navigate("/warehouses") });
  const submit = async (value: WarehouseRequest) => { await mutation.mutateAsync(value); };
  return <div className="space-y-4"><PageHeader title={m("New Warehouse")} description={m("Create a warehouse profile.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><WarehouseForm onSubmit={submit} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
