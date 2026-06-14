import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getAgent, updateAgent, type AgentRequest } from "@/api/agentApi";
import { AgentForm } from "@/modules/agents/AgentForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function AgentEditPage() {
  const m = useMasterDataI18n("Agent");
  const { agentId } = useParams();
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["agent", agentId], queryFn: () => getAgent(agentId!), enabled: Boolean(agentId) });
  const mutation = useMutation({ mutationFn: (v: AgentRequest) => updateAgent(agentId!, v), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["agents"] }); navigate(`/agents/${agentId}`); } });
  if (!agentId) return <Navigate to="/agents" replace />;
  return <div className="space-y-4"><PageHeader title={m("Edit Agent")} description={m("Update agent profile.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}>{query.data ? <AgentForm initialValue={query.data} onSubmit={async (v: AgentRequest) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /> : <p className="text-sm text-muted-foreground">{m("Loading")}</p>}</CardContent></Card></div>;
}
