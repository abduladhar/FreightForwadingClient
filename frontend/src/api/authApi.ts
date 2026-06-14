import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse } from "@/api/apiResponse";
import type { AuthSession, BackendLoginResponse, LoginCredentials, UserProfile } from "@/auth/authTypes";
import { env } from "@/app/env";

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await axiosClient.post<ApiResponse<BackendLoginResponse>>(
    "/api/auth/login",
    {
      userNameOrEmail: credentials.email,
      password: credentials.password
    },
    {
      headers: {
        "X-Tenant-Code": credentials.tenantCode,
        "Accept-Language": credentials.cultureCode ?? env.VITE_DEFAULT_CULTURE,
        "X-Language-Code": credentials.languageCode ?? env.VITE_DEFAULT_LANGUAGE
      }
    }
  );

  return mapLoginResponse(response.data.data, credentials.tenantCode, credentials.languageCode, credentials.cultureCode);
}

export async function refreshToken(refreshToken: string, tenantCode: string): Promise<AuthSession> {
  const response = await axiosClient.post<ApiResponse<BackendLoginResponse>>(
    "/api/auth/refresh-token",
    { refreshToken },
    {
      headers: {
        "X-Tenant-Code": tenantCode
      }
    }
  );
  return mapLoginResponse(response.data.data, tenantCode);
}

export async function logout(refreshToken: string) {
  await axiosClient.post("/api/auth/logout", { refreshToken });
}

export async function getCurrentUser() {
  const response = await axiosClient.get<ApiResponse<UserProfile>>("/api/users/profile");
  return response.data.data;
}

export async function requestPasswordReset(userNameOrEmail: string) {
  await axiosClient.post("/api/auth/password-reset/request", { userNameOrEmail });
}

export function mapProfileToSession(session: AuthSession, profile: UserProfile): AuthSession {
  return {
    ...session,
    userId: profile.id,
    tenantId: profile.tenantId,
    branchId: profile.branchId,
    userName: profile.userName,
    displayName: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email,
    roleName: profile.roles[0] ?? session.roleName,
    permissions: profile.permissions
  };
}

function mapLoginResponse(payload: BackendLoginResponse, tenantCode: string, languageCode?: string, cultureCode?: string): AuthSession {
  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresAt: payload.expiresAt,
    userId: payload.user.id,
    tenantId: payload.user.tenantId,
    tenantCode,
    userName: payload.user.userName,
    displayName: [payload.user.firstName, payload.user.lastName].filter(Boolean).join(" ") || payload.user.email,
    roleName: payload.user.roles[0] ?? "User",
    branchId: payload.user.branchId,
    branchName: payload.user.branchId ? "Current Branch" : "Tenant Workspace",
    baseCurrency: env.VITE_DEFAULT_CURRENCY,
    languageCode: languageCode ?? env.VITE_DEFAULT_LANGUAGE,
    cultureCode: cultureCode ?? env.VITE_DEFAULT_CULTURE,
    permissions: payload.user.permissions
  };
}
