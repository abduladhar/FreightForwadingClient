export interface Branch {
  branchId: string;
  tenantId: string;
  branchCode: string;
  branchName: string;
  address?: string | null;
  contactPerson?: string | null;
  email: string;
  phone?: string | null;
  country: string;
  city: string;
  defaultWarehouseId?: string | null;
  isActive: boolean;
}

export interface BranchOption {
  id: string;
  code: string;
  name: string;
}

export interface BranchUpsertRequest {
  branchCode: string;
  branchName: string;
  address?: string | null;
  contactPerson?: string | null;
  email: string;
  phone?: string | null;
  country: string;
  city: string;
  defaultWarehouseId?: string | null;
  isActive: boolean;
}

export interface BranchSettings {
  branchId: string;
  tenantId: string;
  localTimeZone?: string | null;
  workingDays?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  openAiApiKey?: string | null;
  openAiSelectedModel?: string | null;
  openAiModelsJson?: string | null;
  openAiIsEnabled: boolean;
  openAiExtractionTimeoutSeconds?: number | null;
  openAiMaxDocumentSizeBytes?: number | null;
  openAiS3Prefix?: string | null;
  configurationJson?: string | null;
}

export type BranchSettingsUpdateRequest = Omit<BranchSettings, "branchId" | "tenantId">;
