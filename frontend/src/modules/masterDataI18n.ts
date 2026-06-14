import { useI18n } from "@/app/i18n";
import { useWorkspace } from "@/hooks/useWorkspace";

const translations: Record<string, Record<string, string>> = {
  "ar-QA": {
    Vendors: "الموردون", Vendor: "المورد", Agents: "الوكلاء", Agent: "الوكيل", Carriers: "الناقلون", Carrier: "الناقل",
    Countries: "الدول", Country: "الدولة", "Package Types": "أنواع الطرود", "Package Type": "نوع الطرد",
    "Shipping Ports": "موانئ الشحن", "Shipping Port": "ميناء الشحن", "Job Types": "أنواع الوظائف", "Job Type": "نوع الوظيفة",
    Warehouses: "المستودعات", Warehouse: "المستودع", "Charge Heads": "بنود الرسوم", "Charge Head": "بند الرسوم",
    "Tax Rules": "قواعد الضرائب", "Tax Rule": "قاعدة الضريبة", Code: "الكود", Name: "الاسم", Type: "النوع",
    Email: "البريد الإلكتروني", Phone: "الهاتف", City: "المدينة", Status: "الحالة",
    Active: "نشط", Inactive: "غير نشط", Description: "الوصف", Actions: "الإجراءات", View: "عرض", Edit: "تعديل", Delete: "حذف",
    New: "جديد", Create: "إنشاء", Save: "حفظ", Saving: "جارٍ الحفظ...", Select: "اختر", Loading: "جارٍ التحميل...",
    "Contact Person": "الشخص المسؤول", "Default Currency": "العملة الافتراضية", "Payment Terms": "شروط الدفع",
    Address: "العنوان", "Serial No": "الرقم التسلسلي", "Country Code": "كود الدولة", "ISO Code": "كود ISO",
    "Mobile Code": "كود الهاتف", "Package Code": "كود الطرد", "Package Name": "اسم الطرد",
    "Port Code": "كود الميناء", "Port Name": "اسم الميناء", "Port Type": "نوع الميناء",
    "Job Type Code": "كود نوع الوظيفة", "Short Code": "الكود المختصر", "Job Type Name": "اسم نوع الوظيفة",
    "Warehouse Code": "كود المستودع", "Warehouse Name": "اسم المستودع", "Charge Key": "مفتاح الرسم",
    "Charge Name": "اسم الرسم", "Source Module": "الوحدة المصدر", "Ledger Account": "حساب الأستاذ",
    "Tax Code": "كود الضريبة", "Tax Name": "اسم الضريبة", "Tax Rate": "معدل الضريبة",
    "Tax Type (GST/VAT)": "نوع الضريبة (GST/VAT)", "Tax Mode": "وضع الضريبة", "Tax Ledger": "حساب الضريبة",
    Recoverable: "قابل للاسترداد"
  },
  "hi-IN": {
    Vendors: "विक्रेता", Vendor: "विक्रेता", Agents: "एजेंट", Agent: "एजेंट", Carriers: "वाहक", Carrier: "वाहक",
    Countries: "देश", Country: "देश", "Package Types": "पैकेज प्रकार", "Package Type": "पैकेज प्रकार",
    "Shipping Ports": "शिपिंग पोर्ट", "Shipping Port": "शिपिंग पोर्ट", "Job Types": "जॉब प्रकार", "Job Type": "जॉब प्रकार",
    Warehouses: "गोदाम", Warehouse: "गोदाम", "Charge Heads": "शुल्क मदें", "Charge Head": "शुल्क मद",
    "Tax Rules": "कर नियम", "Tax Rule": "कर नियम", Code: "कोड", Name: "नाम", Type: "प्रकार", Email: "ईमेल",
    Phone: "फोन", City: "शहर", Status: "स्थिति", Active: "सक्रिय", Inactive: "निष्क्रिय",
    Description: "विवरण", Actions: "कार्रवाई", View: "देखें", Edit: "संपादित करें", Delete: "हटाएं", New: "नया", Create: "बनाएं",
    Save: "सहेजें", Saving: "सहेजा जा रहा है...", Select: "चुनें", Loading: "लोड हो रहा है...",
    "Contact Person": "संपर्क व्यक्ति", "Default Currency": "डिफ़ॉल्ट मुद्रा", "Payment Terms": "भुगतान शर्तें",
    Address: "पता", "Serial No": "क्रम संख्या", "Country Code": "देश कोड", "ISO Code": "ISO कोड",
    "Mobile Code": "मोबाइल कोड", "Package Code": "पैकेज कोड", "Package Name": "पैकेज नाम",
    "Port Code": "पोर्ट कोड", "Port Name": "पोर्ट नाम", "Port Type": "पोर्ट प्रकार",
    "Job Type Code": "जॉब प्रकार कोड", "Short Code": "लघु कोड", "Job Type Name": "जॉब प्रकार नाम",
    "Warehouse Code": "गोदाम कोड", "Warehouse Name": "गोदाम नाम", "Charge Key": "शुल्क कुंजी",
    "Charge Name": "शुल्क नाम", "Source Module": "स्रोत मॉड्यूल", "Ledger Account": "लेजर खाता",
    "Tax Code": "कर कोड", "Tax Name": "कर नाम", "Tax Rate": "कर दर", "Tax Type (GST/VAT)": "कर प्रकार (GST/VAT)",
    "Tax Mode": "कर मोड", "Tax Ledger": "कर लेजर", Recoverable: "वसूली योग्य"
  },
  "fr-FR": {
    Vendors: "Fournisseurs", Vendor: "Fournisseur", Agents: "Agents", Agent: "Agent", Carriers: "Transporteurs", Carrier: "Transporteur",
    Countries: "Pays", Country: "Pays", "Package Types": "Types de colis", "Package Type": "Type de colis",
    "Shipping Ports": "Ports d'expédition", "Shipping Port": "Port d'expédition", "Job Types": "Types de dossier", "Job Type": "Type de dossier",
    Warehouses: "Entrepôts", Warehouse: "Entrepôt", "Charge Heads": "Rubriques de frais", "Charge Head": "Rubrique de frais",
    "Tax Rules": "Règles fiscales", "Tax Rule": "Règle fiscale", Code: "Code", Name: "Nom", Type: "Type", Email: "E-mail",
    Phone: "Téléphone", City: "Ville", Status: "Statut", Active: "Actif", Inactive: "Inactif",
    Description: "Description", Actions: "Actions", View: "Voir", Edit: "Modifier", Delete: "Supprimer", New: "Nouveau", Create: "Créer",
    Save: "Enregistrer", Saving: "Enregistrement...", Select: "Sélectionner", Loading: "Chargement...",
    "Contact Person": "Personne de contact", "Default Currency": "Devise par défaut", "Payment Terms": "Conditions de paiement",
    Address: "Adresse", "Serial No": "N° de série", "Country Code": "Code pays", "ISO Code": "Code ISO",
    "Mobile Code": "Indicatif mobile", "Package Code": "Code colis", "Package Name": "Nom du colis",
    "Port Code": "Code port", "Port Name": "Nom du port", "Port Type": "Type de port",
    "Job Type Code": "Code type de dossier", "Short Code": "Code court", "Job Type Name": "Nom du type de dossier",
    "Warehouse Code": "Code entrepôt", "Warehouse Name": "Nom de l'entrepôt", "Charge Key": "Clé de frais",
    "Charge Name": "Nom du frais", "Source Module": "Module source", "Ledger Account": "Compte général",
    "Tax Code": "Code taxe", "Tax Name": "Nom de taxe", "Tax Rate": "Taux de taxe", "Tax Type (GST/VAT)": "Type de taxe (GST/TVA)",
    "Tax Mode": "Mode de taxe", "Tax Ledger": "Compte de taxe", Recoverable: "Récupérable"
  },
  "es-ES": {
    Vendors: "Proveedores", Vendor: "Proveedor", Agents: "Agentes", Agent: "Agente", Carriers: "Transportistas", Carrier: "Transportista",
    Countries: "Países", Country: "País", "Package Types": "Tipos de paquete", "Package Type": "Tipo de paquete",
    "Shipping Ports": "Puertos de envío", "Shipping Port": "Puerto de envío", "Job Types": "Tipos de trabajo", "Job Type": "Tipo de trabajo",
    Warehouses: "Almacenes", Warehouse: "Almacén", "Charge Heads": "Conceptos de cargo", "Charge Head": "Concepto de cargo",
    "Tax Rules": "Reglas fiscales", "Tax Rule": "Regla fiscal", Code: "Código", Name: "Nombre", Type: "Tipo", Email: "Correo",
    Phone: "Teléfono", City: "Ciudad", Status: "Estado", Active: "Activo", Inactive: "Inactivo",
    Description: "Descripción", Actions: "Acciones", View: "Ver", Edit: "Editar", Delete: "Eliminar", New: "Nuevo", Create: "Crear",
    Save: "Guardar", Saving: "Guardando...", Select: "Seleccionar", Loading: "Cargando...",
    "Contact Person": "Persona de contacto", "Default Currency": "Moneda predeterminada", "Payment Terms": "Condiciones de pago",
    Address: "Dirección", "Serial No": "N.º de serie", "Country Code": "Código de país", "ISO Code": "Código ISO",
    "Mobile Code": "Código móvil", "Package Code": "Código de paquete", "Package Name": "Nombre del paquete",
    "Port Code": "Código de puerto", "Port Name": "Nombre del puerto", "Port Type": "Tipo de puerto",
    "Job Type Code": "Código de tipo de trabajo", "Short Code": "Código corto", "Job Type Name": "Nombre del tipo de trabajo",
    "Warehouse Code": "Código de almacén", "Warehouse Name": "Nombre del almacén", "Charge Key": "Clave de cargo",
    "Charge Name": "Nombre del cargo", "Source Module": "Módulo origen", "Ledger Account": "Cuenta contable",
    "Tax Code": "Código fiscal", "Tax Name": "Nombre fiscal", "Tax Rate": "Tasa fiscal", "Tax Type (GST/VAT)": "Tipo fiscal (GST/IVA)",
    "Tax Mode": "Modo fiscal", "Tax Ledger": "Cuenta fiscal", Recoverable: "Recuperable"
  },
  "zh-CN": {
    Vendors: "供应商", Vendor: "供应商", Agents: "代理", Agent: "代理", Carriers: "承运商", Carrier: "承运商",
    Countries: "国家", Country: "国家", "Package Types": "包装类型", "Package Type": "包装类型",
    "Shipping Ports": "运输港口", "Shipping Port": "运输港口", "Job Types": "作业类型", "Job Type": "作业类型",
    Warehouses: "仓库", Warehouse: "仓库", "Charge Heads": "费用项目", "Charge Head": "费用项目",
    "Tax Rules": "税务规则", "Tax Rule": "税务规则", Code: "代码", Name: "名称", Type: "类型", Email: "电子邮件",
    Phone: "电话", City: "城市", Status: "状态", Active: "启用", Inactive: "停用",
    Description: "描述", Actions: "操作", View: "查看", Edit: "编辑", Delete: "删除", New: "新建", Create: "创建",
    Save: "保存", Saving: "正在保存...", Select: "选择", Loading: "正在加载...",
    "Contact Person": "联系人", "Default Currency": "默认币种", "Payment Terms": "付款条件", Address: "地址",
    "Serial No": "序号", "Country Code": "国家代码", "ISO Code": "ISO代码", "Mobile Code": "电话区号",
    "Package Code": "包装代码", "Package Name": "包装名称", "Port Code": "港口代码", "Port Name": "港口名称",
    "Port Type": "港口类型", "Job Type Code": "作业类型代码", "Short Code": "短代码", "Job Type Name": "作业类型名称",
    "Warehouse Code": "仓库代码", "Warehouse Name": "仓库名称", "Charge Key": "费用键", "Charge Name": "费用名称",
    "Source Module": "来源模块", "Ledger Account": "总账科目", "Tax Code": "税码", "Tax Name": "税名",
    "Tax Rate": "税率", "Tax Type (GST/VAT)": "税种 (GST/VAT)", "Tax Mode": "计税模式", "Tax Ledger": "税务科目",
    Recoverable: "可抵扣"
  },
  "tr-TR": {
    Vendors: "Tedarikçiler", Vendor: "Tedarikçi", Agents: "Acenteler", Agent: "Acente", Carriers: "Taşıyıcılar", Carrier: "Taşıyıcı",
    Countries: "Ülkeler", Country: "Ülke", "Package Types": "Paket türleri", "Package Type": "Paket türü",
    "Shipping Ports": "Sevkiyat limanları", "Shipping Port": "Sevkiyat limanı", "Job Types": "İş türleri", "Job Type": "İş türü",
    Warehouses: "Depolar", Warehouse: "Depo", "Charge Heads": "Masraf kalemleri", "Charge Head": "Masraf kalemi",
    "Tax Rules": "Vergi kuralları", "Tax Rule": "Vergi kuralı", Code: "Kod", Name: "Ad", Type: "Tür", Email: "E-posta",
    Phone: "Telefon", City: "Şehir", Status: "Durum", Active: "Aktif", Inactive: "Pasif",
    Description: "Açıklama", Actions: "İşlemler", View: "Görüntüle", Edit: "Düzenle", Delete: "Sil", New: "Yeni", Create: "Oluştur",
    Save: "Kaydet", Saving: "Kaydediliyor...", Select: "Seç", Loading: "Yükleniyor...",
    "Contact Person": "İlgili kişi", "Default Currency": "Varsayılan para birimi", "Payment Terms": "Ödeme şartları",
    Address: "Adres", "Serial No": "Sıra no", "Country Code": "Ülke kodu", "ISO Code": "ISO kodu",
    "Mobile Code": "Telefon kodu", "Package Code": "Paket kodu", "Package Name": "Paket adı",
    "Port Code": "Liman kodu", "Port Name": "Liman adı", "Port Type": "Liman türü",
    "Job Type Code": "İş türü kodu", "Short Code": "Kısa kod", "Job Type Name": "İş türü adı",
    "Warehouse Code": "Depo kodu", "Warehouse Name": "Depo adı", "Charge Key": "Masraf anahtarı",
    "Charge Name": "Masraf adı", "Source Module": "Kaynak modül", "Ledger Account": "Muhasebe hesabı",
    "Tax Code": "Vergi kodu", "Tax Name": "Vergi adı", "Tax Rate": "Vergi oranı", "Tax Type (GST/VAT)": "Vergi türü (GST/KDV)",
    "Tax Mode": "Vergi modu", "Tax Ledger": "Vergi hesabı", Recoverable: "İndirilebilir"
  },
  "pt-PT": {
    Vendors: "Fornecedores", Vendor: "Fornecedor", Agents: "Agentes", Agent: "Agente", Carriers: "Transportadores", Carrier: "Transportador",
    Countries: "Países", Country: "País", "Package Types": "Tipos de embalagem", "Package Type": "Tipo de embalagem",
    "Shipping Ports": "Portos de expedição", "Shipping Port": "Porto de expedição", "Job Types": "Tipos de trabalho", "Job Type": "Tipo de trabalho",
    Warehouses: "Armazéns", Warehouse: "Armazém", "Charge Heads": "Rubricas de encargos", "Charge Head": "Rubrica de encargos",
    "Tax Rules": "Regras fiscais", "Tax Rule": "Regra fiscal", Code: "Código", Name: "Nome", Type: "Tipo", Email: "Email",
    Phone: "Telefone", City: "Cidade", Status: "Estado", Active: "Ativo", Inactive: "Inativo",
    Description: "Descrição", Actions: "Ações", View: "Ver", Edit: "Editar", Delete: "Eliminar", New: "Novo", Create: "Criar",
    Save: "Guardar", Saving: "A guardar...", Select: "Selecionar", Loading: "A carregar...",
    "Contact Person": "Pessoa de contacto", "Default Currency": "Moeda padrão", "Payment Terms": "Condições de pagamento",
    Address: "Morada", "Serial No": "N.º de série", "Country Code": "Código do país", "ISO Code": "Código ISO",
    "Mobile Code": "Indicativo móvel", "Package Code": "Código da embalagem", "Package Name": "Nome da embalagem",
    "Port Code": "Código do porto", "Port Name": "Nome do porto", "Port Type": "Tipo de porto",
    "Job Type Code": "Código do tipo de trabalho", "Short Code": "Código curto", "Job Type Name": "Nome do tipo de trabalho",
    "Warehouse Code": "Código do armazém", "Warehouse Name": "Nome do armazém", "Charge Key": "Chave do encargo",
    "Charge Name": "Nome do encargo", "Source Module": "Módulo de origem", "Ledger Account": "Conta contabilística",
    "Tax Code": "Código fiscal", "Tax Name": "Nome fiscal", "Tax Rate": "Taxa fiscal", "Tax Type (GST/VAT)": "Tipo fiscal (GST/IVA)",
    "Tax Mode": "Modo fiscal", "Tax Ledger": "Conta fiscal", Recoverable: "Recuperável"
  },
  "ru-RU": {
    Vendors: "Поставщики", Vendor: "Поставщик", Agents: "Агенты", Agent: "Агент", Carriers: "Перевозчики", Carrier: "Перевозчик",
    Countries: "Страны", Country: "Страна", "Package Types": "Типы упаковки", "Package Type": "Тип упаковки",
    "Shipping Ports": "Порты отправки", "Shipping Port": "Порт отправки", "Job Types": "Типы заданий", "Job Type": "Тип задания",
    Warehouses: "Склады", Warehouse: "Склад", "Charge Heads": "Статьи начислений", "Charge Head": "Статья начисления",
    "Tax Rules": "Налоговые правила", "Tax Rule": "Налоговое правило", Code: "Код", Name: "Название", Type: "Тип",
    Email: "Email", Phone: "Телефон", City: "Город", Status: "Статус", Active: "Активно",
    Inactive: "Неактивно", Description: "Описание", Actions: "Действия", View: "Просмотр", Edit: "Изменить", Delete: "Удалить",
    New: "Новый", Create: "Создать", Save: "Сохранить", Saving: "Сохранение...", Select: "Выбрать", Loading: "Загрузка...",
    "Contact Person": "Контактное лицо", "Default Currency": "Валюта по умолчанию", "Payment Terms": "Условия оплаты",
    Address: "Адрес", "Serial No": "Серийный номер", "Country Code": "Код страны", "ISO Code": "Код ISO",
    "Mobile Code": "Телефонный код", "Package Code": "Код упаковки", "Package Name": "Название упаковки",
    "Port Code": "Код порта", "Port Name": "Название порта", "Port Type": "Тип порта",
    "Job Type Code": "Код типа задания", "Short Code": "Краткий код", "Job Type Name": "Название типа задания",
    "Warehouse Code": "Код склада", "Warehouse Name": "Название склада", "Charge Key": "Ключ начисления",
    "Charge Name": "Название начисления", "Source Module": "Исходный модуль", "Ledger Account": "Счёт главной книги",
    "Tax Code": "Код налога", "Tax Name": "Название налога", "Tax Rate": "Ставка налога",
    "Tax Type (GST/VAT)": "Тип налога (GST/НДС)", "Tax Mode": "Режим налога", "Tax Ledger": "Налоговый счёт",
    Recoverable: "Возмещаемый"
  }
};

