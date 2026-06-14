import type { AuthSession } from "@/auth/authTypes";

const storageKey = "freight-erp-session";

export const authStorage = {
  get(): AuthSession | null {
    const raw = window.localStorage.getItem(storageKey) ?? window.sessionStorage.getItem(storageKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      this.clear();
      return null;
    }
  },
  set(session: AuthSession, persist = true) {
    const target = persist ? window.localStorage : window.sessionStorage;
    const other = persist ? window.sessionStorage : window.localStorage;
    other.removeItem(storageKey);
    target.setItem(storageKey, JSON.stringify(session));
  },
  isPersistent() {
    return Boolean(window.localStorage.getItem(storageKey));
  },
  clear() {
    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem(storageKey);
  }
};
