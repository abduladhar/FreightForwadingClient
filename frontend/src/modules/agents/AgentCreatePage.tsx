import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createAgent, type AgentRequest } from "@/api/agentApi";
import { AgentForm } from "@/modules/agents/AgentForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function AgentCreatePage() {
  const m = useMasterDataI18n("Agent");
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: createAgent, onSuccess: async (agent) => { await queryClient.invalidateQueries({ queryKey: ["agents"] }); navigate(`/agents/${agent.id}`); } });
  return <div className="space-y-4"><PageHeader title={m("Create Agent")} description={m("Create agent and commission profile.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><AgentForm onSubmit={async (v: AgentRequest) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
