import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const cultures = ["en-US", "ar-QA", "hi-IN", "fr-FR", "es-ES", "zh-CN", "tr-TR", "pt-PT", "ru-RU"];
const sourcePath = "frontend/src/modules/rateMasters/rateMasterI18n.ts";
const source = readFileSync(resolve(sourcePath), "utf8");
const match = source.match(/const catalogs:[^=]+=\s*(\{[\s\S]*?\n\});/);
if (!match) throw new Error("Unable to read Rate Master localization catalogs.");
const catalogs = Function(`"use strict"; return (${match[1]});`)();
const supplementalMatch = source.match(/const supplementalCatalogs:[^=]+=\s*(\{[\s\S]*?\n\});/);
if (!supplementalMatch) throw new Error("Unable to read Rate Master supplemental localization catalogs.");
const supplementalCatalogs = Function(`"use strict"; return (${supplementalMatch[1]});`)();
const files = [
  "frontend/src/modules/rateMasters/RateCalculatorPreviewPage.tsx",
  "frontend/src/modules/rateMasters/RateMasterChargesTab.tsx",
  "frontend/src/modules/rateMasters/RateMasterCreatePage.tsx",
  "frontend/src/modules/rateMasters/RateMasterEditPage.tsx",
  "frontend/src/modules/rateMasters/RateMasterForm.tsx",
  "frontend/src/modules/rateMasters/RateMasterListPage.tsx",
  "frontend/src/modules/rateMasters/RateMasterSlabsTab.tsx",
  "frontend/src/modules/rateMasters/RateMasterViewPage.tsx",
  "frontend/src/modules/rateMasters/rateMasterValidation.ts"
];

const values = new Set([
  ...Object.values(catalogs).flatMap((catalog) => Object.keys(catalog)),
  ...Object.values(supplementalCatalogs).flatMap((catalog) => Object.keys(catalog))
]);
for (const file of files) {
  const fileSource = readFileSync(resolve(file), "utf8");
  for (const literal of fileSource.matchAll(/\b(?:r|t)\("((?:\\"|[^"])*)"\)/g)) values.add(literal[1].replaceAll('\\"', '"'));
}

const rows = [];
const missing = [];
for (const value of [...values].sort()) {
  for (const culture of cultures) {
    const translated = culture === "en-US" ? value : supplementalCatalogs[culture]?.[value] ?? catalogs[culture]?.[value];
    if (!translated && culture !== "en-US") missing.push({ culture, value });
    rows.push({ resourceType: classify(value), key: `RateMaster.${keyify(value)}`, culture, value: translated ?? value });
  }
}

writeSql("database/migrations/20260613_insert_missing_rate_master_localization.sql", false, rows);
writeSql("database/migrations/20260613_update_rate_master_localization.sql", true, rows);
console.log(JSON.stringify({ resources: values.size, rows: rows.length, missing: missing.length, missingValues: [...new Set(missing.map((item) => item.value))] }, null, 2));

function keyify(value) {
  return value.replace(/[^A-Za-z0-9]+(.)/g, (_, character) => character.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
}

function classify(value) {
  if (/^(Activate|Add|Create|Deactivate|Delete|Edit|New|Preview|Reset|Save|View)/.test(value)) return "Button";
  if (value.endsWith("?")) return "Confirmation";
  if (value.endsWith(".") || value.includes("required") || value.includes("cannot")) return "Message";
  return "Label";
}

function writeSql(fileName, updateOnly, allRows) {
  const batches = chunk(allRows, 800);
  const declarations = batches.map((batch, index) => {
    const table = `@Rows${index + 1}`;
    const valuesSql = batch.map((row) => `    (N'${sql(row.resourceType)}', N'${sql(row.key)}', N'${sql(row.culture)}', N'${sql(row.value)}')`).join(",\n");
    return `DECLARE ${table} TABLE\n(\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO ${table} (ResourceType, ResourceKey, CultureCode, ResourceValue)\nVALUES\n${valuesSql};`;
  }).join("\n\n");
  const union = batches.map((_, index) => `SELECT * FROM @Rows${index + 1}`).join("\nUNION ALL\n");
  const operation = updateOnly ? updateSql() : insertSql();
  const output = `/* ${updateOnly ? "Updates existing" : "Inserts missing"} Rate Master frontend localization resources. */\n\nDECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';\nDECLARE @Now datetimeoffset = SYSUTCDATETIME();\nDECLARE @ModuleName nvarchar(128) = N'RateMaster';\n\n${declarations}\n\nDECLARE @Rows TABLE\n(\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO @Rows\n${union};\n\n${operation}\n`;
  mkdirSync(dirname(fileName), { recursive: true });
  writeFileSync(fileName, output, "utf8");
}

function insertSql() {
  return `IF NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_groups WHERE TenantId = @SystemTenant AND GroupName = @ModuleName AND IsDeleted = 0)
BEGIN
    INSERT INTO dbo.i18n_resource_groups (Id, TenantId, GroupName, Description, IsDeleted, CreatedDate)
    VALUES (NEWID(), @SystemTenant, @ModuleName, N'Rate Master frontend localization resources', 0, @Now);
END;

INSERT INTO dbo.i18n_resource_keys (Id, TenantId, ResourceGroupId, [Key], ResourceType, DefaultValue, IsSystem, IsActive, IsDeleted, CreatedDate)
SELECT NEWID(), @SystemTenant, g.Id, r.ResourceKey, r.ResourceType, en.ResourceValue, 1, 1, 0, @Now
FROM (SELECT DISTINCT ResourceType, ResourceKey FROM @Rows) r
JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = @ModuleName AND g.IsDeleted = 0
JOIN @Rows en ON en.ResourceType = r.ResourceType AND en.ResourceKey = r.ResourceKey AND en.CultureCode = N'en-US'
WHERE NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_keys k WHERE k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0);

INSERT INTO dbo.i18n_resource_translations (Id, TenantId, ResourceKeyId, LanguageId, [Value], IsApproved, IsDeleted, CreatedDate)
SELECT NEWID(), @SystemTenant, k.Id, l.Id, r.ResourceValue, 1, 0, @Now
FROM @Rows r
JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = @ModuleName AND g.IsDeleted = 0
JOIN dbo.i18n_resource_keys k ON k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0
JOIN dbo.master_languages l ON l.CultureCode = r.CultureCode AND l.IsDeleted = 0
WHERE NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_translations t WHERE t.TenantId = @SystemTenant AND t.ResourceKeyId = k.Id AND t.LanguageId = l.Id AND t.IsDeleted = 0);`;
}

function updateSql() {
  return `UPDATE t SET t.[Value] = r.ResourceValue, t.IsApproved = 1, t.IsDeleted = 0, t.ModifiedDate = @Now
FROM dbo.i18n_resource_translations t
JOIN dbo.i18n_resource_keys k ON k.Id = t.ResourceKeyId AND k.TenantId = @SystemTenant AND k.IsDeleted = 0
JOIN dbo.i18n_resource_groups g ON g.Id = k.ResourceGroupId AND g.TenantId = @SystemTenant AND g.GroupName = @ModuleName AND g.IsDeleted = 0
JOIN dbo.master_languages l ON l.Id = t.LanguageId AND l.IsDeleted = 0
JOIN @Rows r ON r.ResourceKey = k.[Key] AND r.CultureCode = l.CultureCode
WHERE t.TenantId = @SystemTenant AND t.IsDeleted = 0;`;
}

function chunk(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

function sql(value) {
  return String(value).replaceAll("'", "''");
}
