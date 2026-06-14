import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const cultures = ["en-US", "ar-QA", "hi-IN", "fr-FR", "es-ES", "zh-CN", "tr-TR", "pt-PT", "ru-RU"];
const files = [
  "frontend/src/modules/pickups/PickupAssignPage.tsx",
  "frontend/src/modules/pickups/PickupCreatePage.tsx",
  "frontend/src/modules/pickups/PickupEditPage.tsx",
  "frontend/src/modules/pickups/PickupForm.tsx",
  "frontend/src/modules/pickups/PickupInvoicesPage.tsx",
  "frontend/src/modules/pickups/PickupListPage.tsx",
  "frontend/src/modules/pickups/PickupReceiptPrintPage.tsx",
  "frontend/src/modules/pickups/PickupStatusUpdatePage.tsx",
  "frontend/src/modules/pickups/PickupVendorBillsPage.tsx",
  "frontend/src/modules/pickups/PickupViewPage.tsx",
  "frontend/src/utils/pickupPdf.tsx"
];

const translatedCultures = cultures.slice(1);
const manualRows = {
  "All": ["الكل", "सभी", "Tous", "Todos", "全部", "Tümü", "Todos", "Все"],
  "Assign": ["تعيين", "असाइन करें", "Affecter", "Asignar", "分配", "Ata", "Atribuir", "Назначить"],
  "Assign Pickup": ["تعيين الاستلام", "पिकअप असाइन करें", "Affecter l'enlèvement", "Asignar recogida", "分配提货", "Alımı ata", "Atribuir recolha", "Назначить забор"],
  "Bill No": ["رقم الفاتورة", "बिल नंबर", "N° de facture fournisseur", "N.º de factura proveedor", "账单编号", "Fatura No", "N.º da fatura", "Номер счёта"],
  "Cancel Bill": ["إلغاء الفاتورة", "बिल रद्द करें", "Annuler la facture", "Cancelar factura", "取消账单", "Faturayı iptal et", "Cancelar fatura", "Отменить счёт"],
  "Cancel vendor bill?": ["إلغاء فاتورة المورد؟", "विक्रेता बिल रद्द करें?", "Annuler la facture fournisseur ?", "¿Cancelar la factura del proveedor?", "取消供应商账单？", "Tedarikçi faturası iptal edilsin mi?", "Cancelar a fatura do fornecedor?", "Отменить счёт поставщика?"],
  "Create Bill": ["إنشاء فاتورة مورد", "बिल बनाएँ", "Créer une facture fournisseur", "Crear factura de proveedor", "创建供应商账单", "Fatura oluştur", "Criar fatura", "Создать счёт"],
  "Date/Time": ["التاريخ/الوقت", "दिनांक/समय", "Date/heure", "Fecha/hora", "日期/时间", "Tarih/Saat", "Data/Hora", "Дата/время"],
  "Driver/Vehicle/Vendor assignment is done in Assign screen": ["يتم تعيين السائق والمركبة والمورد في شاشة التعيين", "ड्राइवर/वाहन/विक्रेता असाइनमेंट असाइन स्क्रीन में किया जाता है", "L'affectation du chauffeur, du véhicule et du fournisseur se fait dans l'écran Affecter", "La asignación de conductor, vehículo y proveedor se realiza en la pantalla Asignar", "司机、车辆和供应商在分配页面中指定", "Sürücü, araç ve tedarikçi ataması Atama ekranında yapılır", "A atribuição de motorista, veículo e fornecedor é feita no ecrã Atribuir", "Водитель, транспорт и поставщик назначаются на экране назначения"],
  "Edit Bill": ["تعديل الفاتورة", "बिल संपादित करें", "Modifier la facture fournisseur", "Editar factura de proveedor", "编辑供应商账单", "Faturayı düzenle", "Editar fatura", "Изменить счёт"],
  "Edit Invoice": ["تعديل الفاتورة", "इनवॉइस संपादित करें", "Modifier la facture client", "Editar factura", "编辑发票", "Faturayı düzenle", "Editar fatura", "Изменить накладную"],
  "Edit Pickup": ["تعديل الاستلام", "पिकअप संपादित करें", "Modifier l'enlèvement", "Editar recogida", "编辑提货", "Alımı düzenle", "Editar recolha", "Изменить забор"],
  "Enter at least 3 characters.": ["أدخل 3 أحرف على الأقل.", "कम से कम 3 अक्षर दर्ज करें।", "Saisissez au moins 3 caractères.", "Introduzca al menos 3 caracteres.", "请输入至少 3 个字符。", "En az 3 karakter girin.", "Introduza pelo menos 3 caracteres.", "Введите не менее 3 символов."],
  "Expected": ["المتوقع", "अपेक्षित", "Prévu", "Esperado", "预计", "Beklenen", "Esperado", "Ожидается"],
  "Expected Cost": ["التكلفة المتوقعة", "अपेक्षित लागत", "Coût prévu", "Coste esperado", "预计成本", "Beklenen maliyet", "Custo esperado", "Ожидаемая стоимость"],
  "Expense bills for": ["فواتير المصروفات لـ", "इसके लिए व्यय बिल", "Factures de dépenses pour", "Facturas de gastos para", "费用账单：", "Gider faturaları:", "Faturas de despesa para", "Счета расходов для"],
  "Invoices for": ["فواتير لـ", "इसके लिए इनवॉइस", "Factures pour", "Facturas para", "发票：", "Faturalar:", "Faturas para", "Накладные для"],
  "L/W/H": ["الطول/العرض/الارتفاع", "लंबाई/चौड़ाई/ऊँचाई", "L/l/H", "L/An/Al", "长/宽/高", "U/G/Y", "C/L/A", "Д/Ш/В"],
  "Loading pickup...": ["جارٍ تحميل الاستلام...", "पिकअप लोड हो रहा है...", "Chargement de l'enlèvement...", "Cargando recogida...", "正在加载提货...", "Alım yükleniyor...", "A carregar recolha...", "Загрузка забора..."],
  "Location": ["الموقع", "स्थान", "Emplacement", "Ubicación", "位置", "Konum", "Localização", "Местоположение"],
  "New Bill": ["فاتورة مورد جديدة", "नया बिल", "Nouvelle facture fournisseur", "Nueva factura de proveedor", "新建供应商账单", "Yeni fatura", "Nova fatura", "Новый счёт"],
  "New Invoice": ["فاتورة جديدة", "नया इनवॉइस", "Nouvelle facture client", "Nueva factura", "新建发票", "Yeni fatura", "Nova fatura", "Новая накладная"],
  "New Pickup": ["استلام جديد", "नया पिकअप", "Nouvel enlèvement", "Nueva recogida", "新建提货", "Yeni alım", "Nova recolha", "Новый забор"],
  "No customers found.": ["لم يتم العثور على عملاء.", "कोई ग्राहक नहीं मिला।", "Aucun client trouvé.", "No se encontraron clientes.", "未找到客户。", "Müşteri bulunamadı.", "Nenhum cliente encontrado.", "Клиенты не найдены."],
  "No documents uploaded for this pickup.": ["لم يتم رفع مستندات لهذا الاستلام.", "इस पिकअप के लिए कोई दस्तावेज़ अपलोड नहीं किया गया।", "Aucun document téléversé pour cet enlèvement.", "No se han cargado documentos para esta recogida.", "此提货尚未上传文件。", "Bu alım için belge yüklenmedi.", "Nenhum documento carregado para esta recolha.", "Для этого забора документы не загружены."],
  "No phone": ["لا يوجد هاتف", "फोन नहीं", "Aucun téléphone", "Sin teléfono", "无电话", "Telefon yok", "Sem telefone", "Нет телефона"],
  "No salesman": ["لا يوجد مندوب مبيعات", "कोई सेल्समैन नहीं", "Aucun commercial", "Sin vendedor", "无销售员", "Satış temsilcisi yok", "Sem vendedor", "Нет менеджера по продажам"],
  "Optional": ["اختياري", "वैकल्पिक", "Facultatif", "Opcional", "可选", "İsteğe bağlı", "Opcional", "Необязательно"],
  "PICKUP RECEIPT": ["إيصال الاستلام", "पिकअप रसीद", "REÇU D'ENLÈVEMENT", "RECIBO DE RECOGIDA", "提货收据", "ALIM MAKBUZU", "RECIBO DE RECOLHA", "КВИТАНЦИЯ О ЗАБОРЕ"],
  "Pickup Document": ["مستند الاستلام", "पिकअप दस्तावेज़", "Document d'enlèvement", "Documento de recogida", "提货文件", "Alım belgesi", "Documento de recolha", "Документ забора"],
  "Pickup Goods": ["بضائع الاستلام", "पिकअप माल", "Marchandises à enlever", "Mercancías de recogida", "提货货物", "Alım malları", "Mercadorias da recolha", "Грузы для забора"],
  "Pickup Items": ["بنود الاستلام", "पिकअप आइटम", "Articles d'enlèvement", "Artículos de recogida", "提货项目", "Alım kalemleri", "Itens da recolha", "Позиции забора"],
  "Pickup Receipt": ["إيصال الاستلام", "पिकअप रसीद", "Reçu d'enlèvement", "Recibo de recogida", "提货收据", "Alım makbuzu", "Recibo de recolha", "Квитанция о заборе"],
  "Pickup item created successfully.": ["تم إنشاء بند الاستلام بنجاح.", "पिकअप आइटम सफलतापूर्वक बनाया गया।", "Article d'enlèvement créé avec succès.", "Artículo de recogida creado correctamente.", "提货项目创建成功。", "Alım kalemi başarıyla oluşturuldu.", "Item de recolha criado com sucesso.", "Позиция забора успешно создана."],
  "Pickup item deleted successfully.": ["تم حذف بند الاستلام بنجاح.", "पिकअप आइटम सफलतापूर्वक हटाया गया।", "Article d'enlèvement supprimé avec succès.", "Artículo de recogida eliminado correctamente.", "提货项目删除成功。", "Alım kalemi başarıyla silindi.", "Item de recolha eliminado com sucesso.", "Позиция забора успешно удалена."],
  "Pickup item updated successfully.": ["تم تحديث بند الاستلام بنجاح.", "पिकअप आइटम सफलतापूर्वक अपडेट किया गया।", "Article d'enlèvement mis à jour avec succès.", "Artículo de recogida actualizado correctamente.", "提货项目更新成功。", "Alım kalemi başarıyla güncellendi.", "Item de recolha atualizado com sucesso.", "Позиция забора успешно обновлена."],
  "Print Receipt": ["طباعة الإيصال", "रसीद प्रिंट करें", "Imprimer le reçu", "Imprimir recibo", "打印收据", "Makbuzu yazdır", "Imprimir recibo", "Печать квитанции"],
  "Proforma": ["مبدئية", "प्रोफार्मा", "Pro forma", "Proforma", "形式发票", "Proforma", "Proforma", "Проформа"],
  "Search by name, code, or phone": ["ابحث بالاسم أو الرمز أو الهاتف", "नाम, कोड या फोन से खोजें", "Rechercher par nom, code ou téléphone", "Buscar por nombre, código o teléfono", "按姓名、代码或电话搜索", "Ad, kod veya telefonla ara", "Pesquisar por nome, código ou telefone", "Поиск по имени, коду или телефону"],
  "Search invoice number, pickup number, or status": ["ابحث برقم الفاتورة أو رقم الاستلام أو الحالة", "इनवॉइस नंबर, पिकअप नंबर या स्थिति खोजें", "Rechercher par numéro de facture, d'enlèvement ou statut", "Buscar por factura, recogida o estado", "搜索发票号、提货号或状态", "Fatura, alım numarası veya durum ara", "Pesquisar fatura, recolha ou estado", "Поиск по накладной, номеру забора или статусу"],
  "Search vendor bill number, pickup number, or status": ["ابحث برقم فاتورة المورد أو رقم الاستلام أو الحالة", "विक्रेता बिल नंबर, पिकअप नंबर या स्थिति खोजें", "Rechercher par facture fournisseur, enlèvement ou statut", "Buscar por factura de proveedor, recogida o estado", "搜索供应商账单号、提货号或状态", "Tedarikçi faturası, alım numarası veya durum ara", "Pesquisar fatura de fornecedor, recolha ou estado", "Поиск по счёту поставщика, номеру забора или статусу"],
  "Searching customers...": ["جارٍ البحث عن العملاء...", "ग्राहकों की खोज हो रही है...", "Recherche de clients...", "Buscando clientes...", "正在搜索客户...", "Müşteriler aranıyor...", "A pesquisar clientes...", "Поиск клиентов..."],
  "Show Bills": ["عرض الفواتير", "बिल दिखाएँ", "Afficher les factures fournisseur", "Mostrar facturas de proveedor", "显示供应商账单", "Faturaları göster", "Mostrar faturas", "Показать счета"],
  "Show Invoices": ["عرض الفواتير", "इनवॉइस दिखाएँ", "Afficher les factures client", "Mostrar facturas", "显示发票", "Faturaları göster", "Mostrar faturas", "Показать накладные"],
  "Transporter / Vendor": ["الناقل / المورد", "ट्रांसपोर्टर / विक्रेता", "Transporteur / fournisseur", "Transportista / proveedor", "承运商 / 供应商", "Taşıyıcı / tedarikçi", "Transportador / fornecedor", "Перевозчик / поставщик"],
  "Update Pickup Status": ["تحديث حالة الاستلام", "पिकअप स्थिति अपडेट करें", "Mettre à jour le statut de l'enlèvement", "Actualizar estado de recogida", "更新提货状态", "Alım durumunu güncelle", "Atualizar estado da recolha", "Обновить статус забора"],
  "Update Status": ["تحديث الحالة", "स्थिति अपडेट करें", "Mettre à jour le statut", "Actualizar estado", "更新状态", "Durumu güncelle", "Atualizar estado", "Обновить статус"],
  "Upload one document at a time. Files are stored securely with signed upload and download URLs.": ["ارفع مستندًا واحدًا في كل مرة. تُحفظ الملفات بأمان باستخدام روابط رفع وتنزيل موقعة.", "एक बार में एक दस्तावेज़ अपलोड करें। फ़ाइलें हस्ताक्षरित अपलोड और डाउनलोड URL के साथ सुरक्षित रूप से संग्रहीत होती हैं।", "Téléversez un document à la fois. Les fichiers sont stockés de manière sécurisée avec des URL signées.", "Cargue un documento cada vez. Los archivos se almacenan de forma segura con URL firmadas.", "每次上传一个文件。文件通过签名的上传和下载链接安全存储。", "Her seferinde bir belge yükleyin. Dosyalar imzalı yükleme ve indirme URL'leriyle güvenli şekilde saklanır.", "Carregue um documento de cada vez. Os ficheiros são guardados com URLs assinados.", "Загружайте по одному документу. Файлы безопасно хранятся с подписанными ссылками."],
  "Upload proof and other pickup documents from the Pickup detail page after the pickup is created.": ["ارفع الإثبات ومستندات الاستلام الأخرى من صفحة تفاصيل الاستلام بعد إنشائه.", "पिकअप बनने के बाद पिकअप विवरण पृष्ठ से प्रमाण और अन्य दस्तावेज़ अपलोड करें।", "Téléversez la preuve et les autres documents depuis la page de détail après création.", "Cargue la prueba y otros documentos desde la página de detalle después de crear la recogida.", "创建提货后，从提货详情页面上传证明和其他文件。", "Alım oluşturulduktan sonra kanıt ve diğer belgeleri ayrıntı sayfasından yükleyin.", "Após criar a recolha, carregue o comprovativo e outros documentos na página de detalhes.", "После создания забора загрузите подтверждение и другие документы на странице сведений."],
  "View Bill": ["عرض الفاتورة", "बिल देखें", "Voir la facture fournisseur", "Ver factura de proveedor", "查看供应商账单", "Faturayı görüntüle", "Ver fatura", "Просмотреть счёт"],
  "View Invoice": ["عرض الفاتورة", "इनवॉइस देखें", "Voir la facture client", "Ver factura", "查看发票", "Faturayı görüntüle", "Ver fatura", "Просмотреть накладную"],
  "View Pickup": ["عرض الاستلام", "पिकअप देखें", "Voir l'enlèvement", "Ver recogida", "查看提货", "Alımı görüntüle", "Ver recolha", "Просмотреть забор"],
  "cbm": ["م³", "घन मी.", "m³", "m³", "立方米", "m³", "m³", "м³"],
  "kg": ["كجم", "किग्रा", "kg", "kg", "公斤", "kg", "kg", "кг"],
  "pcs": ["قطعة", "नग", "pcs", "uds.", "件", "adet", "un.", "шт."]
};

