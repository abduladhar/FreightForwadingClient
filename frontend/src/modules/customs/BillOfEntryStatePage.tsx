import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBillOfEntry, updateBillOfEntryState } from "@/api/billOfEntryApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function BillOfEntryStatePage() {
  const { billOfEntryId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["bill-of-entry", billOfEntryId], queryFn: () => getBillOfEntry(billOfEntryId ?? ""), enabled: Boolean(billOfEntryId) });
  const [nextState, setNextState] = useState("");
  const [remarks, setRemarks] = useState("");

  const options = useMemo(() => {
    switch (query.data?.status) {
      case "Draft": return ["Submitted", "Confirmed", "Cancelled"];
      case "Submitted": return ["Confirmed", "Cancelled"];
      case "Confirmed": return ["Draft", "Cancelled"];
      default: return [];
    }
  }, [query.data?.status]);

  const mutation = useMutation({
    mutationFn: () => updateBillOfEntryState(billOfEntryId ?? "", nextState, remarks),
    onSuccess: async (value) => {
      toast.success(lt("Bill of Entry state updated"));
      await client.invalidateQueries({ queryKey: ["bill-of-entry"] });
      navigate(`/bill-of-entry/${value?.id ?? billOfEntryId}`);
    }
  });

  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Update BOE State")} description={lt("Submit, confirm, reopen, or cancel the Bill of Entry and move inventory stock buckets transactionally.")} actions={<Button disabled={!nextState || mutation.isPending} onClick={() => mutation.mutate()}><Save className="h-4 w-4" />{lt("Save")}</Button>} />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">{query.data.boeNumber || query.data.declarationNumber} <StatusBadge status={query.data.status} /></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>{lt("Next State")}</Label>
              <select className="h-10 w-full rounded-md border px-3 text-sm" value={nextState} onChange={(event) => setNextState(event.target.value)}>
                <option value="">{lt("Select state")}</option>
                {options.map((item) => <option key={item} value={item}>{lt(item)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>{lt("Remarks")}</Label>
              <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
            </div>
          </div>
          {!options.length ? <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-600">{lt("No further state changes are available.")}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
