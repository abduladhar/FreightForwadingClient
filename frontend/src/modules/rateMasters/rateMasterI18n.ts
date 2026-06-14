import { useI18n } from "@/app/i18n";
import { useWorkspace } from "@/hooks/useWorkspace";

type Catalog = Record<string, string>;

const catalogs: Record<string, Catalog> = {
  "ar-QA": {
    "Rate Master": "دليل الأسعار", "New Rate": "سعر جديد", "Create Rate Master": "إنشاء دليل أسعار", Edit: "تعديل", Preview: "معاينة",
    Calculator: "الحاسبة", Code: "الرمز", Name: "الاسم", Scope: "النطاق", Mode: "الوسيلة", Shipment: "الشحنة", Status: "الحالة",
    "Valid From": "صالح من", "Valid To": "صالح حتى", Active: "نشط", Inactive: "غير نشط", Delete: "حذف", "Delete rate master?": "حذف دليل الأسعار؟",
    Core: "الأساسي", Charges: "الرسوم", "Rate Code": "رمز السعر", "Rate Name": "اسم السعر", "Rate Scope": "نطاق السعر",
    General: "عام", Customer: "العميل", Vendor: "المورد", Agent: "الوكيل", "Select customer": "اختر العميل", "Select vendor": "اختر المورد",
    "Select agent": "اختر الوكيل", "Origin Port": "ميناء المنشأ", "Destination Port": "ميناء الوجهة", "Select origin port": "اختر ميناء المنشأ",
    "Select destination port": "اختر ميناء الوجهة", Country: "الدولة", "Select country": "اختر الدولة", City: "المدينة", Zone: "المنطقة",
    "Mode of Transport": "وسيلة النقل", "Shipment Type": "نوع الشحنة", "Rate Basis": "أساس السعر", Weight: "الوزن", Volume: "الحجم",
    Pieces: "القطع", ChargeableWeight: "الوزن المحتسب", Distance: "المسافة", Flat: "ثابت", Slab: "شريحة", Air: "جوي", Sea: "بحري",
    Road: "بري", Courier: "بريد سريع", House: "فرعي", Master: "رئيسي", Direct: "مباشر", "Minimum Charge": "الحد الأدنى للرسم",
    "Maximum Charge": "الحد الأقصى للرسم", Currency: "العملة", "Select currency": "اختر العملة", "Tax Applicable": "تطبق الضريبة",
    Applicable: "مطبق", "Not applicable": "غير مطبق", "Tax Rate": "معدل الضريبة", "Save Rate Master": "حفظ دليل الأسعار", "Saving...": "جارٍ الحفظ...",
    "Charge Head": "بند الرسم", "Add Charge Head": "إضافة بند رسم", "No charge heads configured.": "لم يتم إعداد بنود رسوم.",
    "Select charge head": "اختر بند الرسم", "Slab Basis": "أساس الشريحة", Tax: "الضريبة", "Slab Rates": "أسعار الشرائح",
    "Add Slab": "إضافة شريحة", From: "من", "To / Above": "إلى / أعلى", "Rate Per Unit": "السعر لكل وحدة", Minimum: "الحد الأدنى",
    Maximum: "الحد الأقصى", Action: "الإجراء", Above: "أعلى", "Rate Calculator Preview": "معاينة حاسبة الأسعار",
    "Chargeable Weight": "الوزن المحتسب", "Zone Units": "وحدات المنطقة", "Discount %": "الخصم %", Reset: "إعادة تعيين",
    "Base Charge": "الرسم الأساسي", "Additional Charges": "رسوم إضافية", "Sub Total": "المجموع الفرعي", Discount: "الخصم", Total: "الإجمالي",
    "Currency Conversion Display": "عرض تحويل العملة", "Min Charge": "الحد الأدنى للرسم", "Max Charge": "الحد الأقصى للرسم",
    "Not Applicable": "غير مطبق", "Loading rate master...": "جارٍ تحميل دليل الأسعار...", "Validation failed": "فشل التحقق"
  },
  "hi-IN": {
    "Rate Master": "रेट मास्टर", "New Rate": "नई दर", "Create Rate Master": "रेट मास्टर बनाएँ", Edit: "संपादित करें", Preview: "पूर्वावलोकन",
    Calculator: "कैलकुलेटर", Code: "कोड", Name: "नाम", Scope: "दायरा", Mode: "माध्यम", Shipment: "शिपमेंट", Status: "स्थिति",
    "Valid From": "से मान्य", "Valid To": "तक मान्य", Active: "सक्रिय", Inactive: "निष्क्रिय", Delete: "हटाएँ", "Delete rate master?": "रेट मास्टर हटाएँ?",
    Core: "मुख्य", Charges: "शुल्क", "Rate Code": "दर कोड", "Rate Name": "दर नाम", "Rate Scope": "दर दायरा",
    General: "सामान्य", Customer: "ग्राहक", Vendor: "विक्रेता", Agent: "एजेंट", "Select customer": "ग्राहक चुनें", "Select vendor": "विक्रेता चुनें",
    "Select agent": "एजेंट चुनें", "Origin Port": "मूल बंदरगाह", "Destination Port": "गंतव्य बंदरगाह", "Select origin port": "मूल बंदरगाह चुनें",
    "Select destination port": "गंतव्य बंदरगाह चुनें", Country: "देश", "Select country": "देश चुनें", City: "शहर", Zone: "क्षेत्र",
    "Mode of Transport": "परिवहन माध्यम", "Shipment Type": "शिपमेंट प्रकार", "Rate Basis": "दर आधार", Weight: "वजन", Volume: "आयतन",
    Pieces: "पीस", ChargeableWeight: "प्रभार्य वजन", Distance: "दूरी", Flat: "फ्लैट", Slab: "स्लैब", Air: "वायु", Sea: "समुद्र",
    Road: "सड़क", Courier: "कूरियर", House: "हाउस", Master: "मास्टर", Direct: "प्रत्यक्ष", "Minimum Charge": "न्यूनतम शुल्क",
    "Maximum Charge": "अधिकतम शुल्क", Currency: "मुद्रा", "Select currency": "मुद्रा चुनें", "Tax Applicable": "कर लागू",
    Applicable: "लागू", "Not applicable": "लागू नहीं", "Tax Rate": "कर दर", "Save Rate Master": "रेट मास्टर सहेजें", "Saving...": "सहेजा जा रहा है...",
    "Charge Head": "शुल्क मद", "Add Charge Head": "शुल्क मद जोड़ें", "No charge heads configured.": "कोई शुल्क मद कॉन्फ़िगर नहीं है।",
    "Select charge head": "शुल्क मद चुनें", "Slab Basis": "स्लैब आधार", Tax: "कर", "Slab Rates": "स्लैब दरें",
    "Add Slab": "स्लैब जोड़ें", From: "से", "To / Above": "तक / अधिक", "Rate Per Unit": "प्रति इकाई दर", Minimum: "न्यूनतम",
    Maximum: "अधिकतम", Action: "कार्रवाई", Above: "अधिक", "Rate Calculator Preview": "दर कैलकुलेटर पूर्वावलोकन",
    "Chargeable Weight": "प्रभार्य वजन", "Zone Units": "क्षेत्र इकाइयाँ", "Discount %": "छूट %", Reset: "रीसेट",
    "Base Charge": "मूल शुल्क", "Additional Charges": "अतिरिक्त शुल्क", "Sub Total": "उप-योग", Discount: "छूट", Total: "कुल",
    "Currency Conversion Display": "मुद्रा रूपांतरण प्रदर्शन", "Min Charge": "न्यूनतम शुल्क", "Max Charge": "अधिकतम शुल्क",
    "Not Applicable": "लागू नहीं", "Loading rate master...": "रेट मास्टर लोड हो रहा है...", "Validation failed": "सत्यापन विफल"
  },
  "fr-FR": {
    "Rate Master": "Référentiel tarifaire", "New Rate": "Nouveau tarif", "Create Rate Master": "Créer un tarif", Edit: "Modifier", Preview: "Aperçu",
    Calculator: "Calculateur", Code: "Code", Name: "Nom", Scope: "Portée", Mode: "Mode", Shipment: "Expédition", Status: "Statut",
    "Valid From": "Valide du", "Valid To": "Valide au", Active: "Actif", Inactive: "Inactif", Delete: "Supprimer", "Delete rate master?": "Supprimer ce tarif ?",
    Core: "Principal", Charges: "Frais", "Rate Code": "Code tarif", "Rate Name": "Nom du tarif", "Rate Scope": "Portée du tarif",
    General: "Général", Customer: "Client", Vendor: "Fournisseur", Agent: "Agent", "Select customer": "Sélectionner un client", "Select vendor": "Sélectionner un fournisseur",
    "Select agent": "Sélectionner un agent", "Origin Port": "Port d'origine", "Destination Port": "Port de destination", "Select origin port": "Sélectionner le port d'origine",
    "Select destination port": "Sélectionner le port de destination", Country: "Pays", "Select country": "Sélectionner un pays", City: "Ville", Zone: "Zone",
    "Mode of Transport": "Mode de transport", "Shipment Type": "Type d'expédition", "Rate Basis": "Base tarifaire", Weight: "Poids", Volume: "Volume",
    Pieces: "Pièces", ChargeableWeight: "Poids taxable", Distance: "Distance", Flat: "Forfait", Slab: "Tranche", Air: "Aérien", Sea: "Maritime",
    Road: "Routier", Courier: "Messagerie", House: "House", Master: "Master", Direct: "Direct", "Minimum Charge": "Frais minimum",
    "Maximum Charge": "Frais maximum", Currency: "Devise", "Select currency": "Sélectionner une devise", "Tax Applicable": "Taxe applicable",
    Applicable: "Applicable", "Not applicable": "Non applicable", "Tax Rate": "Taux de taxe", "Save Rate Master": "Enregistrer le tarif", "Saving...": "Enregistrement...",
    "Charge Head": "Rubrique de frais", "Add Charge Head": "Ajouter une rubrique", "No charge heads configured.": "Aucune rubrique de frais configurée.",
    "Select charge head": "Sélectionner une rubrique", "Slab Basis": "Base de tranche", Tax: "Taxe", "Slab Rates": "Tarifs par tranche",
    "Add Slab": "Ajouter une tranche", From: "De", "To / Above": "À / Au-dessus", "Rate Per Unit": "Tarif par unité", Minimum: "Minimum",
    Maximum: "Maximum", Action: "Action", Above: "Au-dessus", "Rate Calculator Preview": "Aperçu du calculateur tarifaire",
    "Chargeable Weight": "Poids taxable", "Zone Units": "Unités de zone", "Discount %": "Remise %", Reset: "Réinitialiser",
    "Base Charge": "Frais de base", "Additional Charges": "Frais supplémentaires", "Sub Total": "Sous-total", Discount: "Remise", Total: "Total",
    "Currency Conversion Display": "Affichage de conversion", "Min Charge": "Frais min.", "Max Charge": "Frais max.",
    "Not Applicable": "Non applicable", "Loading rate master...": "Chargement du tarif...", "Validation failed": "Échec de la validation"
  },
  "es-ES": {
    "Rate Master": "Maestro de tarifas", "New Rate": "Nueva tarifa", "Create Rate Master": "Crear tarifa", Edit: "Editar", Preview: "Vista previa",
    Calculator: "Calculadora", Code: "Código", Name: "Nombre", Scope: "Ámbito", Mode: "Modo", Shipment: "Envío", Status: "Estado",
    "Valid From": "Válida desde", "Valid To": "Válida hasta", Active: "Activa", Inactive: "Inactiva", Delete: "Eliminar", "Delete rate master?": "¿Eliminar la tarifa?",
    Core: "Principal", Charges: "Cargos", "Rate Code": "Código de tarifa", "Rate Name": "Nombre de tarifa", "Rate Scope": "Ámbito de tarifa",
    General: "General", Customer: "Cliente", Vendor: "Proveedor", Agent: "Agente", "Select customer": "Seleccionar cliente", "Select vendor": "Seleccionar proveedor",
    "Select agent": "Seleccionar agente", "Origin Port": "Puerto de origen", "Destination Port": "Puerto de destino", "Select origin port": "Seleccionar puerto de origen",
    "Select destination port": "Seleccionar puerto de destino", Country: "País", "Select country": "Seleccionar país", City: "Ciudad", Zone: "Zona",
    "Mode of Transport": "Modo de transporte", "Shipment Type": "Tipo de envío", "Rate Basis": "Base de tarifa", Weight: "Peso", Volume: "Volumen",
    Pieces: "Piezas", ChargeableWeight: "Peso facturable", Distance: "Distancia", Flat: "Fija", Slab: "Tramo", Air: "Aéreo", Sea: "Marítimo",
    Road: "Carretera", Courier: "Mensajería", House: "House", Master: "Master", Direct: "Directo", "Minimum Charge": "Cargo mínimo",
    "Maximum Charge": "Cargo máximo", Currency: "Moneda", "Select currency": "Seleccionar moneda", "Tax Applicable": "Impuesto aplicable",
    Applicable: "Aplicable", "Not applicable": "No aplicable", "Tax Rate": "Tasa fiscal", "Save Rate Master": "Guardar tarifa", "Saving...": "Guardando...",
    "Charge Head": "Concepto de cargo", "Add Charge Head": "Añadir concepto", "No charge heads configured.": "No hay conceptos configurados.",
    "Select charge head": "Seleccionar concepto", "Slab Basis": "Base del tramo", Tax: "Impuesto", "Slab Rates": "Tarifas por tramo",
    "Add Slab": "Añadir tramo", From: "Desde", "To / Above": "Hasta / Superior", "Rate Per Unit": "Tarifa por unidad", Minimum: "Mínimo",
    Maximum: "Máximo", Action: "Acción", Above: "Superior", "Rate Calculator Preview": "Vista previa de calculadora",
    "Chargeable Weight": "Peso facturable", "Zone Units": "Unidades de zona", "Discount %": "Descuento %", Reset: "Restablecer",
    "Base Charge": "Cargo base", "Additional Charges": "Cargos adicionales", "Sub Total": "Subtotal", Discount: "Descuento", Total: "Total",
    "Currency Conversion Display": "Visualización de conversión", "Min Charge": "Cargo mín.", "Max Charge": "Cargo máx.",
    "Not Applicable": "No aplicable", "Loading rate master...": "Cargando tarifa...", "Validation failed": "Validación fallida"
  },
  "zh-CN": {
    "Rate Master": "费率主数据", "New Rate": "新建费率", "Create Rate Master": "创建费率", Edit: "编辑", Preview: "预览",
    Calculator: "计算器", Code: "代码", Name: "名称", Scope: "范围", Mode: "方式", Shipment: "货运", Status: "状态",
    "Valid From": "有效期从", "Valid To": "有效期至", Active: "启用", Inactive: "停用", Delete: "删除", "Delete rate master?": "删除费率？",
    Core: "基础", Charges: "费用", "Rate Code": "费率代码", "Rate Name": "费率名称", "Rate Scope": "费率范围",
    General: "通用", Customer: "客户", Vendor: "供应商", Agent: "代理", "Select customer": "选择客户", "Select vendor": "选择供应商",
    "Select agent": "选择代理", "Origin Port": "起运港", "Destination Port": "目的港", "Select origin port": "选择起运港",
    "Select destination port": "选择目的港", Country: "国家", "Select country": "选择国家", City: "城市", Zone: "区域",
    "Mode of Transport": "运输方式", "Shipment Type": "货运类型", "Rate Basis": "费率依据", Weight: "重量", Volume: "体积",
    Pieces: "件数", ChargeableWeight: "计费重量", Distance: "距离", Flat: "固定", Slab: "分段", Air: "空运", Sea: "海运",
    Road: "公路", Courier: "快递", House: "分运单", Master: "主运单", Direct: "直运", "Minimum Charge": "最低收费",
    "Maximum Charge": "最高收费", Currency: "币种", "Select currency": "选择币种", "Tax Applicable": "适用税费",
    Applicable: "适用", "Not applicable": "不适用", "Tax Rate": "税率", "Save Rate Master": "保存费率", "Saving...": "正在保存...",
    "Charge Head": "费用项目", "Add Charge Head": "添加费用项目", "No charge heads configured.": "未配置费用项目。",
    "Select charge head": "选择费用项目", "Slab Basis": "分段依据", Tax: "税费", "Slab Rates": "分段费率",
    "Add Slab": "添加分段", From: "从", "To / Above": "至 / 以上", "Rate Per Unit": "单位费率", Minimum: "最低",
    Maximum: "最高", Action: "操作", Above: "以上", "Rate Calculator Preview": "费率计算器预览",
    "Chargeable Weight": "计费重量", "Zone Units": "区域单位", "Discount %": "折扣 %", Reset: "重置",
    "Base Charge": "基础费用", "Additional Charges": "附加费用", "Sub Total": "小计", Discount: "折扣", Total: "合计",
    "Currency Conversion Display": "币种转换显示", "Min Charge": "最低收费", "Max Charge": "最高收费",
    "Not Applicable": "不适用", "Loading rate master...": "正在加载费率...", "Validation failed": "验证失败"
  },
  "tr-TR": {
    "Rate Master": "Tarife kartı", "New Rate": "Yeni tarife", "Create Rate Master": "Tarife oluştur", Edit: "Düzenle", Preview: "Önizleme",
    Calculator: "Hesaplayıcı", Code: "Kod", Name: "Ad", Scope: "Kapsam", Mode: "Mod", Shipment: "Sevkiyat", Status: "Durum",
    "Valid From": "Geçerlilik başlangıcı", "Valid To": "Geçerlilik sonu", Active: "Aktif", Inactive: "Pasif", Delete: "Sil", "Delete rate master?": "Tarife silinsin mi?",
    Core: "Temel", Charges: "Masraflar", "Rate Code": "Tarife kodu", "Rate Name": "Tarife adı", "Rate Scope": "Tarife kapsamı",
    General: "Genel", Customer: "Müşteri", Vendor: "Tedarikçi", Agent: "Acente", "Select customer": "Müşteri seç", "Select vendor": "Tedarikçi seç",
    "Select agent": "Acente seç", "Origin Port": "Çıkış limanı", "Destination Port": "Varış limanı", "Select origin port": "Çıkış limanı seç",
    "Select destination port": "Varış limanı seç", Country: "Ülke", "Select country": "Ülke seç", City: "Şehir", Zone: "Bölge",
    "Mode of Transport": "Taşıma modu", "Shipment Type": "Sevkiyat türü", "Rate Basis": "Tarife esası", Weight: "Ağırlık", Volume: "Hacim",
    Pieces: "Parça", ChargeableWeight: "Ücret ağırlığı", Distance: "Mesafe", Flat: "Sabit", Slab: "Kademe", Air: "Hava", Sea: "Deniz",
    Road: "Karayolu", Courier: "Kurye", House: "House", Master: "Master", Direct: "Direkt", "Minimum Charge": "Asgari ücret",
    "Maximum Charge": "Azami ücret", Currency: "Para birimi", "Select currency": "Para birimi seç", "Tax Applicable": "Vergi uygulanır",
    Applicable: "Uygulanır", "Not applicable": "Uygulanmaz", "Tax Rate": "Vergi oranı", "Save Rate Master": "Tarifeyi kaydet", "Saving...": "Kaydediliyor...",
    "Charge Head": "Masraf kalemi", "Add Charge Head": "Masraf kalemi ekle", "No charge heads configured.": "Masraf kalemi yapılandırılmamış.",
    "Select charge head": "Masraf kalemi seç", "Slab Basis": "Kademe esası", Tax: "Vergi", "Slab Rates": "Kademe tarifeleri",
    "Add Slab": "Kademe ekle", From: "Başlangıç", "To / Above": "Bitiş / Üzeri", "Rate Per Unit": "Birim tarife", Minimum: "Asgari",
    Maximum: "Azami", Action: "İşlem", Above: "Üzeri", "Rate Calculator Preview": "Tarife hesaplayıcı önizlemesi",
    "Chargeable Weight": "Ücretlendirilebilir ağırlık", "Zone Units": "Bölge birimleri", "Discount %": "İndirim %", Reset: "Sıfırla",
    "Base Charge": "Temel ücret", "Additional Charges": "Ek masraflar", "Sub Total": "Ara toplam", Discount: "İndirim", Total: "Toplam",
    "Currency Conversion Display": "Döviz dönüşüm gösterimi", "Min Charge": "Asgari ücret", "Max Charge": "Azami ücret",
    "Not Applicable": "Uygulanmaz", "Loading rate master...": "Tarife yükleniyor...", "Validation failed": "Doğrulama başarısız"
  },
  "pt-PT": {
    "Rate Master": "Tabela de tarifas", "New Rate": "Nova tarifa", "Create Rate Master": "Criar tarifa", Edit: "Editar", Preview: "Pré-visualizar",
    Calculator: "Calculadora", Code: "Código", Name: "Nome", Scope: "Âmbito", Mode: "Modo", Shipment: "Remessa", Status: "Estado",
    "Valid From": "Válida desde", "Valid To": "Válida até", Active: "Ativa", Inactive: "Inativa", Delete: "Eliminar", "Delete rate master?": "Eliminar a tarifa?",
    Core: "Principal", Charges: "Encargos", "Rate Code": "Código da tarifa", "Rate Name": "Nome da tarifa", "Rate Scope": "Âmbito da tarifa",
    General: "Geral", Customer: "Cliente", Vendor: "Fornecedor", Agent: "Agente", "Select customer": "Selecionar cliente", "Select vendor": "Selecionar fornecedor",
    "Select agent": "Selecionar agente", "Origin Port": "Porto de origem", "Destination Port": "Porto de destino", "Select origin port": "Selecionar porto de origem",
    "Select destination port": "Selecionar porto de destino", Country: "País", "Select country": "Selecionar país", City: "Cidade", Zone: "Zona",
    "Mode of Transport": "Modo de transporte", "Shipment Type": "Tipo de remessa", "Rate Basis": "Base da tarifa", Weight: "Peso", Volume: "Volume",
    Pieces: "Peças", ChargeableWeight: "Peso taxável", Distance: "Distância", Flat: "Fixa", Slab: "Escalão", Air: "Aéreo", Sea: "Marítimo",
    Road: "Rodoviário", Courier: "Estafeta", House: "House", Master: "Master", Direct: "Direta", "Minimum Charge": "Encargo mínimo",
    "Maximum Charge": "Encargo máximo", Currency: "Moeda", "Select currency": "Selecionar moeda", "Tax Applicable": "Imposto aplicável",
    Applicable: "Aplicável", "Not applicable": "Não aplicável", "Tax Rate": "Taxa fiscal", "Save Rate Master": "Guardar tarifa", "Saving...": "A guardar...",
    "Charge Head": "Rubrica de encargo", "Add Charge Head": "Adicionar rubrica", "No charge heads configured.": "Nenhuma rubrica configurada.",
    "Select charge head": "Selecionar rubrica", "Slab Basis": "Base do escalão", Tax: "Imposto", "Slab Rates": "Tarifas por escalão",
    "Add Slab": "Adicionar escalão", From: "De", "To / Above": "Até / Acima", "Rate Per Unit": "Tarifa por unidade", Minimum: "Mínimo",
    Maximum: "Máximo", Action: "Ação", Above: "Acima", "Rate Calculator Preview": "Pré-visualização da calculadora",
    "Chargeable Weight": "Peso taxável", "Zone Units": "Unidades de zona", "Discount %": "Desconto %", Reset: "Repor",
    "Base Charge": "Encargo base", "Additional Charges": "Encargos adicionais", "Sub Total": "Subtotal", Discount: "Desconto", Total: "Total",
    "Currency Conversion Display": "Visualização de conversão", "Min Charge": "Encargo mín.", "Max Charge": "Encargo máx.",
    "Not Applicable": "Não aplicável", "Loading rate master...": "A carregar tarifa...", "Validation failed": "Falha na validação"
  },
  "ru-RU": {
    "Rate Master": "Тарифный справочник", "New Rate": "Новый тариф", "Create Rate Master": "Создать тариф", Edit: "Изменить", Preview: "Предпросмотр",
    Calculator: "Калькулятор", Code: "Код", Name: "Название", Scope: "Область", Mode: "Вид", Shipment: "Отправка", Status: "Статус",
    "Valid From": "Действует с", "Valid To": "Действует до", Active: "Активен", Inactive: "Неактивен", Delete: "Удалить", "Delete rate master?": "Удалить тариф?",
    Core: "Основное", Charges: "Начисления", "Rate Code": "Код тарифа", "Rate Name": "Название тарифа", "Rate Scope": "Область тарифа",
    General: "Общий", Customer: "Клиент", Vendor: "Поставщик", Agent: "Агент", "Select customer": "Выберите клиента", "Select vendor": "Выберите поставщика",
    "Select agent": "Выберите агента", "Origin Port": "Порт отправления", "Destination Port": "Порт назначения", "Select origin port": "Выберите порт отправления",
    "Select destination port": "Выберите порт назначения", Country: "Страна", "Select country": "Выберите страну", City: "Город", Zone: "Зона",
    "Mode of Transport": "Вид транспорта", "Shipment Type": "Тип отправки", "Rate Basis": "Основа тарифа", Weight: "Вес", Volume: "Объём",
    Pieces: "Места", ChargeableWeight: "Расчётный вес", Distance: "Расстояние", Flat: "Фиксированный", Slab: "Диапазон", Air: "Авиа", Sea: "Море",
    Road: "Авто", Courier: "Курьер", House: "Домашняя", Master: "Мастер", Direct: "Прямая", "Minimum Charge": "Минимальная сумма",
    "Maximum Charge": "Максимальная сумма", Currency: "Валюта", "Select currency": "Выберите валюту", "Tax Applicable": "Налог применяется",
    Applicable: "Применяется", "Not applicable": "Не применяется", "Tax Rate": "Ставка налога", "Save Rate Master": "Сохранить тариф", "Saving...": "Сохранение...",
    "Charge Head": "Статья начисления", "Add Charge Head": "Добавить статью", "No charge heads configured.": "Статьи начислений не настроены.",
    "Select charge head": "Выберите статью", "Slab Basis": "Основа диапазона", Tax: "Налог", "Slab Rates": "Диапазоны тарифов",
    "Add Slab": "Добавить диапазон", From: "От", "To / Above": "До / Свыше", "Rate Per Unit": "Тариф за единицу", Minimum: "Минимум",
    Maximum: "Максимум", Action: "Действие", Above: "Свыше", "Rate Calculator Preview": "Предпросмотр калькулятора",
    "Chargeable Weight": "Расчётный вес", "Zone Units": "Единицы зоны", "Discount %": "Скидка %", Reset: "Сбросить",
    "Base Charge": "Базовая сумма", "Additional Charges": "Дополнительные начисления", "Sub Total": "Промежуточный итог", Discount: "Скидка", Total: "Итого",
    "Currency Conversion Display": "Отображение конвертации", "Min Charge": "Мин. сумма", "Max Charge": "Макс. сумма",
    "Not Applicable": "Не применяется", "Loading rate master...": "Загрузка тарифа...", "Validation failed": "Ошибка проверки"
  }
};

