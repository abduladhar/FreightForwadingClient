import { env } from "@/app/env";
import { getLanguagePreference } from "@/app/languagePreference";
import { branchLocalizationCatalogs } from "@/modules/branchLocalizationCatalog";
import { operationLocalizationCatalogs } from "@/modules/operationsLocalizationCatalog";
import { settingsLocalizationCatalogs } from "@/modules/settingsLocalizationCatalog";
import { tenantLocalizationCatalogs } from "@/modules/tenantLocalizationCatalog";

function currentCultureCode() {
  if (typeof window === "undefined") return env.VITE_DEFAULT_CULTURE;
  const workspaceRaw = window.localStorage.getItem("ff.workspace.preferences");
  if (workspaceRaw) {
    try {
      const parsed = JSON.parse(workspaceRaw) as { cultureCode?: string };
      if (parsed.cultureCode) return parsed.cultureCode;
    } catch {
      // Ignore malformed local storage and fall through to the language preference.
    }
  }
  return getLanguagePreference().cultureCode || env.VITE_DEFAULT_CULTURE;
}

export function lt(value: string) {
  const cultureCode = currentCultureCode();
  if (cultureCode === "en-US") return value;
  return branchLocalizationCatalogs[cultureCode]?.[value] ?? tenantLocalizationCatalogs[cultureCode]?.[value] ?? settingsLocalizationCatalogs[cultureCode]?.[value] ?? operationLocalizationCatalogs[cultureCode]?.[value] ?? value;
}
