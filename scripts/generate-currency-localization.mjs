import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const cultures = ["en-US", "ar-QA", "hi-IN", "fr-FR", "es-ES", "zh-CN", "tr-TR", "pt-PT", "ru-RU"];

const rows = [
  ["Common.Active", "Active", "نشط", "सक्रिय", "Actif", "Activo", "启用", "Aktif", "Ativo", "Активно"],
  ["Common.AuditTrail", "Audit Trail", "مسار التدقيق", "ऑडिट ट्रेल", "Piste d’audit", "Pista de auditoría", "审计跟踪", "Denetim izi", "Trilho de auditoria", "Журнал аудита"],
  ["Common.Delete", "Delete", "حذف", "हटाएं", "Supprimer", "Eliminar", "删除", "Sil", "Eliminar", "Удалить"],
  ["Common.No", "No", "لا", "नहीं", "Non", "No", "否", "Hayır", "Não", "Нет"],
  ["Common.Saving", "Saving...", "جارٍ الحفظ...", "सहेजा जा रहा है...", "Enregistrement...", "Guardando...", "正在保存...", "Kaydediliyor...", "A guardar...", "Сохранение..."],
  ["Common.Select", "Select", "اختر", "चुनें", "Sélectionner", "Seleccionar", "选择", "Seç", "Selecionar", "Выбрать"],
  ["Common.Status", "Status", "الحالة", "स्थिति", "Statut", "Estado", "状态", "Durum", "Estado", "Статус"],
  ["Common.Yes", "Yes", "نعم", "हाँ", "Oui", "Sí", "是", "Evet", "Sim", "Да"],
  ["Page.Title.Currencies", "Currencies", "العملات", "मुद्राएं", "Devises", "Monedas", "币种", "Para birimleri", "Moedas", "Валюты"],
  ["Page.Description.CurrencyMasterWithFormattingAndActivation", "Currency master with formatting and activation.", "بيانات العملات مع التنسيق والتفعيل.", "फ़ॉर्मेटिंग और सक्रियण सहित मुद्रा मास्टर।", "Référentiel devises avec formatage et activation.", "Maestro de monedas con formato y activación.", "币种主数据，包含格式和启用设置。", "Biçimlendirme ve aktivasyon ile para birimi ana verisi.", "Cadastro de moedas com formatação e ativação.", "Справочник валют с форматированием и активацией."],
  ["Page.Title.CreateCurrency", "Create Currency", "إنشاء عملة", "मुद्रा बनाएं", "Créer une devise", "Crear moneda", "创建币种", "Para birimi oluştur", "Criar moeda", "Создать валюту"],
  ["Page.Description.CreateAndActivateNewCurrency", "Create and activate new currency.", "إنشاء وتفعيل عملة جديدة.", "नई मुद्रा बनाएं और सक्रिय करें।", "Créer et activer une nouvelle devise.", "Crear y activar una nueva moneda.", "创建并启用新币种。", "Yeni para birimi oluştur ve etkinleştir.", "Criar e ativar nova moeda.", "Создать и активировать новую валюту."],
  ["Page.Title.EditCurrency", "Edit Currency", "تعديل العملة", "मुद्रा संपादित करें", "Modifier la devise", "Editar moneda", "编辑币种", "Para birimini düzenle", "Editar moeda", "Изменить валюту"],
  ["Page.Description.UpdateCurrencySetupAndItsDefaultRateToTenantBaseCurrency", "Update currency setup and its default rate to tenant base currency.", "تحديث إعداد العملة وسعرها الافتراضي إلى عملة المستأجر الأساسية.", "मुद्रा सेटअप और टेनेंट बेस मुद्रा की डिफ़ॉल्ट दर अपडेट करें।", "Mettre à jour la devise et son taux par défaut vers la devise de base du locataire.", "Actualizar moneda y su tasa predeterminada a la moneda base del tenant.", "更新币种设置及其到租户基础币种的默认汇率。", "Para birimi ayarını ve kiracı temel para birimine varsayılan kuru güncelle.", "Atualizar moeda e taxa padrão para a moeda base do tenant.", "Обновить валюту и курс по умолчанию к базовой валюте арендатора."],
  ["Page.Title.ExchangeRates", "Exchange Rates", "أسعار الصرف", "विनिमय दरें", "Taux de change", "Tipos de cambio", "汇率", "Döviz kurları", "Taxas de câmbio", "Курсы валют"],
  ["Page.Description.HistoricalAndManualOverrideRates", "Historical and manual override rates.", "أسعار تاريخية وأسعار معدلة يدويًا.", "ऐतिहासिक और मैनुअल ओवरराइड दरें।", "Taux historiques et corrections manuelles.", "Tasas históricas y anulaciones manuales.", "历史汇率和手工覆盖汇率。", "Geçmiş ve manuel geçersiz kılma kurları.", "Taxas históricas e substituições manuais.", "Исторические и вручную измененные курсы."],
  ["Page.Title.CreateExchangeRate", "Create Exchange Rate", "إنشاء سعر صرف", "विनिमय दर बनाएं", "Créer un taux de change", "Crear tipo de cambio", "创建汇率", "Döviz kuru oluştur", "Criar taxa de câmbio", "Создать курс валюты"],
  ["Page.Description.CreateOrOverrideExchangeRatesByDate", "Create or override exchange rates by date.", "إنشاء أو تعديل أسعار الصرف حسب التاريخ.", "तारीख के अनुसार विनिमय दर बनाएं या ओवरराइड करें।", "Créer ou remplacer des taux de change par date.", "Crear o sobrescribir tipos de cambio por fecha.", "按日期创建或覆盖汇率。", "Tarihe göre döviz kuru oluştur veya geçersiz kıl.", "Criar ou substituir taxas de câmbio por data.", "Создать или переопределить курсы по дате."],
  ["Page.Title.CurrencyConversion", "Currency Conversion", "تحويل العملات", "मुद्रा रूपांतरण", "Conversion de devise", "Conversión de moneda", "币种转换", "Para birimi dönüştürme", "Conversão de moeda", "Конвертация валют"],
  ["Page.Description.ConvertBetweenCurrenciesUsingSavedHistoricalRates", "Convert between currencies using saved historical rates.", "التحويل بين العملات باستخدام الأسعار التاريخية المحفوظة.", "सहेजी गई ऐतिहासिक दरों से मुद्राओं के बीच रूपांतरण करें।", "Convertir les devises avec les taux historiques enregistrés.", "Convertir entre monedas usando tasas históricas guardadas.", "使用保存的历史汇率进行币种转换。", "Kaydedilmiş geçmiş kurlarla para birimleri arasında dönüştür.", "Converter moedas usando taxas históricas guardadas.", "Конвертация валют по сохраненным историческим курсам."],
  ["Page.Title.CurrencyRevaluation", "Currency Revaluation", "إعادة تقييم العملة", "मुद्रा पुनर्मूल्यांकन", "Réévaluation devise", "Revaluación de moneda", "币种重估", "Döviz değerleme", "Reavaliação cambial", "Переоценка валюты"],
  ["Page.Description.RecordRevaluationAndVarianceForForeignBalances", "Record revaluation and variance for foreign balances.", "تسجيل إعادة التقييم والفروقات للأرصدة الأجنبية.", "विदेशी शेषों के लिए पुनर्मूल्यांकन और अंतर दर्ज करें।", "Enregistrer la réévaluation et l’écart des soldes étrangers.", "Registrar revaluación y variación de saldos extranjeros.", "记录外币余额的重估和差异。", "Yabancı bakiyeler için değerleme ve fark kaydet.", "Registar reavaliação e variação de saldos estrangeiros.", "Записать переоценку и разницу по иностранным остаткам."],
  ["Page.Title.TenantCurrencySetup", "Tenant Currency Setup", "إعداد عملات المستأجر", "टेनेंट मुद्रा सेटअप", "Configuration des devises du locataire", "Configuración de monedas del tenant", "租户币种设置", "Kiracı para birimi ayarı", "Configuração de moedas do tenant", "Настройка валют арендатора"],
  ["Page.Description.EnableCurrenciesAndDefineBaseCurrencyForTheTenant", "Enable currencies and define base currency for the tenant.", "تفعيل العملات وتحديد العملة الأساسية للمستأجر.", "टेनेंट के लिए मुद्राएं सक्षम करें और बेस मुद्रा निर्धारित करें।", "Activer les devises et définir la devise de base du locataire.", "Habilitar monedas y definir la moneda base del tenant.", "启用币种并定义租户基础币种。", "Kiracı için para birimlerini etkinleştir ve temel para birimini belirle.", "Ativar moedas e definir moeda base do tenant.", "Включить валюты и определить базовую валюту арендатора."],
  ["Currency.Amount", "Amount", "المبلغ", "राशि", "Montant", "Importe", "金额", "Tutar", "Montante", "Сумма"],
  ["Currency.Base", "Base", "أساسية", "बेस", "Base", "Base", "基础", "Temel", "Base", "Базовая"],
  ["Currency.Code", "Code", "الكود", "कोड", "Code", "Código", "代码", "Kod", "Código", "Код"],
  ["Currency.Convert", "Convert", "تحويل", "रूपांतरित करें", "Convertir", "Convertir", "转换", "Dönüştür", "Converter", "Конвертировать"],
  ["Currency.Converted", "Converted", "محول", "रूपांतरित", "Converti", "Convertido", "已转换", "Dönüştürüldü", "Convertido", "Сконвертировано"],
  ["Currency.CountryRegion", "Country/Region", "الدولة/المنطقة", "देश/क्षेत्र", "Pays/Région", "País/Región", "国家/地区", "Ülke/Bölge", "País/Região", "Страна/регион"],
  ["Currency.Currency", "Currency", "العملة", "मुद्रा", "Devise", "Moneda", "币种", "Para birimi", "Moeda", "Валюта"],
  ["Currency.CurrencyCode", "Currency Code", "كود العملة", "मुद्रा कोड", "Code devise", "Código de moneda", "币种代码", "Para birimi kodu", "Código da moeda", "Код валюты"],
  ["Currency.CurrencyName", "Currency Name", "اسم العملة", "मुद्रा नाम", "Nom de devise", "Nombre de moneda", "币种名称", "Para birimi adı", "Nome da moeda", "Название валюты"],
  ["Currency.CurrencyLower", "currency", "عملة", "मुद्रा", "devise", "moneda", "币种", "para birimi", "moeda", "валюта"],
  ["Currency.Date", "Date", "التاريخ", "तारीख", "Date", "Fecha", "日期", "Tarih", "Data", "Дата"],
  ["Currency.DecimalPlaces", "Decimal Places", "المنازل العشرية", "दशमलव स्थान", "Décimales", "Decimales", "小数位", "Ondalık basamak", "Casas decimais", "Десятичные знаки"],
  ["Currency.Decimals", "Decimals", "عشري", "दशमलव", "Décimales", "Decimales", "小数", "Ondalık", "Decimais", "Десятичные"],
  ["Currency.DefaultExchangeRateToBaseCurrency", "Default Exchange Rate to Base Currency", "سعر الصرف الافتراضي إلى العملة الأساسية", "बेस मुद्रा के लिए डिफ़ॉल्ट विनिमय दर", "Taux par défaut vers la devise de base", "Tipo de cambio predeterminado a moneda base", "到基础币种的默认汇率", "Temel para birimine varsayılan kur", "Taxa padrão para moeda base", "Курс по умолчанию к базовой валюте"],
  ["Currency.DefaultExchangeRateWithBase", "Default Exchange Rate (1 {0} = ? {1})", "سعر الصرف الافتراضي (1 {0} = ? {1})", "डिफ़ॉल्ट विनिमय दर (1 {0} = ? {1})", "Taux par défaut (1 {0} = ? {1})", "Tipo predeterminado (1 {0} = ? {1})", "默认汇率 (1 {0} = ? {1})", "Varsayılan kur (1 {0} = ? {1})", "Taxa padrão (1 {0} = ? {1})", "Курс по умолчанию (1 {0} = ? {1})"],
  ["Currency.DefaultRateHelp", "Optional. Enter how much {0} equals one unit of this currency. Saving a rate enables the currency for this tenant automatically.", "اختياري. أدخل مقدار {0} الذي يساوي وحدة واحدة من هذه العملة. حفظ السعر يفعّل العملة لهذا المستأجر تلقائيًا.", "वैकल्पिक। दर्ज करें कि इस मुद्रा की एक इकाई कितनी {0} के बराबर है। दर सहेजने से यह मुद्रा इस टेनेंट के लिए स्वतः सक्षम हो जाती है।", "Facultatif. Saisissez combien de {0} correspond à une unité de cette devise. L’enregistrement d’un taux active automatiquement cette devise pour ce locataire.", "Opcional. Indique cuánto {0} equivale a una unidad de esta moneda. Al guardar una tasa, la moneda se habilita automáticamente para este tenant.", "可选。输入该币种一单位等于多少 {0}。保存汇率会自动为此租户启用该币种。", "İsteğe bağlı. Bu para biriminin bir biriminin kaç {0} ettiğini girin. Kur kaydedilince para birimi bu kiracı için otomatik etkinleşir.", "Opcional. Indique quanto {0} equivale a uma unidade desta moeda. Ao guardar a taxa, a moeda fica ativa automaticamente para este tenant.", "Необязательно. Укажите, сколько {0} равно одной единице этой валюты. При сохранении курса валюта автоматически включается для арендатора."],
  ["Currency.BaseCurrencyRequiredHelp", "A tenant base currency must be configured before a default exchange rate can be saved.", "يجب إعداد العملة الأساسية للمستأجر قبل حفظ سعر صرف افتراضي.", "डिफ़ॉल्ट विनिमय दर सहेजने से पहले टेनेंट बेस मुद्रा कॉन्फ़िगर होनी चाहिए।", "Une devise de base du locataire doit être configurée avant d’enregistrer un taux par défaut.", "Debe configurarse una moneda base del tenant antes de guardar un tipo predeterminado.", "保存默认汇率前必须配置租户基础币种。", "Varsayılan kur kaydedilmeden önce kiracı temel para birimi yapılandırılmalıdır.", "A moeda base do tenant deve estar configurada antes de guardar uma taxa padrão.", "Перед сохранением курса по умолчанию должна быть настроена базовая валюта арендатора."],
  ["Currency.BaseCurrencyFixedRateHelp", "This is the tenant base currency and always uses exchange rate 1.", "هذه هي العملة الأساسية للمستأجر وتستخدم دائمًا سعر صرف 1.", "यह टेनेंट बेस मुद्रा है और हमेशा विनिमय दर 1 उपयोग करती है।", "C’est la devise de base du locataire et elle utilise toujours le taux 1.", "Esta es la moneda base del tenant y siempre usa tipo de cambio 1.", "这是租户基础币种，始终使用汇率 1。", "Bu kiracı temel para birimidir ve her zaman 1 kurunu kullanır.", "Esta é a moeda base do tenant e usa sempre taxa 1.", "Это базовая валюта арендатора, всегда используется курс 1."],
  ["Currency.ConfigureTenantBaseCurrencyFirst", "Configure tenant base currency first", "قم بإعداد العملة الأساسية للمستأجر أولاً", "पहले टेनेंट बेस मुद्रा कॉन्फ़िगर करें", "Configurez d’abord la devise de base du locataire", "Configure primero la moneda base del tenant", "请先配置租户基础币种", "Önce kiracı temel para birimini yapılandırın", "Configure primeiro a moeda base do tenant", "Сначала настройте базовую валюту арендатора"],
  ["Currency.DeleteCurrencyQuestion", "Delete currency?", "حذف العملة؟", "मुद्रा हटाएं?", "Supprimer la devise ?", "¿Eliminar moneda?", "删除币种？", "Para birimi silinsin mi?", "Eliminar moeda?", "Удалить валюту?"],
  ["Currency.DifferenceAmount", "Difference Amount", "مبلغ الفرق", "अंतर राशि", "Montant de l’écart", "Importe de diferencia", "差额", "Fark tutarı", "Montante da diferença", "Сумма разницы"],
  ["Currency.EffectiveDate", "Effective Date", "تاريخ السريان", "प्रभावी तारीख", "Date d’effet", "Fecha efectiva", "生效日期", "Geçerlilik tarihi", "Data efetiva", "Дата действия"],
  ["Currency.Enabled", "Enabled", "مفعلة", "सक्षम", "Activé", "Habilitado", "已启用", "Etkin", "Ativo", "Включено"],
  ["Currency.ExchangeRateEffectiveDate", "Exchange Rate Effective Date", "تاريخ سريان سعر الصرف", "विनिमय दर प्रभावी तारीख", "Date d’effet du taux", "Fecha efectiva del tipo", "汇率生效日期", "Kur geçerlilik tarihi", "Data efetiva da taxa", "Дата действия курса"],
  ["Currency.ExchangeRateExample", "Example: 1 {0} in {1}", "مثال: 1 {0} في {1}", "उदाहरण: 1 {0} में {1}", "Exemple : 1 {0} en {1}", "Ejemplo: 1 {0} en {1}", "示例：1 {0} 对 {1}", "Örnek: 1 {0}, {1} cinsinden", "Exemplo: 1 {0} em {1}", "Пример: 1 {0} в {1}"],
  ["Currency.Format", "Format", "التنسيق", "फ़ॉर्मेट", "Format", "Formato", "格式", "Biçim", "Formato", "Формат"],
  ["Currency.FormatPattern", "Format Pattern", "نمط التنسيق", "फ़ॉर्मेट पैटर्न", "Modèle de format", "Patrón de formato", "格式模式", "Biçim deseni", "Padrão de formato", "Шаблон формата"],
  ["Currency.From", "From", "من", "से", "De", "De", "从", "Kimden", "De", "Из"],
  ["Currency.FromCurrency", "From Currency", "من العملة", "मुद्रा से", "Devise source", "Moneda origen", "源币种", "Kaynak para birimi", "Moeda origem", "Из валюты"],
  ["Currency.ManualOverride", "Manual Override", "تعديل يدوي", "मैनुअल ओवरराइड", "Correction manuelle", "Anulación manual", "手工覆盖", "Manuel geçersiz kılma", "Substituição manual", "Ручное изменение"],
  ["Currency.Name", "Name", "الاسم", "नाम", "Nom", "Nombre", "名称", "Ad", "Nome", "Название"],
  ["Currency.NewCurrency", "New Currency", "عملة جديدة", "नई मुद्रा", "Nouvelle devise", "Nueva moneda", "新币种", "Yeni para birimi", "Nova moeda", "Новая валюта"],
  ["Currency.NewRate", "New Rate", "سعر جديد", "नई दर", "Nouveau taux", "Nuevo tipo", "新汇率", "Yeni kur", "Nova taxa", "Новый курс"],
  ["Currency.NoCountriesFound", "No countries found", "لم يتم العثور على دول", "कोई देश नहीं मिला", "Aucun pays trouvé", "No se encontraron países", "未找到国家", "Ülke bulunamadı", "Nenhum país encontrado", "Страны не найдены"],
  ["Currency.OriginalAmount", "Original Amount", "المبلغ الأصلي", "मूल राशि", "Montant original", "Importe original", "原始金额", "Orijinal tutar", "Montante original", "Исходная сумма"],
  ["Currency.OverrideReason", "Override Reason", "سبب التعديل", "ओवरराइड कारण", "Motif de correction", "Motivo de anulación", "覆盖原因", "Geçersiz kılma nedeni", "Motivo da substituição", "Причина изменения"],
  ["Currency.Pair", "Pair", "الزوج", "जोड़ी", "Paire", "Par", "货币对", "Parite", "Par", "Пара"],
  ["Currency.Rate", "Rate", "السعر", "दर", "Taux", "Tipo", "汇率", "Kur", "Taxa", "Курс"],
  ["Currency.RateDate", "Rate Date", "تاريخ السعر", "दर तारीख", "Date du taux", "Fecha del tipo", "汇率日期", "Kur tarihi", "Data da taxa", "Дата курса"],
  ["Currency.Reason", "Reason", "السبب", "कारण", "Motif", "Motivo", "原因", "Neden", "Motivo", "Причина"],
  ["Currency.RecordRevaluation", "Record Revaluation", "تسجيل إعادة التقييم", "पुनर्मूल्यांकन दर्ज करें", "Enregistrer la réévaluation", "Registrar revaluación", "记录重估", "Değerleme kaydet", "Registar reavaliação", "Записать переоценку"],
  ["Currency.RevaluationDate", "Revaluation Date", "تاريخ إعادة التقييم", "पुनर्मूल्यांकन तारीख", "Date de réévaluation", "Fecha de revaluación", "重估日期", "Değerleme tarihi", "Data de reavaliação", "Дата переоценки"],
  ["Currency.RevaluedAmount", "Revalued Amount", "المبلغ بعد التقييم", "पुनर्मूल्यांकित राशि", "Montant réévalué", "Importe revaluado", "重估金额", "Değerlenmiş tutar", "Montante reavaliado", "Переоцененная сумма"],
  ["Currency.RoundingPrecision", "Rounding Precision", "دقة التقريب", "राउंडिंग सटीकता", "Précision d’arrondi", "Precisión de redondeo", "舍入精度", "Yuvarlama hassasiyeti", "Precisão de arredondamento", "Точность округления"],
  ["Currency.SaveCurrency", "Save Currency", "حفظ العملة", "मुद्रा सहेजें", "Enregistrer la devise", "Guardar moneda", "保存币种", "Para birimini kaydet", "Guardar moeda", "Сохранить валюту"],
  ["Currency.SaveExchangeRate", "Save Exchange Rate", "حفظ سعر الصرف", "विनिमय दर सहेजें", "Enregistrer le taux", "Guardar tipo de cambio", "保存汇率", "Döviz kurunu kaydet", "Guardar taxa de câmbio", "Сохранить курс"],
  ["Currency.SearchCountry", "Search country", "البحث عن دولة", "देश खोजें", "Rechercher un pays", "Buscar país", "搜索国家", "Ülke ara", "Pesquisar país", "Поиск страны"],
  ["Currency.Source", "Source", "المصدر", "स्रोत", "Source", "Origen", "来源", "Kaynak", "Origem", "Источник"],
  ["Currency.SourceDocumentId", "Source Document Id (GUID)", "معرف المستند المصدر (GUID)", "स्रोत दस्तावेज़ Id (GUID)", "Id document source (GUID)", "Id documento origen (GUID)", "来源单据 Id (GUID)", "Kaynak belge Id (GUID)", "Id do documento origem (GUID)", "Id исходного документа (GUID)"],
  ["Currency.SourceDocumentType", "Source Document Type", "نوع المستند المصدر", "स्रोत दस्तावेज़ प्रकार", "Type de document source", "Tipo de documento origen", "来源单据类型", "Kaynak belge türü", "Tipo de documento origem", "Тип исходного документа"],
  ["Currency.Symbol", "Symbol", "الرمز", "प्रतीक", "Symbole", "Símbolo", "符号", "Sembol", "Símbolo", "Символ"],
  ["Currency.To", "To", "إلى", "तक", "Vers", "A", "到", "Kime", "Para", "В"],
  ["Currency.ToCurrency", "To Currency", "إلى العملة", "मुद्रा तक", "Devise cible", "Moneda destino", "目标币种", "Hedef para birimi", "Moeda destino", "В валюту"]
];

