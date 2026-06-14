import { readFileSync, writeFileSync } from "node:fs";

const input = "database/migrations/20260613_seed_all_ui_localization_resources.sql";
const output = "database/migrations/20260613_insert_missing_report_audit_child_menu_localization.sql";

const source = readFileSync(input, "utf8");
const rows = [...source.matchAll(/\(N'((?:''|[^'])*)', N'((?:''|[^'])*)', N'((?:''|[^'])*)', N'((?:''|[^'])*)', N'((?:''|[^'])*)'\)/g)]
  .map((match) => ({
    moduleName: match[1],
    resourceType: match[2],
    resourceKey: match[3],
    cultureCode: match[4],
    resourceValue: match[5]
  }))
  .filter((row) =>
    row.moduleName === "Navigation"
    && row.resourceType === "Menu"
    && (/^Navigation\.reports\.Item\./.test(row.resourceKey) || /^Navigation\.audit-logs\.Item\./.test(row.resourceKey))
  );

const lines = [
  "/* Inserts only missing child side-menu localization resources/translations for Reports and Audit Logs.",
  "   Existing resources/translations are not updated. */",
  "",
  "DECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';",
  "DECLARE @Now datetimeoffset = SYSUTCDATETIME();",
  "",
  "DECLARE @Rows TABLE",
  "(",
  "    ModuleName nvarchar(128) NOT NULL,",
  "    ResourceType nvarchar(64) NOT NULL,",
  "    ResourceKey nvarchar(256) NOT NULL,",
  "    CultureCode nvarchar(20) NOT NULL,",
  "    ResourceValue nvarchar(2048) NOT NULL",
  ");",
  ""
];

for (let start = 0; start < rows.length; start += 900) {
  const chunk = rows.slice(start, start + 900);
  lines.push("INSERT INTO @Rows (ModuleName, ResourceType, ResourceKey, CultureCode, ResourceValue)");
  lines.push("VALUES");
  lines.push(chunk.map((row, index) =>
    `    (N'${row.moduleName}', N'${row.resourceType}', N'${row.resourceKey}', N'${row.cultureCode}', N'${row.resourceValue}')${index === chunk.length - 1 ? ";" : ","}`
  ).join("\n"));
  lines.push("");
}

lines.push(`INSERT INTO dbo.i18n_resource_groups (Id, TenantId, GroupName, Description, IsDeleted, CreatedDate)
SELECT NEWID(), @SystemTenant, r.ModuleName, CONCAT(r.ModuleName, N' localization resources'), 0, @Now
FROM (SELECT DISTINCT ModuleName FROM @Rows) r
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.i18n_resource_groups g
    WHERE g.TenantId = @SystemTenant
      AND g.GroupName = r.ModuleName
      AND g.IsDeleted = 0
);

INSERT INTO dbo.i18n_resource_keys
(
    Id,
    TenantId,
    ResourceGroupId,
    [Key],
    ResourceType,
    DefaultValue,
    IsSystem,
    IsActive,
    IsDeleted,
    CreatedDate
)
SELECT
    NEWID(),
    @SystemTenant,
    g.Id,
    r.ResourceKey,
    r.ResourceType,
    en.ResourceValue,
    1,
    1,
    0,
    @Now
FROM (SELECT DISTINCT ModuleName, ResourceType, ResourceKey FROM @Rows) r
INNER JOIN dbo.i18n_resource_groups g
    ON g.TenantId = @SystemTenant
   AND g.GroupName = r.ModuleName
   AND g.IsDeleted = 0
INNER JOIN @Rows en
    ON en.ModuleName = r.ModuleName
   AND en.ResourceType = r.ResourceType
   AND en.ResourceKey = r.ResourceKey
   AND en.CultureCode = N'en-US'
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.i18n_resource_keys k
    WHERE k.TenantId = @SystemTenant
      AND k.ResourceGroupId = g.Id
      AND k.ResourceType = r.ResourceType
      AND k.[Key] = r.ResourceKey
      AND k.IsDeleted = 0
);

INSERT INTO dbo.i18n_resource_translations
(
    Id,
    TenantId,
    ResourceKeyId,
    LanguageId,
    Value,
    IsApproved,
    IsDeleted,
    CreatedDate
)
SELECT
    NEWID(),
    @SystemTenant,
    k.Id,
    l.Id,
    r.ResourceValue,
    1,
    0,
    @Now
FROM @Rows r
INNER JOIN dbo.i18n_resource_groups g
    ON g.TenantId = @SystemTenant
   AND g.GroupName = r.ModuleName
   AND g.IsDeleted = 0
INNER JOIN dbo.i18n_resource_keys k
    ON k.TenantId = @SystemTenant
   AND k.ResourceGroupId = g.Id
   AND k.ResourceType = r.ResourceType
   AND k.[Key] = r.ResourceKey
   AND k.IsDeleted = 0
INNER JOIN dbo.master_languages l
    ON l.CultureCode = r.CultureCode
   AND l.IsDeleted = 0
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.i18n_resource_translations t
    WHERE t.TenantId = @SystemTenant
      AND t.ResourceKeyId = k.Id
      AND t.LanguageId = l.Id
      AND t.IsDeleted = 0
);`);

writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({
  output,
  rowCount: rows.length,
  keyCount: new Set(rows.map((row) => row.resourceKey)).size,
  insertBlocks: Math.ceil(rows.length / 900)
}));
