import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/modules/operationsLocalization";

export function OldNewValueCompare({
  oldValuesJson,
  newValuesJson,
  changedFieldsJson
}: {
  oldValuesJson?: string | null;
  newValuesJson?: string | null;
  changedFieldsJson?: string | null;
}) {
  const oldValues = parseJson(oldValuesJson);
  const newValues = parseJson(newValuesJson);
  const changedFields = parseJson(changedFieldsJson);
  const keys = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lt("Old vs New Values")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {keys.length ? (
          <div className="overflow-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b px-3 py-2 text-left">{lt("Field")}</th>
                  <th className="border-b px-3 py-2 text-left">{lt("Old")}</th>
                  <th className="border-b px-3 py-2 text-left">{lt("New")}</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const isChanged = oldValues[key] !== newValues[key];
                  return (
                    <tr key={key} className={isChanged ? "bg-amber-50" : ""}>
                      <td className="border-b px-3 py-2 font-medium">{lt(key)}</td>
                      <td className="border-b px-3 py-2">{stringifyValue(oldValues[key])}</td>
                      <td className="border-b px-3 py-2">{stringifyValue(newValues[key])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{lt("No old/new value payload available.")}</p>
        )}

        <div>
          <p className="mb-1 text-sm font-medium">{lt("Changed Fields JSON")}</p>
          <pre className="max-h-72 overflow-auto rounded border bg-slate-50 p-2 text-xs">{pretty(changedFields)}</pre>
        </div>
      </CardContent>
    </Card>
  );
}

function parseJson(value?: string | null) {
  if (!value) return {} as Record<string, unknown>;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function stringifyValue(value: unknown) {
  if (value == null) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function pretty(value: unknown) {
  if (value == null) return "-";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
