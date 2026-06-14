import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPackageType, type PackageTypeRequest } from "@/api/packageTypeApi";
import { PackageTypeForm } from "@/modules/packageTypes/PackageTypeForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PackageTypeCreatePage() {
  const m = useMasterDataI18n("PackageType");
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: (request: PackageTypeRequest) => createPackageType(request) });

  return (
    <div className="space-y-4">
      <PageHeader title={m("New Package Type")} description={m("Create a new package type master record.")} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <PackageTypeForm
            isSubmitting={mutation.isPending}
            onSubmit={async (value) => {
              await mutation.mutateAsync(value);
              navigate("/package-types");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
