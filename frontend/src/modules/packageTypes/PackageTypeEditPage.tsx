import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getPackageTypeByGuid, updatePackageType, type PackageTypeRequest } from "@/api/packageTypeApi";
import { PackageTypeForm } from "@/modules/packageTypes/PackageTypeForm";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function PackageTypeEditPage() {
  const m = useMasterDataI18n("PackageType");
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const query = useQuery({
    queryKey: ["package-type", id],
    queryFn: () => getPackageTypeByGuid(id),
    enabled: Boolean(id)
  });

  const mutation = useMutation({ mutationFn: (request: PackageTypeRequest) => updatePackageType(id, request) });

  return (
    <div className="space-y-4">
      <PageHeader title={m("Edit Package Type")} description={m("Update package type details.")} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          {query.isLoading || !query.data ? (
            <LoadingScreen message={m("Loading Package Type")} />
          ) : (
            <PackageTypeForm
              initialValue={{
                packageCode: query.data.packageCode,
                packageName: query.data.packageName,
                description: query.data.description ?? "",
                isActive: query.data.isActive
              }}
              isSubmitting={mutation.isPending}
              onSubmit={async (value) => {
                await mutation.mutateAsync(value);
                navigate("/package-types");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
