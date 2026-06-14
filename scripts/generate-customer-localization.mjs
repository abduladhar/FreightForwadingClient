import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const cultures = ["en-US", "ar-QA", "hi-IN", "fr-FR", "es-ES", "zh-CN", "tr-TR", "pt-PT", "ru-RU"];

const rows = [
  ["Common.Actions", "Actions", "الإجراءات", "कार्रवाई", "Actions", "Acciones", "操作", "İşlemler", "Ações", "Действия"],
  ["Common.Active", "Active", "نشط", "सक्रिय", "Actif", "Activo", "启用", "Aktif", "Ativo", "Активно"],
  ["Common.Continue", "Continue", "متابعة", "जारी रखें", "Continuer", "Continuar", "继续", "Devam et", "Continuar", "Продолжить"],
  ["Common.Delete", "Delete", "حذف", "हटाएं", "Supprimer", "Eliminar", "删除", "Sil", "Eliminar", "Удалить"],
  ["Common.Edit", "Edit", "تعديل", "संपादित करें", "Modifier", "Editar", "编辑", "Düzenle", "Editar", "Изменить"],
  ["Common.Remove", "Remove", "إزالة", "हटाएं", "Retirer", "Quitar", "移除", "Kaldır", "Remover", "Удалить"],
  ["Common.Review", "Review", "مراجعة", "समीक्षा", "Vérifier", "Revisar", "检查", "Gözden geçir", "Rever", "Проверить"],
  ["Common.Saving", "Saving...", "جارٍ الحفظ...", "सहेजा जा रहा है...", "Enregistrement...", "Guardando...", "正在保存...", "Kaydediliyor...", "A guardar...", "Сохранение..."],
  ["Common.Select", "Select", "اختر", "चुनें", "Sélectionner", "Seleccionar", "选择", "Seç", "Selecionar", "Выбрать"],
  ["Common.Status", "Status", "الحالة", "स्थिति", "Statut", "Estado", "状态", "Durum", "Estado", "Статус"],
  ["Page.Title.Customers", "Customers", "العملاء", "ग्राहक", "Clients", "Clientes", "客户", "Müşteriler", "Clientes", "Клиенты"],
  ["Page.Description.CustomerMasterWithCreditControlsAndPortalAccess", "Customer master with credit controls and portal access.", "بيانات العملاء مع ضوابط الائتمان والوصول إلى البوابة.", "क्रेडिट नियंत्रण और पोर्टल एक्सेस सहित ग्राहक मास्टर।", "Référentiel clients avec contrôle crédit et accès portail.", "Maestro de clientes con control de crédito y acceso al portal.", "客户主数据，包含信用控制和门户访问。", "Kredi kontrolleri ve portal erişimi ile müşteri ana verisi.", "Cadastro de clientes com controlos de crédito e acesso ao portal.", "Справочник клиентов с кредитным контролем и доступом к порталу."],
  ["Page.Title.CreateCustomer", "Create Customer", "إنشاء عميل", "ग्राहक बनाएं", "Créer un client", "Crear cliente", "创建客户", "Müşteri oluştur", "Criar cliente", "Создать клиента"],
  ["Page.Description.CreateCustomerProfileAndControls", "Create customer profile and controls.", "إنشاء ملف العميل والضوابط.", "ग्राहक प्रोफ़ाइल और नियंत्रण बनाएं।", "Créer le profil client et les contrôles.", "Crear perfil y controles del cliente.", "创建客户资料和控制项。", "Müşteri profili ve kontrolleri oluştur.", "Criar perfil e controlos do cliente.", "Создать профиль клиента и настройки."],
  ["Page.Title.EditCustomer", "Edit Customer", "تعديل العميل", "ग्राहक संपादित करें", "Modifier le client", "Editar cliente", "编辑客户", "Müşteri düzenle", "Editar cliente", "Изменить клиента"],
  ["Page.Description.UpdateCustomerMasterData", "Update customer master data.", "تحديث بيانات العميل الرئيسية.", "ग्राहक मास्टर डेटा अपडेट करें।", "Mettre à jour les données client.", "Actualizar datos maestros del cliente.", "更新客户主数据。", "Müşteri ana verisini güncelle.", "Atualizar dados mestre do cliente.", "Обновить данные клиента."],
  ["Customer.AddAddress", "Add Address", "إضافة عنوان", "पता जोड़ें", "Ajouter une adresse", "Agregar dirección", "添加地址", "Adres ekle", "Adicionar endereço", "Добавить адрес"],
  ["Customer.AddContact", "Add Contact", "إضافة جهة اتصال", "संपर्क जोड़ें", "Ajouter un contact", "Agregar contacto", "添加联系人", "Kişi ekle", "Adicionar contacto", "Добавить контакт"],
  ["Customer.Address", "Address", "العنوان", "पता", "Adresse", "Dirección", "地址", "Adres", "Endereço", "Адрес"],
  ["Customer.AuthorizedSalesmanTransfer", "Authorized Salesman Transfer", "نقل مندوب المبيعات المصرح", "अधिकृत सेल्समैन ट्रांसफर", "Transfert commercial autorisé", "Transferencia autorizada de vendedor", "授权销售员转移", "Yetkili satışçı transferi", "Transferência autorizada de vendedor", "Авторизованная передача менеджера"],
  ["Customer.BillingAddress", "Billing Address", "عنوان الفوترة", "बिलिंग पता", "Adresse de facturation", "Dirección de facturación", "账单地址", "Fatura adresi", "Morada de faturação", "Адрес выставления счета"],
  ["Customer.By", "by", "بواسطة", "द्वारा", "par", "por", "由", "tarafından", "por", "от"],
  ["Customer.City", "City", "المدينة", "शहर", "Ville", "Ciudad", "城市", "Şehir", "Cidade", "Город"],
  ["Customer.Code", "Code", "الكود", "कोड", "Code", "Código", "代码", "Kod", "Código", "Код"],
  ["Customer.ConfirmCustomerCurrency", "Confirm customer currency", "تأكيد عملة العميل", "ग्राहक मुद्रा पुष्टि करें", "Confirmer la devise client", "Confirmar moneda del cliente", "确认客户币种", "Müşteri para birimini onayla", "Confirmar moeda do cliente", "Подтвердить валюту клиента"],
  ["Customer.ContactName", "Contact Name", "اسم جهة الاتصال", "संपर्क नाम", "Nom du contact", "Nombre de contacto", "联系人姓名", "Kişi adı", "Nome do contacto", "Имя контакта"],
  ["Customer.ContactPerson", "Contact Person", "الشخص المسؤول", "संपर्क व्यक्ति", "Personne de contact", "Persona de contacto", "联系人", "İlgili kişi", "Pessoa de contacto", "Контактное лицо"],
  ["Customer.Country", "Country", "الدولة", "देश", "Pays", "País", "国家", "Ülke", "País", "Страна"],
  ["Customer.CreditLimit", "Credit Limit", "حد الائتمان", "क्रेडिट सीमा", "Limite de crédit", "Límite de crédito", "信用额度", "Kredi limiti", "Limite de crédito", "Кредитный лимит"],
  ["Customer.CurrencyCannotChangeConfirm", "Customer currency cannot be changed once the customer is created. Do you want to continue?", "لا يمكن تغيير عملة العميل بعد إنشاء العميل. هل تريد المتابعة؟", "ग्राहक बनने के बाद ग्राहक मुद्रा नहीं बदली जा सकती। क्या आप जारी रखना चाहते हैं?", "La devise client ne peut plus être modifiée après création. Voulez-vous continuer ?", "La moneda del cliente no se puede cambiar después de crearlo. ¿Desea continuar?", "客户创建后不能更改客户币种。是否继续？", "Müşteri oluşturulduktan sonra müşteri para birimi değiştirilemez. Devam etmek istiyor musunuz?", "A moeda do cliente não pode ser alterada após a criação. Deseja continuar?", "После создания клиента валюту изменить нельзя. Продолжить?"],
  ["Customer.CurrencyLockedAfterCreation", "Customer currency is locked after creation.", "عملة العميل مقفلة بعد الإنشاء.", "निर्माण के बाद ग्राहक मुद्रा लॉक हो जाती है।", "La devise client est verrouillée après création.", "La moneda del cliente queda bloqueada después de la creación.", "客户币种创建后锁定。", "Müşteri para birimi oluşturulduktan sonra kilitlenir.", "A moeda do cliente fica bloqueada após criação.", "Валюта клиента блокируется после создания."],
  ["Customer.CustomerCode", "Customer Code", "كود العميل", "ग्राहक कोड", "Code client", "Código de cliente", "客户代码", "Müşteri kodu", "Código do cliente", "Код клиента"],
  ["Customer.CustomerName", "Customer Name", "اسم العميل", "ग्राहक नाम", "Nom du client", "Nombre del cliente", "客户名称", "Müşteri adı", "Nome do cliente", "Название клиента"],
  ["Customer.CustomerType", "Customer Type", "نوع العميل", "ग्राहक प्रकार", "Type de client", "Tipo de cliente", "客户类型", "Müşteri türü", "Tipo de cliente", "Тип клиента"],
  ["Customer.Default", "Default", "افتراضي", "डिफ़ॉल्ट", "Défaut", "Predeterminado", "默认", "Varsayılan", "Predefinido", "По умолчанию"],
  ["Customer.DefaultCurrency", "Default Currency", "العملة الافتراضية", "डिफ़ॉल्ट मुद्रा", "Devise par défaut", "Moneda predeterminada", "默认币种", "Varsayılan para birimi", "Moeda padrão", "Валюта по умолчанию"],
  ["Customer.DeleteCustomer", "Delete Customer", "حذف العميل", "ग्राहक हटाएं", "Supprimer le client", "Eliminar cliente", "删除客户", "Müşteri sil", "Eliminar cliente", "Удалить клиента"],
  ["Customer.DeleteCustomerQuestion", "Delete customer?", "حذف العميل؟", "ग्राहक हटाएं?", "Supprimer le client ?", "¿Eliminar cliente?", "删除客户？", "Müşteri silinsin mi?", "Eliminar cliente?", "Удалить клиента?"],
  ["Customer.Designation", "Designation", "المسمى الوظيفي", "पदनाम", "Fonction", "Cargo", "职务", "Unvan", "Cargo", "Должность"],
  ["Customer.DocumentDisplayNameOptional", "Document display name (optional)", "اسم عرض المستند (اختياري)", "दस्तावेज़ प्रदर्शन नाम (वैकल्पिक)", "Nom d’affichage du document (facultatif)", "Nombre visible del documento (opcional)", "文档显示名称（可选）", "Belge görünen adı (isteğe bağlı)", "Nome visível do documento (opcional)", "Отображаемое имя документа (необязательно)"],
  ["Customer.EditCustomer", "Edit Customer", "تعديل العميل", "ग्राहक संपादित करें", "Modifier le client", "Editar cliente", "编辑客户", "Müşteri düzenle", "Editar cliente", "Изменить клиента"],
  ["Customer.Email", "Email", "البريد الإلكتروني", "ईमेल", "E-mail", "Correo", "电子邮件", "E-posta", "Email", "Email"],
  ["Customer.EnableTenantCurrencyBeforeSaving", "Enable a currency in Tenant Currency Setup before saving the customer.", "فعّل عملة في إعداد عملات المستأجر قبل حفظ العميل.", "ग्राहक सहेजने से पहले टेनेंट मुद्रा सेटअप में मुद्रा सक्षम करें।", "Activez une devise dans la configuration du locataire avant d’enregistrer le client.", "Habilite una moneda en la configuración del tenant antes de guardar el cliente.", "保存客户前请在租户币种设置中启用币种。", "Müşteriyi kaydetmeden önce kiracı para birimi ayarında bir para birimi etkinleştirin.", "Ative uma moeda na configuração do tenant antes de guardar o cliente.", "Перед сохранением клиента включите валюту в настройках арендатора."],
  ["Customer.LedgerHelp", "Customer ledger is available from accounting reports using customer filter.", "دفتر أستاذ العميل متاح من تقارير المحاسبة باستخدام فلتر العميل.", "ग्राहक फ़िल्टर का उपयोग करके ग्राहक लेजर लेखा रिपोर्ट में उपलब्ध है।", "Le grand livre client est disponible dans les rapports comptables avec le filtre client.", "El mayor de cliente está disponible en informes contables con filtro de cliente.", "客户分类账可通过会计报表中的客户筛选查看。", "Müşteri ekstresi muhasebe raporlarında müşteri filtresi ile kullanılabilir.", "O razão do cliente está disponível nos relatórios contabilísticos com filtro de cliente.", "Книга клиента доступна в бухгалтерских отчетах с фильтром клиента."],
  ["Customer.Loading", "Loading...", "جارٍ التحميل...", "लोड हो रहा है...", "Chargement...", "Cargando...", "正在加载...", "Yükleniyor...", "A carregar...", "Загрузка..."],
  ["Customer.LoadingCustomer", "Loading customer...", "جارٍ تحميل العميل...", "ग्राहक लोड हो रहा है...", "Chargement du client...", "Cargando cliente...", "正在加载客户...", "Müşteri yükleniyor...", "A carregar cliente...", "Загрузка клиента..."],
  ["Customer.Name", "Name", "الاسم", "नाम", "Nom", "Nombre", "名称", "Ad", "Nome", "Название"],
  ["Customer.NewCustomer", "New Customer", "عميل جديد", "नया ग्राहक", "Nouveau client", "Nuevo cliente", "新客户", "Yeni müşteri", "Novo cliente", "Новый клиент"],
  ["Customer.NoTenantCurrencyEnabled", "No tenant currency enabled", "لا توجد عملة مفعلة للمستأجر", "कोई टेनेंट मुद्रा सक्षम नहीं", "Aucune devise locataire activée", "No hay moneda del tenant habilitada", "未启用租户币种", "Etkin kiracı para birimi yok", "Nenhuma moeda do tenant ativa", "Валюта арендатора не включена"],
  ["Customer.OpenCustomerLedgerReport", "Open Customer Ledger Report", "فتح تقرير دفتر أستاذ العميل", "ग्राहक लेजर रिपोर्ट खोलें", "Ouvrir le rapport grand livre client", "Abrir informe de mayor de cliente", "打开客户分类账报表", "Müşteri ekstresi raporunu aç", "Abrir relatório de razão do cliente", "Открыть отчет книги клиента"],
  ["Customer.PaymentTerms", "Payment Terms", "شروط الدفع", "भुगतान शर्तें", "Conditions de paiement", "Condiciones de pago", "付款条件", "Ödeme şartları", "Condições de pagamento", "Условия оплаты"],
  ["Customer.PaymentTermsExample", "e.g. 30 Days", "مثال: 30 يومًا", "जैसे 30 दिन", "p. ex. 30 jours", "p. ej. 30 días", "例如 30 天", "örn. 30 Gün", "ex.: 30 dias", "например 30 дней"],
  ["Customer.Phone", "Phone", "الهاتف", "फोन", "Téléphone", "Teléfono", "电话", "Telefon", "Telefone", "Телефон"],
  ["Customer.PortalAccessEnabled", "Portal Access Enabled", "تمكين الوصول إلى البوابة", "पोर्टल एक्सेस सक्षम", "Accès portail activé", "Acceso al portal habilitado", "门户访问已启用", "Portal erişimi etkin", "Acesso ao portal ativo", "Доступ к порталу включен"],
  ["Customer.Primary", "Primary", "أساسي", "प्राथमिक", "Principal", "Principal", "主要", "Birincil", "Principal", "Основной"],
  ["Customer.ReasonForReassignment", "Reason for reassignment", "سبب إعادة التعيين", "पुनर्नियुक्ति का कारण", "Motif de réaffectation", "Motivo de reasignación", "重新分配原因", "Yeniden atama nedeni", "Motivo da reatribuição", "Причина переназначения"],
  ["Customer.SalesmanOptional", "Salesman (optional)", "مندوب المبيعات (اختياري)", "सेल्समैन (वैकल्पिक)", "Commercial (facultatif)", "Vendedor (opcional)", "销售员（可选）", "Satışçı (isteğe bağlı)", "Vendedor (opcional)", "Менеджер (необязательно)"],
  ["Customer.SalesmanTransferHelp", "Reassignment requires a new Salesman and a reason. Every transfer is retained in the audit history.", "تتطلب إعادة التعيين مندوب مبيعات جديدًا وسببًا. يتم حفظ كل نقل في سجل التدقيق.", "पुनर्नियुक्ति के लिए नया सेल्समैन और कारण चाहिए। हर ट्रांसफर ऑडिट इतिहास में रखा जाता है।", "La réaffectation nécessite un nouveau commercial et un motif. Chaque transfert est conservé dans l’audit.", "La reasignación requiere un nuevo vendedor y un motivo. Cada transferencia queda en auditoría.", "重新分配需要新的销售员和原因。每次转移都会保留在审计历史中。", "Yeniden atama için yeni satışçı ve neden gerekir. Her transfer denetim geçmişinde tutulur.", "A reatribuição requer novo vendedor e motivo. Cada transferência fica no histórico de auditoria.", "Переназначение требует нового менеджера и причину. Каждая передача сохраняется в аудите."],
  ["Customer.SaveCustomer", "Save Customer", "حفظ العميل", "ग्राहक सहेजें", "Enregistrer le client", "Guardar cliente", "保存客户", "Müşteri kaydet", "Guardar cliente", "Сохранить клиента"],
  ["Customer.ShippingAddress", "Shipping Address", "عنوان الشحن", "शिपिंग पता", "Adresse de livraison", "Dirección de envío", "送货地址", "Teslimat adresi", "Morada de envio", "Адрес доставки"],
  ["Customer.Tab.addresses", "Addresses", "العناوين", "पते", "Adresses", "Direcciones", "地址", "Adresler", "Endereços", "Адреса"],
  ["Customer.Tab.contacts", "Contacts", "جهات الاتصال", "संपर्क", "Contacts", "Contactos", "联系人", "Kişiler", "Contactos", "Контакты"],
  ["Customer.Tab.credit", "Credit", "الائتمان", "क्रेडिट", "Crédit", "Crédito", "信用", "Kredi", "Crédito", "Кредит"],
  ["Customer.Tab.documents", "Documents", "المستندات", "दस्तावेज़", "Documents", "Documentos", "文档", "Belgeler", "Documentos", "Документы"],
  ["Customer.Tab.main", "Main", "الرئيسية", "मुख्य", "Principal", "Principal", "主要", "Ana", "Principal", "Основное"],
  ["Customer.Transfer", "Transfer", "نقل", "ट्रांसफर", "Transférer", "Transferir", "转移", "Transfer et", "Transferir", "Передать"],
  ["Customer.Type", "Type", "النوع", "प्रकार", "Type", "Tipo", "类型", "Tür", "Tipo", "Тип"],
  ["Customer.Unassigned", "Unassigned", "غير معين", "असाइन नहीं", "Non affecté", "Sin asignar", "未分配", "Atanmamış", "Não atribuído", "Не назначено"],
  ["Customer.UseSalesmanTransfer", "Use the authorized Salesman Transfer action to change this assignment.", "استخدم إجراء نقل مندوب المبيعات المصرح لتغيير هذا التعيين.", "इस असाइनमेंट को बदलने के लिए अधिकृत सेल्समैन ट्रांसफर का उपयोग करें।", "Utilisez le transfert commercial autorisé pour modifier cette affectation.", "Use la transferencia autorizada de vendedor para cambiar esta asignación.", "使用授权销售员转移操作更改此分配。", "Bu atamayı değiştirmek için yetkili satışçı transferini kullanın.", "Use a transferência autorizada de vendedor para alterar esta atribuição.", "Используйте авторизованную передачу менеджера для изменения назначения."],
  ["Customer.ViewCustomer", "View Customer", "عرض العميل", "ग्राहक देखें", "Voir le client", "Ver cliente", "查看客户", "Müşteri görüntüle", "Ver cliente", "Просмотреть клиента"]
];

