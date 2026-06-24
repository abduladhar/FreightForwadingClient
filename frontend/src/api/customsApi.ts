import { httpClient } from "@/api/httpClient";
import type { ApiResponse, PagedResponse } from "@/api/apiResponse";

export interface CustomsClearanceSearchParams {
  pageNumber?: number;
  pageSize?: number;
  cursor?: string | null;
  search?: string;
  status?: string;
  shipmentType?: string;
  shipmentId?: string;
  declarationType?: string;
}
export interface CustomsClearanceRequest {
  shipmentId: string;
  shipmentType: string;
  declarationType: string;
  hsCode?: string | null;
  customsBrokerId?: string | null;
  declaredValue: number;
  dutyRate: number;
  taxRate: number;
  customsCharges: number;
  clearanceRemarks?: string | null;
  customerInvoiceId?: string | null;
  vendorBillId?: string | null;
}
export interface CustomsClearanceDocumentRequest {
  documentType: string;
  documentName: string;
  documentReference: string;
  isRequired: boolean;
  isReceived: boolean;
  receivedDate?: string | null;
  remarks?: string | null;
}
export interface CustomsDutyCalculationRequest {
  declaredValue: number;
  dutyRate: number;
  taxRate: number;
  customsCharges: number;
}
export interface CustomsCalculationDto {
  declaredValue: number;
  dutyRate: number;
  dutyAmount: number;
  taxRate: number;
  taxAmount: number;
  customsCharges: number;
  totalCustomsAmount: number;
}
export interface CustomsClearanceDocumentDto extends CustomsClearanceDocumentRequest { id: string }
export interface CustomsClearanceDto {
  id: string;
  customsDeclarationNumber: string;
  shipmentId: string;
  shipmentType: string;
  declarationType: string;
  hsCode?: string | null;
  customsBrokerId?: string | null;
  customsStatus: string;
  declaredValue: number;
  dutyRate: number;
  dutyAmount: number;
  taxRate: number;
  taxAmount: number;
  customsCharges: number;
  totalCustomsAmount: number;
  clearanceDate?: string | null;
  clearanceRemarks?: string | null;
  customerInvoiceId?: string | null;
  vendorBillId?: string | null;
  documents: CustomsClearanceDocumentDto[];
}

const base = "/api/customs-clearances";
export async function searchCustomsClearances(params: CustomsClearanceSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<CustomsClearanceDto>>>(base, { params });
  return response.data.data;
}
export async function getCustomsClearance(id: string) {
  const response = await httpClient.get<ApiResponse<CustomsClearanceDto>>(`${base}/${id}`);
  return response.data.data;
}
export async function createCustomsClearance(request: CustomsClearanceRequest) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceDto>>(base, request);
  return response.data.data;
}
export async function updateCustomsClearance(id: string, request: CustomsClearanceRequest) {
  const response = await httpClient.put<ApiResponse<CustomsClearanceDto>>(`${base}/${id}`, request);
  return response.data.data;
}
export async function updateCustomsStatus(id: string, status: string, remarks?: string) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceDto>>(`${base}/${id}/status`, { status, remarks: remarks ?? null });
  return response.data.data;
}
export async function cancelCustomsClearance(id: string, remarks?: string) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceDto>>(`${base}/${id}/cancel`, { status: "Cancelled", remarks: remarks ?? null });
  return response.data.data;
}
export async function addCustomsDocument(id: string, request: CustomsClearanceDocumentRequest) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceDto>>(`${base}/${id}/documents`, request);
  return response.data.data;
}
export async function updateCustomsDocument(id: string, documentId: string, request: CustomsClearanceDocumentRequest) {
  const response = await httpClient.put<ApiResponse<CustomsClearanceDto>>(`${base}/${id}/documents/${documentId}`, request);
  return response.data.data;
}
export async function deleteCustomsDocument(id: string, documentId: string) {
  const response = await httpClient.delete<ApiResponse<CustomsClearanceDto>>(`${base}/${id}/documents/${documentId}`);
  return response.data.data;
}
export async function previewCustomsDutyCalculation(request: CustomsDutyCalculationRequest) {
  const response = await httpClient.post<ApiResponse<CustomsCalculationDto>>(`${base}/duty-calculation-preview`, request);
  return response.data.data;
}
export async function applyCustomsDutyCalculation(id: string, request: CustomsDutyCalculationRequest) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceDto>>(`${base}/${id}/duty-calculation`, request);
  return response.data.data;
}

