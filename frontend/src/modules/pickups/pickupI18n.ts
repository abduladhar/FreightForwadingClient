import { useI18n } from "@/app/i18n";
import { useWorkspace } from "@/hooks/useWorkspace";
import { pickupCatalogs } from "@/modules/pickups/pickupCatalogs";

function keyify(value: string) {
  return value.replace(/[^A-Za-z0-9]+(.)/g, (_, character: string) => character.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
}

export function pickupResourceKey(value: string) {
  return `Pickup.${keyify(value)}`;
}

export function getPickupFallback(cultureCode: string, value: string) {
  if (cultureCode === "en-US") return value;
  return pickupCatalogs[cultureCode]?.[value] ?? value;
}

export function usePickupI18n() {
  const { t } = useI18n();
  const { cultureCode } = useWorkspace();
  return (value: string) => {
    const localized = t(pickupResourceKey(value), value);
    if (cultureCode === "en-US" || localized !== value) return localized;
    return getPickupFallback(cultureCode, value);
  };
}

export const pickupCultures = ["en-US", "ar-QA", "hi-IN", "fr-FR", "es-ES", "zh-CN", "tr-TR", "pt-PT", "ru-RU"] as const;