const resources = Object.fromEntries(rows.map(([key, ...values]) => [key, Object.fromEntries(cultures.map((culture, index) => [culture, values[index]]))]));
const fallback = {};
for (const culture of cultures) {
  if (culture === "en-US") continue;
  fallback[culture] = {};
  for (const [key, values] of Object.entries(resources)) fallback[culture][key] = values[culture];
}

writeFileSync(resolve("frontend/src/app/customerLocalizationFallbacks.ts"), `export const customerLocalizationFallbacks: Record<string, Record<string, string>> = ${JSON.stringify(fallback, null, 2)};\n`, "utf8");

const sqlRows = [];
for (const [key, values] of Object.entries(resources)) {
  for (const culture of cultures) {
    sqlRows.push({
      moduleName: key.startsWith("Common.") ? "Common" : key.startsWith("Page.") ? "Page" : "Customer",
      resourceType: key.startsWith("Page.Description.") || key.endsWith("Help") ? "Message" : "Label",
      key,
      culture,
      value: values[culture]
    });
  }
}

writeSql("database/migrations/20260613_insert_missing_customer_localization.sql", false, sqlRows);
writeSql("database/migrations/20260613_update_customer_localization.sql", true, sqlRows);
console.log(JSON.stringify({ keys: Object.keys(resources).length, rows: sqlRows.length }, null, 2));

function writeSql(fileName, updateOnly, rows) {
  const values = rows.map((row) => `    (N'${sql(row.moduleName)}', N'${sql(row.resourceType)}', N'${sql(row.key)}', N'${sql(row.culture)}', N'${sql(row.value)}')`).join(",\n");
  const output = `/* ${updateOnly ? "Updates existing" : "Inserts missing"} customer localization resources/translations. */\n\nDECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';\nDECLARE @Now datetimeoffset = SYSUTCDATETIME();\n\nDECLARE @Rows TABLE\n(\n    ModuleName nvarchar(128) NOT NULL,\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO @Rows (ModuleName, ResourceType, ResourceKey, CultureCode, ResourceValue)\nVALUES\n${values};\n\n${updateOnly ? updateOnlySql() : insertMissingSql()}\n`;
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
