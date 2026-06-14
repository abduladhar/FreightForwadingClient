import axios, { AxiosHeaders, type AxiosError, type AxiosRequestConfig } from "axios";
import { env } from "@/app/env";
import { getLanguagePreference } from "@/app/languagePreference";
import type { ApiResponse } from "@/api/apiResponse";
import { ApiClientError, type ApiFieldError } from "@/api/apiError";
import { authStorage } from "@/auth/authStorage";
import type { AuthSession, BackendLoginResponse } from "@/auth/authTypes";
import { toast } from "@/components/ui/toast";

function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
}

function buildBaseUrlCandidates(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  const candidates = [normalized];

  try {
    const parsed = new URL(normalized);
    if (parsed.hostname === "localhost" && parsed.protocol === "https:") {
      candidates.push("http://localhost:62262");
    } else if (parsed.hostname === "localhost" && parsed.protocol === "http:") {
      candidates.push("https://localhost:62261");
    }
  } catch {
    // Ignore malformed URLs and keep the configured base only.
  }

  return Array.from(new Set(candidates));
}

const apiBaseCandidates = buildBaseUrlCandidates(env.VITE_API_BASE_URL);
let activeApiBaseUrl = apiBaseCandidates[0];

function setActiveApiBaseUrl(nextBaseUrl: string) {
  activeApiBaseUrl = nextBaseUrl;
  rawClient.defaults.baseURL = nextBaseUrl;
  axiosClient.defaults.baseURL = nextBaseUrl;
}

const rawClient = axios.create({
  baseURL: activeApiBaseUrl,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json"
  }
});

export const axiosClient = axios.create({
  baseURL: activeApiBaseUrl,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json"
  }
});

let refreshPromise: Promise<AuthSession | null> | null = null;

