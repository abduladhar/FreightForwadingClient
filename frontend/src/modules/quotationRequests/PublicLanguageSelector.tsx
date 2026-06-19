import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe2 } from "lucide-react";
import { getLocalizationLanguages } from "@/api/languageApi";
import { setLanguagePreference } from "@/app/languagePreference";
import { useI18n } from "@/app/i18n";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/hooks/useWorkspace";

const languageDisplayNames: Record<string, { english: string; native: string }> = {
  "en-US": { english: "English", native: "English" },
  "ar-QA": { english: "Arabic", native: "العربية" },
  "hi-IN": { english: "Hindi", native: "हिन्दी" },
  "fr-FR": { english: "French", native: "Français" },
  "es-ES": { english: "Spanish", native: "Español" },
  "zh-CN": { english: "Chinese Simplified", native: "简体中文" },
  "tr-TR": { english: "Turkish", native: "Türkçe" },
  "pt-PT": { english: "Portuguese", native: "Português" },
  "ru-RU": { english: "Russian", native: "Русский" }
};

const fallbackLanguages = [
  { id: "en", languageCode: "EN", cultureCode: "en-US", name: "English", nativeName: "English", isRightToLeft: false, isDefault: true, sortOrder: 1 },
  { id: "ar", languageCode: "AR", cultureCode: "ar-QA", name: "Arabic", nativeName: "العربية", isRightToLeft: true, isDefault: false, sortOrder: 2 },
  { id: "hi", languageCode: "HI", cultureCode: "hi-IN", name: "Hindi", nativeName: "हिन्दी", isRightToLeft: false, isDefault: false, sortOrder: 3 },
  { id: "fr", languageCode: "FR", cultureCode: "fr-FR", name: "French", nativeName: "Français", isRightToLeft: false, isDefault: false, sortOrder: 4 },
  { id: "es", languageCode: "ES", cultureCode: "es-ES", name: "Spanish", nativeName: "Español", isRightToLeft: false, isDefault: false, sortOrder: 5 },
  { id: "zh", languageCode: "ZH", cultureCode: "zh-CN", name: "Chinese Simplified", nativeName: "简体中文", isRightToLeft: false, isDefault: false, sortOrder: 6 },
  { id: "tr", languageCode: "TR", cultureCode: "tr-TR", name: "Turkish", nativeName: "Türkçe", isRightToLeft: false, isDefault: false, sortOrder: 7 },
  { id: "pt", languageCode: "PT", cultureCode: "pt-PT", name: "Portuguese", nativeName: "Português", isRightToLeft: false, isDefault: false, sortOrder: 8 },
  { id: "ru", languageCode: "RU", cultureCode: "ru-RU", name: "Russian", nativeName: "Русский", isRightToLeft: false, isDefault: false, sortOrder: 9 }
];

export function PublicLanguageSelector() {
  const { t } = useI18n();
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const languagesQuery = useQuery({
    queryKey: ["public", "localization-languages"],
    queryFn: getLocalizationLanguages,
    staleTime: 30 * 60_000
  });
  const languageOptions = useMemo(() => {
    const rows = languagesQuery.data?.length ? languagesQuery.data : fallbackLanguages;
    return rows
      .map((language) => {
        const display = languageDisplayNames[language.cultureCode];
        return display ? { ...language, name: display.english, nativeName: display.native } : language;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [languagesQuery.data]);

  function changeLanguage(languageCode: string) {
    const language = languageOptions.find((item) => item.languageCode === languageCode);
    if (!language) return;
    setLanguagePreference({ languageCode: language.languageCode, cultureCode: language.cultureCode });
    workspace.setLanguage(language.languageCode, language.cultureCode);
    void queryClient.invalidateQueries({ queryKey: ["localization", "resources"] });
  }

  return <div className="w-full space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
    <div className="flex items-center gap-2">
      <Globe2 className="h-4 w-4 text-blue-700" />
      <Label>{t("Login.Language", "Language")}</Label>
    </div>
    <div className="grid max-h-24 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-5">
      {languageOptions.map((language) => (
        <button
          key={language.cultureCode}
          type="button"
          onClick={() => changeLanguage(language.languageCode)}
          className={`min-w-0 rounded-md border px-3 py-2 text-left text-xs transition ${
            workspace.languageCode === language.languageCode
              ? "border-blue-500 bg-blue-50 text-blue-900"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
          }`}
        >
          <span className="block font-semibold">{language.name}</span>
          <span className="block truncate text-slate-500">{language.nativeName}</span>
        </button>
      ))}
    </div>
  </div>;
}
