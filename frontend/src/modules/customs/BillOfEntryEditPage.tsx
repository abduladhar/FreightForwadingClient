import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBillOfEntry, updateBillOfEntry } from "@/api/billOfEntryApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { BillOfEntryForm } from "@/modules/customs/BillOfEntryForm";

export function BillOfEntryEditPage() {
  const { billOfEntryId } = useParams();
  const query = useQuery({ queryKey: ["bill-of-entry", billOfEntryId], queryFn: () => getBillOfEntry(billOfEntryId ?? ""), enabled: Boolean(billOfEntryId) });

  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data || !billOfEntryId) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <BillOfEntryForm
      title="Edit Bill of Entry"
      description="Update declaration, warehouse, inventory, and duty details."
      initialValue={query.data}
      onSubmit={(request) => updateBillOfEntry(billOfEntryId, request)}
    />
  );
}
