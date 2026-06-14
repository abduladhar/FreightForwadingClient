import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const frontendSrc = join(root, "frontend", "src");
const output = join(root, "database", "migrations", "20260613_seed_all_ui_localization_resources.sql");

const languages = [
  ["EN", "en-US", "English", "English", "LTR", 1, 1],
  ["AR", "ar-QA", "Arabic", "العربية", "RTL", 0, 2],
  ["HI", "hi-IN", "Hindi", "हिन्दी", "LTR", 0, 3],
  ["FR", "fr-FR", "French", "Français", "LTR", 0, 4],
  ["ES", "es-ES", "Spanish", "Español", "LTR", 0, 5],
  ["ZH", "zh-CN", "Chinese Simplified", "简体中文", "LTR", 0, 6],
  ["TR", "tr-TR", "Turkish", "Türkçe", "LTR", 0, 7],
  ["PT", "pt-PT", "Portuguese", "Português", "LTR", 0, 8],
  ["RU", "ru-RU", "Russian", "Русский", "LTR", 0, 9]
];

const exact = new Map([
  row("Save", "حفظ", "सहेजें", "Enregistrer", "Guardar", "保存", "Kaydet", "Guardar", "Сохранить"),
  row("Cancel", "إلغاء", "रद्द करें", "Annuler", "Cancelar", "取消", "İptal", "Cancelar", "Отмена"),
  row("Delete", "حذف", "हटाएँ", "Supprimer", "Eliminar", "删除", "Sil", "Eliminar", "Удалить"),
  row("Edit", "تعديل", "संपादित करें", "Modifier", "Editar", "编辑", "Düzenle", "Editar", "Изменить"),
  row("Create", "إنشاء", "बनाएँ", "Créer", "Crear", "创建", "Oluştur", "Criar", "Создать"),
  row("Update", "تحديث", "अपडेट", "Mettre à jour", "Actualizar", "更新", "Güncelle", "Atualizar", "Обновить"),
  row("Search", "بحث", "खोज", "Recherche", "Buscar", "搜索", "Ara", "Pesquisar", "Поиск"),
  row("Refresh", "تحديث", "रीफ्रेश", "Actualiser", "Actualizar", "刷新", "Yenile", "Atualizar", "Обновить"),
  row("Actions", "الإجراءات", "कार्रवाई", "Actions", "Acciones", "操作", "İşlemler", "Ações", "Действия"),
  row("Status", "الحالة", "स्थिति", "Statut", "Estado", "状态", "Durum", "Estado", "Статус"),
  row("Active", "نشط", "सक्रिय", "Actif", "Activo", "启用", "Aktif", "Ativo", "Активный"),
  row("Inactive", "غير نشط", "निष्क्रिय", "Inactif", "Inactivo", "停用", "Pasif", "Inativo", "Неактивный"),
  row("Customer", "العميل", "ग्राहक", "Client", "Cliente", "客户", "Müşteri", "Cliente", "Клиент"),
  row("Customers", "العملاء", "ग्राहक", "Clients", "Clientes", "客户", "Müşteriler", "Clientes", "Клиенты"),
  row("Vendor", "المورد", "विक्रेता", "Fournisseur", "Proveedor", "供应商", "Tedarikçi", "Fornecedor", "Поставщик"),
  row("Vendors", "الموردون", "विक्रेता", "Fournisseurs", "Proveedores", "供应商", "Tedarikçiler", "Fornecedores", "Поставщики"),
  row("Agent", "الوكيل", "एजेंट", "Agent", "Agente", "代理", "Acente", "Agente", "Агент"),
  row("Agents", "الوكلاء", "एजेंट", "Agents", "Agentes", "代理", "Acenteler", "Agentes", "Агенты"),
  row("Carrier", "الناقل", "कैरियर", "Transporteur", "Transportista", "承运人", "Taşıyıcı", "Transportadora", "Перевозчик"),
  row("Carriers", "الناقلون", "कैरियर", "Transporteurs", "Transportistas", "承运人", "Taşıyıcılar", "Transportadoras", "Перевозчики"),
  row("Employee", "الموظف", "कर्मचारी", "Employé", "Empleado", "员工", "Çalışan", "Funcionário", "Сотрудник"),
  row("Employees", "الموظفون", "कर्मचारी", "Employés", "Empleados", "员工", "Çalışanlar", "Funcionários", "Сотрудники"),
  row("Currency", "العملة", "मुद्रा", "Devise", "Moneda", "币种", "Para birimi", "Moeda", "Валюта"),
  row("Currencies", "العملات", "मुद्राएँ", "Devises", "Monedas", "币种", "Para birimleri", "Moedas", "Валюты"),
  row("Language", "اللغة", "भाषा", "Langue", "Idioma", "语言", "Dil", "Idioma", "Язык"),
  row("Languages", "اللغات", "भाषाएँ", "Langues", "Idiomas", "语言", "Diller", "Idiomas", "Языки"),
  row("Branch", "الفرع", "शाखा", "Agence", "Sucursal", "分支机构", "Şube", "Filial", "Филиал"),
  row("Tenant", "المستأجر", "टेनेंट", "Tenant", "Tenant", "租户", "Kiracı", "Tenant", "Клиент"),
  row("Date", "التاريخ", "दिनांक", "Date", "Fecha", "日期", "Tarih", "Data", "Дата"),
  row("Amount", "المبلغ", "राशि", "Montant", "Importe", "金额", "Tutar", "Valor", "Сумма"),
  row("Description", "الوصف", "विवरण", "Description", "Descripción", "描述", "Açıklama", "Descrição", "Описание"),
  row("Remarks", "ملاحظات", "टिप्पणी", "Remarques", "Observaciones", "备注", "Notlar", "Observações", "Примечания"),
  row("Name", "الاسم", "नाम", "Nom", "Nombre", "名称", "Ad", "Nome", "Имя"),
  row("Code", "الرمز", "कोड", "Code", "Código", "代码", "Kod", "Código", "Код"),
  row("Country", "الدولة", "देश", "Pays", "País", "国家", "Ülke", "País", "Страна"),
  row("Phone", "الهاتف", "फोन", "Téléphone", "Teléfono", "电话", "Telefon", "Telefone", "Телефон"),
  row("Email", "البريد الإلكتروني", "ईमेल", "E-mail", "Correo", "电子邮件", "E-posta", "Email", "Email"),
  row("Address", "العنوان", "पता", "Adresse", "Dirección", "地址", "Adres", "Endereço", "Адрес"),
  row("Account", "الحساب", "खाता", "Compte", "Cuenta", "账户", "Hesap", "Conta", "Счет"),
  row("Accounts", "الحسابات", "खाते", "Comptes", "Cuentas", "账户", "Hesaplar", "Contas", "Счета"),
  row("Group", "المجموعة", "समूह", "Groupe", "Grupo", "组", "Grup", "Grupo", "Группа"),
  row("Groups", "المجموعات", "समूह", "Groupes", "Grupos", "组", "Gruplar", "Grupos", "Группы"),
  row("Chart", "الدليل", "चार्ट", "Plan", "Plan", "图表", "Plan", "Plano", "План"),
  row("Ledger", "دفتر الأستاذ", "लेजर", "Grand livre", "Mayor", "分类账", "Defter", "Razão", "Книга"),
  row("Entry", "القيد", "प्रविष्टि", "Écriture", "Asiento", "分录", "Kayıt", "Lançamento", "Запись"),
  row("Entries", "القيود", "प्रविष्टियाँ", "Écritures", "Asientos", "分录", "Kayıtlar", "Lançamentos", "Записи"),
  row("Financial", "مالي", "वित्तीय", "Financier", "Financiero", "财务", "Mali", "Financeiro", "Финансовый"),
  row("Year", "السنة", "वर्ष", "Année", "Año", "年度", "Yıl", "Ano", "Год"),
  row("Years", "السنوات", "वर्ष", "Années", "Años", "年度", "Yıllar", "Anos", "Годы"),
  row("Opening", "افتتاحي", "आरंभिक", "Ouverture", "Apertura", "期初", "Açılış", "Abertura", "Начальный"),
  row("Balance", "الرصيد", "शेष", "Solde", "Saldo", "余额", "Bakiye", "Saldo", "Баланс"),
  row("Balances", "الأرصدة", "शेष", "Soldes", "Saldos", "余额", "Bakiyeler", "Saldos", "Балансы"),
  row("Mapping", "الربط", "मैपिंग", "Mappage", "Mapeo", "映射", "Eşleme", "Mapeamento", "Сопоставление"),
  row("Mappings", "الربط", "मैपिंग", "Mappages", "Mapeos", "映射", "Eşlemeler", "Mapeamentos", "Сопоставления"),
  row("Journal", "اليومية", "जर्नल", "Journal", "Diario", "日记账", "Yevmiye", "Diário", "Журнал"),
  row("Voucher", "القسيمة", "वाउचर", "Pièce", "Comprobante", "凭证", "Fiş", "Comprovativo", "Ваучер"),
  row("Vouchers", "القسائم", "वाउचर", "Pièces", "Comprobantes", "凭证", "Fişler", "Comprovativos", "Ваучеры"),
  row("Payment", "الدفع", "भुगतान", "Paiement", "Pago", "付款", "Ödeme", "Pagamento", "Платеж"),
  row("Payments", "المدفوعات", "भुगतान", "Paiements", "Pagos", "付款", "Ödemeler", "Pagamentos", "Платежи"),
  row("Receipt", "الإيصال", "रसीद", "Reçu", "Recibo", "收据", "Tahsilat", "Recibo", "Квитанция"),
  row("Receipts", "الإيصالات", "रसीदें", "Reçus", "Recibos", "收据", "Tahsilatlar", "Recibos", "Квитанции"),
  row("Contra", "تحويل", "कॉन्ट्रा", "Contra", "Contra", "转账", "Virman", "Contra", "Контра"),
  row("Reconciliation", "المطابقة", "मिलान", "Rapprochement", "Conciliación", "对账", "Mutabakat", "Reconciliação", "Сверка"),
  row("Salary", "الراتب", "वेतन", "Salaire", "Salario", "工资", "Maaş", "Salário", "Зарплата"),
  row("Rate", "السعر", "रेट", "Tarif", "Tarifa", "费率", "Fiyat", "Tarifa", "Тариф"),
  row("Master", "رئيسي", "मास्टर", "Master", "Maestro", "主", "Ana", "Mestre", "Мастер"),
  row("Quotation", "عرض السعر", "कोटेशन", "Devis", "Cotización", "报价", "Teklif", "Cotação", "Предложение"),
  row("Quotations", "عروض الأسعار", "कोटेशन", "Devis", "Cotizaciones", "报价", "Teklifler", "Cotações", "Предложения"),
  row("Customs", "الجمارك", "कस्टम्स", "Douane", "Aduana", "海关", "Gümrük", "Alfândega", "Таможня"),
  row("Clearance", "التخليص", "क्लीयरेंस", "Dédouanement", "Despacho", "清关", "Gümrükleme", "Desalfandegamento", "Оформление"),
  row("Job", "الوظيفة", "जॉब", "Dossier", "Trabajo", "作业", "İş", "Job", "Задание"),
  row("Jobs", "الوظائف", "जॉब", "Dossiers", "Trabajos", "作业", "İşler", "Jobs", "Задания"),
  row("Bill", "الفاتورة", "बिल", "Facture", "Factura", "账单", "Fatura", "Fatura", "Счет"),
  row("Bills", "الفواتير", "बिल", "Factures", "Facturas", "账单", "Faturalar", "Faturas", "Счета"),
  row("Invoice", "الفاتورة", "चालान", "Facture", "Factura", "发票", "Fatura", "Fatura", "Счет"),
  row("Note", "الإشعار", "नोट", "Note", "Nota", "通知单", "Not", "Nota", "Нота"),
  row("Notes", "الإشعارات", "नोट", "Notes", "Notas", "通知单", "Notlar", "Notas", "Ноты"),
  row("Credit", "دائن", "क्रेडिट", "Crédit", "Crédito", "贷项", "Alacak", "Crédito", "Кредит"),
  row("Debit", "مدين", "डेबिट", "Débit", "Débito", "借项", "Borç", "Débito", "Дебет"),
  row("Commission", "العمولة", "कमीशन", "Commission", "Comisión", "佣金", "Komisyon", "Comissão", "Комиссия"),
  row("Commissions", "العمولات", "कमीशन", "Commissions", "Comisiones", "佣金", "Komisyonlar", "Comissões", "Комиссии"),
  row("Portal", "البوابة", "पोर्टल", "Portail", "Portal", "门户", "Portal", "Portal", "Портал"),
  row("User", "المستخدم", "यूज़र", "Utilisateur", "Usuario", "用户", "Kullanıcı", "Utilizador", "Пользователь"),
  row("Users", "المستخدمون", "यूज़र", "Utilisateurs", "Usuarios", "用户", "Kullanıcılar", "Utilizadores", "Пользователи"),
  row("Role", "الدور", "भूमिका", "Rôle", "Rol", "角色", "Rol", "Função", "Роль"),
  row("Roles", "الأدوار", "भूमिकाएँ", "Rôles", "Roles", "角色", "Roller", "Funções", "Роли"),
  row("Permission", "الصلاحية", "अनुमति", "Permission", "Permiso", "权限", "Yetki", "Permissão", "Право"),
  row("Matrix", "المصفوفة", "मैट्रिक्स", "Matrice", "Matriz", "矩阵", "Matrisi", "Matriz", "Матрица"),
  row("Notification", "الإشعار", "सूचना", "Notification", "Notificación", "通知", "Bildirim", "Notificação", "Уведомление"),
  row("History", "السجل", "इतिहास", "Historique", "Historial", "历史", "Geçmiş", "Histórico", "История"),
  row("Audit", "التدقيق", "ऑडिट", "Audit", "Auditoría", "审计", "Denetim", "Auditoria", "Аудит"),
  row("Log", "السجل", "लॉग", "Journal", "Registro", "日志", "Kayıt", "Registo", "Журнал"),
  row("Logs", "السجلات", "लॉग", "Journaux", "Registros", "日志", "Kayıtlar", "Registos", "Журналы"),
  row("Audit Logs", "سجلات التدقيق", "ऑडिट लॉग", "Journaux d'audit", "Registros de auditoría", "审计日志", "Denetim kayıtları", "Registros de auditoria", "Журналы аудита"),
  row("Report", "التقرير", "रिपोर्ट", "Rapport", "Reporte", "报表", "Rapor", "Relatório", "Отчет"),
  row("Reports", "التقارير", "रिपोर्ट", "Rapports", "Informes", "报表", "Raporlar", "Relatórios", "Отчеты"),
  row("Origin Port", "ميناء المنشأ", "मूल पोर्ट", "Port d'origine", "Puerto de origen", "起运港", "Çıkış limanı", "Porto de origem", "Порт отправления"),
  row("Destination Port", "ميناء الوجهة", "गंतव्य पोर्ट", "Port de destination", "Puerto de destino", "目的港", "Varış limanı", "Porto de destino", "Порт назначения"),
  row("Shipper Name", "اسم الشاحن", "शिपर का नाम", "Nom de l'expéditeur", "Nombre del remitente", "发货人名称", "Gönderici adı", "Nome do expedidor", "Имя отправителя"),
  row("Consignee Name", "اسم المستلم", "कंसाइनी का नाम", "Nom du destinataire", "Nombre del consignatario", "收货人名称", "Alıcı adı", "Nome do consignatário", "Имя получателя"),
  row("Package Type", "نوع الطرد", "पैकेज प्रकार", "Type de colis", "Tipo de paquete", "包装类型", "Paket türü", "Tipo de embalagem", "Тип упаковки"),
  row("No. of Packages", "عدد الطرود", "पैकेज की संख्या", "Nombre de colis", "N.º de paquetes", "包裹数量", "Paket sayısı", "N.º de volumes", "Кол-во мест"),
  row("Gross Weight", "الوزن الإجمالي", "सकल वजन", "Poids brut", "Peso bruto", "毛重", "Brüt ağırlık", "Peso bruto", "Вес брутто"),
  row("Length", "الطول", "लंबाई", "Longueur", "Longitud", "长度", "Uzunluk", "Comprimento", "Длина"),
  row("Width", "العرض", "चौड़ाई", "Largeur", "Ancho", "宽度", "Genişlik", "Largura", "Ширина"),
  row("Height", "الارتفاع", "ऊँचाई", "Hauteur", "Altura", "高度", "Yükseklik", "Altura", "Высота"),
  row("Volume", "الحجم", "वॉल्यूम", "Volume", "Volumen", "体积", "Hacim", "Volume", "Объем"),
  row("HS Code", "رمز النظام المنسق", "एचएस कोड", "Code SH", "Código HS", "HS编码", "GTİP kodu", "Código SH", "Код ТН ВЭД"),
  row("Country of Origin", "بلد المنشأ", "मूल देश", "Pays d'origine", "País de origen", "原产国", "Menşe ülke", "País de origem", "Страна происхождения"),
  row("Dashboard", "لوحة التحكم", "डैशबोर्ड", "Tableau de bord", "Panel", "仪表板", "Pano", "Painel", "Панель"),
  row("Masters", "البيانات الرئيسية", "मास्टर", "Référentiels", "Maestros", "主数据", "Ana veriler", "Cadastros", "Справочники"),
  row("Operations", "العمليات", "संचालन", "Opérations", "Operaciones", "操作", "Operasyonlar", "Operações", "Операции"),
  row("Shipments", "الشحنات", "शिपमेंट", "Expéditions", "Envíos", "货运", "Sevkiyatlar", "Remessas", "Отправки"),
  row("Finance", "المالية", "वित्त", "Finance", "Finanzas", "财务", "Finans", "Finanças", "Финансы"),
  row("Accounting", "المحاسبة", "लेखा", "Comptabilité", "Contabilidad", "会计", "Muhasebe", "Contabilidade", "Бухгалтерия"),
  row("Reports", "التقارير", "रिपोर्ट", "Rapports", "Informes", "报表", "Raporlar", "Relatórios", "Отчеты"),
  row("Documents", "المستندات", "दस्तावेज़", "Documents", "Documentos", "文档", "Belgeler", "Documentos", "Документы"),
  row("Settings", "الإعدادات", "सेटिंग्स", "Paramètres", "Configuración", "设置", "Ayarlar", "Configurações", "Настройки"),
  row("Pickup", "الاستلام", "पिकअप", "Enlèvement", "Recogida", "提货", "Alım", "Recolha", "Забор груза"),
  row("Goods Receipt", "استلام البضائع", "गुड्स रिसीट", "Réception marchandises", "Recepción de mercancía", "收货", "Mal kabul", "Receção de mercadorias", "Приемка груза"),
  row("House Shipments", "الشحنات الفرعية", "हाउस शिपमेंट", "Expéditions house", "Embarques house", "分运单货运", "House sevkiyatlar", "Remessas house", "House отправки"),
  row("Master Shipments", "الشحنات الرئيسية", "मास्टर शिपमेंट", "Expéditions master", "Embarques master", "主运单货运", "Master sevkiyatlar", "Remessas master", "Master отправки"),
  row("Direct Shipments", "الشحنات المباشرة", "डायरेक्ट शिपमेंट", "Expéditions directes", "Embarques directos", "直运货运", "Direkt sevkiyatlar", "Remessas diretas", "Прямые отправки"),
  row("Invoices", "الفواتير", "चालान", "Factures", "Facturas", "发票", "Faturalar", "Faturas", "Счета"),
  row("Vendor Bills", "فواتير الموردين", "वेंडर बिल", "Factures fournisseurs", "Facturas de proveedor", "供应商账单", "Tedarikçi faturaları", "Faturas de fornecedor", "Счета поставщиков"),
  row("Customer Receipts", "إيصالات العملاء", "ग्राहक रसीदें", "Encaissements clients", "Recibos de clientes", "客户收款", "Müşteri tahsilatları", "Recibos de clientes", "Поступления от клиентов"),
  row("Vendor Payments", "مدفوعات الموردين", "वेंडर भुगतान", "Paiements fournisseurs", "Pagos a proveedores", "供应商付款", "Tedarikçi ödemeleri", "Pagamentos a fornecedores", "Платежи поставщикам")
  ,row("Ledger Report", "تقرير دفتر الأستاذ", "लेजर रिपोर्ट", "Rapport grand livre", "Reporte de mayor", "分类账报表", "Defter raporu", "Relatório razão", "Отчет по счету")
  ,row("General Ledger", "دفتر الأستاذ العام", "जनरल लेजर", "Grand livre général", "Libro mayor general", "总账", "Genel muhasebe defteri", "Razão geral", "Главная книга")
  ,row("Customer Ledger", "دفتر أستاذ العميل", "ग्राहक लेजर", "Grand livre client", "Mayor de cliente", "客户分类账", "Müşteri ekstresi", "Razão do cliente", "Клиентская книга")
  ,row("Vendor Ledger", "دفتر أستاذ المورد", "वेंडर लेजर", "Grand livre fournisseur", "Mayor de proveedor", "供应商分类账", "Tedarikçi ekstresi", "Razão do fornecedor", "Книга поставщика")
  ,row("Bank Book", "دفتر البنك", "बैंक बुक", "Livre de banque", "Libro de banco", "银行日记账", "Banka defteri", "Livro de banco", "Банковская книга")
  ,row("Cash Book", "دفتر الصندوق", "कैश बुक", "Livre de caisse", "Libro de caja", "现金日记账", "Kasa defteri", "Livro de caixa", "Кассовая книга")
  ,row("Trial Balance", "ميزان المراجعة", "ट्रायल बैलेंस", "Balance de vérification", "Balance de comprobación", "试算表", "Mizan", "Balancete", "Оборотно-сальдовая ведомость")
  ,row("Balance Sheet", "الميزانية العمومية", "बैलेंस शीट", "Bilan", "Balance general", "资产负债表", "Bilanço", "Balanço", "Баланс")
  ,row("Profit & Loss", "الأرباح والخسائر", "लाभ और हानि", "Compte de résultat", "Pérdidas y ganancias", "损益表", "Kar zarar", "Lucros e perdas", "Прибыли и убытки")
  ,row("Trading P&L", "أرباح وخسائر التداول", "ट्रेडिंग पी एंड एल", "P&L commercial", "P&G comercial", "交易损益", "Ticari kar zarar", "P&L comercial", "Торговые прибыли и убытки")
  ,row("Tax Report", "تقرير الضريبة", "टैक्स रिपोर्ट", "Rapport fiscal", "Reporte de impuestos", "税务报表", "Vergi raporu", "Relatório fiscal", "Налоговый отчет")
  ,row("Customer Outstanding", "مستحقات العملاء", "ग्राहक बकाया", "Encours clients", "Pendiente de clientes", "客户未结款", "Müşteri bakiyesi", "Pendentes de clientes", "Задолженность клиентов")
  ,row("Vendor Outstanding", "مستحقات الموردين", "वेंडर बकाया", "Encours fournisseurs", "Pendiente de proveedores", "供应商未结款", "Tedarikçi bakiyesi", "Pendentes de fornecedores", "Задолженность поставщикам")
  ,row("Statement of Account", "كشف الحساب", "खाता विवरण", "Relevé de compte", "Estado de cuenta", "对账单", "Hesap ekstresi", "Extrato de conta", "Выписка по счету")
  ,row("Currency Gain/Loss", "ربح/خسارة العملة", "मुद्रा लाभ/हानि", "Gain/perte de change", "Ganancia/pérdida cambiaria", "汇兑损益", "Kur kar/zararı", "Ganho/perda cambial", "Курсовая прибыль/убыток")
  ,row("Currency Revaluation", "إعادة تقييم العملة", "मुद्रा पुनर्मूल्यांकन", "Réévaluation devise", "Revaluación de moneda", "货币重估", "Döviz değerleme", "Reavaliação cambial", "Переоценка валюты")
  ,row("Quotation Report", "تقرير عروض الأسعار", "कोटेशन रिपोर्ट", "Rapport des devis", "Reporte de cotizaciones", "报价报表", "Teklif raporu", "Relatório de cotações", "Отчет по предложениям")
  ,row("Goods Receipt Report", "تقرير استلام البضائع", "गुड्स रिसीट रिपोर्ट", "Rapport réception marchandises", "Reporte de recepción de mercancía", "收货报表", "Mal kabul raporu", "Relatório de receção de mercadorias", "Отчет по приемке груза")
  ,row("Warehouse Stock Report", "تقرير مخزون المستودع", "वेयरहाउस स्टॉक रिपोर्ट", "Rapport stock entrepôt", "Reporte de stock de almacén", "仓库库存报表", "Depo stok raporu", "Relatório de stock de armazém", "Отчет складских остатков")
  ,row("Pickup Report", "تقرير الاستلام", "पिकअप रिपोर्ट", "Rapport enlèvement", "Reporte de recogida", "提货报表", "Alım raporu", "Relatório de recolha", "Отчет по забору груза")
  ,row("House Shipment Report", "تقرير الشحنات الفرعية", "हाउस शिपमेंट रिपोर्ट", "Rapport expéditions house", "Reporte de embarques house", "分运单货运报表", "House sevkiyat raporu", "Relatório de remessas house", "Отчет по house отправкам")
  ,row("Master Shipment Report", "تقرير الشحنات الرئيسية", "मास्टर शिपमेंट रिपोर्ट", "Rapport expéditions master", "Reporte de embarques master", "主运单货运报表", "Master sevkiyat raporu", "Relatório de remessas master", "Отчет по master отправкам")
  ,row("Direct Shipment Report", "تقرير الشحنات المباشرة", "डायरेक्ट शिपमेंट रिपोर्ट", "Rapport expéditions directes", "Reporte de embarques directos", "直运货运报表", "Direkt sevkiyat raporu", "Relatório de remessas diretas", "Отчет по прямым отправкам")
  ,row("Air Freight Report", "تقرير الشحن الجوي", "एयर फ्रेट रिपोर्ट", "Rapport fret aérien", "Reporte de carga aérea", "空运报表", "Hava kargo raporu", "Relatório de frete aéreo", "Отчет по авиаперевозкам")
  ,row("Sea Freight Report", "تقرير الشحن البحري", "सी फ्रेट रिपोर्ट", "Rapport fret maritime", "Reporte de carga marítima", "海运报表", "Deniz kargo raporu", "Relatório de frete marítimo", "Отчет по морским перевозкам")
  ,row("Road Freight Report", "تقرير الشحن البري", "रोड फ्रेट रिपोर्ट", "Rapport fret routier", "Reporte de carga terrestre", "陆运报表", "Karayolu kargo raporu", "Relatório de frete rodoviário", "Отчет по автоперевозкам")
  ,row("Courier Report", "تقرير البريد السريع", "कूरियर रिपोर्ट", "Rapport courrier", "Reporte de courier", "快递报表", "Kurye raporu", "Relatório de courier", "Отчет по курьерским отправкам")
  ,row("Customs Report", "تقرير الجمارك", "कस्टम्स रिपोर्ट", "Rapport douane", "Reporte de aduana", "海关报表", "Gümrük raporu", "Relatório alfandegário", "Таможенный отчет")
  ,row("Container Report", "تقرير الحاويات", "कंटेनर रिपोर्ट", "Rapport conteneurs", "Reporte de contenedores", "集装箱报表", "Konteyner raporu", "Relatório de contentores", "Отчет по контейнерам")
  ,row("Unbilled Shipment", "الشحنات غير المفوترة", "अनबिल्ड शिपमेंट", "Expéditions non facturées", "Embarques no facturados", "未开票货运", "Faturalanmamış sevkiyat", "Remessas não faturadas", "Неофактурованные отправки")
  ,row("Pending Bill Report", "تقرير الفواتير المعلقة", "लंबित बिल रिपोर्ट", "Rapport factures en attente", "Reporte de facturas pendientes", "待处理账单报表", "Bekleyen fatura raporu", "Relatório de contas pendentes", "Отчет по ожидающим счетам")
  ,row("Pending POD Report", "تقرير إثبات التسليم المعلق", "लंबित POD रिपोर्ट", "Rapport POD en attente", "Reporte POD pendiente", "待处理POD报表", "Bekleyen POD raporu", "Relatório POD pendente", "Отчет по ожидающим POD")
  ,row("Pending Document Report", "تقرير المستندات المعلقة", "लंबित दस्तावेज़ रिपोर्ट", "Rapport documents en attente", "Reporte de documentos pendientes", "待处理文档报表", "Bekleyen belge raporu", "Relatório de documentos pendentes", "Отчет по ожидающим документам")
  ,row("Shipment Ageing", "تقادم الشحنات", "शिपमेंट एजिंग", "Âge des expéditions", "Antigüedad de embarques", "货运账龄", "Sevkiyat yaşlandırma", "Antiguidade das remessas", "Анализ давности отправок")
  ,row("Shipment Profit", "ربح الشحنة", "शिपमेंट लाभ", "Profit expédition", "Rentabilidad de embarque", "货运利润", "Sevkiyat karı", "Lucro da remessa", "Прибыль отправки")
  ,row("Customer Profit", "ربح العميل", "ग्राहक लाभ", "Profit client", "Rentabilidad de cliente", "客户利润", "Müşteri karı", "Lucro do cliente", "Прибыль клиента")
  ,row("Salesman Profit", "ربح مندوب المبيعات", "सेल्समैन लाभ", "Profit commercial", "Rentabilidad de vendedor", "销售员利润", "Satışçı karı", "Lucro do vendedor", "Прибыль продавца")
  ,row("Agent Profit", "ربح الوكيل", "एजेंट लाभ", "Profit agent", "Rentabilidad de agente", "代理利润", "Acente karı", "Lucro do agente", "Прибыль агента")
  ,row("Branch Profit", "ربح الفرع", "शाखा लाभ", "Profit agence", "Rentabilidad de sucursal", "分支利润", "Şube karı", "Lucro da filial", "Прибыль филиала")
  ,row("Route Profit", "ربح المسار", "रूट लाभ", "Profit route", "Rentabilidad de ruta", "路线利润", "Rota karı", "Lucro da rota", "Прибыль маршрута")
  ,row("Destination Profit", "ربح الوجهة", "गंतव्य लाभ", "Profit destination", "Rentabilidad de destino", "目的地利润", "Varış yeri karı", "Lucro do destino", "Прибыль направления")
]);

