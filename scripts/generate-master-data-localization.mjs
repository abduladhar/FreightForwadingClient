import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const cultures = ["en-US", "ar-QA", "hi-IN", "fr-FR", "es-ES", "zh-CN", "tr-TR", "pt-PT", "ru-RU"];
const source = readFileSync(resolve("frontend/src/modules/masterDataI18n.ts"), "utf8");
const objectMatch = source.match(/const translations:[^=]+=\s*(\{[\s\S]*?\n\});/);
if (!objectMatch) throw new Error("Unable to read master-data translations.");
const translations = Function(`"use strict"; return (${objectMatch[1]});`)();
const optionMatch = source.match(/const optionTranslations:[^=]+=\s*(\{[\s\S]*?\n\});/);
const optionTranslations = optionMatch ? Function(`"use strict"; return (${optionMatch[1]});`)() : {};

const files = [
  ...paths("vendors", ["VendorListPage", "VendorCreatePage", "VendorEditPage", "VendorViewPage", "VendorForm"]),
  ...paths("agents", ["AgentListPage", "AgentCreatePage", "AgentEditPage", "AgentViewPage", "AgentForm", "AgentCommissionSettingsPage"]),
  ...paths("carriers", ["CarrierListPage", "CarrierCreatePage", "CarrierEditPage", "CarrierForm"]),
  ...paths("countries", ["CountryListPage", "CountryCreatePage", "CountryEditPage", "CountryForm"]),
  ...paths("packageTypes", ["PackageTypeListPage", "PackageTypeCreatePage", "PackageTypeEditPage", "PackageTypeForm"]),
  ...paths("shippingPorts", ["ShippingPortListPage", "ShippingPortCreatePage", "ShippingPortEditPage", "ShippingPortForm"]),
  ...paths("jobTypes", ["JobTypeListPage", "JobTypeCreatePage", "JobTypeEditPage", "JobTypeForm"]),
  ...paths("warehouses", ["WarehouseListPage", "WarehouseCreatePage", "WarehouseEditPage", "WarehouseForm"]),
  ...paths("chargeHeads", ["ChargeHeadListPage", "ChargeHeadCreatePage", "ChargeHeadEditPage", "ChargeHeadForm"]),
  ...paths("taxes", ["TaxRuleListPage", "TaxRuleForm"]),
  "frontend/src/components/common/DataTable.tsx",
  "frontend/src/components/common/SearchFilterBar.tsx",
  "frontend/src/components/common/EmptyState.tsx",
  "frontend/src/components/common/ErrorState.tsx"
];

