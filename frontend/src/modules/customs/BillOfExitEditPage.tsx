import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBillOfExit, updateBillOfExit } from "@/api/billOfExitApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { BillOfExitForm } from "@/modules/customs/BillOfExitForm";

export function BillOfExitEditPage() {
  const { billOfExitId } = useParams();
  const query = useQuery({ queryKey: ["bill-of-exit", billOfExitId], queryFn: () => getBillOfExit(billOfExitId ?? ""), enabled: Boolean(billOfExitId) });

  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data || !billOfExitId) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <BillOfExitForm
      title="Edit Bill of Exit"
      description="Update editable declaration fields. Quantity, Bill of Entry, and inventory are locked after save."
      initialValue={query.data}
      onSubmit={(request) => updateBillOfExit(billOfExitId, request)}
    />
  );
}
