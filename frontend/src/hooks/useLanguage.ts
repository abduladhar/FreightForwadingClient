import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLocalizationLanguages } from "@/api/languageApi";
import { useWorkspace } from "@/hooks/useWorkspace";

export function useLanguage() {
  const workspace = useWorkspace();
  const languagesQuery = useQuery({
    queryKey: ["language", "all"],
    queryFn: getLocalizationLanguages
  });
  const options = useMemo(() => {
    const all = languagesQuery.data ?? [];
    return all
      .map((language) => ({
        code: language.languageCode,
        cultureCode: language.cultureCode,
        name: language.nativeName || language.name,
        direction: language.isRightToLeft ? "RTL" : "LTR"
      }));
  }, [languagesQuery.data]);

  const selected = options.find((language) => language.code === workspace.languageCode);

  useEffect(() => {
    const direction = selected?.direction?.toUpperCase() === "RTL" ||
      workspace.languageCode.toLowerCase().startsWith("ar") ||
      workspace.cultureCode.toLowerCase().startsWith("ar")
      ? "rtl"
      : "ltr";
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", workspace.cultureCode);
  }, [selected, workspace.languageCode, workspace.cultureCode]);

  function setLanguage(languageCode: string) {
    const option = options.find((item) => item.code === languageCode);
    if (!option) return;
    workspace.setLanguage(option.code, option.cultureCode);
  }

  function formatLocalizedDate(value: string | Date | null | undefined) {
    const date = toValidDate(value);
    if (!date) return "-";
    return new Intl.DateTimeFormat(workspace.cultureCode, { dateStyle: "medium" }).format(date);
  }

  function formatLocalizedDateTime(value: string | Date | null | undefined) {
    const date = toValidDate(value);
    if (!date) return "-";
    return new Intl.DateTimeFormat(workspace.cultureCode, { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function formatLocalizedNumber(value: number, maxFractionDigits = 2) {
    return new Intl.NumberFormat(workspace.cultureCode, { maximumFractionDigits: maxFractionDigits }).format(value);
  }

  return {
    selectedLanguageCode: workspace.languageCode,
    options,
    setLanguage,
    formatLocalizedDate,
    formatLocalizedDateTime,
    formatLocalizedNumber,
    isLoading: languagesQuery.isLoading,
    isError: languagesQuery.isError,
    refetch: async () => {
      await languagesQuery.refetch();
    }
  };
}

function toValidDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
