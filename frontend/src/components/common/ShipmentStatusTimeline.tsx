import { MapPin } from "lucide-react";
import { DateDisplay } from "@/components/common/DateDisplay";
import { StatusBadge } from "@/components/common/StatusBadge";
import { lt } from "@/modules/operationsLocalization";

export interface ShipmentStatusPoint {
  id: string;
  status: string;
  location?: string;
  timestamp?: string;
  note?: string;
}

export function ShipmentStatusTimeline({ items }: { items: ShipmentStatusPoint[] }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{lt("Shipment Status Timeline")}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="relative pl-8">
            <span className="absolute left-0 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-700">{index + 1}</span>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />
              {item.location ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {item.location}</span> : null}
              {item.timestamp ? <DateDisplay value={item.timestamp} pattern="dd MMM yyyy HH:mm" className="text-xs text-muted-foreground" /> : null}
            </div>
            {item.note ? <p className="mt-1 text-sm text-muted-foreground">{item.note}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
