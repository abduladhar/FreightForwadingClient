import { History } from "lucide-react";
import { useI18n } from "@/app/i18n";
import { PermissionButton } from "@/auth/PermissionButton";

export function AuditTrailButton({ onClick }: { onClick?: () => void }) {
  const { t } = useI18n();
  return (
    <PermissionButton permission="AuditLog.Read" variant="outline" size="sm" className="h-10 min-h-10" onClick={onClick}>
      <History className="h-4 w-4" /> {t("Common.AuditTrail", "Audit Trail")}
    </PermissionButton>
  );
}