export interface CustomsJobSearchParams {
  pageNumber?: number;
  pageSize?: number;
  cursor?: string | null;
  search?: string;
  jobNumber?: string;
  declarationNumber?: string;
  declarationType?: string;
  shipmentReferenceNo?: string;
  clearanceType?: string;
  shipmentType?: string;
  modeOfTransport?: string;
  status?: string;
  customerId?: string;
  customsBrokerId?: string;
  dateFrom?: string;
  dateTo?: string;
  invoiceDefined?: boolean;
  billDefined?: boolean;
  invoiceFullyReceived?: boolean;
  billFullyPaid?: boolean;
  invoiceCancelled?: boolean;
  billCancelled?: boolean;
  unpaidInvoice?: boolean;
  unpaidBill?: boolean;
  pendingInvoicePosting?: boolean;
  pendingBillPosting?: boolean;
}

export interface CustomsDeclarationRequest {
  declarationNumber?: string | null;
  declarationType: string;
  declarationMode?: string | null;
  hsCode?: string | null;
  customsOffice?: string | null;
  declarationDate?: string | null;
  remarks?: string | null;
}

export interface CustomsClearanceJobRequest {
  clearanceType: string;
  shipmentType: string;
  shipmentId: string;
  shipmentReferenceNo?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customsBrokerId?: string | null;
  customsBrokerName?: string | null;
  modeOfTransport: string;
  originPort?: string | null;
  destinationPort?: string | null;
  incoterms?: string | null;
  expectedClearanceDate?: string | null;
  remarks?: string | null;
  declaration?: CustomsDeclarationRequest | null;
}

export interface CustomsClearanceJobDto {
  id: string;
  serialNo: number;
  customsClearanceJobGuid: string;
  jobNumber: string;
  clearanceType: string;
  shipmentType: string;
  shipmentId: string;
  shipmentReferenceNo: string;
  customerId?: string | null;
  customerName: string;
  customsBrokerId?: string | null;
  customsBrokerName: string;
  modeOfTransport: string;
  originPort: string;
  destinationPort: string;
  incoterms: string;
  status: string;
  expectedClearanceDate?: string | null;
  actualClearanceDate?: string | null;
  remarks: string;
  declaration?: CustomsDeclarationDto | null;
  parties: CustomsPartyDto[];
  invoices: CustomsInvoiceDto[];
  items: CustomsDeclarationItemDto[];
  packages: CustomsPackageDto[];
  containers: CustomsContainerDto[];
  transportDocuments: CustomsTransportDocumentDto[];
  documents: CustomsDocumentDto[];
  assessments: CustomsDutyTaxAssessmentDto[];
  payments: CustomsPaymentDto[];
  inspections: CustomsInspectionDto[];
  queries: CustomsQueryDto[];
  statusHistory: CustomsStatusHistoryDto[];
  invoiceDefined: boolean;
  billDefined: boolean;
  invoiceFullyReceived: boolean;
  billFullyPaid: boolean;
  invoiceCancelled: boolean;
  billCancelled: boolean;
  pendingInvoicePostingCount: number;
  pendingBillPostingCount: number;
  unpaidInvoiceCount: number;
  unpaidBillCount: number;
}

export interface CustomsDeclarationDto {
  id: string; serialNo: number; declarationNumber: string; declarationType: string; declarationMode: string; hsCode: string; customsOffice: string; declarationDate?: string | null; submissionReference: string; externalStatus: string; remarks: string;
}
export interface CustomsPartyDto { id: string; serialNo: number; partyType: string; partyId?: string | null; partyName: string; taxNumber: string; contactName: string; phone: string; email: string; address: string }
export interface CustomsPartyRequest {
  partyType: string;
  partyId?: string | null;
  partyName: string;
  taxNumber?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}
