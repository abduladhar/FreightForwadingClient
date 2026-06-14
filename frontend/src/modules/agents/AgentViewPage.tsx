import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { getAgent } from "@/api/agentApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Button } from "@/components/ui/button";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function AgentViewPage() {
  const m = useMasterDataI18n("Agent");
  const { agentId } = useParams();
  const query = useQuery({ queryKey: ["agent", agentId], queryFn: () => getAgent(agentId!), enabled: Boolean(agentId) });
  if (!agentId) return <Navigate to="/agents" replace />;
  const agent = query.data;
  return <div className="space-y-4"><PageHeader title={agent?.agentName ?? m("Agent")} description={agent?.agentCode} actions={<><AuditTrailButton /><PermissionButton className={masterDataButtonClass} asChild permission="Agent.Update"><Link to={`/agents/${agentId}/edit`}><Pencil className="h-4 w-4" /> {m("Edit")}</Link></PermissionButton><Button className={masterDataButtonClass} asChild variant="outline"><Link to={`/agents/${agentId}/commission-settings`}>{m("Commission Settings")}</Link></Button></>} />{agent ? <Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} grid gap-3 md:grid-cols-2`}><Field label={m("Type")} value={agent.agentType} /><Field label={m("Email")} value={agent.email} /><Field label={m("Country")} value={agent.country} /><Field label={m("City")} value={agent.city} /></CardContent></Card> : <Card className={masterDataPanelClass}><CardContent className={`${masterDataPanelContentClass} text-sm text-muted-foreground`}>{m("Loading Agent")}</CardContent></Card>}</div>;
}
function Field({ label, value }: { label: string; value?: string | null }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value || "-"}</p></div>; }
