import { httpClient } from "@/api/httpClient";
import type { ApiResponse } from "@/api/apiResponse";

const customerBase = "/api/customer-portal";
const agentBase = "/api/agent-portal";

export interface CustomerPortalDashboardDto {
  totalQuotations: number;
  pendingQuotations: number;
  activeShipments: number;
  pendingInvoices: number;
  outstandingAmount: number;
  pendingPickups: number;
}

export interface CustomerPortalQuotationDto {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  validUntilDate: string;
  status: string;
  origin: string;
  destination: string;
  modeOfTransport: string;
  shipmentType: string;
  currencyId: string;
  totalAmount: number;
}

export interface PortalActionRequest {
  reason?: string | null;
}

export interface CustomerShipmentRequestDto {
  shipmentType: string;
  quotationId?: string | null;
  origin: string;
  destination: string;
  modeOfTransport: string;
  remarks?: string | null;
}

export interface CustomerPickupItemRequest {
  description: string;
  pieces: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  packageType?: string | null;
  marksAndNumbers?: string | null;
}

export interface CustomerPickupRequestDto {
  customerLocation: string;
  contactPerson: string;
  contactPhone: string;
  pickupDateTime: string;
  items: CustomerPickupItemRequest[];
}

export interface CustomerPickupResponse {
  pickupId: string;
  pickupNumber: string;
  status: string;
}

export interface ShipmentTrackingDto {
  shipmentId: string;
  shipmentType: string;
  shipmentNumber: string;
  status: string;
  origin: string;
  destination: string;
  etd?: string | null;
  eta?: string | null;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  documentReference?: string | null;
}

export interface PortalDocumentRequest {
  shipmentType: string;
  shipmentId: string;
  documentReference: string;
  documentType?: string | null;
}

