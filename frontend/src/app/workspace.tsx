import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { env } from "@/app/env";
import { authStorage } from "@/auth/authStorage";
import { useAuth } from "@/auth/useAuth";

export interface WorkspaceState {
  tenantCode: string;
  branchId?: string;
  branchName: string;
  baseCurrency: string;
  languageCode: string;
  cultureCode: string;
  financialYear: string;
}

interface WorkspaceContextValue extends WorkspaceState {
  setTenant: (tenantCode: string, tenantId?: string) => void;
  setBranch: (branchId: string, branchName: string) => void;
  setBaseCurrency: (currency: string) => void;
  setLanguage: (languageCode: string, cultureCode: string) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);
const preferenceStorageKey = "ff.workspace.preferences";

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const initialPreferences = loadPreferences();
  const [baseCurrency, setBaseCurrencyState] = useState(initialPreferences.baseCurrency ?? session?.baseCurrency ?? env.VITE_DEFAULT_CURRENCY);
  const [tenantCode, setTenantCodeState] = useState(session?.tenantCode ?? env.VITE_DEFAULT_TENANT_CODE);
  const [branchState, setBranchState] = useState({
    branchId: session?.branchId ?? env.VITE_DEFAULT_BRANCH_ID,
    branchName: session?.branchName ?? "Head Office"
  });
  const [language, setLanguageState] = useState({
    languageCode: initialPreferences.languageCode ?? session?.languageCode ?? env.VITE_DEFAULT_LANGUAGE,
    cultureCode: initialPreferences.cultureCode ?? session?.cultureCode ?? env.VITE_DEFAULT_CULTURE
  });

  useEffect(() => {
    if (!session) return;
    setTenantCodeState(session.tenantCode);
    setBranchState({
      branchId: session.branchId ?? env.VITE_DEFAULT_BRANCH_ID,
      branchName: session.branchName
    });
    setBaseCurrencyState(session.baseCurrency);
    setLanguageState({
      languageCode: session.languageCode,
      cultureCode: session.cultureCode
    });
  }, [session?.accessToken, session?.baseCurrency, session?.languageCode, session?.cultureCode]);

  useEffect(() => {
    savePreferences({
      baseCurrency,
      languageCode: language.languageCode,
      cultureCode: language.cultureCode
    });
  }, [baseCurrency, language]);

  useEffect(() => {
    const isRtl = language.languageCode.toLowerCase().startsWith("ar") || language.cultureCode.toLowerCase().startsWith("ar");
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = language.cultureCode || language.languageCode || "en-US";
  }, [language.languageCode, language.cultureCode]);

  const setBaseCurrency = useCallback((currency: string) => {
    setBaseCurrencyState(currency);
    if (!session) return;
    authStorage.set({ ...session, baseCurrency: currency }, authStorage.isPersistent());
  }, [session]);

  const setTenant = useCallback((tenantCode: string, tenantId?: string) => {
    setTenantCodeState(tenantCode);
    if (!session) return;
    authStorage.set({ ...session, tenantCode, tenantId: tenantId ?? session.tenantId }, authStorage.isPersistent());
  }, [session]);

  const setBranch = useCallback((branchId: string, branchName: string) => {
    setBranchState({ branchId, branchName });
    if (!session) return;
    authStorage.set({ ...session, branchId, branchName }, authStorage.isPersistent());
  }, [session]);

  const setLanguage = useCallback((languageCode: string, cultureCode: string) => {
    setLanguageState({ languageCode, cultureCode });
    if (!session) return;
    authStorage.set({ ...session, languageCode, cultureCode }, authStorage.isPersistent());
  }, [session]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      tenantCode,
      branchId: branchState.branchId,
      branchName: branchState.branchName,
      baseCurrency,
      languageCode: language.languageCode,
      cultureCode: language.cultureCode,
      financialYear: "FY 2026",
      setTenant,
      setBranch,
      setBaseCurrency,
      setLanguage
    }),
    [baseCurrency, branchState, language, tenantCode, setBaseCurrency, setBranch, setLanguage, setTenant]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

function loadPreferences() {
  const raw = localStorage.getItem(preferenceStorageKey);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Partial<Pick<WorkspaceState, "baseCurrency" | "languageCode" | "cultureCode">>;
    return parsed;
  } catch {
    return {};
  }
}

function savePreferences(preferences: Partial<Pick<WorkspaceState, "baseCurrency" | "languageCode" | "cultureCode">>) {
  localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences));
}