const resources = new Map();
for (const file of files) {
  const text = readFileSync(resolve(file), "utf8");
  const moduleName = text.match(/useMasterDataI18n\("([^"]+)"\)/)?.[1];
  if (!moduleName) continue;
  for (const match of text.matchAll(/\bm\("((?:\\"|[^"])*)"\)/g)) {
    const value = match[1].replaceAll('\\"', '"');
    resources.set(`MasterData.${moduleName}.${keyify(value)}`, { moduleName, value });
  }
}

const rows = [];
for (const [key, resource] of resources) {
  for (const culture of cultures) {
    rows.push({
      moduleName: resource.moduleName,
      resourceType: classify(resource.value),
      key,
      culture,
      value: culture === "en-US" ? resource.value : localizeValue(culture, resource.value)
    });
  }
}

writeSql("database/migrations/20260613_insert_missing_master_data_localization.sql", false, rows);
writeSql("database/migrations/20260613_update_master_data_localization.sql", true, rows);
console.log(JSON.stringify({ resources: resources.size, rows: rows.length }, null, 2));

function paths(folder, names) {
  return names.map((name) => `frontend/src/modules/${folder}/${name}.tsx`);
}

function keyify(value) {
  return value.replace(/[^A-Za-z0-9]+(.)/g, (_, character) => character.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
}

function localizeValue(culture, value) {
  const catalog = { ...translations[culture], ...optionTranslations[culture] };
  if (!catalog) return value;
  const lookup = (text) => catalog[text] ?? Object.entries(catalog).find(([key]) => key.toLocaleLowerCase() === text.toLocaleLowerCase())?.[1];
  const direct = lookup(value);
  if (direct) return direct;
  for (const prefix of ["New", "Create", "Edit", "Delete", "View", "Save", "Select"]) {
    if (value.startsWith(`${prefix} `)) {
      const subject = value.slice(prefix.length + 1);
      const localizedPrefix = lookup(prefix);
      const localizedSubject = localizeValue(culture, subject);
      if (localizedPrefix && localizedSubject !== subject) return `${localizedPrefix} ${localizedSubject}`;
    }
  }
  for (const suffix of ["Code", "Name", "Type"]) {
    if (value.toLocaleLowerCase().endsWith(` ${suffix.toLocaleLowerCase()}`)) {
      const subject = value.slice(0, -(suffix.length + 1));
      const localizedSubject = lookup(subject);
      const localizedSuffix = lookup(suffix);
      if (localizedSubject && localizedSuffix) return `${localizedSubject} ${localizedSuffix}`;
    }
  }
  if (value.toLocaleLowerCase().startsWith("filter by ")) {
    const subject = value.slice("Filter by ".length);
    return `${lookup("Filter by") ?? "Filter by"} ${localizeValue(culture, subject)}`;
  }
  if (value.toLocaleLowerCase().startsWith("loading ")) {
    const subject = value.slice("Loading ".length);
    return `${lookup("Loading") ?? "Loading"} ${localizeValue(culture, subject)}`;
  }
  return value;
}

function classify(value) {
  if (/^(Save|New|Create|Edit|Delete|View|Activate|Deactivate|Continue|Review)/.test(value)) return "Button";
  if (value.endsWith("?") || value.includes("cannot be changed")) return "Confirmation";
  if (value.endsWith(".")) return "Message";
  return "Label";
}

function writeSql(fileName, updateOnly, allRows) {
  const batches = chunk(allRows, 800);
  const declarations = batches.map((batch, index) => {
    const table = `@Rows${index + 1}`;
    const values = batch.map((row) =>
      `    (N'${sql(row.moduleName)}', N'${sql(row.resourceType)}', N'${sql(row.key)}', N'${sql(row.culture)}', N'${sql(row.value)}')`
    ).join(",\n");
    return `DECLARE ${table} TABLE\n(\n    ModuleName nvarchar(128) NOT NULL,\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO ${table} (ModuleName, ResourceType, ResourceKey, CultureCode, ResourceValue)\nVALUES\n${values};`;
  }).join("\n\n");
  const union = batches.map((_, index) => `SELECT * FROM @Rows${index + 1}`).join("\nUNION ALL\n");
  const body = updateOnly ? updateOnlySql() : insertMissingSql();
  const output = `/* ${updateOnly ? "Updates existing" : "Inserts missing"} localization for Vendors, Agents, Carriers, Countries, Package Types, Shipping Ports, Job Types, Warehouses, Charge Heads and Tax Rules. */\n\nDECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';\nDECLARE @Now datetimeoffset = SYSUTCDATETIME();\n\n${declarations}\n\nDECLARE @Rows TABLE\n(\n    ModuleName nvarchar(128) NOT NULL,\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO @Rows\n${union};\n\n${body}\n`;
  mkdirSync(dirname(fileName), { recursive: true });
  writeFileSync(fileName, output, "utf8");
}

function insertMissingSql() {
  return `INSERT INTO dbo.i18n_resource_groups (Id, TenantId, GroupName, Description, IsDeleted, CreatedDate)
SELECT NEWID(), @SystemTenant, r.ModuleName, CONCAT(r.ModuleName, N' master localization resources'), 0, @Now
FROM (SELECT DISTINCT ModuleName FROM @Rows) r
WHERE NOT EXISTS
(
    SELECT 1 FROM dbo.i18n_resource_groups g
    WHERE g.TenantId = @SystemTenant AND g.GroupName = r.ModuleName AND g.IsDeleted = 0
);

INSERT INTO dbo.i18n_resource_keys
(
    Id, TenantId, ResourceGroupId, [Key], ResourceType, DefaultValue, IsSystem, IsActive, IsDeleted, CreatedDate
)
SELECT NEWID(), @SystemTenant, g.Id, r.ResourceKey, r.ResourceType, en.ResourceValue, 1, 1, 0, @Now
FROM (SELECT DISTINCT ModuleName, ResourceType, ResourceKey FROM @Rows) r
INNER JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = r.ModuleName AND g.IsDeleted = 0
INNER JOIN @Rows en ON en.ModuleName = r.ModuleName AND en.ResourceType = r.ResourceType AND en.ResourceKey = r.ResourceKey AND en.CultureCode = N'en-US'
WHERE NOT EXISTS
(
    SELECT 1 FROM dbo.i18n_resource_keys k
    WHERE k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.ResourceType = r.ResourceType AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0
);

INSERT INTO dbo.i18n_resource_translations
(
    Id, TenantId, ResourceKeyId, LanguageId, [Value], IsApproved, IsDeleted, CreatedDate
)
SELECT NEWID(), @SystemTenant, k.Id, l.Id, r.ResourceValue, 1, 0, @Now
FROM @Rows r
INNER JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = r.ModuleName AND g.IsDeleted = 0
INNER JOIN dbo.i18n_resource_keys k ON k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.ResourceType = r.ResourceType AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0
INNER JOIN dbo.master_languages l ON l.CultureCode = r.CultureCode AND l.IsDeleted = 0
WHERE NOT EXISTS
(
    SELECT 1 FROM dbo.i18n_resource_translations t
    WHERE t.TenantId = @SystemTenant AND t.ResourceKeyId = k.Id AND t.LanguageId = l.Id AND t.IsDeleted = 0
);`;
}

function updateOnlySql() {
  return `UPDATE t
SET t.[Value] = r.ResourceValue,
    t.IsApproved = 1,
    t.IsDeleted = 0,
    t.ModifiedDate = @Now
FROM dbo.i18n_resource_translations t
INNER JOIN dbo.i18n_resource_keys k ON k.Id = t.ResourceKeyId AND k.TenantId = @SystemTenant AND k.IsDeleted = 0
INNER JOIN dbo.i18n_resource_groups g ON g.Id = k.ResourceGroupId AND g.TenantId = @SystemTenant AND g.IsDeleted = 0
INNER JOIN dbo.master_languages l ON l.Id = t.LanguageId AND l.IsDeleted = 0
INNER JOIN @Rows r ON r.ModuleName = g.GroupName AND r.ResourceType = k.ResourceType AND r.ResourceKey = k.[Key] AND r.CultureCode = l.CultureCode
WHERE t.TenantId = @SystemTenant
  AND t.IsDeleted = 0;`;
}

function chunk(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

function sql(value) {
  return String(value).replaceAll("'", "''");
}
