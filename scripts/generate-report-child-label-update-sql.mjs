import { readFileSync, writeFileSync } from "node:fs";

const input = "database/migrations/20260613_insert_missing_report_child_label_localization.sql";
const output = "database/migrations/20260613_update_report_child_label_localization.sql";
const source = readFileSync(input, "utf8");

const rows = [...source.matchAll(/\(N'Navigation', N'Menu', N'((?:''|[^'])*)', N'((?:''|[^'])*)', N'((?:''|[^'])*)'\)/g)]
  .map((match) => ({
    resourceKey: match[1],
    cultureCode: match[2],
    resourceValue: match[3]
  }))
  .filter((row) => row.cultureCode !== "en-US");

const lines = [
  "/* Updates only existing report child menu label translations.",
  "   Use this when the translation rows already exist but still contain English/fallback text. */",
  "",
  "DECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';",
  "DECLARE @Now datetimeoffset = SYSUTCDATETIME();",
  "",
  "DECLARE @Rows TABLE",
  "(",
  "    ResourceKey nvarchar(256) NOT NULL,",
  "    CultureCode nvarchar(20) NOT NULL,",
  "    ResourceValue nvarchar(2048) NOT NULL",
  ");",
  "",
  "INSERT INTO @Rows (ResourceKey, CultureCode, ResourceValue)",
  "VALUES",
  rows.map((row, index) =>
    `    (N'${row.resourceKey}', N'${row.cultureCode}', N'${row.resourceValue}')${index === rows.length - 1 ? ";" : ","}`
  ).join("\n"),
  "",
  `UPDATE t
SET
    t.Value = r.ResourceValue,
    t.IsApproved = 1,
    t.IsDeleted = 0,
    t.ModifiedDate = @Now
FROM dbo.i18n_resource_translations t
INNER JOIN dbo.i18n_resource_keys k
    ON k.Id = t.ResourceKeyId
   AND k.TenantId = @SystemTenant
   AND k.IsDeleted = 0
INNER JOIN dbo.i18n_resource_groups g
    ON g.Id = k.ResourceGroupId
   AND g.TenantId = @SystemTenant
   AND g.GroupName = N'Navigation'
   AND g.IsDeleted = 0
INNER JOIN dbo.master_languages l
    ON l.Id = t.LanguageId
   AND l.IsDeleted = 0
INNER JOIN @Rows r
    ON r.ResourceKey = k.[Key]
   AND r.CultureCode = l.CultureCode
WHERE t.TenantId = @SystemTenant
  AND t.IsDeleted = 0
  AND k.ResourceType = N'Menu'
  AND k.[Key] LIKE N'Navigation.reports.Item.%.Label';`
];

writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({
  output,
  rowCount: rows.length,
  keyCount: new Set(rows.map((row) => row.resourceKey)).size
}));