const resources = Object.fromEntries(rows.map(([key, ...values]) => [key, Object.fromEntries(cultures.map((culture, index) => [culture, values[index]]))]));

const fallback = {};
for (const culture of cultures) {
  if (culture === "en-US") continue;
  fallback[culture] = {};
  for (const [key, values] of Object.entries(resources)) fallback[culture][key] = values[culture];
}

writeFileSync(resolve("frontend/src/app/currencyLocalizationFallbacks.ts"), `export const currencyLocalizationFallbacks: Record<string, Record<string, string>> = ${JSON.stringify(fallback, null, 2)};\n`, "utf8");

const sqlRows = [];
for (const [key, values] of Object.entries(resources)) {
  for (const culture of cultures) {
    sqlRows.push({
      moduleName: key.startsWith("Common.") ? "Common" : key.startsWith("Page.") ? "Page" : "Currency",
      resourceType: key.startsWith("Page.Description.") || key.endsWith("Help") ? "Message" : key.includes("Button") ? "Button" : "Label",
      key,
      culture,
      value: values[culture]
    });
  }
}

writeSql("database/migrations/20260613_insert_missing_currency_localization.sql", false, sqlRows);
writeSql("database/migrations/20260613_update_currency_localization.sql", true, sqlRows);
console.log(JSON.stringify({ keys: Object.keys(resources).length, rows: sqlRows.length }, null, 2));

