import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const cultures = ["en-US", "ar-QA", "hi-IN", "fr-FR", "es-ES", "zh-CN", "tr-TR", "pt-PT", "ru-RU"];
const translatedCultures = cultures.slice(1);
const targetRoots = [
  "frontend/src/modules/goodsReceipts",
  "frontend/src/modules/shipments/house",
  "frontend/src/modules/shipments/master",
  "frontend/src/modules/shipments/direct",
  "frontend/src/modules/invoices",
  "frontend/src/modules/vendorBills",
  "frontend/src/modules/receipts",
  "frontend/src/modules/payments",
  "frontend/src/modules/creditDebitNotes",
  "frontend/src/modules/commissions",
  "frontend/src/modules/finance",
  "frontend/src/modules/accounting",
  "frontend/src/modules/reports",
  "frontend/src/modules/users",
  "frontend/src/modules/roles",
  "frontend/src/modules/permissions",
  "frontend/src/modules/employees",
  "frontend/src/modules/notifications",
  "frontend/src/modules/audit",
  "frontend/src/modules/customs",
  "frontend/src/modules/jobs"
];
const moduleNames = ["GoodsReceipt", "HouseShipment", "MasterShipment", "DirectShipment", "CustomerInvoice", "VendorBill", "CustomerReceipt", "VendorPayment", "CreditDebitNote", "AgentCommission", "FinanceWorkbench", "Accounting", "Reports", "Administration", "AuditLogs", "CustomsClearance", "Job"];
const sqlInsertPath = "database/migrations/20260613_insert_missing_operational_localization.sql";
const sqlUpdatePath = "database/migrations/20260613_update_operational_localization.sql";
const catalogPath = "frontend/src/modules/operationsLocalizationCatalog.ts";

const dictionary = {
  "ar-QA": {
    Actions: "الإجراءات", Action: "الإجراء", Active: "نشط", Add: "إضافة", All: "الكل", Amount: "المبلغ", Approve: "اعتماد", Bill: "فاتورة مورد", Bills: "فواتير المورد", Cancel: "إلغاء", Cancelled: "ملغى", Charge: "رسوم", Charges: "الرسوم", Clear: "واضح", Code: "الرمز", Consignee: "المرسل إليه", Contact: "جهة الاتصال", Create: "إنشاء", Customer: "العميل", Date: "التاريخ", DateTime: "التاريخ والوقت", Delete: "حذف", Description: "الوصف", Destination: "الوجهة", Document: "مستند", Documents: "المستندات", Driver: "السائق", Drop: "التسليم", Edit: "تعديل", Export: "تصدير", Finance: "المالية", Filter: "تصفية", Filters: "الفلاتر", From: "من", Goods: "البضائع", Hide: "إخفاء", Invoice: "فاتورة", Invoices: "الفواتير", Job: "وظيفة", Labels: "ملصقات", Location: "الموقع", Marks: "العلامات", Master: "رئيسي", Mode: "الوضع", Name: "الاسم", New: "جديد", No: "رقم", Number: "رقم", Origin: "المنشأ", Package: "طرد", Paid: "مدفوع", Pending: "معلق", Phone: "الهاتف", Pickup: "استلام", Port: "ميناء", Preview: "معاينة", Print: "طباعة", Profit: "الربح", Receipt: "إيصال", Received: "مستلم", Reference: "مرجع", Refresh: "تحديث", Reset: "إعادة تعيين", Review: "مراجعة", Save: "حفظ", Search: "بحث", Select: "اختر", Shipment: "شحنة", Shipper: "الشاحن", Show: "عرض", Status: "الحالة", Submit: "إرسال", Tax: "ضريبة", To: "إلى", Total: "الإجمالي", Type: "النوع", Unpaid: "غير مدفوع", Update: "تحديث", Vehicle: "المركبة", Vendor: "المورد", View: "عرض", Warehouse: "المستودع", Weight: "الوزن", Yes: "نعم", NoValue: "لا", Fully: "بالكامل", Defined: "محدد"
  },
  "hi-IN": {
    Actions: "कार्रवाई", Action: "कार्रवाई", Active: "सक्रिय", Add: "जोड़ें", All: "सभी", Amount: "राशि", Approve: "स्वीकृत करें", Bill: "बिल", Bills: "बिल", Cancel: "रद्द करें", Cancelled: "रद्द", Charge: "शुल्क", Charges: "शुल्क", Clear: "साफ", Code: "कोड", Consignee: "कंसाइनी", Contact: "संपर्क", Create: "बनाएं", Customer: "ग्राहक", Date: "दिनांक", DateTime: "दिनांक और समय", Delete: "हटाएं", Description: "विवरण", Destination: "गंतव्य", Document: "दस्तावेज़", Documents: "दस्तावेज़", Driver: "ड्राइवर", Drop: "ड्रॉप", Edit: "संपादित करें", Export: "निर्यात", Finance: "वित्त", Filter: "फ़िल्टर", Filters: "फ़िल्टर", From: "से", Goods: "माल", Hide: "छिपाएं", Invoice: "इनवॉइस", Invoices: "इनवॉइस", Job: "जॉब", Labels: "लेबल", Location: "स्थान", Marks: "मार्क्स", Master: "मास्टर", Mode: "मोड", Name: "नाम", New: "नया", No: "नंबर", Number: "नंबर", Origin: "मूल", Package: "पैकेज", Paid: "भुगतान", Pending: "लंबित", Phone: "फोन", Pickup: "पिकअप", Port: "पोर्ट", Preview: "पूर्वावलोकन", Print: "प्रिंट", Profit: "लाभ", Receipt: "रसीद", Received: "प्राप्त", Reference: "संदर्भ", Refresh: "रीफ़्रेश", Reset: "रीसेट", Review: "समीक्षा", Save: "सहेजें", Search: "खोजें", Select: "चुनें", Shipment: "शिपमेंट", Shipper: "शिपर", Show: "दिखाएं", Status: "स्थिति", Submit: "सबमिट", Tax: "कर", To: "तक", Total: "कुल", Type: "प्रकार", Unpaid: "अवैतनिक", Update: "अपडेट", Vehicle: "वाहन", Vendor: "विक्रेता", View: "देखें", Warehouse: "वेयरहाउस", Weight: "वजन", Yes: "हाँ", NoValue: "नहीं", Fully: "पूरी तरह", Defined: "निर्धारित"
  },
  "fr-FR": {
    Actions: "Actions", Action: "Action", Active: "Actif", Add: "Ajouter", All: "Tous", Amount: "Montant", Approve: "Approuver", Bill: "Facture fournisseur", Bills: "Factures fournisseur", Cancel: "Annuler", Cancelled: "Annulé", Charge: "Frais", Charges: "Frais", Clear: "OK", Code: "Code", Consignee: "Destinataire", Contact: "Contact", Create: "Créer", Customer: "Client", Date: "Date", DateTime: "Date et heure", Delete: "Supprimer", Description: "Description", Destination: "Destination", Document: "Document", Documents: "Documents", Driver: "Chauffeur", Drop: "Livraison", Edit: "Modifier", Export: "Exporter", Finance: "Finance", Filter: "Filtre", Filters: "Filtres", From: "De", Goods: "Marchandises", Hide: "Masquer", Invoice: "Facture client", Invoices: "Factures client", Job: "Dossier", Labels: "Étiquettes", Location: "Emplacement", Marks: "Marques", Master: "Master", Mode: "Mode", Name: "Nom", New: "Nouveau", No: "N°", Number: "Numéro", Origin: "Origine", Package: "Colis", Paid: "Payé", Pending: "En attente", Phone: "Téléphone", Pickup: "Enlèvement", Port: "Port", Preview: "Aperçu", Print: "Imprimer", Profit: "Profit", Receipt: "Reçu", Received: "Reçu", Reference: "Référence", Refresh: "Actualiser", Reset: "Réinitialiser", Review: "À vérifier", Save: "Enregistrer", Search: "Rechercher", Select: "Sélectionner", Shipment: "Expédition", Shipper: "Expéditeur", Show: "Afficher", Status: "Statut", Submit: "Soumettre", Tax: "Taxe", To: "À", Total: "Total", Type: "Type", Unpaid: "Impayé", Update: "Mettre à jour", Vehicle: "Véhicule", Vendor: "Fournisseur", View: "Voir", Warehouse: "Entrepôt", Weight: "Poids", Yes: "Oui", NoValue: "Non", Fully: "Entièrement", Defined: "Défini"
  },
  "es-ES": {
    Actions: "Acciones", Action: "Acción", Active: "Activo", Add: "Añadir", All: "Todos", Amount: "Importe", Approve: "Aprobar", Bill: "Factura proveedor", Bills: "Facturas proveedor", Cancel: "Cancelar", Cancelled: "Cancelado", Charge: "Cargo", Charges: "Cargos", Clear: "Correcto", Code: "Código", Consignee: "Consignatario", Contact: "Contacto", Create: "Crear", Customer: "Cliente", Date: "Fecha", DateTime: "Fecha y hora", Delete: "Eliminar", Description: "Descripción", Destination: "Destino", Document: "Documento", Documents: "Documentos", Driver: "Conductor", Drop: "Entrega", Edit: "Editar", Export: "Exportar", Finance: "Finanzas", Filter: "Filtro", Filters: "Filtros", From: "Desde", Goods: "Mercancías", Hide: "Ocultar", Invoice: "Factura", Invoices: "Facturas", Job: "Trabajo", Labels: "Etiquetas", Location: "Ubicación", Marks: "Marcas", Master: "Master", Mode: "Modo", Name: "Nombre", New: "Nuevo", No: "N.º", Number: "Número", Origin: "Origen", Package: "Paquete", Paid: "Pagado", Pending: "Pendiente", Phone: "Teléfono", Pickup: "Recogida", Port: "Puerto", Preview: "Vista previa", Print: "Imprimir", Profit: "Beneficio", Receipt: "Recibo", Received: "Recibido", Reference: "Referencia", Refresh: "Actualizar", Reset: "Restablecer", Review: "Revisar", Save: "Guardar", Search: "Buscar", Select: "Seleccionar", Shipment: "Envío", Shipper: "Remitente", Show: "Mostrar", Status: "Estado", Submit: "Enviar", Tax: "Impuesto", To: "Hasta", Total: "Total", Type: "Tipo", Unpaid: "No pagado", Update: "Actualizar", Vehicle: "Vehículo", Vendor: "Proveedor", View: "Ver", Warehouse: "Almacén", Weight: "Peso", Yes: "Sí", NoValue: "No", Fully: "Totalmente", Defined: "Definido"
  },
  "zh-CN": {
    Actions: "操作", Action: "操作", Active: "启用", Add: "添加", All: "全部", Amount: "金额", Approve: "批准", Bill: "账单", Bills: "账单", Cancel: "取消", Cancelled: "已取消", Charge: "费用", Charges: "费用", Clear: "正常", Code: "代码", Consignee: "收货人", Contact: "联系人", Create: "创建", Customer: "客户", Date: "日期", DateTime: "日期和时间", Delete: "删除", Description: "描述", Destination: "目的地", Document: "文件", Documents: "文件", Driver: "司机", Drop: "送达", Edit: "编辑", Export: "导出", Finance: "财务", Filter: "筛选", Filters: "筛选", From: "从", Goods: "货物", Hide: "隐藏", Invoice: "发票", Invoices: "发票", Job: "作业", Labels: "标签", Location: "位置", Marks: "唛头", Master: "主单", Mode: "方式", Name: "名称", New: "新建", No: "编号", Number: "编号", Origin: "起运地", Package: "包装", Paid: "已付款", Pending: "待处理", Phone: "电话", Pickup: "提货", Port: "港口", Preview: "预览", Print: "打印", Profit: "利润", Receipt: "收据", Received: "已收", Reference: "参考", Refresh: "刷新", Reset: "重置", Review: "复核", Save: "保存", Search: "搜索", Select: "选择", Shipment: "货运", Shipper: "发货人", Show: "显示", Status: "状态", Submit: "提交", Tax: "税", To: "至", Total: "总计", Type: "类型", Unpaid: "未付", Update: "更新", Vehicle: "车辆", Vendor: "供应商", View: "查看", Warehouse: "仓库", Weight: "重量", Yes: "是", NoValue: "否", Fully: "完全", Defined: "已定义"
  },
  "tr-TR": {
    Actions: "İşlemler", Action: "İşlem", Active: "Aktif", Add: "Ekle", All: "Tümü", Amount: "Tutar", Approve: "Onayla", Bill: "Fatura", Bills: "Faturalar", Cancel: "İptal", Cancelled: "İptal edildi", Charge: "Masraf", Charges: "Masraflar", Clear: "Temiz", Code: "Kod", Consignee: "Alıcı", Contact: "İletişim", Create: "Oluştur", Customer: "Müşteri", Date: "Tarih", DateTime: "Tarih ve saat", Delete: "Sil", Description: "Açıklama", Destination: "Varış", Document: "Belge", Documents: "Belgeler", Driver: "Sürücü", Drop: "Teslim", Edit: "Düzenle", Export: "Dışa aktar", Finance: "Finans", Filter: "Filtre", Filters: "Filtreler", From: "Başlangıç", Goods: "Mallar", Hide: "Gizle", Invoice: "Fatura", Invoices: "Faturalar", Job: "İş", Labels: "Etiketler", Location: "Konum", Marks: "İşaretler", Master: "Master", Mode: "Mod", Name: "Ad", New: "Yeni", No: "No", Number: "Numara", Origin: "Çıkış", Package: "Paket", Paid: "Ödendi", Pending: "Bekliyor", Phone: "Telefon", Pickup: "Alım", Port: "Liman", Preview: "Önizleme", Print: "Yazdır", Profit: "Kâr", Receipt: "Makbuz", Received: "Tahsil edildi", Reference: "Referans", Refresh: "Yenile", Reset: "Sıfırla", Review: "İncele", Save: "Kaydet", Search: "Ara", Select: "Seç", Shipment: "Sevkiyat", Shipper: "Gönderici", Show: "Göster", Status: "Durum", Submit: "Gönder", Tax: "Vergi", To: "Bitiş", Total: "Toplam", Type: "Tür", Unpaid: "Ödenmemiş", Update: "Güncelle", Vehicle: "Araç", Vendor: "Tedarikçi", View: "Görüntüle", Warehouse: "Depo", Weight: "Ağırlık", Yes: "Evet", NoValue: "Hayır", Fully: "Tamamen", Defined: "Tanımlı"
  },
  "pt-PT": {
    Actions: "Ações", Action: "Ação", Active: "Ativo", Add: "Adicionar", All: "Todos", Amount: "Valor", Approve: "Aprovar", Bill: "Fatura", Bills: "Faturas", Cancel: "Cancelar", Cancelled: "Cancelado", Charge: "Encargo", Charges: "Encargos", Clear: "Limpo", Code: "Código", Consignee: "Consignatário", Contact: "Contacto", Create: "Criar", Customer: "Cliente", Date: "Data", DateTime: "Data e hora", Delete: "Eliminar", Description: "Descrição", Destination: "Destino", Document: "Documento", Documents: "Documentos", Driver: "Motorista", Drop: "Entrega", Edit: "Editar", Export: "Exportar", Finance: "Finanças", Filter: "Filtro", Filters: "Filtros", From: "De", Goods: "Mercadorias", Hide: "Ocultar", Invoice: "Fatura", Invoices: "Faturas", Job: "Processo", Labels: "Etiquetas", Location: "Localização", Marks: "Marcas", Master: "Master", Mode: "Modo", Name: "Nome", New: "Novo", No: "N.º", Number: "Número", Origin: "Origem", Package: "Pacote", Paid: "Pago", Pending: "Pendente", Phone: "Telefone", Pickup: "Recolha", Port: "Porto", Preview: "Pré-visualizar", Print: "Imprimir", Profit: "Lucro", Receipt: "Recibo", Received: "Recebido", Reference: "Referência", Refresh: "Atualizar", Reset: "Repor", Review: "Rever", Save: "Guardar", Search: "Pesquisar", Select: "Selecionar", Shipment: "Envio", Shipper: "Expedidor", Show: "Mostrar", Status: "Estado", Submit: "Submeter", Tax: "Imposto", To: "Até", Total: "Total", Type: "Tipo", Unpaid: "Por pagar", Update: "Atualizar", Vehicle: "Veículo", Vendor: "Fornecedor", View: "Ver", Warehouse: "Armazém", Weight: "Peso", Yes: "Sim", NoValue: "Não", Fully: "Totalmente", Defined: "Definido"
  },
  "ru-RU": {
    Actions: "Действия", Action: "Действие", Active: "Активно", Add: "Добавить", All: "Все", Amount: "Сумма", Approve: "Утвердить", Bill: "Счет", Bills: "Счета", Cancel: "Отмена", Cancelled: "Отменено", Charge: "Начисление", Charges: "Начисления", Clear: "Чисто", Code: "Код", Consignee: "Грузополучатель", Contact: "Контакт", Create: "Создать", Customer: "Клиент", Date: "Дата", DateTime: "Дата и время", Delete: "Удалить", Description: "Описание", Destination: "Назначение", Document: "Документ", Documents: "Документы", Driver: "Водитель", Drop: "Доставка", Edit: "Изменить", Export: "Экспорт", Finance: "Финансы", Filter: "Фильтр", Filters: "Фильтры", From: "От", Goods: "Груз", Hide: "Скрыть", Invoice: "Накладная", Invoices: "Накладные", Job: "Задание", Labels: "Этикетки", Location: "Местоположение", Marks: "Маркировка", Master: "Мастер", Mode: "Режим", Name: "Имя", New: "Новый", No: "№", Number: "Номер", Origin: "Отправление", Package: "Упаковка", Paid: "Оплачено", Pending: "Ожидает", Phone: "Телефон", Pickup: "Забор", Port: "Порт", Preview: "Просмотр", Print: "Печать", Profit: "Прибыль", Receipt: "Квитанция", Received: "Получено", Reference: "Ссылка", Refresh: "Обновить", Reset: "Сброс", Review: "Проверить", Save: "Сохранить", Search: "Поиск", Select: "Выбрать", Shipment: "Отправка", Shipper: "Грузоотправитель", Show: "Показать", Status: "Статус", Submit: "Отправить", Tax: "Налог", To: "До", Total: "Итого", Type: "Тип", Unpaid: "Не оплачено", Update: "Обновить", Vehicle: "Автомобиль", Vendor: "Поставщик", View: "Просмотр", Warehouse: "Склад", Weight: "Вес", Yes: "Да", NoValue: "Нет", Fully: "Полностью", Defined: "Определено"
  }
};

const direct = {
  "GRN No": ["رقم GRN", "GRN नंबर", "N° GRN", "N.º GRN", "GRN编号", "GRN No", "N.º GRN", "№ GRN"],
  "New GRN": ["GRN جديد", "नया GRN", "Nouveau GRN", "Nuevo GRN", "新建GRN", "Yeni GRN", "Novo GRN", "Новый GRN"],
  "Print GRN": ["طباعة GRN", "GRN प्रिंट करें", "Imprimer GRN", "Imprimir GRN", "打印GRN", "GRN yazdır", "Imprimir GRN", "Печать GRN"],
  HAWB: ["HAWB", "HAWB", "HAWB", "HAWB", "HAWB", "HAWB", "HAWB", "HAWB"],
  MAWB: ["MAWB", "MAWB", "MAWB", "MAWB", "MAWB", "MAWB", "MAWB", "MAWB"],
  "House Shipments": ["الشحنات الفرعية", "हाउस शिपमेंट", "Expéditions house", "Envíos house", "分单货运", "House sevkiyatlar", "Envios house", "House-отправки"],
  "Direct Shipments": ["الشحنات المباشرة", "डायरेक्ट शिपमेंट", "Expéditions directes", "Envíos directos", "直运货运", "Doğrudan sevkiyatlar", "Envios diretos", "Прямые отправки"],
  "Goods Receipts": ["إيصالات البضائع", "गुड्स रिसीट", "Réceptions de marchandises", "Recepciones de mercancías", "收货单", "Mal kabul", "Receções de mercadorias", "Приемки грузов"],
  "Customs Clearance": ["التخليص الجمركي", "कस्टम्स क्लीयरेंस", "Dédouanement", "Despacho aduanero", "清关", "Gümrükleme", "Desalfandegamento", "Таможенное оформление"],
  Jobs: ["الوظائف", "जॉब्स", "Dossiers", "Trabajos", "作业", "İşler", "Processos", "Задания"],
  "Finance Status": ["الحالة المالية", "वित्त स्थिति", "Statut financier", "Estado financiero", "财务状态", "Finans durumu", "Estado financeiro", "Финансовый статус"],
  "Invoice Defined": ["تم تحديد الفاتورة", "इनवॉइस निर्धारित", "Facture client définie", "Factura definida", "发票已定义", "Fatura tanımlı", "Fatura definida", "Накладная определена"],
  "Bill Defined": ["تم تحديد فاتورة المورد", "बिल निर्धारित", "Facture fournisseur définie", "Factura de proveedor definida", "账单已定义", "Fatura tanımlı", "Fatura definida", "Счет определен"],
  "Invoice Fully Received": ["تم استلام الفاتورة بالكامل", "इनवॉइस पूरी तरह प्राप्त", "Facture client entièrement reçue", "Factura totalmente recibida", "发票已全额收款", "Fatura tamamen tahsil edildi", "Fatura totalmente recebida", "Накладная полностью получена"],
  "Bill Fully Paid": ["الفاتورة مدفوعة بالكامل", "बिल पूरी तरह भुगतान", "Facture fournisseur entièrement payée", "Factura de proveedor totalmente pagada", "账单已全额付款", "Fatura tamamen ödendi", "Fatura totalmente paga", "Счет полностью оплачен"]
};

Object.assign(direct, {
  "Goods Receipt Note": ["إشعار استلام البضائع", "माल प्राप्ति नोट", "Bon de réception marchandises", "Nota de recepción de mercancías", "货物收货单", "Mal kabul fişi", "Nota de receção de mercadorias", "Акт приемки груза"],
  "Goods Receipt Note No": ["رقم إشعار استلام البضائع", "माल प्राप्ति नोट नंबर", "N° bon de réception marchandises", "N.º nota de recepción de mercancías", "货物收货单号", "Mal kabul fişi no", "N.º nota de receção de mercadorias", "№ акта приемки груза"],
  "Goods Receipt Note No:": ["رقم إشعار استلام البضائع:", "माल प्राप्ति नोट नंबर:", "N° bon de réception marchandises :", "N.º nota de recepción de mercancías:", "货物收货单号：", "Mal kabul fişi no:", "N.º nota de receção de mercadorias:", "№ акта приемки груза:"],
  "Goods Receipt Note Number": ["رقم إشعار استلام البضائع", "माल प्राप्ति नोट संख्या", "Numéro du bon de réception marchandises", "Número de nota de recepción de mercancías", "货物收货单编号", "Mal kabul fişi numarası", "Número da nota de receção de mercadorias", "Номер акта приемки груза"],
  "Goods Receipt Note No...": ["رقم إشعار استلام البضائع...", "माल प्राप्ति नोट नंबर...", "N° bon de réception...", "N.º nota de recepción...", "货物收货单号...", "Mal kabul fişi no...", "N.º nota de receção...", "№ акта приемки..."],
  "New Goods Receipt Note": ["إشعار استلام بضائع جديد", "नया माल प्राप्ति नोट", "Nouveau bon de réception marchandises", "Nueva nota de recepción de mercancías", "新建货物收货单", "Yeni mal kabul fişi", "Nova nota de receção de mercadorias", "Новый акт приемки груза"],
  "Edit Goods Receipt Note": ["تعديل إشعار استلام البضائع", "माल प्राप्ति नोट संपादित करें", "Modifier le bon de réception marchandises", "Editar nota de recepción de mercancías", "编辑货物收货单", "Mal kabul fişini düzenle", "Editar nota de receção de mercadorias", "Изменить акт приемки груза"],
  "View Goods Receipt Note": ["عرض إشعار استلام البضائع", "माल प्राप्ति नोट देखें", "Voir le bon de réception marchandises", "Ver nota de recepción de mercancías", "查看货物收货单", "Mal kabul fişini görüntüle", "Ver nota de receção de mercadorias", "Просмотр акта приемки груза"],
  "Print Goods Receipt Note": ["طباعة إشعار استلام البضائع", "माल प्राप्ति नोट प्रिंट करें", "Imprimer le bon de réception marchandises", "Imprimir nota de recepción de mercancías", "打印货物收货单", "Mal kabul fişini yazdır", "Imprimir nota de receção de mercadorias", "Печать акта приемки груза"],
  "Receive goods, print Goods Receipt Notes, labels, and monitor available goods quantity.": ["استلم البضائع واطبع إشعارات الاستلام والملصقات وتابع الكميات المتاحة.", "माल प्राप्त करें, माल प्राप्ति नोट और लेबल प्रिंट करें, और उपलब्ध मात्रा देखें.", "Réceptionnez les marchandises, imprimez les bons de réception et les étiquettes, puis suivez les quantités disponibles.", "Reciba mercancías, imprima notas de recepción y etiquetas, y controle la cantidad disponible.", "接收货物，打印收货单和标签，并监控可用数量。", "Malları teslim alın, mal kabul fişlerini ve etiketleri yazdırın, kullanılabilir miktarı izleyin.", "Receba mercadorias, imprima notas de receção e etiquetas, e acompanhe a quantidade disponível.", "Принимайте груз, печатайте акты приемки и этикетки, контролируйте доступное количество."],
  "Search invoice number, Goods Receipt Note number, or status": ["ابحث برقم الفاتورة أو رقم إشعار استلام البضائع أو الحالة", "इनवॉइस नंबर, माल प्राप्ति नोट नंबर या स्थिति से खोजें", "Rechercher par numéro de facture, numéro de bon de réception ou statut", "Buscar por número de factura, número de nota de recepción o estado", "按发票号、货物收货单号或状态搜索", "Fatura no, mal kabul fişi no veya duruma göre ara", "Pesquisar por número da fatura, nota de receção ou estado", "Поиск по номеру счета, акту приемки или статусу"],
  "Search vendor bill number, Goods Receipt Note number, or status": ["ابحث برقم فاتورة المورد أو رقم إشعار استلام البضائع أو الحالة", "वेंडर बिल नंबर, माल प्राप्ति नोट नंबर या स्थिति से खोजें", "Rechercher par numéro de facture fournisseur, bon de réception ou statut", "Buscar por factura de proveedor, nota de recepción o estado", "按供应商账单号、货物收货单号或状态搜索", "Tedarikçi faturası no, mal kabul fişi no veya duruma göre ara", "Pesquisar por fatura de fornecedor, nota de receção ou estado", "Поиск по счету поставщика, акту приемки или статусу"],
  "Search by name, code, or phone": ["ابحث بالاسم أو الرمز أو الهاتف", "नाम, कोड या फोन से खोजें", "Rechercher par nom, code ou téléphone", "Buscar por nombre, código o teléfono", "按名称、代码或电话搜索", "Ad, kod veya telefonla ara", "Pesquisar por nome, código ou telefone", "Поиск по имени, коду или телефону"],
  "Salesman (optional)": ["مندوب المبيعات (اختياري)", "सेल्समैन (वैकल्पिक)", "Commercial (facultatif)", "Vendedor (opcional)", "销售员（可选）", "Satış temsilcisi (isteğe bağlı)", "Vendedor (opcional)", "Менеджер продаж (необязательно)"],
  "Link": ["ربط", "लिंक", "Lien", "Enlace", "关联", "Bağlantı", "Ligação", "Связь"],
  "Direct receipt": ["استلام مباشر", "प्रत्यक्ष प्राप्ति", "Réception directe", "Recepción directa", "直接收货", "Doğrudan kabul", "Receção direta", "Прямая приемка"],
  "Optional": ["اختياري", "वैकल्पिक", "Facultatif", "Opcional", "可选", "İsteğe bağlı", "Opcional", "Необязательно"],
  "Remarks": ["ملاحظات", "टिप्पणियाँ", "Remarques", "Observaciones", "备注", "Açıklamalar", "Observações", "Примечания"],
  "Item": ["بند", "आइटम", "Article", "Ítem", "项目", "Kalem", "Item", "Позиция"],
  "No. of Packages": ["عدد الطرود", "पैकेजों की संख्या", "Nombre de colis", "N.º de paquetes", "包装数量", "Paket sayısı", "N.º de embalagens", "Количество упаковок"],
  "Gross Weight": ["الوزن الإجمالي", "सकल वजन", "Poids brut", "Peso bruto", "毛重", "Brüt ağırlık", "Peso bruto", "Вес брутто"],
  "Length": ["الطول", "लंबाई", "Longueur", "Longitud", "长度", "Uzunluk", "Comprimento", "Длина"],
  "Width": ["العرض", "चौड़ाई", "Largeur", "Anchura", "宽度", "Genişlik", "Largura", "Ширина"],
  "Height": ["الارتفاع", "ऊँचाई", "Hauteur", "Altura", "高度", "Yükseklik", "Altura", "Высота"],
  "Volume": ["الحجم", "आयतन", "Volume", "Volumen", "体积", "Hacim", "Volume", "Объем"],
  "Chargeable Weight": ["الوزن المحتسب", "प्रभार्य वजन", "Poids taxable", "Peso facturable", "计费重量", "Ücretlendirilebilir ağırlık", "Peso taxável", "Расчётный вес"],
  "Chargeable": ["محتسب", "प्रभार्य", "Taxable", "Facturable", "计费", "Ücretlendirilebilir", "Taxável", "Расчетный"],
  "Operation": ["العملية", "ऑपरेशन", "Opération", "Operación", "操作", "Operasyon", "Operação", "Операция"],
  "Operation / Action": ["العملية / الإجراء", "ऑपरेशन / कार्रवाई", "Opération / Action", "Operación / Acción", "操作 / 动作", "Operasyon / İşlem", "Operação / Ação", "Операция / Действие"],
  "Rack/Bin reference": ["مرجع الرف/الخانة", "रैक/बिन संदर्भ", "Référence rack/emplacement", "Referencia rack/ubicación", "货架/库位参考", "Raf/bin referansı", "Referência rack/bin", "Ссылка на стеллаж/ячейку"],
  "Country of Origin": ["بلد المنشأ", "मूल देश", "Pays d’origine", "País de origen", "原产国", "Menşe ülke", "País de origem", "Страна происхождения"],
  "Select country": ["اختر البلد", "देश चुनें", "Sélectionner le pays", "Seleccionar país", "选择国家", "Ülke seçin", "Selecionar país", "Выберите страну"],
  "No salesman": ["بدون مندوب مبيعات", "कोई सेल्समैन नहीं", "Aucun commercial", "Sin vendedor", "无销售员", "Satış temsilcisi yok", "Sem vendedor", "Без менеджера продаж"],
  "HS Code": ["رمز النظام المنسق", "एचएस कोड", "Code SH", "Código HS", "HS 编码", "GTİP / HS kodu", "Código HS", "Код ТН ВЭД / HS"],
  "Add Item": ["إضافة بند", "आइटम जोड़ें", "Ajouter un article", "Añadir ítem", "添加项目", "Kalem ekle", "Adicionar item", "Добавить позицию"],
  "Items": ["البنود", "आइटम", "Articles", "Ítems", "项目", "Kalemler", "Itens", "Позиции"],
  "Goods Items": ["بنود البضائع", "माल आइटम", "Articles marchandises", "Ítems de mercancías", "货物项目", "Mal kalemleri", "Itens de mercadorias", "Позиции груза"],
  "Items Count:": ["عدد البنود:", "आइटम संख्या:", "Nombre d’articles :", "Cantidad de ítems:", "项目数量：", "Kalem sayısı:", "Quantidade de itens:", "Количество позиций:"],
  "Item created": ["تم إنشاء البند", "आइटम बनाया गया", "Article créé", "Ítem creado", "项目已创建", "Kalem oluşturuldu", "Item criado", "Позиция создана"],
  "Item updated": ["تم تحديث البند", "आइटम अपडेट हुआ", "Article mis à jour", "Ítem actualizado", "项目已更新", "Kalem güncellendi", "Item atualizado", "Позиция обновлена"],
  "Item deleted": ["تم حذف البند", "आइटम हटाया गया", "Article supprimé", "Ítem eliminado", "项目已删除", "Kalem silindi", "Item eliminado", "Позиция удалена"],
  "Item removed": ["تمت إزالة البند", "आइटम हटाया गया", "Article retiré", "Ítem retirado", "项目已移除", "Kalem kaldırıldı", "Item removido", "Позиция удалена"],
  "Items staged": ["تم تجهيز البنود", "आइटम तैयार किए गए", "Articles préparés", "Ítems preparados", "项目已暂存", "Kalemler hazırlandı", "Itens preparados", "Позиции подготовлены"]
});

Object.assign(direct, {
  "House Shipment": ["شحنة فرعية", "हाउस शिपमेंट", "Expédition house", "Envío house", "分单货运", "House sevkiyat", "Envio house", "House-отправка"],
  "House Shipments": ["الشحنات الفرعية", "हाउस शिपमेंट", "Expéditions house", "Envíos house", "分单货运", "House sevkiyatları", "Envios house", "House-отправки"],
  "New House Shipment": ["شحنة فرعية جديدة", "नया हाउस शिपमेंट", "Nouvelle expédition house", "Nuevo envío house", "新建分单货运", "Yeni house sevkiyat", "Novo envio house", "Новая house-отправка"],
  "Edit Shipment": ["تعديل الشحنة", "शिपमेंट संपादित करें", "Modifier l'expédition", "Editar envío", "编辑货运", "Sevkiyatı düzenle", "Editar envio", "Изменить отправку"],
  "View Shipment": ["عرض الشحنة", "शिपमेंट देखें", "Voir l'expédition", "Ver envío", "查看货运", "Sevkiyatı görüntüle", "Ver envio", "Просмотр отправки"],
  "House Shipment No": ["رقم الشحنة الفرعية", "हाउस शिपमेंट नंबर", "N° expédition house", "N.º envío house", "分单货运号", "House sevkiyat no", "N.º envio house", "№ house-отправки"],
  "House waybill no": ["رقم بوليصة الشحن الفرعية", "हाउस वेबिल नंबर", "N° lettre de transport house", "N.º guía house", "分运单号", "House konşimento no", "N.º guia house", "№ house-накладной"],
  "HAWB": ["HAWB", "HAWB", "HAWB", "HAWB", "HAWB", "HAWB", "HAWB", "HAWB"],
  "HAWB:": ["HAWB:", "HAWB:", "HAWB :", "HAWB:", "HAWB：", "HAWB:", "HAWB:", "HAWB:"],
  "Shipper": ["الشاحن", "शिपर", "Expéditeur", "Expedidor", "发货人", "Gönderici", "Expedidor", "Грузоотправитель"],
  "Shipper Name": ["اسم الشاحن", "शिपर का नाम", "Nom de l'expéditeur", "Nombre del expedidor", "发货人名称", "Gönderici adı", "Nome do expedidor", "Имя грузоотправителя"],
  "Shipper Contact No": ["رقم اتصال الشاحن", "शिपर संपर्क नंबर", "N° contact expéditeur", "Teléfono del expedidor", "发货人联系电话", "Gönderici iletişim no", "N.º contacto expedidor", "Контактный № отправителя"],
  "Shipper Address": ["عنوان الشاحن", "शिपर पता", "Adresse de l'expéditeur", "Dirección del expedidor", "发货人地址", "Gönderici adresi", "Morada do expedidor", "Адрес грузоотправителя"],
  "Shipper Information": ["بيانات الشاحن", "शिपर जानकारी", "Informations expéditeur", "Información del expedidor", "发货人信息", "Gönderici bilgileri", "Informação do expedidor", "Сведения об отправителе"],
  "Consignee": ["المرسل إليه", "कंसाइनी", "Destinataire", "Consignatario", "收货人", "Alıcı", "Consignatário", "Грузополучатель"],
  "Consignee Name": ["اسم المرسل إليه", "कंसाइनी का नाम", "Nom du destinataire", "Nombre del consignatario", "收货人名称", "Alıcı adı", "Nome do consignatário", "Имя грузополучателя"],
  "Consignee Contact No": ["رقم اتصال المرسل إليه", "कंसाइनी संपर्क नंबर", "N° contact destinataire", "Teléfono del consignatario", "收货人联系电话", "Alıcı iletişim no", "N.º contacto consignatário", "Контактный № получателя"],
  "Consignee Address": ["عنوان المرسل إليه", "कंसाइनी पता", "Adresse du destinataire", "Dirección del consignatario", "收货人地址", "Alıcı adresi", "Morada do consignatário", "Адрес грузополучателя"],
  "Consignee Information": ["بيانات المرسل إليه", "कंसाइनी जानकारी", "Informations destinataire", "Información del consignatario", "收货人信息", "Alıcı bilgileri", "Informação do consignatário", "Сведения о получателе"],
  "Origin Port": ["ميناء المنشأ", "मूल पोर्ट", "Port d'origine", "Puerto de origen", "起运港", "Çıkış limanı", "Porto de origem", "Порт отправления"],
  "Destination Port": ["ميناء الوجهة", "गंतव्य पोर्ट", "Port de destination", "Puerto de destino", "目的港", "Varış limanı", "Porto de destino", "Порт назначения"],
  "Drop Location": ["موقع التسليم", "ड्रॉप स्थान", "Lieu de livraison", "Lugar de entrega", "送达地点", "Teslim konumu", "Local de entrega", "Место доставки"],
  "Transport Mode": ["وسيلة النقل", "परिवहन मोड", "Mode de transport", "Modo de transporte", "运输方式", "Taşıma modu", "Modo de transporte", "Вид транспорта"],
  "Quotation Reference": ["مرجع عرض السعر", "कोटेशन संदर्भ", "Référence devis", "Referencia de cotización", "报价参考", "Teklif referansı", "Referência da cotação", "Ссылка на коммерческое предложение"],
  "Search approved quotation number": ["ابحث برقم عرض السعر المعتمد", "स्वीकृत कोटेशन नंबर खोजें", "Rechercher un devis approuvé", "Buscar número de cotización aprobada", "搜索已批准报价号", "Onaylı teklif numarası ara", "Pesquisar cotação aprovada", "Поиск утвержденного предложения"],
  "House Shipment Items": ["بنود الشحنة الفرعية", "हाउस शिपमेंट आइटम", "Articles de l'expédition house", "Ítems del envío house", "分单货运项目", "House sevkiyat kalemleri", "Itens do envio house", "Позиции house-отправки"],
  "Load From Goods Receipt Note": ["تحميل من إشعار استلام البضائع", "माल प्राप्ति नोट से लोड करें", "Charger depuis le bon de réception", "Cargar desde nota de recepción", "从收货单载入", "Mal kabul fişinden yükle", "Carregar da nota de receção", "Загрузить из акта приемки"],
  "Hide Goods Receipt Note Loader": ["إخفاء محمل إشعار الاستلام", "माल प्राप्ति नोट लोडर छिपाएँ", "Masquer le chargeur de réception", "Ocultar cargador de recepción", "隐藏收货单加载器", "Mal kabul yükleyicisini gizle", "Ocultar carregador da receção", "Скрыть загрузчик приемки"],
  "Load Items From Goods Receipt Note": ["تحميل البنود من إشعار استلام البضائع", "माल प्राप्ति नोट से आइटम लोड करें", "Charger les articles depuis le bon de réception", "Cargar ítems desde nota de recepción", "从收货单载入项目", "Mal kabul fişinden kalem yükle", "Carregar itens da nota de receção", "Загрузить позиции из акта приемки"],
  "Loaded From Goods Receipt Note": ["محمل من إشعار استلام البضائع", "माल प्राप्ति नोट से लोड किया गया", "Chargé depuis le bon de réception", "Cargado desde nota de recepción", "已从收货单载入", "Mal kabul fişinden yüklendi", "Carregado da nota de receção", "Загружено из акта приемки"],
  "Goods Receipt Note Date": ["تاريخ إشعار استلام البضائع", "माल प्राप्ति नोट दिनांक", "Date du bon de réception", "Fecha de nota de recepción", "收货单日期", "Mal kabul fişi tarihi", "Data da nota de receção", "Дата акта приемки"],
  "Filter: Goods Receipt Note Number": ["تصفية: رقم إشعار استلام البضائع", "फ़िल्टर: माल प्राप्ति नोट नंबर", "Filtre : N° bon de réception", "Filtro: N.º nota de recepción", "筛选：收货单号", "Filtre: mal kabul fişi no", "Filtro: N.º nota de receção", "Фильтр: № акта приемки"],
  "Loading filtered Goods Receipt Note items...": ["جارٍ تحميل بنود إشعار الاستلام المصفاة...", "फ़िल्टर किए गए माल प्राप्ति नोट आइटम लोड हो रहे हैं...", "Chargement des articles de réception filtrés...", "Cargando ítems filtrados de recepción...", "正在载入筛选后的收货单项目...", "Filtrelenmiş mal kabul kalemleri yükleniyor...", "A carregar itens filtrados da receção...", "Загрузка отфильтрованных позиций приемки..."],
  "No Goods Receipt Note items found for selected filters.": ["لم يتم العثور على بنود إشعار استلام للبضائع حسب الفلاتر.", "चयनित फ़िल्टर के लिए कोई माल प्राप्ति नोट आइटम नहीं मिला.", "Aucun article de réception trouvé pour les filtres sélectionnés.", "No se encontraron ítems de recepción para los filtros seleccionados.", "未找到符合筛选条件的收货单项目。", "Seçili filtrelere uygun mal kabul kalemi bulunamadı.", "Não foram encontrados itens de receção para os filtros selecionados.", "Позиции приемки по выбранным фильтрам не найдены."],
  "Apply at least one filter (Customer, Goods Receipt Note Number, Date From, or Date To) to load Goods Receipt Note items.": ["طبّق فلترًا واحدًا على الأقل (العميل أو رقم إشعار الاستلام أو من تاريخ أو إلى تاريخ) لتحميل البنود.", "माल प्राप्ति नोट आइटम लोड करने के लिए कम से कम एक फ़िल्टर (ग्राहक, नंबर, तारीख से, तारीख तक) लगाएँ.", "Appliquez au moins un filtre (client, N° de réception, date début ou date fin) pour charger les articles.", "Aplique al menos un filtro (cliente, número de recepción, fecha desde o fecha hasta) para cargar ítems.", "请至少应用一个筛选条件（客户、收货单号、开始日期或结束日期）以载入项目。", "Kalemleri yüklemek için en az bir filtre uygulayın (müşteri, mal kabul no, başlangıç veya bitiş tarihi).", "Aplique pelo menos um filtro (cliente, n.º receção, data inicial ou final) para carregar itens.", "Укажите хотя бы один фильтр (клиент, № акта, дата с или дата по), чтобы загрузить позиции."],
  "Manual Cargo Item Entry": ["إدخال بند شحنة يدوي", "मैनुअल कार्गो आइटम एंट्री", "Saisie manuelle d'article cargo", "Entrada manual de carga", "手动录入货物项目", "Manuel kargo kalemi girişi", "Entrada manual de item de carga", "Ручной ввод грузовой позиции"],
  "manual row(s)": ["صف/صفوف يدوية", "मैनुअल पंक्ति(याँ)", "ligne(s) manuelle(s)", "fila(s) manual(es)", "手动行", "manuel satır", "linha(s) manual(is)", "ручн. строк(и)"],
  "Manual Total Volume": ["إجمالي الحجم اليدوي", "मैनुअल कुल आयतन", "Volume total manuel", "Volumen total manual", "手动总立方", "Manuel toplam hacim", "Volume total manual", "Ручной общий объем"],
  "Overall Loaded Volume": ["إجمالي الحجم المحمل", "कुल लोडेड आयतन", "Volume chargé total", "Volumen cargado total", "总装载体积", "Genel yüklenen hacim", "Volume carregado total", "Общий загруженный объем"],
  "item(s) selected.": ["بند/بنود محددة.", "आइटम चयनित.", "article(s) sélectionné(s).", "ítem(s) seleccionados.", "个项目已选择。", "kalem seçildi.", "item(ns) selecionado(s).", "позиций выбрано."],
  "Package Type": ["نوع التغليف", "पैकेज प्रकार", "Type d'emballage", "Tipo de embalaje", "包装类型", "Paket tipi", "Tipo de embalagem", "Тип упаковки"],
  "No. of Packages": ["عدد الطرود", "पैकेजों की संख्या", "Nombre de colis", "N.º de bultos", "件数", "Paket adedi", "N.º de volumes", "Количество мест"],
  "Gross Weight": ["الوزن الإجمالي", "सकल वजन", "Poids brut", "Peso bruto", "毛重", "Brüt ağırlık", "Peso bruto", "Вес брутто"],
  "Length (Per Item)": ["الطول لكل بند", "लंबाई (प्रति आइटम)", "Longueur par article", "Longitud por ítem", "每件长度", "Kalem başına uzunluk", "Comprimento por item", "Длина за единицу"],
  "Width (Per Item)": ["العرض لكل بند", "चौड़ाई (प्रति आइटम)", "Largeur par article", "Anchura por ítem", "每件宽度", "Kalem başına genişlik", "Largura por item", "Ширина за единицу"],
  "Height (Per Item)": ["الارتفاع لكل بند", "ऊँचाई (प्रति आइटम)", "Hauteur par article", "Altura por ítem", "每件高度", "Kalem başına yükseklik", "Altura por item", "Высота за единицу"],
  "Per Item Volume": ["حجم البند الواحد", "प्रति आइटम आयतन", "Volume par article", "Volumen por ítem", "每件体积", "Kalem başına hacim", "Volume por item", "Объем за единицу"],
  "Total Volume": ["إجمالي الحجم", "कुल आयतन", "Volume total", "Volumen total", "总体积", "Toplam hacim", "Volume total", "Общий объем"],
  "Loaded Pieces": ["القطع المحملة", "लोडेड पीस", "Pièces chargées", "Piezas cargadas", "已装件数", "Yüklenen parça", "Peças carregadas", "Загружено мест"],
  "Loaded Weight": ["الوزن المحمل", "लोडेड वजन", "Poids chargé", "Peso cargado", "已装重量", "Yüklenen ağırlık", "Peso carregado", "Загруженный вес"],
  "Loaded Volume": ["الحجم المحمل", "लोडेड आयतन", "Volume chargé", "Volumen cargado", "已装体积", "Yüklenen hacim", "Volume carregado", "Загруженный объем"],
  "Avail Pieces": ["القطع المتاحة", "उपलब्ध पीस", "Pièces disponibles", "Piezas disponibles", "可用件数", "Mevcut parça", "Peças disponíveis", "Доступно мест"],
  "Avail Weight": ["الوزن المتاح", "उपलब्ध वजन", "Poids disponible", "Peso disponible", "可用重量", "Mevcut ağırlık", "Peso disponível", "Доступный вес"],
  "Avail Volume": ["الحجم المتاح", "उपलब्ध आयतन", "Volume disponible", "Volumen disponible", "可用体积", "Mevcut hacim", "Volume disponível", "Доступный объем"],
  "Print Job Card": ["طباعة بطاقة المهمة", "जॉब कार्ड प्रिंट करें", "Imprimer la fiche dossier", "Imprimir tarjeta de trabajo", "打印作业卡", "İş kartını yazdır", "Imprimir ficha do processo", "Печать карты задания"],
  "Print Labels": ["طباعة الملصقات", "लेबल प्रिंट करें", "Imprimer les étiquettes", "Imprimir etiquetas", "打印标签", "Etiketleri yazdır", "Imprimir etiquetas", "Печать этикеток"],
  "HOUSE SHIPMENT JOB CARD": ["بطاقة مهمة الشحنة الفرعية", "हाउस शिपमेंट जॉब कार्ड", "FICHE DOSSIER EXPÉDITION HOUSE", "TARJETA DE TRABAJO ENVÍO HOUSE", "分单货运作业卡", "HOUSE SEVKİYAT İŞ KARTI", "FICHA DO PROCESSO DE ENVIO HOUSE", "КАРТА ЗАДАНИЯ HOUSE-ОТПРАВКИ"],
  "House shipment job card print preview and PDF export.": ["معاينة بطاقة مهمة الشحنة الفرعية وتصديرها PDF.", "हाउस शिपमेंट जॉब कार्ड प्रिंट पूर्वावलोकन और PDF निर्यात.", "Aperçu d'impression et export PDF de la fiche dossier house.", "Vista previa e exportación PDF de la tarjeta house.", "分单作业卡打印预览和 PDF 导出。", "House sevkiyat iş kartı önizleme ve PDF dışa aktarma.", "Pré-visualização e exportação PDF da ficha house.", "Предпросмотр и экспорт PDF карты house-отправки."],
  "House shipment label print preview (HAWB-based barcode).": ["معاينة طباعة ملصق الشحنة الفرعية (باركود حسب HAWB).", "हाउस शिपमेंट लेबल प्रिंट पूर्वावलोकन (HAWB आधारित बारकोड).", "Aperçu des étiquettes house (code-barres basé sur HAWB).", "Vista previa de etiquetas house (código de barras HAWB).", "分单标签打印预览（基于 HAWB 条码）。", "House sevkiyat etiketi önizleme (HAWB barkodlu).", "Pré-visualização de etiquetas house (código de barras HAWB).", "Предпросмотр этикеток house (штрихкод HAWB)."],
  "Shipment status updated.": ["تم تحديث حالة الشحنة.", "शिपमेंट स्थिति अपडेट हुई.", "Statut d'expédition mis à jour.", "Estado del envío actualizado.", "货运状态已更新。", "Sevkiyat durumu güncellendi.", "Estado do envio atualizado.", "Статус отправки обновлен."],
  "House shipment created successfully.": ["تم إنشاء الشحنة الفرعية بنجاح.", "हाउस शिपमेंट सफलतापूर्वक बनाया गया.", "Expédition house créée avec succès.", "Envío house creado correctamente.", "分单货运创建成功。", "House sevkiyat başarıyla oluşturuldu.", "Envio house criado com sucesso.", "House-отправка успешно создана."],
  "House shipment updated.": ["تم تحديث الشحنة الفرعية.", "हाउस शिपमेंट अपडेट हुआ.", "Expédition house mise à jour.", "Envío house actualizado.", "分单货运已更新。", "House sevkiyat güncellendi.", "Envio house atualizado.", "House-отправка обновлена."],
  "Finance Status": ["الحالة المالية", "वित्तीय स्थिति", "Statut financier", "Estado financiero", "财务状态", "Finans durumu", "Estado financeiro", "Финансовый статус"],
  "Invoice Defined": ["تم تعريف الفاتورة", "इनवॉइस परिभाषित", "Facture définie", "Factura definida", "已定义发票", "Fatura tanımlı", "Fatura definida", "Счет определен"],
  "Bill Defined": ["تم تعريف فاتورة المورد", "बिल परिभाषित", "Facture fournisseur définie", "Bill definido", "已定义供应商账单", "Gider faturası tanımlı", "Conta definida", "Счет поставщика определен"],
  "Invoice Fully Received": ["تم تحصيل الفاتورة بالكامل", "इनवॉइस पूरी तरह प्राप्त", "Facture entièrement encaissée", "Factura totalmente cobrada", "发票已全额收款", "Fatura tamamen tahsil edildi", "Fatura totalmente recebida", "Счет полностью оплачен клиентом"],
  "Bill Fully Paid": ["تم دفع فاتورة المورد بالكامل", "बिल पूरी तरह भुगतान", "Facture fournisseur entièrement payée", "Bill totalmente pagado", "供应商账单已全额付款", "Gider faturası tamamen ödendi", "Conta totalmente paga", "Счет поставщика полностью оплачен"],
  "Pending Invoice To Post": ["فواتير بانتظار الترحيل", "पोस्ट हेतु लंबित इनवॉइस", "Factures en attente de comptabilisation", "Facturas pendientes de contabilizar", "待过账发票", "Muhasebeleşecek faturalar", "Faturas pendentes de lançamento", "Счета к проведению"],
  "Pending Bill To Post": ["فواتير موردين بانتظار الترحيل", "पोस्ट हेतु लंबित बिल", "Factures fournisseur en attente de comptabilisation", "Bills pendientes de contabilizar", "待过账供应商账单", "Muhasebeleşecek gider faturaları", "Contas pendentes de lançamento", "Счета поставщика к проведению"],
  "Unpaid Invoice": ["فاتورة غير محصلة", "अवैतनिक इनवॉइस", "Facture impayée", "Factura sin cobrar", "未收发票", "Tahsil edilmemiş fatura", "Fatura por receber", "Неоплаченный клиентский счет"],
  "Unpaid Bill": ["فاتورة مورد غير مدفوعة", "अवैतनिक बिल", "Facture fournisseur impayée", "Bill sin pagar", "未付供应商账单", "Ödenmemiş gider faturası", "Conta por pagar", "Неоплаченный счет поставщика"],
  "Invoice Cancelled": ["فاتورة ملغاة", "इनवॉइस रद्द", "Facture annulée", "Factura cancelada", "发票已取消", "Fatura iptal edildi", "Fatura cancelada", "Счет отменен"],
  "Bill Cancelled": ["فاتورة مورد ملغاة", "बिल रद्द", "Facture fournisseur annulée", "Bill cancelado", "供应商账单已取消", "Gider faturası iptal edildi", "Conta cancelada", "Счет поставщика отменен"]
});

Object.assign(direct, {
  "Create a house shipment and load goods receipt items.": ["أنشئ شحنة فرعية وحمّل بنود إشعار استلام البضائع.", "हाउस शिपमेंट बनाएँ और माल प्राप्ति नोट आइटम लोड करें.", "Créez une expédition house et chargez les articles de réception.", "Cree un envío house y cargue ítems de recepción.", "创建分单货运并载入收货单项目。", "House sevkiyat oluşturun ve mal kabul kalemlerini yükleyin.", "Crie um envio house e carregue itens da receção.", "Создайте house-отправку и загрузите позиции приемки."],
  "Goods Receipt Note items are selected. They will be saved when you create the shipment.": ["تم تحديد بنود إشعار استلام البضائع. سيتم حفظها عند إنشاء الشحنة.", "माल प्राप्ति नोट आइटम चयनित हैं। शिपमेंट बनाते समय ये सेव होंगे.", "Les articles de réception sont sélectionnés. Ils seront enregistrés lors de la création de l'expédition.", "Los ítems de recepción están seleccionados. Se guardarán al crear el envío.", "已选择收货单项目。创建货运时将保存。", "Mal kabul kalemleri seçildi. Sevkiyat oluşturulurken kaydedilecek.", "Os itens da receção estão selecionados. Serão guardados ao criar o envio.", "Позиции приемки выбраны. Они будут сохранены при создании отправки."],
  "Goods Receipt Note items saved": ["تم حفظ بنود إشعار استلام البضائع", "माल प्राप्ति नोट आइटम सेव हुए", "Articles de réception enregistrés", "Ítems de recepción guardados", "收货单项目已保存", "Mal kabul kalemleri kaydedildi", "Itens da receção guardados", "Позиции приемки сохранены"],
  "Selected Goods Receipt Note items were saved to the shipment.": ["تم حفظ بنود إشعار الاستلام المحددة في الشحنة.", "चयनित माल प्राप्ति नोट आइटम शिपमेंट में सेव हो गए.", "Les articles de réception sélectionnés ont été enregistrés dans l'expédition.", "Los ítems de recepción seleccionados se guardaron en el envío.", "所选收货单项目已保存到货运。", "Seçili mal kabul kalemleri sevkiyata kaydedildi.", "Os itens da receção selecionados foram guardados no envio.", "Выбранные позиции приемки сохранены в отправке."]
});

Object.assign(direct, {
  "House Shipment Documents": ["مستندات الشحنة الفرعية", "हाउस शिपमेंट दस्तावेज़", "Documents de l'expédition house", "Documentos del envío house", "分单货运文件", "House sevkiyat belgeleri", "Documentos do envio house", "Документы house-отправки"],
  "House Shipment Invoices": ["فواتير الشحنة الفرعية", "हाउस शिपमेंट इनवॉइस", "Factures de l'expédition house", "Facturas del envío house", "分单货运发票", "House sevkiyat faturaları", "Faturas do envio house", "Счета house-отправки"],
  "House Shipment Labels": ["ملصقات الشحنة الفرعية", "हाउस शिपमेंट लेबल", "Étiquettes de l'expédition house", "Etiquetas del envío house", "分单货运标签", "House sevkiyat etiketleri", "Etiquetas do envio house", "Этикетки house-отправки"],
  "House Shipment Profit Preview": ["معاينة ربح الشحنة الفرعية", "हाउस शिपमेंट लाभ पूर्वावलोकन", "Aperçu du profit de l'expédition house", "Vista previa de utilidad del envío house", "分单货运利润预览", "House sevkiyat kâr önizlemesi", "Pré-visualização do lucro do envio house", "Предпросмотр прибыли house-отправки"],
  "House Shipment Status": ["حالة الشحنة الفرعية", "हाउस शिपमेंट स्थिति", "Statut de l'expédition house", "Estado del envío house", "分单货运状态", "House sevkiyat durumu", "Estado do envio house", "Статус house-отправки"],
  "House Shipment Vendor Bills": ["فواتير موردي الشحنة الفرعية", "हाउस शिपमेंट विक्रेता बिल", "Factures fournisseur de l'expédition house", "Bills de proveedor del envío house", "分单货运供应商账单", "House sevkiyat tedarikçi faturaları", "Contas de fornecedor do envio house", "Счета поставщиков house-отправки"],
  "House shipment planning, loading, documents, labels, and profit preview.": ["تخطيط الشحنة الفرعية وتحميل البضائع والمستندات والملصقات ومعاينة الربح.", "हाउस शिपमेंट योजना, लोडिंग, दस्तावेज़, लेबल और लाभ पूर्वावलोकन.", "Planification, chargement, documents, étiquettes et aperçu du profit de l'expédition house.", "Planificación, carga, documentos, etiquetas y vista previa de utilidad del envío house.", "分单货运计划、装载、文件、标签和利润预览。", "House sevkiyat planlama, yükleme, belgeler, etiketler ve kâr önizlemesi.", "Planeamento, carregamento, documentos, etiquetas e pré-visualização de lucro do envio house.", "Планирование, загрузка, документы, этикетки и предпросмотр прибыли house-отправки."],
  "Loading house shipment...": ["جارٍ تحميل الشحنة الفرعية...", "हाउस शिपमेंट लोड हो रहा है...", "Chargement de l'expédition house...", "Cargando envío house...", "正在载入分单货运...", "House sevkiyat yükleniyor...", "A carregar envio house...", "Загрузка house-отправки..."],
  "Save House Shipment": ["حفظ الشحنة الفرعية", "हाउस शिपमेंट सेव करें", "Enregistrer l'expédition house", "Guardar envío house", "保存分单货运", "House sevkiyatı kaydet", "Guardar envio house", "Сохранить house-отправку"],
  "Search vendor bill number, HAWB, house shipment number, or status": ["ابحث برقم فاتورة المورد أو HAWB أو رقم الشحنة الفرعية أو الحالة", "वेंडर बिल नंबर, HAWB, हाउस शिपमेंट नंबर या स्थिति से खोजें", "Rechercher par facture fournisseur, HAWB, numéro house ou statut", "Buscar por bill proveedor, HAWB, número house o estado", "按供应商账单号、HAWB、分单号或状态搜索", "Tedarikçi faturası, HAWB, house sevkiyat no veya duruma göre ara", "Pesquisar por conta fornecedor, HAWB, número house ou estado", "Поиск по счету поставщика, HAWB, № house или статусу"],
  "Master/house waybill": ["بوليصة الشحن الرئيسية/الفرعية", "मास्टर/हाउस वेबिल", "Lettre de transport master/house", "Guía master/house", "主单/分单运单", "Master/house konşimento", "Guia master/house", "Master/house накладная"],
  "Shipment No:": ["رقم الشحنة:", "शिपमेंट नंबर:", "N° expédition :", "N.º envío:", "货运号：", "Sevkiyat no:", "N.º envio:", "№ отправки:"],
  "Origin Port:": ["ميناء المنشأ:", "मूल पोर्ट:", "Port d'origine :", "Puerto de origen:", "起运港：", "Çıkış limanı:", "Porto de origem:", "Порт отправления:"],
  "Destination Port:": ["ميناء الوجهة:", "गंतव्य पोर्ट:", "Port de destination :", "Puerto de destino:", "目的港：", "Varış limanı:", "Porto de destino:", "Порт назначения:"],
  "Drop Location:": ["موقع التسليم:", "ड्रॉप स्थान:", "Lieu de livraison :", "Lugar de entrega:", "送达地点：", "Teslim konumu:", "Local de entrega:", "Место доставки:"],
  "Shipper:": ["الشاحن:", "शिपर:", "Expéditeur :", "Expedidor:", "发货人：", "Gönderici:", "Expedidor:", "Отправитель:"],
  "Consignee:": ["المرسل إليه:", "कंसाइनी:", "Destinataire :", "Consignatario:", "收货人：", "Alıcı:", "Consignatário:", "Получатель:"]
});

Object.assign(direct, {
  "Search by name, code, or phone": ["ابحث بالاسم أو الكود أو الهاتف", "नाम, कोड या फोन से खोजें", "Rechercher par nom, code ou téléphone", "Buscar por nombre, código o teléfono", "按名称、代码或电话搜索", "Ad, kod veya telefonla ara", "Pesquisar por nome, código ou telefone", "Поиск по имени, коду или телефону"],
  "No salesman": ["بدون مندوب مبيعات", "कोई सेल्समैन नहीं", "Aucun commercial", "Sin vendedor", "无销售员", "Satış temsilcisi yok", "Sem vendedor", "Без менеджера продаж"],
  "No Salesman": ["بدون مندوب مبيعات", "कोई सेल्समैन नहीं", "Aucun commercial", "Sin vendedor", "无销售员", "Satış temsilcisi yok", "Sem vendedor", "Без менеджера продаж"],
  "Select customer before quotation": ["اختر العميل قبل عرض السعر", "कोटेशन से पहले ग्राहक चुनें", "Sélectionner le client avant le devis", "Seleccione cliente antes de la cotización", "请先选择客户再选择报价", "Tekliften önce müşteriyi seçin", "Selecione o cliente antes da cotação", "Выберите клиента перед предложением"],
  "Select a customer to search quotations.": ["اختر عميلاً للبحث عن عروض الأسعار.", "कोटेशन खोजने के लिए ग्राहक चुनें.", "Sélectionnez un client pour rechercher des devis.", "Seleccione un cliente para buscar cotizaciones.", "请选择客户以搜索报价。", "Teklif aramak için müşteri seçin.", "Selecione um cliente para pesquisar cotações.", "Выберите клиента для поиска предложений."],
  "Enter at least 3 characters of the quotation number.": ["أدخل 3 أحرف على الأقل من رقم عرض السعر.", "कोटेशन नंबर के कम से कम 3 अक्षर दर्ज करें.", "Saisissez au moins 3 caractères du numéro de devis.", "Ingrese al menos 3 caracteres del número de cotización.", "请输入报价号至少 3 个字符。", "Teklif numarasından en az 3 karakter girin.", "Insira pelo menos 3 caracteres do número da cotação.", "Введите не менее 3 символов номера предложения."],
  "Searching approved quotations...": ["جارٍ البحث عن عروض الأسعار المعتمدة...", "स्वीकृत कोटेशन खोजे जा रहे हैं...", "Recherche des devis approuvés...", "Buscando cotizaciones aprobadas...", "正在搜索已批准报价...", "Onaylı teklifler aranıyor...", "A pesquisar cotações aprovadas...", "Поиск утвержденных предложений..."],
  "No approved quotations found.": ["لم يتم العثور على عروض أسعار معتمدة.", "कोई स्वीकृत कोटेशन नहीं मिला.", "Aucun devis approuvé trouvé.", "No se encontraron cotizaciones aprobadas.", "未找到已批准报价。", "Onaylı teklif bulunamadı.", "Não foram encontradas cotações aprovadas.", "Утвержденные предложения не найдены."],
  "Search address/place (OpenStreetMap)": ["ابحث عن العنوان/الموقع (OpenStreetMap)", "पता/स्थान खोजें (OpenStreetMap)", "Rechercher une adresse/un lieu (OpenStreetMap)", "Buscar dirección/lugar (OpenStreetMap)", "搜索地址/地点 (OpenStreetMap)", "Adres/yer ara (OpenStreetMap)", "Pesquisar endereço/local (OpenStreetMap)", "Поиск адреса/места (OpenStreetMap)"],
  "Use Current": ["استخدم الحالي", "वर्तमान उपयोग करें", "Utiliser l'emplacement actuel", "Usar actual", "使用当前位置", "Mevcut konumu kullan", "Usar atual", "Использовать текущий"],
  "ETD": ["وقت المغادرة المتوقع", "अपेक्षित प्रस्थान समय", "ETD - départ estimé", "ETD - salida estimada", "预计离港时间", "ETD - tahmini çıkış", "ETD - partida estimada", "ETD - расчетное отправление"],
  "ETA": ["وقت الوصول المتوقع", "अपेक्षित आगमन समय", "ETA - arrivée estimée", "ETA - llegada estimada", "预计到达时间", "ETA - tahmini varış", "ETA - chegada estimada", "ETA - расчетное прибытие"],
  "ETD:": ["وقت المغادرة المتوقع:", "अपेक्षित प्रस्थान समय:", "ETD - départ estimé :", "ETD - salida estimada:", "预计离港时间：", "ETD - tahmini çıkış:", "ETD - partida estimada:", "ETD - расчетное отправление:"],
  "ETA:": ["وقت الوصول المتوقع:", "अपेक्षित आगमन समय:", "ETA - arrivée estimée :", "ETA - llegada estimada:", "预计到达时间：", "ETA - tahmini varış:", "ETA - chegada estimada:", "ETA - расчетное прибытие:"],
  "Label Template": ["قالب الملصق", "लेबल टेम्पलेट", "Modèle d'étiquette", "Plantilla de etiqueta", "标签模板", "Etiket şablonu", "Modelo de etiqueta", "Шаблон этикетки"],
  "Revenue": ["الإيراد", "राजस्व", "Revenu", "Ingresos", "收入", "Gelir", "Receita", "Выручка"],
  "Revenue Amount": ["مبلغ الإيراد", "राजस्व राशि", "Montant du revenu", "Importe de ingresos", "收入金额", "Gelir tutarı", "Valor da receita", "Сумма выручки"],
  "Cost": ["التكلفة", "लागत", "Coût", "Costo", "成本", "Maliyet", "Custo", "Себестоимость"],
  "Cost Amount": ["مبلغ التكلفة", "लागत राशि", "Montant du coût", "Importe de costo", "成本金额", "Maliyet tutarı", "Valor do custo", "Сумма затрат"],
  "Revenue, cost, gross profit, and margin for this shipment.": ["إيراد الشحنة وتكلفتها والربح الإجمالي والهامش.", "इस शिपमेंट का राजस्व, लागत, सकल लाभ और मार्जिन.", "Revenu, coût, profit brut et marge de cette expédition.", "Ingresos, costo, utilidad bruta y margen de este envío.", "此货运的收入、成本、毛利和利润率。", "Bu sevkiyat için gelir, maliyet, brüt kâr ve marj.", "Receita, custo, lucro bruto e margem deste envio.", "Выручка, затраты, валовая прибыль и маржа этой отправки."],
  "Add Manual Item": ["إضافة بند شحنة يدوي", "मैनुअल कार्गो आइटम जोड़ें", "Ajouter un article cargo manuel", "Agregar ítem de carga manual", "添加手动货物项目", "Manuel kargo kalemi ekle", "Adicionar item de carga manual", "Добавить грузовую позицию вручную"],
  "Manual Item": ["بند شحنة يدوي", "मैनुअल कार्गो आइटम", "Article cargo manuel", "Ítem de carga manual", "手动货物项目", "Manuel kargo kalemi", "Item de carga manual", "Грузовая позиция вручную"],
  "Manual item added": ["تمت إضافة بند الشحنة اليدوي", "मैनुअल कार्गो आइटम जोड़ा गया", "Article cargo manuel ajouté", "Ítem de carga manual agregado", "手动货物项目已添加", "Manuel kargo kalemi eklendi", "Item de carga manual adicionado", "Ручная грузовая позиция добавлена"]
});

Object.assign(direct, {
  "Origin port": ["ميناء المنشأ", "मूल पोर्ट", "Port d'origine", "Puerto de origen", "起运港", "Çıkış limanı", "Porto de origem", "Порт отправления"],
  "Destination port": ["ميناء الوجهة", "गंतव्य पोर्ट", "Port de destination", "Puerto de destino", "目的港", "Varış limanı", "Porto de destino", "Порт назначения"],
  "Select origin port": ["اختر ميناء المنشأ", "मूल पोर्ट चुनें", "Sélectionner le port d'origine", "Seleccionar puerto de origen", "选择起运港", "Çıkış limanı seçin", "Selecionar porto de origem", "Выберите порт отправления"],
  "Select destination port": ["اختر ميناء الوجهة", "गंतव्य पोर्ट चुनें", "Sélectionner le port de destination", "Seleccionar puerto de destino", "选择目的港", "Varış limanı seçin", "Selecionar porto de destino", "Выберите порт назначения"],
  "DEFAULT": ["افتراضي", "डिफ़ॉल्ट", "Par défaut", "Predeterminado", "默认", "Varsayılan", "Predefinido", "По умолчанию"],
  "Default": ["افتراضي", "डिफ़ॉल्ट", "Par défaut", "Predeterminado", "默认", "Varsayılan", "Predefinido", "По умолчанию"],
  "No manual items added.": ["لم تتم إضافة بنود يدوية.", "कोई मैनुअल आइटम नहीं जोड़ा गया.", "Aucun article manuel ajouté.", "No se agregaron ítems manuales.", "未添加手动项目。", "Manuel kalem eklenmedi.", "Nenhum item manual adicionado.", "Ручные позиции не добавлены."],
  "manual items added.": ["تمت إضافة بنود يدوية.", "मैनुअल आइटम जोड़े गए.", "Articles manuels ajoutés.", "Ítems manuales agregados.", "手动项目已添加。", "Manuel kalemler eklendi.", "Itens manuais adicionados.", "Ручные позиции добавлены."]
});

Object.assign(direct, {
  "Direct": ["مباشر", "डायरेक्ट", "Direct", "Directo", "直运", "Doğrudan", "Direto", "Прямой"],
  "Direct Shipment": ["شحنة مباشرة", "डायरेक्ट शिपमेंट", "Expédition directe", "Envío directo", "直运货运", "Doğrudan sevkiyat", "Envio direto", "Прямая отправка"],
  "Direct Shipments": ["الشحنات المباشرة", "डायरेक्ट शिपमेंट", "Expéditions directes", "Envíos directos", "直运货运", "Doğrudan sevkiyatlar", "Envios diretos", "Прямые отправки"],
  "New Direct Shipment": ["شحنة مباشرة جديدة", "नया डायरेक्ट शिपमेंट", "Nouvelle expédition directe", "Nuevo envío directo", "新建直运货运", "Yeni doğrudan sevkiyat", "Novo envio direto", "Новая прямая отправка"],
  "Direct Shipment No": ["رقم الشحنة المباشرة", "डायरेक्ट शिपमेंट नंबर", "N° expédition directe", "N.º envío directo", "直运货运号", "Doğrudan sevkiyat no", "N.º envio direto", "№ прямой отправки"],
  "Direct Shipment Items": ["بنود الشحنة المباشرة", "डायरेक्ट शिपमेंट आइटम", "Articles de l'expédition directe", "Ítems del envío directo", "直运货运项目", "Doğrudan sevkiyat kalemleri", "Itens do envio direto", "Позиции прямой отправки"],
  "Direct Shipment Invoices": ["فواتير الشحنة المباشرة", "डायरेक्ट शिपमेंट इनवॉइस", "Factures de l'expédition directe", "Facturas del envío directo", "直运货运发票", "Doğrudan sevkiyat faturaları", "Faturas do envio direto", "Счета прямой отправки"],
  "Direct Shipment Vendor Bills": ["فواتير موردي الشحنة المباشرة", "डायरेक्ट शिपमेंट विक्रेता बिल", "Factures fournisseur de l'expédition directe", "Bills de proveedor del envío directo", "直运货运供应商账单", "Doğrudan sevkiyat tedarikçi faturaları", "Contas de fornecedor do envio direto", "Счета поставщиков прямой отправки"],
  "Direct Shipment Labels": ["ملصقات الشحنة المباشرة", "डायरेक्ट शिपमेंट लेबल", "Étiquettes de l'expédition directe", "Etiquetas del envío directo", "直运货运标签", "Doğrudan sevkiyat etiketleri", "Etiquetas do envio direto", "Этикетки прямой отправки"],
  "Direct Shipment Profit Preview": ["معاينة ربح الشحنة المباشرة", "डायरेक्ट शिपमेंट लाभ पूर्वावलोकन", "Aperçu du profit de l'expédition directe", "Vista previa de utilidad del envío directo", "直运货运利润预览", "Doğrudan sevkiyat kâr önizlemesi", "Pré-visualização do lucro do envio direto", "Предпросмотр прибыли прямой отправки"],
  "Create direct shipment with customer, route, transport details, and shipment items.": ["أنشئ شحنة مباشرة مع العميل والمسار وتفاصيل النقل وبنود الشحنة.", "ग्राहक, मार्ग, परिवहन विवरण और शिपमेंट आइटम के साथ डायरेक्ट शिपमेंट बनाएँ.", "Créez une expédition directe avec client, itinéraire, détails de transport et articles.", "Cree un envío directo con cliente, ruta, detalles de transporte e ítems.", "创建包含客户、路线、运输明细和货物项目的直运货运。", "Müşteri, rota, taşıma bilgileri ve sevkiyat kalemleriyle doğrudan sevkiyat oluşturun.", "Crie um envio direto com cliente, rota, detalhes de transporte e itens.", "Создайте прямую отправку с клиентом, маршрутом, транспортными данными и позициями."],
  "Create and manage direct shipments without house/master consolidation.": ["أنشئ وأدر الشحنات المباشرة دون تجميع House/Master.", "हाउस/मास्टर कंसोलिडेशन के बिना डायरेक्ट शिपमेंट बनाएं और प्रबंधित करें.", "Créez et gérez les expéditions directes sans consolidation house/master.", "Cree y gestione envíos directos sin consolidación house/master.", "创建和管理无需分单/主单集运的直运货运。", "House/master konsolidasyon olmadan doğrudan sevkiyatları oluşturun ve yönetin.", "Crie e gira envios diretos sem consolidação house/master.", "Создавайте и управляйте прямыми отправками без консолидации house/master."],
  "Air": ["جوي", "एयर", "Aérien", "Aéreo", "空运", "Hava", "Aéreo", "Авиа"],
  "Sea": ["بحري", "समुद्री", "Maritime", "Marítimo", "海运", "Deniz", "Marítimo", "Море"],
  "Road": ["بري", "सड़क", "Routier", "Carretera", "公路", "Karayolu", "Rodoviário", "Авто"],
  "Courier": ["بريد سريع", "कूरियर", "Courier express", "Courier", "快递", "Kurye", "Courier", "Курьер"],
  "Carrier": ["الناقل", "कैरियर", "Transporteur", "Transportista", "承运人", "Taşıyıcı", "Transportador", "Перевозчик"],
  "Quotation": ["عرض السعر", "कोटेशन", "Devis", "Cotización", "报价", "Teklif", "Cotação", "Коммерческое предложение"],
  "Waybill": ["بوليصة الشحن", "वेबिल", "Lettre de transport", "Guía aérea/porte", "运单", "Konşimento", "Guia de transporte", "Транспортная накладная"],
  "Waybill No": ["رقم بوليصة الشحن", "वेबिल नंबर", "N° lettre de transport", "N.º guía", "运单号", "Konşimento no", "N.º guia", "№ транспортной накладной"],
  "Master Waybill No": ["رقم بوليصة الشحن الرئيسية", "मास्टर वेबिल नंबर", "N° lettre de transport master", "N.º guía master", "主运单号", "Master konşimento no", "N.º guia master", "№ master-накладной"],
  "Master Waybill No:": ["رقم بوليصة الشحن الرئيسية:", "मास्टर वेबिल नंबर:", "N° lettre de transport master :", "N.º guía master:", "主运单号：", "Master konşimento no:", "N.º guia master:", "№ master-накладной:"],
  "Save Direct Shipment": ["حفظ الشحنة المباشرة", "डायरेक्ट शिपमेंट सेव करें", "Enregistrer l'expédition directe", "Guardar envío directo", "保存直运货运", "Doğrudan sevkiyatı kaydet", "Guardar envio direto", "Сохранить прямую отправку"],
  "Loading direct shipment...": ["جارٍ تحميل الشحنة المباشرة...", "डायरेक्ट शिपमेंट लोड हो रहा है...", "Chargement de l'expédition directe...", "Cargando envío directo...", "正在载入直运货运...", "Doğrudan sevkiyat yükleniyor...", "A carregar envio direto...", "Загрузка прямой отправки..."],
  "Direct shipment created successfully.": ["تم إنشاء الشحنة المباشرة بنجاح.", "डायरेक्ट शिपमेंट सफलतापूर्वक बनाया गया.", "Expédition directe créée avec succès.", "Envío directo creado correctamente.", "直运货运创建成功。", "Doğrudan sevkiyat başarıyla oluşturuldu.", "Envio direto criado com sucesso.", "Прямая отправка успешно создана."],
  "Direct shipment updated.": ["تم تحديث الشحنة المباشرة.", "डायरेक्ट शिपमेंट अपडेट हुआ.", "Expédition directe mise à jour.", "Envío directo actualizado.", "直运货运已更新。", "Doğrudan sevkiyat güncellendi.", "Envio direto atualizado.", "Прямая отправка обновлена."],
  "Revenue, cost, profit, and margin for this direct shipment.": ["إيراد الشحنة المباشرة وتكلفتها وربحها وهامشها.", "इस डायरेक्ट शिपमेंट का राजस्व, लागत, लाभ और मार्जिन.", "Revenu, coût, profit et marge de cette expédition directe.", "Ingresos, costo, utilidad y margen de este envío directo.", "此直运货运的收入、成本、利润和利润率。", "Bu doğrudan sevkiyat için gelir, maliyet, kâr ve marj.", "Receita, custo, lucro e margem deste envio direto.", "Выручка, затраты, прибыль и маржа этой прямой отправки."],
  "Search invoice number, direct reference, or status": ["ابحث برقم الفاتورة أو مرجع الشحنة المباشرة أو الحالة", "इनवॉइस नंबर, डायरेक्ट रेफरेंस या स्थिति से खोजें", "Rechercher par facture, référence directe ou statut", "Buscar por factura, referencia directa o estado", "按发票号、直运参考或状态搜索", "Fatura no, doğrudan referans veya duruma göre ara", "Pesquisar por fatura, referência direta ou estado", "Поиск по счету, прямой ссылке или статусу"],
  "Search vendor bill number, MAWB, direct shipment number, or status": ["ابحث برقم فاتورة المورد أو MAWB أو رقم الشحنة المباشرة أو الحالة", "वेंडर बिल नंबर, MAWB, डायरेक्ट शिपमेंट नंबर या स्थिति से खोजें", "Rechercher par facture fournisseur, MAWB, numéro direct ou statut", "Buscar por bill proveedor, MAWB, número directo o estado", "按供应商账单号、MAWB、直运号或状态搜索", "Tedarikçi faturası, MAWB, doğrudan sevkiyat no veya duruma göre ara", "Pesquisar por conta fornecedor, MAWB, número direto ou estado", "Поиск по счету поставщика, MAWB, № прямой отправки или статусу"]
});

Object.assign(direct, {
  "Flight": ["الرحلة الجوية", "फ़्लाइट", "Vol", "Vuelo", "航班", "Uçuş", "Voo", "Рейс"],
  "Flight/Vessel/Truck": ["الرحلة/السفينة/الشاحنة", "फ़्लाइट/वेसल/ट्रक", "Vol / navire / camion", "Vuelo / buque / camión", "航班/船舶/卡车", "Uçuş / gemi / kamyon", "Voo / navio / camião", "Рейс / судно / грузовик"],
  "Label": ["ملصق", "लेबल", "Étiquette", "Etiqueta", "标签", "Etiket", "Etiqueta", "Этикетка"],
  "Labels": ["ملصقات", "लेबल", "Étiquettes", "Etiquetas", "标签", "Etiketler", "Etiquetas", "Этикетки"],
  "Label PDF": ["ملصق PDF", "लेबल PDF", "Étiquette PDF", "Etiqueta PDF", "标签 PDF", "Etiket PDF", "Etiqueta PDF", "Этикетка PDF"],
  "Print Label": ["طباعة الملصق", "लेबल प्रिंट करें", "Imprimer l'étiquette", "Imprimir etiqueta", "打印标签", "Etiket yazdır", "Imprimir etiqueta", "Печать этикетки"],
  "Search by name, code, or phone": ["ابحث بالاسم أو الكود أو الهاتف", "नाम, कोड या फोन से खोजें", "Rechercher par nom, code ou téléphone", "Buscar por nombre, código o teléfono", "按名称、代码或电话搜索", "Ad, kod veya telefonla ara", "Pesquisar por nome, código ou telefone", "Поиск по имени, коду или телефону"]
});

Object.assign(direct, {
  "Customs Clearance": ["التخليص الجمركي", "कस्टम्स क्लीयरेंस", "Dédouanement", "Despacho aduanero", "清关", "Gümrükleme", "Desalfandegamento", "Таможенное оформление"],
  "Customs Job": ["ملف جمركي", "कस्टम्स जॉब", "Dossier douane", "Expediente aduanero", "清关作业", "Gümrük işi", "Processo aduaneiro", "Таможенное дело"],
  "New Customs Clearance Job": ["ملف تخليص جمركي جديد", "नया कस्टम्स क्लीयरेंस जॉब", "Nouveau dossier de dédouanement", "Nuevo expediente de despacho aduanero", "新建清关作业", "Yeni gümrükleme işi", "Novo processo de desalfandegamento", "Новое таможенное дело"],
  "Edit Clearance": ["تعديل التخليص", "क्लीयरेंस संपादित करें", "Modifier le dédouanement", "Editar despacho", "编辑清关", "Gümrüklemeyi düzenle", "Editar desalfandegamento", "Изменить оформление"],
  "View Clearance": ["عرض التخليص", "क्लीयरेंस देखें", "Voir le dédouanement", "Ver despacho", "查看清关", "Gümrüklemeyi görüntüle", "Ver desalfandegamento", "Просмотр оформления"],
  "Customs Clearance Invoices": ["فواتير التخليص الجمركي", "कस्टम्स क्लीयरेंस इनवॉइस", "Factures de dédouanement", "Facturas de despacho aduanero", "清关发票", "Gümrükleme faturaları", "Faturas de desalfandegamento", "Счета таможенного оформления"],
  "Customs Clearance Vendor Bills": ["فواتير موردي التخليص الجمركي", "कस्टम्स क्लीयरेंस विक्रेता बिल", "Factures fournisseur de dédouanement", "Bills de proveedor de despacho aduanero", "清关供应商账单", "Gümrükleme tedarikçi faturaları", "Contas de fornecedor de desalfandegamento", "Счета поставщиков по таможенному оформлению"],
  "Manage customs jobs, declarations, documents, duties, payments, inspections, and queries.": ["إدارة الملفات الجمركية والإقرارات والمستندات والرسوم والمدفوعات والمعاينات والاستفسارات.", "कस्टम्स जॉब, घोषणाएँ, दस्तावेज़, ड्यूटी, भुगतान, निरीक्षण और क्वेरी प्रबंधित करें.", "Gérez les dossiers douane, déclarations, documents, droits, paiements, inspections et requêtes.", "Gestione expedientes aduaneros, declaraciones, documentos, derechos, pagos, inspecciones y consultas.", "管理清关作业、申报、文件、关税、付款、查验和查询。", "Gümrük işleri, beyannameler, belgeler, vergiler, ödemeler, kontroller ve sorguları yönetin.", "Gerir processos aduaneiros, declarações, documentos, direitos, pagamentos, inspeções e consultas.", "Управляйте таможенными делами, декларациями, документами, пошлинами, платежами, инспекциями и запросами."],
  "Create a job with source shipment, broker, declaration, and routing details.": ["أنشئ ملفًا مع مرجع الشحنة والمخلص والإقرار وتفاصيل المسار.", "स्रोत शिपमेंट, ब्रोकर, घोषणा और रूटिंग विवरण के साथ जॉब बनाएं.", "Créez un dossier avec expédition source, transitaire en douane, déclaration et routage.", "Cree un expediente con envío origen, agente aduanal, declaración y ruta.", "创建包含来源货运、报关行、申报和路线信息的作业。", "Kaynak sevkiyat, gümrük müşaviri, beyanname ve rota bilgileriyle iş oluşturun.", "Crie um processo com envio de origem, despachante, declaração e rota.", "Создайте дело с исходной отправкой, брокером, декларацией и маршрутом."],
  "Customs clearance job created.": ["تم إنشاء ملف التخليص الجمركي.", "कस्टम्स क्लीयरेंस जॉब बनाया गया.", "Dossier de dédouanement créé.", "Expediente de despacho creado.", "清关作业已创建。", "Gümrükleme işi oluşturuldu.", "Processo aduaneiro criado.", "Таможенное дело создано."],
  "Customs clearance job updated.": ["تم تحديث ملف التخليص الجمركي.", "कस्टम्स क्लीयरेंस जॉब अपडेट हुआ.", "Dossier de dédouanement mis à jour.", "Expediente de despacho actualizado.", "清关作业已更新。", "Gümrükleme işi güncellendi.", "Processo aduaneiro atualizado.", "Таможенное дело обновлено."],
  "Declaration": ["الإقرار الجمركي", "घोषणा", "Déclaration", "Declaración", "申报", "Beyanname", "Declaração", "Декларация"],
  "Declaration No": ["رقم الإقرار", "घोषणा नंबर", "N° déclaration", "N.º declaración", "申报号", "Beyanname no", "N.º declaração", "№ декларации"],
  "Declaration Date": ["تاريخ الإقرار", "घोषणा दिनांक", "Date de déclaration", "Fecha de declaración", "申报日期", "Beyanname tarihi", "Data da declaração", "Дата декларации"],
  "Declaration Type": ["نوع الإقرار", "घोषणा प्रकार", "Type de déclaration", "Tipo de declaración", "申报类型", "Beyanname türü", "Tipo de declaração", "Тип декларации"],
  "Declaration Mode": ["وضع الإقرار", "घोषणा मोड", "Mode de déclaration", "Modo de declaración", "申报方式", "Beyanname modu", "Modo de declaração", "Режим декларации"],
  "Declaration Item": ["بند الإقرار", "घोषणा आइटम", "Article de déclaration", "Ítem de declaración", "申报项目", "Beyan kalemi", "Item da declaração", "Позиция декларации"],
  "Declaration Remarks": ["ملاحظات الإقرار", "घोषणा टिप्पणियाँ", "Remarques de déclaration", "Observaciones de declaración", "申报备注", "Beyanname açıklamaları", "Observações da declaração", "Примечания к декларации"],
  "Submission Ref": ["مرجع التقديم", "सबमिशन संदर्भ", "Référence de soumission", "Referencia de presentación", "提交参考", "Başvuru referansı", "Referência de submissão", "Ссылка подачи"],
  "Customs Office": ["المكتب الجمركي", "कस्टम्स कार्यालय", "Bureau de douane", "Oficina aduanera", "海关办公室", "Gümrük idaresi", "Estância aduaneira", "Таможенный орган"],
  "Customs Broker": ["المخلص الجمركي", "कस्टम्स ब्रोकर", "Courtier en douane", "Agente aduanal", "报关行", "Gümrük müşaviri", "Despachante aduaneiro", "Таможенный брокер"],
  "Broker": ["المخلص", "ब्रोकर", "Courtier", "Agente", "代理", "Müşavir", "Despachante", "Брокер"],
  "Incoterms": ["شروط الإنكوترمز", "इन्कोटर्म्स", "Incoterms", "Incoterms", "国际贸易术语", "Incoterms", "Incoterms", "Инкотермс"],
  "Clearance Type": ["نوع التخليص", "क्लीयरेंस प्रकार", "Type de dédouanement", "Tipo de despacho", "清关类型", "Gümrükleme türü", "Tipo de desalfandegamento", "Тип оформления"],
  "All clearance types": ["كل أنواع التخليص", "सभी क्लीयरेंस प्रकार", "Tous les types de dédouanement", "Todos los tipos de despacho", "所有清关类型", "Tüm gümrükleme türleri", "Todos os tipos de desalfandegamento", "Все типы оформления"],
  "Expected Clearance": ["التخليص المتوقع", "अपेक्षित क्लीयरेंस", "Dédouanement prévu", "Despacho previsto", "预计清关", "Beklenen gümrükleme", "Desalfandegamento previsto", "Ожидаемое оформление"],
  "Actual Clearance": ["التخليص الفعلي", "वास्तविक क्लीयरेंस", "Dédouanement réel", "Despacho real", "实际清关", "Fiili gümrükleme", "Desalfandegamento real", "Фактическое оформление"],
  "Shipment reference no": ["رقم مرجع الشحنة", "शिपमेंट संदर्भ नंबर", "N° référence expédition", "N.º referencia envío", "货运参考号", "Sevkiyat referans no", "N.º referência envio", "№ ссылки отправки"],
  "Reference No": ["رقم المرجع", "संदर्भ नंबर", "N° référence", "N.º referencia", "参考号", "Referans no", "N.º referência", "№ ссылки"],
  "Job No": ["رقم الملف", "जॉब नंबर", "N° dossier", "N.º expediente", "作业号", "İş no", "N.º processo", "№ дела"],
  "Job Number": ["رقم الملف", "जॉब नंबर", "Numéro de dossier", "Número de expediente", "作业编号", "İş numarası", "Número do processo", "Номер дела"],
  "Customs job number": ["رقم الملف الجمركي", "कस्टम्स जॉब नंबर", "Numéro de dossier douane", "Número de expediente aduanero", "清关作业号", "Gümrük işi numarası", "Número do processo aduaneiro", "Номер таможенного дела"],
  "Assessment": ["تقييم الرسوم", "असेसमेंट", "Liquidation douanière", "Liquidación", "计税评估", "Tahakkuk", "Liquidação", "Начисление"],
  "Assessable": ["قابل للتقييم", "असेसेबल", "Taxable en douane", "Sujeto a valoración", "应税", "Vergilendirilebilir", "Tributável", "Облагаемый"],
  "Assessable Value": ["القيمة الجمركية", "असेसेबल वैल्यू", "Valeur en douane", "Valor en aduana", "完税价格", "Gümrük kıymeti", "Valor aduaneiro", "Таможенная стоимость"],
  "Assessment Reference": ["مرجع التقييم", "असेसमेंट संदर्भ", "Référence de liquidation", "Referencia de liquidación", "评估参考", "Tahakkuk referansı", "Referência da liquidação", "Ссылка начисления"],
  "Assessment Date": ["تاريخ التقييم", "असेसमेंट दिनांक", "Date de liquidation", "Fecha de liquidación", "评估日期", "Tahakkuk tarihi", "Data da liquidação", "Дата начисления"],
  "Duty": ["الرسوم الجمركية", "कस्टम्स ड्यूटी", "Droits de douane", "Derechos aduaneros", "关税", "Gümrük vergisi", "Direitos aduaneiros", "Таможенная пошлина"],
  "Duty Rate %": ["نسبة الرسوم الجمركية %", "ड्यूटी दर %", "Taux droits %", "Tasa de derechos %", "关税税率 %", "Vergi oranı %", "Taxa de direitos %", "Ставка пошлины %"],
  "Duty Amount": ["مبلغ الرسوم الجمركية", "ड्यूटी राशि", "Montant des droits", "Importe de derechos", "关税金额", "Vergi tutarı", "Valor dos direitos", "Сумма пошлины"],
  "Customs Duty Calculation": ["احتساب الرسوم الجمركية", "कस्टम्स ड्यूटी गणना", "Calcul des droits de douane", "Cálculo de derechos aduaneros", "关税计算", "Gümrük vergisi hesaplama", "Cálculo de direitos aduaneiros", "Расчет таможенной пошлины"],
  "Customs duty assessment saved.": ["تم حفظ تقييم الرسوم الجمركية.", "कस्टम्स ड्यूटी असेसमेंट सेव हुआ.", "Liquidation des droits enregistrée.", "Liquidación de derechos guardada.", "关税评估已保存。", "Gümrük vergisi tahakkuku kaydedildi.", "Liquidação dos direitos guardada.", "Начисление пошлины сохранено."],
  "Preview and save duty/tax assessment for the customs job.": ["عاين واحفظ تقييم الرسوم/الضرائب للملف الجمركي.", "कस्टम्स जॉब के लिए ड्यूटी/टैक्स असेसमेंट देखें और सेव करें.", "Prévisualisez et enregistrez la liquidation droits/taxes du dossier douane.", "Previsualice y guarde derechos/impuestos del expediente.", "预览并保存清关作业的关税/税费评估。", "Gümrük işi için vergi/harç tahakkukunu önizleyip kaydedin.", "Pré-visualize e guarde direitos/impostos do processo aduaneiro.", "Просмотрите и сохраните начисление пошлин/налогов по делу."],
  "Tax Rate %": ["نسبة الضريبة %", "टैक्स दर %", "Taux taxe %", "Tasa impuesto %", "税率 %", "Vergi oranı %", "Taxa de imposto %", "Ставка налога %"],
  "Other Charges": ["رسوم أخرى", "अन्य शुल्क", "Autres frais", "Otros cargos", "其他费用", "Diğer masraflar", "Outros encargos", "Прочие начисления"],
  "Penalty": ["غرامة", "जुर्माना", "Pénalité", "Multa", "罚金", "Ceza", "Multa", "Штраф"],
  "Payable / Paid": ["المستحق / المدفوع", "देय / भुगतान", "À payer / payé", "Por pagar / pagado", "应付/已付", "Ödenecek / ödenen", "A pagar / pago", "К оплате / оплачено"],
  "Customs Payable / Paid": ["المستحق الجمركي / المدفوع", "कस्टम्स देय / भुगतान", "Douane à payer / payé", "Aduana por pagar / pagado", "海关应付/已付", "Gümrük ödenecek / ödenen", "Aduaneiro a pagar / pago", "Таможня к оплате / оплачено"],
  "Customs Payment": ["دفعة جمركية", "कस्टम्स भुगतान", "Paiement douane", "Pago aduanero", "海关付款", "Gümrük ödemesi", "Pagamento aduaneiro", "Таможенный платеж"],
  "Add Customs Payment": ["إضافة دفعة جمركية", "कस्टम्स भुगतान जोड़ें", "Ajouter paiement douane", "Agregar pago aduanero", "添加海关付款", "Gümrük ödemesi ekle", "Adicionar pagamento aduaneiro", "Добавить таможенный платеж"],
  "Update Customs Payment": ["تحديث الدفعة الجمركية", "कस्टम्स भुगतान अपडेट करें", "Mettre à jour le paiement douane", "Actualizar pago aduanero", "更新海关付款", "Gümrük ödemesini güncelle", "Atualizar pagamento aduaneiro", "Обновить таможенный платеж"],
  "Customs payment added": ["تمت إضافة الدفعة الجمركية", "कस्टम्स भुगतान जोड़ा गया", "Paiement douane ajouté", "Pago aduanero agregado", "海关付款已添加", "Gümrük ödemesi eklendi", "Pagamento aduaneiro adicionado", "Таможенный платеж добавлен"],
  "Customs payment updated": ["تم تحديث الدفعة الجمركية", "कस्टम्स भुगतान अपडेट हुआ", "Paiement douane mis à jour", "Pago aduanero actualizado", "海关付款已更新", "Gümrük ödemesi güncellendi", "Pagamento aduaneiro atualizado", "Таможенный платеж обновлен"],
  "No customs payment records yet.": ["لا توجد سجلات دفعات جمركية بعد.", "अभी कोई कस्टम्स भुगतान रिकॉर्ड नहीं है.", "Aucun paiement douane pour le moment.", "Aún no hay registros de pago aduanero.", "暂无海关付款记录。", "Henüz gümrük ödemesi kaydı yok.", "Ainda não há pagamentos aduaneiros.", "Таможенных платежей пока нет."],
  "Paid By": ["دُفع بواسطة", "भुगतानकर्ता", "Payé par", "Pagado por", "付款方", "Ödeyen", "Pago por", "Оплачено кем"],
  "Paid By Name": ["اسم الدافع", "भुगतानकर्ता का नाम", "Nom du payeur", "Nombre del pagador", "付款方名称", "Ödeyen adı", "Nome do pagador", "Имя плательщика"],
  "Our Company": ["شركتنا", "हमारी कंपनी", "Notre société", "Nuestra empresa", "我司", "Şirketimiz", "A nossa empresa", "Наша компания"],
  "Customs Account": ["حساب الجمارك", "कस्टम्स खाता", "Compte douane", "Cuenta aduanera", "海关账户", "Gümrük hesabı", "Conta aduaneira", "Таможенный счет"],
  "Our Account Type": ["نوع حساب الشركة", "हमारे खाते का प्रकार", "Type de compte société", "Tipo de cuenta propia", "我司账户类型", "Şirket hesap türü", "Tipo de conta da empresa", "Тип нашего счета"],
  "Our Bank Account": ["حسابنا البنكي", "हमारा बैंक खाता", "Notre compte bancaire", "Nuestra cuenta bancaria", "我司银行账户", "Şirket banka hesabı", "Conta bancária da empresa", "Наш банковский счет"],
  "Our Cash Account": ["حسابنا النقدي", "हमारा नकद खाता", "Notre compte caisse", "Nuestra caja", "我司现金账户", "Şirket kasa hesabı", "Conta de caixa da empresa", "Наш кассовый счет"],
  "Select account type first": ["اختر نوع الحساب أولاً", "पहले खाता प्रकार चुनें", "Sélectionnez d'abord le type de compte", "Seleccione primero el tipo de cuenta", "请先选择账户类型", "Önce hesap türünü seçin", "Selecione primeiro o tipo de conta", "Сначала выберите тип счета"],
  "Select company account": ["اختر حساب الشركة", "कंपनी खाता चुनें", "Sélectionner le compte société", "Seleccionar cuenta de empresa", "选择公司账户", "Şirket hesabı seçin", "Selecionar conta da empresa", "Выберите счет компании"],
  "Company-paid amounts can be posted after the payment is saved.": ["يمكن ترحيل المبالغ المدفوعة من الشركة بعد حفظ الدفعة.", "कंपनी द्वारा भुगतान राशि भुगतान सेव होने के बाद पोस्ट की जा सकती है.", "Les montants payés par la société peuvent être comptabilisés après enregistrement.", "Los importes pagados por la empresa se pueden contabilizar después de guardar.", "公司垫付金额可在保存付款后过账。", "Şirketçe ödenen tutarlar ödeme kaydedildikten sonra muhasebeleştirilebilir.", "Os valores pagos pela empresa podem ser lançados após guardar o pagamento.", "Суммы, оплаченные компанией, можно провести после сохранения платежа."],
  "The accounting entry was reversed.": ["تم عكس القيد المحاسبي.", "लेखांकन प्रविष्टि रिवर्स की गई.", "L'écriture comptable a été extournée.", "El asiento contable fue reversado.", "会计分录已冲销。", "Muhasebe kaydı ters çevrildi.", "O lançamento contabilístico foi revertido.", "Бухгалтерская проводка сторнирована."],
  "The original accounting entry will be reversed before the payment is removed.": ["سيتم عكس القيد الأصلي قبل حذف الدفعة.", "भुगतान हटाने से पहले मूल लेखांकन प्रविष्टि रिवर्स होगी.", "L'écriture d'origine sera extournée avant suppression du paiement.", "El asiento original se reversará antes de eliminar el pago.", "删除付款前将先冲销原始分录。", "Ödeme silinmeden önce orijinal kayıt ters çevrilecek.", "O lançamento original será revertido antes de remover o pagamento.", "Перед удалением платежа исходная проводка будет сторнирована."],
  "The payment record was removed.": ["تم حذف سجل الدفعة.", "भुगतान रिकॉर्ड हटाया गया.", "L'enregistrement de paiement a été supprimé.", "El registro de pago fue eliminado.", "付款记录已删除。", "Ödeme kaydı kaldırıldı.", "O registo de pagamento foi removido.", "Запись платежа удалена."],
  "The payment record will be removed.": ["سيتم حذف سجل الدفعة.", "भुगतान रिकॉर्ड हटाया जाएगा.", "L'enregistrement de paiement sera supprimé.", "El registro de pago será eliminado.", "付款记录将被删除。", "Ödeme kaydı kaldırılacak.", "O registo de pagamento será removido.", "Запись платежа будет удалена."],
  "Delete customs payment?": ["حذف الدفعة الجمركية؟", "कस्टम्स भुगतान हटाएँ?", "Supprimer le paiement douane ?", "¿Eliminar pago aduanero?", "删除海关付款？", "Gümrük ödemesi silinsin mi?", "Eliminar pagamento aduaneiro?", "Удалить таможенный платеж?"],
  "Party": ["طرف", "पार्टी", "Partie", "Parte", "相关方", "Taraf", "Parte", "Сторона"],
  "Party Type": ["نوع الطرف", "पार्टी प्रकार", "Type de partie", "Tipo de parte", "相关方类型", "Taraf türü", "Tipo de parte", "Тип стороны"],
  "Party Name": ["اسم الطرف", "पार्टी नाम", "Nom de la partie", "Nombre de la parte", "相关方名称", "Taraf adı", "Nome da parte", "Название стороны"],
  "Importer": ["المستورد", "आयातक", "Importateur", "Importador", "进口商", "İthalatçı", "Importador", "Импортер"],
  "Exporter": ["المصدر", "निर्यातक", "Exportateur", "Exportador", "出口商", "İhracatçı", "Exportador", "Экспортер"],
  "Notify Party": ["طرف الإخطار", "नोटिफाई पार्टी", "Partie à notifier", "Parte a notificar", "通知方", "İhbar tarafı", "Parte a notificar", "Уведомляемая сторона"],
  "Buyer": ["المشتري", "खरीदार", "Acheteur", "Comprador", "买方", "Alıcı", "Comprador", "Покупатель"],
  "Seller": ["البائع", "विक्रेता", "Vendeur", "Vendedor", "卖方", "Satıcı", "Vendedor", "Продавец"],
  "Customs Invoice": ["فاتورة جمركية", "कस्टम्स इनवॉइस", "Facture douanière", "Factura aduanera", "报关发票", "Gümrük faturası", "Fatura aduaneira", "Таможенный инвойс"],
  "Invoice Number": ["رقم الفاتورة", "इनवॉइस नंबर", "N° facture", "N.º factura", "发票号", "Fatura no", "N.º fatura", "№ счета"],
  "Invoice Date": ["تاريخ الفاتورة", "इनवॉइस दिनांक", "Date facture", "Fecha factura", "发票日期", "Fatura tarihi", "Data da fatura", "Дата счета"],
  "Invoice Amount": ["مبلغ الفاتورة", "इनवॉइस राशि", "Montant facture", "Importe factura", "发票金额", "Fatura tutarı", "Valor da fatura", "Сумма счета"],
  "Document Category": ["فئة المستند", "दस्तावेज़ श्रेणी", "Catégorie document", "Categoría documento", "文件类别", "Belge kategorisi", "Categoria do documento", "Категория документа"],
  "Document Name": ["اسم المستند", "दस्तावेज़ नाम", "Nom du document", "Nombre del documento", "文件名称", "Belge adı", "Nome do documento", "Название документа"],
  "Checklist Document Attachments": ["مرفقات مستند قائمة التحقق", "चेकलिस्ट दस्तावेज़ अटैचमेंट", "Pièces jointes du document de checklist", "Adjuntos del documento de checklist", "清单文件附件", "Kontrol listesi belge ekleri", "Anexos do documento de checklist", "Вложения документа контрольного списка"],
  "Attach and track required customs documents.": ["أرفق وتتبع المستندات الجمركية المطلوبة.", "आवश्यक कस्टम्स दस्तावेज़ संलग्न और ट्रैक करें.", "Joignez et suivez les documents douaniers requis.", "Adjunte y controle documentos aduaneros requeridos.", "上传并跟踪所需清关文件。", "Gerekli gümrük belgelerini ekleyip takip edin.", "Anexe e acompanhe os documentos aduaneiros obrigatórios.", "Прикрепляйте и отслеживайте необходимые таможенные документы."],
  "Attach files against the exact customs checklist document row. Each row keeps its own uploaded documents.": ["أرفق الملفات على صف مستند قائمة التحقق المحدد. لكل صف مستنداته المرفوعة.", "फ़ाइलों को सही कस्टम्स चेकलिस्ट दस्तावेज़ पंक्ति से जोड़ें। हर पंक्ति के अपने अपलोड दस्तावेज़ रहेंगे.", "Joignez les fichiers à la ligne exacte de checklist douane. Chaque ligne conserve ses propres documents.", "Adjunte archivos a la fila exacta de checklist aduanera. Cada fila conserva sus documentos.", "将文件附加到对应的清关文件清单行。每行保留自己的上传文件。", "Dosyaları ilgili gümrük kontrol listesi satırına ekleyin. Her satır kendi belgelerini saklar.", "Anexe ficheiros à linha exata da checklist aduaneira. Cada linha mantém os seus documentos.", "Прикрепляйте файлы к конкретной строке контрольного списка. Каждая строка хранит свои документы."],
  "These files are attached to this checklist document row only.": ["هذه الملفات مرفقة بهذا الصف فقط.", "ये फ़ाइलें केवल इस चेकलिस्ट दस्तावेज़ पंक्ति से जुड़ी हैं.", "Ces fichiers sont rattachés uniquement à cette ligne.", "Estos archivos están adjuntos solo a esta fila.", "这些文件仅附加到此清单行。", "Bu dosyalar yalnızca bu satıra eklenmiştir.", "Estes ficheiros estão anexados apenas a esta linha.", "Эти файлы прикреплены только к этой строке."],
  "Add customs document checklist rows first, then attach files to each document.": ["أضف صفوف قائمة المستندات الجمركية أولاً، ثم أرفق الملفات بكل مستند.", "पहले कस्टम्स दस्तावेज़ चेकलिस्ट पंक्तियाँ जोड़ें, फिर हर दस्तावेज़ में फ़ाइलें संलग्न करें.", "Ajoutez d'abord les lignes de checklist douane, puis joignez les fichiers.", "Primero agregue filas de checklist aduanera y luego adjunte archivos.", "请先添加清关文件清单行，再为每个文件上传附件。", "Önce gümrük belge kontrol satırlarını ekleyin, sonra dosyaları ekleyin.", "Adicione primeiro linhas da checklist aduaneira e depois anexe ficheiros.", "Сначала добавьте строки контрольного списка документов, затем прикрепите файлы."],
  "COMMERCIAL_INVOICE - Commercial Invoice": ["COMMERCIAL_INVOICE - فاتورة تجارية", "COMMERCIAL_INVOICE - कमर्शियल इनवॉइस", "COMMERCIAL_INVOICE - Facture commerciale", "COMMERCIAL_INVOICE - Factura comercial", "COMMERCIAL_INVOICE - 商业发票", "COMMERCIAL_INVOICE - Ticari fatura", "COMMERCIAL_INVOICE - Fatura comercial", "COMMERCIAL_INVOICE - Коммерческий инвойс"],
  "PACKING_LIST - Packing List": ["PACKING_LIST - قائمة التعبئة", "PACKING_LIST - पैकिंग लिस्ट", "PACKING_LIST - Liste de colisage", "PACKING_LIST - Lista de empaque", "PACKING_LIST - 装箱单", "PACKING_LIST - Çeki listesi", "PACKING_LIST - Lista de embalagem", "PACKING_LIST - Упаковочный лист"],
  "BILL_OF_LADING - Bill of Lading": ["BILL_OF_LADING - بوليصة الشحن", "BILL_OF_LADING - बिल ऑफ लाडिंग", "BILL_OF_LADING - Connaissement", "BILL_OF_LADING - Conocimiento de embarque", "BILL_OF_LADING - 提单", "BILL_OF_LADING - Konşimento", "BILL_OF_LADING - Conhecimento de embarque", "BILL_OF_LADING - Коносамент"],
  "AIR_WAYBILL - Air Waybill": ["AIR_WAYBILL - بوليصة شحن جوي", "AIR_WAYBILL - एयर वेबिल", "AIR_WAYBILL - Lettre de transport aérien", "AIR_WAYBILL - Guía aérea", "AIR_WAYBILL - 空运单", "AIR_WAYBILL - Havayolu konşimentosu", "AIR_WAYBILL - Guia aérea", "AIR_WAYBILL - Авианакладная"],
  "CERTIFICATE_OF_ORIGIN - Certificate of Origin": ["CERTIFICATE_OF_ORIGIN - شهادة المنشأ", "CERTIFICATE_OF_ORIGIN - मूल प्रमाणपत्र", "CERTIFICATE_OF_ORIGIN - Certificat d'origine", "CERTIFICATE_OF_ORIGIN - Certificado de origen", "CERTIFICATE_OF_ORIGIN - 原产地证", "CERTIFICATE_OF_ORIGIN - Menşe şahadetnamesi", "CERTIFICATE_OF_ORIGIN - Certificado de origem", "CERTIFICATE_OF_ORIGIN - Сертификат происхождения"],
  "CUSTOMS_DECLARATION - Customs Declaration": ["CUSTOMS_DECLARATION - إقرار جمركي", "CUSTOMS_DECLARATION - कस्टम्स घोषणा", "CUSTOMS_DECLARATION - Déclaration douanière", "CUSTOMS_DECLARATION - Declaración aduanera", "CUSTOMS_DECLARATION - 海关申报", "CUSTOMS_DECLARATION - Gümrük beyannamesi", "CUSTOMS_DECLARATION - Declaração aduaneira", "CUSTOMS_DECLARATION - Таможенная декларация"],
  "DUTY_RECEIPT - Duty Receipt": ["DUTY_RECEIPT - إيصال الرسوم", "DUTY_RECEIPT - ड्यूटी रसीद", "DUTY_RECEIPT - Reçu de droits", "DUTY_RECEIPT - Recibo de derechos", "DUTY_RECEIPT - 税费收据", "DUTY_RECEIPT - Vergi makbuzu", "DUTY_RECEIPT - Recibo de direitos", "DUTY_RECEIPT - Квитанция пошлины"],
  "OTHER - Other": ["OTHER - أخرى", "OTHER - अन्य", "OTHER - Autre", "OTHER - Otro", "OTHER - 其他", "OTHER - Diğer", "OTHER - Outro", "OTHER - Прочее"],
  "Inspection": ["معاينة جمركية", "निरीक्षण", "Inspection douanière", "Inspección aduanera", "海关查验", "Gümrük kontrolü", "Inspeção aduaneira", "Таможенный досмотр"],
  "Inspection Type": ["نوع المعاينة", "निरीक्षण प्रकार", "Type d'inspection", "Tipo de inspección", "查验类型", "Kontrol türü", "Tipo de inspeção", "Тип досмотра"],
  "Inspection Date": ["تاريخ المعاينة", "निरीक्षण दिनांक", "Date d'inspection", "Fecha de inspección", "查验日期", "Kontrol tarihi", "Data da inspeção", "Дата досмотра"],
  "Physical Inspection": ["معاينة فعلية", "भौतिक निरीक्षण", "Inspection physique", "Inspección física", "现场查验", "Fiziki kontrol", "Inspeção física", "Физический досмотр"],
  "Documentary Inspection": ["فحص مستندي", "दस्तावेज़ निरीक्षण", "Inspection documentaire", "Inspección documental", "单证查验", "Belge kontrolü", "Inspeção documental", "Документальная проверка"],
  "Scanner Inspection": ["فحص بالماسح", "स्कैनर निरीक्षण", "Inspection scanner", "Inspección por escáner", "机检查验", "Tarama kontrolü", "Inspeção por scanner", "Сканирование"],
  "Sampling": ["أخذ عينات", "सैंपलिंग", "Échantillonnage", "Muestreo", "抽样", "Numune alma", "Amostragem", "Отбор проб"],
  "Quarantine Inspection": ["فحص الحجر", "क्वारंटीन निरीक्षण", "Inspection quarantaine", "Inspección cuarentenaria", "检疫查验", "Karantina kontrolü", "Inspeção quarentenária", "Карантинный досмотр"],
  "Customs Query": ["استفسار جمركي", "कस्टम्स क्वेरी", "Requête douane", "Consulta aduanera", "海关问询", "Gümrük sorgusu", "Consulta aduaneira", "Таможенный запрос"],
  "Query": ["استفسار", "क्वेरी", "Requête", "Consulta", "查询", "Sorgu", "Consulta", "Запрос"],
  "Query Number": ["رقم الاستفسار", "क्वेरी नंबर", "N° requête", "N.º consulta", "查询号", "Sorgu no", "N.º consulta", "№ запроса"],
  "Query Date": ["تاريخ الاستفسار", "क्वेरी दिनांक", "Date requête", "Fecha consulta", "查询日期", "Sorgu tarihi", "Data da consulta", "Дата запроса"],
  "Query Text": ["نص الاستفسار", "क्वेरी विवरण", "Texte de requête", "Texto de consulta", "查询内容", "Sorgu metni", "Texto da consulta", "Текст запроса"],
  "Customs Status Update": ["تحديث حالة الجمارك", "कस्टम्स स्थिति अपडेट", "Mise à jour statut douane", "Actualizar estado aduanero", "海关状态更新", "Gümrük durumu güncelleme", "Atualização do estado aduaneiro", "Обновление таможенного статуса"],
  "Update customs workflow status with reason and remarks.": ["حدّث حالة سير العمل الجمركي مع السبب والملاحظات.", "कारण और टिप्पणी के साथ कस्टम्स वर्कफ़्लो स्थिति अपडेट करें.", "Mettez à jour le statut douane avec motif et remarques.", "Actualice el estado aduanero con motivo y observaciones.", "更新清关流程状态并填写原因和备注。", "Gerekçe ve açıklamayla gümrük iş akışı durumunu güncelleyin.", "Atualize o estado aduaneiro com motivo e observações.", "Обновите статус таможенного процесса с причиной и примечаниями."],
  "Customs status updated.": ["تم تحديث الحالة الجمركية.", "कस्टम्स स्थिति अपडेट हुई.", "Statut douane mis à jour.", "Estado aduanero actualizado.", "海关状态已更新。", "Gümrük durumu güncellendi.", "Estado aduaneiro atualizado.", "Таможенный статус обновлен."],
  "Save Customs Job": ["حفظ الملف الجمركي", "कस्टम्स जॉब सेव करें", "Enregistrer le dossier douane", "Guardar expediente aduanero", "保存清关作业", "Gümrük işini kaydet", "Guardar processo aduaneiro", "Сохранить таможенное дело"],
  "Update Customs Job": ["تحديث الملف الجمركي", "कस्टम्स जॉब अपडेट करें", "Mettre à jour le dossier douane", "Actualizar expediente aduanero", "更新清关作业", "Gümrük işini güncelle", "Atualizar processo aduaneiro", "Обновить таможенное дело"],
  "Update customs job and declaration details.": ["حدّث تفاصيل الملف الجمركي والإقرار.", "कस्टम्स जॉब और घोषणा विवरण अपडेट करें.", "Mettez à jour le dossier douane et la déclaration.", "Actualice el expediente y la declaración aduanera.", "更新清关作业和申报明细。", "Gümrük işi ve beyanname bilgilerini güncelleyin.", "Atualize o processo aduaneiro e a declaração.", "Обновите таможенное дело и декларацию."],
  "Loading customs clearance job...": ["جارٍ تحميل ملف التخليص الجمركي...", "कस्टम्स क्लीयरेंस जॉब लोड हो रहा है...", "Chargement du dossier de dédouanement...", "Cargando expediente aduanero...", "正在载入清关作业...", "Gümrükleme işi yükleniyor...", "A carregar processo aduaneiro...", "Загрузка таможенного дела..."],
  "Loading customs clearance...": ["جارٍ تحميل التخليص الجمركي...", "कस्टम्स क्लीयरेंस लोड हो रहा है...", "Chargement du dédouanement...", "Cargando despacho aduanero...", "正在载入清关...", "Gümrükleme yükleniyor...", "A carregar desalfandegamento...", "Загрузка таможенного оформления..."],
  "Loading customs job...": ["جارٍ تحميل الملف الجمركي...", "कस्टम्स जॉब लोड हो रहा है...", "Chargement du dossier douane...", "Cargando expediente aduanero...", "正在载入清关作业...", "Gümrük işi yükleniyor...", "A carregar processo aduaneiro...", "Загрузка таможенного дела..."],
  "This record will be soft deleted and removed from the customs job.": ["سيتم حذف هذا السجل حذفًا منطقيًا وإزالته من الملف الجمركي.", "यह रिकॉर्ड सॉफ्ट डिलीट होकर कस्टम्स जॉब से हट जाएगा.", "Cet enregistrement sera supprimé logiquement du dossier douane.", "Este registro se eliminará lógicamente del expediente aduanero.", "此记录将软删除并从清关作业移除。", "Bu kayıt soft delete yapılacak ve gümrük işinden kaldırılacak.", "Este registo será eliminado logicamente do processo aduaneiro.", "Эта запись будет мягко удалена из таможенного дела."],
  "The customs record was saved.": ["تم حفظ السجل الجمركي.", "कस्टम्स रिकॉर्ड सेव हुआ.", "Enregistrement douane sauvegardé.", "Registro aduanero guardado.", "海关记录已保存。", "Gümrük kaydı kaydedildi.", "Registo aduaneiro guardado.", "Таможенная запись сохранена."],
  "The customs record was removed.": ["تم حذف السجل الجمركي.", "कस्टम्स रिकॉर्ड हटाया गया.", "Enregistrement douane supprimé.", "Registro aduanero eliminado.", "海关记录已删除。", "Gümrük kaydı kaldırıldı.", "Registo aduaneiro removido.", "Таможенная запись удалена."],
  "added": ["تمت الإضافة", "जोड़ा गया", "ajouté", "agregado", "已添加", "eklendi", "adicionado", "добавлено"],
  "updated": ["تم التحديث", "अपडेट हुआ", "mis à jour", "actualizado", "已更新", "güncellendi", "atualizado", "обновлено"],
  "deleted": ["تم الحذف", "हटाया गया", "supprimé", "eliminado", "已删除", "silindi", "eliminado", "удалено"],
  "Saving...": ["جارٍ الحفظ...", "सेव हो रहा है...", "Enregistrement...", "Guardando...", "正在保存...", "Kaydediliyor...", "A guardar...", "Сохранение..."],
  "No records yet.": ["لا توجد سجلات بعد.", "अभी कोई रिकॉर्ड नहीं है.", "Aucun enregistrement pour le moment.", "Aún no hay registros.", "暂无记录。", "Henüz kayıt yok.", "Ainda não há registos.", "Записей пока нет."]
});

Object.assign(direct, {
  "Import": ["استيراد", "आयात", "Importation", "Importación", "进口", "İthalat", "Importação", "Импорт"],
  "Export": ["تصدير", "निर्यात", "Exportation", "Exportación", "出口", "İhracat", "Exportação", "Экспорт"],
  "Transit": ["عبور جمركي", "कस्टम्स ट्रांज़िट", "Transit douanier", "Tránsito aduanero", "海关转运", "Gümrük transiti", "Trânsito aduaneiro", "Таможенный транзит"],
  "ReExport": ["إعادة تصدير", "पुनः निर्यात", "Réexportation", "Reexportación", "复出口", "Yeniden ihracat", "Reexportação", "Реэкспорт"],
  "Incoterm": ["شرط إنكوترمز", "इन्कोटर्म", "Incoterm", "Incoterm", "贸易术语", "Incoterm", "Incoterm", "Инкотермс"],
  "incoterm": ["شرط إنكوترمز", "इन्कोटर्म", "Incoterm", "Incoterm", "贸易术语", "Incoterm", "Incoterm", "Инкотермс"],
  "Incoterms": ["شروط إنكوترمز", "इन्कोटर्म्स", "Incoterms", "Incoterms", "贸易术语", "Incoterms", "Incoterms", "Инкотермс"],
  "Select incoterm": ["اختر شرط الإنكوترمز", "इन्कोटर्म चुनें", "Sélectionner l'Incoterm", "Seleccionar Incoterm", "选择贸易术语", "Incoterm seçin", "Selecionar Incoterm", "Выберите Инкотермс"],
  "Online": ["إلكتروني", "ऑनलाइन", "En ligne", "En línea", "线上", "Çevrimiçi", "Online", "Онлайн"],
  "Cash": ["نقداً", "नकद", "Espèces", "Efectivo", "现金", "Nakit", "Dinheiro", "Наличные"],
  "Bank": ["بنك", "बैंक", "Banque", "Banco", "银行", "Banka", "Banco", "Банк"],
  "Cheque": ["شيك", "चेक", "Chèque", "Cheque", "支票", "Çek", "Cheque", "Чек"],
  "Other": ["أخرى", "अन्य", "Autre", "Otro", "其他", "Diğer", "Outro", "Другое"],
  "Search by name, code, or phone": ["ابحث بالاسم أو الرمز أو الهاتف", "नाम, कोड या फोन से खोजें", "Rechercher par nom, code ou téléphone", "Buscar por nombre, código o teléfono", "按名称、代码或电话搜索", "Ad, kod veya telefonla ara", "Pesquisar por nome, código ou telefone", "Поиск по имени, коду или телефону"]
});

Object.assign(direct, {
  "Job": ["ملف شحن", "जॉब", "Dossier", "Expediente", "作业", "İş dosyası", "Processo", "Дело"],
  "Jobs": ["ملفات الشحن", "जॉब", "Dossiers", "Expedientes", "作业", "İş dosyaları", "Processos", "Дела"],
  "Job Type": ["نوع الملف", "जॉब प्रकार", "Type de dossier", "Tipo de expediente", "作业类型", "İş türü", "Tipo de processo", "Тип дела"],
  "job type": ["نوع الملف", "जॉब प्रकार", "type de dossier", "tipo de expediente", "作业类型", "iş türü", "tipo de processo", "тип дела"],
  "All Job Types": ["كل أنواع الملفات", "सभी जॉब प्रकार", "Tous les types de dossier", "Todos los tipos de expediente", "所有作业类型", "Tüm iş türleri", "Todos os tipos de processo", "Все типы дел"],
  "Select job type": ["اختر نوع الملف", "जॉब प्रकार चुनें", "Sélectionner le type de dossier", "Seleccionar tipo de expediente", "选择作业类型", "İş türü seçin", "Selecionar tipo de processo", "Выберите тип дела"],
  "Description": ["الوصف", "विवरण", "Description", "Descripción", "描述", "Açıklama", "Descrição", "Описание"],
  "description": ["الوصف", "विवरण", "description", "descripción", "描述", "açıklama", "descrição", "описание"],
  "Job description": ["وصف ملف الشحن", "जॉब विवरण", "Description du dossier", "Descripción del expediente", "作业描述", "İş açıklaması", "Descrição do processo", "Описание дела"],
  "Create Job": ["إنشاء ملف شحن", "जॉब बनाएं", "Créer un dossier", "Crear expediente", "创建作业", "İş dosyası oluştur", "Criar processo", "Создать дело"],
  "Create a job and generate the job number automatically.": ["أنشئ ملف شحن وسيتم توليد رقم الملف تلقائياً.", "जॉब बनाएं और जॉब नंबर अपने आप जनरेट करें।", "Créer un dossier et générer automatiquement son numéro.", "Cree un expediente y genere automáticamente el número.", "创建作业并自动生成作业编号。", "İş dosyası oluşturun ve iş numarasını otomatik üretin.", "Crie um processo e gere automaticamente o número.", "Создайте дело, и номер будет сформирован автоматически."],
  "Job created": ["تم إنشاء ملف الشحن", "जॉब बनाया गया", "Dossier créé", "Expediente creado", "作业已创建", "İş oluşturuldu", "Processo criado", "Дело создано"],
  "New Job": ["ملف شحن جديد", "नया जॉब", "Nouveau dossier", "Nuevo expediente", "新建作业", "Yeni iş dosyası", "Novo processo", "Новое дело"],
  "Save Job": ["حفظ ملف الشحن", "जॉब सहेजें", "Enregistrer le dossier", "Guardar expediente", "保存作业", "İşi kaydet", "Guardar processo", "Сохранить дело"],
  "Edit Job": ["تعديل ملف الشحن", "जॉब संपादित करें", "Modifier le dossier", "Editar expediente", "编辑作业", "İşi düzenle", "Editar processo", "Изменить дело"],
  "Delete Job": ["حذف ملف الشحن", "जॉब हटाएं", "Supprimer le dossier", "Eliminar expediente", "删除作业", "İşi sil", "Eliminar processo", "Удалить дело"],
  "Job updated": ["تم تحديث ملف الشحن", "जॉब अपडेट हुआ", "Dossier mis à jour", "Expediente actualizado", "作业已更新", "İş güncellendi", "Processo atualizado", "Дело обновлено"],
  "Update job type, description, and status.": ["حدّث نوع الملف والوصف والحالة.", "जॉब प्रकार, विवरण और स्थिति अपडेट करें।", "Mettre à jour le type de dossier, la description et le statut.", "Actualice el tipo de expediente, la descripción y el estado.", "更新作业类型、描述和状态。", "İş türünü, açıklamayı ve durumu güncelleyin.", "Atualize o tipo de processo, a descrição e o estado.", "Обновите тип дела, описание и статус."],
  "Manage customs clearance job records. Numbers follow JB-JobTypeShortCode-DDmmYY-Sequence.": ["إدارة ملفات التخليص الجمركي. تتبع الأرقام الصيغة JB-رمز نوع الملف-DDmmYY-تسلسل.", "कस्टम्स क्लीयरेंस जॉब रिकॉर्ड प्रबंधित करें। नंबर JB-JobTypeShortCode-DDmmYY-Sequence प्रारूप का पालन करते हैं।", "Gérer les dossiers de dédouanement. Les numéros suivent le format JB-CodeTypeDossier-DDmmYY-Séquence.", "Gestione expedientes de despacho aduanero. Los números siguen el formato JB-CódigoTipo-DDmmYY-Secuencia.", "管理清关作业记录。编号格式为 JB-作业类型短码-DDmmYY-序号。", "Gümrükleme iş kayıtlarını yönetin. Numaralar JB-İşTürüKısaKodu-DDmmYY-Sıra formatındadır.", "Gerir processos de desalfandegamento. Os números seguem JB-CódigoTipo-DDmmYY-Sequência.", "Управляйте таможенными делами. Нумерация: JB-КодТипа-DDmmYY-Порядок."]
});

Object.assign(direct, {
  "Master": ["رئيسية", "मास्टर", "Master", "Master", "主单", "Master", "Master", "Мастер"],
  "master": ["رئيسية", "मास्टर", "master", "master", "主单", "master", "master", "мастер"],
  "Master Shipment": ["شحنة رئيسية", "मास्टर शिपमेंट", "Expédition master", "Envío master", "主单货运", "Master sevkiyat", "Envio master", "Мастер-отправка"],
  "Master Shipments": ["الشحنات الرئيسية", "मास्टर शिपमेंट", "Expéditions master", "Envíos master", "主单货运", "Master sevkiyatlar", "Envios master", "Мастер-отправки"],
  "New Master Shipment": ["شحنة رئيسية جديدة", "नया मास्टर शिपमेंट", "Nouvelle expédition master", "Nuevo envío master", "新建主单货运", "Yeni master sevkiyat", "Novo envio master", "Новая мастер-отправка"],
  "Edit Master Shipment": ["تعديل الشحنة الرئيسية", "मास्टर शिपमेंट संपादित करें", "Modifier l'expédition master", "Editar envío master", "编辑主单货运", "Master sevkiyatı düzenle", "Editar envio master", "Изменить мастер-отправку"],
  "View Master Shipment": ["عرض الشحنة الرئيسية", "मास्टर शिपमेंट देखें", "Voir l'expédition master", "Ver envío master", "查看主单货运", "Master sevkiyatı görüntüle", "Ver envio master", "Просмотр мастер-отправки"],
  "Master No": ["رقم الشحنة الرئيسية", "मास्टर नंबर", "N° master", "N.º master", "主单号", "Master no", "N.º master", "№ мастера"],
  "Master Waybill": ["بوليصة الشحن الرئيسية", "मास्टर वेबिल", "Lettre de transport master", "Guía master", "主运单", "Master konşimento", "Guia master", "Мастер-накладная"],
  "Master Waybill No": ["رقم بوليصة الشحن الرئيسية", "मास्टर वेबिल नंबर", "N° lettre de transport master", "N.º guía master", "主运单号", "Master konşimento no", "N.º guia master", "№ мастер-накладной"],
  "MAWB": ["MAWB", "MAWB", "MAWB", "MAWB", "MAWB", "MAWB", "MAWB", "MAWB"],
  "MBL": ["MBL", "MBL", "MBL", "MBL", "MBL", "MBL", "MBL", "MBL"],
  "MAWB/MBL": ["MAWB/MBL", "MAWB/MBL", "MAWB/MBL", "MAWB/MBL", "MAWB/MBL", "MAWB/MBL", "MAWB/MBL", "MAWB/MBL"],
  "Carrier": ["الناقل", "कैरियर", "Transporteur", "Transportista", "承运人", "Taşıyıcı", "Transportador", "Перевозчик"],
  "Flight": ["رحلة", "फ्लाइट", "Vol", "Vuelo", "航班", "Uçuş", "Voo", "Рейс"],
  "Flight No": ["رقم الرحلة", "फ्लाइट नंबर", "N° vol", "N.º vuelo", "航班号", "Uçuş no", "N.º voo", "№ рейса"],
  "Vessel": ["السفينة", "वेसल", "Navire", "Buque", "船名", "Gemi", "Navio", "Судно"],
  "Voyage No": ["رقم الرحلة البحرية", "वॉयेज नंबर", "N° voyage", "N.º viaje", "航次号", "Sefer no", "N.º viagem", "№ рейса судна"],
  "Truck": ["الشاحنة", "ट्रक", "Camion", "Camión", "卡车", "Kamyon", "Camião", "Грузовик"],
  "Truck No": ["رقم الشاحنة", "ट्रक नंबर", "N° camion", "N.º camión", "卡车号", "Kamyon no", "N.º camião", "№ грузовика"],
  "Container": ["الحاوية", "कंटेनर", "Conteneur", "Contenedor", "集装箱", "Konteyner", "Contentor", "Контейнер"],
  "Container No": ["رقم الحاوية", "कंटेनर नंबर", "N° conteneur", "N.º contenedor", "集装箱号", "Konteyner no", "N.º contentor", "№ контейнера"],
  "Origin Port": ["ميناء المغادرة", "मूल पोर्ट", "Port d'origine", "Puerto de origen", "起运港", "Çıkış limanı", "Porto de origem", "Порт отправления"],
  "Destination Port": ["ميناء الوصول", "गंतव्य पोर्ट", "Port de destination", "Puerto de destino", "目的港", "Varış limanı", "Porto de destino", "Порт назначения"],
  "ETD": ["ETD", "ETD", "ETD", "ETD", "ETD", "ETD", "ETD", "ETD"],
  "ETA": ["ETA", "ETA", "ETA", "ETA", "ETA", "ETA", "ETA", "ETA"],
  "Manifest": ["المانيفست", "मैनिफेस्ट", "Manifeste", "Manifiesto", "舱单", "Manifesto", "Manifesto", "Манифест"],
  "Print Manifest": ["طباعة المانيفست", "मैनिफेस्ट प्रिंट करें", "Imprimer le manifeste", "Imprimir manifiesto", "打印舱单", "Manifestoyu yazdır", "Imprimir manifesto", "Печать манифеста"],
  "Manifest PDF": ["ملف PDF للمانيفست", "मैनिफेस्ट PDF", "PDF du manifeste", "PDF del manifiesto", "舱单 PDF", "Manifesto PDF", "PDF do manifesto", "PDF манифеста"],
  "Consolidation": ["تجميع الشحنات", "कंसॉलिडेशन", "Consolidation", "Consolidación", "拼箱/集运", "Konsolidasyon", "Consolidação", "Консолидация"],
  "Consolidation Report": ["تقرير تجميع الشحنات", "कंसॉलिडेशन रिपोर्ट", "Rapport de consolidation", "Informe de consolidación", "集运报告", "Konsolidasyon raporu", "Relatório de consolidação", "Отчет по консолидации"],
  "Master Shipment Consolidation Report": ["تقرير تجميع الشحنة الرئيسية", "मास्टर शिपमेंट कंसॉलिडेशन रिपोर्ट", "Rapport de consolidation de l'expédition master", "Informe de consolidación del envío master", "主单货运集运报告", "Master sevkiyat konsolidasyon raporu", "Relatório de consolidação do envio master", "Отчет консолидации мастер-отправки"],
  "House Shipment": ["شحنة فرعية", "हाउस शिपमेंट", "Expédition house", "Envío house", "分单货运", "House sevkiyat", "Envio house", "House-отправка"],
  "House Shipments": ["الشحنات الفرعية", "हाउस शिपमेंट", "Expéditions house", "Envíos house", "分单货运", "House sevkiyatlar", "Envios house", "House-отправки"],
  "House Waybill No": ["رقم بوليصة الشحن الفرعية", "हाउस वेबिल नंबर", "N° lettre de transport house", "N.º guía house", "分运单号", "House konşimento no", "N.º guia house", "№ house-накладной"],
  "Assign House Shipment": ["إسناد شحنة فرعية", "हाउस शिपमेंट असाइन करें", "Affecter une expédition house", "Asignar envío house", "分配分单货运", "House sevkiyat ata", "Atribuir envio house", "Назначить house-отправку"],
  "Assign House Shipments": ["إسناد الشحنات الفرعية", "हाउस शिपमेंट असाइन करें", "Affecter les expéditions house", "Asignar envíos house", "分配分单货运", "House sevkiyatları ata", "Atribuir envios house", "Назначить house-отправки"],
  "Load From GRN": ["تحميل من إشعار استلام البضائع", "GRN से लोड करें", "Charger depuis le bon de réception", "Cargar desde GRN", "从收货单载入", "GRN'den yükle", "Carregar a partir da GRN", "Загрузить из GRN"],
  "Assign GRN": ["إسناد إشعار استلام البضائع", "GRN असाइन करें", "Affecter le bon de réception", "Asignar GRN", "分配收货单", "GRN ata", "Atribuir GRN", "Назначить GRN"],
  "Available Pieces": ["القطع المتاحة", "उपलब्ध पीस", "Colis disponibles", "Piezas disponibles", "可用件数", "Mevcut parça", "Peças disponíveis", "Доступные места"],
  "Available Weight": ["الوزن المتاح", "उपलब्ध वजन", "Poids disponible", "Peso disponible", "可用重量", "Mevcut ağırlık", "Peso disponível", "Доступный вес"],
  "Available Volume": ["الحجم المتاح", "उपलब्ध वॉल्यूम", "Volume disponible", "Volumen disponible", "可用体积", "Mevcut hacim", "Volume disponível", "Доступный объем"],
  "Consolidated Pieces": ["القطع المجمعة", "कंसॉलिडेटेड पीस", "Colis consolidés", "Piezas consolidadas", "已集运件数", "Konsolide parça", "Peças consolidadas", "Консолидированные места"],
  "Consolidated Weight": ["الوزن المجمع", "कंसॉलिडेटेड वजन", "Poids consolidé", "Peso consolidado", "已集运重量", "Konsolide ağırlık", "Peso consolidado", "Консолидированный вес"],
  "Consolidated Volume": ["الحجم المجمع", "कंसॉलिडेटेड वॉल्यूम", "Volume consolidé", "Volumen consolidado", "已集运体积", "Konsolide hacim", "Volume consolidado", "Консолидированный объем"],
  "Cost Allocation": ["توزيع التكلفة", "लागत आवंटन", "Répartition des coûts", "Asignación de costes", "成本分摊", "Maliyet dağıtımı", "Alocação de custos", "Распределение затрат"],
  "Cost Allocation Method": ["طريقة توزيع التكلفة", "लागत आवंटन विधि", "Méthode de répartition des coûts", "Método de asignación de costes", "成本分摊方法", "Maliyet dağıtım yöntemi", "Método de alocação de custos", "Метод распределения затрат"],
  "Manual Allocation": ["توزيع يدوي", "मैनुअल आवंटन", "Répartition manuelle", "Asignación manual", "手动分摊", "Manuel dağıtım", "Alocação manual", "Ручное распределение"],
  "Master Shipment Profit & Loss": ["أرباح وخسائر الشحنة الرئيسية", "मास्टर शिपमेंट लाभ और हानि", "Profit et perte de l'expédition master", "Pérdidas y ganancias del envío master", "主单货运损益", "Master sevkiyat kar zarar", "Lucros e perdas do envio master", "Прибыль и убыток мастер-отправки"],
  "Allocated invoice and bill profitability by source.": ["ربحية الفواتير وفواتير الموردين الموزعة حسب المصدر.", "स्रोत के अनुसार आवंटित इनवॉइस और बिल लाभप्रदता।", "Rentabilité des factures client et fournisseur répartie par source.", "Rentabilidad de facturas y bills asignada por origen.", "按来源分摊的发票和账单利润。", "Kaynağa göre dağıtılmış fatura ve gider karlılığı.", "Rentabilidade de faturas e contas alocada por origem.", "Рентабельность счетов и bills по источнику."],
  "Master Shipment Invoices": ["فواتير الشحنة الرئيسية", "मास्टर शिपमेंट इनवॉइस", "Factures de l'expédition master", "Facturas del envío master", "主单货运发票", "Master sevkiyat faturaları", "Faturas do envio master", "Счета мастер-отправки"],
  "Master Shipment Vendor Bills": ["فواتير موردي الشحنة الرئيسية", "मास्टर शिपमेंट वेंडर बिल", "Factures fournisseurs de l'expédition master", "Bills de proveedor del envío master", "主单货运供应商账单", "Master sevkiyat tedarikçi faturaları", "Contas de fornecedor do envio master", "Счета поставщиков мастер-отправки"],
  "Create Invoice": ["إنشاء فاتورة", "इनवॉइस बनाएं", "Créer une facture", "Crear factura", "创建发票", "Fatura oluştur", "Criar fatura", "Создать счет"],
  "Create Bill": ["إنشاء فاتورة مورد", "बिल बनाएं", "Créer une facture fournisseur", "Crear bill de proveedor", "创建供应商账单", "Gider faturası oluştur", "Criar conta de fornecedor", "Создать счет поставщика"],
  "Finance Status": ["الحالة المالية", "वित्त स्थिति", "Statut financier", "Estado financiero", "财务状态", "Finans durumu", "Estado financeiro", "Финансовый статус"],
  "Invoice Defined": ["تم تعريف الفاتورة", "इनवॉइस परिभाषित", "Facture définie", "Factura definida", "已定义发票", "Fatura tanımlı", "Fatura definida", "Счет создан"],
  "Bill Defined": ["تم تعريف فاتورة المورد", "बिल परिभाषित", "Facture fournisseur définie", "Bill definido", "已定义供应商账单", "Gider faturası tanımlı", "Conta definida", "Счет поставщика создан"],
  "Invoice Fully Received": ["تم تحصيل الفاتورة بالكامل", "इनवॉइस पूरी तरह प्राप्त", "Facture entièrement encaissée", "Factura totalmente cobrada", "发票已全额收款", "Fatura tamamen tahsil edildi", "Fatura totalmente recebida", "Счет полностью оплачен клиентом"],
  "Bill Fully Paid": ["تم دفع فاتورة المورد بالكامل", "बिल पूरी तरह भुगतान", "Facture fournisseur entièrement payée", "Bill totalmente pagado", "供应商账单已全额付款", "Gider faturası tamamen ödendi", "Conta totalmente paga", "Счет поставщика полностью оплачен"],
  "Invoice Cancelled": ["الفاتورة ملغاة", "इनवॉइस रद्द", "Facture annulée", "Factura cancelada", "发票已取消", "Fatura iptal edildi", "Fatura cancelada", "Счет отменен"],
  "Bill Cancelled": ["فاتورة المورد ملغاة", "बिल रद्द", "Facture fournisseur annulée", "Bill cancelado", "供应商账单已取消", "Gider faturası iptal edildi", "Conta cancelada", "Счет поставщика отменен"],
  "Pending Invoice To Post": ["فواتير بانتظار الترحيل", "पोस्ट हेतु लंबित इनवॉइस", "Factures en attente de comptabilisation", "Facturas pendientes de contabilizar", "待过账发票", "Muhasebeye aktarılacak fatura", "Faturas pendentes de lançamento", "Счета ожидают проводки"],
  "Pending Bill To Post": ["فواتير موردين بانتظار الترحيل", "पोस्ट हेतु लंबित बिल", "Factures fournisseurs en attente de comptabilisation", "Bills pendientes de contabilizar", "待过账供应商账单", "Muhasebeye aktarılacak gider faturası", "Contas pendentes de lançamento", "Счета поставщиков ожидают проводки"],
  "Unpaid Invoice": ["فاتورة غير محصلة", "अवैतनिक इनवॉइस", "Facture non encaissée", "Factura no cobrada", "未收款发票", "Tahsil edilmemiş fatura", "Fatura por receber", "Неоплаченный клиентский счет"],
  "Unpaid Bill": ["فاتورة مورد غير مدفوعة", "अवैतनिक बिल", "Facture fournisseur impayée", "Bill no pagado", "未付款供应商账单", "Ödenmemiş gider faturası", "Conta por pagar", "Неоплаченный счет поставщика"],
  "Profit & Loss": ["الأرباح والخسائر", "लाभ और हानि", "Profit et perte", "Pérdidas y ganancias", "损益", "Kar ve zarar", "Lucros e perdas", "Прибыль и убыток"],
  "Master shipment created.": ["تم إنشاء الشحنة الرئيسية.", "मास्टर शिपमेंट बनाया गया।", "Expédition master créée.", "Envío master creado.", "主单货运已创建。", "Master sevkiyat oluşturuldu.", "Envio master criado.", "Мастер-отправка создана."],
  "Master shipment updated.": ["تم تحديث الشحنة الرئيسية.", "मास्टर शिपमेंट अपडेट हुआ।", "Expédition master mise à jour.", "Envío master actualizado.", "主单货运已更新。", "Master sevkiyat güncellendi.", "Envio master atualizado.", "Мастер-отправка обновлена."],
  "Create master shipment and consolidate house shipments.": ["أنشئ شحنة رئيسية واجمع الشحنات الفرعية.", "मास्टर शिपमेंट बनाएं और हाउस शिपमेंट कंसॉलिडेट करें।", "Créer une expédition master et consolider les expéditions house.", "Crear envío master y consolidar envíos house.", "创建主单货运并合并分单货运。", "Master sevkiyat oluşturun ve house sevkiyatları konsolide edin.", "Criar envio master e consolidar envios house.", "Создайте мастер-отправку и консолидируйте house-отправки."],
  "Update master shipment details and schedule.": ["حدّث تفاصيل وجدول الشحنة الرئيسية.", "मास्टर शिपमेंट विवरण और शेड्यूल अपडेट करें।", "Mettre à jour les détails et le planning de l'expédition master.", "Actualizar detalles y programación del envío master.", "更新主单货运明细和计划。", "Master sevkiyat detaylarını ve programını güncelleyin.", "Atualizar detalhes e programação do envio master.", "Обновите данные и расписание мастер-отправки."],
  "Consolidation, manifest, and cost allocation for master shipments.": ["تجميع الشحنات والمانيفست وتوزيع التكلفة للشحنات الرئيسية.", "मास्टर शिपमेंट के लिए कंसॉलिडेशन, मैनिफेस्ट और लागत आवंटन।", "Consolidation, manifeste et répartition des coûts des expéditions master.", "Consolidación, manifiesto y asignación de costes para envíos master.", "主单货运的集运、舱单和成本分摊。", "Master sevkiyatlar için konsolidasyon, manifesto ve maliyet dağıtımı.", "Consolidação, manifesto e alocação de custos para envios master.", "Консолидация, манифест и распределение затрат для мастер-отправок."],
  "House shipment consolidation report for this master shipment.": ["تقرير تجميع الشحنات الفرعية لهذه الشحنة الرئيسية.", "इस मास्टर शिपमेंट के लिए हाउस शिपमेंट कंसॉलिडेशन रिपोर्ट।", "Rapport de consolidation des expéditions house pour cette expédition master.", "Informe de consolidación de envíos house para este envío master.", "此主单货运的分单集运报告。", "Bu master sevkiyat için house sevkiyat konsolidasyon raporu.", "Relatório de consolidação de envios house para este envio master.", "Отчет консолидации house-отправок для этой мастер-отправки."],
  "Master shipment manifest with consolidated item details.": ["مانيفست الشحنة الرئيسية مع تفاصيل البنود المجمعة.", "कंसॉलिडेटेड आइटम विवरण सहित मास्टर शिपमेंट मैनिफेस्ट।", "Manifeste de l'expédition master avec détails des articles consolidés.", "Manifiesto del envío master con detalles consolidados.", "含合并项目明细的主单货运舱单。", "Konsolide kalem detaylarıyla master sevkiyat manifestosu.", "Manifesto do envio master com detalhes dos itens consolidados.", "Манифест мастер-отправки с деталями консолидированных позиций."],
  "Master Shipment Document": ["مستند الشحنة الرئيسية", "मास्टर शिपमेंट दस्तावेज़", "Document de l'expédition master", "Documento de envío master", "主单货运文件", "Master sevkiyat belgesi", "Documento do envio master", "Документ мастер-отправки"],
  "No documents uploaded for this master shipment.": ["لم يتم رفع مستندات لهذه الشحنة الرئيسية.", "इस मास्टर शिपमेंट के लिए कोई दस्तावेज़ अपलोड नहीं है।", "Aucun document téléversé pour cette expédition master.", "No hay documentos cargados para este envío master.", "此主单货运未上传文件。", "Bu master sevkiyat için belge yüklenmedi.", "Nenhum documento carregado para este envio master.", "Для этой мастер-отправки документы не загружены."],
  "Loading master shipment...": ["جارٍ تحميل الشحنة الرئيسية...", "मास्टर शिपमेंट लोड हो रहा है...", "Chargement de l'expédition master...", "Cargando envío master...", "正在载入主单货运...", "Master sevkiyat yükleniyor...", "A carregar envio master...", "Загрузка мастер-отправки..."],
  "Loading manifest preview...": ["جارٍ تحميل معاينة المانيفست...", "मैनिफेस्ट पूर्वावलोकन लोड हो रहा है...", "Chargement de l'aperçu du manifeste...", "Cargando vista previa del manifiesto...", "正在载入舱单预览...", "Manifesto önizlemesi yükleniyor...", "A carregar pré-visualização do manifesto...", "Загрузка предварительного просмотра манифеста..."],
  "Loading profit and loss report...": ["جارٍ تحميل تقرير الأرباح والخسائر...", "लाभ और हानि रिपोर्ट लोड हो रही है...", "Chargement du rapport de profit et perte...", "Cargando informe de pérdidas y ganancias...", "正在载入损益报告...", "Kar zarar raporu yükleniyor...", "A carregar relatório de lucros e perdas...", "Загрузка отчета о прибыли и убытках..."],
  "Unable to load master shipment profit and loss report.": ["تعذر تحميل تقرير أرباح وخسائر الشحنة الرئيسية.", "मास्टर शिपमेंट लाभ और हानि रिपोर्ट लोड नहीं हो सकी।", "Impossible de charger le rapport de profit et perte de l'expédition master.", "No se pudo cargar el informe de pérdidas y ganancias del envío master.", "无法载入主单货运损益报告。", "Master sevkiyat kar zarar raporu yüklenemedi.", "Não foi possível carregar o relatório de lucros e perdas do envio master.", "Не удалось загрузить отчет о прибыли и убытках мастер-отправки."],
  "Branch": ["الفرع", "शाखा", "Agence", "Sucursal", "分支机构", "Şube", "Filial", "Филиал"],
  "Sample Address Line 1, City, Country": ["عنوان تجريبي سطر 1، المدينة، الدولة", "नमूना पता पंक्ति 1, शहर, देश", "Adresse exemple ligne 1, ville, pays", "Dirección de ejemplo línea 1, ciudad, país", "示例地址第 1 行，城市，国家", "Örnek adres satırı 1, şehir, ülke", "Linha de endereço exemplo 1, cidade, país", "Пример адреса, строка 1, город, страна"],
  "Master Ref": ["مرجع الشحنة الرئيسية", "मास्टर संदर्भ", "Réf. master", "Ref. master", "主单参考", "Master ref.", "Ref. master", "Ссылка мастера"],
  "Invoices for": ["فواتير لـ", "इनवॉइस हेतु", "Factures pour", "Facturas de", "发票对象", "Faturalar:", "Faturas de", "Счета для"],
  "Expense bills for": ["فواتير المصروفات لـ", "व्यय बिल हेतु", "Factures de frais pour", "Bills de gastos de", "费用账单对象", "Gider faturaları:", "Contas de despesa de", "Расходные счета для"],
  "Cancelled from master shipment bills page": ["تم الإلغاء من صفحة فواتير موردي الشحنة الرئيسية", "मास्टर शिपमेंट बिल पेज से रद्द किया गया", "Annulé depuis la page des factures fournisseurs master", "Cancelado desde la página de bills del envío master", "从主单货运供应商账单页面取消", "Master sevkiyat gider faturaları sayfasından iptal edildi", "Cancelado a partir da página de contas do envio master", "Отменено со страницы счетов поставщиков мастер-отправки"],
  "Totals": ["الإجماليات", "कुल", "Totaux", "Totales", "合计", "Toplamlar", "Totais", "Итоги"],
  "Source": ["المصدر", "स्रोत", "Source", "Origen", "来源", "Kaynak", "Origem", "Источник"],
  "L": ["الطول", "लंबाई", "L", "L", "长", "U", "C", "Д"],
  "W": ["العرض", "चौड़ाई", "l", "A", "宽", "G", "L", "Ш"],
  "H": ["الارتفاع", "ऊंचाई", "H", "H", "高", "Y", "A", "В"],
  "CBM": ["CBM", "CBM", "CBM", "CBM", "CBM", "CBM", "CBM", "CBM"],
  "to": ["إلى", "से", "à", "a", "至", "ile", "para", "в"]
});

Object.assign(direct, {
  "Mode of Transport": ["وسيلة النقل", "परिवहन का तरीका", "Mode de transport", "Modo de transporte", "运输方式", "Taşıma modu", "Modo de transporte", "Вид транспорта"],
  "Flight": ["رحلة جوية", "फ्लाइट", "Vol", "Vuelo", "航班", "Uçuş", "Voo", "Рейс"],
  "ETD": ["ETD - وقت المغادرة المتوقع", "ETD - अपेक्षित प्रस्थान", "ETD - départ estimé", "ETD - salida estimada", "ETD - 预计离港", "ETD - tahmini çıkış", "ETD - partida estimada", "ETD - расчетное отправление"],
  "ETA": ["ETA - وقت الوصول المتوقع", "ETA - अपेक्षित आगमन", "ETA - arrivée estimée", "ETA - llegada estimada", "ETA - 预计到达", "ETA - tahmini varış", "ETA - chegada estimada", "ETA - расчетное прибытие"],
  "ETD - Expected Time of Departure": ["ETD - وقت المغادرة المتوقع", "ETD - अपेक्षित प्रस्थान समय", "ETD - heure estimée de départ", "ETD - hora estimada de salida", "ETD - 预计离港时间", "ETD - tahmini kalkış zamanı", "ETD - hora estimada de partida", "ETD - расчетное время отправления"],
  "ETA - Expected Time of Arrival": ["ETA - وقت الوصول المتوقع", "ETA - अपेक्षित आगमन समय", "ETA - heure estimée d'arrivée", "ETA - hora estimada de llegada", "ETA - 预计到达时间", "ETA - tahmini varış zamanı", "ETA - hora estimada de chegada", "ETA - расчетное время прибытия"],
  "Total Cost": ["إجمالي التكلفة", "कुल लागत", "Coût total", "Coste total", "总成本", "Toplam maliyet", "Custo total", "Итоговая стоимость"],
  "House Shipment Assignment": ["إسناد الشحنات الفرعية", "हाउस शिपमेंट असाइनमेंट", "Affectation des expéditions house", "Asignación de envíos house", "分单货运分配", "House sevkiyat atama", "Atribuição de envios house", "Назначение house-отправок"],
  "GRN - Goods Received Note": ["GRN - إشعار استلام البضائع", "GRN - माल प्राप्ति नोट", "GRN - Bon de réception marchandises", "GRN - Nota de recepción de mercancías", "GRN - 货物收货单", "GRN - Mal kabul fişi", "GRN - Nota de receção de mercadorias", "GRN - Акт приемки груза"],
  "Load From GRN": ["تحميل من GRN - إشعار استلام البضائع", "GRN - माल प्राप्ति नोट से लोड करें", "Charger depuis GRN - bon de réception", "Cargar desde GRN - nota de recepción", "从 GRN - 货物收货单载入", "GRN - mal kabul fişinden yükle", "Carregar a partir da GRN - nota de receção", "Загрузить из GRN - акта приемки"],
  "Assign GRN": ["إسناد GRN - إشعار استلام البضائع", "GRN - माल प्राप्ति नोट असाइन करें", "Affecter GRN - bon de réception", "Asignar GRN - nota de recepción", "分配 GRN - 货物收货单", "GRN - mal kabul fişi ata", "Atribuir GRN - nota de receção", "Назначить GRN - акт приемки"]
});

Object.assign(direct, {
  "Customer Invoice": ["فاتورة العميل", "ग्राहक इनवॉइस", "Facture client", "Factura de cliente", "客户发票", "Müşteri faturası", "Fatura de cliente", "Счет клиента"],
  "Customer Invoices": ["فواتير العملاء", "ग्राहक इनवॉइस", "Factures client", "Facturas de cliente", "客户发票", "Müşteri faturaları", "Faturas de cliente", "Счета клиентов"],
  "Invoice": ["فاتورة العميل", "इनवॉइस", "Facture client", "Factura", "发票", "Fatura", "Fatura", "Счет"],
  "Invoices": ["فواتير العملاء", "इनवॉइस", "Factures client", "Facturas", "发票", "Faturalar", "Faturas", "Счета"],
  "New Invoice": ["فاتورة عميل جديدة", "नया इनवॉइस", "Nouvelle facture client", "Nueva factura", "新建发票", "Yeni fatura", "Nova fatura", "Новый счет"],
  "Create Invoice": ["إنشاء فاتورة عميل", "इनवॉइस बनाएं", "Créer une facture client", "Crear factura", "创建发票", "Fatura oluştur", "Criar fatura", "Создать счет"],
  "Edit Invoice": ["تعديل فاتورة العميل", "इनवॉइस संपादित करें", "Modifier la facture client", "Editar factura", "编辑发票", "Faturayı düzenle", "Editar fatura", "Изменить счет"],
  "Save Invoice": ["حفظ فاتورة العميل", "इनवॉइस सहेजें", "Enregistrer la facture client", "Guardar factura", "保存发票", "Faturayı kaydet", "Guardar fatura", "Сохранить счет"],
  "Invoice No": ["رقم الفاتورة", "इनवॉइस नंबर", "N° facture", "N.º factura", "发票号", "Fatura no", "N.º fatura", "№ счета"],
  "Invoice Number": ["رقم الفاتورة", "इनवॉइस संख्या", "Numéro de facture", "Número de factura", "发票编号", "Fatura numarası", "Número da fatura", "Номер счета"],
  "Invoice Date": ["تاريخ الفاتورة", "इनवॉइस दिनांक", "Date de facture", "Fecha de factura", "发票日期", "Fatura tarihi", "Data da fatura", "Дата счета"],
  "Due Date": ["تاريخ الاستحقاق", "देय तिथि", "Date d'échéance", "Fecha de vencimiento", "到期日", "Vade tarihi", "Data de vencimento", "Срок оплаты"],
  "Bill To": ["الفوترة إلى", "बिल टू", "Facturer à", "Facturar a", "开票给", "Fatura alıcısı", "Faturar a", "Выставить счет"],
  "Bill To Type": ["نوع جهة الفوترة", "बिल टू प्रकार", "Type de destinataire facture", "Tipo de facturación", "开票对象类型", "Fatura alıcı türü", "Tipo de faturação", "Тип получателя счета"],
  "Bill To Party": ["جهة الفوترة", "बिल टू पार्टी", "Partie facturée", "Parte facturada", "开票对象", "Fatura tarafı", "Entidade faturada", "Получатель счета"],
  "Select bill to party": ["اختر جهة الفوترة", "बिल टू पार्टी चुनें", "Sélectionner la partie facturée", "Seleccionar parte facturada", "选择开票对象", "Fatura tarafı seçin", "Selecionar entidade faturada", "Выберите получателя счета"],
  "Invoice Source Type": ["نوع مصدر الفاتورة", "इनवॉइस स्रोत प्रकार", "Type de source facture", "Tipo de origen de factura", "发票来源类型", "Fatura kaynak türü", "Tipo de origem da fatura", "Тип источника счета"],
  "Source Reference No": ["رقم مرجع المصدر", "स्रोत संदर्भ नंबर", "N° référence source", "N.º referencia origen", "来源参考号", "Kaynak referans no", "N.º referência de origem", "№ ссылки источника"],
  "Source Reference Id": ["معرف مرجع المصدر", "स्रोत संदर्भ आईडी", "ID référence source", "Id. referencia origen", "来源参考 ID", "Kaynak referans ID", "ID referência de origem", "ID ссылки источника"],
  "Source Type": ["نوع المصدر", "स्रोत प्रकार", "Type de source", "Tipo de origen", "来源类型", "Kaynak türü", "Tipo de origem", "Тип источника"],
  "Source": ["المصدر", "स्रोत", "Source", "Origen", "来源", "Kaynak", "Origem", "Источник"],
  "Standalone Invoice": ["فاتورة مستقلة", "स्वतंत्र इनवॉइस", "Facture autonome", "Factura independiente", "独立发票", "Bağımsız fatura", "Fatura independente", "Самостоятельный счет"],
  "Invoice details, amounts, and line items.": ["تفاصيل الفاتورة والمبالغ والبنود.", "इनवॉइस विवरण, राशि और लाइन आइटम।", "Détails, montants et lignes de facture.", "Detalles, importes y líneas de factura.", "发票明细、金额和行项目。", "Fatura detayları, tutarlar ve satırlar.", "Detalhes, valores e linhas da fatura.", "Данные счета, суммы и позиции."],
  "Customer invoice list with source references, currency, totals, and posting status.": ["قائمة فواتير العملاء مع مراجع المصدر والعملة والإجماليات وحالة الترحيل.", "स्रोत संदर्भ, मुद्रा, कुल और पोस्टिंग स्थिति सहित ग्राहक इनवॉइस सूची।", "Liste des factures client avec références source, devise, totaux et statut de comptabilisation.", "Lista de facturas con referencias de origen, moneda, totales y estado contable.", "包含来源参考、币种、总额和过账状态的客户发票列表。", "Kaynak referansları, para birimi, toplamlar ve muhasebe durumu ile müşteri faturaları listesi.", "Lista de faturas de cliente com referências, moeda, totais e estado de lançamento.", "Список счетов клиентов со ссылками, валютой, итогами и статусом проводки."],
  "Search invoice number, customer, source reference, or status": ["ابحث برقم الفاتورة أو العميل أو مرجع المصدر أو الحالة", "इनवॉइस नंबर, ग्राहक, स्रोत संदर्भ या स्थिति से खोजें", "Rechercher par facture, client, référence source ou statut", "Buscar por factura, cliente, referencia o estado", "按发票号、客户、来源参考或状态搜索", "Fatura no, müşteri, kaynak referansı veya durumla ara", "Pesquisar por fatura, cliente, referência ou estado", "Поиск по счету, клиенту, ссылке источника или статусу"],
  "Charge Head": ["بند الرسوم", "चार्ज हेड", "Rubrique de frais", "Concepto de cargo", "费用项目", "Masraf kalemi", "Rubrica de encargo", "Статья начисления"],
  "Charge Code": ["رمز الرسوم", "चार्ज कोड", "Code frais", "Código de cargo", "费用代码", "Masraf kodu", "Código de encargo", "Код начисления"],
  "Charge Name": ["اسم الرسوم", "चार्ज नाम", "Nom des frais", "Nombre de cargo", "费用名称", "Masraf adı", "Nome do encargo", "Наименование начисления"],
  "Select charge head": ["اختر بند الرسوم", "चार्ज हेड चुनें", "Sélectionner la rubrique de frais", "Seleccionar concepto de cargo", "选择费用项目", "Masraf kalemi seçin", "Selecionar rubrica de encargo", "Выберите статью начисления"],
  "Quantity": ["الكمية", "मात्रा", "Quantité", "Cantidad", "数量", "Miktar", "Quantidade", "Количество"],
  "Qty": ["الكمية", "मात्रा", "Qté", "Cant.", "数量", "Miktar", "Qtd.", "Кол-во"],
  "Rate": ["السعر", "दर", "Taux", "Tarifa", "费率", "Birim fiyat", "Taxa", "Ставка"],
  "Discount": ["الخصم", "छूट", "Remise", "Descuento", "折扣", "İndirim", "Desconto", "Скидка"],
  "Tax": ["الضريبة", "कर", "Taxe", "Impuesto", "税", "Vergi", "Imposto", "Налог"],
  "Tax %": ["نسبة الضريبة %", "कर %", "Taxe %", "Impuesto %", "税率 %", "Vergi %", "Imposto %", "Налог %"],
  "Line Total": ["إجمالي السطر", "लाइन कुल", "Total ligne", "Total línea", "行合计", "Satır toplamı", "Total da linha", "Итого по строке"],
  "Line": ["السطر", "लाइन", "Ligne", "Línea", "行", "Satır", "Linha", "Строка"],
  "SubTotal": ["الإجمالي الفرعي", "उप-योग", "Sous-total", "Subtotal", "小计", "Ara toplam", "Subtotal", "Промежуточный итог"],
  "Round Off": ["التقريب", "राउंड ऑफ", "Arrondi", "Redondeo", "舍入", "Yuvarlama", "Arredondamento", "Округление"],
  "Base Amount": ["المبلغ بالعملة الأساسية", "बेस राशि", "Montant devise de base", "Importe moneda base", "本位币金额", "Baz tutar", "Valor em moeda base", "Сумма в базовой валюте"],
  "Customer Currency": ["عملة العميل", "ग्राहक मुद्रा", "Devise client", "Moneda del cliente", "客户币种", "Müşteri para birimi", "Moeda do cliente", "Валюта клиента"],
  "Invoice Currency": ["عملة الفاتورة", "इनवॉइस मुद्रा", "Devise facture", "Moneda de factura", "发票币种", "Fatura para birimi", "Moeda da fatura", "Валюта счета"],
  "Base Currency": ["العملة الأساسية", "बेस मुद्रा", "Devise de base", "Moneda base", "本位币", "Baz para birimi", "Moeda base", "Базовая валюта"],
  "Exchange Rate": ["سعر الصرف", "विनिमय दर", "Taux de change", "Tipo de cambio", "汇率", "Döviz kuru", "Taxa de câmbio", "Курс обмена"],
  "Manual Exchange Rate Override": ["تجاوز يدوي لسعر الصرف", "मैनुअल विनिमय दर ओवरराइड", "Forçage manuel du taux de change", "Anulación manual del tipo de cambio", "手动汇率覆盖", "Manuel kur değişikliği", "Substituição manual da taxa de câmbio", "Ручное переопределение курса"],
  "Exchange Rate Override Reason": ["سبب تجاوز سعر الصرف", "विनिमय दर ओवरराइड कारण", "Motif du forçage du taux", "Motivo de anulación del tipo", "汇率覆盖原因", "Kur değişiklik nedeni", "Motivo da substituição da taxa", "Причина переопределения курса"],
  "Ledger Posting Preview": ["معاينة قيد الأستاذ", "लेजर पोस्टिंग पूर्वावलोकन", "Aperçu d'écriture comptable", "Vista previa de asiento contable", "总账过账预览", "Muhasebe fişi önizleme", "Pré-visualização de lançamento", "Предпросмотр проводки"],
  "Customer Receivable": ["ذمم العملاء المدينة", "ग्राहक देय", "Créance client", "Cuenta por cobrar cliente", "客户应收", "Müşteri alacağı", "Conta a receber de cliente", "Дебиторская задолженность клиента"],
  "Revenue": ["الإيراد", "राजस्व", "Produit", "Ingreso", "收入", "Gelir", "Receita", "Выручка"],
  "Tax Payable": ["ضريبة مستحقة الدفع", "देय कर", "Taxe à payer", "Impuesto por pagar", "应交税金", "Ödenecek vergi", "Imposto a pagar", "Налог к уплате"],
  "Approval": ["الاعتماد", "स्वीकृति", "Approbation", "Aprobación", "审批", "Onay", "Aprovação", "Утверждение"],
  "Approve Invoice": ["اعتماد الفاتورة", "इनवॉइस स्वीकृत करें", "Approuver la facture", "Aprobar factura", "批准发票", "Faturayı onayla", "Aprovar fatura", "Утвердить счет"],
  "Cancel Invoice": ["إلغاء الفاتورة", "इनवॉइस रद्द करें", "Annuler la facture", "Cancelar factura", "取消发票", "Faturayı iptal et", "Cancelar fatura", "Отменить счет"],
  "Invoice locked": ["الفاتورة مقفلة", "इनवॉइस लॉक है", "Facture verrouillée", "Factura bloqueada", "发票已锁定", "Fatura kilitli", "Fatura bloqueada", "Счет заблокирован"],
  "Only draft invoices can be changed.": ["يمكن تعديل الفواتير المسودة فقط.", "केवल ड्राफ्ट इनवॉइस बदले जा सकते हैं।", "Seules les factures brouillon peuvent être modifiées.", "Solo se pueden cambiar facturas en borrador.", "只能修改草稿发票。", "Yalnızca taslak faturalar değiştirilebilir.", "Apenas faturas em rascunho podem ser alteradas.", "Можно изменять только черновики счетов."],
  "Permission required": ["الصلاحية مطلوبة", "अनुमति आवश्यक", "Permission requise", "Permiso requerido", "需要权限", "Yetki gerekli", "Permissão necessária", "Требуется разрешение"],
  "Invoice.Override permission is required.": ["صلاحية Invoice.Override مطلوبة.", "Invoice.Override अनुमति आवश्यक है।", "La permission Invoice.Override est requise.", "Se requiere permiso Invoice.Override.", "需要 Invoice.Override 权限。", "Invoice.Override yetkisi gerekli.", "É necessária a permissão Invoice.Override.", "Требуется разрешение Invoice.Override."],
  "Saving...": ["جارٍ الحفظ...", "सेव हो रहा है...", "Enregistrement...", "Guardando...", "正在保存...", "Kaydediliyor...", "A guardar...", "Сохранение..."],
  "Print Draft": ["طباعة المسودة", "ड्राफ्ट प्रिंट करें", "Imprimer brouillon", "Imprimir borrador", "打印草稿", "Taslak yazdır", "Imprimir rascunho", "Печать черновика"],
  "Print Actual": ["طباعة الفاتورة الفعلية", "वास्तविक इनवॉइस प्रिंट करें", "Imprimer facture originale", "Imprimir factura real", "打印正式发票", "Gerçek faturayı yazdır", "Imprimir fatura final", "Печать фактического счета"],
  "Print Proforma": ["طباعة الفاتورة الأولية", "प्रोफॉर्मा प्रिंट करें", "Imprimer proforma", "Imprimir proforma", "打印形式发票", "Proforma yazdır", "Imprimir proforma", "Печать проформы"],
  "Print Invoice": ["طباعة الفاتورة", "इनवॉइस प्रिंट करें", "Imprimer la facture", "Imprimir factura", "打印发票", "Fatura yazdır", "Imprimir fatura", "Печать счета"],
  "PDF Export": ["تصدير PDF", "PDF निर्यात", "Export PDF", "Exportar PDF", "导出 PDF", "PDF dışa aktar", "Exportar PDF", "Экспорт PDF"],
  "Print Proforma or Original invoice with watermark.": ["اطبع فاتورة أولية أو أصلية مع علامة مائية.", "वॉटरमार्क के साथ प्रोफॉर्मा या ओरिजिनल इनवॉइस प्रिंट करें।", "Imprimer une facture proforma ou originale avec filigrane.", "Imprimir factura proforma u original con marca de agua.", "打印带水印的形式或正式发票。", "Filigranlı proforma veya orijinal fatura yazdırın.", "Imprimir fatura proforma ou original com marca de água.", "Печать проформы или оригинального счета с водяным знаком."],
  "Proforma": ["فاتورة أولية", "प्रोफॉर्मा", "Proforma", "Proforma", "形式发票", "Proforma", "Proforma", "Проформа"],
  "Original": ["الأصلية", "ओरिजिनल", "Original", "Original", "正本", "Orijinal", "Original", "Оригинал"],
  "Credit Note": ["إشعار دائن", "क्रेडिट नोट", "Avoir", "Nota de crédito", "贷项通知单", "Alacak dekontu", "Nota de crédito", "Кредит-нота"],
  "Debit Note": ["إشعار مدين", "डेबिट नोट", "Note de débit", "Nota de débito", "借项通知单", "Borç dekontu", "Nota de débito", "Дебет-нота"],
  "Invoice Document": ["مستند الفاتورة", "इनवॉइस दस्तावेज़", "Document de facture", "Documento de factura", "发票文件", "Fatura belgesi", "Documento da fatura", "Документ счета"],
  "No documents uploaded for this invoice.": ["لم يتم رفع مستندات لهذه الفاتورة.", "इस इनवॉइस के लिए कोई दस्तावेज़ अपलोड नहीं है।", "Aucun document téléversé pour cette facture.", "No hay documentos cargados para esta factura.", "此发票未上传文件。", "Bu fatura için belge yüklenmedi.", "Nenhum documento carregado para esta fatura.", "Для этого счета документы не загружены."]
});

Object.assign(direct, {
  "Create a custom invoice or link it to shipment, pickup, customs, quotation, or miscellaneous reference.": ["أنشئ فاتورة مخصصة أو اربطها بشحنة أو استلام أو تخليص جمركي أو عرض سعر أو مرجع متنوع.", "कस्टम इनवॉइस बनाएं या इसे शिपमेंट, पिकअप, कस्टम्स, कोटेशन या विविध संदर्भ से लिंक करें।", "Créez une facture personnalisée ou liez-la à une expédition, un enlèvement, un dédouanement, un devis ou une référence diverse.", "Cree una factura personalizada o vincúlela a un envío, recogida, aduanas, cotización o referencia diversa.", "创建自定义发票，或将其关联到货运、提货、清关、报价或其他参考。", "Özel bir fatura oluşturun veya sevkiyat, alım, gümrükleme, teklif ya da çeşitli bir referansa bağlayın.", "Crie uma fatura personalizada ou associe-a a um envio, recolha, alfândega, cotação ou referência diversa.", "Создайте пользовательский счет или свяжите его с отправкой, забором, таможенным оформлением, предложением либо прочей ссылкой."],
  "Custom Invoice": ["فاتورة مخصصة", "कस्टम इनवॉइस", "Facture personnalisée", "Factura personalizada", "自定义发票", "Özel fatura", "Fatura personalizada", "Пользовательский счет"],
  "Customer invoices with approval, printing, and email delivery.": ["فواتير العملاء مع الاعتماد والطباعة والإرسال بالبريد الإلكتروني.", "स्वीकृति, प्रिंटिंग और ईमेल डिलीवरी सहित ग्राहक इनवॉइस।", "Factures client avec approbation, impression et envoi par e-mail.", "Facturas de cliente con aprobación, impresión y envío por correo.", "客户发票，支持审批、打印和邮件发送。", "Onay, yazdırma ve e-posta gönderimi ile müşteri faturaları.", "Faturas de cliente com aprovação, impressão e envio por e-mail.", "Счета клиентов с утверждением, печатью и отправкой по e-mail."],
  "Custom": ["مخصص", "कस्टम", "Personnalisé", "Personalizado", "自定义", "Özel", "Personalizado", "Пользовательский"],
  "OUTSTANDING": ["المستحق", "बकाया", "EN COURS", "PENDIENTE", "未结清", "AÇIK BAKİYE", "PENDENTE", "ЗАДОЛЖЕННОСТЬ"],
  "Outstanding": ["المستحق", "बकाया", "En cours", "Pendiente", "未结清", "Açık bakiye", "Pendente", "Задолженность"],
  "Party Currency": ["عملة الطرف", "पार्टी मुद्रा", "Devise du tiers", "Moneda de la parte", "往来方币种", "Taraf para birimi", "Moeda da entidade", "Валюта контрагента"],
  "per": ["لكل", "प्रति", "par", "por", "每", "başına", "por", "за"],
  "Manual Rate Override": ["تجاوز يدوي للسعر", "मैनुअल दर ओवरराइड", "Forçage manuel du taux", "Anulación manual de la tasa", "手动费率覆盖", "Manuel oran değişikliği", "Substituição manual da taxa", "Ручное изменение курса"],
  "Heads": ["البنود", "हेड्स", "Rubriques", "Conceptos", "项目", "Kalemler", "Rubricas", "Статьи"],
  "Charge Heads": ["بنود الرسوم", "चार्ज हेड्स", "Rubriques de frais", "Conceptos de cargo", "费用项目", "Masraf kalemleri", "Rubricas de encargos", "Статьи начислений"],
  "Locked to the selected Bill To party currency.": ["مقفل على عملة جهة الفوترة المحددة.", "चयनित बिल टू पार्टी मुद्रा पर लॉक है।", "Verrouillé sur la devise de la partie facturée sélectionnée.", "Bloqueado a la moneda seleccionada de la parte facturada.", "已锁定为所选开票对象的币种。", "Seçilen fatura tarafı para birimine kilitlendi.", "Bloqueado à moeda da entidade faturada selecionada.", "Заблокировано на валюте выбранного получателя счета."],
  "Enter custom reference no, PO no, or manual note": ["أدخل رقم مرجع مخصص أو رقم أمر شراء أو ملاحظة يدوية", "कस्टम संदर्भ नंबर, PO नंबर या मैनुअल नोट दर्ज करें", "Saisir une référence personnalisée, un n° de commande ou une note manuelle", "Ingrese referencia personalizada, n.º de OC o nota manual", "输入自定义参考号、采购订单号或手工备注", "Özel referans no, PO no veya manuel not girin", "Introduza referência personalizada, n.º PO ou nota manual", "Введите пользовательскую ссылку, № PO или ручное примечание"],
  "Total Debit": ["إجمالي المدين", "कुल डेबिट", "Total débit", "Total debe", "借方合计", "Toplam borç", "Total débito", "Итого дебет"],
  "Total Credit": ["إجمالي الدائن", "कुल क्रेडिट", "Total crédit", "Total haber", "贷方合计", "Toplam alacak", "Total crédito", "Итого кредит"],
  "Balanced": ["متوازن", "संतुलित", "Équilibré", "Cuadrado", "平衡", "Dengeli", "Balanceado", "Сбалансировано"],
  "Not Balanced": ["غير متوازن", "संतुलित नहीं", "Non équilibré", "No cuadrado", "不平衡", "Dengesiz", "Não balanceado", "Не сбалансировано"]
});

Object.assign(direct, {
  "Vendor Bill": ["فاتورة المورد", "विक्रेता बिल", "Facture fournisseur", "Factura de proveedor", "供应商账单", "Tedarikçi faturası", "Fatura de fornecedor", "Счет поставщика"],
  "Vendor Bills": ["فواتير الموردين", "विक्रेता बिल", "Factures fournisseur", "Facturas de proveedor", "供应商账单", "Tedarikçi faturaları", "Faturas de fornecedor", "Счета поставщиков"],
  "New Vendor Bill": ["فاتورة مورد جديدة", "नया विक्रेता बिल", "Nouvelle facture fournisseur", "Nueva factura de proveedor", "新建供应商账单", "Yeni tedarikçi faturası", "Nova fatura de fornecedor", "Новый счет поставщика"],
  "Create Vendor Bill": ["إنشاء فاتورة مورد", "विक्रेता बिल बनाएं", "Créer une facture fournisseur", "Crear factura de proveedor", "创建供应商账单", "Tedarikçi faturası oluştur", "Criar fatura de fornecedor", "Создать счет поставщика"],
  "Edit Vendor Bill": ["تعديل فاتورة المورد", "विक्रेता बिल संपादित करें", "Modifier la facture fournisseur", "Editar factura de proveedor", "编辑供应商账单", "Tedarikçi faturasını düzenle", "Editar fatura de fornecedor", "Изменить счет поставщика"],
  "Save Vendor Bill": ["حفظ فاتورة المورد", "विक्रेता बिल सहेजें", "Enregistrer la facture fournisseur", "Guardar factura de proveedor", "保存供应商账单", "Tedarikçi faturasını kaydet", "Guardar fatura de fornecedor", "Сохранить счет поставщика"],
  "Vendor Bill No": ["رقم فاتورة المورد", "विक्रेता बिल नंबर", "N° facture fournisseur", "N.º factura de proveedor", "供应商账单号", "Tedarikçi faturası no", "N.º fatura de fornecedor", "№ счета поставщика"],
  "Pay To": ["الدفع إلى", "भुगतान करें", "Payer à", "Pagar a", "付款给", "Ödenecek taraf", "Pagar a", "Получатель платежа"],
  "Pay To Type": ["نوع جهة الدفع", "भुगतान प्राप्तकर्ता प्रकार", "Type de bénéficiaire", "Tipo de beneficiario", "收款方类型", "Ödenecek taraf türü", "Tipo de beneficiário", "Тип получателя платежа"],
  "Bill Source Type": ["نوع مصدر فاتورة المورد", "बिल स्रोत प्रकार", "Type de source de facture fournisseur", "Tipo de origen de factura de proveedor", "供应商账单来源类型", "Tedarikçi faturası kaynak türü", "Tipo de origem da fatura de fornecedor", "Тип источника счета поставщика"],
  "Bill Date": ["تاريخ فاتورة المورد", "बिल दिनांक", "Date de facture fournisseur", "Fecha de factura de proveedor", "供应商账单日期", "Tedarikçi faturası tarihi", "Data da fatura de fornecedor", "Дата счета поставщика"],
  "Bill Currency": ["عملة فاتورة المورد", "बिल मुद्रा", "Devise de facture fournisseur", "Moneda de factura de proveedor", "供应商账单币种", "Tedarikçi faturası para birimi", "Moeda da fatura de fornecedor", "Валюта счета поставщика"],
  "Vendor Currency": ["عملة المورد", "विक्रेता मुद्रा", "Devise fournisseur", "Moneda del proveedor", "供应商币种", "Tedarikçi para birimi", "Moeda do fornecedor", "Валюта поставщика"],
  "Expected Cost": ["التكلفة المتوقعة", "अपेक्षित लागत", "Coût prévu", "Coste previsto", "预计成本", "Beklenen maliyet", "Custo previsto", "Ожидаемая стоимость"],
  "Actual Cost": ["التكلفة الفعلية", "वास्तविक लागत", "Coût réel", "Coste real", "实际成本", "Gerçek maliyet", "Custo real", "Фактическая стоимость"],
  "Expected": ["المتوقع", "अपेक्षित", "Prévu", "Previsto", "预计", "Beklenen", "Previsto", "Ожидаемое"],
  "Actual": ["الفعلي", "वास्तविक", "Réel", "Real", "实际", "Gerçekleşen", "Real", "Фактическое"],
  "Variance": ["الفرق", "अंतर", "Écart", "Variación", "差异", "Fark", "Variação", "Отклонение"],
  "Expense Accounts": ["حسابات المصروفات", "व्यय खाते", "Comptes de charges", "Cuentas de gastos", "费用科目", "Gider hesapları", "Contas de despesas", "Счета расходов"],
  "Tax Receivable": ["ضريبة مستحقة القبض", "प्राप्य कर", "Taxe à recevoir", "Impuesto por cobrar", "应收税款", "Alacak vergi", "Imposto a receber", "Налог к получению"],
  "Payable": ["الحسابات الدائنة", "देय खाते", "Comptes fournisseurs", "Cuentas por pagar", "应付账款", "Ticari borçlar", "Contas a pagar", "Кредиторская задолженность"],
  "Expected Cost Comparison": ["مقارنة التكلفة المتوقعة", "अपेक्षित लागत तुलना", "Comparaison du coût prévu", "Comparación de coste previsto", "预计成本比较", "Beklenen maliyet karşılaştırması", "Comparação do custo previsto", "Сравнение ожидаемой стоимости"],
  "Cost Allocation": ["توزيع التكلفة", "लागत आवंटन", "Répartition des coûts", "Asignación de costes", "成本分摊", "Maliyet dağıtımı", "Alocação de custos", "Распределение затрат"],
  "Cost Head": ["بند التكلفة", "लागत मद", "Rubrique de coût", "Concepto de coste", "成本项目", "Maliyet kalemi", "Rubrica de custo", "Статья затрат"],
  "Cost Heads": ["بنود التكلفة", "लागत मद", "Rubriques de coût", "Conceptos de coste", "成本项目", "Maliyet kalemleri", "Rubricas de custo", "Статьи затрат"],
  "Cost Code": ["رمز التكلفة", "लागत कोड", "Code coût", "Código de coste", "成本代码", "Maliyet kodu", "Código de custo", "Код затрат"],
  "Cost Name": ["اسم التكلفة", "लागत नाम", "Nom du coût", "Nombre del coste", "成本名称", "Maliyet adı", "Nome do custo", "Наименование затрат"],
  "Allocated Total": ["إجمالي الموزع", "कुल आवंटित", "Total réparti", "Total asignado", "已分摊总额", "Dağıtılan toplam", "Total alocado", "Всего распределено"],
  "Unallocated": ["غير موزع", "अनावंटित", "Non réparti", "Sin asignar", "未分摊", "Dağıtılmamış", "Não alocado", "Не распределено"],
  "Variance Amount": ["مبلغ الفرق", "अंतर राशि", "Montant de l'écart", "Importe de variación", "差异金额", "Fark tutarı", "Valor da variação", "Сумма отклонения"],
  "Variance %": ["نسبة الفرق %", "अंतर %", "Écart %", "Variación %", "差异 %", "Fark %", "Variação %", "Отклонение %"],
  "Vendor bill processing with expected-cost review and approvals.": ["معالجة فواتير الموردين مع مراجعة التكلفة المتوقعة والاعتمادات.", "अपेक्षित लागत समीक्षा और अनुमोदन सहित विक्रेता बिल प्रसंस्करण।", "Traitement des factures fournisseur avec contrôle du coût prévu et approbations.", "Procesamiento de facturas de proveedor con revisión de costes previstos y aprobaciones.", "供应商账单处理，包含预计成本审核和审批。", "Beklenen maliyet incelemesi ve onaylarla tedarikçi faturası işlemleri.", "Processamento de faturas de fornecedor com revisão de custos previstos e aprovações.", "Обработка счетов поставщиков с проверкой ожидаемых затрат и утверждением."],
  "Create vendor bill against shipment, pickup, customs, or miscellaneous reference.": ["أنشئ فاتورة مورد مقابل شحنة أو استلام أو تخليص جمركي أو مرجع متنوع.", "शिपमेंट, पिकअप, कस्टम्स या विविध संदर्भ के विरुद्ध विक्रेता बिल बनाएं।", "Créez une facture fournisseur pour une expédition, un enlèvement, un dédouanement ou une référence diverse.", "Cree una factura de proveedor contra un envío, recogida, aduanas o referencia diversa.", "针对货运、提货、清关或其他参考创建供应商账单。", "Sevkiyat, alım, gümrükleme veya çeşitli bir referans için tedarikçi faturası oluşturun.", "Crie uma fatura de fornecedor para um envio, recolha, alfândega ou referência diversa.", "Создайте счет поставщика для отправки, забора, таможенного оформления или прочей ссылки."],
  "Vendor bill details, expected vs actual cost, and cost lines.": ["تفاصيل فاتورة المورد والتكلفة المتوقعة مقابل الفعلية وبنود التكلفة.", "विक्रेता बिल विवरण, अपेक्षित बनाम वास्तविक लागत और लागत पंक्तियां।", "Détails de la facture fournisseur, coût prévu/réel et lignes de coût.", "Detalles de factura de proveedor, coste previsto frente a real y líneas de coste.", "供应商账单明细、预计与实际成本及成本行。", "Tedarikçi faturası ayrıntıları, beklenen/gerçek maliyet ve maliyet satırları.", "Detalhes da fatura de fornecedor, custo previsto/real e linhas de custo.", "Детали счета поставщика, ожидаемые и фактические затраты и строки затрат."],
  "Locked to the selected Pay To party currency.": ["مقفل على عملة جهة الدفع المحددة.", "चयनित भुगतान प्राप्तकर्ता मुद्रा पर लॉक है।", "Verrouillé sur la devise du bénéficiaire sélectionné.", "Bloqueado a la moneda del beneficiario seleccionado.", "已锁定为所选收款方的币种。", "Seçilen ödenecek taraf para birimine kilitlendi.", "Bloqueado à moeda do beneficiário selecionado.", "Заблокировано на валюте выбранного получателя платежа."],
  "Cancel Vendor Bill": ["إلغاء فاتورة المورد", "विक्रेता बिल रद्द करें", "Annuler la facture fournisseur", "Cancelar factura de proveedor", "取消供应商账单", "Tedarikçi faturasını iptal et", "Cancelar fatura de fornecedor", "Отменить счет поставщика"],
  "Vendor Bill Document": ["مستند فاتورة المورد", "विक्रेता बिल दस्तावेज़", "Document de facture fournisseur", "Documento de factura de proveedor", "供应商账单文件", "Tedarikçi faturası belgesi", "Documento da fatura de fornecedor", "Документ счета поставщика"],
  "No documents uploaded for this vendor bill.": ["لم يتم رفع مستندات لفاتورة المورد هذه.", "इस विक्रेता बिल के लिए कोई दस्तावेज़ अपलोड नहीं किया गया।", "Aucun document téléversé pour cette facture fournisseur.", "No hay documentos cargados para esta factura de proveedor.", "此供应商账单未上传文件。", "Bu tedarikçi faturası için belge yüklenmedi.", "Nenhum documento carregado para esta fatura de fornecedor.", "Для этого счета поставщика документы не загружены."]
});

Object.assign(direct, {
  "Customer Receipt": ["سند قبض العميل", "ग्राहक प्राप्ति", "Encaissement client", "Recibo de cliente", "客户收款", "Müşteri tahsilatı", "Recebimento de cliente", "Поступление от клиента"],
  "Customer Receipts": ["سندات قبض العملاء", "ग्राहक प्राप्तियां", "Encaissements clients", "Recibos de clientes", "客户收款", "Müşteri tahsilatları", "Recebimentos de clientes", "Поступления от клиентов"],
  "New Receipt": ["سند قبض جديد", "नई प्राप्ति", "Nouvel encaissement", "Nuevo recibo", "新建收款", "Yeni tahsilat", "Novo recebimento", "Новое поступление"],
  "Create Customer Receipt": ["إنشاء سند قبض عميل", "ग्राहक प्राप्ति बनाएं", "Créer un encaissement client", "Crear recibo de cliente", "创建客户收款", "Müşteri tahsilatı oluştur", "Criar recebimento de cliente", "Создать поступление от клиента"],
  "Edit Receipt": ["تعديل سند القبض", "प्राप्ति संपादित करें", "Modifier l'encaissement", "Editar recibo", "编辑收款", "Tahsilatı düzenle", "Editar recebimento", "Изменить поступление"],
  "Save Receipt": ["حفظ سند القبض", "प्राप्ति सहेजें", "Enregistrer l'encaissement", "Guardar recibo", "保存收款", "Tahsilatı kaydet", "Guardar recebimento", "Сохранить поступление"],
  "Receipt No": ["رقم سند القبض", "प्राप्ति संख्या", "N° d'encaissement", "N.º de recibo", "收款编号", "Tahsilat no", "N.º do recebimento", "№ поступления"],
  "Receipt Date": ["تاريخ سند القبض", "प्राप्ति दिनांक", "Date d'encaissement", "Fecha del recibo", "收款日期", "Tahsilat tarihi", "Data do recebimento", "Дата поступления"],
  "Receipt Amount": ["مبلغ القبض", "प्राप्ति राशि", "Montant encaissé", "Importe recibido", "收款金额", "Tahsilat tutarı", "Valor recebido", "Сумма поступления"],
  "Receipt Currency": ["عملة سند القبض", "प्राप्ति मुद्रा", "Devise d'encaissement", "Moneda del recibo", "收款币种", "Tahsilat para birimi", "Moeda do recebimento", "Валюта поступления"],
  "Received From Type": ["نوع الجهة الدافعة", "प्राप्तकर्ता पक्ष प्रकार", "Type de payeur", "Tipo de pagador", "付款方类型", "Ödeyen taraf türü", "Tipo de pagador", "Тип плательщика"],
  "Received From": ["مستلم من", "से प्राप्त", "Reçu de", "Recibido de", "收款对象", "Tahsil edilen taraf", "Recebido de", "Получено от"],
  "Select party type": ["اختر نوع الجهة", "पक्ष प्रकार चुनें", "Sélectionner le type de tiers", "Seleccionar tipo de parte", "选择付款方类型", "Taraf türü seçin", "Selecionar tipo de entidade", "Выберите тип стороны"],
  "Advance Receipt": ["دفعة مقدمة مستلمة", "अग्रिम प्राप्ति", "Encaissement d'avance", "Recibo anticipado", "预收款", "Avans tahsilatı", "Recebimento antecipado", "Авансовое поступление"],
  "Advance": ["مقدم", "अग्रिम", "Avance", "Anticipo", "预收", "Avans", "Adiantamento", "Аванс"],
  "Bank Account": ["الحساب البنكي", "बैंक खाता", "Compte bancaire", "Cuenta bancaria", "银行账户", "Banka hesabı", "Conta bancária", "Банковский счет"],
  "Cash Account": ["حساب النقدية", "नकद खाता", "Compte de caisse", "Cuenta de caja", "现金账户", "Kasa hesabı", "Conta de caixa", "Кассовый счет"],
  "Bank Charges": ["رسوم بنكية", "बैंक शुल्क", "Frais bancaires", "Gastos bancarios", "银行手续费", "Banka masrafları", "Encargos bancários", "Банковские комиссии"],
  "Select bank account": ["اختر الحساب البنكي", "बैंक खाता चुनें", "Sélectionner le compte bancaire", "Seleccionar cuenta bancaria", "选择银行账户", "Banka hesabı seçin", "Selecionar conta bancária", "Выберите банковский счет"],
  "Select cash account": ["اختر حساب النقدية", "नकद खाता चुनें", "Sélectionner le compte de caisse", "Seleccionar cuenta de caja", "选择现金账户", "Kasa hesabı seçin", "Selecionar conta de caixa", "Выберите кассовый счет"],
  "Pending Customer Invoices": ["فواتير العملاء المستحقة", "लंबित ग्राहक इनवॉइस", "Factures clients en attente", "Facturas de clientes pendientes", "待收客户发票", "Bekleyen müşteri faturaları", "Faturas de clientes pendentes", "Ожидающие счета клиентов"],
  "Pending Invoices": ["الفواتير المستحقة", "लंबित इनवॉइस", "Factures en attente", "Facturas pendientes", "待收发票", "Bekleyen faturalar", "Faturas pendentes", "Ожидающие счета"],
  "Payment Allocation": ["تخصيص الدفعة", "भुगतान आवंटन", "Affectation du règlement", "Asignación del pago", "收款核销", "Ödeme dağıtımı", "Alocação do pagamento", "Распределение платежа"],
  "Receipt Allocation": ["تخصيص سند القبض", "प्राप्ति आवंटन", "Affectation de l'encaissement", "Asignación del recibo", "收款分配", "Tahsilat dağıtımı", "Alocação do recebimento", "Распределение поступления"],
  "Allocation Rows": ["بنود التخصيص", "आवंटन पंक्तियां", "Lignes d'affectation", "Líneas de asignación", "分配明细", "Dağıtım satırları", "Linhas de alocação", "Строки распределения"],
  "Allocated Amount": ["المبلغ المخصص", "आवंटित राशि", "Montant affecté", "Importe asignado", "已分配金额", "Dağıtılan tutar", "Valor alocado", "Распределенная сумма"],
  "Allocated": ["مخصص", "आवंटित", "Affecté", "Asignado", "已分配", "Dağıtılan", "Alocado", "Распределено"],
  "Remaining": ["المتبقي", "शेष", "Restant", "Restante", "剩余", "Kalan", "Restante", "Остаток"],
  "Allocate": ["تخصيص", "आवंटित करें", "Affecter", "Asignar", "分配", "Dağıt", "Alocar", "Распределить"],
  "Added": ["تمت الإضافة", "जोड़ा गया", "Ajouté", "Añadido", "已添加", "Eklendi", "Adicionado", "Добавлено"],
  "Blocked": ["محظور", "अवरुद्ध", "Bloqué", "Bloqueado", "已阻止", "Engellendi", "Bloqueado", "Заблокировано"],
  "Add Row": ["إضافة سطر", "पंक्ति जोड़ें", "Ajouter une ligne", "Añadir fila", "添加行", "Satır ekle", "Adicionar linha", "Добавить строку"],
  "Save Allocation": ["حفظ التخصيص", "आवंटन सहेजें", "Enregistrer l'affectation", "Guardar asignación", "保存分配", "Dağıtımı kaydet", "Guardar alocação", "Сохранить распределение"],
  "Receipt currency mismatch": ["عملة سند القبض غير متطابقة", "प्राप्ति मुद्रा मेल नहीं खाती", "Devise d'encaissement non concordante", "La moneda del recibo no coincide", "收款币种不匹配", "Tahsilat para birimi uyuşmuyor", "A moeda do recebimento não corresponde", "Валюта поступления не совпадает"],
  "Currency mismatch": ["عدم تطابق العملة", "मुद्रा मेल नहीं खाती", "Devise non concordante", "Moneda no coincidente", "币种不匹配", "Para birimi uyuşmazlığı", "Moeda não correspondente", "Несоответствие валют"],
  "Invoice currency must be the same as receipt currency.": ["يجب أن تكون عملة الفاتورة مطابقة لعملة سند القبض.", "इनवॉइस मुद्रा प्राप्ति मुद्रा के समान होनी चाहिए।", "La devise de la facture doit être identique à celle de l'encaissement.", "La moneda de la factura debe coincidir con la del recibo.", "发票币种必须与收款币种一致。", "Fatura para birimi tahsilat para birimiyle aynı olmalıdır.", "A moeda da fatura deve ser igual à moeda do recebimento.", "Валюта счета должна совпадать с валютой поступления."],
  "Exchange Gain": ["ربح فروق العملة", "विनिमय लाभ", "Gain de change", "Ganancia cambiaria", "汇兑收益", "Kur farkı geliri", "Ganho cambial", "Курсовая прибыль"],
  "Exchange Loss": ["خسارة فروق العملة", "विनिमय हानि", "Perte de change", "Pérdida cambiaria", "汇兑损失", "Kur farkı gideri", "Perda cambial", "Курсовой убыток"],
  "Exchange Gain/Loss": ["ربح/خسارة فروق العملة", "विनिमय लाभ/हानि", "Gain/perte de change", "Ganancia/pérdida cambiaria", "汇兑损益", "Kur farkı geliri/gideri", "Ganho/perda cambial", "Курсовая прибыль/убыток"],
  "Bank/Cash": ["البنك/النقدية", "बैंक/नकद", "Banque/Caisse", "Banco/Caja", "银行/现金", "Banka/Kasa", "Banco/Caixa", "Банк/Касса"],
  "Customer Advance": ["دفعات مقدمة من العملاء", "ग्राहक अग्रिम", "Avances clients", "Anticipos de clientes", "客户预收款", "Müşteri avansları", "Adiantamentos de clientes", "Авансы клиентов"],
  "Receivable": ["حسابات مدينة", "प्राप्य खाते", "Comptes clients", "Cuentas por cobrar", "应收账款", "Ticari alacaklar", "Contas a receber", "Дебиторская задолженность"],
  "Receipt Voucher": ["سند قبض", "प्राप्ति वाउचर", "Pièce d'encaissement", "Comprobante de recibo", "收款凭证", "Tahsilat fişi", "Comprovativo de recebimento", "Приходный ордер"],
  "RECEIPT VOUCHER": ["سند قبض", "प्राप्ति वाउचर", "PIÈCE D'ENCAISSEMENT", "COMPROBANTE DE RECIBO", "收款凭证", "TAHSİLAT FİŞİ", "COMPROVATIVO DE RECEBIMENTO", "ПРИХОДНЫЙ ОРДЕР"],
  "Prepared By": ["أعده", "तैयार करने वाला", "Préparé par", "Preparado por", "制单人", "Hazırlayan", "Preparado por", "Подготовил"],
  "Authorized Signature": ["التوقيع المعتمد", "अधिकृत हस्ताक्षर", "Signature autorisée", "Firma autorizada", "授权签字", "Yetkili imza", "Assinatura autorizada", "Подпись уполномоченного лица"],
  "Receipt created": ["تم إنشاء سند القبض", "प्राप्ति बनाई गई", "Encaissement créé", "Recibo creado", "收款已创建", "Tahsilat oluşturuldu", "Recebimento criado", "Поступление создано"],
  "Receipt updated": ["تم تحديث سند القبض", "प्राप्ति अपडेट की गई", "Encaissement mis à jour", "Recibo actualizado", "收款已更新", "Tahsilat güncellendi", "Recebimento atualizado", "Поступление обновлено"],
  "Allocation is incomplete": ["التخصيص غير مكتمل", "आवंटन अधूरा है", "L'affectation est incomplète", "La asignación está incompleta", "分配未完成", "Dağıtım tamamlanmadı", "A alocação está incompleta", "Распределение не завершено"],
  "matching invoice(s)": ["فاتورة مطابقة", "मेल खाने वाले इनवॉइस", "facture(s) correspondante(s)", "factura(s) coincidente(s)", "张匹配发票", "eşleşen fatura", "fatura(s) correspondente(s)", "совпадающих счетов"],
  "matching invoice(s) in": ["فاتورة مطابقة بعملة", "मुद्रा में मेल खाने वाले इनवॉइस", "facture(s) correspondante(s) en", "factura(s) coincidente(s) en", "张匹配发票，币种", "para biriminde eşleşen fatura", "fatura(s) correspondente(s) em", "совпадающих счетов в валюте"],
  "by name, code, or phone": ["بالاسم أو الرمز أو الهاتف", "नाम, कोड या फोन से", "par nom, code ou téléphone", "por nombre, código o teléfono", "按名称、代码或电话", "ad, kod veya telefonla", "por nome, código ou telefone", "по имени, коду или телефону"],
  "Locked to the selected Received From party currency.": ["مقفل على عملة الجهة الدافعة المحددة.", "चयनित भुगतानकर्ता पक्ष की मुद्रा पर लॉक है।", "Verrouillé sur la devise du payeur sélectionné.", "Bloqueado en la moneda del pagador seleccionado.", "已锁定为所选付款方币种。", "Seçilen ödeyen tarafın para birimine kilitlendi.", "Bloqueado à moeda do pagador selecionado.", "Зафиксировано в валюте выбранного плательщика."],
  "No saved exchange rate exists on or before the receipt date. Enter the receipt rate manually.": ["لا يوجد سعر صرف محفوظ في تاريخ سند القبض أو قبله. أدخل سعر القبض يدوياً.", "प्राप्ति दिनांक पर या उससे पहले कोई सहेजी गई विनिमय दर नहीं है। प्राप्ति दर मैन्युअल रूप से दर्ज करें।", "Aucun taux de change enregistré à la date d'encaissement ou avant. Saisissez le taux manuellement.", "No existe un tipo de cambio guardado en la fecha del recibo o anterior. Introduzca el tipo manualmente.", "收款日期或之前没有已保存汇率，请手动输入收款汇率。", "Tahsilat tarihinde veya öncesinde kayıtlı kur yok. Tahsilat kurunu manuel girin.", "Não existe taxa de câmbio guardada na data do recebimento ou anterior. Introduza a taxa manualmente.", "На дату поступления или ранее нет сохраненного курса. Введите курс вручную."],
  "Receive payment from a customer, vendor, agent, or carrier and allocate it to one or more invoices.": ["استلم دفعة من عميل أو مورد أو وكيل أو ناقل وخصصها لفاتورة واحدة أو أكثر.", "ग्राहक, विक्रेता, एजेंट या कैरियर से भुगतान प्राप्त करें और इसे एक या अधिक इनवॉइस में आवंटित करें।", "Encaissez un règlement d'un client, fournisseur, agent ou transporteur et affectez-le à une ou plusieurs factures.", "Reciba un pago de un cliente, proveedor, agente o transportista y asígnelo a una o varias facturas.", "接收客户、供应商、代理或承运人的付款，并将其分配至一张或多张发票。", "Müşteri, tedarikçi, acente veya taşıyıcıdan ödeme alın ve bir ya da daha fazla faturaya dağıtın.", "Receba um pagamento de um cliente, fornecedor, agente ou transportador e aloque-o a uma ou mais faturas.", "Получите платеж от клиента, поставщика, агента или перевозчика и распределите его по одному или нескольким счетам."],
  "Select a party to load pending invoices.": ["اختر جهة لتحميل الفواتير المستحقة.", "लंबित इनवॉइस लोड करने के लिए एक पक्ष चुनें।", "Sélectionnez un tiers pour charger les factures en attente.", "Seleccione una parte para cargar las facturas pendientes.", "选择付款方以加载待收发票。", "Bekleyen faturaları yüklemek için bir taraf seçin.", "Selecione uma entidade para carregar as faturas pendentes.", "Выберите сторону для загрузки ожидающих счетов."],
  "Add one or more invoices to allocate this receipt.": ["أضف فاتورة واحدة أو أكثر لتخصيص سند القبض هذا.", "इस प्राप्ति को आवंटित करने के लिए एक या अधिक इनवॉइस जोड़ें।", "Ajoutez une ou plusieurs factures pour affecter cet encaissement.", "Añada una o varias facturas para asignar este recibo.", "添加一张或多张发票以分配此收款。", "Bu tahsilatı dağıtmak için bir veya daha fazla fatura ekleyin.", "Adicione uma ou mais faturas para alocar este recebimento.", "Добавьте один или несколько счетов для распределения этого поступления."],
  "Money received from customers, vendors, agents, or carriers, with invoice allocation, approval, and voucher print.": ["إدارة المبالغ المستلمة من العملاء أو الموردين أو الوكلاء أو الناقلين مع تخصيص الفواتير والاعتماد وطباعة سند القبض.", "ग्राहकों, विक्रेताओं, एजेंटों या कैरियरों से प्राप्त राशि का इनवॉइस आवंटन, अनुमोदन और प्राप्ति वाउचर प्रिंट सहित प्रबंधन।", "Gérez les fonds reçus des clients, fournisseurs, agents ou transporteurs avec affectation des factures, approbation et impression de la pièce d'encaissement.", "Gestione los importes recibidos de clientes, proveedores, agentes o transportistas con asignación de facturas, aprobación e impresión del comprobante.", "管理从客户、供应商、代理或承运人收到的款项，包括发票分配、审批和收款凭证打印。", "Müşteri, tedarikçi, acente veya taşıyıcılardan alınan tutarları fatura dağıtımı, onay ve tahsilat fişi yazdırma ile yönetin.", "Gira os valores recebidos de clientes, fornecedores, agentes ou transportadores com alocação de faturas, aprovação e impressão do comprovativo.", "Управляйте средствами, полученными от клиентов, поставщиков, агентов или перевозчиков, с распределением по счетам, утверждением и печатью приходного ордера."],
  "Print Receipt": ["طباعة سند القبض", "प्राप्ति प्रिंट करें", "Imprimer l'encaissement", "Imprimir recibo", "打印收款凭证", "Tahsilatı yazdır", "Imprimir recebimento", "Печать поступления"],
  "Receipt Document": ["مستند سند القبض", "प्राप्ति दस्तावेज़", "Document d'encaissement", "Documento del recibo", "收款文件", "Tahsilat belgesi", "Documento do recebimento", "Документ поступления"],
  "No documents uploaded for this receipt.": ["لم يتم رفع مستندات لسند القبض هذا.", "इस प्राप्ति के लिए कोई दस्तावेज़ अपलोड नहीं किया गया।", "Aucun document téléversé pour cet encaissement.", "No se cargaron documentos para este recibo.", "此收款未上传文件。", "Bu tahsilat için belge yüklenmedi.", "Nenhum documento carregado para este recebimento.", "Для этого поступления документы не загружены."]
});

Object.assign(direct, {
  "Vendor Payment": ["دفعة مورد", "विक्रेता भुगतान", "Règlement fournisseur", "Pago a proveedor", "供应商付款", "Tedarikçi ödemesi", "Pagamento a fornecedor", "Платеж поставщику"],
  "Vendor Payments": ["دفعات الموردين", "विक्रेता भुगतान", "Règlements fournisseurs", "Pagos a proveedores", "供应商付款", "Tedarikçi ödemeleri", "Pagamentos a fornecedores", "Платежи поставщикам"],
  "New Payment": ["دفعة جديدة", "नया भुगतान", "Nouveau règlement", "Nuevo pago", "新建付款", "Yeni ödeme", "Novo pagamento", "Новый платеж"],
  "Create Vendor Payment": ["إنشاء دفعة مورد", "विक्रेता भुगतान बनाएं", "Créer un règlement fournisseur", "Crear pago a proveedor", "创建供应商付款", "Tedarikçi ödemesi oluştur", "Criar pagamento a fornecedor", "Создать платеж поставщику"],
  "Edit Payment": ["تعديل الدفعة", "भुगतान संपादित करें", "Modifier le règlement", "Editar pago", "编辑付款", "Ödemeyi düzenle", "Editar pagamento", "Изменить платеж"],
  "Save Payment": ["حفظ الدفعة", "भुगतान सहेजें", "Enregistrer le règlement", "Guardar pago", "保存付款", "Ödemeyi kaydet", "Guardar pagamento", "Сохранить платеж"],
  "Payment No": ["رقم الدفعة", "भुगतान संख्या", "N° de règlement", "N.º de pago", "付款编号", "Ödeme no", "N.º do pagamento", "№ платежа"],
  "Payment Date": ["تاريخ الدفعة", "भुगतान दिनांक", "Date de règlement", "Fecha de pago", "付款日期", "Ödeme tarihi", "Data do pagamento", "Дата платежа"],
  "Payment Amount": ["مبلغ الدفعة", "भुगतान राशि", "Montant du règlement", "Importe del pago", "付款金额", "Ödeme tutarı", "Valor do pagamento", "Сумма платежа"],
  "Payment Currency": ["عملة الدفعة", "भुगतान मुद्रा", "Devise de règlement", "Moneda del pago", "付款币种", "Ödeme para birimi", "Moeda do pagamento", "Валюта платежа"],
  "Paid To Type": ["نوع الجهة المستفيدة", "भुगतान प्राप्तकर्ता प्रकार", "Type de bénéficiaire", "Tipo de beneficiario", "收款方类型", "Ödenen taraf türü", "Tipo de beneficiário", "Тип получателя"],
  "Paid To": ["مدفوع إلى", "को भुगतान", "Payé à", "Pagado a", "付款对象", "Ödenen taraf", "Pago a", "Получатель платежа"],
  "Advance Payment": ["دفعة مقدمة", "अग्रिम भुगतान", "Avance fournisseur", "Pago anticipado", "预付款", "Avans ödemesi", "Pagamento antecipado", "Авансовый платеж"],
  "Pending Vendor Bills": ["فواتير الموردين المستحقة", "लंबित विक्रेता बिल", "Factures fournisseurs en attente", "Facturas de proveedores pendientes", "待付供应商账单", "Bekleyen tedarikçi faturaları", "Faturas de fornecedores pendentes", "Ожидающие счета поставщиков"],
  "Payment Allocation": ["تخصيص الدفعة", "भुगतान आवंटन", "Affectation du règlement", "Asignación del pago", "付款分配", "Ödeme dağıtımı", "Alocação do pagamento", "Распределение платежа"],
  "Payment Voucher": ["سند صرف", "भुगतान वाउचर", "Pièce de règlement", "Comprobante de pago", "付款凭证", "Ödeme fişi", "Comprovativo de pagamento", "Платежный ордер"],
  "Payment Document": ["مستند الدفعة", "भुगतान दस्तावेज़", "Document de règlement", "Documento de pago", "付款文件", "Ödeme belgesi", "Documento de pagamento", "Платежный документ"],
  "No documents uploaded for this payment.": ["لم يتم رفع مستندات لهذه الدفعة.", "इस भुगतान के लिए कोई दस्तावेज़ अपलोड नहीं किया गया।", "Aucun document téléversé pour ce règlement.", "No se cargaron documentos para este pago.", "此付款未上传文件。", "Bu ödeme için belge yüklenmedi.", "Nenhum documento carregado para este pagamento.", "Для этого платежа документы не загружены."],
  "Pay Multiple": ["دفع متعدد", "एकाधिक भुगतान", "Paiement multiple", "Pago múltiple", "批量付款", "Çoklu ödeme", "Pagamento múltiplo", "Массовая оплата"],
  "Pay Multiple Vouchers": ["دفع عدة مستندات", "एकाधिक वाउचर का भुगतान", "Régler plusieurs pièces", "Pagar varios comprobantes", "支付多个凭证", "Birden fazla fişi öde", "Pagar vários comprovativos", "Оплатить несколько документов"],
  "Pending Vouchers": ["المستندات المستحقة", "लंबित वाउचर", "Pièces en attente", "Comprobantes pendientes", "待付凭证", "Bekleyen fişler", "Comprovativos pendentes", "Ожидающие документы"],
  "Voucher No": ["رقم المستند", "वाउचर संख्या", "N° de pièce", "N.º de comprobante", "凭证编号", "Fiş no", "N.º do comprovativo", "№ документа"],
  "Payee": ["المستفيد", "प्राप्तकर्ता", "Bénéficiaire", "Beneficiario", "收款方", "Alacaklı", "Beneficiário", "Получатель"],
  "Payee groups": ["مجموعات المستفيدين", "प्राप्तकर्ता समूह", "Groupes de bénéficiaires", "Grupos de beneficiarios", "收款方组", "Alacaklı grupları", "Grupos de beneficiários", "Группы получателей"],
  "Selected vouchers": ["المستندات المحددة", "चयनित वाउचर", "Pièces sélectionnées", "Comprobantes seleccionados", "已选凭证", "Seçilen fişler", "Comprovativos selecionados", "Выбранные документы"],
  "Bulk Payment Total": ["إجمالي الدفعة المجمعة", "कुल थोक भुगतान", "Total du paiement groupé", "Total del pago masivo", "批量付款总额", "Toplu ödeme toplamı", "Total do pagamento em lote", "Итого массового платежа"],
  "Create Bulk Payment": ["إنشاء دفعة مجمعة", "थोक भुगतान बनाएं", "Créer le paiement groupé", "Crear pago masivo", "创建批量付款", "Toplu ödeme oluştur", "Criar pagamento em lote", "Создать массовый платеж"],
  "Create and approve": ["إنشاء واعتماد", "बनाएं और स्वीकृत करें", "Créer et approuver", "Crear y aprobar", "创建并审批", "Oluştur ve onayla", "Criar e aprovar", "Создать и утвердить"],
  "Create draft": ["إنشاء مسودة", "ड्राफ्ट बनाएं", "Créer un brouillon", "Crear borrador", "创建草稿", "Taslak oluştur", "Criar rascunho", "Создать черновик"],
  "Different currency": ["عملة مختلفة", "अलग मुद्रा", "Devise différente", "Moneda diferente", "币种不同", "Farklı para birimi", "Moeda diferente", "Другая валюта"],
  "Payment currency mismatch": ["عملة الدفعة غير متطابقة", "भुगतान मुद्रा मेल नहीं खाती", "Devise de règlement non concordante", "La moneda del pago no coincide", "付款币种不匹配", "Ödeme para birimi uyuşmuyor", "A moeda do pagamento não corresponde", "Валюта платежа не совпадает"],
  "Bill currency must be the same as payment currency.": ["يجب أن تكون عملة فاتورة المورد مطابقة لعملة الدفعة.", "बिल मुद्रा भुगतान मुद्रा के समान होनी चाहिए।", "La devise de la facture fournisseur doit être identique à celle du règlement.", "La moneda de la factura debe coincidir con la del pago.", "供应商账单币种必须与付款币种一致。", "Fatura para birimi ödeme para birimiyle aynı olmalıdır.", "A moeda da fatura deve ser igual à moeda do pagamento.", "Валюта счета поставщика должна совпадать с валютой платежа."],
  "Add one or more bills to allocate this payment.": ["أضف فاتورة مورد واحدة أو أكثر لتخصيص هذه الدفعة.", "इस भुगतान को आवंटित करने के लिए एक या अधिक बिल जोड़ें।", "Ajoutez une ou plusieurs factures fournisseur pour affecter ce règlement.", "Añada una o varias facturas de proveedor para asignar este pago.", "添加一张或多张供应商账单以分配此付款。", "Bu ödemeyi dağıtmak için bir veya daha fazla tedarikçi faturası ekleyin.", "Adicione uma ou mais faturas de fornecedor para alocar este pagamento.", "Добавьте один или несколько счетов поставщика для распределения платежа."],
  "Select a party to load pending bills.": ["اختر جهة لتحميل فواتير الموردين المستحقة.", "लंबित बिल लोड करने के लिए एक पक्ष चुनें।", "Sélectionnez un tiers pour charger les factures fournisseur en attente.", "Seleccione una parte para cargar las facturas pendientes.", "选择收款方以加载待付账单。", "Bekleyen faturaları yüklemek için bir taraf seçin.", "Selecione uma entidade para carregar as faturas pendentes.", "Выберите сторону для загрузки ожидающих счетов."],
  "Record money paid to a vendor and allocate it to one or more vendor bills.": ["سجل مبلغاً مدفوعاً لمورد وخصصه لفاتورة مورد واحدة أو أكثر.", "विक्रेता को किए गए भुगतान को दर्ज करें और इसे एक या अधिक विक्रेता बिलों में आवंटित करें।", "Enregistrez un règlement fournisseur et affectez-le à une ou plusieurs factures fournisseur.", "Registre un pago a un proveedor y asígnelo a una o varias facturas.", "记录向供应商支付的款项，并分配至一张或多张供应商账单。", "Tedarikçiye yapılan ödemeyi kaydedin ve bir ya da daha fazla tedarikçi faturasına dağıtın.", "Registe um pagamento a fornecedor e aloque-o a uma ou mais faturas de fornecedor.", "Зарегистрируйте платеж поставщику и распределите его по одному или нескольким счетам поставщика."],
  "Money paid to vendors, with bill allocation, approval, and voucher print.": ["إدارة المبالغ المدفوعة للموردين مع تخصيص الفواتير والاعتماد وطباعة سند الصرف.", "विक्रेताओं को किए गए भुगतान का बिल आवंटन, अनुमोदन और भुगतान वाउचर प्रिंट सहित प्रबंधन।", "Gérez les règlements fournisseurs avec affectation des factures, approbation et impression de la pièce de règlement.", "Gestione los pagos a proveedores con asignación de facturas, aprobación e impresión del comprobante.", "管理供应商付款，包括账单分配、审批和付款凭证打印。", "Tedarikçi ödemelerini fatura dağıtımı, onay ve ödeme fişi yazdırma ile yönetin.", "Gira os pagamentos a fornecedores com alocação de faturas, aprovação e impressão do comprovativo.", "Управляйте платежами поставщикам с распределением по счетам, утверждением и печатью платежного ордера."],
  "Select unpaid or partially paid vendor bills, enter payable amounts, and create grouped payment vouchers in one operation.": ["حدد فواتير الموردين غير المدفوعة أو المدفوعة جزئياً، وأدخل مبالغ الدفع، وأنشئ سندات صرف مجمعة في عملية واحدة.", "अवैतनिक या आंशिक रूप से भुगतान किए गए विक्रेता बिल चुनें, भुगतान राशि दर्ज करें और एक ही प्रक्रिया में समूहित भुगतान वाउचर बनाएं।", "Sélectionnez les factures fournisseur impayées ou partiellement réglées, saisissez les montants et créez des pièces de règlement groupées en une seule opération.", "Seleccione facturas de proveedor no pagadas o parcialmente pagadas, introduzca los importes y cree comprobantes de pago agrupados en una sola operación.", "选择未付款或部分付款的供应商账单，输入付款金额，并一次生成分组付款凭证。", "Ödenmemiş veya kısmen ödenmiş tedarikçi faturalarını seçin, tutarları girin ve tek işlemde gruplu ödeme fişleri oluşturun.", "Selecione faturas de fornecedor não pagas ou parcialmente pagas, introduza os valores e crie comprovativos de pagamento agrupados numa única operação.", "Выберите неоплаченные или частично оплаченные счета поставщиков, укажите суммы и создайте сгруппированные платежные документы одной операцией."]
});

Object.assign(direct, {
  "Locked to the selected Paid To party currency.": ["مقفل على عملة الجهة المستفيدة المحددة.", "चयनित भुगतान प्राप्तकर्ता की मुद्रा पर लॉक है।", "Verrouillé sur la devise du bénéficiaire sélectionné.", "Bloqueado en la moneda del beneficiario seleccionado.", "已锁定为所选收款方币种。", "Seçilen alacaklının para birimine kilitlendi.", "Bloqueado à moeda do beneficiário selecionado.", "Зафиксировано в валюте выбранного получателя."],
  "No saved exchange rate exists on or before the payment date. Enter the payment rate manually.": ["لا يوجد سعر صرف محفوظ في تاريخ الدفعة أو قبله. أدخل سعر الدفع يدوياً.", "भुगतान दिनांक पर या उससे पहले कोई सहेजी गई विनिमय दर नहीं है। भुगतान दर मैन्युअल रूप से दर्ज करें।", "Aucun taux de change enregistré à la date du règlement ou avant. Saisissez le taux manuellement.", "No existe un tipo de cambio guardado en la fecha del pago o anterior. Introduzca el tipo manualmente.", "付款日期或之前没有已保存汇率，请手动输入付款汇率。", "Ödeme tarihinde veya öncesinde kayıtlı kur yok. Ödeme kurunu manuel girin.", "Não existe taxa de câmbio guardada na data do pagamento ou anterior. Introduza a taxa manualmente.", "На дату платежа или ранее нет сохраненного курса. Введите курс вручную."],
  "matching bill(s)": ["فاتورة مورد مطابقة", "मेल खाने वाले बिल", "facture(s) fournisseur correspondante(s)", "factura(s) coincidente(s)", "张匹配账单", "eşleşen fatura", "fatura(s) correspondente(s)", "совпадающих счетов"],
  "matching pending bill(s) in": ["فاتورة مورد مستحقة مطابقة بعملة", "मुद्रा में मेल खाने वाले लंबित बिल", "facture(s) fournisseur en attente correspondante(s) en", "factura(s) pendiente(s) coincidente(s) en", "张匹配待付账单，币种", "para biriminde eşleşen bekleyen fatura", "fatura(s) pendente(s) correspondente(s) em", "совпадающих ожидающих счетов в валюте"],
  "Allocate vendor payment against vendor bill outstanding amounts.": ["خصص دفعة المورد مقابل المبالغ المستحقة في فواتير المورد.", "विक्रेता भुगतान को विक्रेता बिल की बकाया राशियों में आवंटित करें।", "Affectez le règlement fournisseur aux montants restant dus des factures fournisseur.", "Asigne el pago del proveedor a los importes pendientes de las facturas.", "将供应商付款分配至供应商账单的未付金额。", "Tedarikçi ödemesini fatura bakiyelerine dağıtın.", "Aloque o pagamento do fornecedor aos valores pendentes das faturas.", "Распределите платеж поставщику по остаткам счетов поставщика."],
  "Bills in other currencies cannot be allocated to this payment.": ["لا يمكن تخصيص فواتير بعملات أخرى لهذه الدفعة.", "अन्य मुद्राओं के बिल इस भुगतान में आवंटित नहीं किए जा सकते।", "Les factures dans d'autres devises ne peuvent pas être affectées à ce règlement.", "Las facturas en otras monedas no se pueden asignar a este pago.", "其他币种的账单不能分配至此付款。", "Diğer para birimlerindeki faturalar bu ödemeye dağıtılamaz.", "As faturas noutras moedas não podem ser alocadas a este pagamento.", "Счета в других валютах нельзя распределить на этот платеж."],
  "Approve and post accounting entries after creating payment vouchers": ["اعتماد وترحيل القيود المحاسبية بعد إنشاء سندات الصرف", "भुगतान वाउचर बनाने के बाद लेखांकन प्रविष्टियों को स्वीकृत और पोस्ट करें", "Approuver et comptabiliser les écritures après création des pièces de règlement", "Aprobar y contabilizar los asientos tras crear los comprobantes de pago", "创建付款凭证后审批并过账会计分录", "Ödeme fişleri oluşturulduktan sonra muhasebe kayıtlarını onayla ve işle", "Aprovar e contabilizar os lançamentos após criar os comprovativos de pagamento", "Утвердить и провести бухгалтерские записи после создания платежных документов"],
  "Bulk payment created": ["تم إنشاء الدفعة المجمعة", "थोक भुगतान बनाया गया", "Paiement groupé créé", "Pago masivo creado", "批量付款已创建", "Toplu ödeme oluşturuldu", "Pagamento em lote criado", "Массовый платеж создан"],
  "Vendor payment created": ["تم إنشاء دفعة المورد", "विक्रेता भुगतान बनाया गया", "Règlement fournisseur créé", "Pago a proveedor creado", "供应商付款已创建", "Tedarikçi ödemesi oluşturuldu", "Pagamento a fornecedor criado", "Платеж поставщику создан"],
  "Payment updated": ["تم تحديث الدفعة", "भुगतान अपडेट किया गया", "Règlement mis à jour", "Pago actualizado", "付款已更新", "Ödeme güncellendi", "Pagamento atualizado", "Платеж обновлен"],
  "Payment details, allocations, and exchange gain/loss.": ["تفاصيل الدفعة والتخصيصات وأرباح/خسائر فروق العملة.", "भुगतान विवरण, आवंटन और विनिमय लाभ/हानि।", "Détails du règlement, affectations et gains/pertes de change.", "Detalles del pago, asignaciones y ganancias/pérdidas cambiarias.", "付款明细、分配及汇兑损益。", "Ödeme ayrıntıları, dağıtımlar ve kur farkı geliri/gideri.", "Detalhes do pagamento, alocações e ganhos/perdas cambiais.", "Данные платежа, распределение и курсовые прибыли/убытки."],
  "Payment date is required.": ["تاريخ الدفعة مطلوب.", "भुगतान दिनांक आवश्यक है।", "La date de règlement est obligatoire.", "La fecha de pago es obligatoria.", "付款日期为必填项。", "Ödeme tarihi zorunludur.", "A data do pagamento é obrigatória.", "Дата платежа обязательна."],
  "Payment currency is required.": ["عملة الدفعة مطلوبة.", "भुगतान मुद्रा आवश्यक है।", "La devise de règlement est obligatoire.", "La moneda del pago es obligatoria.", "付款币种为必填项。", "Ödeme para birimi zorunludur.", "A moeda do pagamento é obrigatória.", "Валюта платежа обязательна."],
  "Select either bank account or cash account.": ["اختر إما حساباً بنكياً أو حساب نقدية.", "बैंक खाता या नकद खाता चुनें।", "Sélectionnez soit un compte bancaire, soit un compte de caisse.", "Seleccione una cuenta bancaria o una cuenta de caja.", "请选择银行账户或现金账户。", "Banka hesabı veya kasa hesabı seçin.", "Selecione uma conta bancária ou uma conta de caixa.", "Выберите банковский или кассовый счет."],
  "Select at least one voucher.": ["اختر مستنداً واحداً على الأقل.", "कम से कम एक वाउचर चुनें।", "Sélectionnez au moins une pièce.", "Seleccione al menos un comprobante.", "请至少选择一个凭证。", "En az bir fiş seçin.", "Selecione pelo menos um comprovativo.", "Выберите хотя бы один документ."],
  "Selected voucher is no longer available.": ["المستند المحدد لم يعد متاحاً.", "चयनित वाउचर अब उपलब्ध नहीं है।", "La pièce sélectionnée n'est plus disponible.", "El comprobante seleccionado ya no está disponible.", "所选凭证已不可用。", "Seçilen fiş artık kullanılamıyor.", "O comprovativo selecionado já não está disponível.", "Выбранный документ больше недоступен."],
  "voucher currency must match payment currency.": ["يجب أن تتطابق عملة المستند مع عملة الدفعة.", "वाउचर मुद्रा भुगतान मुद्रा से मेल खानी चाहिए।", "la devise de la pièce doit correspondre à celle du règlement.", "la moneda del comprobante debe coincidir con la del pago.", "凭证币种必须与付款币种一致。", "fiş para birimi ödeme para birimiyle eşleşmelidir.", "a moeda do comprovativo deve corresponder à moeda do pagamento.", "валюта документа должна совпадать с валютой платежа."],
  "payment amount must be greater than zero.": ["يجب أن يكون مبلغ الدفعة أكبر من صفر.", "भुगतान राशि शून्य से अधिक होनी चाहिए।", "le montant du règlement doit être supérieur à zéro.", "el importe del pago debe ser mayor que cero.", "付款金额必须大于零。", "ödeme tutarı sıfırdan büyük olmalıdır.", "o valor do pagamento deve ser superior a zero.", "сумма платежа должна быть больше нуля."],
  "payment amount exceeds outstanding.": ["مبلغ الدفعة يتجاوز المبلغ المستحق.", "भुगतान राशि बकाया से अधिक है।", "le montant du règlement dépasse le solde restant.", "el importe del pago supera el pendiente.", "付款金额超过未付余额。", "ödeme tutarı bakiyeyi aşıyor.", "o valor do pagamento excede o saldo pendente.", "сумма платежа превышает остаток."],
  "Total payment amount must be greater than zero.": ["يجب أن يكون إجمالي مبلغ الدفعة أكبر من صفر.", "कुल भुगतान राशि शून्य से अधिक होनी चाहिए।", "Le montant total du règlement doit être supérieur à zéro.", "El importe total del pago debe ser mayor que cero.", "付款总额必须大于零。", "Toplam ödeme tutarı sıfırdan büyük olmalıdır.", "O valor total do pagamento deve ser superior a zero.", "Общая сумма платежа должна быть больше нуля."],
  "Bank charges cannot exceed total payment amount.": ["لا يمكن أن تتجاوز الرسوم البنكية إجمالي مبلغ الدفعة.", "बैंक शुल्क कुल भुगतान राशि से अधिक नहीं हो सकते।", "Les frais bancaires ne peuvent pas dépasser le montant total du règlement.", "Los gastos bancarios no pueden superar el importe total del pago.", "银行手续费不能超过付款总额。", "Banka masrafları toplam ödeme tutarını aşamaz.", "Os encargos bancários não podem exceder o valor total do pagamento.", "Банковские комиссии не могут превышать общую сумму платежа."]
  ,"Only vouchers with outstanding balance can be selected.": ["يمكن تحديد المستندات ذات الرصيد المستحق فقط.", "केवल बकाया शेष वाले वाउचर चुने जा सकते हैं।", "Seules les pièces présentant un solde restant dû peuvent être sélectionnées.", "Solo se pueden seleccionar comprobantes con saldo pendiente.", "只能选择存在未付余额的凭证。", "Yalnızca bakiyesi bulunan fişler seçilebilir.", "Só podem ser selecionados comprovativos com saldo pendente.", "Можно выбрать только документы с непогашенным остатком."]
  ,"Bank charges": ["الرسوم البنكية", "बैंक शुल्क", "Frais bancaires", "Gastos bancarios", "银行手续费", "Banka masrafları", "Encargos bancários", "Банковские комиссии"]
  ,"Payments": ["المدفوعات", "भुगतान", "Paiements", "Pagos", "付款", "Ödemeler", "Pagamentos", "Платежи"]
  ,"Bulk": ["مجمّع", "थोक", "Groupé", "Masivo", "批量", "Toplu", "Em lote", "Массовый"]
});

Object.assign(direct, {
  "Credit / Debit Notes": ["إشعارات الدائن / المدين", "क्रेडिट / डेबिट नोट", "Avoirs / notes de débit", "Notas de crédito / débito", "贷项 / 借项通知单", "Alacak / borç dekontları", "Notas de crédito / débito", "Кредит-ноты / дебет-ноты"],
  "Create Credit / Debit Note": ["إنشاء إشعار دائن / مدين", "क्रेडिट / डेबिट नोट बनाएं", "Créer un avoir / une note de débit", "Crear nota de crédito / débito", "创建贷项 / 借项通知单", "Alacak / borç dekontu oluştur", "Criar nota de crédito / débito", "Создать кредит-ноту / дебет-ноту"],
  "Credit Note": ["إشعار دائن", "क्रेडिट नोट", "Avoir", "Nota de crédito", "贷项通知单", "Alacak dekontu", "Nota de crédito", "Кредит-нота"],
  "Debit Note": ["إشعار مدين", "डेबिट नोट", "Note de débit", "Nota de débito", "借项通知单", "Borç dekontu", "Nota de débito", "Дебет-нота"],
  "New Note": ["إشعار جديد", "नया नोट", "Nouvelle note", "Nueva nota", "新建通知单", "Yeni dekont", "Nova nota", "Новая нота"],
  "Note No": ["رقم الإشعار", "नोट नंबर", "N° de note", "N.º de nota", "通知单编号", "Dekont no", "N.º da nota", "№ ноты"],
  "Note Type": ["نوع الإشعار", "नोट प्रकार", "Type de note", "Tipo de nota", "通知单类型", "Dekont türü", "Tipo de nota", "Тип ноты"],
  "Note Date": ["تاريخ الإشعار", "नोट दिनांक", "Date de la note", "Fecha de la nota", "通知单日期", "Dekont tarihi", "Data da nota", "Дата ноты"],
  "Note Items": ["بنود الإشعار", "नोट मदें", "Lignes de la note", "Líneas de la nota", "通知单明细", "Dekont kalemleri", "Linhas da nota", "Позиции ноты"],
  "Save Note": ["حفظ الإشعار", "नोट सहेजें", "Enregistrer la note", "Guardar nota", "保存通知单", "Dekontu kaydet", "Guardar nota", "Сохранить ноту"],
  "Party": ["الطرف", "पक्ष", "Tiers", "Parte", "往来方", "Taraf", "Entidade", "Контрагент"],
  "Party Type": ["نوع الطرف", "पक्ष प्रकार", "Type de tiers", "Tipo de parte", "往来方类型", "Taraf türü", "Tipo de entidade", "Тип контрагента"],
  "All Parties": ["جميع الأطراف", "सभी पक्ष", "Tous les tiers", "Todas las partes", "所有往来方", "Tüm taraflar", "Todas as entidades", "Все контрагенты"],
  "All Types": ["جميع الأنواع", "सभी प्रकार", "Tous les types", "Todos los tipos", "所有类型", "Tüm türler", "Todos os tipos", "Все типы"],
  "All Status": ["جميع الحالات", "सभी स्थितियां", "Tous les statuts", "Todos los estados", "所有状态", "Tüm durumlar", "Todos os estados", "Все статусы"],
  "Source Type": ["نوع المصدر", "स्रोत प्रकार", "Type de source", "Tipo de origen", "来源类型", "Kaynak türü", "Tipo de origem", "Тип источника"],
  "Source Reference No": ["رقم مرجع المصدر", "स्रोत संदर्भ नंबर", "N° de référence source", "N.º de referencia de origen", "来源参考号", "Kaynak referans no", "N.º de referência da origem", "№ исходного документа"],
  "Standalone": ["مستقل", "स्वतंत्र", "Autonome", "Independiente", "独立", "Bağımsız", "Independente", "Самостоятельный"],
  "Note type is fixed from the source document action.": ["نوع الإشعار محدد وفق إجراء المستند المصدر.", "नोट प्रकार स्रोत दस्तावेज़ कार्रवाई से निर्धारित है।", "Le type de note est défini par l'action du document source.", "El tipo de nota está fijado por la acción del documento de origen.", "通知单类型由来源单据操作确定。", "Dekont türü kaynak belge işleminden sabitlenmiştir.", "O tipo de nota é definido pela ação do documento de origem.", "Тип ноты задан действием исходного документа."],
  "Standalone notes are created from this screen. Use invoice or bill actions to create linked notes.": ["يتم إنشاء الإشعارات المستقلة من هذه الشاشة. استخدم إجراءات فاتورة العميل أو فاتورة المورد لإنشاء إشعارات مرتبطة.", "इस स्क्रीन से स्वतंत्र नोट बनाए जाते हैं। लिंक किए गए नोट बनाने के लिए इनवॉइस या बिल कार्रवाई का उपयोग करें।", "Les notes autonomes sont créées ici. Utilisez les actions de facture client ou fournisseur pour créer des notes liées.", "Las notas independientes se crean aquí. Use las acciones de factura para crear notas vinculadas.", "可在此创建独立通知单。请使用发票或账单操作创建关联通知单。", "Bağımsız dekontlar burada oluşturulur. Bağlantılı dekontlar için fatura işlemlerini kullanın.", "As notas independentes são criadas aqui. Utilize as ações da fatura para criar notas associadas.", "Самостоятельные ноты создаются здесь. Для связанных нот используйте действия счета."],
  "Invoice, bill, shipment, or job no": ["رقم فاتورة العميل أو فاتورة المورد أو الشحنة أو الملف", "इनवॉइस, बिल, शिपमेंट या जॉब नंबर", "N° de facture, facture fournisseur, expédition ou dossier", "N.º de factura, cuenta, envío o trabajo", "发票、账单、货运或作业编号", "Fatura, sevkiyat veya iş no", "N.º de fatura, envio ou processo", "№ счета, отправки или задания"],
  "Search note no, party, reference...": ["ابحث برقم الإشعار أو الطرف أو المرجع...", "नोट नंबर, पक्ष या संदर्भ खोजें...", "Rechercher par n° de note, tiers ou référence...", "Buscar por n.º de nota, parte o referencia...", "按通知单编号、往来方或参考号搜索...", "Dekont no, taraf veya referans ara...", "Pesquisar por n.º de nota, entidade ou referência...", "Поиск по № ноты, контрагенту или ссылке..."],
  "Search customer by name, code, or phone": ["ابحث عن العميل بالاسم أو الرمز أو الهاتف", "नाम, कोड या फोन से ग्राहक खोजें", "Rechercher un client par nom, code ou téléphone", "Buscar cliente por nombre, código o teléfono", "按名称、代码或电话搜索客户", "Müşteriyi ad, kod veya telefonla ara", "Pesquisar cliente por nome, código ou telefone", "Поиск клиента по имени, коду или телефону"],
  "Search vendor by name, code, or phone": ["ابحث عن المورد بالاسم أو الرمز أو الهاتف", "नाम, कोड या फोन से विक्रेता खोजें", "Rechercher un fournisseur par nom, code ou téléphone", "Buscar proveedor por nombre, código o teléfono", "按名称、代码或电话搜索供应商", "Tedarikçiyi ad, kod veya telefonla ara", "Pesquisar fornecedor por nome, código ou telefone", "Поиск поставщика по имени, коду или телефону"],
  "Search charge head": ["ابحث عن بند رسوم", "चार्ज हेड खोजें", "Rechercher une rubrique de frais", "Buscar concepto de cargo", "搜索费用科目", "Masraf kalemi ara", "Pesquisar rubrica de encargo", "Поиск статьи начислений"],
  "No charge head found": ["لم يتم العثور على بند رسوم", "कोई चार्ज हेड नहीं मिला", "Aucune rubrique de frais trouvée", "No se encontró ningún concepto de cargo", "未找到费用科目", "Masraf kalemi bulunamadı", "Nenhuma rubrica de encargo encontrada", "Статья начислений не найдена"],
  "Note approved and posted": ["تم اعتماد الإشعار وترحيله", "नोट स्वीकृत और पोस्ट किया गया", "Note approuvée et comptabilisée", "Nota aprobada y contabilizada", "通知单已批准并过账", "Dekont onaylandı ve muhasebeleştirildi", "Nota aprovada e contabilizada", "Нота утверждена и проведена"],
  "Note cancelled": ["تم إلغاء الإشعار", "नोट रद्द किया गया", "Note annulée", "Nota cancelada", "通知单已取消", "Dekont iptal edildi", "Nota cancelada", "Нота отменена"],
  "Note deleted": ["تم حذف الإشعار", "नोट हटाया गया", "Note supprimée", "Nota eliminada", "通知单已删除", "Dekont silindi", "Nota eliminada", "Нота удалена"],
  "Credit/debit note created": ["تم إنشاء إشعار الدائن/المدين", "क्रेडिट/डेबिट नोट बनाया गया", "Avoir / note de débit créé", "Nota de crédito/débito creada", "贷项/借项通知单已创建", "Alacak/borç dekontu oluşturuldu", "Nota de crédito/débito criada", "Кредит-нота/дебет-нота создана"],
  "Credit/debit note updated": ["تم تحديث إشعار الدائن/المدين", "क्रेडिट/डेबिट नोट अपडेट किया गया", "Avoir / note de débit mis à jour", "Nota de crédito/débito actualizada", "贷项/借项通知单已更新", "Alacak/borç dekontu güncellendi", "Nota de crédito/débito atualizada", "Кредит-нота/дебет-нота обновлена"],
  "Create a standalone or linked customer/vendor adjustment note.": ["أنشئ إشعار تسوية مستقلًا أو مرتبطًا لعميل أو مورد.", "स्वतंत्र या लिंक किया हुआ ग्राहक/विक्रेता समायोजन नोट बनाएं।", "Créez une note d'ajustement autonome ou liée pour un client ou fournisseur.", "Cree una nota de ajuste independiente o vinculada para cliente/proveedor.", "创建独立或关联的客户/供应商调整通知单。", "Bağımsız veya bağlantılı müşteri/tedarikçi düzeltme dekontu oluşturun.", "Crie uma nota de ajuste independente ou associada para cliente/fornecedor.", "Создайте самостоятельную или связанную корректировочную ноту клиента/поставщика."],
  "Customer and vendor credit/debit notes with combined approval and accounting posting.": ["إشعارات الدائن والمدين للعملاء والموردين مع الاعتماد والترحيل المحاسبي في خطوة واحدة.", "संयुक्त स्वीकृति और लेखांकन पोस्टिंग के साथ ग्राहक और विक्रेता क्रेडिट/डेबिट नोट।", "Avoirs et notes de débit clients/fournisseurs avec approbation et comptabilisation combinées.", "Notas de crédito/débito de clientes y proveedores con aprobación y contabilización combinadas.", "客户及供应商贷项/借项通知单，支持审批与会计过账一体化。", "Birleşik onay ve muhasebe kaydıyla müşteri ve tedarikçi alacak/borç dekontları.", "Notas de crédito/débito de clientes e fornecedores com aprovação e lançamento contabilístico combinados.", "Кредит-ноты и дебет-ноты клиентов/поставщиков с единым утверждением и бухгалтерской проводкой."],
  "Credit/debit note detail, approval with accounting posting, and cancellation.": ["تفاصيل إشعار الدائن/المدين والاعتماد مع الترحيل المحاسبي والإلغاء.", "क्रेडिट/डेबिट नोट विवरण, लेखांकन पोस्टिंग सहित स्वीकृति और रद्दीकरण।", "Détail de l'avoir/note de débit, approbation avec comptabilisation et annulation.", "Detalle de nota de crédito/débito, aprobación con contabilización y cancelación.", "贷项/借项通知单明细、审批过账及取消。", "Alacak/borç dekontu ayrıntıları, muhasebe kaydıyla onay ve iptal.", "Detalhe da nota de crédito/débito, aprovação com lançamento e cancelamento.", "Детали кредит-/дебет-ноты, утверждение с проводкой и отмена."],
  "Update draft note details before approval.": ["حدّث تفاصيل مسودة الإشعار قبل الاعتماد.", "स्वीकृति से पहले ड्राफ्ट नोट विवरण अपडेट करें।", "Mettez à jour le brouillon avant approbation.", "Actualice los datos del borrador antes de aprobar.", "批准前更新通知单草稿明细。", "Onaydan önce taslak dekont ayrıntılarını güncelleyin.", "Atualize os dados do rascunho antes da aprovação.", "Обновите данные черновика ноты до утверждения."],
  "Choose charge heads mapped for": ["اختر بنود الرسوم المربوطة لترحيل", "पोस्टिंग के लिए मैप किए गए चार्ज हेड चुनें", "Sélectionnez les rubriques de frais mappées pour la comptabilisation", "Seleccione los conceptos de cargo asignados para contabilizar", "选择已映射用于过账的费用科目", "Muhasebeleştirme için eşlenen masraf kalemlerini seçin", "Selecione as rubricas de encargo mapeadas para lançamento", "Выберите статьи начислений, настроенные для проводки"],
  "posting": ["الترحيل", "पोस्टिंग", "comptabilisation", "contabilización", "过账", "muhasebeleştirme", "lançamento", "проводки"],
  "Approved Date": ["تاريخ الاعتماد", "स्वीकृति दिनांक", "Date d'approbation", "Fecha de aprobación", "批准日期", "Onay tarihi", "Data de aprovação", "Дата утверждения"],
  "Posted Date": ["تاريخ الترحيل", "पोस्टिंग दिनांक", "Date de comptabilisation", "Fecha de contabilización", "过账日期", "Muhasebeleştirme tarihi", "Data de lançamento", "Дата проводки"],
  "Cancellation Reason": ["سبب الإلغاء", "रद्दीकरण कारण", "Motif d'annulation", "Motivo de cancelación", "取消原因", "İptal nedeni", "Motivo do cancelamento", "Причина отмены"],
  "Cancel note?": ["إلغاء الإشعار؟", "नोट रद्द करें?", "Annuler la note ?", "¿Cancelar la nota?", "取消通知单？", "Dekont iptal edilsin mi?", "Cancelar a nota?", "Отменить ноту?"],
  "Delete draft note?": ["حذف مسودة الإشعار؟", "ड्राफ्ट नोट हटाएं?", "Supprimer le brouillon ?", "¿Eliminar la nota en borrador?", "删除通知单草稿？", "Taslak dekont silinsin mi?", "Eliminar a nota em rascunho?", "Удалить черновик ноты?"],
  "Cancel Note": ["إلغاء الإشعار", "नोट रद्द करें", "Annuler la note", "Cancelar nota", "取消通知单", "Dekontu iptal et", "Cancelar nota", "Отменить ноту"],
  "Accounting": ["المحاسبة", "लेखांकन", "Comptabilité", "Contabilidad", "会计", "Muhasebe", "Contabilidade", "Бухгалтерия"],
  "Posted": ["مُرحّل", "पोस्ट किया गया", "Comptabilisé", "Contabilizado", "已过账", "Muhasebeleştirildi", "Contabilizado", "Проведено"],
  "Customer Receivable": ["ذمم العميل المدينة", "ग्राहक प्राप्य", "Créance client", "Cuenta por cobrar del cliente", "客户应收账款", "Müşteri alacağı", "Conta a receber do cliente", "Дебиторская задолженность клиента"],
  "Vendor Payable": ["ذمم المورد الدائنة", "विक्रेता देय", "Dette fournisseur", "Cuenta por pagar al proveedor", "供应商应付账款", "Tedarikçi borcu", "Conta a pagar ao fornecedor", "Кредиторская задолженность поставщику"],
  "Charge head accounts": ["حسابات بنود الرسوم", "चार्ज हेड खाते", "Comptes des rubriques de frais", "Cuentas de conceptos de cargo", "费用科目账户", "Masraf kalemi hesapları", "Contas das rubricas de encargo", "Счета статей начислений"],
  "Cost head accounts": ["حسابات بنود التكلفة", "कॉस्ट हेड खाते", "Comptes des rubriques de coût", "Cuentas de conceptos de coste", "成本科目账户", "Maliyet kalemi hesapları", "Contas das rubricas de custo", "Счета статей затрат"],
  "Tax payable": ["ضريبة مستحقة الدفع", "देय कर", "Taxe à payer", "Impuesto por pagar", "应付税款", "Ödenecek vergi", "Imposto a pagar", "Налог к уплате"],
  "Tax receivable": ["ضريبة مستحقة القبض", "प्राप्य कर", "Taxe à récupérer", "Impuesto por recuperar", "应收税款", "Alınacak vergi", "Imposto a recuperar", "Налог к возмещению"],
  "Currency": ["العملة", "मुद्रा", "Devise", "Moneda", "币种", "Para birimi", "Moeda", "Валюта"],
  "Exchange Rate to": ["سعر الصرف إلى", "के लिए विनिमय दर", "Taux de change vers", "Tipo de cambio a", "兑换至的汇率", "Para birimine döviz kuru", "Taxa de câmbio para", "Курс обмена к"],
  "Override Reason": ["سبب تعديل سعر الصرف", "विनिमय दर बदलाव का कारण", "Motif de modification du taux", "Motivo de modificación del tipo", "汇率调整原因", "Kur değişikliği nedeni", "Motivo da alteração da taxa", "Причина изменения курса"],
  "Manual exchange rate override": ["تعديل سعر الصرف يدويًا", "विनिमय दर मैन्युअल रूप से बदलें", "Modifier manuellement le taux de change", "Modificar manualmente el tipo de cambio", "手动调整汇率", "Döviz kurunu manuel değiştir", "Alterar manualmente a taxa de câmbio", "Изменить курс вручную"]
});

Object.assign(direct, {
  "Agent Commission": ["عمولة الوكيل", "एजेंट कमीशन", "Commission d'agent", "Comisión de agente", "代理佣金", "Acente komisyonu", "Comissão de agente", "Комиссия агента"],
  "Agent Commissions": ["عمولات الوكلاء", "एजेंट कमीशन", "Commissions d'agents", "Comisiones de agentes", "代理佣金", "Acente komisyonları", "Comissões de agentes", "Комиссии агентов"],
  "Create Agent Commission": ["إنشاء عمولة وكيل", "एजेंट कमीशन बनाएं", "Créer une commission d'agent", "Crear comisión de agente", "创建代理佣金", "Acente komisyonu oluştur", "Criar comissão de agente", "Создать комиссию агента"],
  "New Commission": ["عمولة جديدة", "नया कमीशन", "Nouvelle commission", "Nueva comisión", "新建佣金", "Yeni komisyon", "Nova comissão", "Новая комиссия"],
  "Agent Commission Statement": ["كشف عمولات الوكيل", "एजेंट कमीशन विवरण", "Relevé des commissions d'agent", "Estado de comisiones del agente", "代理佣金对账单", "Acente komisyon ekstresi", "Extrato de comissões do agente", "Ведомость комиссий агента"],
  "Commission": ["العمولة", "कमीशन", "Commission", "Comisión", "佣金", "Komisyon", "Comissão", "Комиссия"],
  "Commission Currency": ["عملة العمولة", "कमीशन मुद्रा", "Devise de commission", "Moneda de comisión", "佣金币种", "Komisyon para birimi", "Moeda da comissão", "Валюта комиссии"],
  "Commission %": ["نسبة العمولة %", "कमीशन %", "Commission %", "Comisión %", "佣金比例 %", "Komisyon %", "Comissão %", "Комиссия %"],
  "Commission Amount": ["مبلغ العمولة", "कमीशन राशि", "Montant de la commission", "Importe de la comisión", "佣金金额", "Komisyon tutarı", "Valor da comissão", "Сумма комиссии"],
  "Commission draft": ["مسودة عمولة", "कमीशन ड्राफ्ट", "Brouillon de commission", "Borrador de comisión", "佣金草稿", "Komisyon taslağı", "Rascunho de comissão", "Черновик комиссии"],
  "Save Commission Draft": ["حفظ مسودة العمولة", "कमीशन ड्राफ्ट सहेजें", "Enregistrer le brouillon de commission", "Guardar borrador de comisión", "保存佣金草稿", "Komisyon taslağını kaydet", "Guardar rascunho de comissão", "Сохранить черновик комиссии"],
  "Commission draft saved.": ["تم حفظ مسودة العمولة.", "कमीशन ड्राफ्ट सहेजा गया।", "Brouillon de commission enregistré.", "Borrador de comisión guardado.", "佣金草稿已保存。", "Komisyon taslağı kaydedildi.", "Rascunho de comissão guardado.", "Черновик комиссии сохранен."],
  "Agent and commission currency are required.": ["الوكيل وعملة العمولة مطلوبان.", "एजेंट और कमीशन मुद्रा आवश्यक हैं।", "L'agent et la devise de commission sont obligatoires.", "El agente y la moneda de comisión son obligatorios.", "代理和佣金币种为必填项。", "Acente ve komisyon para birimi zorunludur.", "O agente e a moeda da comissão são obrigatórios.", "Агент и валюта комиссии обязательны."],
  "Calculate agent commission with currency and exchange support.": ["احسب عمولة الوكيل مع دعم العملات وأسعار الصرف.", "मुद्रा और विनिमय दर समर्थन के साथ एजेंट कमीशन की गणना करें।", "Calculez la commission d'agent avec gestion des devises et du taux de change.", "Calcule la comisión del agente con soporte de moneda y tipo de cambio.", "计算代理佣金并支持币种和汇率。", "Para birimi ve döviz kuru desteğiyle acente komisyonunu hesaplayın.", "Calcule a comissão do agente com suporte de moeda e taxa de câmbio.", "Рассчитайте комиссию агента с поддержкой валюты и курса обмена."],
  "Posted commission statement from backend plus draft commission calculations.": ["كشف العمولات المرحلة من النظام إضافةً إلى حسابات مسودات العمولات.", "सर्वर से पोस्ट किया गया कमीशन विवरण और ड्राफ्ट कमीशन गणनाएं।", "Relevé des commissions comptabilisées plus calculs de commissions en brouillon.", "Estado de comisiones contabilizadas más cálculos de comisiones en borrador.", "已过账佣金对账单及佣金草稿计算。", "Muhasebeleştirilmiş komisyon ekstresi ve taslak komisyon hesapları.", "Extrato de comissões contabilizadas e cálculos de comissões em rascunho.", "Ведомость проведенных комиссий и расчеты черновиков комиссий."],
  "Commission statement from backend agent portal feed.": ["كشف العمولات من بيانات بوابة الوكيل.", "एजेंट पोर्टल डेटा से कमीशन विवरण।", "Relevé des commissions provenant du portail agent.", "Estado de comisiones obtenido del portal del agente.", "来自代理门户的佣金对账单。", "Acente portalı verilerinden komisyon ekstresi.", "Extrato de comissões proveniente do portal do agente.", "Ведомость комиссий из портала агента."],
  "Select agent": ["اختر الوكيل", "एजेंट चुनें", "Sélectionner un agent", "Seleccionar agente", "选择代理", "Acente seçin", "Selecionar agente", "Выберите агента"],
  "Source Id": ["معرف المصدر", "स्रोत आईडी", "Identifiant source", "Id. de origen", "来源 ID", "Kaynak kimliği", "ID da origem", "Идентификатор источника"],
  "Enter source reference id": ["أدخل معرف مرجع المصدر", "स्रोत संदर्भ आईडी दर्ज करें", "Saisir l'identifiant de référence source", "Introduzca el id. de referencia de origen", "输入来源参考 ID", "Kaynak referans kimliğini girin", "Introduza o ID de referência da origem", "Введите идентификатор исходного документа"],
  "Channel": ["القناة", "चैनल", "Canal", "Canal", "渠道", "Kanal", "Canal", "Канал"],
  "Search agent commissions...": ["ابحث في عمولات الوكلاء...", "एजेंट कमीशन खोजें...", "Rechercher des commissions d'agents...", "Buscar comisiones de agentes...", "搜索代理佣金...", "Acente komisyonlarında ara...", "Pesquisar comissões de agentes...", "Поиск комиссий агентов..."],
  "Agent Commission Expense": ["مصروف عمولة الوكيل", "एजेंट कमीशन व्यय", "Charge de commission d'agent", "Gasto de comisión de agente", "代理佣金费用", "Acente komisyon gideri", "Despesa de comissão de agente", "Расходы на комиссию агента"],
  "Agent Payable": ["مستحقات الوكيل", "एजेंट देय", "Dette envers l'agent", "Cuenta por pagar al agente", "应付代理款", "Acente borcu", "Conta a pagar ao agente", "Задолженность агенту"],
  "Missing fields": ["حقول ناقصة", "अनुपलब्ध फ़ील्ड", "Champs manquants", "Campos incompletos", "缺少字段", "Eksik alanlar", "Campos em falta", "Не заполнены поля"],
  "Saved": ["تم الحفظ", "सहेजा गया", "Enregistré", "Guardado", "已保存", "Kaydedildi", "Guardado", "Сохранено"],
  "Enter remarks": ["أدخل الملاحظات", "टिप्पणियां दर्ज करें", "Saisir des remarques", "Introduzca observaciones", "输入备注", "Açıklama girin", "Introduza observações", "Введите примечания"]
});

Object.assign(direct, {
  "Finance": ["المالية", "वित्त", "Finance", "Finanzas", "财务", "Finans", "Finanças", "Финансы"],
  "Finance Workbench": ["منصة العمل المالية", "वित्त कार्यक्षेत्र", "Espace de travail financier", "Área de trabajo financiera", "财务工作台", "Finans çalışma alanı", "Área de trabalho financeira", "Финансовая рабочая панель"],
  "Accounting control surface for customer receipts, vendor payments, billing, ledger posting, and reconciliation.": ["منصة رقابة محاسبية لسندات قبض العملاء ودفعات الموردين والفوترة وترحيل الأستاذ والتسوية.", "ग्राहक प्राप्तियों, विक्रेता भुगतानों, बिलिंग, लेजर पोस्टिंग और समाधान के लिए लेखांकन नियंत्रण कार्यक्षेत्र।", "Espace de contrôle comptable des encaissements clients, règlements fournisseurs, facturation, comptabilisation et rapprochement.", "Panel de control contable para recibos de clientes, pagos a proveedores, facturación, contabilización y conciliación.", "用于客户收款、供应商付款、开票、总账过账和对账的财务控制工作台。", "Müşteri tahsilatları, tedarikçi ödemeleri, faturalama, defter kaydı ve mutabakat için muhasebe kontrol alanı.", "Área de controlo contabilístico para recebimentos de clientes, pagamentos a fornecedores, faturação, lançamentos e reconciliação.", "Панель бухгалтерского контроля поступлений клиентов, платежей поставщикам, выставления счетов, проводок и сверки."],
  "Print Preview": ["معاينة الطباعة", "प्रिंट पूर्वावलोकन", "Aperçu avant impression", "Vista previa de impresión", "打印预览", "Baskı önizleme", "Pré-visualização de impressão", "Предварительный просмотр печати"],
  "Export Ledger": ["تصدير الأستاذ", "लेजर निर्यात करें", "Exporter le grand livre", "Exportar libro mayor", "导出总账", "Defteri dışa aktar", "Exportar razão", "Экспортировать бухгалтерскую книгу"],
  "Current Branch": ["الفرع الحالي", "वर्तमान शाखा", "Agence actuelle", "Sucursal actual", "当前分支机构", "Geçerli şube", "Filial atual", "Текущий филиал"],
  "Loading finance summary...": ["جارٍ تحميل الملخص المالي...", "वित्त सारांश लोड हो रहा है...", "Chargement du résumé financier...", "Cargando resumen financiero...", "正在加载财务汇总...", "Finans özeti yükleniyor...", "A carregar resumo financeiro...", "Загрузка финансовой сводки..."],
  "No finance summary is available for the selected context.": ["لا يتوفر ملخص مالي للسياق المحدد.", "चयनित संदर्भ के लिए कोई वित्त सारांश उपलब्ध नहीं है।", "Aucun résumé financier disponible pour le contexte sélectionné.", "No hay resumen financiero disponible para el contexto seleccionado.", "所选上下文没有可用的财务汇总。", "Seçilen bağlam için finans özeti bulunmuyor.", "Não existe resumo financeiro para o contexto selecionado.", "Для выбранного контекста финансовая сводка недоступна."],
  "Posting Review Queue": ["قائمة مراجعة الترحيل", "पोस्टिंग समीक्षा कतार", "File de contrôle des comptabilisations", "Cola de revisión de contabilización", "过账审核队列", "Muhasebe kayıt inceleme kuyruğu", "Fila de revisão de lançamentos", "Очередь проверки проводок"],
  "Loading posting queue...": ["جارٍ تحميل قائمة الترحيل...", "पोस्टिंग कतार लोड हो रही है...", "Chargement de la file de comptabilisation...", "Cargando cola de contabilización...", "正在加载过账队列...", "Muhasebe kayıt kuyruğu yükleniyor...", "A carregar fila de lançamentos...", "Загрузка очереди проводок..."],
  "No posting items for the current tenant and branch.": ["لا توجد بنود ترحيل للمستأجر والفرع الحاليين.", "वर्तमान टेनेंट और शाखा के लिए कोई पोस्टिंग मद नहीं है।", "Aucun élément à comptabiliser pour le tenant et l'agence actuels.", "No hay elementos para contabilizar en el tenant y la sucursal actuales.", "当前租户和分支机构没有待过账项目。", "Geçerli kiracı ve şube için muhasebeleştirilecek kayıt yok.", "Não existem itens para lançamento no tenant e filial atuais.", "Для текущего арендатора и филиала нет элементов для проводки."],
  "Voucher": ["السند", "वाउचर", "Pièce", "Comprobante", "凭证", "Fiş", "Comprovativo", "Документ"],
  "Account / Reference": ["الحساب / المرجع", "खाता / संदर्भ", "Compte / Référence", "Cuenta / Referencia", "科目 / 参考", "Hesap / Referans", "Conta / Referência", "Счет / Ссылка"],
  "Debit": ["مدين", "डेबिट", "Débit", "Debe", "借方", "Borç", "Débito", "Дебет"],
  "Credit": ["دائن", "क्रेडिट", "Crédit", "Haber", "贷方", "Alacak", "Crédito", "Кредит"],
  "Customer Outstanding": ["مستحقات العملاء", "ग्राहक बकाया", "Encours clients", "Pendiente de clientes", "客户未收款", "Müşteri alacak bakiyesi", "Valores a receber de clientes", "Дебиторская задолженность клиентов"],
  "Vendor Outstanding": ["مستحقات الموردين", "विक्रेता बकाया", "Encours fournisseurs", "Pendiente de proveedores", "供应商未付款", "Tedarikçi borç bakiyesi", "Valores a pagar a fornecedores", "Задолженность поставщикам"],
  "Draft Invoices": ["مسودات فواتير العملاء", "ड्राफ्ट इनवॉइस", "Factures client en brouillon", "Facturas de cliente en borrador", "客户发票草稿", "Taslak müşteri faturaları", "Faturas de cliente em rascunho", "Черновики счетов клиентов"],
  "Draft Vendor Bills": ["مسودات فواتير الموردين", "ड्राफ्ट विक्रेता बिल", "Factures fournisseur en brouillon", "Facturas de proveedor en borrador", "供应商账单草稿", "Taslak tedarikçi faturaları", "Faturas de fornecedor em rascunho", "Черновики счетов поставщиков"],
  "Approved Receipts": ["سندات القبض المعتمدة", "स्वीकृत प्राप्तियां", "Encaissements approuvés", "Recibos aprobados", "已批准收款", "Onaylı tahsilatlar", "Recebimentos aprovados", "Утвержденные поступления"],
  "Approved Payments": ["سندات الصرف المعتمدة", "स्वीकृत भुगतान", "Règlements approuvés", "Pagos aprobados", "已批准付款", "Onaylı ödemeler", "Pagamentos aprovados", "Утвержденные платежи"],
  "Cash and Bank": ["النقدية والبنوك", "नकद और बैंक", "Caisse et banque", "Caja y bancos", "现金及银行", "Kasa ve banka", "Caixa e bancos", "Касса и банк"],
  "Unposted Documents": ["المستندات غير المرحلة", "पोस्ट न किए गए दस्तावेज़", "Documents non comptabilisés", "Documentos no contabilizados", "未过账单据", "Muhasebeleştirilmemiş belgeler", "Documentos não lançados", "Непроведенные документы"],
  "Customer Receivables": ["ذمم العملاء المدينة", "ग्राहक प्राप्य", "Créances clients", "Cuentas por cobrar de clientes", "客户应收账款", "Müşteri alacakları", "Contas a receber de clientes", "Дебиторская задолженность клиентов"],
  "Vendor Payables": ["ذمم الموردين الدائنة", "विक्रेता देय", "Dettes fournisseurs", "Cuentas por pagar a proveedores", "供应商应付账款", "Tedarikçi borçları", "Contas a pagar a fornecedores", "Кредиторская задолженность поставщикам"],
  "Freight Expense": ["مصروف الشحن", "फ्रेट व्यय", "Frais de transport", "Gasto de flete", "货运费用", "Navlun gideri", "Despesa de frete", "Расходы на перевозку"],
  "Pending Approval": ["بانتظار الاعتماد", "स्वीकृति लंबित", "En attente d'approbation", "Pendiente de aprobación", "待审批", "Onay bekliyor", "A aguardar aprovação", "Ожидает утверждения"],
  "Review": ["مراجعة", "समीक्षा", "À vérifier", "Revisión", "审核", "İnceleme", "Revisão", "Проверка"]
});

Object.assign(direct, {
  "Accounting": ["المحاسبة", "लेखांकन", "Comptabilité", "Contabilidad", "会计", "Muhasebe", "Contabilidade", "Бухгалтерия"],
  "Accounting modules": ["وحدات المحاسبة", "लेखांकन मॉड्यूल", "Modules comptables", "Módulos contables", "会计模块", "Muhasebe modülleri", "Módulos de contabilidade", "Модули бухгалтерии"],
  "Account Groups": ["مجموعات الحسابات", "खाता समूह", "Groupes de comptes", "Grupos de cuentas", "科目组", "Hesap grupları", "Grupos de contas", "Группы счетов"],
  "Account Mapping": ["ربط الحسابات", "खाता मैपिंग", "Correspondance des comptes", "Mapeo de cuentas", "科目映射", "Hesap eşleştirme", "Mapeamento de contas", "Сопоставление счетов"],
  "Chart of Accounts": ["دليل الحسابات", "खाता सूची", "Plan comptable", "Plan de cuentas", "会计科目表", "Hesap planı", "Plano de contas", "План счетов"],
  "Chart Account": ["حساب الدليل", "खाता सूची खाता", "Compte du plan", "Cuenta del plan", "会计科目", "Hesap planı hesabı", "Conta do plano", "Счет плана"],
  "Ledger Accounts": ["حسابات الأستاذ", "लेजर खाते", "Comptes généraux", "Cuentas contables", "总账科目", "Defter hesapları", "Contas do razão", "Счета главной книги"],
  "Ledger Name": ["اسم حساب الأستاذ", "लेजर नाम", "Nom du compte", "Nombre de cuenta", "总账科目名称", "Defter hesabı adı", "Nome da conta", "Наименование счета"],
  "Ledger Code": ["رمز حساب الأستاذ", "लेजर कोड", "Code du compte", "Código de cuenta", "总账科目代码", "Defter hesabı kodu", "Código da conta", "Код счета"],
  "Ledger Entry View": ["عرض قيود الأستاذ", "लेजर प्रविष्टि दृश्य", "Vue des écritures comptables", "Vista de asientos contables", "总账分录视图", "Defter kaydı görünümü", "Vista de lançamentos", "Просмотр проводок"],
  "Financial Year": ["السنة المالية", "वित्तीय वर्ष", "Exercice financier", "Ejercicio financiero", "会计年度", "Mali yıl", "Exercício financeiro", "Финансовый год"],
  "Financial Years": ["السنوات المالية", "वित्तीय वर्ष", "Exercices financiers", "Ejercicios financieros", "会计年度", "Mali yıllar", "Exercícios financeiros", "Финансовые годы"],
  "Opening Balances": ["الأرصدة الافتتاحية", "प्रारंभिक शेष", "Soldes d'ouverture", "Saldos iniciales", "期初余额", "Açılış bakiyeleri", "Saldos de abertura", "Начальные остатки"],
  "Journal Vouchers": ["سندات اليومية", "जर्नल वाउचर", "Pièces de journal", "Comprobantes de diario", "记账凭证", "Mahsup fişleri", "Comprovativos de diário", "Журнальные ордера"],
  "Voucher": ["السند", "वाउचर", "Pièce comptable", "Comprobante", "凭证", "Fiş", "Comprovativo", "Ордер"],
  "Voucher Date": ["تاريخ السند", "वाउचर दिनांक", "Date de la pièce", "Fecha del comprobante", "凭证日期", "Fiş tarihi", "Data do comprovativo", "Дата ордера"],
  "Voucher Number": ["رقم السند", "वाउचर संख्या", "Numéro de pièce", "Número de comprobante", "凭证编号", "Fiş numarası", "Número do comprovativo", "Номер ордера"],
  "Approval Status": ["حالة الاعتماد", "अनुमोदन स्थिति", "Statut d'approbation", "Estado de aprobación", "审批状态", "Onay durumu", "Estado de aprovação", "Статус утверждения"],
  "Debit/Credit Entries": ["قيود المدين والدائن", "डेबिट/क्रेडिट प्रविष्टियाँ", "Écritures débit/crédit", "Asientos débito/crédito", "借贷分录", "Borç/alacak kayıtları", "Lançamentos a débito/crédito", "Дебетовые/кредитовые проводки"],
  "Base Debit": ["المدين بالعملة الأساسية", "आधार डेबिट", "Débit en devise de base", "Débito en moneda base", "本位币借方", "Baz para borç", "Débito em moeda base", "Дебет в базовой валюте"],
  "Base Credit": ["الدائن بالعملة الأساسية", "आधार क्रेडिट", "Crédit en devise de base", "Crédito en moneda base", "本位币贷方", "Baz para alacak", "Crédito em moeda base", "Кредит в базовой валюте"],
  "Base Currency": ["العملة الأساسية", "आधार मुद्रा", "Devise de base", "Moneda base", "本位币", "Baz para birimi", "Moeda base", "Базовая валюта"],
  "Ex Rate": ["سعر الصرف", "विनिमय दर", "Taux de change", "Tipo de cambio", "汇率", "Döviz kuru", "Taxa de câmbio", "Обменный курс"],
  "Control Ledger": ["حساب رقابي", "नियंत्रण लेजर", "Compte collectif", "Cuenta de control", "统驭科目", "Kontrol hesabı", "Conta de controlo", "Контрольный счет"],
  "Manual Posting": ["الترحيل اليدوي", "मैन्युअल पोस्टिंग", "Comptabilisation manuelle", "Contabilización manual", "手工过账", "Manuel kayıt", "Lançamento manual", "Ручная проводка"],
  "Mapping Key": ["مفتاح الربط", "मैपिंग कुंजी", "Clé de correspondance", "Clave de mapeo", "映射键", "Eşleştirme anahtarı", "Chave de mapeamento", "Ключ сопоставления"],
  "Mapping Name": ["اسم الربط", "मैपिंग नाम", "Nom de correspondance", "Nombre de mapeo", "映射名称", "Eşleştirme adı", "Nome do mapeamento", "Наименование сопоставления"],
  "Source Module": ["الوحدة المصدر", "स्रोत मॉड्यूल", "Module source", "Módulo de origen", "来源模块", "Kaynak modül", "Módulo de origem", "Исходный модуль"],
  "Normal Balance": ["الرصيد الطبيعي", "सामान्य शेष", "Solde normal", "Saldo normal", "正常余额方向", "Normal bakiye", "Saldo normal", "Нормальное сальдо"],
  "Reference Number": ["الرقم المرجعي", "संदर्भ संख्या", "Numéro de référence", "Número de referencia", "参考编号", "Referans numarası", "Número de referência", "Номер ссылки"],
  "Particulars": ["البيان", "विवरण", "Libellé", "Concepto", "摘要", "Açıklama", "Descrição", "Содержание"],
  "Narration": ["البيان المحاسبي", "विवरण", "Libellé comptable", "Glosa", "摘要", "Açıklama", "Descrição contabilística", "Назначение"],
  "Total Debit": ["إجمالي المدين", "कुल डेबिट", "Total débit", "Total debe", "借方合计", "Toplam borç", "Total débito", "Итого дебет"],
  "Total Credit": ["إجمالي الدائن", "कुल क्रेडिट", "Total crédit", "Total haber", "贷方合计", "Toplam alacak", "Total crédito", "Итого кредит"],
  "Total Base Debit": ["إجمالي المدين بالعملة الأساسية", "कुल आधार डेबिट", "Total débit en devise de base", "Total débito en moneda base", "本位币借方合计", "Toplam baz para borç", "Total débito em moeda base", "Итого дебет в базовой валюте"],
  "Total Base Credit": ["إجمالي الدائن بالعملة الأساسية", "कुल आधार क्रेडिट", "Total crédit en devise de base", "Total crédito en moneda base", "本位币贷方合计", "Toplam baz para alacak", "Total crédito em moeda base", "Итого кредит в базовой валюте"],
  "Voucher not balanced": ["السند غير متوازن", "वाउचर संतुलित नहीं है", "Pièce non équilibrée", "Comprobante descuadrado", "凭证不平衡", "Fiş dengeli değil", "Comprovativo não balanceado", "Ордер не сбалансирован"],
  "Voucher is balanced.": ["السند متوازن.", "वाउचर संतुलित है।", "La pièce est équilibrée.", "El comprobante está cuadrado.", "凭证已平衡。", "Fiş dengeli.", "O comprovativo está balanceado.", "Ордер сбалансирован."],
  "Voucher is not balanced. Submission disabled.": ["السند غير متوازن. تم تعطيل الحفظ.", "वाउचर संतुलित नहीं है। सबमिशन अक्षम है।", "La pièce n'est pas équilibrée. La soumission est désactivée.", "El comprobante no está cuadrado. El envío está deshabilitado.", "凭证不平衡，无法提交。", "Fiş dengeli değil. Gönderim devre dışı.", "O comprovativo não está balanceado. O envio está desativado.", "Ордер не сбалансирован. Отправка отключена."],
  "Open module": ["فتح الوحدة", "मॉड्यूल खोलें", "Ouvrir le module", "Abrir módulo", "打开模块", "Modülü aç", "Abrir módulo", "Открыть модуль"],
  "Search accounting...": ["البحث في المحاسبة...", "लेखांकन खोजें...", "Rechercher dans la comptabilité...", "Buscar en contabilidad...", "搜索会计模块...", "Muhasebede ara...", "Pesquisar na contabilidade...", "Поиск в бухгалтерии..."]
});

Object.assign(direct, {
  "Account Mappings": ["روابط الحسابات", "खाता मैपिंग", "Correspondances des comptes", "Mapeos de cuentas", "科目映射", "Hesap eşleştirmeleri", "Mapeamentos de contas", "Сопоставления счетов"],
  "Payment Voucher": ["سند صرف", "भुगतान वाउचर", "Pièce de règlement", "Comprobante de pago", "付款凭证", "Ödeme fişi", "Comprovativo de pagamento", "Платежный ордер"],
  "Receipt Voucher": ["سند قبض", "प्राप्ति वाउचर", "Pièce d'encaissement", "Comprobante de cobro", "收款凭证", "Tahsilat fişi", "Comprovativo de recebimento", "Приходный ордер"],
  "Contra Voucher": ["سند تحويل داخلي", "कॉन्ट्रा वाउचर", "Pièce de virement interne", "Comprobante de traspaso", "内部转账凭证", "Virman fişi", "Comprovativo de transferência interna", "Ордер внутреннего перевода"],
  "Ledger Entries": ["قيود الأستاذ", "लेजर प्रविष्टियाँ", "Écritures comptables", "Asientos contables", "总账分录", "Defter kayıtları", "Lançamentos contabilísticos", "Бухгалтерские проводки"],
  "Reconciliation": ["المطابقة", "समाधान", "Rapprochement", "Conciliación", "对账", "Mutabakat", "Reconciliação", "Сверка"],
  "Salary": ["الرواتب", "वेतन", "Salaires", "Nómina", "薪资", "Maaş", "Salários", "Заработная плата"],
  "Configure default account groups.": ["تهيئة مجموعات الحسابات الافتراضية.", "डिफ़ॉल्ट खाता समूह कॉन्फ़िगर करें।", "Configurer les groupes de comptes par défaut.", "Configurar los grupos de cuentas predeterminados.", "配置默认科目组。", "Varsayılan hesap gruplarını yapılandırın.", "Configurar os grupos de contas predefinidos.", "Настройте группы счетов по умолчанию."],
  "Account groups, ledgers, and mappings.": ["مجموعات الحسابات وحسابات الأستاذ والربط.", "खाता समूह, लेजर और मैपिंग।", "Groupes de comptes, comptes généraux et correspondances.", "Grupos de cuentas, cuentas contables y mapeos.", "科目组、总账科目和映射。", "Hesap grupları, defter hesapları ve eşleştirmeler.", "Grupos de contas, contas do razão e mapeamentos.", "Группы счетов, счета и сопоставления."],
  "Ledger account setup and maintenance.": ["إعداد وصيانة حسابات الأستاذ.", "लेजर खाता सेटअप और रखरखाव।", "Configuration et maintenance des comptes généraux.", "Configuración y mantenimiento de cuentas contables.", "总账科目设置与维护。", "Defter hesabı kurulumu ve bakımı.", "Configuração e manutenção das contas do razão.", "Настройка и обслуживание счетов."],
  "Financial year setup and closure.": ["إعداد وإقفال السنوات المالية.", "वित्तीय वर्ष सेटअप और समापन।", "Configuration et clôture des exercices financiers.", "Configuración y cierre de ejercicios financieros.", "会计年度设置与结账。", "Mali yıl kurulumu ve kapanışı.", "Configuração e encerramento dos exercícios financeiros.", "Настройка и закрытие финансовых годов."],
  "Opening balance entry and approval.": ["إدخال واعتماد الأرصدة الافتتاحية.", "प्रारंभिक शेष प्रविष्टि और अनुमोदन।", "Saisie et approbation des soldes d'ouverture.", "Registro y aprobación de saldos iniciales.", "期初余额录入与审批。", "Açılış bakiyesi girişi ve onayı.", "Registo e aprovação dos saldos de abertura.", "Ввод и утверждение начальных остатков."],
  "Business module to ledger mappings.": ["ربط وحدات الأعمال بحسابات الأستاذ.", "व्यावसायिक मॉड्यूल से लेजर मैपिंग।", "Correspondances des modules métier vers les comptes.", "Mapeos de módulos de negocio a cuentas.", "业务模块到账务科目的映射。", "İş modüllerinden defter hesaplarına eşleştirme.", "Mapeamentos dos módulos de negócio para contas.", "Сопоставление бизнес-модулей со счетами."],
  "Manual double-entry journal vouchers.": ["سندات يومية يدوية بالقيد المزدوج.", "मैन्युअल डबल-एंट्री जर्नल वाउचर।", "Pièces de journal manuelles en partie double.", "Comprobantes de diario manuales por partida doble.", "手工复式记账凭证。", "Manuel çift taraflı mahsup fişleri.", "Comprovativos de diário manuais por partidas dobradas.", "Ручные журнальные ордера двойной записи."],
  "Payment voucher entry with balancing.": ["إدخال سند صرف مع التحقق من التوازن.", "संतुलन सहित भुगतान वाउचर प्रविष्टि।", "Saisie d'une pièce de règlement avec contrôle d'équilibre.", "Registro de comprobante de pago con control de cuadre.", "带平衡校验的付款凭证录入。", "Denge kontrollü ödeme fişi girişi.", "Registo de comprovativo de pagamento com validação do balanceamento.", "Ввод платежного ордера с проверкой баланса."],
  "Receipt voucher entry with balancing.": ["إدخال سند قبض مع التحقق من التوازن.", "संतुलन सहित प्राप्ति वाउचर प्रविष्टि।", "Saisie d'une pièce d'encaissement avec contrôle d'équilibre.", "Registro de comprobante de cobro con control de cuadre.", "带平衡校验的收款凭证录入。", "Denge kontrollü tahsilat fişi girişi.", "Registo de comprovativo de recebimento com validação do balanceamento.", "Ввод приходного ордера с проверкой баланса."],
  "Contra transfer voucher entry.": ["إدخال سند تحويل داخلي.", "कॉन्ट्रा ट्रांसफर वाउचर प्रविष्टि।", "Saisie d'une pièce de virement interne.", "Registro de comprobante de traspaso interno.", "内部转账凭证录入。", "Virman fişi girişi.", "Registo de comprovativo de transferência interna.", "Ввод ордера внутреннего перевода."],
  "Posted ledger entry view.": ["عرض قيود الأستاذ المرحلة.", "पोस्ट की गई लेजर प्रविष्टियों का दृश्य।", "Vue des écritures comptabilisées.", "Vista de asientos contabilizados.", "已过账总账分录视图。", "İşlenmiş defter kayıtları görünümü.", "Vista dos lançamentos contabilizados.", "Просмотр проведенных бухгалтерских записей."],
  "Receivable and payable reconciliation.": ["مطابقة الذمم المدينة والدائنة.", "प्राप्य और देय समाधान।", "Rapprochement des créances et des dettes.", "Conciliación de cuentas por cobrar y pagar.", "应收应付对账。", "Alacak ve borç mutabakatı.", "Reconciliação de contas a receber e a pagar.", "Сверка дебиторской и кредиторской задолженности."],
  "Salary, incentive, and payslip finance support.": ["الدعم المالي للرواتب والحوافز وكشوف الرواتب.", "वेतन, प्रोत्साहन और वेतन पर्ची वित्त सहायता।", "Support financier des salaires, primes et bulletins de paie.", "Soporte financiero de nómina, incentivos y recibos salariales.", "薪资、激励和工资单财务支持。", "Maaş, prim ve bordro finans desteği.", "Suporte financeiro de salários, incentivos e recibos.", "Финансовое сопровождение зарплат, премий и расчетных листков."],
  "Create and manage accounting groups.": ["إنشاء وإدارة مجموعات الحسابات.", "खाता समूह बनाएं और प्रबंधित करें।", "Créer et gérer les groupes de comptes.", "Crear y gestionar grupos de cuentas.", "创建和管理科目组。", "Hesap grupları oluşturun ve yönetin.", "Criar e gerir grupos de contas.", "Создание и управление группами счетов."],
  "Tree view of chart accounts with hierarchy.": ["عرض شجري هرمي لدليل الحسابات.", "खाता सूची का पदानुक्रमित ट्री दृश्य।", "Vue arborescente hiérarchique du plan comptable.", "Vista jerárquica del plan de cuentas.", "会计科目表层级树视图。", "Hesap planının hiyerarşik ağaç görünümü.", "Vista hierárquica em árvore do plano de contas.", "Иерархическое дерево плана счетов."],
  "Set up financial years and close periods.": ["إعداد السنوات المالية وإقفال الفترات.", "वित्तीय वर्ष सेट करें और अवधियाँ बंद करें।", "Configurer les exercices et clôturer les périodes.", "Configurar ejercicios y cerrar períodos.", "设置会计年度并关闭期间。", "Mali yılları ayarlayın ve dönemleri kapatın.", "Configurar exercícios e encerrar períodos.", "Настройка финансовых годов и закрытие периодов."],
  "Enter opening balances for ledgers.": ["إدخال الأرصدة الافتتاحية لحسابات الأستاذ.", "लेजर के लिए प्रारंभिक शेष दर्ज करें।", "Saisir les soldes d'ouverture des comptes.", "Introducir saldos iniciales de las cuentas.", "录入总账科目期初余额。", "Defter hesapları için açılış bakiyelerini girin.", "Introduzir saldos de abertura das contas.", "Введите начальные остатки по счетам."],
  "Map business keys to ledger accounts.": ["ربط مفاتيح الأعمال بحسابات الأستاذ.", "व्यावसायिक कुंजियों को लेजर खातों से मैप करें।", "Associer les clés métier aux comptes généraux.", "Mapear claves de negocio a cuentas contables.", "将业务键映射到总账科目。", "İş anahtarlarını defter hesaplarına eşleyin.", "Mapear chaves de negócio para contas do razão.", "Сопоставьте бизнес-ключи со счетами."],
  "Draft journal vouchers with balance validation.": ["مسودات سندات اليومية مع التحقق من التوازن.", "शेष सत्यापन सहित ड्राफ्ट जर्नल वाउचर।", "Pièces de journal brouillon avec contrôle d'équilibre.", "Comprobantes de diario en borrador con validación de cuadre.", "带平衡校验的记账凭证草稿。", "Denge doğrulamalı taslak mahsup fişleri.", "Comprovativos de diário em rascunho com validação de balanceamento.", "Черновики журнальных ордеров с проверкой баланса."],
  "Ledger report view for posted entries.": ["عرض تقرير الأستاذ للقيود المرحلة.", "पोस्ट की गई प्रविष्टियों के लिए लेजर रिपोर्ट दृश्य।", "Vue du grand livre pour les écritures comptabilisées.", "Vista del mayor para asientos contabilizados.", "已过账分录的总账报表视图。", "İşlenmiş kayıtlar için defter raporu görünümü.", "Vista do relatório do razão para lançamentos contabilizados.", "Отчет по проведенным бухгалтерским записям."],
  "Balanced double-entry validation enabled.": ["تم تفعيل التحقق من توازن القيد المزدوج.", "संतुलित डबल-एंट्री सत्यापन सक्षम है।", "Le contrôle d'équilibre en partie double est activé.", "La validación de partida doble equilibrada está activa.", "复式记账平衡校验已启用。", "Dengeli çift taraflı kayıt doğrulaması etkin.", "A validação de partidas dobradas balanceadas está ativa.", "Проверка баланса двойной записи включена."],
  "Enter ledger code": ["أدخل رمز حساب الأستاذ", "लेजर कोड दर्ज करें", "Saisir le code du compte", "Introducir código de cuenta", "输入总账科目代码", "Defter hesabı kodunu girin", "Introduzir código da conta", "Введите код счета"],
  "Enter ledger name": ["أدخل اسم حساب الأستاذ", "लेजर नाम दर्ज करें", "Saisir le nom du compte", "Introducir nombre de cuenta", "输入总账科目名称", "Defter hesabı adını girin", "Introduzir nome da conta", "Введите наименование счета"],
  "Enter reference number": ["أدخل الرقم المرجعي", "संदर्भ संख्या दर्ज करें", "Saisir le numéro de référence", "Introducir número de referencia", "输入参考编号", "Referans numarasını girin", "Introduzir número de referência", "Введите номер ссылки"],
  "Enter voucher narration": ["أدخل بيان السند", "वाउचर विवरण दर्ज करें", "Saisir le libellé de la pièce", "Introducir glosa del comprobante", "输入凭证摘要", "Fiş açıklamasını girin", "Introduzir descrição do comprovativo", "Введите назначение ордера"],
  "Enter line narration": ["أدخل بيان السطر", "पंक्ति विवरण दर्ज करें", "Saisir le libellé de la ligne", "Introducir glosa de la línea", "输入分录摘要", "Satır açıklamasını girin", "Introduzir descrição da linha", "Введите назначение строки"],
  "Select chart account": ["اختر حساب الدليل", "खाता सूची खाता चुनें", "Sélectionner un compte du plan", "Seleccionar cuenta del plan", "选择会计科目", "Hesap planı hesabı seçin", "Selecionar conta do plano", "Выберите счет плана"],
  "Select currency or none": ["اختر العملة أو بدون عملة", "मुद्रा चुनें या कोई नहीं", "Sélectionner une devise ou aucune", "Seleccionar moneda o ninguna", "选择币种或不指定", "Para birimi seçin veya boş bırakın", "Selecionar moeda ou nenhuma", "Выберите валюту или без валюты"],
  "Select financial year": ["اختر السنة المالية", "वित्तीय वर्ष चुनें", "Sélectionner l'exercice financier", "Seleccionar ejercicio financiero", "选择会计年度", "Mali yıl seçin", "Selecionar exercício financeiro", "Выберите финансовый год"],
  "Select account": ["اختر الحساب", "खाता चुनें", "Sélectionner un compte", "Seleccionar cuenta", "选择科目", "Hesap seçin", "Selecionar conta", "Выберите счет"],
  "Debit amount": ["مبلغ المدين", "डेबिट राशि", "Montant au débit", "Importe al debe", "借方金额", "Borç tutarı", "Montante a débito", "Сумма дебета"],
  "Credit amount": ["مبلغ الدائن", "क्रेडिट राशि", "Montant au crédit", "Importe al haber", "贷方金额", "Alacak tutarı", "Montante a crédito", "Сумма кредита"],
  "Exchange rate": ["سعر الصرف", "विनिमय दर", "Taux de change", "Tipo de cambio", "汇率", "Döviz kuru", "Taxa de câmbio", "Обменный курс"],
  "Delete Row": ["حذف السطر", "पंक्ति हटाएं", "Supprimer la ligne", "Eliminar fila", "删除行", "Satırı sil", "Eliminar linha", "Удалить строку"],
  "New": ["جديد", "नया", "Nouveau", "Nuevo", "新建", "Yeni", "Novo", "Новый"],
  "Record": ["السجل", "रिकॉर्ड", "Enregistrement", "Registro", "记录", "Kayıt", "Registo", "Запись"]
});

Object.assign(direct, {
  "A single workspace for account setup, vouchers, ledger entries, reconciliation, and salary support.": ["مساحة عمل موحدة لإعداد الحسابات والسندات وقيود الأستاذ والمطابقة ودعم الرواتب.", "खाता सेटअप, वाउचर, लेजर प्रविष्टि, समाधान और वेतन सहायता के लिए एकीकृत कार्यक्षेत्र।", "Un espace unique pour le paramétrage comptable, les pièces, les écritures, les rapprochements et les salaires.", "Un espacio único para configuración contable, comprobantes, asientos, conciliación y nómina.", "用于科目设置、凭证、总账分录、对账和薪资支持的统一工作区。", "Hesap kurulumu, fişler, defter kayıtları, mutabakat ve maaş desteği için tek çalışma alanı.", "Um espaço único para configuração contabilística, comprovativos, lançamentos, reconciliação e salários.", "Единое рабочее пространство для настройки счетов, ордеров, проводок, сверки и зарплаты."],
  "Open setup, posting, voucher, and reconciliation screens from one place.": ["افتح شاشات الإعداد والترحيل والسندات والمطابقة من مكان واحد.", "सेटअप, पोस्टिंग, वाउचर और समाधान स्क्रीन एक ही स्थान से खोलें।", "Ouvrez les écrans de paramétrage, comptabilisation, pièces et rapprochement depuis un seul endroit.", "Abra desde un solo lugar las pantallas de configuración, contabilización, comprobantes y conciliación.", "从一个位置打开设置、过账、凭证和对账页面。", "Kurulum, kayıt, fiş ve mutabakat ekranlarını tek yerden açın.", "Abra os ecrãs de configuração, lançamento, comprovativos e reconciliação num único local.", "Открывайте экраны настройки, проводок, ордеров и сверки из одного места."],
  "No accounting screens found": ["لم يتم العثور على شاشات محاسبية", "कोई लेखांकन स्क्रीन नहीं मिली", "Aucun écran comptable trouvé", "No se encontraron pantallas contables", "未找到会计页面", "Muhasebe ekranı bulunamadı", "Não foram encontrados ecrãs de contabilidade", "Экраны бухгалтерии не найдены"],
  "Try a different search term.": ["جرّب مصطلح بحث مختلفًا.", "कोई अन्य खोज शब्द आज़माएं।", "Essayez un autre terme de recherche.", "Pruebe otro término de búsqueda.", "请尝试其他搜索词。", "Farklı bir arama terimi deneyin.", "Tente outro termo de pesquisa.", "Попробуйте другой поисковый запрос."],
  "Your current role does not have access to accounting screens.": ["دورك الحالي لا يملك صلاحية الوصول إلى شاشات المحاسبة.", "आपकी वर्तमान भूमिका को लेखांकन स्क्रीन तक पहुंच नहीं है।", "Votre rôle actuel n'a pas accès aux écrans comptables.", "Su rol actual no tiene acceso a las pantallas contables.", "您当前的角色无权访问会计页面。", "Mevcut rolünüzün muhasebe ekranlarına erişimi yok.", "A sua função atual não tem acesso aos ecrãs de contabilidade.", "У вашей текущей роли нет доступа к экранам бухгалтерии."],
  "Create Ledger Account": ["إنشاء حساب أستاذ", "लेजर खाता बनाएं", "Créer un compte général", "Crear cuenta contable", "创建总账科目", "Defter hesabı oluştur", "Criar conta do razão", "Создать счет главной книги"],
  "Create a new ledger account.": ["إنشاء حساب أستاذ جديد.", "नया लेजर खाता बनाएं।", "Créer un nouveau compte général.", "Crear una nueva cuenta contable.", "创建新的总账科目。", "Yeni bir defter hesabı oluşturun.", "Criar uma nova conta do razão.", "Создайте новый счет главной книги."],
  "Edit Ledger": ["تعديل حساب الأستاذ", "लेजर संपादित करें", "Modifier le compte", "Editar cuenta", "编辑总账科目", "Defter hesabını düzenle", "Editar conta do razão", "Изменить счет"],
  "Update ledger account properties.": ["تحديث خصائص حساب الأستاذ.", "लेजर खाता गुण अपडेट करें।", "Mettre à jour les propriétés du compte général.", "Actualizar las propiedades de la cuenta contable.", "更新总账科目属性。", "Defter hesabı özelliklerini güncelleyin.", "Atualizar propriedades da conta do razão.", "Обновите свойства счета."],
  "New Ledger": ["حساب أستاذ جديد", "नया लेजर", "Nouveau compte", "Nueva cuenta", "新建总账科目", "Yeni defter hesabı", "Nova conta do razão", "Новый счет"],
  "Account Mapping": ["ربط الحسابات", "खाता मैपिंग", "Correspondance des comptes", "Mapeo de cuentas", "科目映射", "Hesap eşleştirme", "Mapeamento de contas", "Сопоставление счетов"],
  "Group code": ["رمز المجموعة", "समूह कोड", "Code du groupe", "Código del grupo", "科目组代码", "Grup kodu", "Código do grupo", "Код группы"],
  "Group name": ["اسم المجموعة", "समूह नाम", "Nom du groupe", "Nombre del grupo", "科目组名称", "Grup adı", "Nome do grupo", "Наименование группы"],
  "Mapping key": ["مفتاح الربط", "मैपिंग कुंजी", "Clé de correspondance", "Clave de mapeo", "映射键", "Eşleştirme anahtarı", "Chave de mapeamento", "Ключ сопоставления"],
  "Mapping name": ["اسم الربط", "मैपिंग नाम", "Nom de correspondance", "Nombre de mapeo", "映射名称", "Eşleştirme adı", "Nome do mapeamento", "Наименование сопоставления"],
  "Source module": ["الوحدة المصدر", "स्रोत मॉड्यूल", "Module source", "Módulo de origen", "来源模块", "Kaynak modül", "Módulo de origem", "Исходный модуль"],
  "Year code": ["رمز السنة المالية", "वित्तीय वर्ष कोड", "Code de l'exercice", "Código del ejercicio", "会计年度代码", "Mali yıl kodu", "Código do exercício", "Код финансового года"],
  "Search account...": ["البحث عن حساب...", "खाता खोजें...", "Rechercher un compte...", "Buscar cuenta...", "搜索科目...", "Hesap ara...", "Pesquisar conta...", "Поиск счета..."],
  "Select ledger": ["اختر حساب الأستاذ", "लेजर चुनें", "Sélectionner un compte général", "Seleccionar cuenta contable", "选择总账科目", "Defter hesabı seçin", "Selecionar conta do razão", "Выберите счет"],
  "Select currency": ["اختر العملة", "मुद्रा चुनें", "Sélectionner une devise", "Seleccionar moneda", "选择币种", "Para birimi seçin", "Selecionar moeda", "Выберите валюту"],
  "Start Date": ["تاريخ البدء", "प्रारंभ दिनांक", "Date de début", "Fecha de inicio", "开始日期", "Başlangıç tarihi", "Data de início", "Дата начала"],
  "End Date": ["تاريخ الانتهاء", "समाप्ति दिनांक", "Date de fin", "Fecha de fin", "结束日期", "Bitiş tarihi", "Data de fim", "Дата окончания"],
  "From Date": ["من تاريخ", "दिनांक से", "Date de début", "Fecha desde", "起始日期", "Başlangıç tarihi", "Data inicial", "Дата с"],
  "To Date": ["إلى تاريخ", "दिनांक तक", "Date de fin", "Fecha hasta", "截止日期", "Bitiş tarihi", "Data final", "Дата по"]
});

Object.assign(direct, {
  "Group": ["مجموعة حسابات", "खाता समूह", "Groupe comptable", "Grupo contable", "科目组", "Hesap grubu", "Grupo contabilístico", "Группа счетов"],
  "Setup": ["الإعداد", "सेटअप", "Paramétrage", "Configuración", "设置", "Kurulum", "Configuração", "Настройка"],
  "Ledger": ["الأستاذ العام", "लेजर", "Grand livre", "Libro mayor", "总账", "Defter", "Razão", "Главная книга"],
  "Reconcile": ["المطابقة", "समाधान", "Rapprochement", "Conciliar", "对账", "Mutabakat", "Reconciliar", "Сверка"],
  "Payroll": ["الرواتب", "पेरोल", "Paie", "Nómina", "薪资", "Bordro", "Processamento salarial", "Расчет заработной платы"]
});

Object.assign(direct, {
  "Year": ["السنة المالية", "वित्तीय वर्ष", "Exercice", "Ejercicio", "会计年度", "Mali yıl", "Exercício", "Финансовый год"],
  "Start": ["البداية", "प्रारंभ", "Début", "Inicio", "开始", "Başlangıç", "Início", "Начало"],
  "End": ["النهاية", "समाप्ति", "Fin", "Fin", "结束", "Bitiş", "Fim", "Окончание"],
  "Close": ["إقفال", "बंद करें", "Clôturer", "Cerrar", "结账", "Kapat", "Encerrar", "Закрыть"],
  "Closed": ["مقفل", "बंद", "Clôturé", "Cerrado", "已结账", "Kapalı", "Encerrado", "Закрыт"],
  "YEAR": ["السنة المالية", "वित्तीय वर्ष", "EXERCICE", "EJERCICIO", "会计年度", "MALİ YIL", "EXERCÍCIO", "ФИНАНСОВЫЙ ГОД"],
  "START": ["البداية", "प्रारंभ", "DÉBUT", "INICIO", "开始", "BAŞLANGIÇ", "INÍCIO", "НАЧАЛО"],
  "END": ["النهاية", "समाप्ति", "FIN", "FIN", "结束", "BİTİŞ", "FIM", "ОКОНЧАНИЕ"],
  "CLOSED": ["مقفل", "बंद", "CLÔTURÉ", "CERRADO", "已结账", "KAPALI", "ENCERRADO", "ЗАКРЫТ"]
});

Object.assign(direct, {
  "Reports": ["التقارير", "रिपोर्ट", "Rapports", "Informes", "报表", "Raporlar", "Relatórios", "Отчеты"],
  "Accounting Reports": ["التقارير المحاسبية", "लेखांकन रिपोर्ट", "Rapports comptables", "Informes contables", "会计报表", "Muhasebe raporları", "Relatórios contabilísticos", "Бухгалтерские отчеты"],
  "Operational Reports": ["التقارير التشغيلية", "परिचालन रिपोर्ट", "Rapports opérationnels", "Informes operativos", "运营报表", "Operasyon raporları", "Relatórios operacionais", "Операционные отчеты"],
  "Report Filters": ["فلاتر التقرير", "रिपोर्ट फ़िल्टर", "Filtres du rapport", "Filtros del informe", "报表筛选", "Rapor filtreleri", "Filtros do relatório", "Фильтры отчета"],
  "Report Output": ["نتائج التقرير", "रिपोर्ट आउटपुट", "Résultat du rapport", "Resultado del informe", "报表结果", "Rapor çıktısı", "Resultado do relatório", "Результат отчета"],
  "Accounting report with filters, export, and print preview.": ["تقرير محاسبي مع الفلاتر والتصدير ومعاينة الطباعة.", "फ़िल्टर, निर्यात और प्रिंट पूर्वावलोकन सहित लेखांकन रिपोर्ट।", "Rapport comptable avec filtres, export et aperçu avant impression.", "Informe contable con filtros, exportación y vista previa de impresión.", "支持筛选、导出和打印预览的会计报表。", "Filtre, dışa aktarma ve baskı önizlemeli muhasebe raporu.", "Relatório contabilístico com filtros, exportação e pré-visualização.", "Бухгалтерский отчет с фильтрами, экспортом и предпросмотром печати."],
  "Operational report with branch-aware filters and export options.": ["تقرير تشغيلي مع فلاتر حسب الفرع وخيارات التصدير.", "शाखा-आधारित फ़िल्टर और निर्यात विकल्पों सहित परिचालन रिपोर्ट।", "Rapport opérationnel avec filtres par agence et options d’export.", "Informe operativo con filtros por sucursal y opciones de exportación.", "支持分支机构筛选和导出选项的运营报表。", "Şube bazlı filtreler ve dışa aktarma seçenekleri içeren operasyon raporu.", "Relatório operacional com filtros por filial e opções de exportação.", "Операционный отчет с фильтрами по филиалу и экспортом."],
  "Profit report with shipment and party dimensions.": ["تقرير ربحية حسب الشحنة والطرف.", "शिपमेंट और पक्ष के आधार पर लाभ रिपोर्ट।", "Rapport de rentabilité par expédition et tiers.", "Informe de rentabilidad por envío y tercero.", "按货运和往来方维度的利润报表。", "Sevkiyat ve taraf boyutlarına göre kârlılık raporu.", "Relatório de rentabilidade por envio e entidade.", "Отчет о прибыли по отправкам и контрагентам."],
  "Original transaction currency": ["عملة المعاملة الأصلية", "मूल लेनदेन मुद्रा", "Devise d’origine de la transaction", "Moneda original de la transacción", "原交易币种", "Orijinal işlem para birimi", "Moeda original da transação", "Исходная валюта операции"],
  "Tenant base currency": ["العملة الأساسية للمستأجر", "टेनेंट आधार मुद्रा", "Devise de base du tenant", "Moneda base del tenant", "租户本位币", "Kiracı temel para birimi", "Moeda base do tenant", "Базовая валюта арендатора"],
  "Selected report currency": ["عملة التقرير المحددة", "चयनित रिपोर्ट मुद्रा", "Devise de rapport sélectionnée", "Moneda de informe seleccionada", "所选报表币种", "Seçilen rapor para birimi", "Moeda de relatório selecionada", "Выбранная валюта отчета"],
  "Print Preview": ["معاينة الطباعة", "प्रिंट पूर्वावलोकन", "Aperçu avant impression", "Vista previa de impresión", "打印预览", "Baskı önizleme", "Pré-visualização de impressão", "Предпросмотр печати"],
  "Reset Filters": ["إعادة تعيين الفلاتر", "फ़िल्टर रीसेट करें", "Réinitialiser les filtres", "Restablecer filtros", "重置筛选", "Filtreleri sıfırla", "Repor filtros", "Сбросить фильтры"],
  "View Report": ["عرض التقرير", "रिपोर्ट देखें", "Afficher le rapport", "Ver informe", "查看报表", "Raporu görüntüle", "Ver relatório", "Показать отчет"],
  "Currency": ["العملة", "मुद्रा", "Devise", "Moneda", "币种", "Para birimi", "Moeda", "Валюта"],
  "Balance": ["الرصيد", "शेष", "Solde", "Saldo", "余额", "Bakiye", "Saldo", "Остаток"],
  "Base Balance": ["الرصيد بالعملة الأساسية", "आधार मुद्रा शेष", "Solde en devise de base", "Saldo en moneda base", "本位币余额", "Temel para birimi bakiyesi", "Saldo na moeda base", "Остаток в базовой валюте"],
  "PDF": ["PDF", "PDF", "PDF", "PDF", "PDF", "PDF", "PDF", "PDF"],
  "Pdf": ["PDF", "PDF", "PDF", "PDF", "PDF", "PDF", "PDF", "PDF"],
  "Excel": ["Excel", "Excel", "Excel", "Excel", "Excel", "Excel", "Excel", "Excel"],
  "EXCEL": ["EXCEL", "EXCEL", "EXCEL", "EXCEL", "EXCEL", "EXCEL", "EXCEL", "EXCEL"],
  "CSV": ["CSV", "CSV", "CSV", "CSV", "CSV", "CSV", "CSV", "CSV"],
  "Client": ["العميل", "क्लाइंट", "Client", "Cliente", "客户端", "İstemci", "Cliente", "Клиент"],
  "CLIENT": ["العميل", "क्लाइंट", "CLIENT", "CLIENTE", "客户端", "İSTEMCİ", "CLIENTE", "КЛИЕНТ"],
  "Apply": ["تطبيق", "लागू करें", "Appliquer", "Aplicar", "应用", "Uygula", "Aplicar", "Применить"],
});

Object.assign(direct, {
  "Administration": ["الإدارة", "प्रशासन", "Administration", "Administración", "系统管理", "Yönetim", "Administração", "Администрирование"],
  "Users": ["المستخدمون", "उपयोगकर्ता", "Utilisateurs", "Usuarios", "用户", "Kullanıcılar", "Utilizadores", "Пользователи"],
  "User": ["المستخدم", "उपयोगकर्ता", "Utilisateur", "Usuario", "用户", "Kullanıcı", "Utilizador", "Пользователь"],
  "Employees": ["الموظفون", "कर्मचारी", "Employés", "Empleados", "员工", "Çalışanlar", "Colaboradores", "Сотрудники"],
  "Employee": ["الموظف", "कर्मचारी", "Employé", "Empleado", "员工", "Çalışan", "Colaborador", "Сотрудник"],
  "Roles": ["الأدوار", "भूमिकाएँ", "Rôles", "Roles", "角色", "Roller", "Funções", "Роли"],
  "Role": ["الدور", "भूमिका", "Rôle", "Rol", "角色", "Rol", "Função", "Роль"],
  "Permission Matrix": ["مصفوفة الصلاحيات", "अनुमति मैट्रिक्स", "Matrice des autorisations", "Matriz de permisos", "权限矩阵", "Yetki Matrisi", "Matriz de permissões", "Матрица разрешений"],
  "Permissions": ["الصلاحيات", "अनुमतियाँ", "Autorisations", "Permisos", "权限", "Yetkiler", "Permissões", "Разрешения"],
  "Notification Templates": ["قوالب الإشعارات", "सूचना टेम्पलेट", "Modèles de notification", "Plantillas de notificación", "通知模板", "Bildirim Şablonları", "Modelos de notificação", "Шаблоны уведомлений"],
  "Notification History": ["سجل الإشعارات", "सूचना इतिहास", "Historique des notifications", "Historial de notificaciones", "通知历史", "Bildirim Geçmişi", "Histórico de notificações", "История уведомлений"],
  "My Notifications": ["إشعاراتي", "मेरी सूचनाएँ", "Mes notifications", "Mis notificaciones", "我的通知", "Bildirimlerim", "As minhas notificações", "Мои уведомления"],
  "Designations": ["المسميات الوظيفية", "पदनाम", "Désignations", "Designaciones", "职位", "Unvanlar", "Cargos", "Должности"],
  "Designation": ["المسمى الوظيفي", "पदनाम", "Désignation", "Designación", "职位", "Unvan", "Cargo", "Должность"],
  "Salesman Targets": ["أهداف مندوبي المبيعات", "सेल्समैन लक्ष्य", "Objectifs commerciaux", "Objetivos de vendedores", "销售目标", "Satış Temsilcisi Hedefleri", "Metas de vendedores", "Цели менеджеров по продажам"],
  "Incentive Rules": ["قواعد الحوافز", "प्रोत्साहन नियम", "Règles d'intéressement", "Reglas de incentivos", "激励规则", "Prim Kuralları", "Regras de incentivo", "Правила премирования"],
  "Parent-Child Incentive Report": ["تقرير حوافز الهيكل الوظيفي", "अभिभावक-अधीनस्थ प्रोत्साहन रिपोर्ट", "Rapport hiérarchique des primes", "Informe jerárquico de incentivos", "上下级激励报表", "Üst-Alt Çalışan Prim Raporu", "Relatório hierárquico de incentivos", "Иерархический отчёт по премиям"],
  "Username": ["اسم المستخدم", "उपयोगकर्ता नाम", "Nom d'utilisateur", "Nombre de usuario", "用户名", "Kullanıcı adı", "Nome de utilizador", "Имя пользователя"],
  "Password": ["كلمة المرور", "पासवर्ड", "Mot de passe", "Contraseña", "密码", "Parola", "Palavra-passe", "Пароль"],
  "First Name": ["الاسم الأول", "पहला नाम", "Prénom", "Nombre", "名字", "Ad", "Nome próprio", "Имя"],
  "Last Name": ["اسم العائلة", "उपनाम", "Nom", "Apellido", "姓氏", "Soyad", "Apelido", "Фамилия"],
  "Lock Status": ["حالة القفل", "लॉक स्थिति", "État de verrouillage", "Estado de bloqueo", "锁定状态", "Kilit Durumu", "Estado de bloqueio", "Статус блокировки"],
  "Locked": ["مقفل", "लॉक", "Verrouillé", "Bloqueado", "已锁定", "Kilitli", "Bloqueado", "Заблокирован"],
  "Unlocked": ["غير مقفل", "अनलॉक", "Déverrouillé", "Desbloqueado", "未锁定", "Kilidi Açık", "Desbloqueado", "Разблокирован"],
  "System Role": ["دور نظام", "सिस्टम भूमिका", "Rôle système", "Rol del sistema", "系统角色", "Sistem Rolü", "Função do sistema", "Системная роль"],
  "Active User": ["مستخدم نشط", "सक्रिय उपयोगकर्ता", "Utilisateur actif", "Usuario activo", "启用用户", "Aktif Kullanıcı", "Utilizador ativo", "Активный пользователь"],
  "Employee Code": ["رمز الموظف", "कर्मचारी कोड", "Code employé", "Código de empleado", "员工代码", "Çalışan Kodu", "Código do colaborador", "Код сотрудника"],
  "Employee Name": ["اسم الموظف", "कर्मचारी नाम", "Nom de l'employé", "Nombre del empleado", "员工姓名", "Çalışan Adı", "Nome do colaborador", "Имя сотрудника"],
  "Reports To": ["المدير المباشر", "रिपोर्टिंग प्रबंधक", "Responsable hiérarchique", "Responsable directo", "直属上级", "Bağlı Olduğu Yönetici", "Responsável hierárquico", "Непосредственный руководитель"],
  "Eligible as Salesman": ["مؤهل كمندوب مبيعات", "सेल्समैन के रूप में पात्र", "Éligible comme commercial", "Elegible como vendedor", "可作为销售人员", "Satış Temsilcisi Olarak Uygun", "Elegível como vendedor", "Может работать менеджером по продажам"],
  "Active Employee": ["موظف نشط", "सक्रिय कर्मचारी", "Employé actif", "Empleado activo", "在职员工", "Aktif Çalışan", "Colaborador ativo", "Активный сотрудник"],
  "Template Code": ["رمز القالب", "टेम्पलेट कोड", "Code du modèle", "Código de plantilla", "模板代码", "Şablon Kodu", "Código do modelo", "Код шаблона"],
  "Subject Template": ["قالب الموضوع", "विषय टेम्पलेट", "Modèle d'objet", "Plantilla de asunto", "主题模板", "Konu Şablonu", "Modelo de assunto", "Шаблон темы"],
  "Body Template": ["قالب المحتوى", "संदेश टेम्पलेट", "Modèle du message", "Plantilla del mensaje", "正文模板", "Mesaj Şablonu", "Modelo da mensagem", "Шаблон сообщения"],
  "Placeholder Guide": ["دليل الحقول البديلة", "प्लेसहोल्डर मार्गदर्शिका", "Guide des variables", "Guía de marcadores", "占位符指南", "Yer Tutucu Kılavuzu", "Guia de marcadores", "Руководство по подстановочным полям"],
  "Channel": ["القناة", "चैनल", "Canal", "Canal", "渠道", "Kanal", "Canal", "Канал"],
  "Event": ["الحدث", "ईवेंट", "Événement", "Evento", "事件", "Olay", "Evento", "Событие"],
  "Queued": ["في قائمة الانتظار", "कतार में", "En file d'attente", "En cola", "已排队", "Kuyrukta", "Em fila", "В очереди"],
  "Retries": ["محاولات الإعادة", "पुनः प्रयास", "Tentatives", "Reintentos", "重试次数", "Yeniden Denemeler", "Novas tentativas", "Повторные попытки"],
  "Mark Read": ["تحديد كمقروء", "पढ़ा हुआ चिह्नित करें", "Marquer comme lu", "Marcar como leído", "标记为已读", "Okundu Olarak İşaretle", "Marcar como lida", "Отметить как прочитанное"],
  "Module": ["الوحدة", "मॉड्यूल", "Module", "Módulo", "模块", "Modül", "Módulo", "Модуль"],
  "Modules": ["الوحدات", "मॉड्यूल", "Modules", "Módulos", "模块", "Modüller", "Módulos", "Модули"],
  "Email": ["البريد الإلكتروني", "ईमेल", "E-mail", "Correo electrónico", "电子邮件", "E-posta", "E-mail", "Электронная почта"],
  "Joining": ["تاريخ الالتحاق", "जॉइनिंग", "Embauche", "Ingreso", "入职", "İşe giriş", "Admissão", "Приём на работу"],
  "Joining Date": ["تاريخ الالتحاق", "जॉइनिंग तिथि", "Date d'embauche", "Fecha de ingreso", "入职日期", "İşe giriş tarihi", "Data de admissão", "Дата приёма"],
  "Tenant scope": ["نطاق المستأجر", "टेनेंट दायरा", "Périmètre tenant", "Ámbito del tenant", "租户范围", "Kiracı kapsamı", "Âmbito do tenant", "Область арендатора"],
  "Tenant Scope": ["نطاق المستأجر", "टेनेंट दायरा", "Périmètre tenant", "Ámbito del tenant", "租户范围", "Kiracı kapsamı", "Âmbito do tenant", "Область арендатора"],
  "Override": ["تجاوز", "ओवरराइड", "Forçage", "Anulación", "覆盖", "Geçersiz kılma", "Substituição", "Переопределение"],
  "Notification": ["إشعار", "सूचना", "Notification", "Notificación", "通知", "Bildirim", "Notificação", "Уведомление"],
  "Notifications": ["الإشعارات", "सूचनाएँ", "Notifications", "Notificaciones", "通知", "Bildirimler", "Notificações", "Уведомления"],
  "Template": ["قالب", "टेम्पलेट", "Modèle", "Plantilla", "模板", "Şablon", "Modelo", "Шаблон"],
  "Any enabled language": ["أي لغة مفعلة", "कोई भी सक्षम भाषा", "Toute langue activée", "Cualquier idioma habilitado", "任何已启用语言", "Etkin herhangi bir dil", "Qualquer idioma ativo", "Любой включённый язык"],
  "Use": ["استخدم", "उपयोग करें", "Utiliser", "Usar", "使用", "Kullan", "Usar", "Использовать"],
  "Default template for selected event/channel/language": ["القالب الافتراضي للحدث/القناة/اللغة المحددة", "चयनित ईवेंट/चैनल/भाषा के लिए डिफ़ॉल्ट टेम्पलेट", "Modèle par défaut pour l'événement, le canal et la langue sélectionnés", "Plantilla predeterminada para el evento/canal/idioma seleccionado", "所选事件/渠道/语言的默认模板", "Seçilen olay/kanal/dil için varsayılan şablon", "Modelo predefinido para o evento/canal/idioma selecionado", "Шаблон по умолчанию для выбранного события/канала/языка"],
  "Shipment {{shipmentNumber}} departed": ["غادرت الشحنة {{shipmentNumber}}", "शिपमेंट {{shipmentNumber}} रवाना हुआ", "L'expédition {{shipmentNumber}} est partie", "El envío {{shipmentNumber}} ha salido", "货运 {{shipmentNumber}} 已启运", "{{shipmentNumber}} numaralı sevkiyat çıkış yaptı", "O envio {{shipmentNumber}} partiu", "Отправление {{shipmentNumber}} выбыло"],
  "Hello {{customerName}}, your shipment {{shipmentNumber}} status is {{status}}.": ["مرحباً {{customerName}}، حالة شحنتك {{shipmentNumber}} هي {{status}}.", "नमस्ते {{customerName}}, आपके शिपमेंट {{shipmentNumber}} की स्थिति {{status}} है।", "Bonjour {{customerName}}, le statut de votre expédition {{shipmentNumber}} est {{status}}.", "Hola {{customerName}}, el estado de su envío {{shipmentNumber}} es {{status}}.", "您好 {{customerName}}，您的货运 {{shipmentNumber}} 状态为 {{status}}。", "Merhaba {{customerName}}, {{shipmentNumber}} numaralı sevkiyatınızın durumu {{status}}.", "Olá {{customerName}}, o estado do seu envio {{shipmentNumber}} é {{status}}.", "Здравствуйте, {{customerName}}, статус отправления {{shipmentNumber}}: {{status}}."],
  "Create Role": ["إنشاء دور", "भूमिका बनाएँ", "Créer un rôle", "Crear rol", "创建角色", "Rol oluştur", "Criar função", "Создать роль"],
  "New Role": ["دور جديد", "नई भूमिका", "Nouveau rôle", "Nuevo rol", "新建角色", "Yeni rol", "Nova função", "Новая роль"],
  "Edit Role": ["تعديل الدور", "भूमिका संपादित करें", "Modifier le rôle", "Editar rol", "编辑角色", "Rolü düzenle", "Editar função", "Изменить роль"],
  "Save Role": ["حفظ الدور", "भूमिका सहेजें", "Enregistrer le rôle", "Guardar rol", "保存角色", "Rolü kaydet", "Guardar função", "Сохранить роль"],
  "Role Name": ["اسم الدور", "भूमिका नाम", "Nom du rôle", "Nombre del rol", "角色名称", "Rol adı", "Nome da função", "Название роли"],
  "Create User": ["إنشاء مستخدم", "उपयोगकर्ता बनाएँ", "Créer un utilisateur", "Crear usuario", "创建用户", "Kullanıcı oluştur", "Criar utilizador", "Создать пользователя"],
  "New User": ["مستخدم جديد", "नया उपयोगकर्ता", "Nouvel utilisateur", "Nuevo usuario", "新建用户", "Yeni kullanıcı", "Novo utilizador", "Новый пользователь"],
  "Edit User": ["تعديل المستخدم", "उपयोगकर्ता संपादित करें", "Modifier l'utilisateur", "Editar usuario", "编辑用户", "Kullanıcıyı düzenle", "Editar utilizador", "Изменить пользователя"],
  "Save User": ["حفظ المستخدم", "उपयोगकर्ता सहेजें", "Enregistrer l'utilisateur", "Guardar usuario", "保存用户", "Kullanıcıyı kaydet", "Guardar utilizador", "Сохранить пользователя"],
  "Create Employee": ["إنشاء موظف", "कर्मचारी बनाएँ", "Créer un employé", "Crear empleado", "创建员工", "Çalışan oluştur", "Criar colaborador", "Создать сотрудника"],
  "New Employee": ["موظف جديد", "नया कर्मचारी", "Nouvel employé", "Nuevo empleado", "新建员工", "Yeni çalışan", "Novo colaborador", "Новый сотрудник"],
  "Edit Employee": ["تعديل الموظف", "कर्मचारी संपादित करें", "Modifier l'employé", "Editar empleado", "编辑员工", "Çalışanı düzenle", "Editar colaborador", "Изменить сотрудника"],
  "Save Employee": ["حفظ الموظف", "कर्मचारी सहेजें", "Enregistrer l'employé", "Guardar empleado", "保存员工", "Çalışanı kaydet", "Guardar colaborador", "Сохранить сотрудника"],
  "Add Designation": ["إضافة مسمى وظيفي", "पदनाम जोड़ें", "Ajouter une désignation", "Añadir designación", "添加职位", "Unvan ekle", "Adicionar cargo", "Добавить должность"],
  "Update Designation": ["تحديث المسمى الوظيفي", "पदनाम अपडेट करें", "Mettre à jour la désignation", "Actualizar designación", "更新职位", "Unvanı güncelle", "Atualizar cargo", "Обновить должность"],
  "Create Notification Template": ["إنشاء قالب إشعار", "सूचना टेम्पलेट बनाएँ", "Créer un modèle de notification", "Crear plantilla de notificación", "创建通知模板", "Bildirim şablonu oluştur", "Criar modelo de notificação", "Создать шаблон уведомления"],
  "New Template": ["قالب جديد", "नया टेम्पलेट", "Nouveau modèle", "Nueva plantilla", "新建模板", "Yeni şablon", "Novo modelo", "Новый шаблон"],
  "Edit Notification Template": ["تعديل قالب الإشعار", "सूचना टेम्पलेट संपादित करें", "Modifier le modèle de notification", "Editar plantilla de notificación", "编辑通知模板", "Bildirim şablonunu düzenle", "Editar modelo de notificação", "Изменить шаблон уведомления"],
  "Save Template": ["حفظ القالب", "टेम्पलेट सहेजें", "Enregistrer le modèle", "Guardar plantilla", "保存模板", "Şablonu kaydet", "Guardar modelo", "Сохранить шаблон"],
  "Employee (optional)": ["الموظف (اختياري)", "कर्मचारी (वैकल्पिक)", "Employé (facultatif)", "Empleado (opcional)", "员工（可选）", "Çalışan (isteğe bağlı)", "Colaborador (opcional)", "Сотрудник (необязательно)"],
  "Salesman": ["مندوب المبيعات", "सेल्समैन", "Commercial", "Vendedor", "销售人员", "Satış temsilcisi", "Vendedor", "Менеджер по продажам"],
  "Password reset requested": ["تم طلب إعادة تعيين كلمة المرور", "पासवर्ड रीसेट का अनुरोध किया गया", "Réinitialisation du mot de passe demandée", "Restablecimiento de contraseña solicitado", "已请求重置密码", "Parola sıfırlama istendi", "Reposição da palavra-passe solicitada", "Запрошен сброс пароля"],
  "User status changed": ["تم تغيير حالة المستخدم", "उपयोगकर्ता स्थिति बदली गई", "Statut de l'utilisateur modifié", "Estado del usuario actualizado", "用户状态已更改", "Kullanıcı durumu değiştirildi", "Estado do utilizador alterado", "Статус пользователя изменён"],
  "Locked because this salesman is inherited from the operation.": ["مقفل لأن مندوب المبيعات موروث من العملية.", "लॉक किया गया क्योंकि सेल्समैन ऑपरेशन से प्राप्त हुआ है।", "Verrouillé car le commercial est hérité de l'opération.", "Bloqueado porque el vendedor se hereda de la operación.", "已锁定，因为销售人员继承自业务操作。", "Satış temsilcisi operasyondan devralındığı için kilitlidir.", "Bloqueado porque o vendedor é herdado da operação.", "Заблокировано, так как менеджер по продажам унаследован из операции."],
  "Targets and incentives include only records linked to a Salesman. Already calculated invoices or collections are skipped in the next run.": ["تشمل الأهداف والحوافز السجلات المرتبطة بمندوب مبيعات فقط. يتم استبعاد الفواتير أو التحصيلات المحتسبة مسبقاً من التشغيل التالي.", "लक्ष्य और प्रोत्साहन में केवल सेल्समैन से जुड़े रिकॉर्ड शामिल होते हैं। पहले से गणना किए गए इनवॉइस या संग्रह अगली गणना में छोड़ दिए जाते हैं।", "Les objectifs et primes incluent uniquement les enregistrements liés à un commercial. Les factures ou encaissements déjà calculés sont ignorés lors du prochain traitement.", "Los objetivos e incentivos solo incluyen registros vinculados a un vendedor. Las facturas o cobros ya calculados se omiten en la siguiente ejecución.", "目标和激励仅包含关联销售人员的记录。已计算的发票或收款将在下次运行时跳过。", "Hedefler ve primler yalnızca satış temsilcisine bağlı kayıtları içerir. Daha önce hesaplanan faturalar veya tahsilatlar sonraki çalıştırmada atlanır.", "As metas e incentivos incluem apenas registos associados a um vendedor. Faturas ou recebimentos já calculados são ignorados na execução seguinte.", "Цели и премии учитывают только записи, связанные с менеджером по продажам. Уже рассчитанные счета или поступления пропускаются при следующем запуске."],
  "Create user and assign tenant/branch scope.": ["إنشاء مستخدم وتحديد نطاق المستأجر والفرع.", "उपयोगकर्ता बनाएँ और टेनेंट/शाखा दायरा निर्धारित करें।", "Créer un utilisateur et définir son périmètre tenant/agence.", "Crear un usuario y asignar el ámbito de tenant/sucursal.", "创建用户并分配租户/分支范围。", "Kullanıcı oluşturun ve kiracı/şube kapsamını atayın.", "Criar um utilizador e atribuir o âmbito de tenant/filial.", "Создайте пользователя и назначьте область арендатора/филиала."],
  "Manage users, role assignments, access status, and security actions.": ["إدارة المستخدمين والأدوار وحالة الوصول وإجراءات الأمان.", "उपयोगकर्ता, भूमिका असाइनमेंट, पहुँच स्थिति और सुरक्षा कार्य प्रबंधित करें।", "Gérer les utilisateurs, rôles, accès et actions de sécurité.", "Gestionar usuarios, roles, estado de acceso y acciones de seguridad.", "管理用户、角色分配、访问状态和安全操作。", "Kullanıcıları, rol atamalarını, erişim durumunu ve güvenlik işlemlerini yönetin.", "Gerir utilizadores, funções, estado de acesso e ações de segurança.", "Управляйте пользователями, ролями, доступом и действиями безопасности."],
  "Assign module-level permissions to roles.": ["تعيين صلاحيات الوحدات للأدوار.", "भूमिकाओं को मॉड्यूल-स्तरीय अनुमतियाँ दें।", "Attribuer les autorisations par module aux rôles.", "Asignar permisos por módulo a los roles.", "为角色分配模块级权限。", "Rollere modül düzeyinde yetkiler atayın.", "Atribuir permissões por módulo às funções.", "Назначайте ролям разрешения на уровне модулей."],
  "Manage channel-wise and language-aware templates for operational events.": ["إدارة قوالب الإشعارات حسب القناة واللغة للأحداث التشغيلية.", "ऑपरेशनल ईवेंट के लिए चैनल और भाषा-आधारित टेम्पलेट प्रबंधित करें।", "Gérer les modèles multilingues par canal pour les événements opérationnels.", "Gestionar plantillas por canal e idioma para eventos operativos.", "管理运营事件的多渠道、多语言模板。", "Operasyonel olaylar için kanal ve dile göre şablonları yönetin.", "Gerir modelos por canal e idioma para eventos operacionais.", "Управляйте шаблонами по каналам и языкам для операционных событий."]
});

Object.assign(direct, {
  "Audit Logs": ["سجلات التدقيق", "ऑडिट लॉग", "Journaux d'audit", "Registros de auditoría", "审计日志", "Denetim Kayıtları", "Registos de auditoria", "Журналы аудита"],
  "Audit Log Search": ["بحث سجل التدقيق", "ऑडिट लॉग खोज", "Recherche de journaux d'audit", "Búsqueda de auditoría", "审计日志查询", "Denetim Kaydı Arama", "Pesquisa de auditoria", "Поиск журнала аудита"],
  "Audit Log Detail": ["تفاصيل سجل التدقيق", "ऑडिट लॉग विवरण", "Détail du journal d'audit", "Detalle del registro de auditoría", "审计日志明细", "Denetim Kaydı Detayı", "Detalhe do registo de auditoria", "Детали журнала аудита"],
  "User Activity": ["نشاط المستخدم", "उपयोगकर्ता गतिविधि", "Activité utilisateur", "Actividad de usuario", "用户活动", "Kullanıcı Etkinliği", "Atividade do utilizador", "Активность пользователя"],
  "User Activity Timeline": ["الجدول الزمني لنشاط المستخدم", "उपयोगकर्ता गतिविधि समयरेखा", "Chronologie de l'activité utilisateur", "Cronología de actividad de usuario", "用户活动时间线", "Kullanıcı etkinliği zaman çizelgesi", "Linha cronológica da atividade do utilizador", "Хронология активности пользователя"],
  "Login History": ["سجل تسجيل الدخول", "लॉगिन इतिहास", "Historique de connexion", "Historial de inicio de sesión", "登录历史", "Giriş Geçmişi", "Histórico de início de sessão", "История входов"],
  "Entity Changes": ["تغييرات الكيان", "इकाई परिवर्तन", "Modifications d'entité", "Cambios de entidad", "实体变更", "Varlık Değişiklikleri", "Alterações da entidade", "Изменения сущности"],
  "Financial Audit Logs": ["سجلات التدقيق المالي", "वित्तीय ऑडिट लॉग", "Journaux d'audit financier", "Registros de auditoría financiera", "财务审计日志", "Mali Denetim Kayıtları", "Registos de auditoria financeira", "Журналы финансового аудита"],
  "Report Access Logs": ["سجلات الوصول إلى التقارير", "रिपोर्ट एक्सेस लॉग", "Journaux d'accès aux rapports", "Registros de acceso a informes", "报表访问日志", "Rapor Erişim Kayıtları", "Registos de acesso a relatórios", "Журналы доступа к отчётам"],
  "Export Logs": ["سجلات التصدير", "निर्यात लॉग", "Journaux d'export", "Registros de exportación", "导出日志", "Dışa Aktarma Kayıtları", "Registos de exportação", "Журналы экспорта"],
  "Print Logs": ["سجلات الطباعة", "प्रिंट लॉग", "Journaux d'impression", "Registros de impresión", "打印日志", "Yazdırma Kayıtları", "Registos de impressão", "Журналы печати"],
  "Email Logs": ["سجلات البريد الإلكتروني", "ईमेल लॉग", "Journaux e-mail", "Registros de correo", "电子邮件日志", "E-posta Kayıtları", "Registos de e-mail", "Журналы электронной почты"],
  "File Access Logs": ["سجلات الوصول إلى الملفات", "फ़ाइल एक्सेस लॉग", "Journaux d'accès aux fichiers", "Registros de acceso a archivos", "文件访问日志", "Dosya Erişim Kayıtları", "Registos de acesso a ficheiros", "Журналы доступа к файлам"],
  "API Request Logs": ["سجلات طلبات API", "API अनुरोध लॉग", "Journaux des requêtes API", "Registros de solicitudes API", "API 请求日志", "API İstek Kayıtları", "Registos de pedidos API", "Журналы API-запросов"],
  "Old vs New Values": ["القيم القديمة مقابل الجديدة", "पुराने बनाम नए मान", "Anciennes et nouvelles valeurs", "Valores anteriores y nuevos", "新旧值对比", "Eski ve Yeni Değerler", "Valores antigos vs novos", "Старые и новые значения"],
  "Changed Fields JSON": ["JSON الحقول المتغيرة", "बदले गए फ़ील्ड JSON", "JSON des champs modifiés", "JSON de campos modificados", "变更字段 JSON", "Değişen Alanlar JSON", "JSON dos campos alterados", "JSON изменённых полей"],
  "No old/new value payload available.": ["لا توجد بيانات قيم قديمة/جديدة متاحة.", "पुराने/नए मानों का पेलोड उपलब्ध नहीं है।", "Aucune donnée ancienne/nouvelle disponible.", "No hay valores anteriores/nuevos disponibles.", "没有可用的新旧值数据。", "Eski/yeni değer verisi yok.", "Não há valores antigos/novos disponíveis.", "Данные старых/новых значений недоступны."],
  "Audit detail is unavailable. Open this page from an audit list row to view full context.": ["تفاصيل التدقيق غير متاحة. افتح هذه الصفحة من صف قائمة التدقيق لعرض السياق الكامل.", "ऑडिट विवरण उपलब्ध नहीं है। पूरा संदर्भ देखने के लिए ऑडिट सूची की पंक्ति से यह पेज खोलें।", "Le détail d'audit est indisponible. Ouvrez cette page depuis une ligne de la liste d'audit pour voir le contexte complet.", "El detalle de auditoría no está disponible. Abra esta página desde una fila de la lista para ver el contexto completo.", "审计详情不可用。请从审计列表行打开此页面以查看完整上下文。", "Denetim detayı kullanılamıyor. Tam bağlamı görmek için bu sayfayı denetim listesi satırından açın.", "O detalhe de auditoria não está disponível. Abra esta página a partir de uma linha da lista para ver o contexto completo.", "Детали аудита недоступны. Откройте страницу из строки списка аудита, чтобы увидеть полный контекст."],
  "Correlation ID": ["معرّف الارتباط", "सहसंबंध आईडी", "ID de corrélation", "ID de correlación", "关联 ID", "Korelasyon Kimliği", "ID de correlação", "ID корреляции"],
  "All tenants": ["كل المستأجرين", "सभी टेनेंट", "Tous les tenants", "Todos los tenants", "所有租户", "Tüm kiracılar", "Todos os tenants", "Все арендаторы"],
  "All branches": ["كل الفروع", "सभी शाखाएँ", "Toutes les agences", "Todas las sucursales", "所有分支", "Tüm şubeler", "Todas as filiais", "Все филиалы"],
  "All users": ["كل المستخدمين", "सभी उपयोगकर्ता", "Tous les utilisateurs", "Todos los usuarios", "所有用户", "Tüm kullanıcılar", "Todos os utilizadores", "Все пользователи"],
  "All roles": ["كل الأدوار", "सभी भूमिकाएँ", "Tous les rôles", "Todos los roles", "所有角色", "Tüm roller", "Todas as funções", "Все роли"],
  "Print Preview": ["معاينة الطباعة", "प्रिंट पूर्वावलोकन", "Aperçu avant impression", "Vista previa de impresión", "打印预览", "Baskı Önizleme", "Pré-visualização de impressão", "Предпросмотр печати"],
  "Track file upload, download, preview, and delete actions.": ["تتبع إجراءات رفع الملفات وتنزيلها ومعاينتها وحذفها.", "फ़ाइल अपलोड, डाउनलोड, पूर्वावलोकन और हटाने की कार्रवाइयों को ट्रैक करें।", "Suivre les chargements, téléchargements, aperçus et suppressions de fichiers.", "Controle cargas, descargas, vistas previas y eliminaciones de archivos.", "跟踪文件上传、下载、预览和删除操作。", "Dosya yükleme, indirme, önizleme ve silme işlemlerini izleyin.", "Acompanhe carregamentos, transferências, pré-visualizações e eliminações de ficheiros.", "Отслеживайте загрузку, скачивание, просмотр и удаление файлов."],
  "Request/response audit trail with status, duration, and payload metadata.": ["مسار تدقيق الطلب/الاستجابة مع الحالة والمدة وبيانات الحمولة.", "स्थिति, अवधि और पेलोड मेटाडेटा सहित अनुरोध/प्रतिक्रिया ऑडिट ट्रेल।", "Traçabilité requête/réponse avec statut, durée et métadonnées.", "Trazabilidad de solicitud/respuesta con estado, duración y metadatos.", "包含状态、耗时和载荷元数据的请求/响应审计轨迹。", "Durum, süre ve veri meta bilgisi içeren istek/yanıt denetim izi.", "Rasto de auditoria pedido/resposta com estado, duração e metadados.", "Аудит запросов/ответов со статусом, длительностью и метаданными."],
  "Audit events related to invoices, bills, receipts, payments, and posting.": ["أحداث التدقيق المتعلقة بالفواتير وفواتير المورد وسندات القبض والمدفوعات والترحيل.", "इनवॉइस, बिल, रसीद, भुगतान और पोस्टिंग से संबंधित ऑडिट घटनाएँ।", "Événements d'audit liés aux factures, reçus, paiements et écritures.", "Eventos de auditoría de facturas, recibos, pagos y contabilización.", "与发票、账单、收款、付款和过账相关的审计事件。", "Fatura, makbuz, ödeme ve kayıt işlemleriyle ilgili denetim olayları.", "Eventos de auditoria relacionados com faturas, recibos, pagamentos e lançamento.", "События аудита по счетам, поступлениям, платежам и проводкам."],
  "Audit events for CSV/Excel/PDF export operations.": ["أحداث التدقيق لعمليات تصدير CSV/Excel/PDF.", "CSV/Excel/PDF निर्यात कार्यों की ऑडिट घटनाएँ।", "Événements d'audit pour les exports CSV/Excel/PDF.", "Eventos de auditoría para exportaciones CSV/Excel/PDF.", "CSV/Excel/PDF 导出操作的审计事件。", "CSV/Excel/PDF dışa aktarma işlemleri için denetim olayları.", "Eventos de auditoria para exportações CSV/Excel/PDF.", "События аудита операций экспорта CSV/Excel/PDF."]
  ,
  "Entity Change History": ["سجل تغييرات الكيان", "इकाई परिवर्तन इतिहास", "Historique des modifications d'entité", "Historial de cambios de entidad", "实体变更历史", "Varlık Değişiklik Geçmişi", "Histórico de alterações da entidade", "История изменений сущности"],
  "Track old/new values and field-level modifications by entity.": ["تتبع القيم القديمة/الجديدة والتعديلات على مستوى الحقول حسب الكيان.", "इकाई के अनुसार पुराने/नए मान और फ़ील्ड-स्तर परिवर्तन ट्रैक करें।", "Suivre les anciennes/nouvelles valeurs et les modifications par champ.", "Controle valores anteriores/nuevos y cambios por campo por entidad.", "按实体跟踪新旧值和字段级变更。", "Varlığa göre eski/yeni değerleri ve alan düzeyi değişiklikleri izleyin.", "Acompanhe valores antigos/novos e alterações por campo por entidade.", "Отслеживайте старые/новые значения и изменения полей по сущности."],
  "Authentication success/failure history for users.": ["سجل نجاح وفشل المصادقة للمستخدمين.", "उपयोगकर्ताओं के प्रमाणीकरण सफलता/विफलता का इतिहास।", "Historique des réussites/échecs d'authentification des utilisateurs.", "Historial de éxitos/fallos de autenticación de usuarios.", "用户认证成功/失败历史。", "Kullanıcılar için kimlik doğrulama başarı/başarısızlık geçmişi.", "Histórico de sucesso/falha de autenticação dos utilizadores.", "История успешной/неуспешной аутентификации пользователей."],
  "Failed actions only": ["الإجراءات الفاشلة فقط", "केवल विफल कार्रवाइयाँ", "Actions échouées uniquement", "Solo acciones fallidas", "仅失败操作", "Yalnızca başarısız işlemler", "Apenas ações falhadas", "Только неуспешные действия"],
  "Record #": ["رقم السجل", "रिकॉर्ड #", "N° d'enregistrement", "N.º de registro", "记录号", "Kayıt No", "N.º de registo", "№ записи"],
  "Document #": ["رقم المستند", "दस्तावेज़ #", "N° document", "N.º documento", "单据号", "Belge No", "N.º documento", "№ документа"],
  "Recipient/Detail": ["المستلم/التفاصيل", "प्राप्तकर्ता/विवरण", "Destinataire/Détail", "Destinatario/Detalle", "收件人/明细", "Alıcı/Detay", "Destinatário/Detalhe", "Получатель/детали"],
  "File/Path": ["الملف/المسار", "फ़ाइल/पथ", "Fichier/Chemin", "Archivo/Ruta", "文件/路径", "Dosya/Yol", "Ficheiro/Caminho", "Файл/путь"],
  "Audit": ["تدقيق", "ऑडिट", "Audit", "Auditoría", "审计", "Denetim", "Auditoria", "Аудит"],
  "No Data": ["لا توجد بيانات", "कोई डेटा नहीं", "Aucune donnée", "Sin datos", "无数据", "Veri yok", "Sem dados", "Нет данных"]
});

Object.assign(dictionary["ar-QA"], { Activate: "تفعيل", Deactivate: "تعطيل", user: "المستخدم", Assign: "تعيين", role: "الدور", Business: "الأعمال", employee: "الموظف", employees: "الموظفون", Calculate: "احتساب", Incentive: "الحافز", Child: "الفريق التابع", Target: "الهدف", created: "تم إنشاؤه", deleted: "تم حذفه", updated: "تم تحديثه", optional: "اختياري", Basis: "الأساس", Tree: "الهيكل", Include: "تضمين", inactive: "غير النشطين", Linked: "مرتبط", Loading: "جارٍ التحميل", Manage: "إدارة", Monitor: "مراقبة", queued: "المجدولة", sent: "المرسلة", failed: "الفاشلة", retried: "المعاد إرسالها", notifications: "الإشعارات", channels: "القنوات", Own: "الفردي", Parent: "المدير", Permission: "الصلاحية", Reusable: "قابل لإعادة الاستخدام", Revenue: "الإيراد", slab: "الشريحة", assigned: "تم تعيينه", Sales: "المبيعات", Team: "الفريق" });
Object.assign(dictionary["hi-IN"], { Activate: "सक्रिय करें", Deactivate: "निष्क्रिय करें", user: "उपयोगकर्ता", Assign: "असाइन करें", role: "भूमिका", Business: "व्यावसायिक", employee: "कर्मचारी", employees: "कर्मचारी", Calculate: "गणना करें", Incentive: "प्रोत्साहन", Child: "अधीनस्थ", Target: "लक्ष्य", created: "बनाया गया", deleted: "हटाया गया", updated: "अपडेट किया गया", optional: "वैकल्पिक", Basis: "आधार", Tree: "पदानुक्रम", Include: "शामिल करें", inactive: "निष्क्रिय", Linked: "लिंक किया गया", Loading: "लोड हो रहा है", Manage: "प्रबंधित करें", Monitor: "निगरानी करें", queued: "कतारबद्ध", sent: "भेजी गई", failed: "विफल", retried: "पुनः प्रयास की गई", notifications: "सूचनाएँ", channels: "चैनल", Own: "स्वयं", Parent: "अभिभावक", Permission: "अनुमति", Reusable: "पुन: प्रयोज्य", Revenue: "राजस्व", slab: "स्लैब", assigned: "असाइन किया गया", Sales: "बिक्री", Team: "टीम" });
Object.assign(dictionary["fr-FR"], { Activate: "Activer", Deactivate: "Désactiver", user: "utilisateur", Assign: "Attribuer", role: "rôle", Business: "Métier", employee: "employé", employees: "employés", Calculate: "Calculer", Incentive: "Prime", Child: "Équipe", Target: "Objectif", created: "créé", deleted: "supprimé", updated: "mis à jour", optional: "facultatif", Basis: "Base", Tree: "Hiérarchie", Include: "Inclure", inactive: "inactifs", Linked: "Lié", Loading: "Chargement", Manage: "Gérer", Monitor: "Surveiller", queued: "en attente", sent: "envoyées", failed: "échouées", retried: "relancées", notifications: "notifications", channels: "canaux", Own: "Individuel", Parent: "Responsable", Permission: "Autorisation", Reusable: "Réutilisable", Revenue: "Chiffre d'affaires", slab: "palier", assigned: "attribué", Sales: "Ventes", Team: "Équipe" });
Object.assign(dictionary["es-ES"], { Activate: "Activar", Deactivate: "Desactivar", user: "usuario", Assign: "Asignar", role: "rol", Business: "Empresarial", employee: "empleado", employees: "empleados", Calculate: "Calcular", Incentive: "Incentivo", Child: "Equipo subordinado", Target: "Objetivo", created: "creado", deleted: "eliminado", updated: "actualizado", optional: "opcional", Basis: "Base", Tree: "Jerarquía", Include: "Incluir", inactive: "inactivos", Linked: "Vinculado", Loading: "Cargando", Manage: "Gestionar", Monitor: "Supervisar", queued: "en cola", sent: "enviadas", failed: "fallidas", retried: "reintentadas", notifications: "notificaciones", channels: "canales", Own: "Individual", Parent: "Superior", Permission: "Permiso", Reusable: "Reutilizable", Revenue: "Ingresos", slab: "tramo", assigned: "asignado", Sales: "Ventas", Team: "Equipo" });
Object.assign(dictionary["zh-CN"], { Activate: "启用", Deactivate: "停用", user: "用户", Assign: "分配", role: "角色", Business: "业务", employee: "员工", employees: "员工", Calculate: "计算", Incentive: "激励", Child: "下属", Target: "目标", created: "已创建", deleted: "已删除", updated: "已更新", optional: "可选", Basis: "依据", Tree: "层级", Include: "包括", inactive: "停用", Linked: "已关联", Loading: "正在加载", Manage: "管理", Monitor: "监控", queued: "排队中", sent: "已发送", failed: "失败", retried: "已重试", notifications: "通知", channels: "渠道", Own: "个人", Parent: "上级", Permission: "权限", Reusable: "可复用", Revenue: "收入", slab: "阶梯", assigned: "已分配", Sales: "销售", Team: "团队" });
Object.assign(dictionary["tr-TR"], { Activate: "Etkinleştir", Deactivate: "Devre dışı bırak", user: "kullanıcı", Assign: "Ata", role: "rol", Business: "İş", employee: "çalışan", employees: "çalışanlar", Calculate: "Hesapla", Incentive: "Prim", Child: "Alt ekip", Target: "Hedef", created: "oluşturuldu", deleted: "silindi", updated: "güncellendi", optional: "isteğe bağlı", Basis: "Esas", Tree: "Hiyerarşi", Include: "Dahil et", inactive: "pasif", Linked: "Bağlı", Loading: "Yükleniyor", Manage: "Yönet", Monitor: "İzle", queued: "kuyruktaki", sent: "gönderilen", failed: "başarısız", retried: "yeniden denenen", notifications: "bildirimler", channels: "kanallar", Own: "Bireysel", Parent: "Üst", Permission: "Yetki", Reusable: "Yeniden kullanılabilir", Revenue: "Gelir", slab: "dilim", assigned: "atandı", Sales: "Satış", Team: "Ekip" });
Object.assign(dictionary["pt-PT"], { Activate: "Ativar", Deactivate: "Desativar", user: "utilizador", Assign: "Atribuir", role: "função", Business: "Empresarial", employee: "colaborador", employees: "colaboradores", Calculate: "Calcular", Incentive: "Incentivo", Child: "Equipa subordinada", Target: "Meta", created: "criado", deleted: "eliminado", updated: "atualizado", optional: "opcional", Basis: "Base", Tree: "Hierarquia", Include: "Incluir", inactive: "inativos", Linked: "Associado", Loading: "A carregar", Manage: "Gerir", Monitor: "Monitorizar", queued: "em fila", sent: "enviadas", failed: "falhadas", retried: "repetidas", notifications: "notificações", channels: "canais", Own: "Individual", Parent: "Superior", Permission: "Permissão", Reusable: "Reutilizável", Revenue: "Receita", slab: "escalão", assigned: "atribuído", Sales: "Vendas", Team: "Equipa" });
Object.assign(dictionary["ru-RU"], { Activate: "Активировать", Deactivate: "Деактивировать", user: "пользователь", Assign: "Назначить", role: "роль", Business: "Рабочий", employee: "сотрудник", employees: "сотрудники", Calculate: "Рассчитать", Incentive: "Премия", Child: "Подчинённые", Target: "Цель", created: "создан", deleted: "удалён", updated: "обновлён", optional: "необязательно", Basis: "Основание", Tree: "Иерархия", Include: "Включить", inactive: "неактивных", Linked: "Связанный", Loading: "Загрузка", Manage: "Управление", Monitor: "Мониторинг", queued: "в очереди", sent: "отправленных", failed: "неуспешных", retried: "повторных", notifications: "уведомлений", channels: "каналам", Own: "Личный", Parent: "Руководитель", Permission: "Разрешение", Reusable: "Многоразовый", Revenue: "Выручка", slab: "ступень", assigned: "назначено", Sales: "Продажи", Team: "Команда" });

loadReportMenuTranslations();

const files = listFiles(targetRoots).filter((file) => file.endsWith(".tsx"));
const values = new Set();
for (const file of files) {
  let source = readFileSync(file, "utf8");
  const original = source;
  for (const match of source.matchAll(/\blt\("((?:\\"|[^"])*)"\)/g)) values.add(match[1].replaceAll('\\"', '"'));
  source = replaceUserFacingStrings(source, values);
  if (source !== original) {
    source = ensureImport(source);
    writeFileSync(file, source, "utf8");
  }
}
for (const value of Object.keys(direct)) values.add(value);
writeCatalog(values);
const rows = buildRows(values);
writeSql(sqlInsertPath, false, rows);
writeSql(sqlUpdatePath, true, rows);
console.log(JSON.stringify({ files: files.length, resources: values.size, rows: rows.length }, null, 2));

function replaceUserFacingStrings(source, values) {
const nonDisplayTokens = new Set([
  "amber",
  "green",
  "red",
  "slate",
  "success",
  "danger",
  "neutral",
  "default",
  "outline",
  "ghost",
  "destructive",
  "proforma",
  "original",
  "New",
  "Update",
  "Delete",
  "Invoice.Create",
  "Invoice.Update",
  "Invoice",
  "Customer",
  "Vendor",
  "VendorBill",
  "Accounting",
  "Accounting.Create",
  "Accounting.Update",
  "Journal",
  "Payment",
  "Receipt",
  "Contra",
  "Draft",
  "Submitted",
  "Approved",
  "Active",
  "Inactive",
  "Locked",
  "Unlocked",
  "active",
  "inactive",
  "VendorBill.Create",
  "VendorBill.Update",
  "Receipt.Create",
  "Receipt.Update",
  "Payment.Create",
  "Payment.Update",
  "Designation.Update",
  "Designation.Create",
  "SalesPerformance.Update",
  "SalesPerformance.Create",
  "border-sky-600 bg-sky-50 text-sky-700",
  "bg-white",
  "font-bold text-primary",
  "font-semibold",
  "flex justify-end",
  "flex justify-center",
  "flex justify-between py-1 font-semibold",
  "flex justify-between py-1 text-sm",
  "text-emerald-700",
  "text-amber-700"
]);
  const shouldTranslate = (text) => /^[A-Za-z][A-Za-z0-9 /&().,?%:-]{1,}$/.test(text) && !text.includes("http") && !text.includes("/") && !nonDisplayTokens.has(text);
  const wrap = (text) => {
    values.add(text);
    return `lt(${JSON.stringify(text)})`;
  };
  source = source.replace(/\b(header|title|description|placeholder|confirmText|searchPlaceholder|label)=["']([^"']+)["']/g, (match, prop, text) => shouldTranslate(text) ? `${prop}={${wrap(text)}}` : match);
  source = source.replace(/\b(label|header|title|description|placeholder|confirmText|searchPlaceholder):\s*["']([^"']+)["']/g, (match, prop, text) => shouldTranslate(text) ? `${prop}: ${wrap(text)}` : match);
  source = source.replace(/<Label>([^<>{}\n]+)<\/Label>/g, (match, text) => shouldTranslate(text.trim()) ? `<Label>{${wrap(text.trim())}}</Label>` : match);
  source = source.replace(/<option([^>]*)>([^<>{}\n]+)<\/option>/g, (match, attrs, text) => shouldTranslate(text.trim()) ? `<option${attrs}>{${wrap(text.trim())}}</option>` : match);
  source = source.replace(/<(h[1-6]|th|td|span|p)([^>]*)>([A-Z][A-Za-z0-9 /&().,?%:-]{1,})<\/\1>/g, (match, tag, attrs, text) => shouldTranslate(text.trim()) ? `<${tag}${attrs}>{${wrap(text.trim())}}</${tag}>` : match);
  source = source.replace(/<span className="font-medium">([A-Z][A-Za-z0-9 /&().,?%:-]{1,}:)<\/span>/g, (match, text) => {
    const label = text.trim().replace(/:$/, "");
    return shouldTranslate(label) ? `<span className="font-medium">{${wrap(label)}}:</span>` : match;
  });
  source = source.replace(/>\s*([A-Z][A-Za-z0-9 /&().,?%:-]{2,})\s*<\/(Link|Button|DropdownMenuItem|PermissionButton)>/g, (match, text, tag) => shouldTranslate(text.trim()) ? `>{${wrap(text.trim())}}</${tag}>` : match);
  source = source.replace(/(<(?:Eye|Pencil|Plus|Printer|FileText|FilePlus2|Receipt|ReceiptText|QrCode|TrendingUp|Trash2|Sigma|RefreshCw|SlidersHorizontal)[^>]*\/>)\s+([A-Z][A-Za-z0-9 /&().,?%:-]{2,})(<\/(?:Link|Button|DropdownMenuItem|PermissionButton)>)/g, (match, icon, text, close) => shouldTranslate(text.trim()) ? `${icon} {${wrap(text.trim())}}${close}` : match);
  source = source.replace(/<span className="hidden sm:inline">([^<>{}\n]+)<\/span>/g, (match, text) => shouldTranslate(text.trim()) ? `<span className="hidden sm:inline">{${wrap(text.trim())}}</span>` : match);
  source = source.replace(/toast\.(success|error|warning|info)\("([^"]+)"(?:,\s*"([^"]+)")?\)/g, (match, kind, title, message) => {
    if (!shouldTranslate(title) || (message && !shouldTranslate(message))) return match;
    values.add(title);
    if (message) values.add(message);
    return `toast.${kind}(${wrap(title)}${message ? `, ${wrap(message)}` : ""})`;
  });
  source = source.replace(/\?\s*"([^"]+)"\s*:\s*"([^"]+)"/g, (match, first, second) => {
    if (!shouldTranslate(first) || !shouldTranslate(second)) return match;
    return `? ${wrap(first)} : ${wrap(second)}`;
  });
  return source;
}

function loadReportMenuTranslations() {
  const path = resolve("database/migrations/20260613_insert_missing_report_child_label_localization.sql");
  const source = readFileSync(path, "utf8");
  const byKey = new Map();
  const rowPattern = /\(N'Navigation',\s*N'Menu',\s*N'(Navigation\.reports\.Item\.[^']+\.Label)',\s*N'([^']+)',\s*N'((?:''|[^'])*)'\)/g;
  for (const match of source.matchAll(rowPattern)) {
    const [, key, culture, rawValue] = match;
    const values = byKey.get(key) ?? {};
    values[culture] = rawValue.replaceAll("''", "'");
    byKey.set(key, values);
  }
  for (const values of byKey.values()) {
    const english = values["en-US"];
    if (!english) continue;
    direct[english] = translatedCultures.map((culture) => values[culture] ?? english);
  }
}

function ensureImport(source) {
  if (source.includes("@/modules/operationsLocalization")) return source;
  const lines = source.split(/\r?\n/);
  let insertAt = 0;
  let inImportBlock = false;
  while (insertAt < lines.length) {
    const line = lines[insertAt];
    if (!inImportBlock && !line.startsWith("import ")) break;
    if (line.startsWith("import {") && !line.includes(" from ")) inImportBlock = true;
    if (inImportBlock && line.includes("} from ")) inImportBlock = false;
    insertAt++;
  }
  lines.splice(insertAt, 0, 'import { lt } from "@/modules/operationsLocalization";');
  return lines.join("\n");
}

function writeCatalog(values) {
  const sorted = [...values].sort();
  const catalogs = {};
  for (const culture of translatedCultures) {
    catalogs[culture] = {};
    for (const value of sorted) catalogs[culture][value] = translate(value, culture);
  }
  const content = `export const operationLocalizationCatalogs: Record<string, Record<string, string>> = ${JSON.stringify(catalogs, null, 2)};\n`;
  writeFileSync(catalogPath, content, "utf8");
}

function buildRows(values) {
  const rows = [];
  for (const value of [...values].sort()) {
    for (const culture of cultures) {
      rows.push({
        group: inferGroup(value),
        type: inferType(value),
        key: `${inferGroup(value)}.${keyify(value)}`,
        culture,
        value: culture === "en-US" ? value : translate(value, culture)
      });
    }
  }
  return rows;
}

function translate(value, culture) {
  const directIndex = translatedCultures.indexOf(culture);
  if (direct[value]?.[directIndex]) return direct[value][directIndex];
  const dict = dictionary[culture] ?? {};
  const words = value.split(/(\s+|\/|-)/g);
  return words.map((part) => {
    if (/^\s+$|^\/$|^-$/.test(part)) return part;
    const cleaned = part.replace(/[.,:?]+$/g, "");
    const suffix = part.slice(cleaned.length);
    const translated = dict[cleaned] ?? (cleaned === "No" ? dict.No : undefined);
    return translated ? `${translated}${suffix}` : part;
  }).join("");
}

function inferGroup(value) {
  if (/finance workbench|finance summary|posting review|posting queue|draft invoices|approved receipts|approved payments|unposted documents/i.test(value)) return "FinanceWorkbench";
  if (/report|statement of account|trial balance|balance sheet|bank book|cash book|profit & loss|outstanding|report output|report filters/i.test(value)) return "Reports";
  if (/user|role|permission|employee|designation|salesman|incentive|target|notification|password|lock status/i.test(value)) return "Administration";
  if (/account|ledger|voucher|financial year|opening balance|debit|credit|posting|reconciliation|payroll/i.test(value)) return "Accounting";
  if (/agent commission|commission currency|commission amount|commission draft|agent payable/i.test(value)) return "AgentCommission";
  if (/credit note|debit note|credit\/debit|note type|note date|note items|note no/i.test(value)) return "CreditDebitNote";
  if (/customs|clearance|duty|declaration|inspection|query/i.test(value)) return "CustomsClearance";
  if (/direct/i.test(value)) return "DirectShipment";
  if (/house|hawb|shipper|consignee/i.test(value)) return "HouseShipment";
  if (/goods|grn|warehouse|received/i.test(value)) return "GoodsReceipt";
  if (/job/i.test(value)) return "Job";
  return "Operations";
}

function inferType(value) {
  if (/search|filter/i.test(value)) return "Placeholder";
  if (/^\w+\?$/.test(value)) return "Confirmation";
  if (/success|failed|required|invalid/i.test(value)) return "Message";
  return "Label";
}

function keyify(value) {
  return value.replace(/&/g, " And ").replace(/\+/g, " Plus ").replace(/%/g, " Percent ").replace(/[^A-Za-z0-9]+/g, " ").trim().split(/\s+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("") || "Text";
}

function writeSql(path, updateOnly, rows) {
  mkdirSync(dirname(path), { recursive: true });
  const batches = chunk(rows, 500).map((batch, index) => tableBlock(`@Rows${index + 1}`, batch));
  const union = rows.length ? chunk(rows, 500).map((_, index) => `SELECT * FROM @Rows${index + 1}`).join("\nUNION ALL\n") : "SELECT N'' ResourceGroup, N'' ResourceType, N'' ResourceKey, N'' CultureCode, N'' ResourceValue WHERE 1=0";
  const body = updateOnly ? updateBody(union) : insertBody(union);
  writeFileSync(path, `/* ${updateOnly ? "Updates existing" : "Inserts missing"} operational frontend localization resources. */\n\nDECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';\nDECLARE @Now datetimeoffset = SYSUTCDATETIME();\n\n${batches.join("\n\n")}\n\n${body}\n`, "utf8");
}

function tableBlock(table, rows) {
  return `DECLARE ${table} TABLE\n(\n    ResourceGroup nvarchar(128) NOT NULL,\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO ${table} (ResourceGroup, ResourceType, ResourceKey, CultureCode, ResourceValue)\nVALUES\n${rows.map((row) => `    (N'${sql(row.group)}', N'${sql(row.type)}', N'${sql(row.key)}', N'${sql(row.culture)}', N'${sql(row.value)}')`).join(",\n")};`;
}

function insertBody(union) {
  return `DECLARE @Rows TABLE (ResourceGroup nvarchar(128), ResourceType nvarchar(64), ResourceKey nvarchar(256), CultureCode nvarchar(20), ResourceValue nvarchar(2048));\nINSERT INTO @Rows SELECT * FROM (\n${union}\n) src;\n\nINSERT INTO dbo.i18n_resource_groups (Id, TenantId, GroupName, Description, IsDeleted, CreatedDate)\nSELECT NEWID(), @SystemTenant, r.ResourceGroup, r.ResourceGroup + N' frontend localization', 0, @Now\nFROM (SELECT DISTINCT ResourceGroup FROM @Rows) r\nWHERE NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_groups g WHERE g.TenantId = @SystemTenant AND g.GroupName = r.ResourceGroup AND g.IsDeleted = 0);\n\nINSERT INTO dbo.i18n_resource_keys (Id, TenantId, ResourceGroupId, [Key], ResourceType, DefaultValue, IsSystem, IsActive, IsDeleted, CreatedDate)\nSELECT NEWID(), @SystemTenant, g.Id, r.ResourceKey, r.ResourceType, MAX(CASE WHEN r.CultureCode = N'en-US' THEN r.ResourceValue ELSE r.ResourceKey END), 1, 1, 0, @Now\nFROM @Rows r\nJOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = r.ResourceGroup AND g.IsDeleted = 0\nGROUP BY g.Id, r.ResourceKey, r.ResourceType\nHAVING NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_keys k WHERE k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0);\n\nINSERT INTO dbo.i18n_resource_translations (Id, TenantId, ResourceKeyId, LanguageId, [Value], IsApproved, IsDeleted, CreatedDate)\nSELECT NEWID(), @SystemTenant, k.Id, l.Id, r.ResourceValue, 1, 0, @Now\nFROM @Rows r\nJOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = r.ResourceGroup AND g.IsDeleted = 0\nJOIN dbo.i18n_resource_keys k ON k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0\nJOIN dbo.master_languages l ON l.CultureCode = r.CultureCode AND l.IsDeleted = 0\nWHERE NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_translations t WHERE t.TenantId = @SystemTenant AND t.ResourceKeyId = k.Id AND t.LanguageId = l.Id AND t.IsDeleted = 0);`;
}

function updateBody(union) {
  return `DECLARE @Rows TABLE (ResourceGroup nvarchar(128), ResourceType nvarchar(64), ResourceKey nvarchar(256), CultureCode nvarchar(20), ResourceValue nvarchar(2048));\nINSERT INTO @Rows SELECT * FROM (\n${union}\n) src;\n\nUPDATE t SET t.[Value] = r.ResourceValue, t.IsApproved = 1, t.IsDeleted = 0, t.ModifiedDate = @Now\nFROM dbo.i18n_resource_translations t\nJOIN dbo.i18n_resource_keys k ON k.Id = t.ResourceKeyId AND k.TenantId = @SystemTenant AND k.IsDeleted = 0\nJOIN dbo.i18n_resource_groups g ON g.Id = k.ResourceGroupId AND g.TenantId = @SystemTenant AND g.IsDeleted = 0\nJOIN dbo.master_languages l ON l.Id = t.LanguageId AND l.IsDeleted = 0\nJOIN @Rows r ON r.ResourceGroup = g.GroupName AND r.ResourceKey = k.[Key] AND r.CultureCode = l.CultureCode;`;
}

function sql(value) {
  return String(value).replaceAll("'", "''");
}

function chunk(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

function listFiles(roots) {
  const result = [];
  for (const root of roots) walk(resolve(root));
  return result;
  function walk(path) {
    for (const item of readdirSync(path)) {
      const full = `${path}/${item}`.replace(/\\/g, "/");
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full);
      else result.push(full);
    }
  }
}