const resources = new Map();
const add = (moduleName, resourceType, key, en) => {
  const value = clean(en);
  if (!value || shouldSkip(value)) return;
  const id = `${moduleName}|${resourceType}|${key}`;
  if (resources.has(id)) return;
  resources.set(id, { moduleName, resourceType, key, en: value, translations: translate(value) });
};

addCommonResources();
extractNavigation();
extractFrontendText();
writeSql();

function row(en, ar, hi, fr, es, zh, tr, pt, ru) {
  return [en, { "en-US": en, "ar-QA": ar, "hi-IN": hi, "fr-FR": fr, "es-ES": es, "zh-CN": zh, "tr-TR": tr, "pt-PT": pt, "ru-RU": ru }];
}

function translate(value) {
  if (exact.has(value)) return exact.get(value);
  const result = { "en-US": value };
  for (const [, culture] of languages.map((x) => [x[0], x[1]])) {
    if (culture === "en-US") continue;
    result[culture] = translateByWords(value, culture);
  }
  return result;
}

function translateByWords(value, culture) {
  let translated = value;
  const entries = [...exact.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [english, translations] of entries) {
    const replacement = translations[culture];
    if (!replacement || replacement === english) continue;
    translated = translated.replace(new RegExp(`\\b${escapeRegExp(english)}\\b`, "gi"), replacement);
  }
  return translated;
}

