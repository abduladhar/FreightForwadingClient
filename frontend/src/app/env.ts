import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().optional(),
  VITE_APP_NAME: z.string().default("Freight Forwarding ERP"),
  VITE_DEFAULT_TENANT_CODE: z.string().default("DEFAULT"),
  VITE_DEFAULT_BRANCH_ID: z.string().optional(),
  VITE_DEFAULT_CURRENCY: z.string().length(3).default("USD"),
  VITE_DEFAULT_LANGUAGE: z.string().default("EN"),
  VITE_DEFAULT_CULTURE: z.string().default("en-US"),
  VITE_ENABLE_DEMO_AUTH: z.coerce.boolean().default(true)
});

const parsed = envSchema.parse(import.meta.env);

function normalizeApiBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
  const configured = parsed.VITE_API_BASE_URL?.trim();
  if (configured) {
    return normalizeApiBaseUrl(configured);
  }

  if (import.meta.env.PROD) {
    throw new Error("VITE_API_BASE_URL is required in production.");
  }

  return "http://localhost:62262";
}

const resolvedApiBaseUrl = resolveApiBaseUrl();

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(`API Base URL: ${resolvedApiBaseUrl}`);
}

export const env = {
  ...parsed,
  VITE_API_BASE_URL: resolvedApiBaseUrl
};
