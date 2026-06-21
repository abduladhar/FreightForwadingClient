import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import * as authApi from "@/api/authApi";
import { authStorage } from "@/auth/authStorage";
import type { AuthSession, LoginCredentials } from "@/auth/authTypes";
import { toast } from "@/components/ui/toast";
import { resolveTenantIdByCode } from "@/api/tenantApi";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission?: string | string[]) => boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => initialSession());
  const [isLoading, setIsLoading] = useState(Boolean(authStorage.get()?.accessToken));

  useEffect(() => {
    const stored = authStorage.get();
    if (!stored?.accessToken || stored.accessToken === "local-demo-token") {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    authApi
      .getCurrentUser()
      .then(async (profile) => {
        const nextSession = authApi.mapProfileToSession(stored, profile);
        const resolvedTenantId = nextSession.tenantId ?? (nextSession.tenantCode ? await resolveTenantIdByCode(nextSession.tenantCode) : null);
        const hydratedSession = resolvedTenantId && resolvedTenantId !== nextSession.tenantId ? { ...nextSession, tenantId: resolvedTenantId } : nextSession;
        if (!mounted) return;
        authStorage.set(hydratedSession, authStorage.isPersistent());
        setSession(hydratedSession);
      })
      .catch(() => {
        authStorage.clear();
        setSession(null);
      })
      .finally(() => setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function expireSession() {
      authStorage.clear();
      setSession(null);
      toast.warning("Session expired", "Please sign in again to continue.");
    }

    function refreshSession(event: Event) {
      const nextSession = (event as CustomEvent<AuthSession>).detail;
      if (nextSession) setSession(nextSession);
    }

    window.addEventListener("auth:expired", expireSession);
    window.addEventListener("auth:refreshed", refreshSession);
    return () => {
      window.removeEventListener("auth:expired", expireSession);
      window.removeEventListener("auth:refreshed", refreshSession);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isAuthenticated: Boolean(session),
      hasPermission(permission) {
        if (!permission) return true;
        if (!session) return false;
        const normalizedRole = (session.roleName ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();
        if (normalizedRole === "superadmin" || normalizedRole === "superadministrator" || normalizedRole === "tenantadmin") {
          return true;
        }
        const required = Array.isArray(permission) ? permission : [permission];
        return required.some((item) => session.permissions.includes(item));
      },
      async signIn(credentials) {
        const nextSession: AuthSession = await authApi.login(credentials);
        authStorage.set(nextSession, credentials.rememberMe ?? true);
        let hydratedSession = nextSession;
        if (!nextSession.tenantId && nextSession.tenantCode) {
          const resolvedTenantId = await resolveTenantIdByCode(nextSession.tenantCode);
          if (resolvedTenantId) {
            hydratedSession = { ...nextSession, tenantId: resolvedTenantId };
            authStorage.set(hydratedSession, credentials.rememberMe ?? true);
          }
        }
        setSession(hydratedSession);
        toast.success("Signed in", `Welcome, ${hydratedSession.displayName}.`);
      },
      async signOut() {
        if (session?.refreshToken && session.refreshToken !== "local-demo-refresh-token") {
          await authApi.logout(session.refreshToken).catch(() => undefined);
        }
        authStorage.clear();
        setSession(null);
        toast.info("Signed out", "Your ERP session has ended.");
      }
    }),
    [isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function initialSession() {
  const stored = authStorage.get();
  if (stored && !isExpired(stored)) return stored;
  if (stored) authStorage.clear();
  return null;
}

function isExpired(session: AuthSession) {
  if (!session.expiresAt || session.accessToken === "local-demo-token") return false;
  return new Date(session.expiresAt).getTime() <= Date.now();
}
