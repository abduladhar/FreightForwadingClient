import { auditLogSections } from "@/layouts/navigation";
import { SectionedWorkspacePage } from "@/modules/workbench/SectionedWorkspacePage";
import type { NavigationSection } from "@/types/navigation";

export function AuditLogsWorkspacePage() {
  return (
    <SectionedWorkspacePage
      title="Audit Logs"
      description="A single workspace for activity, business, output, file, and API audit logs."
      menuTitle="Audit log menu"
      menuDescription="Choose an audit group, then open the log view you need."
      searchPlaceholder="Search audit logs..."
      emptyTitle="No audit log screens found"
      emptyDescription="Your current role does not have access to audit log screens."
      sections={auditLogSections}
      openLabel="Open log"
      getBadgeLabel={(section) => section.label.replace(" Audit", "")}
      getTone={auditTone}
    />
  );
}

function auditTone(section: NavigationSection) {
  if (section.id === "business") return "amber";
  if (section.id === "output") return "green";
  return "blue";
}