axiosClient.interceptors.request.use((config) => {
  config.baseURL = config.baseURL ?? activeApiBaseUrl;
  const session = authStorage.get();
  const languagePreference = getLanguagePreference();
  const headers = AxiosHeaders.from(config.headers);

  if (session?.tenantId && headers.get("X-Tenant-Id") == null) {
    headers.set("X-Tenant-Id", session.tenantId);
  }
  if (headers.get("X-Tenant-Code") == null) {
    headers.set("X-Tenant-Code", session?.tenantCode ?? env.VITE_DEFAULT_TENANT_CODE);
  }
  if (headers.get("Accept-Language") == null) {
    headers.set("Accept-Language", session?.cultureCode ?? languagePreference.cultureCode ?? env.VITE_DEFAULT_CULTURE);
  }
  if (headers.get("X-Language-Code") == null) {
    headers.set("X-Language-Code", session?.languageCode ?? languagePreference.languageCode ?? env.VITE_DEFAULT_LANGUAGE);
  }
  if (headers.get("X-Currency-Code") == null) {
    headers.set("X-Currency-Code", session?.baseCurrency ?? env.VITE_DEFAULT_CURRENCY);
  }

  const branchId = session?.branchId ?? env.VITE_DEFAULT_BRANCH_ID;
  if (branchId && headers.get("X-Branch-Id") == null) {
    headers.set("X-Branch-Id", branchId);
  }

  if (session?.accessToken) {
    headers.set("Authorization", headers.get("Authorization") ?? `Bearer ${session.accessToken}`);
  }

  config.headers = headers;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean; _fallbackRetry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await refreshSession();
      if (refreshed?.accessToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${refreshed.accessToken}`
        };
        return axiosClient(originalRequest);
      }
      authStorage.clear();
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    if (!error.response && originalRequest && !originalRequest._fallbackRetry) {
      const alternateBaseUrl = apiBaseCandidates.find((candidate) => candidate !== (originalRequest.baseURL ?? activeApiBaseUrl));
      if (alternateBaseUrl) {
        originalRequest._fallbackRetry = true;
        originalRequest.baseURL = alternateBaseUrl;
        setActiveApiBaseUrl(alternateBaseUrl);
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.info(`API Base URL fallback active: ${activeApiBaseUrl}`);
        }
        return axiosClient(originalRequest);
      }
    }

    const apiError = toApiError(error);
    const suppressToast = Boolean((originalRequest?.headers as Record<string, unknown> | undefined)?.["X-Suppress-Error-Toast"]);
    if (apiError.status !== 401 && !suppressToast) {
      toast.error("Request failed", apiError.message);
    }
    return Promise.reject(apiError);
  }
);

export async function uploadFile<T>(url: string, file: File, data?: Record<string, string | Blob>, config?: AxiosRequestConfig) {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(data ?? {}).forEach(([key, value]) => formData.append(key, value));
  const response = await axiosClient.post<ApiResponse<T>>(url, formData, {
    ...config,
    headers: {
      ...config?.headers,
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data.data;
}

export async function downloadFile(url: string, fileName: string, config?: AxiosRequestConfig) {
  const response = await axiosClient.get<Blob>(url, {
    ...config,
    responseType: "blob"
  });
  const objectUrl = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export async function checkApiHealth() {
  for (const baseUrl of apiBaseCandidates) {
    const candidate = axios.create({
      baseURL: baseUrl,
      timeout: 7_000,
      headers: {
        "Content-Type": "application/json"
      }
    });

    try {
      await candidate.get("/health", { headers: { "X-Suppress-Error-Toast": "true" } });
      setActiveApiBaseUrl(baseUrl);
      return { ok: true as const, endpoint: joinUrl(baseUrl, "/health") };
    } catch (error) {
      void error;
      try {
        await candidate.get("/api/health", { headers: { "X-Suppress-Error-Toast": "true" } });
        setActiveApiBaseUrl(baseUrl);
        return { ok: true as const, endpoint: joinUrl(baseUrl, "/api/health") };
      } catch {
        // try next candidate
      }
    }
  }

  return { ok: false as const, endpoint: joinUrl(apiBaseCandidates[0], "/health"), error: new Error("API health check failed.") };
}

async function refreshSession() {
  if (refreshPromise) return refreshPromise;

  const session = authStorage.get();
  if (!session?.refreshToken || session.refreshToken === "local-demo-refresh-token") return null;

  refreshPromise = rawClient
    .post<ApiResponse<BackendLoginResponse>>(
      "/api/auth/refresh-token",
      { refreshToken: session.refreshToken },
      { headers: { "X-Tenant-Code": session.tenantCode } }
    )
    .then((response) => {
      const payload = response.data.data;
      const nextSession: AuthSession = {
        ...session,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        expiresAt: payload.expiresAt,
        userId: payload.user.id,
        tenantId: payload.user.tenantId,
        branchId: payload.user.branchId,
        userName: payload.user.userName,
        displayName: [payload.user.firstName, payload.user.lastName].filter(Boolean).join(" ") || payload.user.email,
        roleName: payload.user.roles[0] ?? session.roleName,
        permissions: payload.user.permissions
      };
      authStorage.set(nextSession, authStorage.isPersistent());
      window.dispatchEvent(new CustomEvent("auth:refreshed", { detail: nextSession }));
      return nextSession;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function toApiError(error: AxiosError<ApiResponse<unknown>>) {
  if (!error.response) {
    return new ApiClientError("The API is unavailable. Check API URL, CORS, HTTPS certificate trust, or backend service status.", undefined);
  }

  const payload = error.response.data;
  const errors = normalizeErrors(payload?.errors);
  return new ApiClientError(payload?.message || error.message || "Request failed.", error.response.status, errors);
}

function normalizeErrors(errors: ApiResponse<unknown>["errors"]): ApiFieldError[] {
  return (errors ?? []).map((error) => ({
    code: error.code,
    message: error.message,
    field: error.field
  }));
}
