import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export interface PrintPreviewOptions {
  documentTitle?: string;
  onBeforePrint?: () => Promise<void> | void;
  onAfterPrint?: () => void;
}

export function usePrintPreview(options?: PrintPreviewOptions) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: options?.documentTitle ?? "Freight ERP Print Preview",
    onBeforePrint: options?.onBeforePrint
      ? async () => {
          await options.onBeforePrint?.();
        }
      : undefined,
    onAfterPrint: options?.onAfterPrint
  });

  return {
    contentRef,
    print: () => void handlePrint()
  };
}
