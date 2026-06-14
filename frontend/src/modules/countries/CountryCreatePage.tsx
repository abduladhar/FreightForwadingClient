import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createCountry, type CountryRequest } from "@/api/countryApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CountryForm } from "@/modules/countries/CountryForm";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function CountryCreatePage() {
  const m = useMasterDataI18n("Country");
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: (request: CountryRequest) => createCountry(request) });

  return (
    <div className="space-y-4">
      <PageHeader title={m("New Country")} description={m("Create a country master record.")} />
      <Card className={masterDataPanelClass}>
        <CardContent className={masterDataPanelContentClass}>
          <CountryForm
            isSubmitting={mutation.isPending}
            onSubmit={async (value) => {
              await mutation.mutateAsync(value);
              navigate("/countries");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
