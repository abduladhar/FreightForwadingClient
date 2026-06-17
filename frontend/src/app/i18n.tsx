import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLocalizationResources } from "@/api/languageApi";
import { customerLocalizationFallbacks } from "@/app/customerLocalizationFallbacks";
import { currencyLocalizationFallbacks } from "@/app/currencyLocalizationFallbacks";
import { menuLocalizationFallbacks } from "@/app/menuLocalizationFallbacks";
import { uiLocalizationFallbacks } from "@/app/uiLocalizationFallbacks";
import { useWorkspace } from "@/hooks/useWorkspace";
import { setRuntimeLocalizationResources } from "@/modules/operationsLocalization";

interface I18nContextValue {
  t: (key: string, fallback?: string) => string;
  resources: Record<string, string>;
  isLoading: boolean;
}

const englishFallbacks: Record<string, string> = {
  "Layout.FreightErp": "Freight ERP",
  "Layout.ForwardingSuite": "Forwarding Suite",
  "Layout.MenuSearchPlaceholder": "Search menu",
  "Layout.Profile": "Profile",
  "Layout.Notifications": "Notifications",
  "Layout.Logout": "Logout",
  "Navigation.dashboard.Label": "Dashboard",
  "Navigation.masters.Label": "Masters",
  "Navigation.operations.Label": "Operations",
  "Navigation.shipments.Label": "Shipments",
  "Navigation.finance.Label": "Finance",
  "Navigation.accounting.Label": "Accounting",
  "Navigation.reports.Label": "Reports",
  "Navigation.documents.Label": "Documents",
  "Navigation.portals.Label": "Portals",
  "Navigation.administration.Label": "Administration",
  "Navigation.audit-logs.Label": "Audit Logs",
  "Navigation.settings.Label": "Settings",
  "Login.Title": "Login",
  "Login.SignInTitle": "Sign in to Freight ERP",
  "Login.SignInSubtitle": "Access your tenant workspace, branch operations, portals, and finance controls.",
  "Login.TenantCode": "Tenant code",
  "Login.EmailOrUsername": "Email or username",
  "Login.Password": "Password",
  "Login.Language": "Language",
  "Login.LanguageHelp": "Server messages, labels, reports, PDFs, and formatting use the selected language. English is the fallback.",
  "Login.RememberMe": "Remember me",
  "Login.ForgotPassword": "Forgot password?",
  "Login.Continue": "Continue to ERP",
  "Login.SigningIn": "Signing in...",
  "Login.Failed": "Login failed. Check tenant, email, password, and API availability.",
  "Login.SecurityNote": "Protected by tenant isolation, branch scope, and permission policies.",
  "Login.NeedHelp": "Need help?",
  "Login.BackendUnavailable": "Backend unavailable",
  "Login.BackendUnavailableDetail": "Unable to reach {0}. Verify API URL, CORS, and HTTPS trust.",
  "Login.EnterEmailFirst": "Enter your email or username first.",
  "Login.PasswordResetRequested": "Password reset requested",
  "Login.PasswordResetRequestedDetail": "If the account exists, reset instructions will be sent.",
  "Login.PasswordResetFailed": "Password reset request failed. Please try again.",
  "Common.Refresh": "Refresh"
};

