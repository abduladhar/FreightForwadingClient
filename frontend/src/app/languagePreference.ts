import { env } from "@/app/env";

export interface LanguagePreference {
  languageCode: string;
  cultureCode: string;
}

const storageKey = "ff.language.preference";

export function getLanguagePreference(): LanguagePreference {
  if (typeof window === "undefined") {
    return defaultLanguagePreference();
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return defaultLanguagePreference();

  try {
    const parsed = JSON.parse(raw) as Partial<LanguagePreference>;
    return {
      languageCode: parsed.languageCode || env.VITE_DEFAULT_LANGUAGE,
      cultureCode: parsed.cultureCode || env.VITE_DEFAULT_CULTURE
    };
  } catch {
    return defaultLanguagePreference();
  }
}

export function setLanguagePreference(preference: LanguagePreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(preference));
}

function defaultLanguagePreference(): LanguagePreference {
  return {
    languageCode: env.VITE_DEFAULT_LANGUAGE,
    cultureCode: env.VITE_DEFAULT_CULTURE
  };
}
