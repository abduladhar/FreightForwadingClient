import { Badge } from "@/components/ui/badge";
import { lt } from "@/modules/operationsLocalization";

type StatusTone = "slate" | "blue" | "green" | "amber" | "red";

const statusToneMap: Record<string, StatusTone> = {
  Draft: "slate",
  Submitted: "blue",
  Pending: "amber",
  Approved: "green",
  Rejected: "red",
  Sent: "blue",
  Accepted: "green",
  Cancelled: "red",
  Converted: "blue",
  Assigned: "blue",
  "In Progress": "amber",
  "Picked Up": "blue",
  Completed: "green",
  Received: "blue",
  Stored: "blue",
  "Partially Shipped": "amber",
  "Fully Shipped": "green",
  Damaged: "red",
  Returned: "amber",
  Booked: "blue",
  Loaded: "blue",
  "In Transit": "amber",
  Arrived: "blue",
  Delivered: "green",
  Closed: "slate",
  Paid: "green",
  "Partially Paid": "amber",
  Active: "green",
  Inactive: "red",
  Locked: "red",
  Unlocked: "green"
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = statusToneMap[status] ?? "slate";
  return <Badge tone={tone}>{label ?? lt(status)}</Badge>;
}