const optionTranslations: Record<string, Record<string, string>> = {
  "ar-QA": {
    "All Status": "كل الحالات", "All Port Types": "كل أنواع الموانئ", "Filter by": "تصفية حسب",
    Sea: "بحري", Air: "جوي", Road: "بري", Inland: "داخلي", Inclusive: "شامل", Exclusive: "غير شامل",
    Yes: "نعم", No: "لا", "Hide Form": "إخفاء النموذج", Activate: "تفعيل", Deactivate: "إلغاء التفعيل",
    Transporter: "ناقل بري", Airline: "شركة طيران", "Shipping Line": "خط ملاحي", "Courier Company": "شركة بريد سريع",
    "Warehouse Vendor": "مورد مستودع", "Destination Agent": "وكيل الوجهة", "Customs Agent": "وكيل جمركي",
    "Local Delivery Agent": "وكيل توصيل محلي", "Overseas Agent": "وكيل خارجي", Loading: "جارٍ تحميل",
    "Search...": "بحث...", Sort: "ترتيب", Fields: "الحقول", Showing: "عرض", to: "إلى", of: "من", Rows: "الصفوف",
    Page: "الصفحة", "First page": "الصفحة الأولى", "Last page": "الصفحة الأخيرة", Reset: "إعادة تعيين",
    "No data found": "لم يتم العثور على بيانات", "There are no records to show for the selected filters.": "لا توجد سجلات لعرضها حسب عوامل التصفية المحددة.",
    "Something went wrong": "حدث خطأ ما", "We could not load this data. Please retry.": "تعذر تحميل هذه البيانات. يرجى المحاولة مرة أخرى.", Retry: "إعادة المحاولة"
  },
  "hi-IN": {
    "All Status": "सभी स्थितियां", "All Port Types": "सभी पोर्ट प्रकार", "Filter by": "इसके अनुसार फ़िल्टर करें",
    Sea: "समुद्री", Air: "हवाई", Road: "सड़क", Inland: "अंतर्देशीय", Inclusive: "समावेशी", Exclusive: "अलग",
    Yes: "हाँ", No: "नहीं", "Hide Form": "फॉर्म छिपाएं", Activate: "सक्रिय करें", Deactivate: "निष्क्रिय करें",
    Transporter: "ट्रांसपोर्टर", Airline: "एयरलाइन", "Shipping Line": "शिपिंग लाइन", "Courier Company": "कूरियर कंपनी",
    "Warehouse Vendor": "गोदाम विक्रेता", "Destination Agent": "गंतव्य एजेंट", "Customs Agent": "सीमा शुल्क एजेंट",
    "Local Delivery Agent": "स्थानीय वितरण एजेंट", "Overseas Agent": "विदेशी एजेंट", Loading: "लोड हो रहा है",
    "Search...": "खोजें...", Sort: "क्रमबद्ध करें", Fields: "फ़ील्ड", Showing: "दिखा रहे हैं", to: "से", of: "में से", Rows: "पंक्तियां",
    Page: "पृष्ठ", "First page": "पहला पृष्ठ", "Last page": "अंतिम पृष्ठ", Reset: "रीसेट",
    "No data found": "कोई डेटा नहीं मिला", "There are no records to show for the selected filters.": "चयनित फ़िल्टर के लिए कोई रिकॉर्ड नहीं है।",
    "Something went wrong": "कुछ गलत हुआ", "We could not load this data. Please retry.": "डेटा लोड नहीं हो सका। पुनः प्रयास करें।", Retry: "पुनः प्रयास"
  },
  "fr-FR": {
    "All Status": "Tous les statuts", "All Port Types": "Tous les types de port", "Filter by": "Filtrer par",
    Sea: "Maritime", Air: "Aérien", Road: "Routier", Inland: "Intérieur", Inclusive: "Inclusif", Exclusive: "Exclusif",
    Yes: "Oui", No: "Non", "Hide Form": "Masquer le formulaire", Activate: "Activer", Deactivate: "Désactiver",
    Transporter: "Transporteur", Airline: "Compagnie aérienne", "Shipping Line": "Compagnie maritime", "Courier Company": "Société de messagerie",
    "Warehouse Vendor": "Fournisseur d'entrepôt", "Destination Agent": "Agent de destination", "Customs Agent": "Agent en douane",
    "Local Delivery Agent": "Agent de livraison local", "Overseas Agent": "Agent étranger", Loading: "Chargement de",
    "Search...": "Rechercher...", Sort: "Trier", Fields: "Champs", Showing: "Affichage", to: "à", of: "sur", Rows: "Lignes",
    Page: "Page", "First page": "Première page", "Last page": "Dernière page", Reset: "Réinitialiser",
    "No data found": "Aucune donnée trouvée", "There are no records to show for the selected filters.": "Aucun enregistrement pour les filtres sélectionnés.",
    "Something went wrong": "Une erreur s'est produite", "We could not load this data. Please retry.": "Impossible de charger ces données. Réessayez.", Retry: "Réessayer"
  },
  "es-ES": {
    "All Status": "Todos los estados", "All Port Types": "Todos los tipos de puerto", "Filter by": "Filtrar por",
    Sea: "Marítimo", Air: "Aéreo", Road: "Carretera", Inland: "Interior", Inclusive: "Incluido", Exclusive: "Exclusivo",
    Yes: "Sí", No: "No", "Hide Form": "Ocultar formulario", Activate: "Activar", Deactivate: "Desactivar",
    Transporter: "Transportista", Airline: "Aerolínea", "Shipping Line": "Línea naviera", "Courier Company": "Empresa de mensajería",
    "Warehouse Vendor": "Proveedor de almacén", "Destination Agent": "Agente de destino", "Customs Agent": "Agente de aduanas",
    "Local Delivery Agent": "Agente de entrega local", "Overseas Agent": "Agente extranjero", Loading: "Cargando",
    "Search...": "Buscar...", Sort: "Ordenar", Fields: "Campos", Showing: "Mostrando", to: "a", of: "de", Rows: "Filas",
    Page: "Página", "First page": "Primera página", "Last page": "Última página", Reset: "Restablecer",
    "No data found": "No se encontraron datos", "There are no records to show for the selected filters.": "No hay registros para los filtros seleccionados.",
    "Something went wrong": "Algo salió mal", "We could not load this data. Please retry.": "No se pudieron cargar los datos. Inténtelo de nuevo.", Retry: "Reintentar"
  },
  "zh-CN": {
    "All Status": "全部状态", "All Port Types": "全部港口类型", "Filter by": "筛选",
    Sea: "海运", Air: "空运", Road: "公路", Inland: "内陆", Inclusive: "含税", Exclusive: "不含税",
    Yes: "是", No: "否", "Hide Form": "隐藏表单", Activate: "启用", Deactivate: "停用",
    Transporter: "运输商", Airline: "航空公司", "Shipping Line": "船运公司", "Courier Company": "快递公司",
    "Warehouse Vendor": "仓库供应商", "Destination Agent": "目的地代理", "Customs Agent": "报关代理",
    "Local Delivery Agent": "本地配送代理", "Overseas Agent": "海外代理", Loading: "正在加载",
    "Search...": "搜索...", Sort: "排序", Fields: "字段", Showing: "显示", to: "至", of: "共", Rows: "行",
    Page: "页", "First page": "第一页", "Last page": "最后一页", Reset: "重置",
    "No data found": "未找到数据", "There are no records to show for the selected filters.": "所选筛选条件下没有记录。",
    "Something went wrong": "出现错误", "We could not load this data. Please retry.": "无法加载数据，请重试。", Retry: "重试"
  },
  "tr-TR": {
    "All Status": "Tüm durumlar", "All Port Types": "Tüm liman türleri", "Filter by": "Şuna göre filtrele",
    Sea: "Deniz", Air: "Hava", Road: "Karayolu", Inland: "İç bölge", Inclusive: "Dahil", Exclusive: "Hariç",
    Yes: "Evet", No: "Hayır", "Hide Form": "Formu gizle", Activate: "Etkinleştir", Deactivate: "Devre dışı bırak",
    Transporter: "Nakliyeci", Airline: "Havayolu", "Shipping Line": "Deniz yolu", "Courier Company": "Kurye şirketi",
    "Warehouse Vendor": "Depo tedarikçisi", "Destination Agent": "Varış acentesi", "Customs Agent": "Gümrük acentesi",
    "Local Delivery Agent": "Yerel teslimat acentesi", "Overseas Agent": "Yurt dışı acentesi", Loading: "Yükleniyor",
    "Search...": "Ara...", Sort: "Sırala", Fields: "Alanlar", Showing: "Gösterilen", to: "-", of: "/", Rows: "Satırlar",
    Page: "Sayfa", "First page": "İlk sayfa", "Last page": "Son sayfa", Reset: "Sıfırla",
    "No data found": "Veri bulunamadı", "There are no records to show for the selected filters.": "Seçilen filtreler için kayıt yok.",
    "Something went wrong": "Bir hata oluştu", "We could not load this data. Please retry.": "Veriler yüklenemedi. Tekrar deneyin.", Retry: "Tekrar dene"
  },
  "pt-PT": {
    "All Status": "Todos os estados", "All Port Types": "Todos os tipos de porto", "Filter by": "Filtrar por",
    Sea: "Marítimo", Air: "Aéreo", Road: "Rodoviário", Inland: "Interior", Inclusive: "Inclusivo", Exclusive: "Exclusivo",
    Yes: "Sim", No: "Não", "Hide Form": "Ocultar formulário", Activate: "Ativar", Deactivate: "Desativar",
    Transporter: "Transportador", Airline: "Companhia aérea", "Shipping Line": "Linha marítima", "Courier Company": "Empresa de correio",
    "Warehouse Vendor": "Fornecedor de armazém", "Destination Agent": "Agente de destino", "Customs Agent": "Despachante aduaneiro",
    "Local Delivery Agent": "Agente de entrega local", "Overseas Agent": "Agente estrangeiro", Loading: "A carregar",
    "Search...": "Pesquisar...", Sort: "Ordenar", Fields: "Campos", Showing: "A mostrar", to: "a", of: "de", Rows: "Linhas",
    Page: "Página", "First page": "Primeira página", "Last page": "Última página", Reset: "Repor",
    "No data found": "Nenhum dado encontrado", "There are no records to show for the selected filters.": "Não existem registos para os filtros selecionados.",
    "Something went wrong": "Ocorreu um erro", "We could not load this data. Please retry.": "Não foi possível carregar os dados. Tente novamente.", Retry: "Tentar novamente"
  },
  "ru-RU": {
    "All Status": "Все статусы", "All Port Types": "Все типы портов", "Filter by": "Фильтр по",
    Sea: "Морской", Air: "Воздушный", Road: "Автомобильный", Inland: "Внутренний", Inclusive: "Включительно", Exclusive: "Исключительно",
    Yes: "Да", No: "Нет", "Hide Form": "Скрыть форму", Activate: "Активировать", Deactivate: "Деактивировать",
    Transporter: "Перевозчик", Airline: "Авиакомпания", "Shipping Line": "Судоходная линия", "Courier Company": "Курьерская компания",
    "Warehouse Vendor": "Поставщик склада", "Destination Agent": "Агент назначения", "Customs Agent": "Таможенный агент",
    "Local Delivery Agent": "Местный агент доставки", "Overseas Agent": "Зарубежный агент", Loading: "Загрузка",
    "Search...": "Поиск...", Sort: "Сортировка", Fields: "Поля", Showing: "Показано", to: "по", of: "из", Rows: "Строки",
    Page: "Страница", "First page": "Первая страница", "Last page": "Последняя страница", Reset: "Сбросить",
    "No data found": "Данные не найдены", "There are no records to show for the selected filters.": "Нет записей для выбранных фильтров.",
    "Something went wrong": "Произошла ошибка", "We could not load this data. Please retry.": "Не удалось загрузить данные. Повторите попытку.", Retry: "Повторить"
  }
};

