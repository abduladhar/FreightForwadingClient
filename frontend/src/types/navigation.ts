import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: string | string[];
  description: string;
  metrics?: string[];
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}
