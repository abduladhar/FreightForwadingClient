import { z } from "zod";

export const tenantSchema = z.object({
  tenantCode: z.string().trim().min(2).max(50),
  tenantName: z.string().trim().min(2).max(200),
  legalName: z.string().trim().min(2).max(200),
  email: z.string().trim().email(),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  taxNumber: z.string().trim().max(100).optional().or(z.literal("")),
  baseCurrencyId: z.string().uuid().optional().or(z.literal("")),
  defaultLanguageId: z.string().uuid().optional().or(z.literal("")),
  financialYearStartMonth: z.coerce.number().int().min(1).max(12),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  isActive: z.boolean()
});

export type TenantFormValues = z.infer<typeof tenantSchema>;

export const tenantSettingsSchema = z.object({
  timeZone: z.string().trim().min(1).max(100),
  dateFormat: z.string().trim().min(1).max(50),
  numberFormat: z.string().trim().min(1).max(50),
  defaultTheme: z.string().trim().max(50).optional().or(z.literal("")),
  enableCustomerPortal: z.boolean(),
  enableAgentPortal: z.boolean(),
  requireTwoFactorAuthentication: z.boolean(),
  awsS3AccessKeyId: z.string().trim().max(256).optional().or(z.literal("")),
  awsS3SecretAccessKey: z.string().trim().max(512).optional().or(z.literal("")),
  awsS3Region: z.string().trim().max(64).optional().or(z.literal("")),
  configurationJson: z.string().trim().optional().or(z.literal(""))
});

export type TenantSettingsFormValues = z.infer<typeof tenantSettingsSchema>;