export interface CustomsInvoiceRequest { invoiceNumber: string; invoiceDate: string; currencyId: string; exchangeRate: number; invoiceAmount: number; freightAmount: number; insuranceAmount: number; otherChargesAmount: number }
export interface CustomsDeclarationItemRequest { lineNumber?: string | null; description: string; hsCode: string; countryOfOrigin?: string | null; quantity: number; unit?: string | null; grossWeight: number; netWeight: number; itemValue: number; dutyRate: number; taxRate: number }
export interface CustomsPackageRequest { packageType: string; pieces: number; weight: number; length: number; width: number; height: number; marksAndNumbers?: string | null }
export interface CustomsContainerRequest { containerNumber: string; sealNumber?: string | null; containerType: string; grossWeight: number; netWeight: number; volumeCbm: number }
export interface CustomsJobDocumentRequest { documentCategory: string; documentName: string; fileName?: string | null; filePath?: string | null; isRequired: boolean; isReceived: boolean; remarks?: string | null }
export interface CustomsAssessmentRequest { assessableValue: number; dutyAmount: number; taxAmount: number; penaltyAmount: number; otherChargesAmount: number; assessmentReference?: string | null; assessmentDate?: string | null }
export interface CustomsPaymentRequest {
  paymentReference: string;
  paymentDate: string;
  amount: number;
  paymentMode: string;
  paidBy?: string | null;
  remarks?: string | null;
  paymentResponsibility: "Customer" | "Company";
  paymentAccountType?: "Bank" | "Cash" | null;
  bankAccountId?: string | null;
  cashAccountId?: string | null;
  customsLedgerAccountId?: string | null;
  currencyId?: string | null;
  exchangeRate: number;
}
export interface CustomsInspectionRequest { inspectionDate: string; inspectionType: string; officerName?: string | null; result: string; remarks?: string | null }
export interface CustomsQueryRequest { queryNumber?: string | null; queryDate: string; queryText: string; responseText?: string | null; responseDate?: string | null; status?: string | null }
export type CustomsChildRequest = CustomsPartyRequest | CustomsInvoiceRequest | CustomsDeclarationItemRequest | CustomsPackageRequest | CustomsContainerRequest | CustomsJobDocumentRequest | CustomsAssessmentRequest | CustomsPaymentRequest | CustomsInspectionRequest | CustomsQueryRequest;
export type CustomsChildType = "parties" | "invoices" | "items" | "packages" | "containers" | "documents" | "assessments" | "payments" | "inspections" | "queries";
export interface CustomsInvoiceDto { id: string; serialNo: number; invoiceNumber: string; invoiceDate: string; currencyId: string; exchangeRate: number; invoiceAmount: number; freightAmount: number; insuranceAmount: number; otherChargesAmount: number; assessableValue: number }
export interface CustomsDeclarationItemDto { id: string; serialNo: number; lineNumber: string; description: string; hsCode: string; countryOfOrigin: string; quantity: number; unit: string; grossWeight: number; netWeight: number; itemValue: number; dutyRate: number; taxRate: number; dutyAmount: number; taxAmount: number }
export interface CustomsPackageDto { id: string; serialNo: number; packageType: string; pieces: number; weight: number; length: number; width: number; height: number; volumeCbm: number; marksAndNumbers: string }
export interface CustomsContainerDto { id: string; serialNo: number; containerNumber: string; sealNumber: string; containerType: string; grossWeight: number; netWeight: number; volumeCbm: number }
export interface CustomsTransportDocumentDto { id: string; serialNo: number; documentType: string; documentNumber: string; documentDate?: string | null; carrierName: string; vesselFlightTruck: string }
export interface CustomsDocumentDto { id: string; serialNo: number; documentCategory: string; documentName: string; fileName: string; filePath: string; isRequired: boolean; isReceived: boolean; uploadedDate?: string | null; remarks: string }
export interface CustomsDutyTaxAssessmentDto { id: string; serialNo: number; assessableValue: number; dutyAmount: number; taxAmount: number; penaltyAmount: number; otherChargesAmount: number; totalPayableAmount: number; assessmentReference: string; assessmentDate: string }
export interface CustomsPaymentDto {
  id: string;
  serialNo: number;
  paymentReference: string;
  paymentDate: string;
  amount: number;
  paymentMode: string;
  paidBy: string;
  paymentResponsibility: "Customer" | "Company";
  paymentAccountType: string;
  bankAccountId?: string | null;
  cashAccountId?: string | null;
  customsLedgerAccountId?: string | null;
  currencyId?: string | null;
  exchangeRate: number;
  postingStatus: "Pending" | "Posted" | "Not Applicable" | string;
  ledgerEntryId?: string | null;
  postedDate?: string | null;
  remarks: string;
}
export interface CustomsPaymentAccountOptionDto {
  id: string;
  code: string;
  name: string;
  ledgerAccountId: string;
  currencyId: string;
}
export interface CustomsLedgerAccountOptionDto {
  id: string;
  code: string;
  name: string;
  currencyId?: string | null;
}
export interface CustomsPaymentAccountOptionsDto {
  bankAccounts: CustomsPaymentAccountOptionDto[];
  cashAccounts: CustomsPaymentAccountOptionDto[];
  customsAccounts: CustomsLedgerAccountOptionDto[];
}
export interface CustomsInspectionDto { id: string; serialNo: number; inspectionDate: string; inspectionType: string; officerName: string; result: string; remarks: string }
export interface CustomsQueryDto { id: string; serialNo: number; queryNumber: string; queryDate: string; queryText: string; responseText: string; responseDate?: string | null; status: string }
export interface CustomsStatusHistoryDto { id: string; serialNo: number; fromStatus: string; toStatus: string; reason: string; remarks: string; changedDate: string; changedBy: string }

