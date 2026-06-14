import { readFileSync, writeFileSync } from "node:fs";

const input = "database/migrations/20260613_seed_all_ui_localization_resources.sql";
const output = "database/migrations/20260613_insert_missing_report_child_label_localization.sql";

const source = readFileSync(input, "utf8");
const exactReportLabels = new Map([
  row("Ledger Report", "تقرير دفتر الأستاذ", "लेजर रिपोर्ट", "Rapport grand livre", "Reporte de mayor", "分类账报表", "Defter raporu", "Relatório razão", "Отчет по счету"),
  row("General Ledger", "دفتر الأستاذ العام", "जनरल लेजर", "Grand livre général", "Libro mayor general", "总账", "Genel muhasebe defteri", "Razão geral", "Главная книга"),
  row("Customer Ledger", "دفتر أستاذ العميل", "ग्राहक लेजर", "Grand livre client", "Mayor de cliente", "客户分类账", "Müşteri ekstresi", "Razão do cliente", "Клиентская книга"),
  row("Vendor Ledger", "دفتر أستاذ المورد", "वेंडर लेजर", "Grand livre fournisseur", "Mayor de proveedor", "供应商分类账", "Tedarikçi ekstresi", "Razão do fornecedor", "Книга поставщика"),
  row("Bank Book", "دفتر البنك", "बैंक बुक", "Livre de banque", "Libro de banco", "银行日记账", "Banka defteri", "Livro de banco", "Банковская книга"),
  row("Cash Book", "دفتر الصندوق", "कैश बुक", "Livre de caisse", "Libro de caja", "现金日记账", "Kasa defteri", "Livro de caixa", "Кассовая книга"),
  row("Trial Balance", "ميزان المراجعة", "ट्रायल बैलेंस", "Balance de vérification", "Balance de comprobación", "试算表", "Mizan", "Balancete", "Оборотно-сальдовая ведомость"),
  row("Balance Sheet", "الميزانية العمومية", "बैलेंस शीट", "Bilan", "Balance general", "资产负债表", "Bilanço", "Balanço", "Баланс"),
  row("Profit & Loss", "الأرباح والخسائر", "लाभ और हानि", "Compte de résultat", "Pérdidas y ganancias", "损益表", "Kar zarar", "Lucros e perdas", "Прибыли и убытки"),
  row("Trading P&L", "أرباح وخسائر التداول", "ट्रेडिंग पी एंड एल", "P&L commercial", "P&G comercial", "交易损益", "Ticari kar zarar", "P&L comercial", "Торговые прибыли и убытки"),
  row("Tax Report", "تقرير الضريبة", "टैक्स रिपोर्ट", "Rapport fiscal", "Reporte de impuestos", "税务报表", "Vergi raporu", "Relatório fiscal", "Налоговый отчет"),
  row("Customer Outstanding", "مستحقات العملاء", "ग्राहक बकाया", "Encours clients", "Pendiente de clientes", "客户未结款", "Müşteri bakiyesi", "Pendentes de clientes", "Задолженность клиентов"),
  row("Vendor Outstanding", "مستحقات الموردين", "वेंडर बकाया", "Encours fournisseurs", "Pendiente de proveedores", "供应商未结款", "Tedarikçi bakiyesi", "Pendentes de fornecedores", "Задолженность поставщикам"),
  row("Statement of Account", "كشف الحساب", "खाता विवरण", "Relevé de compte", "Estado de cuenta", "对账单", "Hesap ekstresi", "Extrato de conta", "Выписка по счету"),
  row("Currency Gain/Loss", "ربح/خسارة العملة", "मुद्रा लाभ/हानि", "Gain/perte de change", "Ganancia/pérdida cambiaria", "汇兑损益", "Kur kar/zararı", "Ganho/perda cambial", "Курсовая прибыль/убыток"),
  row("Currency Revaluation", "إعادة تقييم العملة", "मुद्रा पुनर्मूल्यांकन", "Réévaluation devise", "Revaluación de moneda", "货币重估", "Döviz değerleme", "Reavaliação cambial", "Переоценка валюты"),
  row("Quotation Report", "تقرير عروض الأسعار", "कोटेशन रिपोर्ट", "Rapport des devis", "Reporte de cotizaciones", "报价报表", "Teklif raporu", "Relatório de cotações", "Отчет по предложениям"),
  row("Goods Receipt Report", "تقرير استلام البضائع", "गुड्स रिसीट रिपोर्ट", "Rapport réception marchandises", "Reporte de recepción de mercancía", "收货报表", "Mal kabul raporu", "Relatório de receção de mercadorias", "Отчет по приемке груза"),
  row("Warehouse Stock Report", "تقرير مخزون المستودع", "वेयरहाउस स्टॉक रिपोर्ट", "Rapport stock entrepôt", "Reporte de stock de almacén", "仓库库存报表", "Depo stok raporu", "Relatório de stock de armazém", "Отчет складских остатков"),
  row("Pickup Report", "تقرير الاستلام", "पिकअप रिपोर्ट", "Rapport enlèvement", "Reporte de recogida", "提货报表", "Alım raporu", "Relatório de recolha", "Отчет по забору груза"),
  row("House Shipment Report", "تقرير الشحنات الفرعية", "हाउस शिपमेंट रिपोर्ट", "Rapport expéditions house", "Reporte de embarques house", "分运单货运报表", "House sevkiyat raporu", "Relatório de remessas house", "Отчет по house отправкам"),
  row("Master Shipment Report", "تقرير الشحنات الرئيسية", "मास्टर शिपमेंट रिपोर्ट", "Rapport expéditions master", "Reporte de embarques master", "主运单货运报表", "Master sevkiyat raporu", "Relatório de remessas master", "Отчет по master отправкам"),
  row("Direct Shipment Report", "تقرير الشحنات المباشرة", "डायरेक्ट शिपमेंट रिपोर्ट", "Rapport expéditions directes", "Reporte de embarques directos", "直运货运报表", "Direkt sevkiyat raporu", "Relatório de remessas diretas", "Отчет по прямым отправкам"),
  row("Air Freight Report", "تقرير الشحن الجوي", "एयर फ्रेट रिपोर्ट", "Rapport fret aérien", "Reporte de carga aérea", "空运报表", "Hava kargo raporu", "Relatório de frete aéreo", "Отчет по авиаперевозкам"),
  row("Sea Freight Report", "تقرير الشحن البحري", "सी फ्रेट रिपोर्ट", "Rapport fret maritime", "Reporte de carga marítima", "海运报表", "Deniz kargo raporu", "Relatório de frete marítimo", "Отчет по морским перевозкам"),
  row("Road Freight Report", "تقرير الشحن البري", "रोड फ्रेट रिपोर्ट", "Rapport fret routier", "Reporte de carga terrestre", "陆运报表", "Karayolu kargo raporu", "Relatório de frete rodoviário", "Отчет по автоперевозкам"),
  row("Courier Report", "تقرير البريد السريع", "कूरियर रिपोर्ट", "Rapport courrier", "Reporte de courier", "快递报表", "Kurye raporu", "Relatório de courier", "Отчет по курьерским отправкам"),
  row("Customs Report", "تقرير الجمارك", "कस्टम्स रिपोर्ट", "Rapport douane", "Reporte de aduana", "海关报表", "Gümrük raporu", "Relatório alfandegário", "Таможенный отчет"),
  row("Container Report", "تقرير الحاويات", "कंटेनर रिपोर्ट", "Rapport conteneurs", "Reporte de contenedores", "集装箱报表", "Konteyner raporu", "Relatório de contentores", "Отчет по контейнерам"),
  row("Unbilled Shipment", "الشحنات غير المفوترة", "अनबिल्ड शिपमेंट", "Expéditions non facturées", "Embarques no facturados", "未开票货运", "Faturalanmamış sevkiyat", "Remessas não faturadas", "Неофактурованные отправки"),
  row("Pending Bill Report", "تقرير الفواتير المعلقة", "लंबित बिल रिपोर्ट", "Rapport factures en attente", "Reporte de facturas pendientes", "待处理账单报表", "Bekleyen fatura raporu", "Relatório de contas pendentes", "Отчет по ожидающим счетам"),
  row("Pending POD Report", "تقرير إثبات التسليم المعلق", "लंबित POD रिपोर्ट", "Rapport POD en attente", "Reporte POD pendiente", "待处理POD报表", "Bekleyen POD raporu", "Relatório POD pendente", "Отчет по ожидающим POD"),
  row("Pending Document Report", "تقرير المستندات المعلقة", "लंबित दस्तावेज़ रिपोर्ट", "Rapport documents en attente", "Reporte de documentos pendientes", "待处理文档报表", "Bekleyen belge raporu", "Relatório de documentos pendentes", "Отчет по ожидающим документам"),
  row("Shipment Ageing", "تقادم الشحنات", "शिपमेंट एजिंग", "Âge des expéditions", "Antigüedad de embarques", "货运账龄", "Sevkiyat yaşlandırma", "Antiguidade das remessas", "Анализ давности отправок"),
  row("Shipment Profit", "ربح الشحنة", "शिपमेंट लाभ", "Profit expédition", "Rentabilidad de embarque", "货运利润", "Sevkiyat karı", "Lucro da remessa", "Прибыль отправки"),
  row("Customer Profit", "ربح العميل", "ग्राहक लाभ", "Profit client", "Rentabilidad de cliente", "客户利润", "Müşteri karı", "Lucro do cliente", "Прибыль клиента"),
  row("Salesman Profit", "ربح مندوب المبيعات", "सेल्समैन लाभ", "Profit commercial", "Rentabilidad de vendedor", "销售员利润", "Satışçı karı", "Lucro do vendedor", "Прибыль продавца"),
  row("Agent Profit", "ربح الوكيل", "एजेंट लाभ", "Profit agent", "Rentabilidad de agente", "代理利润", "Acente karı", "Lucro do agente", "Прибыль агента"),
  row("Branch Profit", "ربح الفرع", "शाखा लाभ", "Profit agence", "Rentabilidad de sucursal", "分支利润", "Şube karı", "Lucro da filial", "Прибыль филиала"),
  row("Route Profit", "ربح المسار", "रूट लाभ", "Profit route", "Rentabilidad de ruta", "路线利润", "Rota karı", "Lucro da rota", "Прибыль маршрута"),
  row("Destination Profit", "ربح الوجهة", "गंतव्य लाभ", "Profit destination", "Rentabilidad de destino", "目的地利润", "Varış yeri karı", "Lucro do destino", "Прибыль направления")
]);

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
    && /^Navigation\.reports\.Item\./.test(row.resourceKey)
    && row.resourceKey.endsWith(".Label")
  )
  .map((sqlRow) => {
    const english = sqlRow.cultureCode === "en-US"
      ? sqlRow.resourceValue.replace(/''/g, "'")
      : rowsEnglishValue(source, sqlRow.resourceKey);
    const exact = exactReportLabels.get(english)?.[sqlRow.cultureCode];
    return exact ? { ...sqlRow, resourceValue: exact.replace(/'/g, "''") } : sqlRow;
  });

function row(en, ar, hi, fr, es, zh, tr, pt, ru) {
  return [en, { "en-US": en, "ar-QA": ar, "hi-IN": hi, "fr-FR": fr, "es-ES": es, "zh-CN": zh, "tr-TR": tr, "pt-PT": pt, "ru-RU": ru }];
}

function rowsEnglishValue(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\(N'Navigation', N'Menu', N'${escaped}', N'en-US', N'((?:''|[^'])*)'\\)`));
  return match ? match[1].replace(/''/g, "'") : "";
}

const lines = [
  "/* Inserts only missing report child menu label localization resources/translations.",
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
  "",
  "INSERT INTO @Rows (ModuleName, ResourceType, ResourceKey, CultureCode, ResourceValue)",
  "VALUES",
  rows.map((row, index) =>
    `    (N'${row.moduleName}', N'${row.resourceType}', N'${row.resourceKey}', N'${row.cultureCode}', N'${row.resourceValue}')${index === rows.length - 1 ? ";" : ","}`
  ).join("\n"),
  "",
  `INSERT INTO dbo.i18n_resource_groups (Id, TenantId, GroupName, Description, IsDeleted, CreatedDate)
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
);`
];

writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({
  output,
  rowCount: rows.length,
  keyCount: new Set(rows.map((row) => row.resourceKey)).size
}));
