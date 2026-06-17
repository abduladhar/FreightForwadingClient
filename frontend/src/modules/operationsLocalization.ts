import { env } from "@/app/env";
import { getLanguagePreference } from "@/app/languagePreference";
import { branchLocalizationCatalogs } from "@/modules/branchLocalizationCatalog";
import { branchBankLocalizationCatalogs } from "@/modules/branchBankLocalizationCatalog";
import { operationLocalizationCatalogs } from "@/modules/operationsLocalizationCatalog";
import { settingsLocalizationCatalogs } from "@/modules/settingsLocalizationCatalog";
import { tenantLocalizationCatalogs } from "@/modules/tenantLocalizationCatalog";

const runtimeLocalizationResources: Record<string, Record<string, string>> = {};
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
    ?? runtimeLocalizationResources[cultureCode]?.[value]
    ?? branchBankLocalizationCatalogs[cultureCode]?.[value]
    ?? branchLocalizationCatalogs[cultureCode]?.[value]
    ?? tenantLocalizationCatalogs[cultureCode]?.[value]
    ?? settingsLocalizationCatalogs[cultureCode]?.[value]
    ?? operationLocalizationCatalogs[cultureCode]?.[value]
    ?? value;
}