function keyify(value: string) {
  return value.replace(/[^A-Za-z0-9]+(.)/g, (_, character: string) => character.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
}

function localizeValue(cultureCode: string, value: string): string {
  const catalog = { ...translations[cultureCode], ...optionTranslations[cultureCode] };
  if (!catalog) return value;
  const lookup = (text: string) =>
    catalog[text] ?? Object.entries(catalog).find(([key]) => key.toLocaleLowerCase() === text.toLocaleLowerCase())?.[1];
  const direct = lookup(value);
  if (direct) return direct;

  const prefixes = ["New", "Create", "Edit", "Delete", "View", "Save", "Select"];
  for (const prefix of prefixes) {
    if (!value.startsWith(`${prefix} `)) continue;
    const subject = value.slice(prefix.length + 1);
    const localizedPrefix = lookup(prefix);
    const localizedSubject = localizeValue(cultureCode, subject);
    if (localizedPrefix && localizedSubject !== subject) return `${localizedPrefix} ${localizedSubject}`;
  }

  const suffixes = ["Code", "Name", "Type"];
  for (const suffix of suffixes) {
    if (!value.toLocaleLowerCase().endsWith(` ${suffix.toLocaleLowerCase()}`)) continue;
    const subject = value.slice(0, -(suffix.length + 1));
    const localizedSubject = lookup(subject);
    const localizedSuffix = lookup(suffix);
    if (localizedSubject && localizedSuffix) return `${localizedSubject} ${localizedSuffix}`;
  }

  if (value.toLocaleLowerCase().startsWith("filter by ")) {
    const subject = value.slice("Filter by ".length);
    return `${lookup("Filter by") ?? "Filter by"} ${localizeValue(cultureCode, subject)}`;
  }

  if (value.toLocaleLowerCase().startsWith("loading ")) {
    const subject = value.slice("Loading ".length);
    return `${lookup("Loading") ?? "Loading"} ${localizeValue(cultureCode, subject)}`;
  }

  return value;
}

const moduleDescriptionResources: Record<string, { value: string; key: string }> = {
  Vendor: {
    value: "Vendor master with currency and payment profile.",
    key: "MasterData.Item.vendors.Description"
  },
  Agent: {
    value: "Agent master and commission setup.",
    key: "MasterData.Item.agents.Description"
  },
  Carrier: {
    value: "Carrier master management.",
    key: "MasterData.Item.carriers.Description"
  },
  Country: {
    value: "Manage country codes, ISO codes, and mobile dialing codes for freight forwarding masters.",
    key: "MasterData.Item.countries.Description"
  },
  PackageType: {
    value: "Manage package type master records.",
    key: "MasterData.Item.package-types.Description"
  },
  ShippingPort: {
    value: "Manage shipping port master records.",
    key: "MasterData.Item.shipping-ports.Description"
  },
  JobType: {
    value: "Manage job type master records and short codes for job numbering.",
    key: "MasterData.Item.job-types.Description"
  },
  Warehouse: {
    value: "Warehouse master and stock controls.",
    key: "MasterData.Item.warehouses.Description"
  },
  ChargeHead: {
    value: "Charge heads and income/expense account mapping.",
    key: "MasterData.Item.charge-heads.Description"
  },
  TaxRule: {
    value: "Tax setup for GST/VAT and recovery behavior.",
    key: "MasterData.Item.taxes.Description"
  }
};

export function useMasterDataI18n(moduleName: string) {
  const { t } = useI18n();
  const { cultureCode } = useWorkspace();

  return (value: string) => {
    const descriptionResource = moduleDescriptionResources[moduleName];
    if (descriptionResource?.value === value) {
      const localizedDescription = t(descriptionResource.key, value);
      if (localizedDescription !== value) return localizedDescription;
    }

    const key = `MasterData.${moduleName}.${keyify(value)}`;
    const serverValue = t(key, value);
    if (cultureCode === "en-US" || serverValue !== value) return serverValue;
    return localizeValue(cultureCode, value);
  };
}
