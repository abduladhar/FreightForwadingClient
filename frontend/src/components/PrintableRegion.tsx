import { Printer } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";

export function PrintableRegion({ children, title }: { children: ReactNode; title: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
    contentRef,
    documentTitle: title
  });

  return (
    <div className="space-y-3">
      <Button variant="outline" onClick={() => print()}>
        <Printer className="h-4 w-4" /> Print
      </Button>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
