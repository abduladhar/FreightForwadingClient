export interface Language {
  id: string;
  languageCode: string;
  cultureCode: string;
  displayName: string;
  nativeName: string;
  textDirection: "LTR" | "RTL" | string;
  dateFormat: string;
  numberFormat: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface TenantLanguage {
  languageId: string;
  languageCode: string;
  displayName: string;
  isEnabled: boolean;
  isDefault: boolean;
}

export interface LanguageUpsertRequest {
  languageCode: string;
  cultureCode: string;
  displayName: string;
  nativeName: string;
  textDirection: string;
  dateFormat: string;
  numberFormat: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface Translation {
  resourceKeyId: string;
  groupName: string;
  key: string;
  languageId: string;
  languageCode: string;
  value: string;
  isApproved: boolean;
}

export interface MissingTranslation {
  resourceGroupName: string;
  resourceKey: string;
  requestedLanguageCode: string;
  userId?: string | null;
  requestedAt: string;
}

export interface LocalizationLanguage {
  id: string;
  languageCode: string;
  cultureCode: string;
  name: string;
  nativeName: string;
  isRightToLeft: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export type LocalizationResources = Record<string, string>;
