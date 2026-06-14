import type { ReactNode } from "react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PrintButton } from "@/components/common/PrintButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function PrintPreview({ title, children }: { title?: string; children: ReactNode }) {
  const resolvedTitle = title ?? lt("Print Preview");
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: resolvedTitle,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
      }
    `
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{resolvedTitle}</CardTitle>
        <PrintButton onPrint={() => void handlePrint()} />
      </CardHeader>
      <CardContent>
        <div ref={printRef}>{children}</div>
      </CardContent>
    </Card>
  );
}
