import { Printer } from "lucide-react";
import { useI18n } from "@/app/i18n";
import { Button } from "@/components/ui/button";

export function PrintButton({ onPrint, disabled }: { onPrint?: () => void; disabled?: boolean }) {
  const { t } = useI18n();
  return (
    <Button className="h-10 min-h-10" variant="outline" size="sm" onClick={onPrint} disabled={disabled}>
      <Printer className="h-4 w-4" /> {t("Common.Print", "Print")}
    </Button>
  );
}
