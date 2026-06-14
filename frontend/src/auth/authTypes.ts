export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
  userId?: string;
  tenantId?: string;
  tenantCode: string;
  userName: string;
  displayName: string;
  roleName: string;
  branchId?: string;
  branchName: string;
  baseCurrency: string;
  languageCode: string;
  cultureCode: string;
  permissions: string[];
}

export interface LoginCredentials {
  tenantCode: string;
  email: string;
  password: string;
  languageCode?: string;
  cultureCode?: string;
  rememberMe?: boolean;
}

export interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    tenantId: string;
    branchId?: string;
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
  };
}

export interface UserProfile {
  id: string;
  tenantId: string;
  branchId?: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}
