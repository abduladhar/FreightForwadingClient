export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
  tone: "blue" | "green" | "amber" | "red" | "slate";
}

export interface WorkQueueItem {
  id: string;
  title: string;
  module: string;
  status: string;
  owner: string;
  dueAt: string;
}
