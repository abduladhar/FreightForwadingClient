import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getShippingPortByGuid, updateShippingPort, type ShippingPortRequest } from "@/api/shippingPortApi";
import { ShippingPortForm } from "@/modules/shippingPorts/ShippingPortForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function ShippingPortEditPage() {
  const m = useMasterDataI18n("ShippingPort");
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const query = useQuery({
    queryKey: ["shipping-port", id],
    queryFn: () => getShippingPortByGuid(id),
    enabled: Boolean(id)
  });
  const mutation = useMutation({ mutationFn: (request: ShippingPortRequest) => updateShippingPort(id, request) });

  return (
    <div className="space-y-4">
      <PageHeader title={m("Edit Shipping Port")} description={m("Update shipping port details.")} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          {query.isLoading || !query.data ? (
            <LoadingScreen message={m("Loading Shipping Port")} />
          ) : (
            <ShippingPortForm
              initialValue={{
                portCode: query.data.portCode,
                portName: query.data.portName,
                countryGuid: query.data.countryGuid,
                countryName: query.data.countryName,
                portType: query.data.portType,
                isActive: query.data.isActive
              }}
              isSubmitting={mutation.isPending}
              onSubmit={async (value) => {
                await mutation.mutateAsync(value);
                navigate("/shipping-ports");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
