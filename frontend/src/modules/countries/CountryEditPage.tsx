import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getCountryByGuid, updateCountry, type CountryRequest } from "@/api/countryApi";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CountryForm } from "@/modules/countries/CountryForm";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function CountryEditPage() {
  const m = useMasterDataI18n("Country");
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const query = useQuery({ queryKey: ["country", id], queryFn: () => getCountryByGuid(id), enabled: Boolean(id) });
  const mutation = useMutation({ mutationFn: (request: CountryRequest) => updateCountry(id, request) });

  return (
    <div className="space-y-4">
      <PageHeader title={m("Edit Country")} description={m("Update country codes and active status.")} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          {query.isLoading || !query.data ? (
            <LoadingScreen message={m("Loading Country")} />
          ) : (
            <CountryForm
              initialValue={{
                name: query.data.name,
                countryCode: query.data.countryCode,
                isoCode: query.data.isoCode,
                mobileCode: query.data.mobileCode,
                isActive: query.data.isActive
              }}
              isSubmitting={mutation.isPending}
              onSubmit={async (value) => {
                await mutation.mutateAsync(value);
                navigate("/countries");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
