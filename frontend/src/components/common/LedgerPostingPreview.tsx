import { CurrencyAmount } from "@/components/common/CurrencyAmount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export interface LedgerPostingLine {
  id: string;
  account: string;
  narration?: string;
  debit: number;
  credit: number;
  currency: string;
}

export function LedgerPostingPreview({ lines }: { lines: LedgerPostingLine[] }) {
  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.001;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lt("Ledger Posting Preview")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          {lines.map((line) => (
            <div key={line.id} className="grid gap-3 border-b bg-white p-3 last:border-b-0 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
              <div>
                <p className="font-medium">{line.account}</p>
                {line.narration ? <p className="text-xs text-muted-foreground">{line.narration}</p> : null}
              </div>
              <CurrencyAmount value={line.debit} currency={line.currency} />
              <CurrencyAmount value={line.credit} currency={line.currency} />
              <p className="text-xs text-muted-foreground">{line.currency}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-end gap-4 text-sm">
          <span>{lt("Total Debit")}: <CurrencyAmount value={totalDebit} currency={lines[0]?.currency ?? "USD"} /></span>
          <span>{lt("Total Credit")}: <CurrencyAmount value={totalCredit} currency={lines[0]?.currency ?? "USD"} /></span>
          <span className={balanced ? "text-emerald-700" : "text-red-700"}>{balanced ? lt("Balanced") : lt("Not Balanced")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
