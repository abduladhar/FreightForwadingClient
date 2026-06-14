import { useQuery } from "@tanstack/react-query";
import { getAgentCommissionStatement } from "@/api/commissionApi";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { ResponsiveCardList, ResponsiveRecordCard } from "@/components/common/ResponsiveCardList";
import { PageHeader } from "@/components/PageHeader";
import { lt } from "@/modules/operationsLocalization";

export function AgentCommissionStatementPage() {
  const query = useQuery({ queryKey: ["agent-commission-statement-page"], queryFn: getAgentCommissionStatement });
  const rows = query.data ?? [];
  return <div className="space-y-4"><PageHeader title={lt("Agent Commission Statement")} description={lt("Commission statement from backend agent portal feed.")} actions={<AuditTrailButton />} /><ResponsiveCardList isLoading={query.isLoading} isError={query.isError} isEmpty={!rows.length} onRetry={() => void query.refetch()}>{rows.map((x) => <ResponsiveRecordCard key={`${x.sourceType}-${x.sourceId}`} eyebrow={lt(displaySourceType(x.sourceType))} title={x.description} fields={[{ label: lt("Date"), value: x.date }, { label: lt("Status"), value: lt(x.status) }, { label: lt("Commission"), value: <CurrencyAmount value={x.commissionAmount} />, fullWidth: true }]} />)}</ResponsiveCardList></div>;
}

function displaySourceType(value: string) {
  switch (value) {
    case "HouseShipment": return "House Shipment";
    case "MasterShipment": return "Master Shipment";
    case "DirectShipment": return "Direct Shipment";
    default: return value;
  }
}
