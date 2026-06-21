import { env } from "@/app/env";
import { getLanguagePreference } from "@/app/languagePreference";
import { branchLocalizationCatalogs } from "@/modules/branchLocalizationCatalog";
import { branchBankLocalizationCatalogs } from "@/modules/branchBankLocalizationCatalog";
import { operationLocalizationCatalogs } from "@/modules/operationsLocalizationCatalog";
import { settingsLocalizationCatalogs } from "@/modules/settingsLocalizationCatalog";
import { tenantLocalizationCatalogs } from "@/modules/tenantLocalizationCatalog";

const runtimeLocalizationResources: Record<string, Record<string, string>> = {};
const openAiSettingsTranslations: Record<string, Record<string, string>> = {
  "ar-QA": {
    "OpenAI Settings": "إعدادات OpenAI",
    "Branch-specific API key and model selection.": "مفتاح API واختيار النموذج الخاصان بالفرع.",
    "OpenAI API Key": "مفتاح OpenAI API",
    "OpenAI Model": "نموذج OpenAI",
    "Show API Key": "إظهار مفتاح API",
    "Hide API Key": "إخفاء مفتاح API",
    "Add Model": "إضافة نموذج",
    "Create OpenAI Model": "إنشاء نموذج OpenAI",
    "Add a model identifier for this branch.": "أضف معرف نموذج لهذا الفرع.",
    "Model ID": "معرف النموذج",
    "Display Name": "اسم العرض",
    "Create Model": "إنشاء نموذج",
    "Optional": "اختياري",
    "Close": "إغلاق"
  },
  "hi-IN": {
    "OpenAI Settings": "OpenAI सेटिंग्स",
    "Branch-specific API key and model selection.": "शाखा-विशिष्ट API कुंजी और मॉडल चयन.",
    "OpenAI API Key": "OpenAI API कुंजी",
    "OpenAI Model": "OpenAI मॉडल",
    "Show API Key": "API कुंजी दिखाएं",
    "Hide API Key": "API कुंजी छिपाएं",
    "Add Model": "मॉडल जोड़ें",
    "Create OpenAI Model": "OpenAI मॉडल बनाएं",
    "Add a model identifier for this branch.": "इस शाखा के लिए मॉडल पहचानकर्ता जोड़ें.",
    "Model ID": "मॉडल ID",
    "Display Name": "प्रदर्शन नाम",
    "Create Model": "मॉडल बनाएं",
    "Optional": "वैकल्पिक",
    "Close": "बंद करें"
  },
  "fr-FR": {
    "OpenAI Settings": "Paramètres OpenAI",
    "Branch-specific API key and model selection.": "Clé API et sélection de modèle propres à l'agence.",
    "OpenAI API Key": "Clé API OpenAI",
    "OpenAI Model": "Modèle OpenAI",
    "Show API Key": "Afficher la clé API",
    "Hide API Key": "Masquer la clé API",
    "Add Model": "Ajouter un modèle",
    "Create OpenAI Model": "Créer un modèle OpenAI",
    "Add a model identifier for this branch.": "Ajoutez un identifiant de modèle pour cette agence.",
    "Model ID": "ID du modèle",
    "Display Name": "Nom d'affichage",
    "Create Model": "Créer le modèle",
    "Optional": "Facultatif",
    "Close": "Fermer"
  },
  "es-ES": {
    "OpenAI Settings": "Configuración de OpenAI",
    "Branch-specific API key and model selection.": "Clave API y selección de modelo específicas de la sucursal.",
    "OpenAI API Key": "Clave API de OpenAI",
    "OpenAI Model": "Modelo de OpenAI",
    "Show API Key": "Mostrar clave API",
    "Hide API Key": "Ocultar clave API",
    "Add Model": "Agregar modelo",
    "Create OpenAI Model": "Crear modelo de OpenAI",
    "Add a model identifier for this branch.": "Agregue un identificador de modelo para esta sucursal.",
    "Model ID": "ID del modelo",
    "Display Name": "Nombre para mostrar",
    "Create Model": "Crear modelo",
    "Optional": "Opcional",
    "Close": "Cerrar"
  },
  "zh-CN": {
    "OpenAI Settings": "OpenAI 设置",
    "Branch-specific API key and model selection.": "分支专用 API 密钥和模型选择。",
    "OpenAI API Key": "OpenAI API 密钥",
    "OpenAI Model": "OpenAI 模型",
    "Show API Key": "显示 API 密钥",
    "Hide API Key": "隐藏 API 密钥",
    "Add Model": "添加模型",
    "Create OpenAI Model": "创建 OpenAI 模型",
    "Add a model identifier for this branch.": "为此分支添加模型标识符。",
    "Model ID": "模型 ID",
    "Display Name": "显示名称",
    "Create Model": "创建模型",
    "Optional": "可选",
    "Close": "关闭"
  },
  "tr-TR": {
    "OpenAI Settings": "OpenAI Ayarları",
    "Branch-specific API key and model selection.": "Şubeye özel API anahtarı ve model seçimi.",
    "OpenAI API Key": "OpenAI API Anahtarı",
    "OpenAI Model": "OpenAI Modeli",
    "Show API Key": "API anahtarını göster",
    "Hide API Key": "API anahtarını gizle",
    "Add Model": "Model ekle",
    "Create OpenAI Model": "OpenAI modeli oluştur",
    "Add a model identifier for this branch.": "Bu şube için bir model tanımlayıcısı ekleyin.",
    "Model ID": "Model ID",
    "Display Name": "Görünen ad",
    "Create Model": "Model oluştur",
    "Optional": "İsteğe bağlı",
    "Close": "Kapat"
  },
  "pt-PT": {
    "OpenAI Settings": "Definições OpenAI",
    "Branch-specific API key and model selection.": "Chave API e seleção de modelo específicas da filial.",
    "OpenAI API Key": "Chave API OpenAI",
    "OpenAI Model": "Modelo OpenAI",
    "Show API Key": "Mostrar chave API",
    "Hide API Key": "Ocultar chave API",
    "Add Model": "Adicionar modelo",
    "Create OpenAI Model": "Criar modelo OpenAI",
    "Add a model identifier for this branch.": "Adicione um identificador de modelo para esta filial.",
    "Model ID": "ID do modelo",
    "Display Name": "Nome de apresentação",
    "Create Model": "Criar modelo",
    "Optional": "Opcional",
    "Close": "Fechar"
  },
  "ru-RU": {
    "OpenAI Settings": "Настройки OpenAI",
    "Branch-specific API key and model selection.": "Ключ API и выбор модели для филиала.",
    "OpenAI API Key": "Ключ API OpenAI",
    "OpenAI Model": "Модель OpenAI",
    "Show API Key": "Показать ключ API",
    "Hide API Key": "Скрыть ключ API",
    "Add Model": "Добавить модель",
    "Create OpenAI Model": "Создать модель OpenAI",
    "Add a model identifier for this branch.": "Добавьте идентификатор модели для этого филиала.",
    "Model ID": "ID модели",
    "Display Name": "Отображаемое имя",
    "Create Model": "Создать модель",
    "Optional": "Необязательно",
    "Close": "Закрыть"
  }
};
const sharedUploadLinkTranslations: Record<string, Record<string, string>> = {
  "ar-QA": {
    "Share Upload Link": "مشاركة رابط الرفع",
    "Upload link copied": "تم نسخ رابط الرفع",
    "Share it with the client or employee to attach video, audio, and files.": "شاركه مع العميل أو الموظف لإرفاق الفيديو والصوت والملفات.",
    "Copy": "نسخ",
    "Link copied": "تم نسخ الرابط"
  },
  "hi-IN": {
    "Share Upload Link": "अपलोड लिंक साझा करें",
    "Upload link copied": "अपलोड लिंक कॉपी किया गया",
    "Share it with the client or employee to attach video, audio, and files.": "वीडियो, ऑडियो और फाइलें जोड़ने के लिए इसे ग्राहक या कर्मचारी के साथ साझा करें.",
    "Copy": "कॉपी करें",
    "Link copied": "लिंक कॉपी किया गया"
  },
  "fr-FR": {
    "Share Upload Link": "Partager le lien de téléversement",
    "Upload link copied": "Lien de téléversement copié",
    "Share it with the client or employee to attach video, audio, and files.": "Partagez-le avec le client ou l'employé pour joindre des vidéos, des audios et des fichiers.",
    "Copy": "Copier",
    "Link copied": "Lien copié"
  },
  "es-ES": {
    "Share Upload Link": "Compartir enlace de carga",
    "Upload link copied": "Enlace de carga copiado",
    "Share it with the client or employee to attach video, audio, and files.": "Compártalo con el cliente o empleado para adjuntar video, audio y archivos.",
    "Copy": "Copiar",
    "Link copied": "Enlace copiado"
  },
  "zh-CN": {
    "Share Upload Link": "分享上传链接",
    "Upload link copied": "上传链接已复制",
    "Share it with the client or employee to attach video, audio, and files.": "分享给客户或员工，用于附加视频、音频和文件。",
    "Copy": "复制",
    "Link copied": "链接已复制"
  },
  "tr-TR": {
    "Share Upload Link": "Yükleme bağlantısını paylaş",
    "Upload link copied": "Yükleme bağlantısı kopyalandı",
    "Share it with the client or employee to attach video, audio, and files.": "Video, ses ve dosya eklemek için müşteri veya çalışanla paylaşın.",
    "Copy": "Kopyala",
    "Link copied": "Bağlantı kopyalandı"
  },
  "pt-PT": {
    "Share Upload Link": "Partilhar ligação de carregamento",
    "Upload link copied": "Ligação de carregamento copiada",
    "Share it with the client or employee to attach video, audio, and files.": "Partilhe com o cliente ou funcionário para anexar vídeo, áudio e ficheiros.",
    "Copy": "Copiar",
    "Link copied": "Ligação copiada"
  },
  "ru-RU": {
    "Share Upload Link": "Поделиться ссылкой для загрузки",
    "Upload link copied": "Ссылка для загрузки скопирована",
    "Share it with the client or employee to attach video, audio, and files.": "Поделитесь с клиентом или сотрудником, чтобы прикрепить видео, аудио и файлы.",
    "Copy": "Копировать",
    "Link copied": "Ссылка скопирована"
  }
};
const localizationCorrections: Record<string, Record<string, string>> = {
  "ar-QA": {
    "Add Line": "إضافة سطر",
    "Approve Opening Balances": "اعتماد الأرصدة الافتتاحية",
    "Balance Status": "حالة التوازن",
    "Credit": "دائن",
    "Debit": "مدين",
    "Enter all ledger opening balances from the current system and approve only when debit and credit totals match.": "أدخل جميع الأرصدة الافتتاحية للحسابات من النظام الحالي واعتمدها فقط عندما يتطابق إجمالي المدين والدائن.",
    "Load All Ledgers": "تحميل جميع الحسابات",
    "Reference/Remark": "المرجع/الملاحظة",
    "Save Draft": "حفظ كمسودة",
    "Saved Credit Total": "إجمالي الدائن المحفوظ",
    "Saved Debit Total": "إجمالي المدين المحفوظ",
    "House": "الشحنة الفرعية",
    "House No": "رقم الشحنة الفرعية",
    "Details": "التفاصيل",
    "Sub": "فرعي",
    "House Shipment Information": "معلومات الشحنة الفرعية",
    "Invoice Details": "تفاصيل الفاتورة",
    "Sub Total": "الإجمالي الفرعي",
    "TAX INVOICE": "فاتورة ضريبية",
    "This is a computer generated invoice.": "هذه فاتورة صادرة آلياً."
  },
  "hi-IN": {
    "Add Line": "लाइन जोड़ें",
    "Approve Opening Balances": "प्रारंभिक शेष स्वीकृत करें",
    "Balance Status": "शेष स्थिति",
    "Credit": "क्रेडिट",
    "Debit": "डेबिट",
    "Enter all ledger opening balances from the current system and approve only when debit and credit totals match.": "वर्तमान सिस्टम से सभी लेजर प्रारंभिक शेष दर्ज करें और डेबिट तथा क्रेडिट कुल बराबर होने पर ही स्वीकृत करें।",
    "Load All Ledgers": "सभी लेजर लोड करें",
    "Reference/Remark": "संदर्भ/टिप्पणी",
    "Save Draft": "ड्राफ्ट सहेजें",
    "Saved Credit Total": "सहेजा गया क्रेडिट कुल",
    "Saved Debit Total": "सहेजा गया डेबिट कुल",
    "House": "हाउस",
    "House No": "हाउस नंबर",
    "Details": "विवरण",
    "Sub": "उप",
    "House Shipment Information": "हाउस शिपमेंट जानकारी",
    "Invoice Details": "इनवॉइस विवरण",
    "Sub Total": "उप-योग",
    "TAX INVOICE": "टैक्स इनवॉइस",
    "This is a computer generated invoice.": "यह कंप्यूटर द्वारा जनरेट किया गया इनवॉइस है।"
  },
  "fr-FR": {
    "Add Line": "Ajouter une ligne",
    "Approve Opening Balances": "Approuver les soldes d'ouverture",
    "Balance Status": "Statut d'équilibre",
    "Credit": "Crédit",
    "Debit": "Débit",
    "Enter all ledger opening balances from the current system and approve only when debit and credit totals match.": "Saisissez tous les soldes d'ouverture des comptes depuis le système actuel et approuvez uniquement lorsque les totaux débit et crédit correspondent.",
    "Load All Ledgers": "Charger tous les comptes",
    "Reference/Remark": "Référence/remarque",
    "Save Draft": "Enregistrer le brouillon",
    "Saved Credit Total": "Total crédit enregistré",
    "Saved Debit Total": "Total débit enregistré",
    "House": "House",
    "House No": "N° house",
    "Details": "Détails",
    "Sub": "Sous",
    "House Shipment Information": "Informations sur l'expédition house",
    "Invoice Details": "Détails de la facture",
    "Sub Total": "Sous-total",
    "TAX INVOICE": "FACTURE FISCALE",
    "This is a computer generated invoice.": "Cette facture est générée par ordinateur."
  },
  "es-ES": {
    "Add Line": "Agregar línea",
    "Approve Opening Balances": "Aprobar saldos iniciales",
    "Balance Status": "Estado de balance",
    "Credit": "Crédito",
    "Debit": "Débito",
    "Enter all ledger opening balances from the current system and approve only when debit and credit totals match.": "Ingrese todos los saldos iniciales del libro mayor desde el sistema actual y apruebe solo cuando los totales de débito y crédito coincidan.",
    "Load All Ledgers": "Cargar todos los libros mayores",
    "Reference/Remark": "Referencia/observación",
    "Save Draft": "Guardar borrador",
    "Saved Credit Total": "Total crédito guardado",
    "Saved Debit Total": "Total débito guardado",
    "House": "House",
    "House No": "N.º house",
    "Details": "Detalles",
    "Sub": "Sub",
    "House Shipment Information": "Información del envío house",
    "Invoice Details": "Detalles de la factura",
    "Sub Total": "Subtotal",
    "TAX INVOICE": "FACTURA FISCAL",
    "This is a computer generated invoice.": "Esta factura fue generada por computadora."
  },
  "zh-CN": {
    "Add Line": "添加行",
    "Approve Opening Balances": "批准期初余额",
    "Balance Status": "平衡状态",
    "Credit": "贷方",
    "Debit": "借方",
    "Enter all ledger opening balances from the current system and approve only when debit and credit totals match.": "从当前系统输入所有总账期初余额，并仅在借贷合计相等时批准。",
    "Load All Ledgers": "加载所有总账",
    "Reference/Remark": "参考/备注",
    "Save Draft": "保存草稿",
    "Saved Credit Total": "已保存贷方合计",
    "Saved Debit Total": "已保存借方合计",
    "House": "分单",
    "House No": "分单号",
    "Details": "明细",
    "Sub": "小计",
    "House Shipment Information": "分单货运信息",
    "Invoice Details": "发票明细",
    "Sub Total": "小计",
    "TAX INVOICE": "税务发票",
    "This is a computer generated invoice.": "本发票由系统自动生成。"
  },
  "tr-TR": {
    "Add Line": "Satır ekle",
    "Approve Opening Balances": "Açılış bakiyelerini onayla",
    "Balance Status": "Denge durumu",
    "Credit": "Alacak",
    "Debit": "Borç",
    "Enter all ledger opening balances from the current system and approve only when debit and credit totals match.": "Mevcut sistemden tüm defter açılış bakiyelerini girin ve yalnızca borç ve alacak toplamları eşleştiğinde onaylayın.",
    "Load All Ledgers": "Tüm defterleri yükle",
    "Reference/Remark": "Referans/not",
    "Save Draft": "Taslak kaydet",
    "Saved Credit Total": "Kaydedilen alacak toplamı",
    "Saved Debit Total": "Kaydedilen borç toplamı",
    "House": "House",
    "House No": "House no",
    "Details": "Detaylar",
    "Sub": "Ara",
    "House Shipment Information": "House sevkiyat bilgileri",
    "Invoice Details": "Fatura detayları",
    "Sub Total": "Ara toplam",
    "TAX INVOICE": "VERGİ FATURASI",
    "This is a computer generated invoice.": "Bu fatura bilgisayar tarafından oluşturulmuştur."
  },
  "pt-PT": {
    "Add Line": "Adicionar linha",
    "Approve Opening Balances": "Aprovar saldos de abertura",
    "Balance Status": "Estado do balanço",
    "Credit": "Crédito",
    "Debit": "Débito",
    "Enter all ledger opening balances from the current system and approve only when debit and credit totals match.": "Introduza todos os saldos de abertura do razão a partir do sistema atual e aprove apenas quando os totais de débito e crédito coincidirem.",
    "Load All Ledgers": "Carregar todos os razões",
    "Reference/Remark": "Referência/observação",
    "Save Draft": "Guardar rascunho",
    "Saved Credit Total": "Total de crédito guardado",
    "Saved Debit Total": "Total de débito guardado",
    "House": "House",
    "House No": "N.º house",
    "Details": "Detalhes",
    "Sub": "Sub",
    "House Shipment Information": "Informações do envio house",
    "Invoice Details": "Detalhes da fatura",
    "Sub Total": "Subtotal",
    "TAX INVOICE": "FATURA FISCAL",
    "This is a computer generated invoice.": "Esta fatura foi gerada por computador."
  },
  "ru-RU": {
    "Add Line": "Добавить строку",
    "Approve Opening Balances": "Утвердить начальные остатки",
    "Balance Status": "Статус баланса",
    "Credit": "Кредит",
    "Debit": "Дебет",
    "Enter all ledger opening balances from the current system and approve only when debit and credit totals match.": "Введите все начальные остатки по счетам из текущей системы и утверждайте только тогда, когда итоги дебета и кредита совпадают.",
    "Load All Ledgers": "Загрузить все счета",
    "Reference/Remark": "Ссылка/примечание",
    "Save Draft": "Сохранить черновик",
    "Saved Credit Total": "Сохраненный итог кредита",
    "Saved Debit Total": "Сохраненный итог дебета",
    "House": "House",
    "House No": "№ house-отправки",
    "Details": "Детали",
    "Sub": "Промежуточный",
    "House Shipment Information": "Информация о house-отправке",
    "Invoice Details": "Детали счета",
    "Sub Total": "Промежуточный итог",
    "TAX INVOICE": "НАЛОГОВЫЙ СЧЕТ",
    "This is a computer generated invoice.": "Этот счет создан автоматически."
  }
};