const directManualRows = {
  "Action": ["الإجراء", "कार्रवाई", "Action", "Acción", "操作", "İşlem", "Ação", "Действие"],
  "Contact": ["جهة الاتصال", "संपर्क", "Contact", "Contacto", "联系人", "İletişim", "Contacto", "Контакт"],
  "Contact No": ["رقم الاتصال", "संपर्क नंबर", "N° de contact", "N.º de contacto", "联系电话", "İletişim No", "N.º de contacto", "Контактный номер"],
  "Consignee Contact": ["جهة اتصال المرسل إليه", "कंसाइनी संपर्क", "Contact du destinataire", "Contacto del consignatario", "收货人联系人", "Alıcı iletişimi", "Contacto do consignatário", "Контакт грузополучателя"],
  "Consignee Contact Address": ["عنوان جهة اتصال المرسل إليه", "कंसाइनी संपर्क पता", "Adresse du contact destinataire", "Dirección de contacto del consignatario", "收货人联系地址", "Alıcı iletişim adresi", "Endereço de contacto do consignatário", "Адрес контакта грузополучателя"],
  "Consignee Contact No": ["رقم اتصال المرسل إليه", "कंसाइनी संपर्क नंबर", "N° de contact du destinataire", "N.º de contacto del consignatario", "收货人联系电话", "Alıcı iletişim no", "N.º de contacto do consignatário", "Номер контакта грузополучателя"],
  "Contact Phone": ["هاتف الاتصال", "संपर्क फोन", "Téléphone de contact", "Teléfono de contacto", "联系电话", "İletişim telefonu", "Telefone de contacto", "Контактный телефон"],
  "DateTime": ["التاريخ والوقت", "दिनांक और समय", "Date et heure", "Fecha y hora", "日期和时间", "Tarih ve saat", "Data e hora", "Дата и время"],
  "Defined": ["محدد", "निर्धारित", "Défini", "Definido", "已定义", "Tanımlı", "Definido", "Определено"],
  "Drop Location": ["موقع التسليم", "ड्रॉप स्थान", "Lieu de livraison", "Lugar de entrega", "送达地点", "Teslim yeri", "Local de entrega", "Место доставки"],
  "Fully Paid": ["مدفوع بالكامل", "पूरी तरह भुगतान", "Entièrement payé", "Totalmente pagado", "已全额付款", "Tamamen ödendi", "Totalmente pago", "Полностью оплачено"],
  "Fully Received": ["مستلم بالكامل", "पूरी तरह प्राप्त", "Entièrement reçu", "Totalmente recibido", "已全额收款", "Tamamen tahsil edildi", "Totalmente recebido", "Полностью получено"],
  "Location": ["الموقع", "स्थान", "Emplacement", "Ubicación", "位置", "Konum", "Localização", "Местоположение"],
  "Marks": ["العلامات", "मार्क्स", "Marques", "Marcas", "唛头", "İşaretler", "Marcas", "Маркировка"],
  "Number": ["الرقم", "नंबर", "Numéro", "Número", "编号", "Numara", "Número", "Номер"],
  "Save Pickup": ["حفظ الاستلام", "पिकअप सहेजें", "Enregistrer l'enlèvement", "Guardar recogida", "保存提货", "Alımı kaydet", "Guardar recolha", "Сохранить забор"],
  "Bill Defined": ["تم تحديد الفاتورة", "बिल निर्धारित", "Facture fournisseur définie", "Factura de proveedor definida", "账单已定义", "Fatura tanımlı", "Fatura definida", "Счет определен"],
  "Bill Fully Paid": ["الفاتورة مدفوعة بالكامل", "बिल पूरी तरह भुगतान", "Facture fournisseur entièrement payée", "Factura de proveedor totalmente pagada", "账单已全额付款", "Fatura tamamen ödendi", "Fatura totalmente paga", "Счет полностью оплачен"],
  "Customer Location": ["موقع العميل", "ग्राहक स्थान", "Emplacement client", "Ubicación del cliente", "客户位置", "Müşteri konumu", "Localização do cliente", "Местоположение клиента"],
  "Invoice Defined": ["تم تحديد الفاتورة", "इनवॉइस निर्धारित", "Facture client définie", "Factura definida", "发票已定义", "Fatura tanımlı", "Fatura definida", "Накладная определена"],
  "Invoice Fully Received": ["تم استلام الفاتورة بالكامل", "इनवॉइस पूरी तरह प्राप्त", "Facture client entièrement reçue", "Factura totalmente recibida", "发票已全额收款", "Fatura tamamen tahsil edildi", "Fatura totalmente recebida", "Накладная полностью получена"],
  "Pickup DateTime": ["تاريخ ووقت الاستلام", "पिकअप दिनांक और समय", "Date et heure d'enlèvement", "Fecha y hora de recogida", "提货日期和时间", "Alım tarih ve saati", "Data e hora da recolha", "Дата и время забора"],
  "Pickup Number": ["رقم الاستلام", "पिकअप नंबर", "Numéro d'enlèvement", "Número de recogida", "提货编号", "Alım numarası", "Número da recolha", "Номер забора"],
  "Vehicle Number": ["رقم المركبة", "वाहन नंबर", "Numéro du véhicule", "Número de vehículo", "车辆编号", "Araç numarası", "Número do veículo", "Номер автомобиля"],
  "Pickup request, assignment, status tracking, and receipt workflows.": ["طلبات الاستلام والتعيين وتتبع الحالة وسير عمل الإيصالات.", "पिकअप अनुरोध, असाइनमेंट, स्थिति ट्रैकिंग और रसीद वर्कफ़्लो।", "Demandes d'enlèvement, affectation, suivi du statut et reçus.", "Solicitudes de recogida, asignación, seguimiento de estado y recibos.", "提货申请、分配、状态跟踪和收据流程。", "Alım talebi, atama, durum takibi ve makbuz iş akışları.", "Pedidos de recolha, atribuição, acompanhamento de estado e recibos.", "Заявки на забор, назначение, отслеживание статуса и квитанции."],
  "Pickup request, assignment, tracking, and workflows.": ["طلبات الاستلام والتعيين والتتبع وسير العمل.", "पिकअप अनुरोध, असाइनमेंट, ट्रैकिंग और वर्कफ़्लो।", "Demandes d'enlèvement, affectation, suivi et workflows.", "Solicitudes de recogida, asignación, seguimiento y flujos de trabajo.", "提货申请、分配、跟踪和流程。", "Alım talebi, atama, takip ve iş akışları.", "Pedidos de recolha, atribuição, acompanhamento e fluxos de trabalho.", "Заявки на забор, назначение, отслеживание и рабочие процессы."],
  "Pickup request, assignment, racking, and workflows.": ["طلبات الاستلام والتعيين والتتبع وسير العمل.", "पिकअप अनुरोध, असाइनमेंट, ट्रैकिंग और वर्कफ़्लो।", "Demandes d'enlèvement, affectation, suivi et workflows.", "Solicitudes de recogida, asignación, seguimiento y flujos de trabajo.", "提货申请、分配、跟踪和流程。", "Alım talebi, atama, takip ve iş akışları.", "Pedidos de recolha, atribuição, acompanhamento e fluxos de trabalho.", "Заявки на забор, назначение, отслеживание и рабочие процессы."]
};