export interface CustomerInvoicePortalDto {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  currencyId: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export interface CustomerStatementRowDto {
  date: string;
  documentType: string;
  documentNumber: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  currencyId: string;
}

export interface CustomerPaymentHistoryDto {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  status: string;
  currencyId: string;
  receiptAmount: number;
  bankCharges: number;
}

export interface PortalDownloadDto {
  fileName: string;
  contentType: string;
  content: string;
}

export async function getCustomerPortalDashboard() {
  const response = await httpClient.get<ApiResponse<CustomerPortalDashboardDto>>(`${customerBase}/dashboard`);
  return response.data.data;
}

export async function getCustomerPortalQuotations() {
  const response = await httpClient.get<ApiResponse<CustomerPortalQuotationDto[]>>(`${customerBase}/quotations`);
  return response.data.data ?? [];
}

export async function approveCustomerPortalQuotation(quotationId: string, request: PortalActionRequest) {
  const response = await httpClient.post<ApiResponse<CustomerPortalQuotationDto>>(`${customerBase}/quotations/${quotationId}/approve`, request);
  return response.data.data;
}

export async function rejectCustomerPortalQuotation(quotationId: string, request: PortalActionRequest) {
  const response = await httpClient.post<ApiResponse<CustomerPortalQuotationDto>>(`${customerBase}/quotations/${quotationId}/reject`, request);
  return response.data.data;
}

export async function createCustomerPortalShipmentRequest(request: CustomerShipmentRequestDto) {
  const response = await httpClient.post<ApiResponse<ShipmentTrackingDto>>(`${customerBase}/shipment-requests`, request);
  return response.data.data;
}

export async function createCustomerPortalPickupRequest(request: CustomerPickupRequestDto) {
  const response = await httpClient.post<ApiResponse<CustomerPickupResponse>>(`${customerBase}/pickups`, request);
  return response.data.data;
}

export async function getCustomerPortalShipmentTracking() {
  const response = await httpClient.get<ApiResponse<ShipmentTrackingDto[]>>(`${customerBase}/shipments/tracking`);
  return response.data.data ?? [];
}

export async function getCustomerPortalShipmentTrackingById(shipmentType: string, shipmentId: string) {
  const response = await httpClient.get<ApiResponse<ShipmentTrackingDto>>(`${customerBase}/shipments/${shipmentType}/${shipmentId}/tracking`);
  return response.data.data;
}

export async function uploadCustomerPortalDocument(request: PortalDocumentRequest) {
  const response = await httpClient.post<ApiResponse<{ uploaded: boolean }>>(`${customerBase}/documents`, request);
  return response.data.data;
}

export async function getCustomerPortalInvoices() {
  const response = await httpClient.get<ApiResponse<CustomerInvoicePortalDto[]>>(`${customerBase}/invoices`);
  return response.data.data ?? [];
}

export async function downloadCustomerPortalInvoice(invoiceId: string) {
  const response = await httpClient.get<ApiResponse<PortalDownloadDto>>(`${customerBase}/invoices/${invoiceId}/download`);
  return response.data.data;
}

export async function getCustomerPortalStatementOfAccount() {
  const response = await httpClient.get<ApiResponse<CustomerStatementRowDto[]>>(`${customerBase}/statement-of-account`);
  return response.data.data ?? [];
}

export async function downloadCustomerPortalStatementOfAccount() {
  const response = await httpClient.get<ApiResponse<PortalDownloadDto>>(`${customerBase}/statement-of-account/download`);
  return response.data.data;
}

export async function getCustomerPortalOutstanding() {
  const response = await httpClient.get<ApiResponse<CustomerInvoicePortalDto[]>>(`${customerBase}/outstanding`);
  return response.data.data ?? [];
}

export async function getCustomerPortalPaymentHistory() {
  const response = await httpClient.get<ApiResponse<CustomerPaymentHistoryDto[]>>(`${customerBase}/payment-history`);
  return response.data.data ?? [];
}

export interface AgentPortalDashboardDto {
  assignedShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  pendingPod: number;
  commissionAmount: number;
  destinationCharges: number;
}

export interface AgentAssignedShipmentDto {
  shipmentId: string;
  shipmentType: string;
  shipmentNumber: string;
  status: string;
  origin: string;
  destination: string;
  etd?: string | null;
  eta?: string | null;
  documentReference?: string | null;
}

export interface AgentStatusUpdateRequest {
  shipmentType: string;
  shipmentId: string;
  status: string;
  remarks?: string | null;
}

export interface AgentPodUploadRequest {
  shipmentType: string;
  shipmentId: string;
  proofOfDeliveryDocumentId?: string | null;
  documentReference?: string | null;
}

export interface AgentDestinationChargeRequest {
  shipmentType: string;
  shipmentId: string;
  chargeName: string;
  amount: number;
  currencyId: string;
  remarks?: string | null;
}

export interface AgentDestinationChargeDto {
  id: string;
  shipmentType: string;
  shipmentId: string;
  chargeName: string;
  amount: number;
  currencyId: string;
  status: string;
}

export interface AgentCommissionStatementRow {
  sourceId: string;
  sourceType: string;
  date: string;
  description: string;
  currencyId: string;
  commissionAmount: number;
  status: string;
}

export async function getAgentPortalDashboard() {
  const response = await httpClient.get<ApiResponse<AgentPortalDashboardDto>>(`${agentBase}/dashboard`);
  return response.data.data;
}

export async function getAgentPortalAssignedShipments() {
  const response = await httpClient.get<ApiResponse<AgentAssignedShipmentDto[]>>(`${agentBase}/assigned-shipments`);
  return response.data.data ?? [];
}

export async function updateAgentPortalShipmentStatus(request: AgentStatusUpdateRequest) {
  const response = await httpClient.post<ApiResponse<AgentAssignedShipmentDto>>(`${agentBase}/shipments/status`, request);
  return response.data.data;
}

export async function uploadAgentPortalPod(request: AgentPodUploadRequest) {
  const response = await httpClient.post<ApiResponse<{ uploaded: boolean }>>(`${agentBase}/shipments/pod`, request);
  return response.data.data;
}

export async function createAgentPortalDestinationCharge(request: AgentDestinationChargeRequest) {
  const response = await httpClient.post<ApiResponse<AgentDestinationChargeDto>>(`${agentBase}/destination-charges`, request);
  return response.data.data;
}

export async function getAgentPortalCommissionStatement() {
  const response = await httpClient.get<ApiResponse<AgentCommissionStatementRow[]>>(`${agentBase}/commission-statement`);
  return response.data.data ?? [];
}

export async function downloadAgentPortalDocument(shipmentType: string, shipmentId: string) {
  const response = await httpClient.get<ApiResponse<PortalDownloadDto>>(`${agentBase}/documents/${shipmentType}/${shipmentId}/download`);
  return response.data.data;
}

export function downloadPortalFile(file: PortalDownloadDto) {
  const contentType = file.contentType || "application/octet-stream";
  const blob = createDownloadBlob(file.content, contentType);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.fileName || "download.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function createDownloadBlob(content: string, contentType: string) {
  const normalized = content.trim();
  if (looksLikeBase64(normalized)) {
    try {
      const binary = atob(normalized);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      return new Blob([bytes], { type: contentType });
    } catch {
      // Fallback to plain text blob when decoding fails.
    }
  }

  return new Blob([content], { type: contentType || "text/plain" });
}

function looksLikeBase64(value: string) {
  if (!value || value.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}