export function setRuntimeLocalizationResources(cultureCode: string, resources: Record<string, string>) {
  if (!cultureCode) return;
  runtimeLocalizationResources[cultureCode] = resources;
}

function currentCultureCode() {
  if (typeof window === "undefined") return env.VITE_DEFAULT_CULTURE;
  const workspaceRaw = window.localStorage.getItem("ff.workspace.preferences");
  if (workspaceRaw) {
    try {
      const parsed = JSON.parse(workspaceRaw) as { cultureCode?: string };
      if (parsed.cultureCode) return parsed.cultureCode;
    } catch {
      // Ignore malformed local storage and fall through to the language preference.
    }
  }
  return getLanguagePreference().cultureCode || env.VITE_DEFAULT_CULTURE;
}

export function lt(value: string) {
  const cultureCode = currentCultureCode();
  if (cultureCode === "en-US") return value;
  return localizationCorrections[cultureCode]?.[value]
    ?? openAiSettingsTranslations[cultureCode]?.[value]
    ?? sharedUploadLinkTranslations[cultureCode]?.[value]
    ?? runtimeLocalizationResources[cultureCode]?.[value]
    ?? branchBankLocalizationCatalogs[cultureCode]?.[value]
    ?? branchLocalizationCatalogs[cultureCode]?.[value]
    ?? tenantLocalizationCatalogs[cultureCode]?.[value]
    ?? settingsLocalizationCatalogs[cultureCode]?.[value]
    ?? operationLocalizationCatalogs[cultureCode]?.[value]
    ?? value;
}