export interface CustomsDutyPreviewRequest {
  assessableValue: number;
  dutyRate: number;
  taxRate: number;
  penaltyAmount: number;
  otherChargesAmount: number;
}
export interface CustomsDutyPreviewDto extends CustomsDutyPreviewRequest {
  dutyAmount: number;
  taxAmount: number;
  totalPayableAmount: number;
}

export interface CustomsConfigurationDto {
  id: string;
  serialNo: number;
  configurationType: string;
  code: string;
  name: string;
  value: string;
  isActive: boolean;
}

const jobsBase = "/api/customs-clearance";

export async function searchCustomsJobs(params: CustomsJobSearchParams) {
  const response = await httpClient.get<ApiResponse<PagedResponse<CustomsClearanceJobDto>>>(`${jobsBase}/jobs`, { params });
  return response.data.data;
}
export async function getCustomsJob(id: string) {
  const response = await httpClient.get<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${id}`);
  return response.data.data;
}
export async function createCustomsJob(request: CustomsClearanceJobRequest) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs`, request);
  return response.data.data;
}
export async function updateCustomsJob(id: string, request: CustomsClearanceJobRequest) {
  const response = await httpClient.put<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${id}`, request);
  return response.data.data;
}
export async function updateCustomsJobStatus(id: string, status: string, reason?: string, remarks?: string) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${id}/status`, { status, reason: reason ?? null, remarks: remarks ?? null });
  return response.data.data;
}
export async function submitCustomsDeclaration(id: string) {
  const response = await httpClient.post<ApiResponse<{ provider: string; submissionReference: string; externalStatus: string; submittedDate: string }>>(`${jobsBase}/jobs/${id}/submit`);
  return response.data.data;
}
export async function previewCustomsJobDuty(request: CustomsDutyPreviewRequest) {
  const response = await httpClient.post<ApiResponse<CustomsDutyPreviewDto>>(`${jobsBase}/duty-preview`, request);
  return response.data.data;
}
export async function searchCustomsConfigurations(params: { pageNumber?: number; pageSize?: number } = {}) {
  const response = await httpClient.get<ApiResponse<PagedResponse<CustomsConfigurationDto>>>(`${jobsBase}/configuration`, { params: { pageNumber: params.pageNumber ?? 1, pageSize: params.pageSize ?? 200 } });
  return response.data.data;
}
export async function getCustomsPaymentAccountOptions() {
  const response = await httpClient.get<ApiResponse<CustomsPaymentAccountOptionsDto>>(`${jobsBase}/payment-account-options`);
  return response.data.data;
}
export async function postCustomsPayment(jobId: string, paymentId: string) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${jobId}/payments/${paymentId}/post`);
  return response.data.data;
}
export async function addCustomsJobDocument(id: string, request: { documentCategory: string; documentName: string; fileName?: string | null; filePath?: string | null; isRequired: boolean; isReceived: boolean; remarks?: string | null }) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${id}/documents`, request);
  return response.data.data;
}
export async function addCustomsJobParty(id: string, request: CustomsPartyRequest) {
  return createCustomsJobChild(id, "parties", request);
}
export async function addCustomsJobAssessment(id: string, request: { assessableValue: number; dutyAmount: number; taxAmount: number; penaltyAmount: number; otherChargesAmount: number; assessmentReference?: string | null; assessmentDate?: string | null }) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${id}/assessments`, request);
  return response.data.data;
}
export async function deleteCustomsJobChild(id: string, childType: string, childId: string) {
  const response = await httpClient.delete<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${id}/${childType}/${childId}`);
  return response.data.data;
}
export async function createCustomsJobChild(id: string, childType: CustomsChildType, request: CustomsChildRequest) {
  const response = await httpClient.post<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${id}/${childType}`, request);
  return response.data.data;
}
export async function updateCustomsJobChild(id: string, childType: CustomsChildType, childId: string, request: CustomsChildRequest) {
  const response = await httpClient.put<ApiResponse<CustomsClearanceJobDto>>(`${jobsBase}/jobs/${id}/${childType}/${childId}`, request);
  return response.data.data;
}