function extractNavigation() {
  const file = join(frontendSrc, "layouts", "navigation.ts");
  const text = readFileSync(file, "utf8");
  let currentGroup = null;
  for (const line of text.split(/\r?\n/)) {
    const groupId = line.match(/^\s*id:\s*"([^"]+)"/)?.[1];
    if (groupId) currentGroup = groupId;
    const groupLabel = line.match(/^\s*label:\s*"([^"]+)"/)?.[1];
    if (currentGroup && groupLabel) add("Navigation", "Menu", `Navigation.${currentGroup}.Label`, groupLabel);
    const itemMatch = line.match(/item\("([^"]+)",\s*"([^"]+)",\s*"[^"]+",.*?,\s*(?:"[^"]+"|\[[^\]]+\]),\s*"([^"]*)"\)/);
    if (itemMatch && currentGroup) {
      add("Navigation", "Menu", `Navigation.${currentGroup}.Item.${itemMatch[1]}.Label`, itemMatch[2]);
      add("Navigation", "Menu", `Navigation.${currentGroup}.Item.${itemMatch[1]}.Description`, itemMatch[3]);
    }
  }
}

function extractFrontendText() {
  for (const file of walk(frontendSrc)) {
    if (!/\.(tsx|ts)$/.test(file)) continue;
    if (/\\(api|types)\\/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    const rel = relative(frontendSrc, file).replace(/\\/g, "/");
    const moduleName = moduleFromPath(rel);
    collect(text, /<PageHeader[^>]*\btitle="([^"]+)"/g, (value) => add(moduleName, "Label", `Page.Title.${localizationKey(value)}`, value));
    collect(text, /<PageHeader[^>]*\bdescription="([^"]+)"/g, (value) => add(moduleName, "Label", `Page.Description.${localizationKey(value)}`, value));
    collect(text, /<Label[^>]*>([^<>{}\n]+)<\/Label>/g, (value) => add(moduleName, "Label", `Ui.Label.${localizationKey(value)}`, value));
    collect(text, /\blabel:\s*"([^"]+)"/g, (value) => add(moduleName, "Label", `Ui.Label.${localizationKey(value)}`, value));
    collect(text, /\blabel="([^"]+)"/g, (value) => add(moduleName, "Label", `Ui.Label.${localizationKey(value)}`, value));
    collect(text, /\bplaceholder="([^"]+)"/g, (value) => add(moduleName, "Label", `Ui.Placeholder.${localizationKey(value)}`, value));
    collect(text, /toast\.(?:success|error|info|warning)\("([^"]+)"/g, (value) => add(moduleName, "Message", `Ui.Message.${localizationKey(value)}`, value));
  }
}