const supplementalCatalogs: Record<string, Catalog> = {
  "ar-QA": {
    "Add at least one non-overlapping slab for this charge head.": "أضف شريحة واحدة على الأقل غير متداخلة لبند الرسم هذا.", "Charge slabs cannot overlap.": "لا يمكن أن تتداخل شرائح الرسوم.", "Create customer/vendor/agent or general rates with slabs and charges.": "أنشئ أسعار العميل أو المورد أو الوكيل أو الأسعار العامة مع الشرائح والرسوم.", "Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.": "يستخدم كل بند رسم سعره الخاص لكل وحدة. اترك قيمة إلى الأخيرة فارغة لتطبيق السعر على جميع الكميات الأعلى.", "Every charge head requires at least one slab.": "يتطلب كل بند رسم شريحة واحدة على الأقل.", "Manage transport and charge-head rate definitions.": "إدارة تعريفات أسعار النقل وبنود الرسوم.", Max: "الأقصى", "Maximum cannot be lower than minimum.": "لا يمكن أن يكون الحد الأقصى أقل من الحد الأدنى.", Min: "الأدنى", "No conversion result for": "لا توجد نتيجة تحويل لـ", "Only the final charge slab can be open-ended.": "يمكن أن تكون شريحة الرسم الأخيرة فقط مفتوحة النهاية.", "Please fix invalid values.": "يرجى تصحيح القيم غير الصالحة.", "Preview calculation with slabs, basis, surcharges, tax, and discount.": "معاينة الحساب مع الشرائح والأساس والرسوم الإضافية والضريبة والخصم.", Rate: "السعر", "Rates and charges are stored in": "يتم حفظ الأسعار والرسوم بعملة", "Slab (legacy)": "شريحة (قديمة)", "Slab To must be greater than From.": "يجب أن تكون قيمة إلى أكبر من من.", To: "إلى", "Valid To Date must be on or after Valid From Date.": "يجب أن يكون تاريخ صالح حتى في أو بعد تاريخ صالح من.", View: "عرض", inactive: "غير نشط"
  },
  "hi-IN": {
    "Add at least one non-overlapping slab for this charge head.": "इस शुल्क मद के लिए कम से कम एक गैर-अतिव्यापी स्लैब जोड़ें।", "Charge slabs cannot overlap.": "शुल्क स्लैब एक-दूसरे पर नहीं चढ़ सकते।", "Create customer/vendor/agent or general rates with slabs and charges.": "स्लैब और शुल्क सहित ग्राहक, विक्रेता, एजेंट या सामान्य दरें बनाएँ।", "Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.": "प्रत्येक शुल्क मद अपनी प्रति इकाई दर उपयोग करता है। सभी अधिक मात्राओं पर दर लागू करने के लिए अंतिम तक मान खाली रखें।", "Every charge head requires at least one slab.": "प्रत्येक शुल्क मद के लिए कम से कम एक स्लैब आवश्यक है।", "Manage transport and charge-head rate definitions.": "परिवहन और शुल्क मद दर परिभाषाएँ प्रबंधित करें।", Max: "अधिकतम", "Maximum cannot be lower than minimum.": "अधिकतम न्यूनतम से कम नहीं हो सकता।", Min: "न्यूनतम", "No conversion result for": "इसके लिए कोई रूपांतरण परिणाम नहीं", "Only the final charge slab can be open-ended.": "केवल अंतिम शुल्क स्लैब खुला हो सकता है।", "Please fix invalid values.": "कृपया अमान्य मान ठीक करें।", "Preview calculation with slabs, basis, surcharges, tax, and discount.": "स्लैब, आधार, अधिभार, कर और छूट सहित गणना का पूर्वावलोकन करें।", Rate: "दर", "Rates and charges are stored in": "दरें और शुल्क इसमें संग्रहीत हैं", "Slab (legacy)": "स्लैब (पुराना)", "Slab To must be greater than From.": "स्लैब तक का मान से अधिक होना चाहिए।", To: "तक", "Valid To Date must be on or after Valid From Date.": "मान्य तक की तिथि मान्य से की तिथि पर या उसके बाद होनी चाहिए।", View: "देखें", inactive: "निष्क्रिय"
  },
  "fr-FR": {
    "Add at least one non-overlapping slab for this charge head.": "Ajoutez au moins une tranche non chevauchante pour cette rubrique.", "Charge slabs cannot overlap.": "Les tranches de frais ne peuvent pas se chevaucher.", "Create customer/vendor/agent or general rates with slabs and charges.": "Créez des tarifs client, fournisseur, agent ou généraux avec tranches et frais.", "Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.": "Chaque rubrique utilise son propre tarif unitaire. Laissez la dernière valeur À vide pour appliquer le tarif aux quantités supérieures.", "Every charge head requires at least one slab.": "Chaque rubrique nécessite au moins une tranche.", "Manage transport and charge-head rate definitions.": "Gérez les définitions de tarifs de transport et de rubriques.", Max: "Max.", "Maximum cannot be lower than minimum.": "Le maximum ne peut pas être inférieur au minimum.", Min: "Min.", "No conversion result for": "Aucun résultat de conversion pour", "Only the final charge slab can be open-ended.": "Seule la dernière tranche peut être ouverte.", "Please fix invalid values.": "Veuillez corriger les valeurs non valides.", "Preview calculation with slabs, basis, surcharges, tax, and discount.": "Prévisualisez le calcul avec tranches, base, suppléments, taxe et remise.", Rate: "Tarif", "Rates and charges are stored in": "Les tarifs et frais sont enregistrés en", "Slab (legacy)": "Tranche (ancienne)", "Slab To must be greater than From.": "La valeur À doit être supérieure à De.", To: "À", "Valid To Date must be on or after Valid From Date.": "La date de fin doit être égale ou postérieure à la date de début.", View: "Voir", inactive: "inactif"
  },
  "es-ES": {
    "Add at least one non-overlapping slab for this charge head.": "Añada al menos un tramo no superpuesto para este concepto.", "Charge slabs cannot overlap.": "Los tramos de cargos no pueden superponerse.", "Create customer/vendor/agent or general rates with slabs and charges.": "Cree tarifas de cliente, proveedor, agente o generales con tramos y cargos.", "Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.": "Cada concepto usa su propia tarifa por unidad. Deje vacío el último valor Hasta para aplicarla a cantidades superiores.", "Every charge head requires at least one slab.": "Cada concepto requiere al menos un tramo.", "Manage transport and charge-head rate definitions.": "Gestione las definiciones de tarifas de transporte y conceptos.", Max: "Máx.", "Maximum cannot be lower than minimum.": "El máximo no puede ser inferior al mínimo.", Min: "Mín.", "No conversion result for": "Sin resultado de conversión para", "Only the final charge slab can be open-ended.": "Solo el último tramo puede quedar abierto.", "Please fix invalid values.": "Corrija los valores no válidos.", "Preview calculation with slabs, basis, surcharges, tax, and discount.": "Previsualice el cálculo con tramos, base, recargos, impuesto y descuento.", Rate: "Tarifa", "Rates and charges are stored in": "Las tarifas y cargos se guardan en", "Slab (legacy)": "Tramo (heredado)", "Slab To must be greater than From.": "El valor Hasta debe ser mayor que Desde.", To: "Hasta", "Valid To Date must be on or after Valid From Date.": "La fecha de fin debe ser igual o posterior a la fecha de inicio.", View: "Ver", inactive: "inactivo"
  },
  "zh-CN": {
    "Add at least one non-overlapping slab for this charge head.": "请为此费用项目添加至少一个不重叠的分段。", "Charge slabs cannot overlap.": "费用分段不能重叠。", "Create customer/vendor/agent or general rates with slabs and charges.": "创建包含分段和费用的客户、供应商、代理或通用费率。", "Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.": "每个费用项目使用独立的单位费率。最后一个至值留空可将该费率应用于所有更高数量。", "Every charge head requires at least one slab.": "每个费用项目至少需要一个分段。", "Manage transport and charge-head rate definitions.": "管理运输和费用项目费率定义。", Max: "最高", "Maximum cannot be lower than minimum.": "最高值不能低于最低值。", Min: "最低", "No conversion result for": "没有币种转换结果：", "Only the final charge slab can be open-ended.": "只有最后一个费用分段可以不设上限。", "Please fix invalid values.": "请修正无效值。", "Preview calculation with slabs, basis, surcharges, tax, and discount.": "预览包含分段、计费依据、附加费、税费和折扣的计算。", Rate: "费率", "Rates and charges are stored in": "费率和费用以此币种保存：", "Slab (legacy)": "分段（旧版）", "Slab To must be greater than From.": "分段结束值必须大于开始值。", To: "至", "Valid To Date must be on or after Valid From Date.": "有效结束日期必须等于或晚于开始日期。", View: "查看", inactive: "停用"
  },
  "tr-TR": {
    "Add at least one non-overlapping slab for this charge head.": "Bu masraf kalemi için en az bir çakışmayan kademe ekleyin.", "Charge slabs cannot overlap.": "Masraf kademeleri çakışamaz.", "Create customer/vendor/agent or general rates with slabs and charges.": "Kademeler ve masraflarla müşteri, tedarikçi, acente veya genel tarifeler oluşturun.", "Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.": "Her masraf kalemi kendi birim tarifesini kullanır. Daha yüksek miktarlara uygulamak için son Bitiş değerini boş bırakın.", "Every charge head requires at least one slab.": "Her masraf kalemi en az bir kademe gerektirir.", "Manage transport and charge-head rate definitions.": "Taşıma ve masraf kalemi tarife tanımlarını yönetin.", Max: "Azami", "Maximum cannot be lower than minimum.": "Azami değer asgari değerden düşük olamaz.", Min: "Asgari", "No conversion result for": "Dönüşüm sonucu yok:", "Only the final charge slab can be open-ended.": "Yalnızca son masraf kademesi açık uçlu olabilir.", "Please fix invalid values.": "Lütfen geçersiz değerleri düzeltin.", "Preview calculation with slabs, basis, surcharges, tax, and discount.": "Kademe, esas, ek ücret, vergi ve indirim içeren hesabı önizleyin.", Rate: "Tarife", "Rates and charges are stored in": "Tarifeler ve masraflar şu para biriminde saklanır:", "Slab (legacy)": "Kademe (eski)", "Slab To must be greater than From.": "Kademe Bitiş değeri Başlangıç değerinden büyük olmalıdır.", To: "Bitiş", "Valid To Date must be on or after Valid From Date.": "Geçerlilik bitiş tarihi başlangıç tarihinde veya sonrasında olmalıdır.", View: "Görüntüle", inactive: "pasif"
  },
  "pt-PT": {
    "Add at least one non-overlapping slab for this charge head.": "Adicione pelo menos um escalão não sobreposto para esta rubrica.", "Charge slabs cannot overlap.": "Os escalões de encargos não podem sobrepor-se.", "Create customer/vendor/agent or general rates with slabs and charges.": "Crie tarifas de cliente, fornecedor, agente ou gerais com escalões e encargos.", "Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.": "Cada rubrica usa a sua própria tarifa por unidade. Deixe o último valor Até vazio para aplicar a tarifa a quantidades superiores.", "Every charge head requires at least one slab.": "Cada rubrica requer pelo menos um escalão.", "Manage transport and charge-head rate definitions.": "Gira definições de tarifas de transporte e rubricas.", Max: "Máx.", "Maximum cannot be lower than minimum.": "O máximo não pode ser inferior ao mínimo.", Min: "Mín.", "No conversion result for": "Sem resultado de conversão para", "Only the final charge slab can be open-ended.": "Apenas o último escalão pode ficar sem limite.", "Please fix invalid values.": "Corrija os valores inválidos.", "Preview calculation with slabs, basis, surcharges, tax, and discount.": "Pré-visualize o cálculo com escalões, base, sobretaxas, imposto e desconto.", Rate: "Tarifa", "Rates and charges are stored in": "As tarifas e encargos são guardados em", "Slab (legacy)": "Escalão (legado)", "Slab To must be greater than From.": "O valor Até deve ser superior ao valor Desde.", To: "Até", "Valid To Date must be on or after Valid From Date.": "A data final deve ser igual ou posterior à data inicial.", View: "Ver", inactive: "inativo"
  },
  "ru-RU": {
    "Add at least one non-overlapping slab for this charge head.": "Добавьте хотя бы один непересекающийся диапазон для этой статьи.", "Charge slabs cannot overlap.": "Диапазоны начислений не могут пересекаться.", "Create customer/vendor/agent or general rates with slabs and charges.": "Создайте клиентские, поставщицкие, агентские или общие тарифы с диапазонами и начислениями.", "Each charge head uses its own rate per unit. Leave the final To value blank to apply that rate to all higher quantities.": "Каждая статья использует собственную ставку за единицу. Оставьте последнее значение До пустым, чтобы применять ставку ко всем большим количествам.", "Every charge head requires at least one slab.": "Для каждой статьи требуется хотя бы один диапазон.", "Manage transport and charge-head rate definitions.": "Управляйте тарифами перевозки и статьями начислений.", Max: "Макс.", "Maximum cannot be lower than minimum.": "Максимум не может быть меньше минимума.", Min: "Мин.", "No conversion result for": "Нет результата конвертации для", "Only the final charge slab can be open-ended.": "Только последний диапазон может быть открытым.", "Please fix invalid values.": "Исправьте недопустимые значения.", "Preview calculation with slabs, basis, surcharges, tax, and discount.": "Предпросмотр расчёта с диапазонами, базой, надбавками, налогом и скидкой.", Rate: "Тариф", "Rates and charges are stored in": "Тарифы и начисления хранятся в валюте", "Slab (legacy)": "Диапазон (устаревший)", "Slab To must be greater than From.": "Значение До должно быть больше значения От.", To: "До", "Valid To Date must be on or after Valid From Date.": "Дата окончания должна быть не раньше даты начала.", View: "Просмотр", inactive: "неактивен"
  }
};

function keyify(value: string) {
  return value.replace(/[^A-Za-z0-9]+(.)/g, (_, character: string) => character.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
}

export function rateMasterResourceKey(value: string) {
  return `RateMaster.${keyify(value)}`;
}

export function getRateMasterFallback(cultureCode: string, value: string) {
  if (cultureCode === "en-US") return value;
  return supplementalCatalogs[cultureCode]?.[value] ?? catalogs[cultureCode]?.[value] ?? value;
}

export function useRateMasterI18n() {
  const { t } = useI18n();
  const { cultureCode } = useWorkspace();
  return (value: string) => {
    const localized = t(rateMasterResourceKey(value), value);
    if (cultureCode === "en-US" || localized !== value) return localized;
    return getRateMasterFallback(cultureCode, value);
  };
}

export const rateMasterCultures = ["en-US", "ar-QA", "hi-IN", "fr-FR", "es-ES", "zh-CN", "tr-TR", "pt-PT", "ru-RU"] as const;
