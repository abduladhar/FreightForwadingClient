import { useI18n } from "@/app/i18n";

export function usePublicDocumentUploadI18n() {
  const { t } = useI18n();
  return (key: string, fallback: string) => t(`DocumentUpload.${key}`, fallback);
}
