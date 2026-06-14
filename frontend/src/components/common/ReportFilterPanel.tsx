import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function ReportFilterPanel({
  children,
  onApply,
  onReset
}: {
  children: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{lt("Report Filters")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onReset}>{lt("Reset")}</Button>
          <Button onClick={onApply}>{lt("Apply")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