const effectiveManualRows = { ...manualRows, ...directManualRows };
const overrides = Object.fromEntries(
  translatedCultures.map((culture, cultureIndex) => [
    culture,
    Object.fromEntries(
      Object.entries(effectiveManualRows).map(([value, translations]) => [
        value,
        translations[cultureIndex]
      ])
    )
  ])
);

const values = new Set();
for (const file of files) {
  const source = readFileSync(resolve(file), "utf8");
  for (const match of source.matchAll(/\b(?:p|t)\("((?:\\"|[^"])*)"\)/g)) values.add(match[1].replaceAll('\\"', '"'));
}
for (const value of Object.keys(directManualRows)) values.add(value);

const known = readKnownTranslations();
const rows = [];
const missing = [];
for (const value of [...values].sort()) {
  for (const culture of cultures) {
    const translated = culture === "en-US" ? value : overrides[culture]?.[value] ?? known.get(value)?.get(culture);
    if (!translated && culture !== "en-US") missing.push({ culture, value });
    rows.push({ resourceType: classify(value), key: `Pickup.${keyify(value)}`, culture, value: translated ?? value });
  }
}

writeSql("database/migrations/20260613_insert_missing_pickup_localization.sql", false, rows);
writeSql("database/migrations/20260613_update_pickup_localization.sql", true, rows);
writeCatalog(rows);
console.log(JSON.stringify({ resources: values.size, rows: rows.length, missing: missing.length, missingValues: [...new Set(missing.map((item) => item.value))] }, null, 2));

function readKnownTranslations() {
  const result = new Map();
  const folder = resolve("database/migrations");
  for (const name of readdirSync(folder).filter((name) => name.endsWith(".sql") && !name.includes("pickup_localization"))) {
    const source = readFileSync(resolve(folder, name), "utf8");
    const rows = [...source.matchAll(/\(N'[^']*',\s*N'((?:''|[^'])*)',\s*N'([^']+)',\s*N'((?:''|[^'])*)'\)/g)]
      .map((match) => ({ key: match[1].replaceAll("''", "'"), culture: match[2], value: match[3].replaceAll("''", "'") }));
    rows.push(...[...source.matchAll(/\(N'[^']*',\s*N'[^']*',\s*N'((?:''|[^'])*)',\s*N'([^']+)',\s*N'((?:''|[^'])*)'\)/g)]
      .map((match) => ({ key: match[1].replaceAll("''", "'"), culture: match[2], value: match[3].replaceAll("''", "'") })));
    const groups = new Map();
    for (const row of rows) {
      if (!groups.has(row.key)) groups.set(row.key, new Map());
      groups.get(row.key).set(row.culture, row.value);
    }
    for (const translations of groups.values()) {
      const english = translations.get("en-US");
      if (english && (!result.has(english) || result.get(english).size < translations.size)) result.set(english, translations);
    }
  }
  return result;
}

function writeCatalog(allRows) {
  const byCulture = Object.fromEntries(cultures.filter((culture) => culture !== "en-US").map((culture) => [culture, {}]));
  for (const row of allRows) if (row.culture !== "en-US") byCulture[row.culture][englishForKey(row.key, allRows)] = row.value;
  const output = `/* Generated by scripts/generate-pickup-localization.mjs. */\nexport const pickupCatalogs: Record<string, Record<string, string>> = ${JSON.stringify(byCulture, null, 2)};\n`;
  writeFileSync("frontend/src/modules/pickups/pickupCatalogs.ts", output, "utf8");
}

function englishForKey(key, rows) {
  return rows.find((row) => row.key === key && row.culture === "en-US")?.value ?? key;
}

function keyify(value) {
  return value.replace(/[^A-Za-z0-9]+(.)/g, (_, character) => character.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
}

function classify(value) {
  if (/^(Add|Assign|Cancel|Create|Delete|Edit|New|PDF|Print|Reset|Save|Show|Update|View)/.test(value)) return "Button";
  if (value.endsWith("?")) return "Confirmation";
  if (value.endsWith(".") || value.includes("failed") || value.includes("successfully")) return "Message";
  return "Label";
}

function writeSql(fileName, updateOnly, allRows) {
  const batches = chunk(allRows, 800);
  const declarations = batches.map((batch, index) => {
    const table = `@Rows${index + 1}`;
    const valuesSql = batch.map((row) => `    (N'${sql(row.resourceType)}', N'${sql(row.key)}', N'${sql(row.culture)}', N'${sql(row.value)}')`).join(",\n");
    return `DECLARE ${table} TABLE\n(\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO ${table} (ResourceType, ResourceKey, CultureCode, ResourceValue)\nVALUES\n${valuesSql};`;
  }).join("\n\n");
  const union = batches.map((_, index) => `SELECT * FROM @Rows${index + 1}`).join("\nUNION ALL\n");
  const operation = updateOnly ? updateSql() : insertSql();
  const output = `/* ${updateOnly ? "Updates existing" : "Inserts missing"} Pickup frontend localization resources. */\n\nDECLARE @SystemTenant uniqueidentifier = '00000000-0000-0000-0000-000000000000';\nDECLARE @Now datetimeoffset = SYSUTCDATETIME();\nDECLARE @ModuleName nvarchar(128) = N'Pickup';\n\n${declarations}\n\nDECLARE @Rows TABLE\n(\n    ResourceType nvarchar(64) NOT NULL,\n    ResourceKey nvarchar(256) NOT NULL,\n    CultureCode nvarchar(20) NOT NULL,\n    ResourceValue nvarchar(2048) NOT NULL\n);\n\nINSERT INTO @Rows\n${union};\n\n${operation}\n`;
  mkdirSync(dirname(fileName), { recursive: true });
  writeFileSync(fileName, output, "utf8");
}

function insertSql() {
  return `IF NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_groups WHERE TenantId = @SystemTenant AND GroupName = @ModuleName AND IsDeleted = 0)
BEGIN
    INSERT INTO dbo.i18n_resource_groups (Id, TenantId, GroupName, Description, IsDeleted, CreatedDate)
    VALUES (NEWID(), @SystemTenant, @ModuleName, N'Pickup frontend localization resources', 0, @Now);
END;

INSERT INTO dbo.i18n_resource_keys (Id, TenantId, ResourceGroupId, [Key], ResourceType, DefaultValue, IsSystem, IsActive, IsDeleted, CreatedDate)
SELECT NEWID(), @SystemTenant, g.Id, r.ResourceKey, r.ResourceType, en.ResourceValue, 1, 1, 0, @Now
FROM (SELECT DISTINCT ResourceType, ResourceKey FROM @Rows) r
JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = @ModuleName AND g.IsDeleted = 0
JOIN @Rows en ON en.ResourceType = r.ResourceType AND en.ResourceKey = r.ResourceKey AND en.CultureCode = N'en-US'
WHERE NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_keys k WHERE k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0);

INSERT INTO dbo.i18n_resource_translations (Id, TenantId, ResourceKeyId, LanguageId, [Value], IsApproved, IsDeleted, CreatedDate)
SELECT NEWID(), @SystemTenant, k.Id, l.Id, r.ResourceValue, 1, 0, @Now
FROM @Rows r
JOIN dbo.i18n_resource_groups g ON g.TenantId = @SystemTenant AND g.GroupName = @ModuleName AND g.IsDeleted = 0
JOIN dbo.i18n_resource_keys k ON k.TenantId = @SystemTenant AND k.ResourceGroupId = g.Id AND k.[Key] = r.ResourceKey AND k.IsDeleted = 0
JOIN dbo.master_languages l ON l.CultureCode = r.CultureCode AND l.IsDeleted = 0
WHERE NOT EXISTS (SELECT 1 FROM dbo.i18n_resource_translations t WHERE t.TenantId = @SystemTenant AND t.ResourceKeyId = k.Id AND t.LanguageId = l.Id AND t.IsDeleted = 0);`;
}

function updateSql() {
  return `UPDATE t SET t.[Value] = r.ResourceValue, t.IsApproved = 1, t.IsDeleted = 0, t.ModifiedDate = @Now
FROM dbo.i18n_resource_translations t
JOIN dbo.i18n_resource_keys k ON k.Id = t.ResourceKeyId AND k.TenantId = @SystemTenant AND k.IsDeleted = 0
JOIN dbo.i18n_resource_groups g ON g.Id = k.ResourceGroupId AND g.TenantId = @SystemTenant AND g.GroupName = @ModuleName AND g.IsDeleted = 0
JOIN dbo.master_languages l ON l.Id = t.LanguageId AND l.IsDeleted = 0
JOIN @Rows r ON r.ResourceKey = k.[Key] AND r.CultureCode = l.CultureCode
WHERE t.TenantId = @SystemTenant AND t.IsDeleted = 0;`;
}

function chunk(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

function sql(value) {
  return String(value).replaceAll("'", "''");
}
