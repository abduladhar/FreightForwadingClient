import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { searchChargeHeads, upsertChargeHead, type ChargeHeadRequest } from "@/api/chargeHeadApi";
import { ChargeHeadForm } from "@/modules/chargeHeads/ChargeHeadForm";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function ChargeHeadEditPage() {
  const m = useMasterDataI18n("ChargeHead");
  const { chargeHeadId = "" } = useParams();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["charge-head-edit", chargeHeadId], queryFn: () => searchChargeHeads({ pageNumber: 1, pageSize: 500 }) });
  const initialValue = useMemo(() => query.data?.items.find((x) => x.id === chargeHeadId), [query.data, chargeHeadId]);
  const mutation = useMutation({ mutationFn: upsertChargeHead, onSuccess: () => navigate("/charge-heads") });
  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !initialValue) return <ErrorState onRetry={() => void query.refetch()} />;
  const request: ChargeHeadRequest = { mappingKey: initialValue.mappingKey, mappingName: initialValue.mappingName, ledgerAccountId: initialValue.ledgerAccountId, sourceModule: initialValue.sourceModule, isActive: initialValue.isActive };
  return <div className="space-y-4"><PageHeader title={m("Edit Charge Head")} description={m("Update charge and account mapping rules.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><ChargeHeadForm initialValue={request} onSubmit={async (value) => { await mutation.mutateAsync(value); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
