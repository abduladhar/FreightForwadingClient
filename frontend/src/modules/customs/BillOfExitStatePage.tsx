import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { getBillOfExit, updateBillOfExitState } from "@/api/billOfExitApi";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { lt } from "@/modules/operationsLocalization";

export function BillOfExitStatePage() {
  const { billOfExitId } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const toast = useToast();
  const [toState, setToState] = useState("");
  const [remarks, setRemarks] = useState("");
  const query = useQuery({ queryKey: ["bill-of-exit", billOfExitId], queryFn: () => getBillOfExit(billOfExitId ?? ""), enabled: Boolean(billOfExitId) });
  const options = useMemo(() => {
    if (!query.data) return [];
    if (["Created", "PendingApproval"].includes(query.data.state)) return ["Approved", "Rejected", "Cancelled"];
    if (query.data.state === "Approved") return ["Created"];
    return [];
  }, [query.data]);
  const mutation = useMutation({
    mutationFn: () => updateBillOfExitState(billOfExitId ?? "", toState, remarks),
    onSuccess: async (value) => {
      toast.success(lt("Bill of Exit state updated"));
      await client.invalidateQueries({ queryKey: ["bill-of-exits"] });
      await client.invalidateQueries({ queryKey: ["bill-of-exit", billOfExitId] });
      navigate(`/bill-of-exits/${value?.id ?? billOfExitId}`);
    }
  });

  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !query.data || !billOfExitId) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-4">
      <PageHeader title={lt("Update Bill of Exit State")} description={lt("Approve, reject, reopen, or cancel the Bill of Exit and update stock buckets transactionally.")} actions={<Button disabled={!toState || mutation.isPending} onClick={() => mutation.mutate()}><Save className="h-4 w-4" />{lt("Save")}</Button>} />
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">{query.data.billOfExitNumber} <StatusBadge status={query.data.state} /></CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>{lt("To State")}</Label>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={toState} onChange={(event) => setToState(event.target.value)}>
              <option value="">{lt("Select state")}</option>
              {options.map((value) => <option key={value} value={value}>{lt(value)}</option>)}
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>{lt("Remarks")}</Label>
            <Textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
