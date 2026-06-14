import { getTenantSettings, updateTenantSettings } from "@/api/tenantApi";

export interface NumberingSetting {
  id: string;
  moduleName: string;
  documentType: string;
  prefix: string;
  suffix?: string | null;
  separator: string;
  digitLength: number;
  startingNumber?: number | null;
  resetPolicy: "Never" | "Yearly" | "Monthly" | "Daily";
  nextNumber: number;
  branchId?: string | null;
  transportMode?: "Air" | "Sea" | "Land" | "Road" | "Courier" | "" | null;
  originPortGuid?: string | null;
  destinationPortGuid?: string | null;
  isActive: boolean;
}

export interface PrintTemplateSetting {
  id: string;
  code: string;
  name: string;
  moduleName: string;
  languageCode: string;
  pageSize: "A4" | "A5" | "Letter" | "Legal" | "Custom";
  orientation: "Portrait" | "Landscape";
  includeLogo: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  includeBarcode: boolean;
  includeQrCode: boolean;
  subjectPlaceholder?: string | null;
  headerTemplate: string;
  bodyTemplate: string;
  footerTemplate: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface LabelTemplateSetting {
  id: string;
  code: string;
  name: string;
  moduleName: string;
  languageCode: string;
  destinationCode?: string | null;
  labelWidthMm: number;
  labelHeightMm: number;
  includeLogo: boolean;
  includeBarcode: boolean;
  includeQrCode: boolean;
  bodyTemplate: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface ApprovalWorkflowLevel {
  id: string;
  sequence: number;
  roleId: string;
  roleName?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  requiresAllApprovers: boolean;
}

export interface ApprovalWorkflowSetting {
  id: string;
  name: string;
  moduleName: string;
  currencyCode?: string | null;
  approvalMode: "SingleLevel" | "MultiLevel";
  remarksRequired: boolean;
  rejectionReasonRequired: boolean;
  isActive: boolean;
  levels: ApprovalWorkflowLevel[];
}

export interface ErpUiSettingsBundle {
  numberingSettings: NumberingSetting[];
  printTemplates: PrintTemplateSetting[];
  labelTemplates: LabelTemplateSetting[];
  approvalWorkflows: ApprovalWorkflowSetting[];
}

interface ErpConfigurationJson extends ErpUiSettingsBundle {
  [key: string]: unknown;
}

const defaultBundle: ErpUiSettingsBundle = {
  numberingSettings: [],
  printTemplates: [],
  labelTemplates: [],
  approvalWorkflows: []
};

export async function getErpUiSettings(tenantId: string) {
  const settings = await getTenantSettings(tenantId);
  const configuration = parseConfiguration(settings.configurationJson);
  return {
    settings,
    bundle: toBundle(configuration)
  };
}

export async function saveNumberingSettings(tenantId: string, rows: NumberingSetting[]) {
  return updateBundle(tenantId, (bundle) => ({ ...bundle, numberingSettings: rows }));
}

export async function savePrintTemplates(tenantId: string, rows: PrintTemplateSetting[]) {
  return updateBundle(tenantId, (bundle) => ({ ...bundle, printTemplates: rows }));
}

export async function saveLabelTemplates(tenantId: string, rows: LabelTemplateSetting[]) {
  return updateBundle(tenantId, (bundle) => ({ ...bundle, labelTemplates: rows }));
}

export async function saveApprovalWorkflows(tenantId: string, rows: ApprovalWorkflowSetting[]) {
  return updateBundle(tenantId, (bundle) => ({ ...bundle, approvalWorkflows: rows }));
}

async function updateBundle(
  tenantId: string,
  updater: (bundle: ErpUiSettingsBundle) => ErpUiSettingsBundle
) {
  const currentSettings = await getTenantSettings(tenantId);
  const configuration = parseConfiguration(currentSettings.configurationJson);
  const nextBundle = updater(toBundle(configuration));
  const mergedConfiguration: ErpConfigurationJson = {
    ...configuration,
    ...nextBundle
  };

  const { tenantId: ignoredTenantId, ...request } = currentSettings;
  const updatedSettings = await updateTenantSettings(tenantId, {
    ...request,
    configurationJson: JSON.stringify(mergedConfiguration)
  });
  return {
    settings: updatedSettings,
    bundle: nextBundle
  };
}

function parseConfiguration(configurationJson?: string | null): ErpConfigurationJson {
  if (!configurationJson) return { ...defaultBundle };
  try {
    const parsed = JSON.parse(configurationJson) as ErpConfigurationJson;
    return parsed && typeof parsed === "object" ? parsed : { ...defaultBundle };
  } catch {
    return { ...defaultBundle };
  }
}

function toBundle(configuration: ErpConfigurationJson): ErpUiSettingsBundle {
  return {
    numberingSettings: normalizeArray(configuration.numberingSettings),
    printTemplates: normalizeArray(configuration.printTemplates),
    labelTemplates: normalizeArray(configuration.labelTemplates),
    approvalWorkflows: normalizeArray(configuration.approvalWorkflows)
  };
}

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
