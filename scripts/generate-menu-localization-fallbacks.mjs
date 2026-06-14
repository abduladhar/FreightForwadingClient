import { readFileSync, writeFileSync } from "node:fs";

const inputs = [
  "database/migrations/20260613_seed_all_ui_localization_resources.sql",
  "database/migrations/20260613_insert_missing_report_child_label_localization.sql"
];
const output = "frontend/src/app/menuLocalizationFallbacks.ts";

const rows = inputs.flatMap((input) => {
  try {
    const source = readFileSync(input, "utf8");
    return [...source.matchAll(/\(N'((?:''|[^'])*)', N'((?:''|[^'])*)', N'((?:''|[^'])*)', N'((?:''|[^'])*)', N'((?:''|[^'])*)'\)/g)]
      .map((match) => ({
        moduleName: match[1],
        resourceType: match[2],
        resourceKey: match[3],
        cultureCode: match[4],
        resourceValue: match[5].replace(/''/g, "'")
      }));
  } catch {
    return [];
  }
}).filter((row) =>
  row.moduleName === "Navigation"
  && row.resourceType === "Menu"
  && row.resourceKey.endsWith(".Label")
);

const byCulture = new Map();
for (const row of rows) {
  if (row.cultureCode === "en-US") continue;
  if (!byCulture.has(row.cultureCode)) byCulture.set(row.cultureCode, new Map());
  byCulture.get(row.cultureCode).set(row.resourceKey, row.resourceValue);
}

function js(value) {
  return JSON.stringify(value);
}

const lines = [
  "export const menuLocalizationFallbacks: Record<string, Record<string, string>> = {"
];

const cultures = [...byCulture.keys()].sort();
for (const culture of cultures) {
  lines.push(`  ${js(culture)}: {`);
  const entries = [...byCulture.get(culture).entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [key, value] of entries) {
    lines.push(`    ${js(key)}: ${js(value)},`);
  }
  lines.push("  },");
}
lines.push("};");

writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({
  output,
  cultures: cultures.length,
  keysPerCulture: cultures.length ? byCulture.get(cultures[0]).size : 0
}));
