import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createShippingPort, type ShippingPortRequest } from "@/api/shippingPortApi";
import { ShippingPortForm } from "@/modules/shippingPorts/ShippingPortForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function ShippingPortCreatePage() {
  const m = useMasterDataI18n("ShippingPort");
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: (request: ShippingPortRequest) => createShippingPort(request) });

  return (
    <div className="space-y-4">
      <PageHeader title={m("New Shipping Port")} description={m("Create a new shipping port master record.")} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <ShippingPortForm
            isSubmitting={mutation.isPending}
            onSubmit={async (value) => {
              await mutation.mutateAsync(value);
              navigate("/shipping-ports");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
