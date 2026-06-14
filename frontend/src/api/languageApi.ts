import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";
import { authStorage } from "@/auth/authStorage";
import type { Language, LanguageUpsertRequest, LocalizationLanguage, LocalizationResources, MissingTranslation, TenantLanguage, Translation } from "@/types/language";

export async function getLanguages() {
  const response = await httpClient.get<ApiResponse<Language[]>>("/api/languages", {
    headers: { "X-Suppress-Error-Toast": "true" }
  });
  return dedupeArabicLanguages(response.data.data ?? []);
}

export async function getTenantLanguages() {
  const response = await httpClient.get<ApiResponse<TenantLanguage[]>>("/api/languages/tenant", {
    headers: { "X-Suppress-Error-Toast": "true" }
  });
  return response.data.data ?? [];
}

export async function createLanguage(request: LanguageUpsertRequest) {
  const response = await httpClient.post<ApiResponse<Language>>("/api/languages", request);
  return response.data.data;
}

export async function updateLanguage(id: string, request: Omit<LanguageUpsertRequest, "languageCode">) {
  const response = await httpClient.put<ApiResponse<Language>>(`/api/languages/${id}`, request);
  return response.data.data;
}

export async function deleteLanguage(id: string) {
  await httpClient.delete(`/api/languages/${id}`);
}

export async function setTenantLanguage(languageId: string, isEnabled: boolean, isDefault: boolean) {
  const response = await httpClient.post<ApiResponse<TenantLanguage>>("/api/languages/tenant", { languageId, isEnabled, isDefault });
  return response.data.data;
}

export async function setUserLanguagePreference(languageId: string) {
  await httpClient.post("/api/languages/preference", { languageId });
}

export async function upsertTranslation(request: { groupName: string; key: string; defaultValue?: string | null; languageId: string; value: string; isApproved: boolean }) {
  const response = await httpClient.post<ApiResponse<Translation>>("/api/languages/translations", request);
  return response.data.data;
}

export async function lookupTranslation(request: { groupName: string; key: string; userId?: string | null; preferredLanguageId?: string | null }) {
  const response = await httpClient.post<ApiResponse<{ value: string; source: string }>>("/api/languages/translations/lookup", request);
  return response.data.data;
}

export async function getMissingTranslations() {
  const response = await httpClient.get<ApiResponse<MissingTranslation[]>>("/api/languages/translations/missing");
  return response.data.data ?? [];
}

export async function getLocalizationLanguages() {
  const response = await httpClient.get<ApiResponse<LocalizationLanguage[]>>("/api/localization/languages", {
    headers: { "X-Suppress-Error-Toast": "true", "X-Tenant-Code": "" }
  });
  return dedupeArabicLanguages(response.data.data ?? []);
}

export async function getLocalizationResources(cultureCode: string) {
  const response = await httpClient.get<ApiResponse<LocalizationResources>>("/api/localization/resources", {
    params: { cultureCode },
    headers: localizationReadHeaders()
  });
  return response.data.data ?? {};
}

export async function getLocalizationModuleResources(moduleName: string, cultureCode: string) {
  const response = await httpClient.get<ApiResponse<LocalizationResources>>(`/api/localization/resources/module/${encodeURIComponent(moduleName)}`, {
    params: { cultureCode },
    headers: localizationReadHeaders()
  });
  return response.data.data ?? {};
}

function localizationReadHeaders() {
  return authStorage.get()
    ? { "X-Suppress-Error-Toast": "true" }
    : { "X-Suppress-Error-Toast": "true", "X-Tenant-Code": "" };
}

function dedupeArabicLanguages<T extends { languageCode: string; cultureCode: string; displayName?: string; name?: string; nativeName?: string; isDefault?: boolean; sortOrder?: number }>(languages: T[]) {
  const arabicRows = languages.filter(isArabicLanguage);
  if (arabicRows.length <= 1) return languages;

  const preferredArabic = [...arabicRows].sort((a, b) => {
    const aPreferred = a.cultureCode.toLowerCase() === "ar-qa" ? 0 : 1;
    const bPreferred = b.cultureCode.toLowerCase() === "ar-qa" ? 0 : 1;
    if (aPreferred !== bPreferred) return aPreferred - bPreferred;
    if (Boolean(a.isDefault) !== Boolean(b.isDefault)) return a.isDefault ? -1 : 1;
    return (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
  })[0];

  return languages.filter((language) => !isArabicLanguage(language) || language === preferredArabic);
}

function isArabicLanguage(language: { languageCode: string; cultureCode: string; displayName?: string; name?: string; nativeName?: string }) {
  const values = [language.languageCode, language.cultureCode, language.displayName, language.name, language.nativeName]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  return values.some((value) => value === "ar" || value.startsWith("ar-") || value.includes("arabic") || value.includes("العربية"));
}
