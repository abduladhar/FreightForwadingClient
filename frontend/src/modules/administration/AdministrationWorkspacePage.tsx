import { administrationSections } from "@/layouts/navigation";
import { SectionedWorkspacePage } from "@/modules/workbench/SectionedWorkspacePage";
import type { NavigationSection } from "@/types/navigation";

export function AdministrationWorkspacePage() {
  return (
    <SectionedWorkspacePage
      title="Administration"
      description="A single workspace for access control, employees, roles, permissions, and notifications."
      menuTitle="Administration menu"
      menuDescription="Choose an administration group, then open the screen you need."
      searchPlaceholder="Search administration..."
      emptyTitle="No administration screens found"
      emptyDescription="Your current role does not have access to administration screens."
      sections={administrationSections}
      openLabel="Open screen"
      getBadgeLabel={(section) => section.label.replace(" Administration", "")}
      getTone={administrationTone}
    />
  );
}

function administrationTone(section: NavigationSection) {
  if (section.id === "people") return "green";
  if (section.id === "notifications") return "amber";
  return "blue";
}
