import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lt } from "@/modules/operationsLocalization";

interface ExportButtonsProps {
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
}

export function ExportButtons({ onExportPdf, onExportExcel, onExportCsv }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onExportPdf} disabled={!onExportPdf}>
        <FileText className="h-4 w-4" /> {lt("PDF")}
      </Button>
      <Button variant="outline" size="sm" onClick={onExportExcel} disabled={!onExportExcel}>
        <FileSpreadsheet className="h-4 w-4" /> {lt("Excel")}
      </Button>
      <Button variant="outline" size="sm" onClick={onExportCsv} disabled={!onExportCsv}>
        <FileText className="h-4 w-4" /> {lt("CSV")}
      </Button>
    </div>
  );
}