function writeSql(fileName, updateOnly, rows) {
  const values = rows.map((row) => `    (N'${sql(row.moduleName)}', N'${sql(row.resourceType)}', N'${sql(row.key)}', N'${sql(row.culture)}', N'${sql(row.value)}')`).join(",\n");
  const body = updateOnly ? updateOnlySql() : insertMissingSql();
  const output = `/* ${updateOnly ? "Updates existing" : "Inserts missing"} currency localization resources/translations. */\n\nDECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';\nDECLARE @Now datetimeoffset = SYSUTCDATETIME();\n\nDECLARE @Rows TABLE\n(\n    ModuleName nvarchar(128) NOT NULL,\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO @Rows (ModuleName, ResourceType, ResourceKey, CultureCode, ResourceValue)\nVALUES\n${values};\n\n${body}\n`;
  mkdirSync(dirname(fileName), { recursive: true });
  writeFileSync(fileName, output, "utf8");
}

function insertMissingSql() {
  return `INSERT INTO dbo.i18n_resource_groups (Id, TenantId, GroupName, Description, IsDeleted, CreatedDate)\nSELECT NEWID(), @SystemTenant, r.ModuleName, CONCAT(r.ModuleName, N' localization resources'), 0, @Now\nFROM (SELECT DISTINCT ModuleName FROM @Rows) r\nWHERE NOT EXISTS\n(\n    SELECT 1 FROM dbo.i18n_resource_groups g\n    WHERE g.TenantId = @SystemTenant AND g.GroupName = r.ModuleName AND g.IsDeleted = 0\n);\n\nINSERT INTO dbo.i18n_resource_keys\n(\n    Id, TenantId, ResourceGroupId, [Key], ResourceType, DefaultValue, IsSystem, IsActive, IsDeleted, CreatedDate\n)\nSELECT NEWID(), @SystemTenant, g.Id, r.ResourceKey, r.ResourceType, en.ResourceValue, 1, 1, 0, @Now\nFROM (SELECT DISTINCT ModuleName, ResourceType, ResourceKey FROM @Rows) r\nINNER JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = r.ModuleName AND g.IsDeleted = 0\nINNER JOIN @Rows en ON en.ModuleName = r.ModuleName AND en.ResourceType = r.ResourceType AND en.ResourceKey = r.ResourceKey AND en.CultureCode = N'en-US'\nWHERE NOT EXISTS\n(\n    SELECT 1 FROM dbo.i18n_resource_keys k\n    WHERE k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.ResourceType = r.ResourceType AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0\n);\n\nINSERT INTO dbo.i18n_resource_translations\n(\n    Id, TenantId, ResourceKeyId, LanguageId, [Value], IsApproved, IsDeleted, CreatedDate\n)\nSELECT NEWID(), @SystemTenant, k.Id, l.Id, r.ResourceValue, 1, 0, @Now\nFROM @Rows r\nINNER JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = r.ModuleName AND g.IsDeleted = 0\nINNER JOIN dbo.i18n_resource_keys k ON k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.ResourceType = r.ResourceType AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0\nINNER JOIN dbo.master_languages l ON l.CultureCode = r.CultureCode AND l.IsDeleted = 0\nWHERE NOT EXISTS\n(\n    SELECT 1 FROM dbo.i18n_resource_translations t\n    WHERE t.TenantId = @SystemTenant AND t.ResourceKeyId = k.Id AND t.LanguageId = l.Id AND t.IsDeleted = 0\n);`;
}

function updateOnlySql() {
  return `UPDATE t\nSET t.[Value] = r.ResourceValue,\n    t.IsApproved = 1,\n    t.IsDeleted = 0,\n    t.ModifiedDate = @Now\nFROM dbo.i18n_resource_translations t\nINNER JOIN dbo.i18n_resource_keys k ON k.Id = t.ResourceKeyId AND k.TenantId = @SystemTenant AND k.IsDeleted = 0\nINNER JOIN dbo.i18n_resource_groups g ON g.Id = k.ResourceGroupId AND g.TenantId = @SystemTenant AND g.IsDeleted = 0\nINNER JOIN dbo.master_languages l ON l.Id = t.LanguageId AND l.IsDeleted = 0\nINNER JOIN @Rows r ON r.ModuleName = g.GroupName AND r.ResourceType = k.ResourceType AND r.ResourceKey = k.[Key] AND r.CultureCode = l.CultureCode\nWHERE t.TenantId = @SystemTenant\n  AND t.IsDeleted = 0;`;
}

function sql(value) {
  return String(value).replace(/'/g, "''");
}
