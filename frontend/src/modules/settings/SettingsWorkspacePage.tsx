import { settingsSections } from "@/layouts/navigation";
import { SectionedWorkspacePage } from "@/modules/workbench/SectionedWorkspacePage";
import type { NavigationSection } from "@/types/navigation";

export function SettingsWorkspacePage() {
  return (
    <SectionedWorkspacePage
      title="Settings"
      description="A single workspace for tenant, warehouse, and system settings."
      menuTitle="Settings menu"
      menuDescription="Choose a settings group, then open the setup screen you need."
      searchPlaceholder="Search settings..."
      emptyTitle="No settings screens found"
      emptyDescription="Your current role does not have access to settings screens."
      sections={settingsSections}
      openLabel="Open setting"
      getBadgeLabel={(section) => section.label.replace(" Settings", "")}
      getTone={settingsTone}
    />
  );
}

function settingsTone(section: NavigationSection) {
  if (section.id === "warehouse") return "green";
  if (section.id === "system") return "amber";
  return "blue";
}
