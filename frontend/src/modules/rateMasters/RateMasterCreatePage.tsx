import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createRateMaster, type RateMasterRequest } from "@/api/rateMasterApi";
import { RateMasterForm } from "@/modules/rateMasters/RateMasterForm";
import { useRateMasterI18n } from "@/modules/rateMasters/rateMasterI18n";
import { masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function RateMasterCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const r = useRateMasterI18n();
  const mutation = useMutation({
    mutationFn: createRateMaster,
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: ["rate-masters"] });
      navigate(`/rate-masters/${item.id}`);
    }
  });
  return <div className="space-y-4"><PageHeader title={r("Create Rate Master")} description={r("Create customer/vendor/agent or general rates with slabs and charges.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><RateMasterForm onSubmit={async (value: RateMasterRequest) => { await mutation.mutateAsync(value); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
