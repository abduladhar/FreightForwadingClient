import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { DateDisplay } from "@/components/common/DateDisplay";
import { StatusBadge } from "@/components/common/StatusBadge";

export interface ApprovalTimelineItem {
  id: string;
  status: string;
  actor: string;
  timestamp: string;
  remark?: string;
}

export function ApprovalTimeline({ items }: { items: ApprovalTimelineItem[] }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Approval Timeline</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="relative pl-8">
            <span className="absolute left-0 top-0.5">
              {item.status === "Approved" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : item.status === "Rejected" ? <XCircle className="h-4 w-4 text-red-600" /> : <Clock3 className="h-4 w-4 text-amber-600" />}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />
              <span className="text-sm font-medium">{item.actor}</span>
              <DateDisplay value={item.timestamp} className="text-xs text-muted-foreground" pattern="dd MMM yyyy HH:mm" />
            </div>
            {item.remark ? <p className="mt-1 text-sm text-muted-foreground">{item.remark}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