const localizedFallbacks: Record<string, Record<string, string>> = {
  "ar-QA": {
    "Common.Refresh": "تحديث",
    "Navigation.dashboard.Label": "لوحة التحكم",
    "Navigation.masters.Label": "البيانات الرئيسية",
    "Navigation.rate-quotation.Label": "الأسعار وعروض الأسعار",
    "Navigation.operations.Label": "العمليات",
    "Navigation.shipments.Label": "الشحنات",
    "Navigation.finance.Label": "المالية",
    "Navigation.accounting.Label": "المحاسبة",
    "Navigation.reports.Label": "التقارير",
    "Navigation.documents.Label": "المستندات",
    "Navigation.portals.Label": "البوابات",
    "Navigation.administration.Label": "الإدارة",
    "Navigation.audit-logs.Label": "سجلات التدقيق",
    "Navigation.settings.Label": "الإعدادات"
  },
  "hi-IN": {
    "Common.Refresh": "रीफ़्रेश",
    "Navigation.dashboard.Label": "डैशबोर्ड",
    "Navigation.masters.Label": "मास्टर",
    "Navigation.rate-quotation.Label": "रेट और कोटेशन",
    "Navigation.operations.Label": "संचालन",
    "Navigation.shipments.Label": "शिपमेंट",
    "Navigation.finance.Label": "वित्त",
    "Navigation.accounting.Label": "लेखा",
    "Navigation.reports.Label": "रिपोर्ट",
    "Navigation.documents.Label": "दस्तावेज़",
    "Navigation.portals.Label": "पोर्टल",
    "Navigation.administration.Label": "प्रशासन",
    "Navigation.audit-logs.Label": "ऑडिट लॉग",
    "Navigation.settings.Label": "सेटिंग्स"
  },
  "fr-FR": {
    "Common.Refresh": "Actualiser",
    "Navigation.dashboard.Label": "Tableau de bord",
    "Navigation.masters.Label": "Référentiels",
    "Navigation.rate-quotation.Label": "Tarifs et devis",
    "Navigation.operations.Label": "Opérations",
    "Navigation.shipments.Label": "Expéditions",
    "Navigation.finance.Label": "Finance",
    "Navigation.accounting.Label": "Comptabilité",
    "Navigation.reports.Label": "Rapports",
    "Navigation.documents.Label": "Documents",
    "Navigation.portals.Label": "Portails",
    "Navigation.administration.Label": "Administration",
    "Navigation.audit-logs.Label": "Journaux d'audit",
    "Navigation.settings.Label": "Paramètres"
  },
  "es-ES": {
    "Common.Refresh": "Actualizar",
    "Navigation.dashboard.Label": "Panel",
    "Navigation.masters.Label": "Maestros",
    "Navigation.rate-quotation.Label": "Tarifas y cotizaciones",
    "Navigation.operations.Label": "Operaciones",
    "Navigation.shipments.Label": "Envíos",
    "Navigation.finance.Label": "Finanzas",
    "Navigation.accounting.Label": "Contabilidad",
    "Navigation.reports.Label": "Informes",
    "Navigation.documents.Label": "Documentos",
    "Navigation.portals.Label": "Portales",
    "Navigation.administration.Label": "Administración",
    "Navigation.audit-logs.Label": "Registros de auditoría",
    "Navigation.settings.Label": "Configuración"
  },
  "zh-CN": {
    "Common.Refresh": "刷新",
    "Navigation.dashboard.Label": "仪表板",
    "Navigation.masters.Label": "主数据",
    "Navigation.rate-quotation.Label": "费率和报价",
    "Navigation.operations.Label": "操作",
    "Navigation.shipments.Label": "货运",
    "Navigation.finance.Label": "财务",
    "Navigation.accounting.Label": "会计",
    "Navigation.reports.Label": "报表",
    "Navigation.documents.Label": "文档",
    "Navigation.portals.Label": "门户",
    "Navigation.administration.Label": "管理",
    "Navigation.audit-logs.Label": "审计日志",
    "Navigation.settings.Label": "设置"
  },
  "tr-TR": {
    "Common.Refresh": "Yenile",
    "Navigation.dashboard.Label": "Pano",
    "Navigation.masters.Label": "Ana veriler",
    "Navigation.rate-quotation.Label": "Fiyat ve teklif",
    "Navigation.operations.Label": "Operasyonlar",
    "Navigation.shipments.Label": "Sevkiyatlar",
    "Navigation.finance.Label": "Finans",
    "Navigation.accounting.Label": "Muhasebe",
    "Navigation.reports.Label": "Raporlar",
    "Navigation.documents.Label": "Belgeler",
    "Navigation.portals.Label": "Portallar",
    "Navigation.administration.Label": "Yönetim",
    "Navigation.audit-logs.Label": "Denetim kayıtları",
    "Navigation.settings.Label": "Ayarlar"
  },
  "pt-PT": {
    "Common.Refresh": "Atualizar",
    "Navigation.dashboard.Label": "Painel",
    "Navigation.masters.Label": "Cadastros",
    "Navigation.rate-quotation.Label": "Tarifas e cotações",
    "Navigation.operations.Label": "Operações",
    "Navigation.shipments.Label": "Remessas",
    "Navigation.finance.Label": "Finanças",
    "Navigation.accounting.Label": "Contabilidade",
    "Navigation.reports.Label": "Relatórios",
    "Navigation.documents.Label": "Documentos",
    "Navigation.portals.Label": "Portais",
    "Navigation.administration.Label": "Administração",
    "Navigation.audit-logs.Label": "Registros de auditoria",
    "Navigation.settings.Label": "Configurações"
  },
  "ru-RU": {
    "Common.Refresh": "Обновить",
    "Navigation.dashboard.Label": "Панель",
    "Navigation.masters.Label": "Справочники",
    "Navigation.rate-quotation.Label": "Тарифы и предложения",
    "Navigation.operations.Label": "Операции",
    "Navigation.shipments.Label": "Отправки",
    "Navigation.finance.Label": "Финансы",
    "Navigation.accounting.Label": "Бухгалтерия",
    "Navigation.reports.Label": "Отчеты",
    "Navigation.documents.Label": "Документы",
    "Navigation.portals.Label": "Порталы",
    "Navigation.administration.Label": "Администрирование",
    "Navigation.audit-logs.Label": "Журналы аудита",
    "Navigation.settings.Label": "Настройки"
  }
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: PropsWithChildren) {
  const { cultureCode } = useWorkspace();
  const resourcesQuery = useQuery({
    queryKey: ["localization", "resources", cultureCode],
    queryFn: () => getLocalizationResources(cultureCode),
    staleTime: 15 * 60_000
  });

  const value = useMemo<I18nContextValue>(
    () => ({
      resources: resourcesQuery.data ?? {},
      isLoading: resourcesQuery.isLoading,
      t(key, fallback) {
        const resourceValue = resourcesQuery.data?.[key];
        const customerFallback = customerLocalizationFallbacks[cultureCode]?.[key];
        const currencyFallback = currencyLocalizationFallbacks[cultureCode]?.[key];
        const menuFallback = menuLocalizationFallbacks[cultureCode]?.[key];
        const uiFallback = uiLocalizationFallbacks[cultureCode]?.[key];
        const englishValue = englishFallbacks[key] ?? fallback ?? key;
        if (cultureCode !== "en-US" && key.startsWith("Navigation.") && menuFallback && (!resourceValue || resourceValue === englishValue)) {
          return menuFallback;
        }
        if (cultureCode !== "en-US" && uiFallback && (!resourceValue || resourceValue === englishValue)) {
          return uiFallback;
        }
        if (cultureCode !== "en-US" && currencyFallback && (!resourceValue || resourceValue === englishValue)) {
          return currencyFallback;
        }
        if (cultureCode !== "en-US" && customerFallback && (!resourceValue || resourceValue === englishValue)) {
          return customerFallback;
        }
        return resourceValue ?? menuFallback ?? uiFallback ?? currencyFallback ?? customerFallback ?? localizedFallbacks[cultureCode]?.[key] ?? englishFallbacks[key] ?? fallback ?? key;
      }
    }),
    [cultureCode, resourcesQuery.data, resourcesQuery.isLoading]
  );

  useEffect(() => {
    setRuntimeLocalizationResources(cultureCode, resourcesQuery.data ?? {});
  }, [cultureCode, resourcesQuery.data]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider.");
  }
  return context;
}

export function useOptionalI18n() {
  return useContext(I18nContext);
}
