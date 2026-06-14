import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { upsertChargeHead, type ChargeHeadRequest } from "@/api/chargeHeadApi";
import { ChargeHeadForm } from "@/modules/chargeHeads/ChargeHeadForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function ChargeHeadCreatePage() {
  const m = useMasterDataI18n("ChargeHead");
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: upsertChargeHead, onSuccess: () => navigate("/charge-heads") });
  return <div className="space-y-4"><PageHeader title={m("New Charge Head")} description={m("Create charge head with ledger mapping.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><ChargeHeadForm onSubmit={async (value: ChargeHeadRequest) => { await mutation.mutateAsync(value); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
