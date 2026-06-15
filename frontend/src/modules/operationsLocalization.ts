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
