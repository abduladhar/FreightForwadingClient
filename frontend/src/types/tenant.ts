export interface Tenant {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  legalName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  country: string;
  city: string;
  taxNumber?: string | null;
  baseCurrencyId?: string | null;
  defaultLanguageId?: string | null;
  financialYearStartMonth: number;
  logoUrl?: string | null;
  isActive: boolean;
}

export interface TenantOption {
  id: string;
  code: string;
  name: string;
}

export interface TenantUpsertRequest {
  tenantCode: string;
  tenantName: string;
  legalName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  country: string;
  city: string;
  taxNumber?: string | null;
  baseCurrencyId?: string | null;
  defaultLanguageId?: string | null;
  financialYearStartMonth: number;
  logoUrl?: string | null;
  isActive: boolean;
}

export interface TenantSettings {
  tenantId: string;
  timeZone: string;
  dateFormat: string;
  numberFormat: string;
  defaultTheme?: string | null;
  enableCustomerPortal: boolean;
  enableAgentPortal: boolean;
  requireTwoFactorAuthentication: boolean;
  awsS3AccessKeyId?: string | null;
  hasAwsS3SecretAccessKey: boolean;
  awsS3Region?: string | null;
  configurationJson?: string | null;
}

export interface TenantSettingsUpdateRequest {
  timeZone: string;
  dateFormat: string;
  numberFormat: string;
  defaultTheme?: string | null;
  enableCustomerPortal: boolean;
  enableAgentPortal: boolean;
  requireTwoFactorAuthentication: boolean;
  awsS3AccessKeyId?: string | null;
  awsS3SecretAccessKey?: string | null;
  awsS3Region?: string | null;
  configurationJson?: string | null;
}