function collect(text, regex, callback) {
  for (const match of text.matchAll(regex)) callback(match[1]);
}

function addCommonResources() {
  for (const [english] of exact) {
    add("Common", "Label", `Ui.Label.${localizationKey(english)}`, english);
  }
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function moduleFromPath(rel) {
  const parts = rel.split("/");
  if (parts[0] === "modules") return pascal(parts[1] ?? "Ui");
  if (parts[0] === "layouts") return "Navigation";
  if (parts[0] === "auth") return "Login";
  return "Ui";
}

function localizationKey(value) {
  const normalized = value
    .replace(/&/g, " And ")
    .replace(/\+/g, " Plus ")
    .replace(/%/g, " Percent ")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(pascal)
    .join("");
  return normalized || "Text";
}

function pascal(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function clean(value) {
  return value.replace(/\s+/g, " ").trim();
}

function shouldSkip(value) {
  return value.length < 2
    || value.length > 180
    || /^[/:?#.\-]+$/.test(value)
    || /^(true|false|null|undefined)$/i.test(value)
    || value.includes("${")
    || value.includes("=>")
    || value.startsWith("@/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sql(value) {
  return `N'${String(value).replace(/'/g, "''")}'`;
}

function guidForLanguage(index) {
  return `5f879b4a-b17a-4d38-84d4-d8e6f469${String(index + 1).padStart(4, "0")}`;
}

function writeSql() {
  const lines = [];
  lines.push("/* Auto-generated by scripts/generate-ui-localization-sql.mjs.");
  lines.push("   Seeds menu, page, form label, placeholder, and common message resources.");
  lines.push("   Re-run this script after adding new frontend screens. */");
  lines.push("");
  lines.push("DECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';");
  lines.push("DECLARE @Now datetimeoffset = SYSUTCDATETIME();");
  lines.push("");
  lines.push("MERGE dbo.master_languages AS target");
  lines.push("USING (VALUES");
  lines.push(languages.map((lang, index) => `    ('${guidForLanguage(index)}', ${sql(lang[0])}, ${sql(lang[1])}, ${sql(lang[2])}, ${sql(lang[3])}, ${sql(lang[4])}, ${lang[5]}, ${lang[6]})`).join(",\n"));
  lines.push(") AS source (Id, LanguageCode, CultureCode, DisplayName, NativeName, TextDirection, IsDefault, SortOrder)");
  lines.push("ON target.CultureCode = source.CultureCode");
  lines.push("WHEN MATCHED THEN UPDATE SET target.LanguageCode = source.LanguageCode, target.DisplayName = source.DisplayName, target.NativeName = source.NativeName, target.TextDirection = source.TextDirection, target.IsDefault = source.IsDefault, target.SortOrder = source.SortOrder, target.IsActive = 1, target.IsDeleted = 0, target.ModifiedDate = @Now");
  lines.push("WHEN NOT MATCHED THEN INSERT (Id, LanguageCode, CultureCode, DisplayName, NativeName, TextDirection, DateFormat, NumberFormat, IsActive, IsDefault, SortOrder, IsDeleted, CreatedDate)");
  lines.push("VALUES (CONVERT(uniqueidentifier, source.Id), source.LanguageCode, source.CultureCode, source.DisplayName, source.NativeName, source.TextDirection, N'yyyy-MM-dd', source.CultureCode, 1, source.IsDefault, source.SortOrder, 0, @Now);");
  lines.push("");
  lines.push("DECLARE @Rows TABLE (ModuleName nvarchar(128), ResourceType nvarchar(64), ResourceKey nvarchar(256), CultureCode nvarchar(20), ResourceValue nvarchar(2048));");
  const sorted = [...resources.values()].sort((a, b) => a.key.localeCompare(b.key));
  const rowLines = [];
  for (const resource of sorted) {
    for (const [, culture] of languages.map((x) => [x[0], x[1]])) {
      rowLines.push(`(${sql(resource.moduleName)}, ${sql(resource.resourceType)}, ${sql(resource.key)}, ${sql(culture)}, ${sql(resource.translations[culture] ?? resource.en)})`);
    }
  }
  const chunkSize = 900;
  for (let start = 0; start < rowLines.length; start += chunkSize) {
    const chunk = rowLines.slice(start, start + chunkSize);
    lines.push("INSERT INTO @Rows (ModuleName, ResourceType, ResourceKey, CultureCode, ResourceValue)");
    lines.push("VALUES");
    lines.push(chunk.map((line, index) => `    ${line}${index === chunk.length - 1 ? ";" : ","}`).join("\n"));
    lines.push("");
  }
  lines.push("");
  lines.push("MERGE dbo.i18n_resource_groups AS target");
  lines.push("USING (SELECT DISTINCT ModuleName FROM @Rows) AS source");
  lines.push("ON target.TenantId = @SystemTenant AND target.GroupName = source.ModuleName AND target.IsDeleted = 0");
  lines.push("WHEN MATCHED THEN UPDATE SET target.ModifiedDate = @Now");
  lines.push("WHEN NOT MATCHED THEN INSERT (Id, TenantId, GroupName, Description, IsDeleted, CreatedDate) VALUES (NEWID(), @SystemTenant, source.ModuleName, CONCAT(source.ModuleName, N' localization resources'), 0, @Now);");
  lines.push("");
  lines.push("MERGE dbo.i18n_resource_keys AS target");
  lines.push("USING (SELECT DISTINCT g.Id AS GroupId, r.ResourceType, r.ResourceKey, en.ResourceValue AS DefaultValue FROM @Rows r INNER JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = r.ModuleName AND g.IsDeleted = 0 INNER JOIN @Rows en ON en.ModuleName = r.ModuleName AND en.ResourceType = r.ResourceType AND en.ResourceKey = r.ResourceKey AND en.CultureCode = N'en-US') AS source");
  lines.push("ON target.TenantId = @SystemTenant AND target.ResourceGroupId = source.GroupId AND target.ResourceType = source.ResourceType AND target.[Key] = source.ResourceKey");
  lines.push("WHEN MATCHED THEN UPDATE SET target.DefaultValue = source.DefaultValue, target.IsSystem = 1, target.IsActive = 1, target.IsDeleted = 0, target.ModifiedDate = @Now");
  lines.push("WHEN NOT MATCHED THEN INSERT (Id, TenantId, ResourceGroupId, [Key], ResourceType, DefaultValue, IsSystem, IsActive, IsDeleted, CreatedDate) VALUES (NEWID(), @SystemTenant, source.GroupId, source.ResourceKey, source.ResourceType, source.DefaultValue, 1, 1, 0, @Now);");
  lines.push("");
  lines.push("MERGE dbo.i18n_resource_translations AS target");
  lines.push("USING (SELECT k.Id AS ResourceKeyId, l.Id AS LanguageId, r.ResourceValue FROM @Rows r INNER JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = r.ModuleName AND g.IsDeleted = 0 INNER JOIN dbo.i18n_resource_keys k ON k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.ResourceType = r.ResourceType AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0 INNER JOIN dbo.master_languages l ON l.CultureCode = r.CultureCode AND l.IsDeleted = 0) AS source");
  lines.push("ON target.TenantId = @SystemTenant AND target.ResourceKeyId = source.ResourceKeyId AND target.LanguageId = source.LanguageId");
  lines.push("WHEN MATCHED THEN UPDATE SET target.Value = source.ResourceValue, target.IsApproved = 1, target.IsDeleted = 0, target.ModifiedDate = @Now");
  lines.push("WHEN NOT MATCHED THEN INSERT (Id, TenantId, ResourceKeyId, LanguageId, Value, IsApproved, IsDeleted, CreatedDate) VALUES (NEWID(), @SystemTenant, source.ResourceKeyId, source.LanguageId, source.ResourceValue, 1, 0, @Now);");
  writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${output} with ${resources.size} resources and ${resources.size * languages.length} translations.`);
}
